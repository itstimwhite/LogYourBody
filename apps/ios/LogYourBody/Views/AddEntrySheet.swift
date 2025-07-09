//
//  AddEntrySheet.swift
//  LogYourBody
//
//  Bottom sheet for adding weight, body fat, or progress photos
//

import SwiftUI
import PhotosUI

struct AddEntrySheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authManager: AuthManager
    @Binding var isPresented: Bool
    @State private var selectedTab: Int
    @State private var selectedDate = Date()
    
    init(isPresented: Binding<Bool>, initialTab: Int = 0) {
        self._isPresented = isPresented
        self._selectedTab = State(initialValue: initialTab)
    }
    
    // Weight entry
    @State private var weight: String = ""
    @State private var weightUnit: String = "kg"
    
    // Body fat entry
    @State private var bodyFat: String = ""
    @State private var bodyFatMethod = "Visual"
    
    // Photo entry
    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var isProcessingPhotos = false
    @State private var photoProgress: Double = 0
    @State private var processedCount = 0
    
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab selector
                Picker("Entry Type", selection: $selectedTab) {
                    Label("Weight", systemImage: "scalemass").tag(0)
                    Label("Body Fat", systemImage: "percent").tag(1)
                    Label("Photos", systemImage: "photo.fill").tag(2)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding(.horizontal)
                .padding(.vertical, 12)
                
                // Date picker (common for all tabs)
                HStack {
                    Text("Date")
                        .font(.appBodySmall)
                        .foregroundColor(.appTextSecondary)
                    
                    Spacer()
                    
                    DatePicker("", selection: $selectedDate, displayedComponents: .date)
                        .labelsHidden()
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                
                Divider()
                
                // Tab content
                ScrollView {
                    switch selectedTab {
                    case 0:
                        weightEntryView
                    case 1:
                        bodyFatEntryView
                    case 2:
                        photoEntryView
                    default:
                        EmptyView()
                    }
                }
                
                // Save button
                Button(action: saveEntry) {
                    HStack {
                        if isProcessingPhotos {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                .scaleEffect(0.8)
                        } else {
                            Text(saveButtonText)
                                .font(.appBody)
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(height: 48)
                    .frame(maxWidth: .infinity)
                    .background(canSave ? Color.white : Color.appBorder)
                    .foregroundColor(canSave ? .black : .white)
                    .cornerRadius(Constants.cornerRadius)
                }
                .disabled(!canSave || isProcessingPhotos)
                .padding()
            }
            .navigationTitle("Add Entry")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    // MARK: - Weight Entry View
    private var weightEntryView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Enter your weight")
                .font(.appHeadline)
                .padding(.top)
            
            HStack(spacing: 12) {
                TextField("0.0", text: $weight)
                    .keyboardType(.decimalPad)
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                    .modernTextFieldStyle()
                
                Picker("Unit", selection: $weightUnit) {
                    Text("kg").tag("kg")
                    Text("lbs").tag("lbs")
                }
                .pickerStyle(MenuPickerStyle())
                .frame(width: 80)
            }
            
            Spacer()
        }
        .padding(.horizontal)
    }
    
    // MARK: - Body Fat Entry View
    private var bodyFatEntryView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Enter body fat percentage")
                .font(.appHeadline)
                .padding(.top)
            
            HStack {
                TextField("0.0", text: $bodyFat)
                    .keyboardType(.decimalPad)
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                    .modernTextFieldStyle()
                
                Text("%")
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(.appTextSecondary)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Measurement Method")
                    .font(.appBodySmall)
                    .foregroundColor(.appTextSecondary)
                
                Picker("Method", selection: $bodyFatMethod) {
                    Text("Visual Estimate").tag("Visual")
                    Text("Body Scan").tag("Scan")
                    Text("Calipers").tag("Calipers")
                    Text("Bioelectrical").tag("BIA")
                    Text("DEXA").tag("DEXA")
                }
                .pickerStyle(MenuPickerStyle())
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            
            Spacer()
        }
        .padding(.horizontal)
    }
    
    // MARK: - Photo Entry View
    private var photoEntryView: some View {
        VStack(spacing: 16) {
            if selectedPhotos.isEmpty {
                VStack(spacing: 20) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 60))
                        .foregroundColor(.appTextTertiary)
                    
                    Text("Select progress photos")
                        .font(.appHeadline)
                    
                    Text("Photos will be automatically dated based on when they were taken. You can select multiple photos for bulk upload.")
                        .font(.appBody)
                        .foregroundColor(.appTextSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                    
                    PhotosPicker(
                        selection: $selectedPhotos,
                        maxSelectionCount: 10,
                        matching: .images
                    ) {
                        Label("Choose Photos", systemImage: "photo.fill")
                            .frame(height: 48)
                            .frame(maxWidth: .infinity)
                            .background(Color.appPrimary)
                            .foregroundColor(.white)
                            .cornerRadius(Constants.cornerRadius)
                    }
                    .padding(.horizontal)
                }
                .padding(.top, 40)
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("\(selectedPhotos.count) photo\(selectedPhotos.count == 1 ? "" : "s") selected")
                            .font(.appHeadline)
                        
                        Spacer()
                        
                        Button("Change") {
                            selectedPhotos = []
                        }
                        .foregroundColor(.appPrimary)
                    }
                    
                    if isProcessingPhotos {
                        VStack(spacing: 12) {
                            ProgressView(value: photoProgress)
                                .tint(.appPrimary)
                            
                            Text("Processing \(processedCount + 1) of \(selectedPhotos.count)")
                                .font(.appCaption)
                                .foregroundColor(.appTextSecondary)
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top)
            }
            
            Spacer()
        }
    }
    
    // MARK: - Computed Properties
    private var canSave: Bool {
        switch selectedTab {
        case 0:
            return !weight.isEmpty && Double(weight) != nil
        case 1:
            return !bodyFat.isEmpty && Double(bodyFat) != nil
        case 2:
            return !selectedPhotos.isEmpty
        default:
            return false
        }
    }
    
    private var saveButtonText: String {
        switch selectedTab {
        case 0:
            return "Save Weight"
        case 1:
            return "Save Body Fat"
        case 2:
            return selectedPhotos.count > 1 ? "Upload \(selectedPhotos.count) Photos" : "Upload Photo"
        default:
            return "Save"
        }
    }
    
    // MARK: - Actions
    private func saveEntry() {
        guard let userId = authManager.currentUser?.id else { return }
        
        switch selectedTab {
        case 0:
            saveWeight(userId: userId)
        case 1:
            saveBodyFat(userId: userId)
        case 2:
            Task {
                await savePhotos(userId: userId)
            }
        default:
            break
        }
    }
    
    private func saveWeight(userId: String) {
        guard let weightValue = Double(weight) else { return }
        
        let weightInKg = weightUnit == "lbs" ? weightValue * 0.453592 : weightValue
        
        _ = PhotoMetadataService.shared.createOrUpdateMetrics(
            for: selectedDate,
            weight: weightInKg,
            userId: userId
        )
        
        // Update widget data
        Task {
            await WidgetDataManager.shared.updateWidgetData()
        }
        
        SyncManager.shared.syncIfNeeded()
        dismiss()
    }
    
    private func saveBodyFat(userId: String) {
        guard let bodyFatValue = Double(bodyFat) else { return }
        
        _ = PhotoMetadataService.shared.createOrUpdateMetrics(
            for: selectedDate,
            bodyFatPercentage: bodyFatValue,
            userId: userId
        )
        
        // Update widget data
        Task {
            await WidgetDataManager.shared.updateWidgetData()
        }
        
        SyncManager.shared.syncIfNeeded()
        dismiss()
    }
    
    private func savePhotos(userId: String) async {
        isProcessingPhotos = true
        photoProgress = 0
        processedCount = 0
        
        for (index, item) in selectedPhotos.enumerated() {
            do {
                // Load the photo data
                guard let data = try await item.loadTransferable(type: Data.self),
                      let image = UIImage(data: data) else {
                    continue
                }
                
                // Extract date from metadata
                let photoDate = PhotoMetadataService.shared.extractDate(from: data) ?? selectedDate
                
                // Create or get metrics for this date
                let metrics = PhotoMetadataService.shared.createOrUpdateMetrics(
                    for: photoDate,
                    userId: userId
                )
                
                // Upload the photo
                _ = try await PhotoUploadManager.shared.uploadProgressPhoto(
                    for: metrics,
                    image: image
                )
                
                processedCount = index + 1
                photoProgress = Double(processedCount) / Double(selectedPhotos.count)
                
            } catch {
                print("Failed to process photo \(index): \(error)")
            }
        }
        
        isProcessingPhotos = false
        SyncManager.shared.syncIfNeeded()
        dismiss()
    }
}

#Preview {
    AddEntrySheet(isPresented: .constant(true))
        .environmentObject(AuthManager.shared)
        .preferredColorScheme(.dark)
}