import { render, screen } from '@testing-library/react'
import { DataStat } from '../DataStat'
import { Zap } from 'lucide-react'

describe('DataStat', () => {
  it('renders value and label', () => {
    render(<DataStat value="123" label="Test" />)
    expect(screen.getByText('123')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<DataStat icon={<Zap data-testid="icon" />} value="5" label="Zap" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
