import { render, screen } from '@testing-library/react'
import { LandingPage } from '../LandingPage'

// Mock the child components
jest.mock('../Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>
}))

jest.mock('../LandingTimelineDemo', () => ({
  LandingTimelineDemo: () => <div data-testid="timeline-demo">Timeline Demo</div>
}))

jest.mock('../StepTrackerModule', () => ({
  StepTrackerSection: () => <div data-testid="step-tracker">Step Tracker</div>
}))

jest.mock('../FeaturesFlyout', () => ({
  FeaturesFlyout: ({ onFeatureClick }: { onFeatureClick?: (featureId: string) => void }) => (
    <div data-testid="features-flyout" onClick={() => onFeatureClick?.('test')}>
      Features
    </div>
  )
}))

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Track your body')).toBeInTheDocument()
    expect(screen.getByText('with precision')).toBeInTheDocument()
  })

  it('renders the navigation', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('LogYourBody')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Body Fat % Tracking')).toBeInTheDocument()
    expect(screen.getByText('FFMI Calculator')).toBeInTheDocument()
    expect(screen.getAllByText('Progress Photos').length).toBeGreaterThan(0)
    expect(screen.getByText('1-Tap Import')).toBeInTheDocument()
    expect(screen.getByText('Your Data, Private')).toBeInTheDocument()
    expect(screen.getByText('Takes 30 Seconds')).toBeInTheDocument()
  })

  it('renders the pricing section', () => {
    render(<LandingPage />)
    
    expect(screen.getByText('Less than your protein powder')).toBeInTheDocument()
    expect(screen.getByText(/\$69.99/)).toBeInTheDocument() // Default is annual
  })

  it('renders appropriate CTA buttons based on environment', () => {
    // In test environment (non-production), should show actual CTAs
    render(<LandingPage />)
    
    // In non-production, we should see actual CTAs
    expect(screen.getAllByText('Start free trial').length).toBeGreaterThan(0)
    expect(screen.getByText('Sign up now')).toBeInTheDocument()
    expect(screen.getByText('Start tracking now')).toBeInTheDocument()
    
    // Should not have Coming Soon buttons in non-production
    const comingSoonButtons = screen.queryAllByText('Coming Soon')
    expect(comingSoonButtons.length).toBe(0)
  })

  it('renders the footer', () => {
    render(<LandingPage />)
    
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders the timeline demo section', () => {
    render(<LandingPage />)
    
    expect(screen.getByTestId('timeline-demo')).toBeInTheDocument()
    expect(screen.getByText(/Your body.*s time machine/)).toBeInTheDocument()
  })

  it('renders the step tracker section', () => {
    render(<LandingPage />)
    
    expect(screen.getByTestId('step-tracker')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LandingPage />)
    
    // Check for ARIA labels
    expect(screen.getAllByRole('banner').length).toBeGreaterThan(0)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByLabelText('Skip to main content')).toBeInTheDocument()
  })

  it('renders social proof metrics', () => {
    render(<LandingPage />)
    
    // Use getAllByText for metrics that appear multiple times
    expect(screen.getAllByText('10,000+').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2M+').length).toBeGreaterThan(0)
    expect(screen.getByText('4.9/5')).toBeInTheDocument()
    expect(screen.getAllByText('30 sec').length).toBeGreaterThan(0)
  })
})