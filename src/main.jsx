import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// Baked in at build time from frontend/.env.production (VITE_API_URL). Without it on app.*, /api hits the app nginx (often 1MB default → 413 on uploads).
const raw = import.meta.env.VITE_API_URL || '';
axios.defaults.baseURL = raw.replace(/\/$/, '');

if (import.meta.env.PROD && !raw && typeof window !== 'undefined' && /^app\./.test(window.location.hostname)) {
  const apiHost = window.location.hostname.replace(/^app\./, 'api.');
  console.warn(
    `[Vantage Dating] Set VITE_API_URL=https://${apiHost} in frontend/.env.production and rebuild, or raise client_max_body_size on this nginx server for /api.`,
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);













