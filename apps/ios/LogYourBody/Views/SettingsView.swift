//
//  SettingsView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    
    #if DEBUG
    @MainActor
    func testBodyMetricsSync() async {
        print("\n🔍 === SYNC DEBUG TEST START ===")
        
        // 1. Check authentication
        print("1️⃣ Auth Status: \(authManager.isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated")")
        if let user = authManager.currentUser {
            print("   User ID: \(user.id)")
        }
        
        // 2. Create a test body metric with valid UUID
        let testMetric = BodyMetrics(
            id: UUID().uuidString,
            userId: authManager.currentUser?.id ?? "",
            date: Date(),
            weight: 75.5,
            weightUnit: "kg",
            bodyFatPercentage: 20.5,
            bodyFatMethod: "Debug Test",
            muscleMass: nil,
            boneMass: nil,
            notes: "Test metric created for debugging sync",
            photoUrl: nil,
            dataSource: "Manual",
            createdAt: Date(),
            updatedAt: Date()
        )
        
        print("\n2️⃣ Creating test metric:")
        print("   ID: \(testMetric.id)")
        print("   Weight: \(testMetric.weight ?? 0) \(testMetric.weightUnit ?? "")")
        
        // 3. Save to CoreData
        CoreDataManager.shared.saveBodyMetrics(testMetric, userId: testMetric.userId, markAsSynced: false)
        print("   ✅ Saved to CoreData")
        
        // 4. Check unsynced entries
        print("\n3️⃣ Checking unsynced entries:")
        CoreDataManager.shared.debugPrintAllBodyMetrics()
        
        let unsynced = CoreDataManager.shared.fetchUnsyncedEntries()
        print("   Unsynced body metrics: \(unsynced.bodyMetrics.count)")
        print("   Unsynced daily metrics: \(unsynced.dailyMetrics.count)")
        
        // 5. Trigger sync
        print("\n4️⃣ Triggering sync...")
        SyncManager.shared.syncIfNeeded()
        
        // Wait a bit for sync to complete
        try? await Task.sleep(nanoseconds: 3_000_000_000) // 3 seconds
        
        // 6. Check sync results
        print("\n5️⃣ Post-sync check:")
        let postSyncUnsynced = CoreDataManager.shared.fetchUnsyncedEntries()
        print("   Remaining unsynced body metrics: \(postSyncUnsynced.bodyMetrics.count)")
        
        print("\n🔍 === SYNC DEBUG TEST END ===\n")
    }
    #endif
    
    var body: some View {
        NavigationView {
            List {
                Section("Account") {
                    HStack {
                        Text("Email")
                        Spacer()
                        Text(authManager.currentUser?.email ?? "")
                            .foregroundColor(.secondary)
                    }
                    
                    NavigationLink("Profile Settings") {
                        ProfileSettingsViewV2()
                            .environmentObject(authManager)
                    }
                    
                    NavigationLink("Preferences") {
                        PreferencesView()
                            .environmentObject(authManager)
                    }
                }
                
                Section("About") {
                    VersionRow()
                    WhatsNewRow()
                    
                    Link("Privacy Policy", destination: URL(string: "https://logyourbody.com/privacy")!)
                    Link("Terms of Service", destination: URL(string: "https://logyourbody.com/terms")!)
                }
                
                #if DEBUG
                Section("Debug") {
                    Button("Test Body Metrics Sync") {
                        Task {
                            await testBodyMetricsSync()
                        }
                    }
                    
                    Button("Print All Body Metrics") {
                        CoreDataManager.shared.debugPrintAllBodyMetrics()
                    }
                    
                    Button("Force Sync Now") {
                        SyncManager.shared.syncAll()
                    }
                    
                    Button("Clean Invalid Entries") {
                        // Delete entries with invalid IDs
                        let cleaned = CoreDataManager.shared.cleanInvalidBodyMetrics()
                        print("🧹 Cleaned \(cleaned) invalid body metrics entries")
                    }
                    .foregroundColor(.red)
                    
                    Button("Repair Corrupted Entries") {
                        // Repair entries with missing required fields
                        let repaired = CoreDataManager.shared.repairCorruptedEntries()
                        print("🔧 Repaired \(repaired) corrupted entries")
                    }
                    .foregroundColor(.orange)
                    
                    Button("Create Profile First") {
                        Task {
                            guard let user = authManager.currentUser else { return }
                            
                            // Create profile in Supabase first
                            let profileData: [String: Any] = [
                                "id": user.id,
                                "email": user.email ?? "",
                                "name": user.name ?? user.email ?? "User",
                                "created_at": ISO8601DateFormatter().string(from: Date()),
                                "updated_at": ISO8601DateFormatter().string(from: Date())
                            ]
                            
                            do {
                                if let session = authManager.clerkSession {
                                    let tokenResource = try await session.getToken()
                                    if let token = tokenResource?.jwt {
                                        print("👤 Creating profile for user: \(user.id)")
                                        
                                        // Upsert profile
                                        let url = URL(string: "\(Constants.supabaseURL)/rest/v1/profiles")!
                                        var request = URLRequest(url: url)
                                        request.httpMethod = "POST"
                                        request.setValue(Constants.supabaseAnonKey, forHTTPHeaderField: "apikey")
                                        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                                        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                                        request.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
                                        
                                        let jsonData = try JSONSerialization.data(withJSONObject: [profileData])
                                        request.httpBody = jsonData
                                        
                                        let (data, response) = try await URLSession.shared.data(for: request)
                                        
                                        if let httpResponse = response as? HTTPURLResponse {
                                            print("📡 Profile creation response: Status \(httpResponse.statusCode)")
                                            if let responseString = String(data: data, encoding: .utf8) {
                                                print("📄 Response: \(responseString)")
                                            }
                                            
                                            if (200...299).contains(httpResponse.statusCode) {
                                                print("✅ Profile created/updated successfully!")
                                            }
                                        }
                                    }
                                }
                            } catch {
                                print("❌ Profile creation error: \(error)")
                            }
                        }
                    }
                    .foregroundColor(.green)
                    
                    Button("Test Minimal Sync") {
                        Task {
                            // Test with minimal fields only
                            let testData: [[String: Any]] = [[
                                "id": UUID().uuidString,
                                "user_id": authManager.currentUser?.id ?? "",
                                "date": ISO8601DateFormatter().string(from: Date()),
                                "weight": 70.5,
                                "weight_unit": "kg",
                                "photo_url": NSNull()
                            ]]
                            
                            do {
                                if let session = authManager.clerkSession {
                                    let tokenResource = try await session.getToken()
                                    if let token = tokenResource?.jwt {
                                        print("🧪 Testing minimal sync with: \(testData)")
                                        let result = try await SupabaseManager.shared.upsertBodyMetricsBatch(testData, token: token)
                                        print("✅ Minimal sync result: \(result)")
                                    }
                                }
                            } catch {
                                print("❌ Minimal sync error: \(error)")
                            }
                        }
                    }
                    .foregroundColor(.orange)
                }
                #endif
                
                Section {
                    Button(action: {
                        Task {
                            await authManager.logout()
                        }
                    }) {
                        Text("Log Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthManager())
}