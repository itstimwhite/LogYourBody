import { createTimelineData, getTimelineDisplayValues } from '../data-interpolation'
import { BodyMetrics, ProgressPhoto } from '@/types/body-metrics'

describe('Data Interpolation', () => {
  const mockMetrics: BodyMetrics[] = [
    {
      id: '1',
      user_id: 'user1',
      date: '2024-01-01',
      weight: 180,
      weight_unit: 'lbs',
      body_fat_percentage: 20,
      body_fat_method: 'dexa',
      lean_body_mass: 144,
      ffmi: 22.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 'user1',
      date: '2024-01-08',
      weight: 178,
      weight_unit: 'lbs',
      body_fat_percentage: 19,
      body_fat_method: 'dexa',
      lean_body_mass: 144.2,
      ffmi: 22.6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: 'user1',
      date: '2024-01-15',
      weight: 176,
      weight_unit: 'lbs',
      body_fat_percentage: 18,
      body_fat_method: 'dexa',
      lean_body_mass: 144.32,
      ffmi: 22.7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const mockPhotos: ProgressPhoto[] = [
    {
      id: '1',
      user_id: 'user1',
      date: '2024-01-01',
      photo_url: 'photo1.jpg',
      view_type: 'front',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 'user1',
      date: '2024-01-05',
      photo_url: 'photo2.jpg',
      view_type: 'front',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: 'user1',
      date: '2024-01-12',
      photo_url: 'photo3.jpg',
      view_type: 'front',
      created_at: new Date().toISOString()
    }
  ]

  describe('createTimelineData', () => {
    it('should create timeline entries from metrics only', () => {
      const timeline = createTimelineData(mockMetrics, [], 71)
      
      expect(timeline).toHaveLength(3)
      expect(timeline[0].date).toBe('2024-01-01')
      expect(timeline[0].metrics).toBeDefined()
      expect(timeline[0].photo).toBeUndefined()
      expect(timeline[0].inferredData).toBeUndefined()
    })

    it('should create timeline entries from photos only', () => {
      const timeline = createTimelineData([], mockPhotos, 71)
      
      expect(timeline).toHaveLength(3)
      expect(timeline[0].date).toBe('2024-01-01')
      expect(timeline[0].metrics).toBeUndefined()
      expect(timeline[0].photo).toBeDefined()
      expect(timeline[0].inferredData).toBeUndefined()
    })

    it('should merge metrics and photos on same date', () => {
      const timeline = createTimelineData(mockMetrics, mockPhotos, 71)
      
      // Check that 2024-01-01 has both metrics and photo
      const jan1Entry = timeline.find(e => e.date === '2024-01-01')
      expect(jan1Entry?.metrics).toBeDefined()
      expect(jan1Entry?.photo).toBeDefined()
    })

    it('should interpolate data for photos without metrics', () => {
      const timeline = createTimelineData(mockMetrics, mockPhotos, 71)
      
      // Check that 2024-01-05 has interpolated data
      const jan5Entry = timeline.find(e => e.date === '2024-01-05')
      expect(jan5Entry?.photo).toBeDefined()
      expect(jan5Entry?.metrics).toBeUndefined()
      expect(jan5Entry?.inferredData).toBeDefined()
      expect(jan5Entry?.inferredData?.isInterpolated).toBe(true)
      expect(jan5Entry?.inferredData?.confidenceLevel).toBe('high') // Within 7 days
      
      // Check interpolated values
      expect(jan5Entry?.inferredData?.weight).toBeCloseTo(178.86, 1)
      expect(jan5Entry?.inferredData?.bodyFatPercentage).toBeCloseTo(19.43, 1)
    })

    it('should calculate FFMI when height is provided', () => {
      const timeline = createTimelineData(mockMetrics, mockPhotos, 71) // 71 inches
      
      const jan5Entry = timeline.find(e => e.date === '2024-01-05')
      expect(jan5Entry?.inferredData?.ffmi).toBeDefined()
      expect(jan5Entry?.inferredData?.ffmi).toBeGreaterThan(20)
    })

    it('should not interpolate data beyond 30 days', () => {
      const distantPhoto: ProgressPhoto = {
        id: '4',
        user_id: 'user1',
        date: '2024-03-01',
        photo_url: 'photo4.jpg',
        view_type: 'front',
        created_at: new Date().toISOString()
      }
      
      const timeline = createTimelineData(mockMetrics, [...mockPhotos, distantPhoto], 71)
      
      const marchEntry = timeline.find(e => e.date === '2024-03-01')
      expect(marchEntry?.photo).toBeDefined()
      expect(marchEntry?.inferredData).toBeUndefined()
    })

    it('should sort timeline entries by date', () => {
      const unsortedMetrics = [mockMetrics[2], mockMetrics[0], mockMetrics[1]]
      const timeline = createTimelineData(unsortedMetrics, [], 71)
      
      expect(timeline[0].date).toBe('2024-01-01')
      expect(timeline[1].date).toBe('2024-01-08')
      expect(timeline[2].date).toBe('2024-01-15')
    })

    it('should assign correct confidence levels', () => {
      const metricsWithWiderRange = [
        ...mockMetrics,
        {
          id: '3',
          user_id: 'user1',
          date: '2024-01-30',
          weight: 174,
          weight_unit: 'lbs',
          body_fat_percentage: 17,
          body_fat_method: 'dexa',
          lean_body_mass: 144.42,
          ffmi: 22.8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      const photosWithDifferentGaps: ProgressPhoto[] = [
        {
          id: '1',
          user_id: 'user1',
          date: '2024-01-03', // 2 days from metrics
          photo_url: 'photo1.jpg',
          view_type: 'front',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user1',
          date: '2024-01-10', // 2 days from nearest metrics
          photo_url: 'photo2.jpg',
          view_type: 'front',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          user_id: 'user1',
          date: '2024-01-25', // 10 days from nearest metrics
          photo_url: 'photo3.jpg',
          view_type: 'front',
          created_at: new Date().toISOString()
        }
      ]
      
      const timeline = createTimelineData(metricsWithWiderRange, photosWithDifferentGaps, 71)
      
      const jan3Entry = timeline.find(e => e.date === '2024-01-03')
      expect(jan3Entry?.inferredData?.confidenceLevel).toBe('high')
      
      const jan10Entry = timeline.find(e => e.date === '2024-01-10')
      expect(jan10Entry?.inferredData?.confidenceLevel).toBe('high')
      
      const jan25Entry = timeline.find(e => e.date === '2024-01-25')
      expect(jan25Entry?.inferredData?.confidenceLevel).toBe('low')
    })
  })

  describe('getTimelineDisplayValues', () => {
    it('should return metrics values when available', () => {
      const entry = {
        date: '2024-01-01',
        metrics: mockMetrics[0]
      }
      
      const values = getTimelineDisplayValues(entry)
      
      expect(values.weight).toBe(180)
      expect(values.bodyFatPercentage).toBe(20)
      expect(values.leanBodyMass).toBe(144)
      expect(values.ffmi).toBe(22.5)
      expect(values.isInferred).toBe(false)
      expect(values.confidenceLevel).toBeUndefined()
    })

    it('should return inferred values when no metrics', () => {
      const entry = {
        date: '2024-01-05',
        inferredData: {
          weight: 179,
          bodyFatPercentage: 19.5,
          leanBodyMass: 144.1,
          ffmi: 22.55,
          isInterpolated: true,
          confidenceLevel: 'high' as const
        }
      }
      
      const values = getTimelineDisplayValues(entry)
      
      expect(values.weight).toBe(179)
      expect(values.bodyFatPercentage).toBe(19.5)
      expect(values.leanBodyMass).toBe(144.1)
      expect(values.ffmi).toBe(22.55)
      expect(values.isInferred).toBe(true)
      expect(values.confidenceLevel).toBe('high')
    })

    it('should return empty values when no data', () => {
      const entry = {
        date: '2024-01-05'
      }
      
      const values = getTimelineDisplayValues(entry)
      
      expect(values.weight).toBeUndefined()
      expect(values.bodyFatPercentage).toBeUndefined()
      expect(values.leanBodyMass).toBeUndefined()
      expect(values.ffmi).toBeUndefined()
      expect(values.isInferred).toBe(false)
      expect(values.confidenceLevel).toBeUndefined()
    })
  })
})