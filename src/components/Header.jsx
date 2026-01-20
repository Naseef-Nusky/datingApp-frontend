import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaInbox, FaHeart, FaComments, FaBell, FaEnvelope, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Logo from './Logo';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState(null);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showChatRequestsModal, setShowChatRequestsModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTodayStatus();
      fetchContacts();
      fetchChatRequests();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      if (response.data && Array.isArray(response.data)) {
        const contactsList = response.data.map((conv) => {
          const otherUser = conv.user;
          const profile = otherUser?.profile;
          return {
            id: conv.userId,
            name: profile?.firstName || otherUser?.email?.split('@')[0] || 'Unknown',
            message: conv.lastMessage?.content || 'No messages yet',
            unreadCount: conv.unreadCount || 0,
            avatar: profile?.photos?.[0]?.url || null,
          };
        });
        setContacts(contactsList);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchChatRequests = async () => {
    try {
      const response = await axios.get('/api/messages/chat-requests');
      if (response.data && Array.isArray(response.data)) {
        const requests = await Promise.all(
          response.data.map(async (request) => {
            try {
              let senderName = 'Unknown';
              let senderAvatar = null;
              if (request.senderData?.id) {
                try {
                  const profileResponse = await axios.get(`/api/profiles/${request.senderData.id}`);
                  if (profileResponse.data) {
                    senderName = profileResponse.data.firstName || senderName;
                    senderAvatar = profileResponse.data.photos?.[0]?.url || null;
                  }
                } catch (profileError) {
                  senderName = request.senderData.email?.split('@')[0] || 'Unknown';
                }
              }
              return {
                id: request.id,
                name: senderName,
                message: request.firstMessage || request.content || 'New message',
                avatar: senderAvatar,
                senderId: request.senderData?.id || request.senderId,
              };
            } catch (err) {
              return {
                id: request.id,
                name: request.senderData?.email?.split('@')[0] || 'Unknown',
                message: request.firstMessage || request.content || 'New message',
                avatar: null,
                senderId: request.senderData?.id || request.senderId,
              };
            }
          })
        );
        setChatRequests(requests.filter(r => r.senderId));
      }
    } catch (error) {
      console.error('Error fetching chat requests:', error);
    }
  };

  const acceptChatRequestAndOpenChat = async (request) => {
    try {
      await axios.put(`/api/messages/chat-requests/${request.id}/accept`);
    } catch (error) {
      console.error('Accept chat request error (header):', error);
    } finally {
      fetchChatRequests();
      fetchContacts();

      if (request.senderId) {
        navigate(`/profile/${request.senderId}`, {
          state: { openChat: true, from: 'chat-request', requestId: request.id },
        });
      }
    }
  };

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
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Hidden on mobile, show on larger screens */}
          <Link to="/dashboard" className="hidden sm:block">
            <Logo />
          </Link>

          {/* Mobile Logo - Smaller version */}
          <Link to="/dashboard" className="sm:hidden">
            <Logo />
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/today-i-am"
                  state={{ from: location.pathname }}
                  className="flex items-center space-x-1 text-white hover:text-nex-orange transition"
                >
                  <span>{getStatusLabel(todayStatus)}</span>
                  <span className="text-xs">?</span>
                </Link>
                {location.pathname === '/dashboard' ? (
                  <button
                    onClick={() => {
                      // Dispatch custom event to open modal
                      window.dispatchEvent(new CustomEvent('openSearchModal'));
                    }}
                    className="text-white hover:text-nex-orange transition"
                  >
                    SEARCH
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    state={{ openSearchModal: true }}
                    className="text-white hover:text-nex-orange transition"
                  >
                    SEARCH
                  </Link>
                )}
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
              </div>

              {/* Mobile Navigation - Icons only */}
              <div className="flex lg:hidden items-center space-x-2 sm:space-x-3">
                {/* 1. Search Icon */}
                {location.pathname === '/dashboard' ? (
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openSearchModal'));
                    }}
                    className="text-white hover:text-nex-orange transition p-1.5 sm:p-2"
                  >
                    <FaSearch className="text-lg sm:text-xl" />
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    state={{ openSearchModal: true }}
                    className="text-white hover:text-nex-orange transition p-1.5 sm:p-2"
                  >
                    <FaSearch className="text-lg sm:text-xl" />
                  </Link>
                )}

                {/* 2. Chat/Messages Icon - Opens My Contacts Modal */}
                <button
                  onClick={() => {
                    fetchContacts();
                    setShowContactsModal(true);
                  }}
                  className="relative text-white hover:text-nex-orange transition p-1.5 sm:p-2"
                >
                  <FaComments className="text-lg sm:text-xl" />
                  {contacts.filter(c => c.unreadCount > 0).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                      {contacts.filter(c => c.unreadCount > 0).length > 9 ? '9+' : contacts.filter(c => c.unreadCount > 0).length}
                    </span>
                  )}
                </button>

                {/* 3. Notifications/Bell Icon - Opens Chat Requests Modal */}
                <button
                  onClick={() => {
                    fetchChatRequests();
                    setShowChatRequestsModal(true);
                  }}
                  className="relative text-white hover:text-nex-orange transition p-1.5 sm:p-2"
                >
                  <FaBell className="text-lg sm:text-xl" />
                  {chatRequests.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                      {chatRequests.length > 9 ? '9+' : chatRequests.length}
                    </span>
                  )}
                </button>

                {/* 4. Inbox/Email Icon */}
                <Link
                  to="/inbox"
                  className="relative text-white hover:text-nex-orange transition p-1.5 sm:p-2"
                >
                  <FaEnvelope className="text-lg sm:text-xl" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                {/* Profile Dropdown */}
                <ProfileDropdown />
              </div>

              {/* Desktop Profile Dropdown */}
              <div className="hidden lg:block">
                <ProfileDropdown />
              </div>
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

      {/* My Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactsModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">My Contacts</h2>
              <button
                onClick={() => setShowContactsModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No contacts yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id || `contact-${Math.random()}`}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                      onClick={() => {
                        if (contact.id) {
                          navigate(`/profile/${contact.id}`);
                          setShowContactsModal(false);
                        }
                      }}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden">
                          {contact.avatar ? (
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {contact.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800 text-sm truncate">
                            {contact.name}
                          </span>
                          {contact.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-2">
                              {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{contact.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Requests Modal */}
      {showChatRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowChatRequestsModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Chat Requests</h2>
              <button
                onClick={() => setShowChatRequestsModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                  {chatRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No chat requests
                </div>
              ) : (
                <div className="space-y-3">
                  {chatRequests.map((request) => {
                    const openProfileWithChat = () => {
                      setShowChatRequestsModal(false);
                      acceptChatRequestAndOpenChat(request);
                    };

                    return (
                      <div
                        key={request.id}
                        className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-gray-100"
                        onClick={openProfileWithChat}
                      >
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden">
                            {request.avatar ? (
                              <img
                                src={request.avatar}
                                alt={request.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {request.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {request.name}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProfileWithChat();
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full transition"
                            >
                              REPLY
                            </button>
                          </div>
                          <p
                            className="text-xs text-gray-600 truncate cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openProfileWithChat();
                            }}
                          >
                            {request.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

