import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RefillModalProvider } from './context/RefillModalContext';
import Header from './components/Header';
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

function App() {
  return (
    <AuthProvider>
      <RefillModalProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen bg-gray-50">
            <Header />
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
            </Routes>
          </div>
        </Router>
      </RefillModalProvider>
    </AuthProvider>
  );
}

export default App

