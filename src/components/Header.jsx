import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaInbox } from 'react-icons/fa';
import axios from 'axios';
import Logo from './Logo';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [todayStatus, setTodayStatus] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTodayStatus();
    }
  }, [user]);

  const fetchTodayStatus = async () => {
    try {
      const response = await axios.get('/api/user/status');
      setTodayStatus(response.data.status);
    } catch (error) {
      console.error('Fetch status error:', error);
    }
  };

  // Listen for status updates (when user changes status)
  useEffect(() => {
    const handleStatusUpdate = () => {
      fetchTodayStatus();
    };
    window.addEventListener('statusUpdated', handleStatusUpdate);
    return () => window.removeEventListener('statusUpdated', handleStatusUpdate);
  }, []);

  const getStatusLabel = (status) => {
    const statusMap = {
      serious: 'SERIOUS',
      penpal: 'PEN PAL',
      romantic: 'ROMANTIC',
      flirty: 'FLIRTY',
      naughty: 'NAUGHTY',
    };
    return statusMap[status] || 'TODAY I AM';
  };

  return (
    <header className="bg-nex-blue shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard">
            <Logo />
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="flex items-center space-x-6">
              <Link
                to="/today-i-am"
                state={{ from: location.pathname }}
                className="flex items-center space-x-1 text-white hover:text-nex-orange transition"
              >
                <span>{getStatusLabel(todayStatus)}</span>
                <span className="text-xs">?</span>
              </Link>
              <Link
                to="/search"
                className={`transition ${
                  window.location.pathname === '/search'
                    ? 'text-nex-orange font-semibold'
                    : 'text-white hover:text-nex-orange'
                }`}
              >
                SEARCH
              </Link>
              <Link
                to="/inbox"
                className="relative text-white hover:text-nex-orange transition"
              >
                INBOX
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-nex-pink rounded-full"></span>
              </Link>
              <button className="bg-gradient-nex text-white px-4 py-2 rounded hover:opacity-90 transition">
                REFILL ACCOUNT
              </button>
              <ProfileDropdown />
            </nav>
          )}

          {!user && (
            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-nex-orange transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-nex text-white px-4 py-2 rounded hover:opacity-90 transition"
              >
                Join us now
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

