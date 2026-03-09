import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Logo from './Logo';

export default function LandingHero() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <section
      className="relative min-h-screen flex flex-col"
    >
      {/* Desktop: full-screen image with overlay header + floating white card */}
      <div
        className="hidden md:block relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero%20img.png')",
        }}
      >
        {/* Desktop header: logo top left, nav top right — over image */}
        <header className="absolute top-0 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-5">
            <Link to="/" className="inline-flex items-center">
              <Logo className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 lg:gap-3">
            <Link to="/#relationship-experts" className="px-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition">
              Online Dating Advice
            </Link>
            <Link to="/online-dating-singles" className="px-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition">
              Singles Online
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }}
            >
              Log In
            </Link>
          </div>
          </div>
        </header>

        {/* Desktop: floating white card on left — overlay with shadow */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[420px] lg:max-w-[460px] bg-white rounded-2xl shadow-xl p-8 lg:p-10">
          <Logo className="h-8 w-auto mb-6 text-gray-900" />
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Global Online Dating
          </h1>
          <p className="text-gray-500 text-base lg:text-lg leading-relaxed mb-8">
            Enjoy virtual connections with like-minded people around the world.
          </p>
          <div className="space-y-3">
            <Link
              to="/signup-email"
              className="block w-full text-center py-4 rounded-xl text-white text-lg font-semibold transition hover:opacity-95"
              style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }}
            >
              Take a chance!
            </Link>
            <a
              href={`${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
              className="flex items-center justify-center gap-3 w-full bg-white border border-gray-200 text-gray-800 text-base font-medium py-3.5 px-6 rounded-xl hover:bg-gray-50 transition no-underline"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </a>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mt-8">
            By clicking &quot;Take a chance!&quot; you agree with the{' '}
            <Link to="/terms" className="underline hover:text-gray-600">Terms &amp; Conditions</Link>,{' '}
            <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>,{' '}
            <Link to="/refund" className="underline hover:text-gray-600">Refund and Cancellation Policy</Link> and{' '}
            <Link to="/terms#content" className="underline hover:text-gray-600">Content Policy</Link>.
            You can terminate your account or opt out of any or part of the services.
          </p>
            </div>
          </div>
        </div>

        {/* Image disclaimer — bottom right */}
        <p className="absolute bottom-4 right-4 text-[10px] text-white/80 max-w-[200px] text-right">
          For display purposes only. The individual in the image is not a user of this service.
        </p>
      </div>

      {/* Mobile: full-screen overlay layout */}
      <div
        className="md:hidden relative min-h-screen flex flex-col bg-cover bg-center bg-no-repeat flex-1"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.25)), url('/hero%20img.png')",
        }}
      >
      {/* Mobile Header: logo left, hamburger right */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4">
        <Link to="/" className="inline-flex items-center">
          <Logo className="h-7 w-auto object-contain text-white" />
        </Link>
        <button
          type="button"
          onClick={() => setShowMobileMenu(true)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition"
          aria-label="Open menu"
        >
          <FaBars className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileMenu(false)} aria-hidden="true" />
          <div className="absolute top-0 right-0 bottom-0 w-full max-w-[280px] bg-gray-900 shadow-xl flex flex-col py-6 px-4">
            <div className="flex justify-between items-center mb-6">
              <Logo className="h-8 text-white" />
              <button type="button" onClick={() => setShowMobileMenu(false)} className="p-2 text-white hover:bg-white/10 rounded">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <Link to="/login" className="py-3 px-4 rounded-xl text-white font-semibold text-center mb-4" style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }} onClick={() => setShowMobileMenu(false)}>
              Log In
            </Link>
          </div>
        </div>
      )}

      {/* Main content: centered headline, subheadline, CTAs — over the image (mobile-first) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 sm:pb-24 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-md">
          Global Online Dating
        </h1>
        <p className="text-white/95 text-base sm:text-lg md:text-xl max-w-md mb-8 sm:mb-10 drop-shadow-sm">
          Enjoy virtual connections with like-minded people around the world.
        </p>

        <div className="w-full max-w-[320px] sm:max-w-[340px] space-y-3">
          <Link
            to="/signup-email"
            className="block w-full text-center py-4 rounded-xl text-white text-lg font-semibold transition hover:opacity-95 active:opacity-90 shadow-lg"
            style={{ background: 'linear-gradient(to right, #5A2D8A, #B5458F, #E97672)' }}
          >
            Take a chance!
          </Link>
          <a
            href={`${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full bg-white border border-gray-200 text-gray-800 text-base font-medium py-3.5 px-6 rounded-xl hover:bg-gray-50 transition no-underline shadow"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </a>
        </div>
      </div>

      {/* Legal fine print at bottom — over the image */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-4 sm:py-5 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-xs sm:text-sm text-white/85 text-center leading-relaxed max-w-xl mx-auto">
          By clicking &quot;Take a chance!&quot; you agree with the{' '}
          <Link to="/terms" className="underline hover:text-white">Terms &amp; Conditions</Link>,{' '}
          <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>,{' '}
          <Link to="/refund" className="underline hover:text-white">Refund and Cancellation Policy</Link> and{' '}
          <Link to="/terms#content" className="underline hover:text-white">Content Policy</Link>.
          You can terminate your account or opt out of any or part of the services.
        </p>
      </div>
      </div>
    </section>
  );
}
