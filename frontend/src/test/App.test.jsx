import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('DocBot AI')).toBeInTheDocument()
  })

  it('renders the login welcome message', () => {
    render(<App />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('renders the login form description', () => {
    render(<App />)
    expect(screen.getByText('Sign in to your DocBot AI account')).toBeInTheDocument()
  })

  it('renders the email input field', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('renders the password input field', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('renders the sign in button', () => {
    render(<App />)
    expect(screen.getByText('🔐 Sign In')).toBeInTheDocument()
  })

  it('renders the sign up link', () => {
    render(<App />)
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })
})
