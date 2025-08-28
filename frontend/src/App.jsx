import React, { useState, useRef, useEffect } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import LoadingSpinner from './components/LoadingSpinner'
import StatusIndicator from './components/StatusIndicator'
import FileUpload from './components/FileUpload'
import DocumentManager from './components/DocumentManager'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import APIService from './services/api'
import authService from './services/authService'

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLogin, setShowLogin] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you find information from documents. Upload your own PDF or use the default medical encyclopedia. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [currentIndex, setCurrentIndex] = useState('langchain-integration-index')
  const [notification, setNotification] = useState(null)
  const messagesEndRef = useRef(null)

  // Check authentication on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    if (authService.isAuthenticated()) {
      try {
        const user = await authService.getCurrentUser()
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to get user info:', error)
        authService.logout()
        setIsAuthenticated(false)
        setCurrentUser(null)
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Auto-hide notifications after 5 seconds
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  // Authentication handlers
  const handleSignup = async (userData) => {
    setAuthLoading(true)
    try {
      await authService.signup(userData)
      showNotification('Account created successfully! Please sign in.', 'success')
      setShowLogin(true)
    } catch (error) {
      showNotification(error.message, 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogin = async (credentials) => {
    setAuthLoading(true)
    try {
      await authService.login(credentials)
      const user = await authService.getCurrentUser()
      setCurrentUser(user)
      setIsAuthenticated(true)
      showNotification(`Welcome back, ${user.username}!`, 'success')
    } catch (error) {
      showNotification(error.message, 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setShowLogin(true)
    showNotification('Logged out successfully', 'info')
    // Reset chat
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you find information from documents. Upload your own PDF or use the default medical encyclopedia. What would you like to know?',
        timestamp: new Date()
      }
    ])
  }

  const handleUploadSuccess = (result) => {
    showNotification(`Successfully uploaded ${result.details.filename}! Created ${result.details.text_chunks} text chunks.`, 'success')
    setShowUpload(false)
    
    // Switch to the newly created index
    if (result.details.index_name) {
      setCurrentIndex(result.details.index_name)
    }
  }

  const handleUploadError = (error) => {
    showNotification(error, 'error')
  }

  const handleIndexSwitch = (indexName) => {
    setCurrentIndex(indexName)
    showNotification(`Switched to document: ${indexName}`, 'success')
  }

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim()) return

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      // Call the actual backend API
      const response = await APIService.sendMessage(userMessage)
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.result,
        sourceDocuments: response.sourceDocuments,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        isError: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you find information from documents. Upload your own PDF or use the default medical encyclopedia. What would you like to know?',
        timestamp: new Date()
      }
    ])
  }

  // Show authentication forms if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">DocBot AI</h1>
            <p className="text-gray-400 text-lg">Intelligent Document Assistant</p>
          </div>

          {/* Auth Forms */}
          {showLogin ? (
            <LoginForm 
              onLogin={handleLogin}
              onSwitchToSignup={() => setShowLogin(false)}
              isLoading={authLoading}
            />
          ) : (
            <SignupForm 
              onSignup={handleSignup}
              onSwitchToLogin={() => setShowLogin(true)}
              isLoading={authLoading}
            />
          )}

          {/* Notification */}
          {notification && (
            <div className={`
              mt-6 p-4 rounded-lg border-l-4 backdrop-blur-sm
              ${notification.type === 'success' 
                ? 'bg-green-900/30 border-green-400 text-green-300' 
                : notification.type === 'error'
                ? 'bg-red-900/30 border-red-400 text-red-300'
                : 'bg-blue-900/30 border-blue-400 text-blue-300'
              }
            `}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotification(null)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main app interface (authenticated users)
  return (
    <div className="flex flex-col h-screen w-full overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-2xl border-b border-gray-700">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">DocBot AI</h1>
                <p className="text-sm text-gray-300">Welcome, {currentUser?.username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-cyan-500/30 hover:border-cyan-400"
              >
                📄 Upload PDF
              </button>
              <button
                onClick={clearChat}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                🗑️ Clear Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-red-500/30 hover:border-red-400"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`
          mx-4 mt-4 p-4 rounded-lg border-l-4 backdrop-blur-sm
          ${notification.type === 'success' 
            ? 'bg-green-900/30 border-green-400 text-green-300' 
            : notification.type === 'error'
            ? 'bg-red-900/30 border-red-400 text-red-300'
            : 'bg-blue-900/30 border-blue-400 text-blue-300'
          }
        `}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {showUpload && (
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-6">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📤 Upload New Document</h3>
              <FileUpload 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📚 Manage Documents</h3>
              <DocumentManager 
                onIndexSwitch={handleIndexSwitch}
                currentIndex={currentIndex}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            <StatusIndicator />
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-600 px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner />
                    <span className="text-gray-300 text-sm">DocBot AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
