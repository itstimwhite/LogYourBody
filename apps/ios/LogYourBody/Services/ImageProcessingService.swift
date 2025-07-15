//
// ImageProcessingService.swift
// LogYourBody
//
import UIKit
import Vision
import CoreImage
import Combine

@MainActor
class ImageProcessingService: ObservableObject {
    static let shared = ImageProcessingService()
    
    @Published var processingTasks: [ProcessingTask] = []
    @Published var activeProcessingCount: Int = 0
    
    private let processingQueue = DispatchQueue(label: "com.logyourbody.imageprocessing", qos: .userInitiated, attributes: .concurrent)
    private let ciContext = CIContext(options: [.useSoftwareRenderer: false])
    
    struct ProcessingTask: Identifiable {
        let id = UUID()
        let imageId: String
        var status: ProcessingStatus = .pending
        var progress: Double = 0
        var error: Error?
        var resultImage: UIImage?
        var thumbnailImage: UIImage?
    }
    
    enum ProcessingStatus {
        case pending
        case detecting
        case cropping
        case removingBackground
        case finalizing
        case completed
        case failed
    }
    
    // MARK: - Public Methods
    
    func processImage(_ image: UIImage, imageId: String) async throws -> ProcessedImageResult {
        // Create and track task
        let task = ProcessingTask(imageId: imageId, status: .pending)
        await MainActor.run {
            processingTasks.append(task)
            activeProcessingCount += 1
        }
        
        // Show processing notification
        await showProcessingNotification(for: imageId)
        
        do {
            // Process on background queue
            let result = try await withCheckedThrowingContinuation { continuation in
                processingQueue.async { [weak self] in
                    guard let self = self else { return }
                    
                    Task { @MainActor in
                        do {
                            let processedResult = try self.performImageProcessing(image, taskId: task.id)
                            continuation.resume(returning: processedResult)
                        } catch {
                            continuation.resume(throwing: error)
                        }
                    }
                }
            }
            
            // Update task status
            await updateTaskStatus(task.id, status: .completed, result: result.finalImage)
            
            return result
        } catch {
            await updateTaskStatus(task.id, status: .failed, error: error)
            throw error
        }
    }
    
    func processBatchImages(_ images: [(image: UIImage, id: String)]) async {
        // Process images concurrently
        await withTaskGroup(of: Void.self) { group in
            for (image, id) in images {
                group.addTask { [weak self] in
                    do {
                        _ = try await self?.processImage(image, imageId: id)
                    } catch {
                        // print("Failed to process image \(id): \(error)")
                    }
                }
            }
        }
    }
    
    // MARK: - Private Processing Methods
    
    private func performImageProcessing(_ image: UIImage, taskId: UUID) throws -> ProcessedImageResult {
        guard let cgImage = image.cgImage else {
            throw ProcessingError.invalidImage
        }
        
        // Step 1: Detect human bounding box
        updateTaskProgress(taskId, status: .detecting, progress: 0.2)
        let boundingBox = try detectHumanBoundingBox(in: cgImage)
        
        // Step 2: Crop to bounding box
        updateTaskProgress(taskId, status: .cropping, progress: 0.4)
        let croppedImage = try cropToHuman(cgImage: cgImage, boundingBox: boundingBox)
        
        // Step 3: Apply aspect fill to target size
        let targetSize = CGSize(width: 600, height: 800) // Standard portrait size
        let aspectFilledImage = try aspectFillToSize(croppedImage, targetSize: targetSize)
        
        // Step 4: Remove background
        updateTaskProgress(taskId, status: .removingBackground, progress: 0.6)
        let backgroundRemovedImage = try removeBackground(from: aspectFilledImage)
        
        // Step 5: Create thumbnail
        updateTaskProgress(taskId, status: .finalizing, progress: 0.8)
        let thumbnailImage = try createThumbnail(from: backgroundRemovedImage, size: CGSize(width: 150, height: 200))
        
        // Step 6: Fix orientation
        let finalImage = backgroundRemovedImage.fixedOrientation()
        let finalThumbnail = thumbnailImage.fixedOrientation()
        
        updateTaskProgress(taskId, status: .completed, progress: 1.0)
        
        return ProcessedImageResult(
            originalImage: image,
            finalImage: finalImage,
            thumbnailImage: finalThumbnail,
            boundingBox: boundingBox
        )
    }
    
