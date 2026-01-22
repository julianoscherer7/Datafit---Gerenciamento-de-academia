import React from 'react'
import ReactDOM from 'react-dom/client'
import AppContent from './App.jsx'
import './styles/index.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
