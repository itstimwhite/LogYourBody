import Foundation
import CoreData

class CoreDataManager: ObservableObject {
    static let shared = CoreDataManager()
    
    private let saveQueue = DispatchQueue(label: "com.logyourbody.coredata.save", qos: .utility)
    private var isSaving = false
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "LogYourBody")
        
        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Unable to load persistent stores: \(error)")
            }
            
            // Enable automatic lightweight migration
            description.shouldMigrateStoreAutomatically = true
            description.shouldInferMappingModelAutomatically = true
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
        return container
    }()
    
    var viewContext: NSManagedObjectContext {
        persistentContainer.viewContext
    }
    
    private init() {}
    
    // MARK: - Save Context
    func save() {
        saveQueue.async { [weak self] in
            guard let self = self else { return }
            
            // Prevent recursive saves
            guard !self.isSaving else {
                print("⚠️ Prevented recursive Core Data save")
                return
            }
            
            self.isSaving = true
            defer { self.isSaving = false }
            
            let context = self.viewContext
            
            // Perform save on the context's queue
            context.performAndWait {
                if context.hasChanges {
                    do {
                        try context.save()
                    } catch {
                        print("Failed to save Core Data context: \(error)")
                    }
                }
            }
        }
    }
    
    // MARK: - Body Metrics Operations
    func saveBodyMetrics(_ metrics: BodyMetrics, userId: String) {
        let context = viewContext
        
        // Check if entry already exists
        let fetchRequest: NSFetchRequest<CachedBodyMetrics> = CachedBodyMetrics.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", metrics.id)
        
        do {
            let results = try context.fetch(fetchRequest)
            let cached: CachedBodyMetrics
            
            if let existing = results.first {
                cached = existing
            } else {
                cached = CachedBodyMetrics(context: context)
                cached.id = metrics.id
                cached.createdAt = metrics.createdAt
            }
            
            // Update values
            cached.userId = userId
            cached.date = metrics.date
            cached.weight = metrics.weight ?? 0
            cached.weightUnit = metrics.weightUnit
            cached.bodyFatPercentage = metrics.bodyFatPercentage ?? 0
            cached.bodyFatMethod = metrics.bodyFatMethod
            cached.muscleMass = metrics.muscleMass ?? 0
            cached.boneMass = metrics.boneMass ?? 0
            cached.notes = metrics.notes
            cached.updatedAt = Date()
            cached.lastModified = Date()
            cached.isSynced = false
            cached.syncStatus = "pending"
            cached.isMarkedDeleted = false
            
            save()
        } catch {
            print("Failed to save body metrics: \(error)")
        }
    }
    
    func fetchBodyMetrics(for userId: String, from startDate: Date? = nil, to endDate: Date? = nil) -> [CachedBodyMetrics] {
        let fetchRequest: NSFetchRequest<CachedBodyMetrics> = CachedBodyMetrics.fetchRequest()
        
        var predicates = [NSPredicate]()
        predicates.append(NSPredicate(format: "userId == %@", userId))
        predicates.append(NSPredicate(format: "isMarkedDeleted == %@", NSNumber(value: false)))
        
        if let start = startDate {
            predicates.append(NSPredicate(format: "date >= %@", start as NSDate))
        }
        if let end = endDate {
            predicates.append(NSPredicate(format: "date <= %@", end as NSDate))
        }
        
        fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]
        
        do {
            return try viewContext.fetch(fetchRequest)
        } catch {
            print("Failed to fetch body metrics: \(error)")
            return []
        }
    }
    
    // MARK: - Daily Metrics Operations
    func saveDailyMetrics(_ metrics: DailyMetrics, userId: String) {
        let context = viewContext
        
        let fetchRequest: NSFetchRequest<CachedDailyMetrics> = CachedDailyMetrics.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@ OR (userId == %@ AND date == %@)", 
                                           metrics.id, userId, metrics.date as NSDate)
        
        do {
            let results = try context.fetch(fetchRequest)
            let cached: CachedDailyMetrics
            
            if let existing = results.first {
                cached = existing
            } else {
                cached = CachedDailyMetrics(context: context)
                cached.id = metrics.id
                cached.createdAt = metrics.createdAt
            }
            
            cached.userId = userId
            cached.date = metrics.date
            cached.steps = Int32(metrics.steps ?? 0)
            cached.notes = metrics.notes
            cached.updatedAt = Date()
            cached.lastModified = Date()
            cached.isSynced = false
            cached.syncStatus = "pending"
            cached.isMarkedDeleted = false
            
            save()
        } catch {
            print("Failed to save daily metrics: \(error)")
        }
    }
    
    func fetchDailyMetrics(for userId: String, date: Date) -> CachedDailyMetrics? {
        let fetchRequest: NSFetchRequest<CachedDailyMetrics> = CachedDailyMetrics.fetchRequest()
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        fetchRequest.predicate = NSPredicate(format: "userId == %@ AND date >= %@ AND date < %@ AND isMarkedDeleted == %@",
                                           userId, startOfDay as NSDate, endOfDay as NSDate, NSNumber(value: false))
        fetchRequest.fetchLimit = 1
        
        do {
            return try viewContext.fetch(fetchRequest).first
        } catch {
            print("Failed to fetch daily metrics: \(error)")
            return nil
        }
    }
    
    // MARK: - Profile Operations
    func saveProfile(_ profile: UserProfile, userId: String, email: String) {
        let context = viewContext
        
        let fetchRequest: NSFetchRequest<CachedProfile> = CachedProfile.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", userId)
        
        do {
            let results = try context.fetch(fetchRequest)
            let cached: CachedProfile
            
            if let existing = results.first {
                cached = existing
            } else {
                cached = CachedProfile(context: context)
                cached.id = userId
                cached.createdAt = Date()
            }
            
            cached.email = email
            cached.fullName = profile.fullName
            cached.username = profile.username
            cached.dateOfBirth = profile.dateOfBirth
            cached.height = profile.height ?? 0
            cached.heightUnit = profile.heightUnit
            cached.gender = profile.gender
            cached.activityLevel = profile.activityLevel
            cached.goalWeight = profile.goalWeight ?? 0
            cached.goalWeightUnit = profile.goalWeightUnit
            cached.updatedAt = Date()
            cached.lastModified = Date()
            cached.isSynced = false
            cached.syncStatus = "pending"
            cached.isMarkedDeleted = false
            
            save()
        } catch {
            print("Failed to save profile: \(error)")
        }
    }
    
    func fetchProfile(for userId: String) -> CachedProfile? {
        let fetchRequest: NSFetchRequest<CachedProfile> = CachedProfile.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@ AND isMarkedDeleted == %@", userId, NSNumber(value: false))
        fetchRequest.fetchLimit = 1
        
        do {
            return try viewContext.fetch(fetchRequest).first
        } catch {
            print("Failed to fetch profile: \(error)")
            return nil
        }
    }
    
    // MARK: - Sync Operations
    func fetchUnsyncedEntries() -> (bodyMetrics: [CachedBodyMetrics], dailyMetrics: [CachedDailyMetrics], profiles: [CachedProfile]) {
        let bodyMetricsFetch: NSFetchRequest<CachedBodyMetrics> = CachedBodyMetrics.fetchRequest()
        bodyMetricsFetch.predicate = NSPredicate(format: "isSynced == %@", NSNumber(value: false))
        
        let dailyMetricsFetch: NSFetchRequest<CachedDailyMetrics> = CachedDailyMetrics.fetchRequest()
        dailyMetricsFetch.predicate = NSPredicate(format: "isSynced == %@", NSNumber(value: false))
        
        let profilesFetch: NSFetchRequest<CachedProfile> = CachedProfile.fetchRequest()
        profilesFetch.predicate = NSPredicate(format: "isSynced == %@", NSNumber(value: false))
        
        do {
            let bodyMetrics = try viewContext.fetch(bodyMetricsFetch)
            let dailyMetrics = try viewContext.fetch(dailyMetricsFetch)
            let profiles = try viewContext.fetch(profilesFetch)
            
            return (bodyMetrics, dailyMetrics, profiles)
        } catch {
            print("Failed to fetch unsynced entries: \(error)")
            return ([], [], [])
        }
    }
    
    func markAsSynced(entityName: String, id: String) {
        let context = viewContext
        
        switch entityName {
        case "CachedBodyMetrics":
            let fetchRequest: NSFetchRequest<CachedBodyMetrics> = CachedBodyMetrics.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", id)
            if let entry = try? context.fetch(fetchRequest).first {
                entry.isSynced = true
                entry.syncStatus = "synced"
            }
            
        case "CachedDailyMetrics":
            let fetchRequest: NSFetchRequest<CachedDailyMetrics> = CachedDailyMetrics.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", id)
            if let entry = try? context.fetch(fetchRequest).first {
                entry.isSynced = true
                entry.syncStatus = "synced"
            }
            
        case "CachedProfile":
            let fetchRequest: NSFetchRequest<CachedProfile> = CachedProfile.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", id)
            if let entry = try? context.fetch(fetchRequest).first {
                entry.isSynced = true
                entry.syncStatus = "synced"
            }
            
        default:
            break
        }
        
        save()
    }
    
    func updateSyncStatus(entityName: String, id: String, status: String, error: String? = nil) {
        let metadata = fetchOrCreateSyncMetadata(entityName: entityName, entityId: id)
        metadata.lastSyncAttempt = Date()
        
        if status == "synced" {
            metadata.lastSyncSuccess = Date()
            metadata.syncRetryCount = 0
            metadata.lastSyncError = nil
        } else {
            metadata.syncRetryCount += 1
            metadata.lastSyncError = error
        }
        
        save()
    }
    
    private func fetchOrCreateSyncMetadata(entityName: String, entityId: String) -> SyncMetadata {
        let fetchRequest: NSFetchRequest<SyncMetadata> = SyncMetadata.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "entityName == %@ AND entityId == %@", entityName, entityId)
        fetchRequest.fetchLimit = 1
        
        if let existing = try? viewContext.fetch(fetchRequest).first {
            return existing
        }
        
        let metadata = SyncMetadata(context: viewContext)
        metadata.entityName = entityName
        metadata.entityId = entityId
        metadata.syncRetryCount = 0
        
        return metadata
    }
    
    // MARK: - Cleanup Operations
    func cleanupDeletedEntries(olderThan date: Date) {
        let bodyMetricsFetch: NSFetchRequest<NSFetchRequestResult> = CachedBodyMetrics.fetchRequest()
        bodyMetricsFetch.predicate = NSPredicate(format: "isMarkedDeleted == %@ AND lastModified < %@", 
                                                NSNumber(value: true), date as NSDate)
        
        let dailyMetricsFetch: NSFetchRequest<NSFetchRequestResult> = CachedDailyMetrics.fetchRequest()
        dailyMetricsFetch.predicate = NSPredicate(format: "isMarkedDeleted == %@ AND lastModified < %@", 
                                                 NSNumber(value: true), date as NSDate)
        
        let deleteBodyMetrics = NSBatchDeleteRequest(fetchRequest: bodyMetricsFetch)
        let deleteDailyMetrics = NSBatchDeleteRequest(fetchRequest: dailyMetricsFetch)
        
        do {
            try viewContext.execute(deleteBodyMetrics)
            try viewContext.execute(deleteDailyMetrics)
            save()
        } catch {
            print("Failed to cleanup deleted entries: \(error)")
        }
    }
    
    // MARK: - Delete All Data
    
    func deleteAllData() {
        let context = viewContext
        
        // Delete all body metrics
        let bodyMetricsRequest: NSFetchRequest<CachedBodyMetrics> = CachedBodyMetrics.fetchRequest()
        if let bodyMetrics = try? context.fetch(bodyMetricsRequest) {
            for metric in bodyMetrics {
                context.delete(metric)
            }
        }
        
        // Delete all daily metrics
        let dailyMetricsRequest: NSFetchRequest<CachedDailyMetrics> = CachedDailyMetrics.fetchRequest()
        if let dailyMetrics = try? context.fetch(dailyMetricsRequest) {
            for metric in dailyMetrics {
                context.delete(metric)
            }
        }
        
        // Delete all profiles
        let profileRequest: NSFetchRequest<CachedProfile> = CachedProfile.fetchRequest()
        if let profiles = try? context.fetch(profileRequest) {
            for profile in profiles {
                context.delete(profile)
            }
        }
        
        // Delete all sync metadata
        let syncRequest: NSFetchRequest<SyncMetadata> = SyncMetadata.fetchRequest()
        if let syncRecords = try? context.fetch(syncRequest) {
            for record in syncRecords {
                context.delete(record)
            }
        }
        
        // Save changes
        save()
    }
}

