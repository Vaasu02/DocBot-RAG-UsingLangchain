import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('DocBot AI')).toBeInTheDocument()
  })

  it('renders the initial welcome message', () => {
    render(<App />)
    expect(screen.getByText(/Hello! I'm your AI assistant/)).toBeInTheDocument()
  })

  it('renders the upload PDF button', () => {
    render(<App />)
    expect(screen.getByText('📄 Upload PDF')).toBeInTheDocument()
  })

  it('renders the clear chat button', () => {
    render(<App />)
    expect(screen.getByText('🗑️ Clear Chat')).toBeInTheDocument()
  })

  it('renders the chat input', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/Ask a question about your documents/)).toBeInTheDocument()
  })
})
