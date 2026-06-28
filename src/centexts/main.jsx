import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Noto Sans Bengali, sans-serif',
                borderRadius: '12px',
                padding: '12px 20px',
              },
              success: {
                style: {
                  background: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #86efac',
                },
                iconTheme: {
                  primary: '#22C55E',
                  secondary: '#dcfce7',
                },
              },
              error: {
                style: {
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                },
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fee2e2',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
