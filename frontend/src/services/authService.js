const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken')
  }

  // Store token
  setToken(token) {
    localStorage.setItem('authToken', token)
  }

  // Remove token
  removeToken() {
    localStorage.removeItem('authToken')
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false
    
    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch {
      return false
    }
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }))
        throw new Error(errorData.detail || 'Login failed')
      }

      const data = await response.json()
      this.setToken(data.access_token)
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Register user
  async signup(userData) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }))
        throw new Error(errorData.detail || 'Registration failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get user info')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  }

  // Logout user
  logout() {
    this.removeToken()
  }
}

export default new AuthService()
