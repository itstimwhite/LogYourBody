import { render, screen, fireEvent } from '@testing-library/react'
import { FeaturesFlyout } from '../FeaturesFlyout'

describe('FeaturesFlyout', () => {
  it('opens the panel on click', () => {
    render(<FeaturesFlyout />)
    fireEvent.click(screen.getByRole('button', { name: /features/i }))
    expect(screen.getByText('Body Fat % Tracking')).toBeInTheDocument()
  })

  it('calls onFeatureClick when feature clicked', () => {
    const onFeatureClick = jest.fn()
    render(<FeaturesFlyout onFeatureClick={onFeatureClick} />)
    fireEvent.click(screen.getByRole('button', { name: /features/i }))
    fireEvent.click(screen.getByText('Body Fat % Tracking'))
    expect(onFeatureClick).toHaveBeenCalledWith('body-fat-tracking')
  })
})
