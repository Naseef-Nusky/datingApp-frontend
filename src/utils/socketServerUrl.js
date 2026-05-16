/**
 * Socket.IO must reach the same host/port as the API server.
 * In dev without VITE_API_URL, use the Vite origin so /socket.io is proxied (see vite.config.js).
 */
export function getSocketServerUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (configured) return configured;
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5000';
}
