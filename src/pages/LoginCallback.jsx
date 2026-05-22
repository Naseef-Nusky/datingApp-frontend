import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Handles magic link click from email: ?token=xxx → verify with API, store token, redirect.
 */
export default function LoginCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { t } = useLanguage();
  /** loading | success | invalid */
  const [status, setStatus] = useState('loading');
  const verifyStarted = useRef(false);

  const token = (searchParams.get('token') || '').trim();

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    if (verifyStarted.current) return;
    verifyStarted.current = true;

    let cancelled = false;

    const runVerify = (attempt = 0) => {
      axios
        .post('/api/auth/verify-login-link', { token })
        .then((res) => {
          if (cancelled) return;

          const {
            token: jwt,
            user: userData,
            registrationComplete,
            needsProfileCompletion,
          } = res.data;

          if (!jwt || !userData || !loginWithToken) {
            setStatus('invalid');
            return;
          }

          loginWithToken(jwt, userData);

          const target =
            needsProfileCompletion === true || registrationComplete === false
              ? '/complete-profile'
              : '/dashboard';

          setStatus('success');
          navigate(target, { replace: true });
        })
        .catch(() => {
          if (cancelled) return;
          // One retry for flaky mobile networks / cold API wake-up
          if (attempt < 1) {
            setTimeout(() => runVerify(attempt + 1), 400);
            return;
          }
          setStatus('invalid');
        });
    };

    runVerify();

    return () => {
      cancelled = true;
    };
  }, [token, loginWithToken, navigate]);

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('loginCallback.invalidLink')}</h1>
          <p className="text-gray-600 text-sm mb-6">
            {t('loginCallback.invalidLinkDescription')}
          </p>
          <a
            href="/signup-email"
            className="inline-block py-3 px-6 rounded-xl font-semibold text-white"
            style={{
              background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)',
            }}
          >
            {t('loginCallback.getNewLink')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">{t('loginCallback.loggingYouIn')}</p>
    </div>
  );
}
