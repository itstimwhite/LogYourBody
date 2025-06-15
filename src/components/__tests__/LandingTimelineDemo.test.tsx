import { render, screen, fireEvent } from '@testing-library/react'
import { LandingTimelineDemo } from '../LandingTimelineDemo'

jest.mock('../ui/slider', () => ({
  Slider: ({ value, onValueChange }: any) => (
    <input
      data-testid="slider"
      type="range"
      value={value[0]}
      onChange={e => onValueChange([Number(e.target.value)])}
    />
  )
}))

describe('LandingTimelineDemo', () => {
  it('updates metrics when slider changes', () => {
    render(<LandingTimelineDemo />)
    expect(screen.getByText('12%')).toBeInTheDocument()
    expect(screen.getByText('164 lbs')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('slider'), { target: { value: '0' } })

    expect(screen.getByText('21%')).toBeInTheDocument()
    expect(screen.getByText('180 lbs')).toBeInTheDocument()
  })
})
