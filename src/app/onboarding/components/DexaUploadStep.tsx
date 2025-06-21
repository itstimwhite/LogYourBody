'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'

export function DexaUploadStep() {
  const { nextStep, updateData, previousStep } = useOnboarding()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      
      setFile(selectedFile)
      setError(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const droppedFile = e.dataTransfer.files[0]
    
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setFile(droppedFile)
      setError(null)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
  }

  const processFile = async () => {
    if (!file) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to process PDF')
      }
      
      const data = await response.json()
      
      // Update onboarding data with parsed values
      updateData({
        weight: data.weight,
        bodyFatPercentage: data.bodyFatPercentage,
        leanMass: data.leanMass,
        fatMass: data.fatMass,
        boneMass: data.boneMass,
        scanDate: data.scanDate
      })
      
      toast({
        title: 'PDF processed successfully',
        description: 'We extracted your body composition data.',
      })
      
      nextStep()
    } catch (err) {
      console.error('Error processing PDF:', err)
      setError('Failed to process PDF. Please try again or skip this step.')
    } finally {
      setIsProcessing(false)
    }
  }

  const skipStep = () => {
    // User can manually enter data later
    nextStep()
  }

  return (
    <Card className="bg-linear-card border-linear-border">
      <CardHeader>
        <CardTitle className="text-linear-text">Upload your DEXA scan</CardTitle>
        <CardDescription className="text-linear-text-secondary">
          Support for BodySpec, DexaFit, and other providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-linear-border rounded-lg p-8 text-center cursor-pointer hover:border-linear-purple/50 transition-colors"
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-linear-text-tertiary mx-auto mb-4" />
              <p className="text-linear-text mb-2">
                Drag and drop your DEXA scan PDF here
              </p>
              <p className="text-sm text-linear-text-secondary">
                or click to browse
              </p>
            </label>
          </div>
        ) : (
          <div className="bg-linear-bg rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-linear-purple" />
              <div>
                <p className="text-linear-text font-medium">{file.name}</p>
                <p className="text-sm text-linear-text-secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-linear-text-secondary">
          We'll extract your body composition data automatically from the PDF.
        </p>

        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={previousStep}
            disabled={isProcessing}
          >
            Back
          </Button>
          
          <Button
            variant="outline"
            onClick={skipStep}
            disabled={isProcessing}
            className="ml-auto"
          >
            Skip for now
          </Button>
          
          <Button
            onClick={processFile}
            disabled={!file || isProcessing}
            className="bg-linear-purple hover:bg-linear-purple/90 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upload PDF'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}