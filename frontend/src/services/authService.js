import { API_URL } from '../config/apiConfig';

/**
 * Authentication Service
 * Handles login, signup, logout, and token verification with the backend
 */

class AuthService {
  constructor() {
    this.apiUrl = API_URL;
  }

  /**
   * Sign up a new user
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password (plain text for now)
   * @returns {Promise} - User data and token from backend
   */
  async signup(name, email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token in localStorage and session
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('✅ Signup successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Signup error:', error.message);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - User data and token from backend
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage and session
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('✅ Login successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  }

  /**
   * Verify if user is logged in (check token validity)
   * @returns {Promise} - Token validity and user info
   */
  async verify() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('⚠️ No token found in storage');
        return { valid: false };
      }

      const response = await fetch(`${this.apiUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('⚠️ Token verification failed:', data.error);
        this.logout(); // Clear invalid token
        return { valid: false };
      }

      console.log('✅ Token verified:', data);
      return data;
    } catch (error) {
      console.error('❌ Verification error:', error.message);
      this.logout();
      return { valid: false };
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Logged out');
  }

  /**
   * Get stored user data
   * @returns {Object} - User object from localStorage
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get stored token
   * @returns {string} - Auth token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if token exists
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
