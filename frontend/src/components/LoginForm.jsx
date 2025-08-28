import React, { useState } from 'react'

const LoginForm = ({ onLogin, onSwitchToSignup, isLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onLogin(formData)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-600 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your DocBot AI account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 rounded-lg border-2 bg-gray-700/50 text-white
                placeholder-gray-400 transition-all duration-200
                ${errors.email 
                  ? 'border-red-500 focus:border-red-400' 
                  : 'border-gray-600 focus:border-cyan-400'
                }
                focus:outline-none focus:ring-2 focus:ring-cyan-400/20
              `}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 rounded-lg border-2 bg-gray-700/50 text-white
                placeholder-gray-400 transition-all duration-200
                ${errors.password 
                  ? 'border-red-500 focus:border-red-400' 
                  : 'border-gray-600 focus:border-cyan-400'
                }
                focus:outline-none focus:ring-2 focus:ring-cyan-400/20
              `}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-white
              transition-all duration-200 transform
              ${isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:scale-105 shadow-lg shadow-blue-500/25'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              '🔐 Sign In'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
