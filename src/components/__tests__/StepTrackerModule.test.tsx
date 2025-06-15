import { render, screen } from '@testing-library/react'
import { StepTrackerSection } from '../StepTrackerModule'

describe('StepTrackerSection', () => {
  it('renders weekly overview', () => {
    render(<StepTrackerSection />)
    expect(screen.getByText('Movement matters.')).toBeInTheDocument()
    expect(screen.getByText('We track it all.')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
  })
})
