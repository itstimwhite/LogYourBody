//
// LegalDocumentView.swift
// LogYourBody
//
import SwiftUI
struct LegalDocumentView: View {
    let documentType: LegalDocumentType
    @State private var documentContent: String = ""
    @State private var isLoading = true
    @State private var loadError = false
    @Environment(\.dismiss)
    var dismiss    
    enum LegalDocumentType {
        case terms
        case privacy
        case healthDisclosure
        case gdprCompliance
        case ccpaCompliance
        case openSourceLicenses
        
        var title: String {
            switch self {
            case .terms: return "Terms of Service"
            case .privacy: return "Privacy Policy"
            case .healthDisclosure: return "Health Disclosure"
            case .gdprCompliance: return "GDPR Compliance"
            case .ccpaCompliance: return "CCPA Compliance"
            case .openSourceLicenses: return "Open Source Licenses"
            }
        }
        
        var filename: String {
            switch self {
            case .terms: return "terms-of-service"
            case .privacy: return "privacy-policy"
            case .healthDisclosure: return "health-disclosure"
            case .gdprCompliance: return "gdpr-compliance"
            case .ccpaCompliance: return "ccpa-compliance"
            case .openSourceLicenses: return "open-source-licenses"
            }
        }
        
        var icon: String {
            switch self {
            case .terms: return "doc.text"
            case .privacy: return "hand.raised"
            case .healthDisclosure: return "heart.text.square"
            case .gdprCompliance: return "shield.lefthalf.filled"
            case .ccpaCompliance: return "shield.righthalf.filled"
            case .openSourceLicenses: return "text.badge.checkmark"
            }
        }
    }
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            if isLoading {
                ProgressView("Loading...")
                    .progressViewStyle(CircularProgressViewStyle(tint: .appPrimary))
                    .scaleEffect(1.2)
            } else if loadError {
                VStack(spacing: 20) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 50))
                        .foregroundColor(.appTextSecondary)
                    
                    Text("Unable to load document")
                        .font(.headline)
                        .foregroundColor(.appText)
                    
                    Button("Try Again") {
                        loadDocument()
                    }
                    .foregroundColor(.appPrimary)
                }
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Document header
                        HStack {
                            Image(systemName: documentType.icon)
                                .font(.title2)
                                .foregroundColor(.appPrimary)
                            
                            Text(documentType.title)
                                .font(.largeTitle)
                                .fontWeight(.bold)
                                .foregroundColor(.appText)
                            
                            Spacer()
                        }
                        .padding(.top, 20)
                        .padding(.horizontal)
                        
                        // Rendered markdown content
                        MarkdownTextView(markdown: documentContent)
                            .padding(.horizontal)
                            .padding(.bottom, 40)
                    }
                }
            }
        }
        .navigationTitle(documentType.title)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            loadDocument()
        }
    }
    
    private func loadDocument() {
        isLoading = true
        loadError = false
        
        // Try to load from Resources/Legal directory in bundle
        if let bundlePath = Bundle.main.path(forResource: "Legal/\(documentType.filename)", ofType: "md"),
           let content = try? String(contentsOfFile: bundlePath) {
            documentContent = content
            isLoading = false
            return
        }
        
        // Try alternate path without subfolder
        if let bundlePath = Bundle.main.path(forResource: documentType.filename, ofType: "md", inDirectory: "Legal"),
           let content = try? String(contentsOfFile: bundlePath) {
            documentContent = content
            isLoading = false
            return
        }
        
        // Try without any directory
        if let bundlePath = Bundle.main.path(forResource: documentType.filename, ofType: "md"),
           let content = try? String(contentsOfFile: bundlePath) {
            documentContent = content
            isLoading = false
            return
        }
        
        // Fallback: Load embedded placeholder content
        loadFallbackContent()
    }
    
    private func loadFallbackContent() {
        switch documentType {
        case .terms:
            documentContent = """
            # Terms of Service
            
            **Last Updated: July 11, 2025**
            
            Please visit our website for the full Terms of Service.
            
            By using LogYourBody, you agree to our terms and conditions.
            """
        case .privacy:
            documentContent = """
            # Privacy Policy
            
            **Last Updated: July 11, 2025**
            
            Please visit our website for the full Privacy Policy.
            
            We are committed to protecting your privacy and personal data.
            """
        case .healthDisclosure:
            documentContent = """
            # Health Disclosure
            
            **Last Updated: July 11, 2025**
            
            Please visit our website for the full Health Disclosure.
            
            LogYourBody is not a medical service and does not provide medical advice.
            """
        case .gdprCompliance:
            documentContent = """
            # GDPR Compliance
            
            **Last Updated: July 14, 2025**
            
            Please visit our website for the full GDPR Compliance information.
            
            We comply with the General Data Protection Regulation for EU users.
            """
        case .ccpaCompliance:
            documentContent = """
            # CCPA Compliance
            
            **Last Updated: July 14, 2025**
            
            Please visit our website for the full CCPA Compliance information.
            
            We respect the privacy rights of California residents.
            """
        case .openSourceLicenses:
            documentContent = """
            # Open Source Licenses
            
            **Last Updated: July 14, 2025**
            
            Please visit our website for the full list of open source licenses.
            
            LogYourBody is built with amazing open source software.
            """
        }
        isLoading = false
    }
}

