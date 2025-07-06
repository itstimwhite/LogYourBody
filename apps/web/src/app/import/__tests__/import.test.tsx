import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ImportPage from '../page'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/ClerkAuthContext')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ error: null }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => ({ data: {}, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/photo.jpg' } }))
      }))
    }
  }))
}))

// Mock exifr
jest.mock('exifr', () => ({
  parse: jest.fn(() => Promise.resolve({
    DateTimeOriginal: new Date('2024-01-15')
  }))
}))

describe('ImportPage', () => {
  const mockPush = jest.fn()
  const mockUser = { id: 'test-user-id', email: 'test@example.com' }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  it('renders the import page', () => {
    render(<ImportPage />)
    
    expect(screen.getByText('Smart Import')).toBeInTheDocument()
    expect(screen.getByText('Upload Your Files')).toBeInTheDocument()
  })

  it('shows file type information', () => {
    render(<ImportPage />)
    
    expect(screen.getByText('Photos (JPG, PNG, HEIC)')).toBeInTheDocument()
    expect(screen.getByText('PDFs (DEXA, InBody, etc.)')).toBeInTheDocument()
    expect(screen.getByText('Spreadsheets (CSV, Excel)')).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    render(<ImportPage />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/drop files here/i).parentElement?.querySelector('input')
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(screen.getByText('1 file selected')).toBeInTheDocument()
        expect(screen.getByText('test.jpg')).toBeInTheDocument()
      })
    }
  })

  it('shows processing status when analyzing files', async () => {
    render(<ImportPage />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/drop files here/i).parentElement?.querySelector('input')
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(screen.getByText('Process Files')).toBeInTheDocument()
      })
      
      const processButton = screen.getByText('Process Files').closest('button')
      if (processButton) {
        fireEvent.click(processButton)
        
        await waitFor(() => {
          expect(screen.getByText(/Extracting date from/i)).toBeInTheDocument()
        })
      }
    }
  })

  it('redirects to login if user is not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    })
    
    render(<ImportPage />)
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})