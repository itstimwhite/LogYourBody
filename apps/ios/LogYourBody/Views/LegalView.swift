//
//  LegalView.swift
//  LogYourBody
//
struct LegalView: View {
    @Environment(\.dismiss)
    var dismiss    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Legal Documents Section
                    SettingsSection(header: "Legal Documents") {
                        VStack(spacing: 0) {
                            // Health Disclaimer
                            NavigationLink(destination: LegalDocumentView(documentType: .healthDisclosure)) {
                                SettingsRow(
                                    icon: "heart.text.square",
                                    title: "Health Disclaimer",
                                    showChevron: true
                                )
                            }
                            
                            Divider()
                                .padding(.leading, 16)
                            
                            // Privacy Policy
                            NavigationLink(destination: LegalDocumentView(documentType: .privacy)) {
                                SettingsRow(
                                    icon: "hand.raised",
                                    title: "Privacy Policy",
                                    showChevron: true
                                )
                            }
                            
                            Divider()
                                .padding(.leading, 16)
                            
                            // Terms of Service
                            NavigationLink(destination: LegalDocumentView(documentType: .terms)) {
                                SettingsRow(
                                    icon: "doc.text",
                                    title: "Terms of Service",
                                    showChevron: true
                                )
                            }
                        }
                    }
                    
                    // Compliance Section
                    SettingsSection(header: "Compliance") {
                        VStack(spacing: 0) {
                            // GDPR
                            NavigationLink(destination: LegalDocumentView(documentType: .gdprCompliance)) {
                                SettingsRow(
                                    icon: "shield.lefthalf.filled",
                                    title: "GDPR Compliance",
                                    value: "EU",
                                    showChevron: true
                                )
                            }
                            
                            Divider()
                                .padding(.leading, 16)
                            
                            // CCPA
                            NavigationLink(destination: LegalDocumentView(documentType: .ccpaCompliance)) {
                                SettingsRow(
                                    icon: "shield.righthalf.filled",
                                    title: "CCPA Compliance",
                                    value: "California",
                                    showChevron: true
                                )
                            }
                        }
                    }
                    
                    // Licenses Section
                    SettingsSection(
                        header: "Open Source",
                        footer: "LogYourBody uses open source software. Tap to view licenses."
                    ) {
                        NavigationLink(destination: LegalDocumentView(documentType: .openSourceLicenses)) {
                            SettingsRow(
                                icon: "text.badge.checkmark",
                                title: "Open Source Licenses",
                                showChevron: true
                            )
                        }
                    }
                    
                    // Contact Section
                    SettingsSection(header: "Legal Contact") {
                        VStack(spacing: 0) {
                            // Email
                            Link(destination: URL(string: "mailto:legal@logyourbody.com")!) {
                                SettingsRow(
                                    icon: "envelope",
                                    title: "Legal Inquiries",
                                    value: "legal@logyourbody.com",
                                    showChevron: true,
                                    isExternal: true
                                )
                            }
                            
                            Divider()
                                .padding(.leading, 16)
                            
                            // Mailing Address
                            SettingsRow(
                                icon: "location",
                                title: "Mailing Address",
                                value: "View",
                                showChevron: false
                            )
                        }
                    }
                    
                    // Footer
                    Text("Last updated: \(Date().formatted(date: .abbreviated, time: .omitted))")
                        .font(.caption)
                        .foregroundColor(.appTextTertiary)
                        .padding(.top, 20)
                        .padding(.bottom, 40)
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
            }
        }
        .navigationTitle("Legal")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationView {
        LegalView()
    }
}
