// src/main.jsx
// React app entry point

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Global toast notification container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Sarabun', sans-serif",
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
