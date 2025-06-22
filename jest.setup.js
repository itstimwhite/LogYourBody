// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
  getSupabaseEnvironment: jest.fn(() => 'test'),
  validateSupabaseKeys: jest.fn(() => ({
    url: { exists: true, valid: true, value: 'https://test.supabase.co' },
    anonKey: { exists: true, valid: true, value: 'test-key' },
  })),
  testSupabaseConnection: jest.fn(() => 
    Promise.resolve({ success: true, message: 'Connected successfully' })
  ),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Add pointer events polyfill for Radix UI
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = jest.fn()
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = jest.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = jest.fn()
}

// Mock date-fns to avoid timezone issues in tests
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: (date, formatStr) => {
    const actual = jest.requireActual('date-fns')
    if (formatStr === 'yyyy-MM-dd' && typeof date === 'string') {
      return date // Return the string as-is for DB formatting
    }
    return actual.format(date, formatStr)
  }
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, exit, transition, ...restProps } = props
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('react').createElement('div', restProps, children)
    },
    button: ({ children, ...props }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...restProps } = props
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('react').createElement('button', restProps, children)
    },
    span: ({ children, ...props }) => {
      const { initial, animate, exit, transition, ...restProps } = props
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('react').createElement('span', restProps, children)
    }
  },
  AnimatePresence: ({ children }) => children
}))

// Mock Supabase profile module
jest.mock('@/lib/supabase/profile', () => ({
  getProfile: jest.fn().mockResolvedValue({
    height: 71,
    height_unit: 'ft',
    gender: 'male',
    settings: {
      units: {
        weight: 'lbs',
        height: 'ft',
        measurements: 'in'
      }
    }
  })
}))

// Mock createClient from Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null })
    }))
  }))
}))