    private func detectHumanBoundingBox(in cgImage: CGImage) throws -> CGRect {
        var detectedBox: CGRect?
        
        let request = VNDetectHumanRectanglesRequest { request, error in
            if let error = error {
                // print("Human detection error: \(error)")
                return
            }
            
            guard let observations = request.results as? [VNHumanObservation],
                  let firstHuman = observations.first else {
                return
            }
            
            detectedBox = firstHuman.boundingBox
        }
        
        // Try human rectangles first
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        try handler.perform([request])
        
        // If no human detected, try body pose
        if detectedBox == nil {
            detectedBox = try detectBodyPoseBoundingBox(in: cgImage)
        }
        
        // If still no detection, try face rectangles and expand
        if detectedBox == nil {
            detectedBox = try detectFaceAndExpandBoundingBox(in: cgImage)
        }
        
        guard let box = detectedBox else {
            throw ProcessingError.noHumanDetected
        }
        
        // Add some padding to the bounding box
        let padding: CGFloat = 0.1
        let paddedBox = CGRect(
            x: max(0, box.origin.x - box.width * padding),
            y: max(0, box.origin.y - box.height * padding),
            width: min(1.0 - box.origin.x + box.width * padding, box.width * (1 + 2 * padding)),
            height: min(1.0 - box.origin.y + box.height * padding, box.height * (1 + 2 * padding))
        )
        
        return paddedBox
    }
    
    private func detectBodyPoseBoundingBox(in cgImage: CGImage) throws -> CGRect? {
        var detectedBox: CGRect?
        
        let request = VNDetectHumanBodyPoseRequest { request, _ in
            guard let observations = request.results as? [VNHumanBodyPoseObservation],
                  let pose = observations.first else {
                return
            }
            
            // Get all recognized points
            let recognizedPoints = try? pose.recognizedPoints(.all)
            guard let points = recognizedPoints, !points.isEmpty else { return }
            
            // Find bounding box from all detected points
            var minX: CGFloat = 1.0
            var minY: CGFloat = 1.0
            var maxX: CGFloat = 0.0
            var maxY: CGFloat = 0.0
            
            for (_, point) in points where point.confidence > 0.3 {
                minX = min(minX, point.location.x)
                minY = min(minY, point.location.y)
                maxX = max(maxX, point.location.x)
                maxY = max(maxY, point.location.y)
            }
            
            if maxX > minX && maxY > minY {
                detectedBox = CGRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
            }
        }
        
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        try handler.perform([request])
        
        return detectedBox
    }
    
    private func detectFaceAndExpandBoundingBox(in cgImage: CGImage) throws -> CGRect? {
        var detectedBox: CGRect?
        
        let request = VNDetectFaceRectanglesRequest { request, _ in
            guard let observations = request.results as? [VNFaceObservation],
                  let face = observations.first else {
                return
            }
            
            // Expand face box to approximate full body
            let faceBox = face.boundingBox
            let expandedHeight = faceBox.height * 8 // Approximate body height
            let expandedWidth = faceBox.width * 3 // Approximate body width
            
            detectedBox = CGRect(
                x: faceBox.midX - expandedWidth / 2,
                y: faceBox.maxY - expandedHeight,
                width: expandedWidth,
                height: expandedHeight
            )
        }
        
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        try handler.perform([request])
        
        return detectedBox
    }
    
    private func cropToHuman(cgImage: CGImage, boundingBox: CGRect) throws -> UIImage {
        // Convert normalized coordinates to pixel coordinates
        let width = CGFloat(cgImage.width)
        let height = CGFloat(cgImage.height)
        
        let pixelRect = CGRect(
            x: boundingBox.origin.x * width,
            y: (1 - boundingBox.maxY) * height, // Flip Y coordinate
            width: boundingBox.width * width,
            height: boundingBox.height * height
        )
        
        guard let croppedCGImage = cgImage.cropping(to: pixelRect) else {
            throw ProcessingError.cropFailed
        }
        
        return UIImage(cgImage: croppedCGImage)
    }
    
