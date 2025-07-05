import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SMSLogin } from '../SMSLogin'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}))

describe('SMSLogin', () => {
  const mockSignInWithOtp = jest.fn()
  const mockVerifyOtp = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithOtp: mockSignInWithOtp,
        verifyOtp: mockVerifyOtp
      }
    })
  })

  it('renders phone number input initially', () => {
    render(<SMSLogin />)
    
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument()
  })

  it('formats US phone number correctly', () => {
    render(<SMSLogin />)
    
    const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
    fireEvent.change(phoneInput, { target: { value: '5551234567' } })
    
    expect(phoneInput).toHaveValue('(555) 123-4567')
  })

  it('validates phone number before sending OTP', async () => {
    render(<SMSLogin />)
    
    const sendButton = screen.getByRole('button', { name: /send code/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })
  })

  it('sends OTP with correct phone number format', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<SMSLogin />)
    
    const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
    fireEvent.change(phoneInput, { target: { value: '5551234567' } })
    
    const sendButton = screen.getByRole('button', { name: /send code/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        phone: '+15551234567',
        options: { channel: 'sms' }
      })
    })
  })

  it('shows OTP input after successful send', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<SMSLogin />)
    
    const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
    fireEvent.change(phoneInput, { target: { value: '5551234567' } })
    
    const sendButton = screen.getByRole('button', { name: /send code/i })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
    })
  })

  it('validates OTP length before verification', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<SMSLogin />)
    
    // Send OTP first
    const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
    fireEvent.change(phoneInput, { target: { value: '5551234567' } })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
    })
    
    // Try to verify with incomplete OTP
    const otpInput = screen.getByPlaceholderText('000000')
    fireEvent.change(otpInput, { target: { value: '123' } })
    
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    expect(verifyButton).toBeDisabled()
  })

  it('verifies OTP and calls onSuccess', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({ error: null })
    
    render(<SMSLogin onSuccess={mockOnSuccess} />)
    
    // Send OTP
    const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
    fireEvent.change(phoneInput, { target: { value: '5551234567' } })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
    })
    
    // Enter and verify OTP
    const otpInput = screen.getByPlaceholderText('000000')
    fireEvent.change(otpInput, { target: { value: '123456' } })
    
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: '+15551234567',
        token: '123456',
        type: 'sms'
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles errors gracefully', async () => {
    const error = { message: 'Invalid phone number' }
    mockSignInWithOtp.mockResolvedValue({ error })
    
    render(<SMSLogin />)
    
    const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
    fireEvent.change(phoneInput, { target: { value: '5551234567' } })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Invalid phone number',
        variant: 'destructive'
      })
    })
  })

  it('allows changing phone number from OTP step', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<SMSLogin />)
    
    // Send OTP
    const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
    fireEvent.change(phoneInput, { target: { value: '5551234567' } })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument()
    })
    
    // Click change number
    const changeButton = screen.getByRole('button', { name: /change number/i })
    fireEvent.click(changeButton)
    
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument()
  })

  it('renders minimal version without card wrapper', () => {
    render(<SMSLogin minimal />)
    
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.queryByText(/sign in with sms/i)).not.toBeInTheDocument()
  })
})