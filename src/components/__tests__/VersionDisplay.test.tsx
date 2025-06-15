import { render, screen } from '@testing-library/react'
import { VersionDisplay } from '../VersionDisplay'

describe('VersionDisplay', () => {
  it('shows version from env', () => {
    process.env.NEXT_PUBLIC_VERSION = '9.9.9'
    render(<VersionDisplay />)
    expect(screen.getByText('v9.9.9')).toBeInTheDocument()
  })
})
