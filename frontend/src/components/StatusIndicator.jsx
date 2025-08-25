import React, { useState, useEffect } from 'react'
import apiService from '../services/api'

const StatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [isAPIHealthy, setIsAPIHealthy] = useState(true)

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check API health periodically
    const checkAPIHealth = async () => {
      try {
        const healthy = await apiService.healthCheck()
        setIsAPIHealthy(healthy)
      } catch (error) {
        setIsAPIHealthy(false)
      }
    }

    // Initial check
    checkAPIHealth()
    
    // Check every 30 seconds
    const interval = setInterval(checkAPIHealth, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (!isOnline) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-300">🚫 You're offline. Please check your connection.</span>
        </div>
      </div>
    )
  }

  if (!isAPIHealthy) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-300">
            ⚠️ Running in demo mode. Connect to backend for full functionality.
          </span>
        </div>
      </div>
    )
  }

  return null
}

export default StatusIndicator
