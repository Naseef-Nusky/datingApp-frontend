import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Handles redirect from backend after Google OAuth: ?token=xxx&to=/dashboard|/complete-profile
 */
export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    const to = searchParams.get('to') || '/dashboard';

    if (!token) {
      setStatus('error');
      return;
    }

    if (loginWithToken) {
      loginWithToken(token);
      setStatus('success');
      navigate(to, { replace: true });
    } else {
      setStatus('error');
    }
  }, [searchParams, navigate, loginWithToken]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Signing you in...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sign-in failed</h1>
          <p className="text-gray-600 text-sm mb-6">Something went wrong. Please try again.</p>
          <a
            href="/login"
            className="inline-block py-3 px-6 rounded-xl font-semibold text-white"
            style={{
              background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)',
            }}
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return null;
}
