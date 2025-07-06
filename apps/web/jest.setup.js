// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Check if we're in Node environment
const isNode = typeof window === 'undefined'

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

// Mock Clerk Next.js only if not in Node environment
if (!isNode) {
  jest.mock('@clerk/nextjs', () => ({
    useUser: jest.fn(() => ({
      user: null,
      isLoaded: true,
    })),
    useAuth: jest.fn(() => ({
      signOut: jest.fn(),
      getToken: jest.fn(() => Promise.resolve('test-token')),
    })),
    useSignIn: jest.fn(() => ({
      signIn: {
        create: jest.fn(() => Promise.resolve({
          status: 'complete',
          createdSessionId: 'test-session-id',
        })),
        authenticateWithRedirect: jest.fn(),
      },
    })),
    useSignUp: jest.fn(() => ({
      signUp: {
        create: jest.fn(() => Promise.resolve({
          status: 'complete',
          createdSessionId: 'test-session-id',
        })),
      },
    })),
    useClerk: jest.fn(() => ({
      setActive: jest.fn(),
    })),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  }))
}

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

// Mock indexedDB if it's not defined
if (typeof indexedDB === 'undefined' && typeof global !== 'undefined') {
  global.indexedDB = {
    open: jest.fn(() => ({
      onsuccess: jest.fn(),
      onerror: jest.fn(),
      onupgradeneeded: jest.fn(),
    })),
  } as any
}

// Mock window.matchMedia only if window is defined
if (typeof window !== 'undefined') {
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
  
  // Also add window.location.origin for tests
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'http://localhost:3000',
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  })
}

// Add pointer events polyfill for Radix UI only if Element is defined
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = jest.fn()
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = jest.fn()
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = jest.fn()
  }
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
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    })),
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
  })),
}))