'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  FileText,
  Image,
  Smartphone,
  Weight,
  Activity,
  AlertCircle,
  CheckCircle,
  Download,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

type ImportType = 'csv' | 'dexa' | 'photos' | 'myfitnesspal' | 'fitbit' | 'apple'

interface ImportOption {
  id: ImportType
  title: string
  description: string
  icon: any
  supported: boolean
  badge?: string
  fileTypes?: string[]
  instructions?: string[]
}

const importOptions: ImportOption[] = [
  {
    id: 'csv',
    title: 'CSV/Excel Spreadsheet',
    description: 'Import weight, body fat, and measurements from a spreadsheet',
    icon: FileSpreadsheet,
    supported: true,
    fileTypes: ['.csv', '.xlsx', '.xls'],
    instructions: [
      'Download our template or use your own',
      'Include columns: Date, Weight, Body Fat %, Waist, Hip',
      'Upload your file and we\'ll handle the rest'
    ]
  },
  {
    id: 'dexa',
    title: 'DEXA Scan PDF',
    description: 'Extract body composition data from DEXA scan reports',
    icon: FileText,
    supported: true,
    badge: 'AI-Powered',
    fileTypes: ['.pdf'],
    instructions: [
      'Upload your DEXA scan PDF report',
      'Our AI will extract key metrics',
      'Review and confirm the extracted data'
    ]
  },
  {
    id: 'photos',
    title: 'Progress Photos',
    description: 'Bulk import progress photos with automatic date detection',
    icon: Image,
    supported: true,
    fileTypes: ['.jpg', '.jpeg', '.png', '.heic'],
    instructions: [
      'Select multiple photos at once',
      'We\'ll extract dates from metadata',
      'Organize by front, side, and back angles'
    ]
  },
  {
    id: 'myfitnesspal',
    title: 'MyFitnessPal',
    description: 'Import weight history from MyFitnessPal',
    icon: Smartphone,
    supported: true,
    badge: 'Coming Soon',
    instructions: [
      'Export your data from MyFitnessPal',
      'Upload the export file',
      'Import weight and measurement history'
    ]
  },
  {
    id: 'fitbit',
    title: 'Fitbit',
    description: 'Sync weight and body fat from Fitbit scales',
    icon: Activity,
    supported: false,
    badge: 'Planned',
    instructions: []
  },
  {
    id: 'apple',
    title: 'Apple Health',
    description: 'Import data from Apple Health app',
    icon: Weight,
    supported: false,
    badge: 'Planned',
    instructions: []
  }
]

export default function ImportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ImportType>('csv')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-bg">
        <div className="animate-spin h-8 w-8 border-2 border-linear-purple border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const selectedOption = importOptions.find(opt => opt.id === selectedType)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleImport = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Import successful!",
        description: `Imported data from ${uploadedFile.name}`,
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing your data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = `Date,Weight,Weight Unit,Body Fat %,Waist,Hip,Notes
2024-01-01,180,lbs,25.5,36,40,Starting weight
2024-01-15,178,lbs,24.8,35.5,39.5,Two weeks progress
2024-02-01,175,lbs,23.5,35,39,One month update`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'logyourbody-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
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
              <h1 className="text-xl font-bold text-linear-text">Bulk Import</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Import Options List */}
          <div className="lg:col-span-1">
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Import Sources</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Choose where to import your data from
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {importOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedType(option.id)}
                      disabled={!option.supported}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        selectedType === option.id
                          ? 'bg-linear-purple/10 border border-linear-purple'
                          : 'hover:bg-linear-card/50'
                      } ${!option.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center flex-shrink-0">
                        <option.icon className="h-5 w-5 text-linear-text" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-linear-text">{option.title}</span>
                          {option.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-linear-text-secondary line-clamp-1">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Details */}
          <div className="lg:col-span-2">
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                    <selectedOption.icon className="h-6 w-6 text-linear-text" />
                  </div>
                  <div>
                    <CardTitle className="text-linear-text flex items-center gap-2">
                      {selectedOption?.title}
                      {selectedOption?.badge && (
                        <Badge variant="secondary">{selectedOption.badge}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-linear-text-secondary">
                      {selectedOption?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedOption?.supported ? (
                  <>
                    {/* Instructions */}
                    {selectedOption.instructions && selectedOption.instructions.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-medium text-linear-text">How it works:</h3>
                        <ol className="space-y-2">
                          {selectedOption.instructions.map((instruction, index) => (
                            <li key={index} className="flex gap-3 text-sm text-linear-text-secondary">
                              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-linear-purple/10 flex items-center justify-center text-xs font-medium text-linear-text">
                                {index + 1}
                              </span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Template Download for CSV */}
                    {selectedType === 'csv' && (
                      <Alert className="border-linear-border bg-linear-purple/5">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-linear-text-secondary">
                          New to CSV imports? Download our template to get started quickly.
                          <Button
                            variant="link"
                            className="text-linear-purple p-0 h-auto ml-2"
                            onClick={downloadTemplate}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download Template
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* File Upload Area */}
                    <div className="space-y-4">
                      <Label className="text-linear-text">Upload File</Label>
                      <div className="relative">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept={selectedOption.fileTypes?.join(',')}
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-linear-border rounded-lg cursor-pointer hover:bg-linear-card/50 transition-colors"
                        >
                          {uploadedFile ? (
                            <>
                              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                              <p className="text-linear-text font-medium">{uploadedFile.name}</p>
                              <p className="text-sm text-linear-text-secondary">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <Button variant="link" className="mt-2 text-linear-purple">
                                Change File
                              </Button>
                            </>
                          ) : (
                            <>
                              <Upload className="h-12 w-12 text-linear-text-tertiary mb-3" />
                              <p className="text-linear-text-secondary">
                                Drop your file here or click to browse
                              </p>
                              <p className="text-sm text-linear-text-tertiary mt-1">
                                Supported: {selectedOption.fileTypes?.join(', ')}
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Import Button */}
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                        className="border-linear-border"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={!uploadedFile || isUploading}
                        className="bg-linear-purple hover:bg-linear-purple/80"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-linear-purple/10 flex items-center justify-center mx-auto mb-4">
                      <selectedOption.icon className="h-8 w-8 text-linear-text-tertiary" />
                    </div>
                    <h3 className="text-lg font-medium text-linear-text mb-2">Coming Soon</h3>
                    <p className="text-linear-text-secondary">
                      {selectedOption?.title} import is planned for a future update.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Add missing import
import { Label } from '@/components/ui/label'