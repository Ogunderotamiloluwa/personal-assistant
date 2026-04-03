import { API_URL } from '../config/apiConfig'

/**
 * Wrapper around fetch that automatically includes credentials for cross-browser sessions
 * and handles authentication errors
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  
  // Get token from localStorage
  const token = localStorage.getItem('token')
  
  const config = {
    ...options,
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }
  
  // Add Authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(url, config)
    
    // If 401, token might have expired
    if (response.status === 401) {
      // Could trigger logout here if needed
      console.warn('Authentication failed - token may have expired')
    }
    
    return response
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error)
    throw error
  }
}

export default fetchWithAuth
