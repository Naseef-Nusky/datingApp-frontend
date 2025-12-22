import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaGlobe, FaUser, FaHeart, FaGift, FaCog, FaQuestionCircle, FaTag, FaFileContract, FaSignOutAlt } from 'react-icons/fa';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const menuItems = [
    { 
      id: 'profile', 
      label: 'My Profile', 
      icon: FaUser, 
      path: '/profile/me',
      active: true,
      color: 'text-red-600'
    },
    { 
      id: 'mingle', 
      label: "Let's mingle", 
      icon: FaHeart, 
      path: '/dashboard',
      color: 'text-gray-800'
    },
    { 
      id: 'network', 
      label: 'Our Dating Network', 
      icon: FaGlobe, 
      path: '/network',
      color: 'text-gray-800'
    },
    { 
      id: 'presents', 
      label: 'Presents', 
      icon: FaGift, 
      path: '/presents',
      color: 'text-gray-500',
      disabled: true
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: FaCog, 
      path: '/settings',
      color: 'text-gray-500',
      disabled: true
    },
    { 
      id: 'help', 
      label: 'Help Center', 
      icon: FaQuestionCircle, 
      path: '/help',
      color: 'text-gray-500',
      disabled: true
    },
    { 
      id: 'promo', 
      label: 'Promotional Code', 
      icon: FaTag, 
      path: '/promo-code',
      color: 'text-gray-500',
      disabled: true
    },
    { 
      id: 'terms', 
      label: 'Terms & Privacy', 
      icon: FaFileContract, 
      path: '/terms',
      color: 'text-gray-500',
      underline: true
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
          {profile?.photos?.[0] ? (
            <img 
              src={profile.photos[0].url} 
              alt={profile.firstName || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-lg font-semibold">
              {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-4 border-b border-gray-200 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                {profile?.photos?.[0] ? (
                  <img 
                    src={profile.photos[0].url} 
                    alt={profile.firstName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-semibold">
                    {profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {profile?.firstName && profile?.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile?.firstName || user?.email?.split('@')[0] || 'User'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              ID: {user?.id?.substring(0, 12) || 'N/A'}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.active;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (item.disabled) {
                      return;
                    }
                    setIsOpen(false);
                  }}
                  className={`flex items-center px-6 py-3 transition ${
                    item.disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-50 cursor-pointer'
                  } ${isActive ? 'bg-red-50' : ''}`}
                >
                  <Icon className={`mr-3 ${item.color} ${isActive ? 'text-red-600' : ''}`} />
                  <span
                    className={`${item.color} ${isActive ? 'font-semibold text-red-600' : ''} ${
                      item.underline ? 'underline' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-6 py-3 text-gray-500 hover:bg-gray-50 transition cursor-pointer"
            >
              <FaSignOutAlt className="mr-3" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

