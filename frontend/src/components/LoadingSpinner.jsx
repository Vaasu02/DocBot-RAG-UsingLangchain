import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  )
}

export default LoadingSpinner
