import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_URL } from '../config/apiConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('app-theme') || 'light'
  })

  // Apply theme whenever it changes
  useEffect(() => {
    localStorage.setItem('app-theme', theme)
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    
    console.log('✅ Theme applied:', theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Verify token validity with backend
  const verifyToken = async (authToken) => {
    try {
      console.log('Verifying token with backend...');
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        console.log('Token verification failed');
        return false;
      }

      console.log('Token is valid');
      // Now fetch user profile
      const profileResponse = await fetch(`${API_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (profileResponse.ok) {
        const data = await profileResponse.json()
        setUser(data.user)
        console.log('User profile loaded');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token verification error:', err)
      return false;
    }
  }

  // Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      
      if (savedToken) {
        console.log('🔑 Token found in localStorage, using it immediately');
        setToken(savedToken)
        
        // Verify token with backend in the background (non-blocking)
        // Don't clear the token if verification fails or times out
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(`${API_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const profileResponse = await fetch(`${API_URL}/api/users/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            
            if (profileResponse.ok) {
              const data = await profileResponse.json();
              setUser(data.user);
              console.log('✅ Token verified and user profile loaded');
            }
          }
        } catch (error) {
          // Don't clear the token on verification failure or timeout
          // The token might be valid, the backend might just be slow
          console.warn('⚠️ Token verification failed/timeout, but keeping token:', error.message);
        }
      }
      
      // Always finish loading immediately
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = (newToken, userData) => {
    console.log('Saving token to localStorage');
    console.log('User data received:', userData);
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    
    // Load theme from user preferences if available
    if (userData && userData.preferences && userData.preferences.theme) {
      console.log('Loading theme from user preferences:', userData.preferences.theme);
      setTheme(userData.preferences.theme)
    }
  }

  const logout = () => {
    console.log('Logging out - clearing token');
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
