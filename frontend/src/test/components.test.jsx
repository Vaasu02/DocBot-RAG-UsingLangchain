import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ChatInput from '../components/ChatInput'
import ChatMessage from '../components/ChatMessage'
import FileUpload from '../components/FileUpload'

describe('ChatInput', () => {
  it('renders correctly', () => {
    const mockSend = vi.fn()
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />)
    
    expect(screen.getByPlaceholderText(/Ask a question about your documents/)).toBeInTheDocument()
  })

  it('calls onSendMessage when form is submitted', async () => {
    const user = userEvent.setup()
    const mockSend = vi.fn()
    render(<ChatInput onSendMessage={mockSend} isLoading={false} />)
    
    const input = screen.getByPlaceholderText(/Ask a question about your documents/)
    const submitButton = screen.getByRole('button', { type: 'submit' })
    
    await user.type(input, 'Test message')
    await user.click(submitButton)
    
    expect(mockSend).toHaveBeenCalledWith('Test message')
  })
})

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    const message = {
      id: 1,
      role: 'user',
      content: 'Hello',
      timestamp: new Date()
    }
    
    render(<ChatMessage message={message} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders assistant message correctly', () => {
    const message = {
      id: 2,
      role: 'assistant',
      content: 'Hi there!',
      timestamp: new Date()
    }
    
    render(<ChatMessage message={message} />)
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
    expect(screen.getByText('🤖')).toBeInTheDocument()
  })

  it('renders source documents when provided', () => {
    const message = {
      id: 3,
      role: 'assistant',
      content: 'Response with sources',
      timestamp: new Date(),
      sourceDocuments: [
        { page_content: 'Source content', metadata: { source: 'test.pdf' } }
      ]
    }
    
    render(<ChatMessage message={message} />)
    expect(screen.getByText('📖 Source Documents:')).toBeInTheDocument()
    expect(screen.getByText('Source content')).toBeInTheDocument()
  })
})

describe('FileUpload', () => {
  it('renders upload area', () => {
    const mockSuccess = vi.fn()
    const mockError = vi.fn()
    
    render(<FileUpload onUploadSuccess={mockSuccess} onUploadError={mockError} />)
    expect(screen.getByText('📤 Upload your PDF document')).toBeInTheDocument()
  })

  it('shows error for non-PDF files', async () => {
    const mockSuccess = vi.fn()
    const mockError = vi.fn()
    
    render(<FileUpload onUploadSuccess={mockSuccess} onUploadError={mockError} />)
    
    const fileInput = screen.getByTestId('file-input') || document.querySelector('#file-input')
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    })
    
    // Trigger the change event
    const changeEvent = new Event('change', { bubbles: true })
    fileInput.dispatchEvent(changeEvent)
    
    expect(mockError).toHaveBeenCalledWith('Please upload a PDF file only.')
  })
})
