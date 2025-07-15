import SwiftUI

struct WhatsNewRow: View {
    var body: some View {
        NavigationLink(destination: WhatsNewView()) {
            SettingsRow(
                icon: "sparkles",
                title: "What's New",
                showChevron: true
            )
        }
    }
}

#Preview {
    List {
        WhatsNewRow()
    }
}