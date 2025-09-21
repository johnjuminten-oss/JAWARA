import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'
import '@testing-library/jest-dom'

// Extend vitest's expect with @testing-library/jest-dom's matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock Supabase Client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    })
  })
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn()
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
