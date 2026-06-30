import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Noto Sans Bengali, sans-serif',
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' }
          }
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
