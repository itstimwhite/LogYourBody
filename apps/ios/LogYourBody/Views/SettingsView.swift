//
//  SettingsView.swift
//  LogYourBody
//
//  Created by Tim White on 7/1/25.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    
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
                        ProfileSettingsView()
                            .environmentObject(authManager)
                    }
                    
                    NavigationLink("Preferences") {
                        PreferencesView()
                            .environmentObject(authManager)
                    }
                }
                
                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    Link("Privacy Policy", destination: URL(string: "https://logyourbody.com/privacy")!)
                    Link("Terms of Service", destination: URL(string: "https://logyourbody.com/terms")!)
                }
                
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