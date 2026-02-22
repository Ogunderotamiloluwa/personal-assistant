// API Configuration - Works for Local Development and Deployment
// This file automatically detects the environment and uses the correct API URL

const getAPIUrl = () => {
  // If we have an environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For local development, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5006';
  }
  
  // For production, construct the URL dynamically
  // If backend is on same domain, use relative path
  if (window.location.protocol === 'https:') {
    return `https://${window.location.hostname}:5006`;
  }
  
  // Fallback to HTTP
  return `http://${window.location.hostname}:5006`;
};

export const API_URL = getAPIUrl();

console.log('API URL configured as:', API_URL);

export default API_URL;
