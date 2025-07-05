import SwiftUI

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

#Preview {
    List {
        VersionRow()
    }
}