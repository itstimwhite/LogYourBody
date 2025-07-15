//
//  ProgressPhotoCarouselView.swift
//  LogYourBody
//
//  Created by Assistant on 7/11/25.
//  Fixed-ratio photo carousel with face-centered cropping
//

import SwiftUI
import Vision

// MARK: - Temporary Glass Card (until UIComponents.swift is added to project)
struct ProgressPhotoGlassCard<Content: View>: View {
    let content: Content
    var cornerRadius: CGFloat = 16
    var padding: CGFloat = 16
    
    init(cornerRadius: CGFloat = 16, padding: CGFloat = 16, @ViewBuilder content: () -> Content) {
        self.cornerRadius = cornerRadius
        self.padding = padding
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(padding)
            .background(
                Group {
                    if #available(iOS 18.0, *) {
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: cornerRadius)
                                    .fill(Color.white.opacity(0.05))
                            )
                    } else {
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .fill(Color.appCard)
                    }
                }
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(Color.appBorder, lineWidth: 1)
            )
    }
}

struct ProgressPhotoCarouselView: View {
    let currentMetric: BodyMetrics?
    let historicalMetrics: [BodyMetrics]
    @Binding var selectedMetricsIndex: Int
    @State private var selectedPhotoIndex: Int = 0
    @State private var isDragging = false
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var processingService = ImageProcessingService.shared
    
    // Computed properties
    private var displayMetrics: [BodyMetrics] {
        historicalMetrics.filter { $0.photoUrl != nil }
    }
    
    // Map photo index to metrics index
    private func metricsIndex(for photoIndex: Int) -> Int? {
        guard photoIndex < displayMetrics.count else { return nil }
        let photoMetric = displayMetrics[photoIndex]
        return historicalMetrics.firstIndex { $0.id == photoMetric.id }
    }
    
    // Map metrics index to photo index
    private func photoIndex(for metricsIndex: Int) -> Int? {
        guard metricsIndex < historicalMetrics.count else { return nil }
        let metric = historicalMetrics[metricsIndex]
        return displayMetrics.firstIndex { $0.id == metric.id }
    }
    
    var body: some View {
        ZStack {
            // Background - edge to edge
            Color.appBackground
            
            if displayMetrics.isEmpty {
                // Empty state
                EmptyPhotoState()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                // TabView carousel - one photo at a time
                TabView(selection: $selectedPhotoIndex) {
                    ForEach(Array(displayMetrics.enumerated()), id: \.element.id) { index, metric in
                        PhotoCard(metric: metric)
                            .tag(index)
                    }
                    
                    // Processing placeholders
                    let processingTasks = processingService.processingTasks.filter { task in
                        task.status != .completed && task.status != .failed
                    }
                    ForEach(processingTasks) { task in
                        ProcessingCard()
                            .tag(displayMetrics.count + (processingTasks.firstIndex(where: { $0.id == task.id }) ?? 0))
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .onChange(of: selectedPhotoIndex) { _, newIndex in
                    if !isDragging, let metricsIdx = metricsIndex(for: newIndex) {
                        HapticManager.shared.sliderChanged()
                        selectedMetricsIndex = metricsIdx
                    }
                }
                .simultaneousGesture(
                    DragGesture()
                        .onChanged { _ in isDragging = true }
                        .onEnded { _ in isDragging = false }
                )
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .clipped()
        .onAppear {
            if let photoIdx = photoIndex(for: selectedMetricsIndex) {
                selectedPhotoIndex = photoIdx
            }
            
            // Preload adjacent photos for smooth scrolling
            preloadAdjacentPhotos()
        }
        .onChange(of: selectedMetricsIndex) { _, newIndex in
            if !isDragging, let photoIdx = photoIndex(for: newIndex) {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                    selectedPhotoIndex = photoIdx
                }
            }
        }
        .onChange(of: selectedPhotoIndex) { _, _ in
            // Preload adjacent photos when selection changes
            preloadAdjacentPhotos()
        }
    }
    
    // MARK: - Photo Preloading for Smooth Experience
    
    private func preloadAdjacentPhotos() {
        // Preload photos around current selection for smooth scrolling
        let currentIndex = selectedPhotoIndex
        let range = max(0, currentIndex - 2)...min(displayMetrics.count - 1, currentIndex + 2)
        
        let urlsToPreload = range.compactMap { index -> String? in
            guard index < displayMetrics.count else { return nil }
            return displayMetrics[index].photoUrl
        }
        
        // Preload in background without blocking UI
        Task.detached(priority: .background) {
            for urlString in urlsToPreload {
                // Use ImageLoader cache to preload
                _ = await ImageLoader.shared.loadImage(from: urlString)
            }
        }
    }
}

// MARK: - Photo Card with Face-Centered Crop
struct PhotoCard: View {
    let metric: BodyMetrics
    @State private var loadedImage: UIImage?
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                Color.appBackground
                
                // Photo content
                if let photoUrl = metric.photoUrl {
                    if let loadedImage = loadedImage {
                        Image(uiImage: loadedImage)
                            .resizable()
                            .aspectRatio(contentMode: .fit) // Show full image, centered
                            .frame(width: geometry.size.width, height: geometry.size.height)
                            .clipped()
                    } else {
                        // Use the optimized photo view directly
                        OptimizedProgressPhotoView(
                            photoUrl: photoUrl,
                            maxHeight: geometry.size.height
                        )
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .clipped()
                        .onAppear {
                            loadImage(from: photoUrl)
                        }
                    }
                }
            }
        }
    }
    
    private func loadImage(from urlString: String) {
        Task.detached(priority: .userInitiated) {
            // Load image on background thread to avoid UI blocking
            if let image = await ImageLoader.shared.loadImage(from: urlString) {
                await MainActor.run {
                    self.loadedImage = image
                }
            }
        }
    }
}

// MARK: - Empty Photo State
struct EmptyPhotoState: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "camera.fill")
                .font(.system(size: 48))
                .foregroundColor(.white.opacity(0.3))
            
            Text("No photos yet")
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
            
            Text("Add a progress photo to track your transformation")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.3))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Processing Card
struct ProcessingCard: View {
    @State private var isAnimating = false
    
    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.2), lineWidth: 3)
                    .frame(width: 60, height: 60)
                
                Circle()
                    .trim(from: 0, to: 0.7)
                    .stroke(Color.appPrimary, lineWidth: 3)
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(isAnimating ? 360 : 0))
                    .animation(.linear(duration: 1).repeatForever(autoreverses: false), value: isAnimating)
            }
            
            VStack(spacing: 8) {
                Text("Processing...")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)
                
                Text("AI background removal in progress")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Image Loader
class ImageLoader {
    static let shared = ImageLoader()
    private let cache = NSCache<NSString, UIImage>()
    
    func loadImage(from urlString: String) async -> UIImage? {
        // Check cache first
        if let cached = cache.object(forKey: urlString as NSString) {
            return cached
        }
        
        // Download image
        guard let url = URL(string: urlString) else { return nil }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let image = UIImage(data: data) {
                cache.setObject(image, forKey: urlString as NSString)
                return image
            }
        } catch {
            // print("Failed to load image: \(error)")
        }
        
        return nil
    }
}

#Preview {
    ProgressPhotoCarouselView(
        currentMetric: nil,
        historicalMetrics: [],
        selectedMetricsIndex: .constant(0)
    )
    .environmentObject(AuthManager.shared)
    .frame(height: 400)
    .padding()
    .background(Color.appBackground)
}
