import React, { useState } from 'react'

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onUploadError('Please upload a PDF file only.')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError('File size too large. Maximum 10MB allowed.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onUploadSuccess(result)
      } else {
        onUploadError(result.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer backdrop-blur-sm
          transition-all duration-200
          ${dragActive 
            ? 'border-cyan-400 bg-cyan-500/10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <p className="text-sm text-gray-300">Processing your document...</p>
            </>
          ) : (
            <>
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">
                  📤 Upload your PDF document
                </p>
                <p className="text-xs text-gray-400">
                  Drag and drop or click to browse (Max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        <p>✅ Supported format: PDF only</p>
        <p>🤖 Your document will be processed and indexed for AI chat</p>
      </div>
    </div>
  )
}

export default FileUpload
