// API service for communicating with the backend
// This will be used to replace the simulation functions in App.jsx

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async sendMessage(message) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        result: data.result,
        sourceDocuments: data.source_documents || [],
      }
    } catch (error) {
      console.error('API Error:', error)
      
      // If it's a network error, fall back to simulation
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        console.warn('Backend not available, using simulation mode')
        return await simulateAPICall(message)
      }
      
      throw new Error(error.message || 'Failed to get response from the server. Please try again.')
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`)
      if (response.ok) {
        const data = await response.json()
        return data.status === 'healthy'
      }
      return false
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

// Simulation function for development (remove when backend is ready)
export const simulateAPICall = async (question) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  // Simulate different types of responses
  const responses = [
    {
      result: `Based on the medical documents, here's what I found about "${question}": This appears to be related to medical conditions that affect multiple body systems. The documentation indicates various treatment approaches and diagnostic criteria that healthcare professionals should consider.`,
      sourceDocuments: [
        'The GALE ENCYCLOPEDIA of MEDICINE SECOND - Section 4.2: Diagnostic Procedures',
        'The GALE ENCYCLOPEDIA of MEDICINE SECOND - Chapter 7: Treatment Protocols',
        'The GALE ENCYCLOPEDIA of MEDICINE SECOND - Appendix C: Clinical Guidelines'
      ]
    },
    {
      result: `According to the medical literature in our database regarding "${question}": The condition typically presents with specific symptoms and requires careful evaluation. Treatment protocols vary depending on patient demographics and severity of presentation.`,
      sourceDocuments: [
        'The GALE ENCYCLOPEDIA of MEDICINE SECOND - Volume 2, Page 234',
        'The GALE ENCYCLOPEDIA of MEDICINE SECOND - Clinical Case Studies Section',
      ]
    },
    {
      result: `The medical documents provide comprehensive information about "${question}". Key points include proper diagnosis, treatment recommendations, and patient care guidelines that align with current medical standards.`,
      sourceDocuments: [
        'The GALE ENCYCLOPEDIA of MEDICINE SECOND - Chapter 12: Patient Care',
        'The GALE ENCYCLOPEDIA of MEDICINE SECOND - Section 8.1: Medical Protocols'
      ]
    }
  ]
  
  // Return a random response
  return responses[Math.floor(Math.random() * responses.length)]
}

export default new APIService()
