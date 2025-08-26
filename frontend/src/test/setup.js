import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock DOM methods not available in jsdom
Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
})

// Mock API for tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: 'healthy' }),
  })
)

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8000'
  },
  writable: true
})