// MARK: - Markdown Text View

struct MarkdownTextView: View {
    let markdown: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            ForEach(parseMarkdownSections(markdown), id: \.id) { section in
                MarkdownSectionView(section: section)
            }
        }
    }
    
    private func parseMarkdownSections(_ markdown: String) -> [MarkdownSection] {
        var sections: [MarkdownSection] = []
        let lines = markdown.components(separatedBy: .newlines)
        var currentSection: MarkdownSection?
        
        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            
            if trimmed.isEmpty {
                if let section = currentSection {
                    sections.append(section)
                    currentSection = nil
                }
            } else if trimmed.hasPrefix("# ") {
                if let section = currentSection { sections.append(section) }
                currentSection = MarkdownSection(type: .h1, content: String(trimmed.dropFirst(2)))
            } else if trimmed.hasPrefix("## ") {
                if let section = currentSection { sections.append(section) }
                currentSection = MarkdownSection(type: .h2, content: String(trimmed.dropFirst(3)))
            } else if trimmed.hasPrefix("### ") {
                if let section = currentSection { sections.append(section) }
                currentSection = MarkdownSection(type: .h3, content: String(trimmed.dropFirst(4)))
            } else if trimmed.hasPrefix("**") && trimmed.hasSuffix("**") && trimmed.count > 4 {
                if let section = currentSection { sections.append(section) }
                let content = String(trimmed.dropFirst(2).dropLast(2))
                currentSection = MarkdownSection(type: .bold, content: content)
            } else if trimmed.hasPrefix("- ") {
                if let section = currentSection { sections.append(section) }
                currentSection = MarkdownSection(type: .bulletPoint, content: String(trimmed.dropFirst(2)))
            } else if trimmed.hasPrefix("---") {
                if let section = currentSection { sections.append(section) }
                sections.append(MarkdownSection(type: .divider, content: ""))
                currentSection = nil
            } else {
                if let section = currentSection, section.type == .paragraph {
                    currentSection = MarkdownSection(type: .paragraph, content: section.content + " " + trimmed)
                } else {
                    if let section = currentSection { sections.append(section) }
                    currentSection = MarkdownSection(type: .paragraph, content: trimmed)
                }
            }
        }
        
        if let section = currentSection {
            sections.append(section)
        }
        
        return sections
    }
}

struct MarkdownSection: Identifiable {
    let id = UUID()
    let type: MarkdownType
    let content: String
    
    enum MarkdownType {
        case h1, h2, h3, paragraph, bold, bulletPoint, divider
    }
}

struct MarkdownSectionView: View {
    let section: MarkdownSection
    
    var body: some View {
        switch section.type {
        case .h1:
            Text(section.content)
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.appText)
                .padding(.top, 20)
                .padding(.bottom, 10)
        
        case .h2:
            Text(section.content)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.appText)
                .padding(.top, 16)
                .padding(.bottom, 8)
        
        case .h3:
            Text(section.content)
                .font(.headline)
                .fontWeight(.medium)
                .foregroundColor(.appText)
                .padding(.top, 12)
                .padding(.bottom, 4)
        
        case .paragraph:
            Text(parseInlineMarkdown(section.content))
                .font(.body)
                .foregroundColor(.appTextSecondary)
                .lineSpacing(4)
        
        case .bold:
            Text(section.content)
                .font(.body)
                .fontWeight(.semibold)
                .foregroundColor(.appText)
        
        case .bulletPoint:
            HStack(alignment: .top, spacing: 8) {
                Text("•")
                    .foregroundColor(.appTextSecondary)
                Text(parseInlineMarkdown(section.content))
                    .font(.body)
                    .foregroundColor(.appTextSecondary)
                    .lineSpacing(4)
                Spacer()
            }
            .padding(.leading, 16)
        
        case .divider:
            Divider()
                .padding(.vertical, 20)
        }
    }
    
    private func parseInlineMarkdown(_ text: String) -> AttributedString {
        var attributedString = AttributedString(text)
        
        // Parse bold text
        if let boldRegex = try? NSRegularExpression(pattern: "\\*\\*(.+?)\\*\\*", options: []) {
            let nsString = text as NSString
            let matches = boldRegex.matches(in: text, options: [], range: NSRange(location: 0, length: nsString.length))
            
            for match in matches.reversed() {
                if let range = Range(match.range, in: text) {
                    let boldText = String(text[range]).replacingOccurrences(of: "**", with: "")
                    if let attrRange = Range(match.range, in: attributedString) {
                        attributedString.replaceSubrange(attrRange, with: AttributedString(boldText))
                        if let newRange = attributedString.range(of: boldText) {
                            attributedString[newRange].font = .body.bold()
                        }
                    }
                }
            }
        }
        
        return attributedString
    }
}

// MARK: - Preview

#Preview("Terms of Service") {
    NavigationView {
        LegalDocumentView(documentType: .terms)
    }
    .preferredColorScheme(.dark)
}

#Preview("Privacy Policy") {
    NavigationView {
        LegalDocumentView(documentType: .privacy)
    }
    .preferredColorScheme(.dark)
}

#Preview("Health Disclosure") {
    NavigationView {
        LegalDocumentView(documentType: .healthDisclosure)
    }
    .preferredColorScheme(.dark)
}
