'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Camera,
  Upload,
  Image as ImageIcon,
  Weight,
  Percent,
  Trash2,
  Info,
  X,
  Loader2,
  Grid3x3,
  LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import Image from 'next/image'

type ProgressPhoto = {
  id: string
  url: string
  thumbnail_url: string
  uploaded_at: string
  body_metrics_id?: string
  weight?: number
  body_fat_percentage?: number
  notes?: string
}

type ViewMode = 'grid' | 'comparison'

export default function PhotosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      loadPhotos()
    }
  }, [user, loading, router])

  const loadPhotos = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockPhotos: ProgressPhoto[] = [
        {
          id: '1',
          url: '/placeholder.svg',
          thumbnail_url: '/placeholder.svg',
          uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 166.5,
          body_fat_percentage: 18.2,
          notes: 'Feeling stronger!'
        },
        {
          id: '2',
          url: '/placeholder.svg',
          thumbnail_url: '/placeholder.svg',
          uploaded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 168,
          body_fat_percentage: 17.8
        },
        {
          id: '3',
          url: '/placeholder.svg',
          thumbnail_url: '/placeholder.svg',
          uploaded_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 169.3,
          body_fat_percentage: 17.5,
          notes: 'Great pump today'
        },
        {
          id: '4',
          url: '/placeholder.svg',
          thumbnail_url: '/placeholder.svg',
          uploaded_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 170,
          body_fat_percentage: 17.2
        }
      ]
      
      setPhotos(mockPhotos)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load photos. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, or WebP image.",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB.",
        variant: "destructive"
      })
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    setShowUploadDialog(true)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadProgress(i)
      }

      // Create new photo entry
      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        url: preview!,
        thumbnail_url: preview!,
        uploaded_at: new Date().toISOString()
      }

      setPhotos(prev => [newPhoto, ...prev])
      
      toast({
        title: "Success!",
        description: "Photo uploaded successfully."
      })

      setShowUploadDialog(false)
      setSelectedFile(null)
      setPreview(null)
    } catch {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId)
      }
      if (prev.length >= 2) {
        // Max 2 photos for comparison
        return [prev[1], photoId]
      }
      return [...prev, photoId]
    })
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setSelectedPhotos(prev => prev.filter(id => id !== photoId))
      
      toast({
        title: "Photo deleted",
        description: "The photo has been removed."
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive"
      })
    }
  }

  const selectedPhotoObjects = selectedPhotos.map(id => photos.find(p => p.id === id)).filter(Boolean) as ProgressPhoto[]

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-bg">
        <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Header */}
      <header className="bg-linear-card shadow-sm border-b border-linear-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-linear-text">Progress Photos</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-linear-border/30 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-linear-card text-linear-text' 
                      : 'text-linear-text-secondary'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('comparison')}
                  className={`p-2 rounded ${
                    viewMode === 'comparison' 
                      ? 'bg-linear-card text-linear-text' 
                      : 'text-linear-text-secondary'
                  }`}
                  aria-label="Comparison view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              
              {/* Upload Button */}
              <Button 
                onClick={() => document.getElementById('photo-upload')?.click()}
                size="sm"
                className="bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <Card className="bg-linear-card border-linear-border">
            <CardContent className="py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-linear-purple/10 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-linear-purple" />
              </div>
              <h2 className="text-xl font-semibold text-linear-text mb-2">
                No photos yet
              </h2>
              <p className="text-linear-text-secondary mb-6 max-w-sm mx-auto">
                Start documenting your progress by taking your first photo.
              </p>
              <Button 
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take First Photo
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card 
                key={photo.id}
                className="bg-linear-card border-linear-border overflow-hidden group cursor-pointer"
                onClick={() => togglePhotoSelection(photo.id)}
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={photo.url}
                    alt="Progress photo"
                    fill
                    className="object-cover"
                  />
                  
                  {/* Selection indicator */}
                  {selectedPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-linear-purple/20 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-linear-purple flex items-center justify-center">
                        <span className="text-white font-bold">
                          {selectedPhotos.indexOf(photo.id) + 1}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePhoto(photo.id)
                        }}
                        className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-white">
                      <div className="text-sm">
                        {format(new Date(photo.uploaded_at), 'MMM d, yyyy')}
                      </div>
                      {photo.weight && (
                        <div className="flex items-center gap-1 text-xs">
                          <Weight className="h-3 w-3" />
                          {photo.weight} kg
                        </div>
                      )}
                      {photo.body_fat_percentage && (
                        <div className="flex items-center gap-1 text-xs">
                          <Percent className="h-3 w-3" />
                          {photo.body_fat_percentage}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Comparison View
          <div className="space-y-6">
            {/* Instructions */}
            <Alert className="border-linear-border bg-linear-card">
              <Info className="h-4 w-4 text-linear-text" />
              <AlertDescription className="text-linear-text-secondary">
                Select up to 2 photos to compare your progress side by side.
              </AlertDescription>
            </Alert>

            {/* Comparison Display */}
            {selectedPhotos.length === 2 ? (
              <Card className="bg-linear-card border-linear-border p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedPhotoObjects.map((photo, index) => (
                    <div key={photo.id} className="space-y-4">
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={`Progress photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-lg font-medium text-linear-text">
                            {format(new Date(photo.uploaded_at), 'MMM d, yyyy')}
                          </div>
                          {index === 0 && selectedPhotoObjects[1] && (
                            <div className="text-sm text-linear-text-secondary">
                              {differenceInDays(
                                new Date(selectedPhotoObjects[1].uploaded_at),
                                new Date(photo.uploaded_at)
                              )} days ago
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {photo.weight && (
                            <div className="bg-linear-bg rounded-lg p-2 text-center">
                              <div className="text-linear-text-secondary">Weight</div>
                              <div className="font-medium text-linear-text">
                                {photo.weight} kg
                              </div>
                            </div>
                          )}
                          {photo.body_fat_percentage && (
                            <div className="bg-linear-bg rounded-lg p-2 text-center">
                              <div className="text-linear-text-secondary">Body Fat</div>
                              <div className="font-medium text-linear-text">
                                {photo.body_fat_percentage}%
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {photo.notes && (
                          <div className="text-sm text-linear-text-secondary italic">
                            "{photo.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress Summary */}
                {selectedPhotoObjects[0].weight && selectedPhotoObjects[1].weight && (
                  <div className="mt-6 pt-6 border-t border-linear-border">
                    <h3 className="font-medium text-linear-text mb-3">Progress Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-linear-bg rounded-lg p-3">
                        <div className="text-sm text-linear-text-secondary mb-1">Weight Change</div>
                        <div className="font-medium text-linear-text">
                          {(selectedPhotoObjects[1].weight - selectedPhotoObjects[0].weight).toFixed(1)} kg
                        </div>
                      </div>
                      {selectedPhotoObjects[0].body_fat_percentage && selectedPhotoObjects[1].body_fat_percentage && (
                        <div className="bg-linear-bg rounded-lg p-3">
                          <div className="text-sm text-linear-text-secondary mb-1">Body Fat Change</div>
                          <div className="font-medium text-linear-text">
                            {(selectedPhotoObjects[1].body_fat_percentage - selectedPhotoObjects[0].body_fat_percentage).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="bg-linear-card border-linear-border">
                <CardContent className="py-12 text-center">
                  <p className="text-linear-text-secondary">
                    Select 2 photos from the grid below to compare
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Photo Grid for Selection */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => togglePhotoSelection(photo.id)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedPhotos.includes(photo.id)
                      ? 'border-linear-purple'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={photo.thumbnail_url}
                    alt="Progress photo thumbnail"
                    fill
                    className="object-cover"
                  />
                  {selectedPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-linear-purple/20 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-linear-purple flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {selectedPhotos.indexOf(photo.id) + 1}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                    <div className="text-xs text-white text-center">
                      {format(new Date(photo.uploaded_at), 'MMM d')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-linear-card border-linear-border w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-linear-text">Upload Photo</h2>
                <button
                  onClick={() => {
                    setShowUploadDialog(false)
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="text-linear-text-secondary hover:text-linear-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {preview && (
                <div className="mb-4">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {isUploading ? (
                <div className="space-y-3">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-linear-text-secondary">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-linear-border bg-linear-card">
                    <Info className="h-4 w-4 text-linear-text" />
                    <AlertDescription className="text-linear-text-secondary text-sm">
                      Tip: Take photos in consistent lighting and poses for better comparisons.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowUploadDialog(false)
                        setSelectedFile(null)
                        setPreview(null)
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      className="flex-1 bg-linear-purple hover:bg-linear-purple/80 text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}