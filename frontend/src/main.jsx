import React from 'react'
import ReactDOM from 'react-dom/client'
import AppContent from './App.jsx'
import './styles/index.css'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </React.StrictMode>,
)
