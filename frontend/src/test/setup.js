import '@testing-library/jest-dom'

// Mock API for tests
global.fetch = vi.fn()

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8000'
  },
  writable: true
})
