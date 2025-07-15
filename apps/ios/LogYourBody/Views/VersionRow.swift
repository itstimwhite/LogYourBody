//
// VersionRow.swift
// LogYourBody
//
import SwiftUI

struct VersionRow: View {
    var body: some View {
        SettingsRow(
            icon: "info.circle",
            title: "Version",
            value: AppVersion.fullVersion
        )
    }
}

#Preview {
    List {
        VersionRow()
    }
}
