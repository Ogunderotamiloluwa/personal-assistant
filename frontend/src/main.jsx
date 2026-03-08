import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Debug: Check if main.jsx is loading
console.log('🚀 main.jsx loaded')
const rootElement = document.getElementById('root')
console.log('📍 Root element:', rootElement)

if (!rootElement) {
  console.error('❌ Root element not found! Creating fallback...')
  const div = document.createElement('div')
  div.id = 'root'
  document.body.appendChild(div)
}

console.log('✅ Creating React root...')
const root = createRoot(document.getElementById('root'))
console.log('✅ Rendering App...')

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('✅ App rendered successfully!')
