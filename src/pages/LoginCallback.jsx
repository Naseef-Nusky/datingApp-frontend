import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Handles magic link click from email: ?token=xxx → verify with API, store token, redirect to dashboard.
 */
export default function LoginCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = (searchParams.get('token') || '').trim();
    if (!token) {
      setStatus('invalid');
      return;
    }

    axios
      .post('/api/auth/verify-login-link', { token })
      .then((res) => {
        const { token: jwt, user, registrationComplete } = res.data;
        if (jwt && user && loginWithToken) {
          loginWithToken(jwt);
          setStatus('success');
          // Always open dashboard when login link is valid (existing or new account)
          navigate('/dashboard', {
            replace: true,
            state: registrationComplete === false ? { openCompleteProfile: true } : undefined,
          });
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => {
        setStatus('invalid');
      });
  }, [searchParams, navigate, loginWithToken]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Logging you in...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h1>
          <p className="text-gray-600 text-sm mb-6">
            This login link is invalid or was already used. Please request a new one.
          </p>
          <a
            href="/signup-email"
            className="inline-block py-3 px-6 rounded-xl font-semibold text-white"
            style={{
              background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)',
            }}
          >
            Get a new link
          </a>
        </div>
      </div>
    );
  }

  return null;
}
