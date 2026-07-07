// src/main.jsx
// -----------------------------------------------------------------------
// The entry point of the entire React app.
// It mounts <App /> into the #root div from index.html, and wraps it in:
//   - BrowserRouter: enables page routing (react-router-dom)
//   - AuthProvider:  makes the logged-in user + role available everywhere
// -----------------------------------------------------------------------
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
