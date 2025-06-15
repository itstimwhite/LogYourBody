import { render, screen } from '@testing-library/react'
import { Footer } from '../Footer'

jest.mock('../VersionDisplay', () => ({
  VersionDisplay: () => <div data-testid="version">v1.0.0</div>
}))

describe('Footer', () => {
  it('renders cta and social links', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
    expect(screen.getByText('LogYourBody')).toBeInTheDocument()
    expect(screen.getByTestId('version')).toBeInTheDocument()
  })
})
