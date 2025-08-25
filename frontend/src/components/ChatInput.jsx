import React, { useState, useRef } from 'react'

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents... 💭"
            disabled={isLoading}
            className={`
              w-full px-6 py-4 pb-8 pr-20 rounded-2xl border-2 backdrop-blur-sm
              focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
              resize-none min-h-[60px] max-h-[120px] text-base
              ${isLoading 
                ? 'bg-gray-700/30 text-gray-400 border-gray-600' 
                : 'bg-gray-800/50 text-white border-gray-600 placeholder-gray-400'
              }
              transition-all duration-200
            `}
            rows={1}
          />
          
          {/* Character count */}
          <div className="absolute bottom-3 right-6 text-xs text-gray-500">
            {message.length}/1000
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`
            flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
            transition-all duration-200 transform
            ${!message.trim() || isLoading
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600'
              : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white hover:scale-105 shadow-lg shadow-blue-500/25 border border-cyan-400/50'
            }
          `}
        >
          {isLoading ? (
            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
      
      {/* Input hints */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Press Enter to send • Shift+Enter for new line • Upload PDFs to ask about your own documents
        </p>
      </div>
    </div>
  )
}

export default ChatInput