    private func aspectFillToSize(_ image: UIImage, targetSize: CGSize) throws -> UIImage {
        guard let cgImage = image.cgImage else {
            throw ProcessingError.invalidImage
        }
        
        let sourceWidth = CGFloat(cgImage.width)
        let sourceHeight = CGFloat(cgImage.height)
        
        // Calculate scale to fill target
        let scale = max(targetSize.width / sourceWidth, targetSize.height / sourceHeight)
        
        // Calculate scaled size
        let scaledWidth = sourceWidth * scale
        let scaledHeight = sourceHeight * scale
        
        // Calculate offset to center
        let offsetX = (scaledWidth - targetSize.width) / 2
        let offsetY = (scaledHeight - targetSize.height) / 2
        
        // Create transform
        var transform = CGAffineTransform.identity
        transform = transform.scaledBy(x: scale, y: scale)
        transform = transform.translatedBy(x: -offsetX / scale, y: -offsetY / scale)
        
        // Apply transform using Core Image
        let ciImage = CIImage(cgImage: cgImage)
        
        let transformedImage = ciImage.transformed(by: transform)
        let cropRect = CGRect(origin: .zero, size: targetSize)
        let croppedImage = transformedImage.cropped(to: cropRect)
        
        guard let outputCGImage = ciContext.createCGImage(croppedImage, from: cropRect) else {
            throw ProcessingError.processingFailed
        }
        
        return UIImage(cgImage: outputCGImage)
    }
    
    private func removeBackground(from image: UIImage) throws -> UIImage {
        // Use existing BackgroundRemovalService
        return try BackgroundRemovalService.shared.removeBackgroundSync(from: image)
    }
    
    private func createThumbnail(from image: UIImage, size: CGSize) throws -> UIImage {
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1.0
        format.opaque = false
        
        let renderer = UIGraphicsImageRenderer(size: size, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }
    
    // MARK: - Task Management
    
    private func updateTaskProgress(_ taskId: UUID, status: ProcessingStatus, progress: Double) {
        Task { @MainActor in
            if let index = processingTasks.firstIndex(where: { $0.id == taskId }) {
                processingTasks[index].status = status
                processingTasks[index].progress = progress
            }
        }
    }
    
    private func updateTaskStatus(_ taskId: UUID, status: ProcessingStatus, result: UIImage? = nil, error: Error? = nil) async {
        await MainActor.run {
            if let index = processingTasks.firstIndex(where: { $0.id == taskId }) {
                processingTasks[index].status = status
                processingTasks[index].resultImage = result
                processingTasks[index].error = error
                
                if status == .completed || status == .failed {
                    activeProcessingCount = max(0, activeProcessingCount - 1)
                    
                    // Remove completed tasks after delay
                    Task {
                        try? await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
                        if let idx = processingTasks.firstIndex(where: { $0.id == taskId }) {
                            processingTasks.remove(at: idx)
                        }
                    }
                }
            }
        }
    }
    
    private func showProcessingNotification(for imageId: String) async {
        // Processing notifications handled by UI layer
    }
}

// MARK: - Supporting Types

struct ProcessedImageResult {
    let originalImage: UIImage
    let finalImage: UIImage
    let thumbnailImage: UIImage
    let boundingBox: CGRect
}

enum ProcessingError: LocalizedError {
    case invalidImage
    case noHumanDetected
    case cropFailed
    case processingFailed
    
    var errorDescription: String? {
        switch self {
        case .invalidImage:
            return "Invalid image format"
        case .noHumanDetected:
            return "No person detected in image"
        case .cropFailed:
            return "Failed to crop image"
        case .processingFailed:
            return "Image processing failed"
        }
    }
}

// MARK: - BackgroundRemovalService Extension

extension BackgroundRemovalService {
    func removeBackgroundSync(from image: UIImage) throws -> UIImage {
        // Synchronous wrapper for background removal
        let semaphore = DispatchSemaphore(value: 0)
        var result: Result<UIImage, Error>?
        
        Task {
            do {
                let processed = try await removeBackground(from: image)
                result = .success(processed)
            } catch {
                result = .failure(error)
            }
            semaphore.signal()
        }
        
        semaphore.wait()
        
        switch result {
        case .success(let image):
            return image
        case .failure(let error):
            throw error
        case .none:
            throw ProcessingError.processingFailed
        }
    }
}
