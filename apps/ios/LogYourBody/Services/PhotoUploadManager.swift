//
//  PhotoUploadManager.swift
//  LogYourBody
//
//  Created by Assistant on 7/6/25.
//

import Foundation
import UIKit
import PhotosUI
import Combine

@MainActor
class PhotoUploadManager: ObservableObject {
    static let shared = PhotoUploadManager()
    
    @Published var isUploading = false
    @Published var uploadProgress: Double = 0.0
    @Published var uploadError: String?
    @Published var currentUploadTask: UploadTask?
    
    private let authManager = AuthManager.shared
    private let supabaseManager = SupabaseManager.shared
    private let coreDataManager = CoreDataManager.shared
    private var uploadCancellables = Set<AnyCancellable>()
    
    struct UploadTask {
        let id: String
        let metricsId: String
        let status: UploadStatus
        let progress: Double
        let error: String?
    }
    
    enum UploadStatus {
        case preparing
        case uploading
        case processing
        case completed
        case failed
    }
    
    enum PhotoError: LocalizedError {
        case notAuthenticated
        case imageConversionFailed
        case uploadFailed(String)
        case processingFailed(String)
        case networkError
        
        var errorDescription: String? {
            switch self {
            case .notAuthenticated:
                return "Please log in to upload photos"
            case .imageConversionFailed:
                return "Failed to process the image"
            case .uploadFailed(let message):
                return "Upload failed: \(message)"
            case .processingFailed(let message):
                return "Processing failed: \(message)"
            case .networkError:
                return "Network connection error"
            }
        }
    }
    
    private init() {}
    
    // MARK: - Public Methods
    
    func uploadProgressPhoto(for metrics: BodyMetrics, image: UIImage) async throws -> String {
        guard let userId = authManager.currentUser?.id else {
            print("❌ PhotoUploadManager: No authenticated user")
            throw PhotoError.notAuthenticated
        }
        
        print("📸 PhotoUploadManager: Starting upload for metrics \(metrics.id)")
        print("📸 PhotoUploadManager: Current user ID: \(userId)")
        let userEmail = authManager.currentUser?.email ?? "nil"
        print("📸 PhotoUploadManager: Current user email: \(userEmail)")
        
        self.isUploading = true
        self.uploadProgress = 0.0
        self.uploadError = nil
        
        let uploadId = UUID().uuidString
        self.currentUploadTask = UploadTask(
            id: uploadId,
            metricsId: metrics.id,
            status: .preparing,
            progress: 0.0,
            error: nil
        )
        
        defer {
            self.isUploading = false
            self.currentUploadTask = nil
        }
        
        do {
            // Step 1: Remove background on device
            updateUploadStatus(.preparing, progress: 0.1)
            print("📸 PhotoUploadManager: Removing background on device")
            
            let processedImage = try await BackgroundRemovalService.shared.removeBackground(from: image)
            print("✅ PhotoUploadManager: Background removed successfully")
            
            // Step 2: Prepare image for upload (PNG to preserve transparency)
            updateUploadStatus(.preparing, progress: 0.2)
            print("📸 PhotoUploadManager: Preparing image for upload")
            guard let imageData = BackgroundRemovalService.shared.prepareForUpload(processedImage) else {
                print("❌ PhotoUploadManager: Failed to prepare image")
                throw PhotoError.imageConversionFailed
            }
            print("✅ PhotoUploadManager: Image prepared, size: \(imageData.count) bytes")
            
            // Step 3: Upload to Supabase Storage
            updateUploadStatus(.uploading, progress: 0.3)
            let fileName = "\(userId)/\(metrics.id)_\(Date().timeIntervalSince1970).png"
            print("📸 PhotoUploadManager: Uploading to Supabase Storage with fileName: \(fileName)")
            let originalUrl = try await uploadToSupabase(imageData: imageData, fileName: fileName)
            print("✅ PhotoUploadManager: Upload complete, URL: \(originalUrl)")
            
            updateUploadStatus(.uploading, progress: 0.5)
            
            // Step 4: Trigger Cloudinary optimization via edge function
            updateUploadStatus(.processing, progress: 0.6)
            print("📸 PhotoUploadManager: Calling edge function for Cloudinary optimization")
            let processedUrl = try await processImageWithCloudinary(
                originalUrl: originalUrl,
                metricsId: metrics.id
            )
            print("✅ PhotoUploadManager: Processing complete, URL: \(processedUrl)")
            
            updateUploadStatus(.processing, progress: 0.8)
            
            // Step 4: Update local and remote records
            try await updateMetricsWithPhoto(
                metricsId: metrics.id,
                originalUrl: originalUrl,
                processedUrl: processedUrl
            )
            
            updateUploadStatus(.completed, progress: 1.0)
            
            return processedUrl
            
        } catch {
            self.uploadError = error.localizedDescription
            self.currentUploadTask = UploadTask(
                id: uploadId,
                metricsId: metrics.id,
                status: .failed,
                progress: self.uploadProgress,
                error: error.localizedDescription
            )
            throw error
        }
    }
    
