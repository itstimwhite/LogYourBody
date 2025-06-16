import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPage from '../page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => 
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => 
      <div {...props}>{children}</div>
  }
}))

describe('DashboardPage', () => {
  const mockPush = jest.fn()
  const mockSignOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  it('redirects to login when not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('shows loading state', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders dashboard when authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    expect(screen.getByText('LogYourBody')).toBeInTheDocument()
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('displays avatar tabs correctly', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    expect(screen.getByRole('tab', { name: 'Avatar' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Photo' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
  })

  it('shows profile panel with user stats', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    expect(screen.getByText('Current Stats')).toBeInTheDocument()
    expect(screen.getByText('Weight')).toBeInTheDocument()
    expect(screen.getByText('Body Fat')).toBeInTheDocument()
    expect(screen.getByText('Lean Mass')).toBeInTheDocument()
    expect(screen.getByText('Height')).toBeInTheDocument()
    expect(screen.getByText('FFMI')).toBeInTheDocument()
  })

  it('displays timeline slider', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('navigates to log page when plus button clicked', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    const addButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    )
    
    fireEvent.click(addButton!)
    expect(mockPush).toHaveBeenCalledWith('/log')
  })

  it('navigates to settings when settings button clicked', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    const settingsButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-settings')
    )
    
    fireEvent.click(settingsButton!)
    expect(mockPush).toHaveBeenCalledWith('/settings')
  })

  it('switches between tabs correctly', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    const photoTab = screen.getByRole('tab', { name: 'Photo' })
    fireEvent.click(photoTab)
    
    await waitFor(() => {
      expect(photoTab).toHaveAttribute('data-state', 'active')
    })
  })

  it('shows avatar based on body fat percentage', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    const avatarImage = screen.getByAltText('Body silhouette at 15% body fat')
    expect(avatarImage).toBeInTheDocument()
    expect(avatarImage).toHaveAttribute('src', '/avatars/m_bf15.svg')
  })

  it('shows goals progress', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      signOut: mockSignOut
    })

    render(<DashboardPage />)
    
    expect(screen.getByText('Goals Progress')).toBeInTheDocument()
    expect(screen.getByText('Weight Goal')).toBeInTheDocument()
    expect(screen.getByText('Body Fat Goal')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })
})