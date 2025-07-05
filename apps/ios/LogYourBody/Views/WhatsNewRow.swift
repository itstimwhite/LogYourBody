import SwiftUI

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

#Preview {
    List {
        WhatsNewRow()
    }
}