    // MARK: - Private Methods
    
    private func prepareImageForUpload(_ image: UIImage) -> Data? {
        // Resize image if needed to max 2048px on longest side
        let maxDimension: CGFloat = 2048
        let size = image.size
        
        var targetSize = size
        if size.width > maxDimension || size.height > maxDimension {
            let scale = min(maxDimension / size.width, maxDimension / size.height)
            targetSize = CGSize(width: size.width * scale, height: size.height * scale)
        }
        
        // Use newer rendering API that supports wide color gamut
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1.0
        // Support wide color gamut for newer iPhones
        if #available(iOS 12.0, *) {
            format.preferredRange = .extended
        }
        
        let renderer = UIGraphicsImageRenderer(size: targetSize, format: format)
        let resizedImage = renderer.image { context in
            image.draw(in: CGRect(origin: .zero, size: targetSize))
        }
        
        // Convert to JPEG with 85% quality
        return resizedImage.jpegData(compressionQuality: 0.85)
    }
    
    // Support for HEIC/HEIF format conversion
    func uploadProgressPhoto(for metrics: BodyMetrics, imageData: Data) async throws -> String {
        guard let userId = authManager.currentUser?.id else {
            throw PhotoError.notAuthenticated
        }
        
        self.isUploading = true
        self.uploadProgress = 0.0
        self.uploadError = nil
        
        let uploadId = UUID().uuidString
        self.currentUploadTask = UploadTask(
            id: uploadId,
            metricsId: metrics.id,
            status: .preparing,
            progress: 0.0,
            error: nil
        )
        
        defer {
            self.isUploading = false
            self.currentUploadTask = nil
        }
        
        do {
            // Step 1: Convert HEIC/HEIF to UIImage if needed
            updateUploadStatus(.preparing, progress: 0.1)
            
            var finalImageData = imageData
            
            // Check if it's HEIC/HEIF format
            if let source = CGImageSourceCreateWithData(imageData as CFData, nil),
               let uti = CGImageSourceGetType(source) {
                let heicTypes = ["public.heic", "public.heif"]
                if heicTypes.contains(uti as String) {
                    // Convert HEIC to UIImage then to JPEG
                    if let image = UIImage(data: imageData),
                       let jpegData = prepareImageForUpload(image) {
                        finalImageData = jpegData
                    } else {
                        throw PhotoError.imageConversionFailed
                    }
                }
            } else if let image = UIImage(data: imageData),
                      let preparedData = prepareImageForUpload(image) {
                // For other formats, process through UIImage
                finalImageData = preparedData
            }
            
            // Step 2: Upload to Supabase Storage
            updateUploadStatus(.uploading, progress: 0.2)
            let fileName = "\(userId)/\(metrics.id)_\(Date().timeIntervalSince1970).jpg"
            let originalUrl = try await uploadToSupabase(imageData: finalImageData, fileName: fileName)
            
            updateUploadStatus(.uploading, progress: 0.5)
            
            // Step 4: Trigger Cloudinary optimization via edge function
            updateUploadStatus(.processing, progress: 0.6)
            print("📸 PhotoUploadManager: Calling edge function for Cloudinary optimization")
            let processedUrl = try await processImageWithCloudinary(
                originalUrl: originalUrl,
                metricsId: metrics.id
            )
            print("✅ PhotoUploadManager: Processing complete, URL: \(processedUrl)")
            
            updateUploadStatus(.processing, progress: 0.8)
            
            // Step 4: Update local and remote records
            try await updateMetricsWithPhoto(
                metricsId: metrics.id,
                originalUrl: originalUrl,
                processedUrl: processedUrl
            )
            
            updateUploadStatus(.completed, progress: 1.0)
            
            return processedUrl
            
        } catch {
            self.uploadError = error.localizedDescription
            self.currentUploadTask = UploadTask(
                id: uploadId,
                metricsId: metrics.id,
                status: .failed,
                progress: self.uploadProgress,
                error: error.localizedDescription
            )
            throw error
        }
    }
    
    private func uploadToSupabase(imageData: Data, fileName: String) async throws -> String {
        guard let session = authManager.clerkSession else {
            print("❌ PhotoUploadManager: No Clerk session for storage upload")
            throw PhotoError.notAuthenticated
        }
        
        let tokenResource = try await session.getToken()
        guard let token = tokenResource?.jwt else {
            print("❌ PhotoUploadManager: Failed to get JWT for storage upload")
            throw PhotoError.notAuthenticated
        }
        
        print("📸 PhotoUploadManager: Got JWT token for storage upload")
        
        let url = URL(string: "\(Constants.supabaseURL)/storage/v1/object/photos/\(fileName)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(Constants.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("image/png", forHTTPHeaderField: "Content-Type")
        request.httpBody = imageData
        
        // Configure URLSession with longer timeout for photo uploads
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 60.0 // 60 seconds
        configuration.timeoutIntervalForResource = 120.0 // 2 minutes
        let uploadSession = URLSession(configuration: configuration)
        
        let (data, response) = try await uploadSession.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ PhotoUploadManager: Invalid response type")
            throw PhotoError.uploadFailed("Invalid response")
        }
        
        print("📸 PhotoUploadManager: Storage upload response: \(httpResponse.statusCode)")
        
        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            print("❌ PhotoUploadManager: Storage upload failed: \(errorMessage)")
            throw PhotoError.uploadFailed(errorMessage)
        }
        
        // Return the public URL for the uploaded image
        return "\(Constants.supabaseURL)/storage/v1/object/public/photos/\(fileName)"
    }
    
    private func processImageWithCloudinary(originalUrl: String, metricsId: String) async throws -> String {
        // Edge functions can be called with just the anon key
        print("📸 PhotoUploadManager: Calling edge function with anon key")
        
        let url = URL(string: "\(Constants.supabaseURL)/functions/v1/process-progress-photo")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(Constants.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(Constants.supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "originalUrl": originalUrl,
            "metricsId": metricsId
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ PhotoUploadManager: Invalid edge function response")
            throw PhotoError.processingFailed("Invalid response")
        }
        
        print("📸 PhotoUploadManager: Edge function response: \(httpResponse.statusCode)")
        
        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            print("❌ PhotoUploadManager: Edge function failed: \(errorMessage)")
            throw PhotoError.processingFailed(errorMessage)
        }
        
        guard let result = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let processedUrl = result["processedUrl"] as? String else {
            let responseString = String(data: data, encoding: .utf8) ?? "No response data"
            print("❌ PhotoUploadManager: Invalid edge function response format: \(responseString)")
            throw PhotoError.processingFailed("Invalid response format")
        }
        
        return processedUrl
    }
    
    private func updateMetricsWithPhoto(metricsId: String, originalUrl: String, processedUrl: String) async throws {
        // Update local CoreData
        guard let userId = authManager.currentUser?.id else { return }
        if let cachedMetrics = coreDataManager.fetchBodyMetrics(for: userId)
            .first(where: { $0.id == metricsId }) {
            cachedMetrics.photoUrl = processedUrl
            cachedMetrics.originalPhotoUrl = originalUrl
            cachedMetrics.lastModified = Date()
            cachedMetrics.isSynced = false
            coreDataManager.save()
        }
        
        // Trigger sync to update remote
        SyncManager.shared.syncIfNeeded()
    }
    
    private func updateUploadStatus(_ status: UploadStatus, progress: Double) {
        self.uploadProgress = progress
        if let task = self.currentUploadTask {
            self.currentUploadTask = UploadTask(
                id: task.id,
                metricsId: task.metricsId,
                status: status,
                progress: progress,
                error: nil
            )
        }
    }
}