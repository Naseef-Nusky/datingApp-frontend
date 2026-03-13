import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRefillModal } from '../context/RefillModalContext';
import { FaSearch, FaInbox, FaHeart, FaComments, FaBell, FaEnvelope, FaTimes, FaGift, FaCoins } from 'react-icons/fa';
import { Heart as LucideHeart, Users, Rose, CheckCircle, Smile } from 'lucide-react';
import ContactsSidebar from './ContactsSidebar';
import axios from 'axios';
import io from 'socket.io-client';
import Logo from './Logo';
import ProfileDropdown from './ProfileDropdown';
import SettingsModal from './SettingsModal';
import QuickPresentsModal from './QuickPresentsModal';
import TodayIAmModal from './TodayIAmModal';
import SearchFilterModal from './SearchFilterModal';
import AboutModal from './AboutModal';
import VerifyIdentityModal from './VerifyIdentityModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import RefundPolicyModal from './RefundPolicyModal';
import SafetyPolicyModal from './SafetyPolicyModal';
import TermsOfUseModal from './TermsOfUseModal';
import { useUpgradeModal } from '../context/UpgradeModalContext';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const { user } = useAuth();
  const { openRefillModal } = useRefillModal();
  const { openUpgradeModal } = useUpgradeModal();
  const { t, translatePageNow } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState(null);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showChatRequestsModal, setShowChatRequestsModal] = useState(false);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [showTodayIAmModal, setShowTodayIAmModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPresentsModal, setShowPresentsModal] = useState(false);
  const [presentsReceiverId, setPresentsReceiverId] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [aboutSectionId, setAboutSectionId] = useState(null);
  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showChatRequestTeaser, setShowChatRequestTeaser] = useState(false);
  const [chatRequestTeaserProgress, setChatRequestTeaserProgress] = useState(0);
  const [dismissedChatRequestKey, setDismissedChatRequestKey] = useState(null);
  const socketRef = useRef(null);
  // Popup only for requests that arrive after load (socket). Not for requests already present on refresh.
  const seenRequestKeysRef = useRef(new Set());
  const initialLoadDoneRef = useRef(false);

  const handleSettingsModalOpen = useCallback(() => {
    setTimeout(translatePageNow, 150);
  }, [translatePageNow]);

  useEffect(() => {
    if (user) {
      fetchTodayStatus();
      fetchContacts();
      fetchChatRequests();
    }
  }, [user]);

  // Socket: real-time updates for My Contacts sidebar (new message, gift, contact list change)
  useEffect(() => {
    if (!user?.id) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl, { transports: ['websocket', 'polling'], reconnection: true });
    socketRef.current = socket;
    socket.emit('join-room', String(user.id));
    socket.on('new-message', () => {
      fetchContacts();
    });
    socket.on('contact-update', () => {
      fetchContacts();
      fetchChatRequests();
    });
    socket.on('new-chat-request', () => {
      fetchChatRequests();
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      if (response.data && Array.isArray(response.data)) {
        const contactsList = response.data.map((conv) => {
          const otherUser = conv.user;
          const profile = otherUser?.profile;
          const lastMsg = conv.lastMessage;
          const lastMsgSender = lastMsg?.sender ?? lastMsg?.sender_id;
          const giftFromThem = lastMsg?.messageType === 'gift' && lastMsgSender === conv.userId;
          let message = conv.lastMessage?.content || t('sidebar.noMessagesYet');
          if (lastMsg?.messageType === 'gift') {
            message = giftFromThem ? t('sidebar.receivedGift') : t('sidebar.youSentGift');
          }
          return {
            id: conv.userId,
            name: profile?.firstName || otherUser?.email?.split('@')[0] || 'Unknown',
            message,
            unreadCount: conv.unreadCount || 0,
            avatar: profile?.photos?.[0]?.url || null,
            giftFromThem: !!giftFromThem,
            lastMessageAt: conv.lastMessage?.createdAt,
          };
        });
        const filtered = contactsList.filter(
          (c) => c.lastMessageAt || (c.message && c.message !== t('sidebar.noMessagesYet'))
        );
        filtered.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
          return dateB - dateA;
        });
        setContacts(filtered);
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
              let senderAge = null;
              if (request.senderData?.id) {
                try {
                  const profileResponse = await axios.get(`/api/profiles/${request.senderData.id}`);
                  if (profileResponse.data) {
                    senderName = profileResponse.data.firstName || senderName;
                    senderAvatar = profileResponse.data.photos?.[0]?.url || null;
                    senderAge = profileResponse.data.age ?? null;
                  }
                } catch (profileError) {
                  senderName = request.senderData.email?.split('@')[0] || 'Unknown';
                }
              }
              return {
                id: request.id,
                name: senderName,
                age: senderAge,
                message: request.firstMessage || request.content || t('sidebar.newMessage'),
                avatar: senderAvatar,
                senderId: request.senderData?.id || request.senderId,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
              };
            } catch (err) {
              return {
                id: request.id,
                name: request.senderData?.email?.split('@')[0] || 'Unknown',
                age: null,
                message: request.firstMessage || request.content || t('sidebar.newMessage'),
                avatar: null,
                senderId: request.senderData?.id || request.senderId,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const base = apiUrl ? apiUrl.replace(/\/$/, '') : '';
      const response = await axios.get(base ? `${base}/api/user/status` : '/api/user/status');
      setTodayStatus(response.data.status ?? null);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Fetch status error:', error);
      }
      setTodayStatus(null);
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

  // Listen for "learn more" from badge popups – open About modal and scroll to section
  useEffect(() => {
    const handleOpenAbout = (e) => {
      const sectionId = e.detail?.sectionId;
      setAboutSectionId(sectionId || null);
      setShowAboutModal(true);
    };
    window.addEventListener('openAboutWithSection', handleOpenAbout);
    return () => window.removeEventListener('openAboutWithSection', handleOpenAbout);
  }, []);

  // Open Privacy Policy modal when visiting /privacy or when event is dispatched
  useEffect(() => {
    if (location.pathname === '/privacy') setShowPrivacyModal(true);
  }, [location.pathname]);
  useEffect(() => {
    const handleOpenPrivacy = () => setShowPrivacyModal(true);
    window.addEventListener('openPrivacyPolicy', handleOpenPrivacy);
    return () => window.removeEventListener('openPrivacyPolicy', handleOpenPrivacy);
  }, []);
  useEffect(() => {
    if (location.pathname === '/refund') setShowRefundModal(true);
  }, [location.pathname]);
  useEffect(() => {
    const handleOpenRefund = () => setShowRefundModal(true);
    window.addEventListener('openRefundPolicy', handleOpenRefund);
    return () => window.removeEventListener('openRefundPolicy', handleOpenRefund);
  }, []);
  useEffect(() => {
    if (location.pathname === '/safety') setShowSafetyModal(true);
  }, [location.pathname]);
  useEffect(() => {
    const handleOpenSafety = () => setShowSafetyModal(true);
    window.addEventListener('openSafetyPolicy', handleOpenSafety);
    return () => window.removeEventListener('openSafetyPolicy', handleOpenSafety);
  }, []);
  useEffect(() => {
    if (location.pathname === '/terms') setShowTermsModal(true);
  }, [location.pathname]);
  useEffect(() => {
    const handleOpenTerms = () => setShowTermsModal(true);
    window.addEventListener('openTermsOfUse', handleOpenTerms);
    return () => window.removeEventListener('openTermsOfUse', handleOpenTerms);
  }, []);

  // Listen for "Get Verified" from VerifiedBadge – open Verify Identity modal
  useEffect(() => {
    const handleOpenVerify = () => {
      setShowVerifyIdentityModal(true);
    };
    window.addEventListener('openVerifyIdentityModal', handleOpenVerify);
    return () => window.removeEventListener('openVerifyIdentityModal', handleOpenVerify);
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

  const getStatusIconComponent = (status) => {
    const iconMap = {
      serious: CheckCircle,
      penpal: Users,
      romantic: Rose,
      flirty: LucideHeart,
      naughty: Smile,
    };
    return iconMap[status] || null;
  };

  const handleOpenPresents = () => {
    // Only allow quick presents when viewing someone else's profile
    const match = location.pathname.match(/^\/profile\/([^/]+)$/);
    if (match && match[1] !== 'me') {
      setPresentsReceiverId(match[1]);
      setShowPresentsModal(true);
    } else {
      alert('Open a member profile first to send a present.');
    }
  };

  const latestPendingChatRequest =
    [...chatRequests]
      .filter((r) => !r.status || r.status === 'pending')
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return db - da;
      })[0] || null;

  const latestPendingChatRequestKey = latestPendingChatRequest
    ? `${latestPendingChatRequest.id}-${latestPendingChatRequest.updatedAt || latestPendingChatRequest.createdAt || ''}-${latestPendingChatRequest.message || ''}`
    : null;

  // Mark all pending requests present on first load so we never show popup for them on refresh
  useEffect(() => {
    if (!user?.id || chatRequests.length === 0) return;
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    const pending = chatRequests.filter((r) => !r.status || r.status === 'pending');
    pending.forEach((r) => {
      const key = `${r.id}-${r.updatedAt || r.createdAt || ''}-${r.message || ''}`;
      seenRequestKeysRef.current.add(key);
    });
  }, [user?.id, chatRequests]);

  // Show popup only for requests that arrived after load (socket), not on refresh
  useEffect(() => {
    const requestKey = latestPendingChatRequestKey;
    if (!requestKey) {
      setShowChatRequestTeaser(false);
      setChatRequestTeaserProgress(0);
      return;
    }
    if (seenRequestKeysRef.current.has(requestKey)) {
      setShowChatRequestTeaser(false);
      return;
    }
    if (dismissedChatRequestKey === requestKey) {
      setShowChatRequestTeaser(false);
      return;
    }

    seenRequestKeysRef.current.add(requestKey);
    setShowChatRequestTeaser(true);
    setChatRequestTeaserProgress(0);

    const durationMs = 9000;
    const tickMs = 100;
    const step = (100 * tickMs) / durationMs;
    const timer = setInterval(() => {
      setChatRequestTeaserProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setShowChatRequestTeaser(false);
          setDismissedChatRequestKey(requestKey);
          return 100;
        }
        return next;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [latestPendingChatRequestKey, dismissedChatRequestKey]);

  const hasSubscription = !!(user?.subscriptionPlan && user.subscriptionPlan !== 'free');

  const handleRefillOrUpgrade = () => {
    if (hasSubscription) {
      openRefillModal();
    } else {
      openUpgradeModal();
    }
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
                <div className="relative">
                  <button
                    onClick={() => setShowTodayIAmModal(!showTodayIAmModal)}
                    className="flex items-center space-x-1 text-white hover:text-nex-orange transition"
                  >
                    {(() => {
                      const StatusIcon = getStatusIconComponent(todayStatus);
                      return (
                        StatusIcon && (
                          <StatusIcon className="w-4 h-4 mr-1" />
                        )
                      );
                    })()}
                    <span>{getStatusLabel(todayStatus)}</span>
                    <span className="text-xs">?</span>
                  </button>
                  
                  {/* Today I Am Dropdown */}
                  <TodayIAmModal
                    isOpen={showTodayIAmModal}
                    onClose={() => setShowTodayIAmModal(false)}
                    currentStatus={todayStatus}
                    onStatusUpdate={(status) => {
                      setTodayStatus(status);
                      fetchTodayStatus();
                      setShowTodayIAmModal(false);
                    }}
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowSearchModal(!showSearchModal)}
                    className="text-white hover:text-nex-orange transition"
                  >
                    {t('nav.search')}
                  </button>
                  
                  {/* Search Dropdown */}
                  <SearchFilterModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    onApplyFilters={(filters) => {
                      // Dispatch event to Dashboard to apply filters
                      window.dispatchEvent(new CustomEvent('applySearchFilters', { detail: filters }));
                      setShowSearchModal(false);
                    }}
                  />
                </div>
                <Link
                  to="/inbox"
                  className="relative text-white hover:text-nex-orange transition"
                >
                  {t('nav.inbox')}
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-nex-pink rounded-full"></span>
                </Link>
                {/* Upgrade / Refill button (hidden for streamers/talents) */}
                {!(user.userType === 'streamer' || user.userType === 'talent') && (
                  <button
                    type="button"
                    onClick={handleRefillOrUpgrade}
                    className="bg-gradient-nex text-white px-4 py-2 rounded hover:opacity-90 transition"
                  >
                    {hasSubscription ? t('common.refillAccount') : t('common.upgradeAccount')}
                  </button>
                )}
              </div>

              {/* Mobile Navigation - Icons only */}
              <div className="flex lg:hidden items-center space-x-2 sm:space-x-3">
                {/* 1. Search Icon */}
                <div className="relative">
                  <button
                    onClick={() => setShowSearchModal(!showSearchModal)}
                    className="text-white hover:text-nex-orange transition p-1.5 sm:p-2"
                  >
                    <FaSearch className="text-lg sm:text-xl" />
                  </button>
                  
                  {/* Search Dropdown */}
                  <SearchFilterModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    onApplyFilters={(filters) => {
                      // Dispatch event to Dashboard to apply filters
                      window.dispatchEvent(new CustomEvent('applySearchFilters', { detail: filters }));
                      setShowSearchModal(false);
                    }}
                  />
                </div>

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

                {/* 5. Upgrade/Refill Account Icon - opens appropriate modal (hidden for streamers/talents) */}
                {!(user.userType === 'streamer' || user.userType === 'talent') && (
                  <button
                    type="button"
                    onClick={handleRefillOrUpgrade}
                    className="text-white hover:text-nex-orange transition p-1.5 sm:p-2"
                    title={hasSubscription ? t('common.refillAccount') : t('common.upgradeAccount')}
                  >
                    <FaCoins className="text-lg sm:text-xl" />
                  </button>
                )}

                {/* Profile Dropdown */}
                <ProfileDropdown
                  onOpenSettings={() => setShowSettingsModal(true)}
                  onOpenPresents={handleOpenPresents}
                  onOpenAbout={() => setShowAboutModal(true)}
                />
              </div>

              {/* Desktop Profile Dropdown */}
              <div className="hidden lg:block">
                <ProfileDropdown
                  onOpenSettings={() => setShowSettingsModal(true)}
                  onOpenPresents={handleOpenPresents}
                  onOpenAbout={() => setShowAboutModal(true)}
                />
              </div>
            </nav>
          )}

          {!user && (
            <nav className="flex items-center space-x-4">
              <Link to="/login" className="text-white hover:text-nex-orange transition">
                {t('home.login')}
              </Link>
              <Link to="/register" className="bg-gradient-nex text-white px-4 py-2 rounded hover:opacity-90 transition">
                {t('home.getStarted')}
              </Link>
            </nav>
          )}
        </div>
      </div>

      {/* Global floating chat-request teaser (works anywhere in site) */}
      {latestPendingChatRequest &&
        showChatRequestTeaser &&
        latestPendingChatRequestKey !== dismissedChatRequestKey && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-2 sm:px-0 pointer-events-none">
            <div className="w-[275px] sm:w-[300px] rounded-xl shadow-2xl overflow-hidden border border-gray-200 pointer-events-auto bg-white">
              <div className="h-60 sm:h-72 w-full overflow-hidden relative">
                {latestPendingChatRequest.avatar ? (
                  <img
                    src={latestPendingChatRequest.avatar}
                    alt={latestPendingChatRequest.name || 'Chat request'}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowChatRequestTeaser(false);
                    setDismissedChatRequestKey(latestPendingChatRequestKey);
                  }}
                  className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 flex items-center justify-center shadow"
                  title="Remove"
                >
                  <FaTimes className="text-xs" />
                </button>
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-black/15 to-transparent" />
                <div className="absolute left-3 right-3 bottom-12 z-20 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-2xl leading-none">
                      {latestPendingChatRequest.name}
                      {latestPendingChatRequest.age ? `, ${latestPendingChatRequest.age}` : ''}
                    </h4>
                    <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse inline-block" />
                  </div>
                  <p className="text-sm opacity-95 line-clamp-1">
                    {latestPendingChatRequest.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => acceptChatRequestAndOpenChat(latestPendingChatRequest)}
                  className="absolute bottom-0 left-0 right-0 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 text-sm transition flex items-center justify-center gap-2 overflow-hidden"
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-teal-700 transition-[width] duration-100 linear"
                    style={{ width: `${chatRequestTeaserProgress}%` }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <FaComments className="text-sm" />
                    <span>REPLY</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Contacts sidebar modal - My Contacts + Chat Requests (same as page sidebars) */}
      {(showContactsModal || showChatRequestsModal) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowContactsModal(false);
            setShowChatRequestsModal(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800">{t('common.contacts')}</h2>
              <button
                type="button"
                onClick={() => {
                  setShowContactsModal(false);
                  setShowChatRequestsModal(false);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ContactsSidebar
                contacts={contacts}
                chatRequests={chatRequests}
                typingUsers={new Set()}
                onContactClick={(contact) => {
                  if (contact.id) {
                    navigate(`/profile/${contact.id}`, { state: { openChat: true } });
                    setShowContactsModal(false);
                    setShowChatRequestsModal(false);
                  }
                }}
                onAcceptChatRequest={(request) => {
                  setShowContactsModal(false);
                  setShowChatRequestsModal(false);
                  acceptChatRequestAndOpenChat(request);
                }}
                showLessChatRequests={showLessChatRequests}
                onToggleShowMoreChatRequests={() => setShowLessChatRequests(!showLessChatRequests)}
                contactsMaxHeight="max-h-64"
                chatRequestsMaxHeight="max-h-80"
                chatRequestLimit={5}
                compact
              />
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpen={handleSettingsModalOpen}
      />

      <QuickPresentsModal
        isOpen={showPresentsModal}
        onClose={() => setShowPresentsModal(false)}
        receiverId={presentsReceiverId}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => { setShowAboutModal(false); setAboutSectionId(null); }}
        initialSectionId={aboutSectionId}
      />

      <VerifyIdentityModal
        isOpen={showVerifyIdentityModal}
        onClose={() => setShowVerifyIdentityModal(false)}
      />

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => {
          setShowPrivacyModal(false);
          if (location.pathname === '/privacy') navigate('/');
        }}
      />

      <RefundPolicyModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          if (location.pathname === '/refund') navigate('/');
        }}
      />

      <SafetyPolicyModal
        isOpen={showSafetyModal}
        onClose={() => {
          setShowSafetyModal(false);
          if (location.pathname === '/safety') navigate('/');
        }}
      />

      <TermsOfUseModal
        isOpen={showTermsModal}
        onClose={() => {
          setShowTermsModal(false);
          if (location.pathname === '/terms') navigate('/');
        }}
      />

    </header>
  );
};

export default Header;

