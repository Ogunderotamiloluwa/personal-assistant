// API Configuration - Smart Backend Port Detection
// Automatically determines backend URL based on frontend port
// Frontend: http://localhost:3000 → Backend: http://localhost:5004 ✓

const getAPIUrl = () => {
  // HARDCODED FOR NOW - Backend is ALWAYS on 5004 (see backend .env PORT=5004)
  return 'http://localhost:5004';
};

export const API_URL = getAPIUrl();

// FORCE LOG ON LOAD
console.clear();
console.log('%c🚀 FRONTEND LOADED', 'font-size: 20px; font-weight: bold; color: green;');
console.log('%c════════════════════════════════════════', 'color: green;');
console.log('🔗 API Configuration Loaded');
console.log('   Frontend URL:', window.location.href);
console.log('   Hostname:', window.location.hostname);
console.log('   Port:', window.location.port || '3000');
console.log('   ➜ Backend API:', API_URL);
console.log('%c════════════════════════════════════════', 'color: green;');
console.log('💡 To see login details, scroll down in console after clicking LOGIN');

export default API_URL;
