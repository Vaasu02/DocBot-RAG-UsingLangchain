import React, { useState, useEffect } from 'react'

const DocumentManager = ({ onIndexSwitch, currentIndex }) => {
  const [indexes, setIndexes] = useState([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    fetchIndexes()
  }, [])

  const fetchIndexes = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${API_BASE_URL}/api/indexes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setIndexes(data.indexes)
      } else {
        console.error('Failed to fetch indexes:', data.error)
      }
    } catch (error) {
      console.error('Error fetching indexes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIndexSwitch = async (indexName) => {
    setSwitching(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${API_BASE_URL}/api/switch-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          index_name: indexName,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        onIndexSwitch(indexName)
      } else {
        console.error('Failed to switch index:', result.error)
      }
    } catch (error) {
      console.error('Error switching index:', error)
    } finally {
      setSwitching(false)
    }
  }

  const getDisplayName = (indexName) => {
    if (indexName === 'langchain-integration-index') {
      return 'Medical Encyclopedia (Default)'
    }
    if (indexName.startsWith('user-docs-')) {
      return `User Document ${indexName.split('-').pop()}`
    }
    return indexName
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
        <span className="ml-2 text-sm text-gray-300">Loading documents...</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-600 p-4">
      <h3 className="text-lg font-semibold text-white mb-3">📚 Available Documents</h3>
      
      {indexes.length === 0 ? (
        <p className="text-sm text-gray-400">No documents available</p>
      ) : (
        <div className="space-y-2">
          {indexes.map((index) => (
            <button
              key={index}
              onClick={() => handleIndexSwitch(index)}
              disabled={switching || index === currentIndex}
              className={`
                w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200
                ${index === currentIndex
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg'
                  : 'bg-gray-700/30 text-gray-300 hover:bg-gray-600/30 border border-gray-600 hover:border-gray-500'
                }
                ${switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{getDisplayName(index)}</span>
                {index === currentIndex && (
                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {index === 'langchain-integration-index' 
                  ? '📖 Gale Encyclopedia of Medicine' 
                  : '📄 User uploaded document'
                }
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={fetchIndexes}
        className="mt-4 w-full px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-gray-700/30 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
      >
        🔄 Refresh List
      </button>
    </div>
  )
}

export default DocumentManager
