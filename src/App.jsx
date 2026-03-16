import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { RefillModalProvider } from './context/RefillModalContext';
import { UpgradeModalProvider } from './context/UpgradeModalContext';
import { LanguageProvider } from './context/LanguageContext';
import { translatePage } from './utils/translatePage';
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SignupEmail from './pages/SignupEmail';
import CheckEmail from './pages/CheckEmail';
import LoginCallback from './pages/LoginCallback';
import GoogleCallback from './pages/GoogleCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyProfile from './pages/MyProfile';
import Inbox from './pages/Inbox';
import VipPage from './pages/VipPage';
import ComposeEmail from './pages/ComposeEmail';
import MatureOnlineDating from './pages/MatureOnlineDating';
import AsianOnlineDating from './pages/AsianOnlineDating';
import GayDatingOnline from './pages/GayDatingOnline';
import SinglesOnlineDating from './pages/SinglesOnlineDating';
import CompleteProfile from './pages/CompleteProfile';
import TermsOfUseModal from './components/TermsOfUseModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import RefundPolicyModal from './components/RefundPolicyModal';
import SafetyPolicyModal from './components/SafetyPolicyModal';
import AboutModal from './components/AboutModal';
import InactivityModal from './components/InactivityModal';
import { useInactivity } from './hooks/useInactivity';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';
import OnlineDatingAdvice from './pages/OnlineDatingAdvice';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('pages.loading')}</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// App routes: show header only when logged in and on these paths
const APP_ROUTES = ['/dashboard', '/profile', '/inbox', '/vip', '/compose-email', '/complete-profile'];

function isAppRoute(pathname) {
  return APP_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

function App() {
  const AppShell = () => {
    const location = useLocation();
    const { user } = useAuth();

    // Whole-page translation: when language is not English, translate all visible text via API.
    // Run on route change and when user logs in so all post-login content (dashboard, profile, inbox, etc.) is translated.
    useEffect(() => {
      const lang = localStorage.getItem('app_language') || localStorage.getItem('selectedLanguage') || 'en';
      if (lang === 'en' || lang === 'en-uk') return;
      const t1 = setTimeout(() => translatePage(lang), 300);
      const t2 = setTimeout(() => translatePage(lang), 1200);
      const t3 = setTimeout(() => translatePage(lang), 2800);
      const t4 = setTimeout(() => translatePage(lang), 5000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }, [location.pathname, user?.id]);

    const showHeader = user && isAppRoute(location.pathname);
    const showFooter = !showHeader;
    const [showInactivityModal, resetInactivity] = useInactivity(showHeader);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScrollToTop />
        {showHeader && <Header />}
        {showInactivityModal && (
          <InactivityModal onContinue={resetInactivity} />
        )}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<TermsOfUseModal asPage />} />
            <Route path="/privacy" element={<PrivacyPolicyModal asPage />} />
            <Route path="/refund" element={<RefundPolicyModal asPage />} />
            <Route path="/safety" element={<SafetyPolicyModal asPage />} />
            <Route path="/about" element={<AboutModal asPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/online-dating-advice" element={<OnlineDatingAdvice />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup-email" element={<SignupEmail />} />
            <Route path="/auth/check-email" element={<CheckEmail />} />
            <Route path="/auth/login-callback" element={<LoginCallback />} />
            <Route path="/auth/google-callback" element={<GoogleCallback />} />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/me"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vip"
              element={
                <ProtectedRoute>
                  <VipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compose-email"
              element={
                <ProtectedRoute>
                  <ComposeEmail />
                </ProtectedRoute>
              }
            />
            <Route path="/mature-online-dating" element={<MatureOnlineDating />} />
            <Route path="/asian-online-dating" element={<AsianOnlineDating />} />
            <Route path="/gay-online-dating" element={<GayDatingOnline />} />
            <Route path="/online-dating-singles" element={<SinglesOnlineDating />} />
          </Routes>
        </div>
        {showFooter && <SiteFooter />}
      </div>
    );
  };

  return (
    <AuthProvider>
      <RefillModalProvider>
        <UpgradeModalProvider>
        <LanguageProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppShell />
        </Router>
        </LanguageProvider>
        </UpgradeModalProvider>
      </RefillModalProvider>
    </AuthProvider>
  );
}

export default App

