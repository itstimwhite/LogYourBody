import SwiftUI

struct WhatsNewView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selectedVersion: String?
    
    private let changelogManager = ChangelogManager.shared
    
    var body: some View {
        NavigationView {
            List {
                ForEach(changelogManager.entries, id: \.version) { entry in
                    Section {
                        VStack(alignment: .leading, spacing: 12) {
                            // Version header
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Version \(entry.version)")
                                        .font(.headline)
                                    Text(entry.date, style: .date)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                if entry.version == AppVersionManager.shared.currentVersion {
                                    Text("Current")
                                        .font(.caption)
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 4)
                                        .background(Color.blue)
                                        .cornerRadius(12)
                                }
                            }
                            
                            // Changes
                            VStack(alignment: .leading, spacing: 8) {
                                ForEach(Array(entry.changes.enumerated()), id: \.offset) { _, change in
                                    HStack(alignment: .top, spacing: 12) {
                                        Image(systemName: change.type.icon)
                                            .font(.system(size: 14))
                                            .foregroundColor(Color(change.type.color))
                                            .frame(width: 20)
                                        
                                        Text(change.description)
                                            .font(.system(size: 14))
                                            .foregroundColor(.primary)
                                            .fixedSize(horizontal: false, vertical: true)
                                        
                                        Spacer()
                                    }
                                }
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("What's New")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        changelogManager.markAsViewed()
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            changelogManager.markAsViewed()
        }
    }
}

// Compact version for showing in Settings
struct WhatsNewRow: View {
    @State private var showWhatsNew = false
    private let changelogManager = ChangelogManager.shared
    
    var body: some View {
        Button(action: {
            showWhatsNew = true
        }) {
            HStack {
                Label("What's New", systemImage: "sparkles")
                    .foregroundColor(.primary)
                
                Spacer()
                
                if changelogManager.hasNewUpdates() {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)
                }
                
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundColor(Color(.tertiaryLabel))
            }
        }
        .sheet(isPresented: $showWhatsNew) {
            WhatsNewView()
        }
    }
}

// Version display row for Settings
struct VersionRow: View {
    var body: some View {
        HStack {
            Text("Version")
            Spacer()
            Text(AppVersionManager.shared.formattedVersionString())
                .foregroundColor(.secondary)
        }
    }
}

#Preview("What's New") {
    WhatsNewView()
}

#Preview("Settings Rows") {
    List {
        Section("About") {
            VersionRow()
            WhatsNewRow()
        }
    }
}