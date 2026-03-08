import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RefillModalProvider } from './context/RefillModalContext';
import { UpgradeModalProvider } from './context/UpgradeModalContext';
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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

function App() {
  const AppShell = () => {
    const location = useLocation();
    const hideHeader = location.pathname === '/';

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScrollToTop />
        {!hideHeader && <Header />}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<></>} />
            <Route path="/refund" element={<></>} />
            <Route path="/safety" element={<></>} />
            <Route path="/terms" element={<></>} />
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
        <SiteFooter />
      </div>
    );
  };

  return (
    <AuthProvider>
      <RefillModalProvider>
        <UpgradeModalProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppShell />
        </Router>
        </UpgradeModalProvider>
      </RefillModalProvider>
    </AuthProvider>
  );
}

export default App

