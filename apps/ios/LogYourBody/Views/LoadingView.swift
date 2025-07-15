//
//  LoadingView.swift
//  LogYourBody
//
//  Created on 7/2/25.
//

import SwiftUI

struct LoadingView: View {
    @Binding var progress: Double
    @Binding var loadingStatus: String
    let onComplete: () -> Void
    
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0
    
    var body: some View {
        ZStack {
            // Background
            Color(red: 0.071, green: 0.071, blue: 0.114)
                .ignoresSafeArea()
            
            VStack(spacing: 32) {
                Spacer()
                
                // Logo
                VStack(spacing: 8) {
                    Image(systemName: "figure.walk.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.white)
                        .scaleEffect(logoScale)
                        .opacity(logoOpacity)
                    
                    Text("LogYourBody")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.white)
                        .opacity(logoOpacity)
                }
                .onAppear {
                    withAnimation(.easeOut(duration: 0.6)) {
                        logoScale = 1.0
                        logoOpacity = 1.0
                    }
                }
                
                Spacer()
                
                // Progress section
                VStack(spacing: 16) {
                    // Status text
                    Text(loadingStatus)
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.7))
                        .frame(minHeight: 20)
                        .animation(.easeInOut(duration: 0.3), value: loadingStatus)
                    
                    // Progress bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            // Background
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white.opacity(0.2))
                                .frame(height: 8)
                            
                            // Progress
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white)
                                .frame(width: geometry.size.width * progress, height: 8)
                                .animation(.spring(response: 0.4, dampingFraction: 0.8), value: progress)
                        }
                    }
                    .frame(height: 8)
                    .padding(.horizontal, 60)
                    
                    // Percentage
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                .padding(.bottom, 100)
            }
        }
        .onAppear {
            // Ensure we complete loading if progress reaches 100%
            if progress >= 1.0 {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    onComplete()
                }
            }
        }
        .onChange(of: progress) { newValue in
            if newValue >= 1.0 {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    onComplete()
                }
            }
        }
    }
}

#Preview {
    LoadingView(
        progress: .constant(0.6),
        loadingStatus: .constant("Loading..."),
        onComplete: {}
    )
}