// MARK: - Model Extensions for Conversion
extension CachedBodyMetrics {
    func toBodyMetrics() -> BodyMetrics {
        return BodyMetrics(
            id: id ?? UUID().uuidString,
            userId: userId ?? "",
            date: date ?? Date(),
            weight: weight > 0 ? weight : nil,
            weightUnit: weightUnit,
            bodyFatPercentage: bodyFatPercentage > 0 ? bodyFatPercentage : nil,
            bodyFatMethod: bodyFatMethod,
            muscleMass: muscleMass > 0 ? muscleMass : nil,
            boneMass: boneMass > 0 ? boneMass : nil,
            notes: notes,
            createdAt: createdAt ?? Date(),
            updatedAt: updatedAt ?? Date()
        )
    }
}

extension CachedDailyMetrics {
    func toDailyMetrics() -> DailyMetrics {
        return DailyMetrics(
            id: id ?? UUID().uuidString,
            userId: userId ?? "",
            date: date ?? Date(),
            steps: steps > 0 ? Int(steps) : nil,
            notes: notes,
            createdAt: createdAt ?? Date(),
            updatedAt: updatedAt ?? Date()
        )
    }
}

extension CachedProfile {
    func toUserProfile() -> UserProfile {
        return UserProfile(
            id: id ?? "",
            email: email ?? "",
            username: username,
            fullName: fullName,
            dateOfBirth: dateOfBirth,
            height: height > 0 ? height : nil,
            heightUnit: heightUnit,
            gender: gender,
            activityLevel: activityLevel,
            goalWeight: goalWeight > 0 ? goalWeight : nil,
            goalWeightUnit: goalWeightUnit
        )
    }
}