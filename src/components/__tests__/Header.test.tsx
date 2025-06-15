import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'

// Mock FeaturesFlyout
jest.mock('../FeaturesFlyout', () => ({
  FeaturesFlyout: ({ onFeatureClick }: any) => (
    <div data-testid="features-flyout" onClick={() => onFeatureClick?.('test')}>
      Features
    </div>
  )
}))

describe('Header', () => {
  it('renders the logo', () => {
    render(<Header />)
    
    expect(screen.getByText('LogYourBody')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders appropriate CTA buttons based on environment', () => {
    // In test environment (non-production), should show actual CTAs
    render(<Header />)
    
    expect(screen.getByText('Learn More')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    
    // Should not have Coming Soon button in non-production
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument()
  })

  it('shows features flyout when showFeatures is true', () => {
    render(<Header showFeatures={true} />)
    
    expect(screen.getByTestId('features-flyout')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('hides features flyout when showFeatures is false', () => {
    render(<Header showFeatures={false} />)
    
    expect(screen.queryByTestId('features-flyout')).not.toBeInTheDocument()
    expect(screen.queryByText('Pricing')).not.toBeInTheDocument()
  })

  it('calls onFeatureClick when provided', () => {
    const mockOnFeatureClick = jest.fn()
    render(<Header showFeatures={true} onFeatureClick={mockOnFeatureClick} />)
    
    fireEvent.click(screen.getByTestId('features-flyout'))
    expect(mockOnFeatureClick).toHaveBeenCalledWith('test')
  })

  it('has proper accessibility attributes', () => {
    render(<Header />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})