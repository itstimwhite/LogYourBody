import { getAvatarUrl, getAvatarAltText } from '../avatar-utils'

describe('avatar-utils', () => {
  describe('getAvatarUrl', () => {
    it('returns correct URL for male with 15% body fat', () => {
      const url = getAvatarUrl('male', 15)
      expect(url).toBe('/avatars/m_bf15.svg')
    })

    it('returns correct URL for female with 25% body fat', () => {
      const url = getAvatarUrl('female', 25)
      expect(url).toBe('/avatars/f_bf25.svg')
    })

    it('rounds to nearest 5% increment', () => {
      expect(getAvatarUrl('male', 12)).toBe('/avatars/m_bf10.svg')
      expect(getAvatarUrl('male', 13)).toBe('/avatars/m_bf15.svg')
      expect(getAvatarUrl('female', 27)).toBe('/avatars/f_bf25.svg')
      expect(getAvatarUrl('female', 28)).toBe('/avatars/f_bf30.svg')
    })

    it('clamps values to valid range', () => {
      expect(getAvatarUrl('male', -5)).toBe('/avatars/m_bf5.svg')
      expect(getAvatarUrl('male', 55)).toBe('/avatars/m_bf50.svg')
      expect(getAvatarUrl('female', 0)).toBe('/avatars/f_bf5.svg')
      expect(getAvatarUrl('female', 100)).toBe('/avatars/f_bf50.svg')
    })

    it('returns null for invalid inputs', () => {
      expect(getAvatarUrl(undefined, 15)).toBeNull()
      expect(getAvatarUrl('male', undefined)).toBeNull()
      expect(getAvatarUrl('invalid' as 'male' | 'female', 15)).toBeNull()
    })

    it('returns PNG format when specified', () => {
      const url = getAvatarUrl('male', 15, 'png')
      expect(url).toBe('/avatars/m_bf15.png')
    })
  })

  describe('getAvatarAltText', () => {
    it('returns correct alt text for male', () => {
      const alt = getAvatarAltText('male', 15)
      expect(alt).toBe('Male body silhouette at 15% body fat')
    })

    it('returns correct alt text for female', () => {
      const alt = getAvatarAltText('female', 25)
      expect(alt).toBe('Female body silhouette at 25% body fat')
    })

    it('returns generic text for missing data', () => {
      expect(getAvatarAltText(undefined, 15)).toBe('Body silhouette')
      expect(getAvatarAltText('male', undefined)).toBe('Body silhouette')
      expect(getAvatarAltText(undefined, undefined)).toBe('Body silhouette')
    })
  })
})