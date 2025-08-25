import React from 'react'

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'
  const isError = message.isError

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatSourceDocuments = (sourceDocuments) => {
    if (!sourceDocuments || sourceDocuments.length === 0) return null
    
    return (
      <div className="mt-3 pt-3 border-t border-gray-600">
        <p className="text-xs font-medium text-gray-400 mb-2">📖 Source Documents:</p>
        <div className="space-y-1">
          {sourceDocuments.map((doc, index) => (
            <div 
              key={index}
              className="text-xs text-gray-300 bg-gray-700/50 rounded px-2 py-1 border border-gray-600"
            >
              {/* Handle both string and object formats */}
              {typeof doc === 'string' ? doc : doc.page_content || 'Source document'}
              {doc.metadata && (
                <div className="text-xs text-gray-500 mt-1">
                  {doc.metadata.source && `📄 ${doc.metadata.source}`}
                  {doc.metadata.page && ` | Page: ${doc.metadata.page}`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            rounded-2xl px-4 py-3 shadow-lg border backdrop-blur-sm
            ${isUser 
              ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white border-blue-400 shadow-blue-500/20' 
              : isError
                ? 'bg-red-900/30 text-red-300 border-red-500/50'
                : 'bg-gray-800/70 text-gray-100 border-gray-600 shadow-gray-900/20'
            }
          `}
        >
          <div className="flex items-start space-x-2">
            {!isUser && (
              <div className="flex-shrink-0 mt-1">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${isError ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'}
                `}>
                  {isError ? '⚠️' : '🤖'}
                </div>
              </div>
            )}
            
            <div className="flex-1">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
              
              {/* Source Documents */}
              {!isUser && message.sourceDocuments && formatSourceDocuments(message.sourceDocuments)}
            </div>
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
