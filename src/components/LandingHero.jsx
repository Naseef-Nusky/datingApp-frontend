import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactCountryFlag from 'react-country-flag';
import { FaChevronDown } from 'react-icons/fa';
import Logo from './Logo';

const languageOptions = [
  { code: 'en', label: 'English', countryCode: 'US' },
  { code: 'es', label: 'Español', countryCode: 'ES' },
  { code: 'zh', label: '中文', countryCode: 'CN' },
  { code: 'it', label: 'Italiano', countryCode: 'IT' },
  { code: 'fr', label: 'Français', countryCode: 'FR' },
  { code: 'de', label: 'Deutsch', countryCode: 'DE' },
  { code: 'ja', label: '日本語', countryCode: 'JP' },
];

export default function LandingHero() {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const languageMenuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!languageMenuRef.current) return;
      if (!languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <section
      className="relative min-h-[720px] md:min-h-[640px] bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('/hero%20img.png')",
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10 relative min-h-[720px] md:min-h-[640px] flex items-center justify-center lg:justify-start pt-24 md:pt-10">
        <div className="absolute top-4 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10">
          <Link to="/" className="inline-flex items-center">
            <Logo className="h-7 sm:h-9 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white text-sm sm:text-base font-semibold transition hover:opacity-90 whitespace-nowrap"
              style={{
                background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)',
              }}
            >
              Log In
            </Link>
            <div className="relative" ref={languageMenuRef}>
              <button
                type="button"
                onClick={() => setShowLanguageMenu((prev) => !prev)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#3d4047] hover:bg-[#32353b] text-white font-medium transition inline-flex items-center gap-2 sm:gap-3 min-w-[72px] sm:min-w-[88px] justify-between"
                aria-label="Language selector"
              >
                <span className="inline-flex items-center">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden inline-flex items-center justify-center">
                    <ReactCountryFlag
                      countryCode={selectedLanguage.countryCode}
                      svg
                      style={{ width: '1.35em', height: '1.35em' }}
                      title={selectedLanguage.label}
                    />
                  </span>
                </span>
                <FaChevronDown
                  className={`text-sm text-white/90 transition ${
                    showLanguageMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-[160px] sm:w-[170px] bg-[#3d4047] rounded-2xl shadow-2xl py-2 border border-white/5">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(option);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left inline-flex items-center gap-2.5 text-base sm:text-lg transition ${
                        selectedLanguage.code === option.code
                          ? 'text-white bg-white/10'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden inline-flex items-center justify-center">
                        <ReactCountryFlag
                          countryCode={option.countryCode}
                          svg
                          style={{ width: '1.35em', height: '1.35em' }}
                          title={option.label}
                        />
                      </span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-[460px] p-4 pt-8 sm:p-7 sm:pt-10 lg:mt-40 lg:mb-20 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-10 sm:h-11 w-auto object-contain" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Global Online Dating
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-snug mb-6">
            Enjoy virtual connections with like-minded people around the world
          </p>

          <Link
            to="/signup-email"
            className="block w-full text-center py-3 rounded-lg text-white text-lg font-semibold transition mb-4 hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)',
            }}
          >
            Take a chance!
          </Link>

          <a
            href={`${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-800 text-base font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition no-underline"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </a>

          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            By clicking &quot;Take a chance!&quot; you agree with the{' '}
            <Link to="/terms" className="underline hover:text-gray-700">
              Terms &amp; Conditions
            </Link>
            ,{' '}
            <Link to="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </Link>
            ,{' '}
            <Link to="/refund" className="underline hover:text-gray-700">
              Refund and Cancellation Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms#content" className="underline hover:text-gray-700">
              Content Policy
            </Link>
            . You can terminate your account or opt out of any or part of the services
            (including linked-one) any time.
          </p>
        </div>
      </div>
    </section>
  );
}

