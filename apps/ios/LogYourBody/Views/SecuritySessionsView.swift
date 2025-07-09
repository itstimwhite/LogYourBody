//
//  SecuritySessionsView.swift
//  LogYourBody
//
//  Displays active sessions with ability to revoke them
//

import SwiftUI
import Clerk

struct SecuritySessionsView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss
    @State private var sessions: [SessionInfo] = []
    @State private var isLoading = true
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var sessionToRevoke: SessionInfo?
    @State private var showRevokeConfirmation = false
    @State private var isRevokingSession = false
    @State private var showSuccessToast = false
    @State private var refreshTimer: Timer?
    
    // Pull to refresh
    @State private var refreshing = false
    
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
                .ignoresSafeArea()
            
            if isLoading && sessions.isEmpty {
                loadingView
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        // Security Info Card
                        securityInfoCard
                            .padding(.horizontal)
                            .padding(.top)
                        
                        // Sessions List
                        if sessions.isEmpty {
                            emptyStateView
                        } else {
                            ForEach(sessions) { session in
                                SessionRowView(
                                    session: session,
                                    onRevoke: {
                                        sessionToRevoke = session
                                        showRevokeConfirmation = true
                                    }
                                )
                                .padding(.horizontal)
                            }
                        }
                        
                        // Last Updated
                        if !sessions.isEmpty {
                            lastUpdatedView
                                .padding(.top, 8)
                                .padding(.bottom, 30)
                        }
                    }
                    .padding(.vertical)
                }
                .refreshable {
                    await loadSessions()
                }
            }
        }
        .navigationTitle("Active Sessions")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if isLoading && !sessions.isEmpty {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }
        }
        .onAppear {
            Task {
                await loadSessions()
            }
            // Auto-refresh every 30 seconds
            refreshTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
                Task {
                    await loadSessions(showLoading: false)
                }
            }
        }
        .onDisappear {
            refreshTimer?.invalidate()
        }
        .alert("Revoke Session?", isPresented: $showRevokeConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Revoke", role: .destructive) {
                if let session = sessionToRevoke {
                    Task {
                        await revokeSession(session)
                    }
                }
            }
        } message: {
            if let session = sessionToRevoke {
                Text("Are you sure you want to revoke this session? The device will be signed out immediately.")
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") {}
        } message: {
            Text(errorMessage)
        }
        .overlay(
            Group {
                if showSuccessToast {
                    successToastView
                }
            }
        )
    }
    
    // MARK: - View Components
    
    private var loadingView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Loading sessions...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var securityInfoCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "lock.shield.fill")
                    .font(.title2)
                    .foregroundColor(.blue)
                    .frame(width: 40, height: 40)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Session Management")
                        .font(.headline)
                    Text("View and manage devices signed into your account")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
                .padding()
                .background(Color.green.opacity(0.1))
                .clipShape(Circle())
            
            VStack(spacing: 8) {
                Text("No Other Sessions")
                    .font(.headline)
                Text("Only this device is currently signed in")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.vertical, 60)
        .frame(maxWidth: .infinity)
    }
    
    private var lastUpdatedView: some View {
        HStack {
            Spacer()
            Text("Last updated: \(Date().formatted(date: .omitted, time: .shortened))")
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
        }
    }
    
    private var successToastView: some View {
        VStack {
            Spacer()
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                Text("Session revoked successfully")
                    .fontWeight(.medium)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(10)
            .shadow(radius: 10)
            .padding(.bottom, 50)
        }
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation {
                    showSuccessToast = false
                }
            }
        }
    }
    
    // MARK: - Methods
    
    private func loadSessions(showLoading: Bool = true) async {
        if showLoading {
            isLoading = true
        }
        
        do {
            let fetchedSessions = try await authManager.fetchActiveSessions()
            await MainActor.run {
                self.sessions = fetchedSessions.sorted { session1, session2 in
                    // Current session first, then by last active
                    if session1.isCurrentSession != session2.isCurrentSession {
                        return session1.isCurrentSession
                    }
                    return session1.lastActiveAt > session2.lastActiveAt
                }
                isLoading = false
                refreshing = false
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to load sessions: \(error.localizedDescription)"
                showError = true
                isLoading = false
                refreshing = false
            }
        }
    }
    
    private func revokeSession(_ session: SessionInfo) async {
        isRevokingSession = true
        
        do {
            try await authManager.revokeSession(sessionId: session.id)
            await MainActor.run {
                // Remove from list with animation
                withAnimation(.easeOut(duration: 0.3)) {
                    sessions.removeAll { $0.id == session.id }
                }
                isRevokingSession = false
                
                // Show success toast
                withAnimation {
                    showSuccessToast = true
                }
                
                // Haptic feedback
                HapticManager.shared.success()
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to revoke session: \(error.localizedDescription)"
                showError = true
                isRevokingSession = false
            }
        }
    }
}

// MARK: - Session Row View

struct SessionRowView: View {
    let session: SessionInfo
    let onRevoke: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Main Content
            HStack(spacing: 16) {
                // Device Icon
                ZStack {
                    Circle()
                        .fill(iconBackgroundColor)
                        .frame(width: 50, height: 50)
                    
                    Image(systemName: deviceIcon)
                        .font(.system(size: 24))
                        .foregroundColor(iconColor)
                }
                
                // Session Details
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(session.deviceName)
                            .font(.system(size: 16, weight: .semibold))
                        
                        if session.isCurrentSession {
                            Text("THIS DEVICE")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.green)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.green.opacity(0.15))
                                .cornerRadius(4)
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(session.location)
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                        
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.system(size: 12))
                            Text(timeAgoString(from: session.lastActiveAt))
                                .font(.system(size: 13))
                        }
                        .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Revoke Button (not for current session)
                if !session.isCurrentSession {
                    Button(action: onRevoke) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.red.opacity(0.8))
                    }
                }
            }
            .padding()
            
            // Additional Details (expandable)
            if isPressed {
                VStack(alignment: .leading, spacing: 8) {
                    Divider()
                    
                    HStack {
                        Label("IP Address", systemImage: "network")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(session.ipAddress)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Label("First Signed In", systemImage: "calendar")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(session.createdAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal)
                .padding(.bottom)
            }
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .onTapGesture {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                isPressed.toggle()
            }
        }
    }
    
    private var deviceIcon: String {
        switch session.deviceType.lowercased() {
        case "iphone":
            return "iphone"
        case "ipad":
            return "ipad"
        case "mac":
            return "desktopcomputer"
        case "web":
            return "globe"
        default:
            return "questionmark.circle"
        }
    }
    
    private var iconColor: Color {
        session.isCurrentSession ? .green : .blue
    }
    
    private var iconBackgroundColor: Color {
        session.isCurrentSession ? Color.green.opacity(0.15) : Color.blue.opacity(0.15)
    }
    
    private func timeAgoString(from date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}


// MARK: - Preview

#Preview {
    NavigationView {
        SecuritySessionsView()
            .environmentObject(AuthManager.shared)
    }
}