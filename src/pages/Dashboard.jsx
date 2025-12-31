import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { FaHeart, FaCamera, FaEnvelope, FaVideo, FaGift, FaSearch, FaVolumeUp, FaChevronDown, FaFire, FaCheckCircle, FaPlay, FaPhone, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import SearchFilterModal from '../components/SearchFilterModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerProfile, setCallerProfile] = useState(null); // Store caller's profile info
  const socketRef = useRef(null);
  
  // Filter states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    lookingFor: '',
    ageMin: '',
    ageMax: '',
    location: '',
    availableForVideoChat: false,
  });

  // Socket.IO setup for real-time call notifications
  useEffect(() => {
    if (user?.id) {
      // Initialize socket connection - Socket.IO needs direct connection to backend
      // Vite proxy doesn't work for WebSockets, so connect directly to backend port
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🔌 [RECEIVER] Connecting to Socket.IO server:', apiUrl);
      
      const socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 20000, // 20 seconds timeout
        forceNew: false,
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('✅ [RECEIVER] Socket connected:', socket.id);
        console.log('✅ [RECEIVER] User ID:', user.id);
        console.log('✅ [RECEIVER] Socket URL:', apiUrl);
        // Join user's room
        socket.emit('join-room', String(user.id));
        console.log('📢 [RECEIVER] Emitted join-room for user-' + user.id);
        
        // Verify socket is ready to receive calls
        console.log('✅ [RECEIVER] Socket ready to receive incoming calls');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        // Don't show alert for timeout errors - they're common and will retry
        if (error.message && !error.message.includes('timeout')) {
          console.warn('Socket.IO connection issue - will retry automatically');
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('⚠️ Socket disconnected:', reason);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        socket.emit('join-room', String(user.id));
      });

      // Listen for incoming calls - CRITICAL: Must be set up before any calls are made
      socket.on('incoming-call', async (data) => {
        console.log('📞 [RECEIVER] ========== INCOMING CALL RECEIVED ==========');
        console.log('📞 [RECEIVER] Full data:', JSON.stringify(data, null, 2));
        console.log('📞 [RECEIVER] Caller ID:', data.callerId);
        console.log('📞 [RECEIVER] Call Type:', data.callType);
        console.log('📞 [RECEIVER] Channel Name:', data.channelName);
        
        // Use channel name from caller if provided
        const channelName = data.channelName || null;
        
        setIncomingCall({
          callerId: data.callerId,
          callType: data.callType,
          channelName: channelName, // Store channel name for when accepting call
        });
        
        // Fetch caller's profile to show in notification
        try {
          const profileResponse = await axios.get(`/api/profiles/${data.callerId}`);
          setCallerProfile(profileResponse.data);
          console.log('✅ [RECEIVER] Fetched caller profile:', profileResponse.data.firstName);
        } catch (error) {
          console.error('⚠️ [RECEIVER] Could not fetch caller profile:', error);
          // Continue without profile - notification will still work
        }
        
        console.log('✅ [RECEIVER] Incoming call state set - UI should show call notification');
      });

      // Listen for call accepted
      socket.on('call-accepted', (data) => {
        console.log('✅ Call accepted:', data);
      });

      // Listen for call rejected
      socket.on('call-rejected', (data) => {
        console.log('❌ Call rejected:', data);
        setIncomingCall(null);
        setCallerProfile(null);
      });

      // Listen for call cancelled (when caller cancels before receiver accepts)
      socket.on('call-cancelled', (data) => {
        console.log('❌ [RECEIVER] Call cancelled by caller:', data);
        setIncomingCall(null);
        setCallerProfile(null);
      });

      // Listen for call ended
      socket.on('call-ended', (data) => {
        console.log('📴 Call ended:', data);
        setIncomingCall(null);
      });

      // Listen for new chat requests
      socket.on('new-chat-request', (data) => {
        console.log('📬 New chat request received:', data);
        // Refresh chat requests list
        fetchChatRequests();
      });

      // Listen for contact updates (new messages, new chats)
      socket.on('contact-update', (data) => {
        console.log('👥 Contact update received:', data);
        // Refresh contacts list
        fetchContacts();
      });

      // Listen for new messages
      socket.on('new-message', (data) => {
        console.log('💬 New message received:', data);
        // Refresh contacts to update last message
        fetchContacts();
      });

      // Listen for chat request accepted
      socket.on('chat-request-accepted', (data) => {
        console.log('✅ Chat request accepted:', data);
        // Refresh chat requests and contacts
        fetchChatRequests();
        fetchContacts();
      });

      socketRef.current = socket;

      return () => {
        console.log('🔌 Disconnecting socket');
        socket.disconnect();
      };
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfiles();
    fetchContacts();
    fetchChatRequests();
    fetchOnlineUsers();
    
    // Refresh contacts and chat requests periodically
    const contactsInterval = setInterval(() => {
      fetchContacts();
    }, 10000); // Every 10 seconds
    
    const chatRequestsInterval = setInterval(() => {
      fetchChatRequests();
    }, 10000); // Every 10 seconds
    
    return () => {
      clearInterval(contactsInterval);
      clearInterval(chatRequestsInterval);
    };
  }, [user]);

  // Check if we should open search modal from navigation
  useEffect(() => {
    if (location.state?.openSearchModal) {
      setShowSearchModal(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Listen for custom event to open search modal (when already on dashboard)
  useEffect(() => {
    const handleOpenSearchModal = () => {
      setShowSearchModal(true);
    };
    
    window.addEventListener('openSearchModal', handleOpenSearchModal);
    
    return () => {
      window.removeEventListener('openSearchModal', handleOpenSearchModal);
    };
  }, []);

  // Refetch profiles when filters change
  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);


  // Handle filter modal apply
  const handleApplyFilters = (appliedFilters) => {
    setFilters({
      gender: appliedFilters.gender || '',
      lookingFor: appliedFilters.lookingFor || '',
      ageMin: appliedFilters.ageMin || '',
      ageMax: appliedFilters.ageMax || '',
      location: appliedFilters.location || '',
      availableForVideoChat: appliedFilters.availableForVideoChat || false,
    });
    setShowSearchModal(false);
  };

  const fetchOnlineUsers = async () => {
    try {
      // Fetch online users for the top row
      const response = await axios.get('/api/profiles?limit=20');
      if (response.data && response.data.profiles) {
        const online = response.data.profiles.filter(p => p.isOnline).slice(0, 15);
        setOnlineUsers(online);
      } else {
        setOnlineUsers([]);
      }
    } catch (error) {
      console.error('Fetch online users error:', error);
      setOnlineUsers([]);
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching profiles...');
      
      // Ensure token is set
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Gender filter - lookingFor is what gender we're looking for
      if (filters.lookingFor) {
        if (filters.lookingFor === 'both') {
          // Don't filter by gender if "both" is selected
        } else {
          params.append('gender', filters.lookingFor);
        }
      }
      
      // Age range filters
      if (filters.ageMin) params.append('minAge', filters.ageMin.toString());
      if (filters.ageMax) params.append('maxAge', filters.ageMax.toString());
      
      // Location filter
      if (filters.location && filters.location.trim()) {
        const locationParts = filters.location.split(',');
        if (locationParts[0] && locationParts[0].trim()) {
          params.append('city', locationParts[0].trim());
        }
        if (locationParts[1] && locationParts[1].trim()) {
          params.append('country', locationParts[1].trim());
        }
      }
      
      // Video chat filter
      if (filters.availableForVideoChat) {
        params.append('videoChat', 'true');
      }
      
      const queryString = params.toString();
      const url = queryString ? `/api/profiles?${queryString}` : '/api/profiles';
      
      console.log('Fetching profiles with URL:', url);
      const response = await axios.get(url);
      console.log('Profiles response:', response.data);
      console.log('Profiles count:', response.data?.profiles?.length || 0);
      
      if (response.data && response.data.profiles) {
        console.log('Setting profiles:', response.data.profiles.length);
        setProfiles(response.data.profiles);
      } else {
        console.warn('No profiles in response:', response.data);
        setProfiles([]);
      }
    } catch (error) {
      console.error('Fetch profiles error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      await axios.post(`/api/matches/like/${userId}`);
      fetchProfiles();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handlePass = async (userId) => {
    try {
      await axios.post(`/api/matches/pass/${userId}`);
      fetchProfiles();
    } catch (error) {
      console.error('Pass error:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      // Fetch conversations/chats from API
      const response = await axios.get('/api/messages/conversations');
      
      if (response.data && Array.isArray(response.data)) {
        const contactsList = response.data.map((conv) => {
          const otherUser = conv.user;
          const profile = otherUser?.profile; // Access profile data
          
          return {
            id: conv.userId,
            name: profile?.firstName || otherUser?.email?.split('@')[0] || 'Unknown',
            type: null,
            message: conv.lastMessage?.content || 'No messages yet',
            unreadCount: conv.unreadCount || 0,
            avatar: profile?.photos?.[0]?.url || null,
            lastMessageAt: conv.lastMessage?.createdAt,
          };
        });
        
        // Add system contact (Concierge) if needed
        contactsList.unshift({
          id: 'system-concierge',
          name: 'Julia Concierge',
          type: 'Concierge',
          message: 'Welcome to Dating...',
          unreadCount: 1,
          avatar: null,
        });
        
        setContacts(contactsList);
      } else {
        // Fallback to default contact
        setContacts([
          {
            id: 1,
            name: 'Julia Concierge',
            type: 'Concierge',
            message: 'Welcome to Dating...',
            unreadCount: 1,
            avatar: null,
          },
        ]);
      }
    } catch (error) {
      console.error('Fetch contacts error:', error);
      // Fallback to default contact on error
      setContacts([
        {
          id: 1,
          name: 'Julia Concierge',
          type: 'Concierge',
          message: 'Welcome to Dating...',
          unreadCount: 1,
          avatar: null,
        },
      ]);
    }
  };

  const fetchChatRequests = async () => {
    try {
      const response = await axios.get('/api/messages/chat-requests');
      
      if (response.data && Array.isArray(response.data)) {
        // Transform chat requests to include user profile data
        const requests = await Promise.all(
          response.data.map(async (request) => {
            try {
              // Fetch sender profile if available
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
                  // Use email as fallback
                  senderName = request.senderData.email?.split('@')[0] || 'Unknown';
                }
              }
              
              // Check if it's a video/audio call request or regular message
              const messageText = request.firstMessage || request.content || request.message || 'New message';
              const isVideoChat = messageText.toLowerCase().includes('video chat') || messageText.toLowerCase().includes('inviting you to video');
              const isAudioChat = messageText.toLowerCase().includes('audio chat') || messageText.toLowerCase().includes('voice chat');
              const hasEmail = messageText.toLowerCase().includes('email') || request.messageType === 'email';
              
              return {
                id: request.id,
                name: senderName,
                message: messageText,
                avatar: senderAvatar,
                createdAt: request.createdAt,
                status: request.status || 'pending',
                senderId: request.senderData?.id || request.senderId,
                senderData: request.senderData,
                isVideoChat: isVideoChat,
                isAudioChat: isAudioChat,
                hasEmail: hasEmail,
              };
            } catch (err) {
              return {
                id: request.id,
                name: request.senderData?.email?.split('@')[0] || 'Unknown',
                message: request.firstMessage || request.content || 'New message',
                avatar: null,
                createdAt: request.createdAt,
                status: request.status || 'pending',
                senderId: request.senderData?.id || request.senderId,
                senderData: request.senderData,
                isVideoChat: false,
                isAudioChat: false,
                hasEmail: false,
              };
            }
          })
        );
        
        setChatRequests(requests);
      } else {
        setChatRequests([]);
      }
    } catch (error) {
      console.error('Fetch chat requests error:', error);
      setChatRequests([]);
    }
  };

  const displayedChatRequests = showLessChatRequests ? chatRequests.slice(0, 5) : chatRequests;

  const getActionButton = (profile) => {
    // Determine action button based on profile status
    if (profile.isOnline && profile.user?.userType === 'streamer') {
      return (
        <button
          onClick={() => navigate(`/profile/${profile.userId}`)}
          className="w-full bg-gradient-nex text-white py-2 px-4 rounded hover:opacity-90 transition font-semibold text-sm"
        >
          WATCH NOW
        </button>
      );
    } else if (profile.isOnline) {
      return (
        <button
          onClick={() => navigate(`/profile/${profile.userId}`)}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition font-semibold text-sm"
        >
          START VIDEO CHAT
        </button>
      );
    } else {
      const actions = [
        { label: 'CHAT NOW', color: 'bg-blue-500 hover:bg-blue-600' },
        { label: 'SEND EMAIL', color: 'bg-purple-500 hover:bg-purple-600' },
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      return (
        <button
          onClick={() => navigate(`/profile/${profile.userId}`)}
          className={`w-full ${randomAction.color} text-white py-2 px-4 rounded transition font-semibold text-sm`}
        >
          {randomAction.label}
        </button>
      );
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall && socketRef.current && user?.id) {
      console.log('✅ [RECEIVER] Accepting call:', incomingCall);
      
      // Emit call accepted event
      socketRef.current.emit('call-accept', {
        callerId: incomingCall.callerId,
        receiverId: user.id,
      });

      // Store call info for navigation
      if (incomingCall.channelName) {
        sessionStorage.setItem('pendingCall', JSON.stringify({
          callType: incomingCall.callType,
          channelName: incomingCall.channelName,
          callerId: incomingCall.callerId
        }));
      }

      // Navigate to caller's profile
      navigate(`/profile/${incomingCall.callerId}`);
      setIncomingCall(null);
    } else {
      console.error('❌ [RECEIVER] Cannot accept call - missing data:', {
        hasIncomingCall: !!incomingCall,
        hasSocket: !!socketRef.current,
        hasUserId: !!user?.id
      });
    }
  };

  const handleRejectCall = () => {
    if (incomingCall && socketRef.current && user?.id) {
      console.log('❌ [RECEIVER] Rejecting call:', incomingCall);
      socketRef.current.emit('call-reject', {
        callerId: incomingCall.callerId,
        receiverId: user.id,
      });
      setIncomingCall(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
            <div className="text-center mb-6">
              {/* Caller Avatar or Icon */}
              {(callerProfile?.photos?.[0]?.url || (typeof callerProfile?.photos?.[0] === 'string' ? callerProfile.photos[0] : null)) ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-teal-400 shadow-lg">
                  <img 
                    src={callerProfile.photos[0]?.url || callerProfile.photos[0]} 
                    alt={callerProfile.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {incomingCall.callType === 'video' ? (
                    <FaVideo className="text-white text-4xl" />
                  ) : (
                    <FaPhone className="text-white text-4xl" />
                  )}
                </div>
              )}
              
              {/* Caller Name */}
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {callerProfile?.firstName || 'Incoming Call'}
              </h3>
              
              {/* Call Type */}
              <p className="text-gray-600 mb-4">
                {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
              </p>
              
              {/* Animated indicator */}
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleRejectCall}
                className="flex-1 bg-red-500 text-white py-4 px-6 rounded-xl hover:bg-red-600 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
              >
                <FaTimes size={18} />
                <span>Decline</span>
              </button>
              <button
                onClick={handleAcceptCall}
                className="flex-1 bg-green-500 text-white py-4 px-6 rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
              >
                {incomingCall.callType === 'video' ? <FaVideo size={18} /> : <FaPhone size={18} />}
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Top Row of Online Users */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
            {onlineUsers.map((user) => (
              <Link
                key={user.id || user.userId}
                to={`/profile/${user.userId}`}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition"
              >
                <div className="relative">
                  {user.photos && user.photos.length > 0 ? (
                    <img
                      src={user.photos[0].url}
                      alt={user.firstName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center border-2 border-gray-300">
                      <span className="text-white font-semibold text-lg">{user.firstName?.[0] || 'U'}</span>
                    </div>
                  )}
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <span className="text-xs text-gray-700 mt-1 text-center max-w-[60px] truncate">
                  {user.firstName}
                </span>
              </Link>
            ))}
            {onlineUsers.length === 0 && (
              <div className="text-gray-500 text-sm">No online users</div>
            )}
          </div>
        </div>
      </div>

      {/* Search Filter Modal */}
      <SearchFilterModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onApplyFilters={handleApplyFilters}
      />

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 min-w-0" style={{ marginRight: '320px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {profiles.map((profile) => {
              const photoCount = profile.photos?.length || 0;
              const videoCount = Math.floor(Math.random() * 3); // Random video count for demo
              
              return (
                <div
                  key={profile.id || profile.userId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition relative cursor-pointer"
                  onClick={() => navigate(`/profile/${profile.userId}`)}
                >
                  {/* Profile Photo */}
                  <div className="relative">
                    {profile.photos && profile.photos.length > 0 ? (
                      <>
                        <img
                          src={profile.photos[0].url}
                          alt={profile.firstName}
                          className="w-full h-96 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {/* Top-left flame icon */}
                        <div className="absolute top-3 left-3">
                          <div className="bg-orange-500 rounded-full p-2">
                            <FaFire className="text-white text-sm" />
                          </div>
                        </div>
                        
                        {/* Top-right checkmark */}
                        <div className="absolute top-3 right-3">
                          <div className="bg-blue-500 rounded-full p-2">
                            <FaCheckCircle className="text-white text-sm" />
                          </div>
                        </div>
                        
                        {/* Bottom-left photo/video count */}
                        <div className="absolute bottom-3 left-3 flex items-center space-x-3">
                          {photoCount > 0 && (
                            <span className="flex items-center space-x-1 text-white text-xs bg-black bg-opacity-60 rounded px-2 py-1">
                              <FaCamera className="text-xs" />
                              <span className="font-semibold">{photoCount}</span>
                            </span>
                          )}
                          {videoCount > 0 && (
                            <span className="flex items-center space-x-1 text-white text-xs bg-black bg-opacity-60 rounded px-2 py-1">
                              <FaPlay className="text-xs" />
                              <span className="font-semibold">{videoCount}</span>
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                        <FaHeart className="text-6xl text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {profile.firstName} {profile.lastName ? profile.lastName : ''}, {profile.age}
                      </h3>
                      {profile.isOnline && (
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      )}
                      {profile.user?.userType === 'streamer' && (
                        <FaVideo className="text-gray-400 text-sm" />
                      )}
                    </div>
                    
                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

              {profiles.length === 0 && !loading && (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-600 text-lg mb-2">No profiles found</p>
                  <p className="text-gray-500 text-sm">Try refreshing the page or check back later</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Fixed */}
        <div className="w-80 bg-white border-l border-gray-200 fixed right-0 top-16 h-[calc(100vh-4rem)] flex flex-col z-20 shadow-lg">
          {/* My Contacts - Fixed Section */}
          <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-base">My Contacts</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                {contacts.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + c.unreadCount, 0)}
              </span>
            </div>

            {contacts.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id || `contact-${Math.random()}`} 
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition group"
                    onClick={() => {
                      if (contact.id && contact.id !== 'system-concierge' && typeof contact.id === 'string' && !contact.id.includes('system-')) {
                        navigate(`/profile/${contact.id}`);
                      }
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-teal-300 transition">
                        {contact.avatar ? (
                          <img 
                            src={contact.avatar} 
                            alt={contact.name || 'Contact'} 
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">{contact.name?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="font-semibold text-gray-800 text-sm truncate">{contact.name || 'Unknown'}</span>
                          {contact.type && (
                            <span className="text-red-500 text-xs font-medium whitespace-nowrap bg-red-50 px-2 py-0.5 rounded">
                              {contact.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.message || 'No messages yet'}</p>
                      {contact.lastMessageAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(contact.lastMessageAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaEnvelope className="text-gray-400 text-2xl" />
                </div>
                <p className="text-sm text-gray-500">No contacts yet</p>
                <p className="text-xs text-gray-400 mt-1">Start chatting to see your contacts here</p>
              </div>
            )}

            {/* Search Contact */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search contact"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
              />
              <FaVolumeUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition" />
            </div>
          </div>

          {/* Chat Requests - Scrollable Section */}
          <div className="p-4 bg-white flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="font-semibold text-gray-800 text-base">Chat Requests</h3>
              <button
                onClick={() => setShowLessChatRequests(!showLessChatRequests)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
              >
                {showLessChatRequests ? 'SHOW MORE' : 'SHOW LESS'}
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
              {displayedChatRequests.length > 0 ? (
                displayedChatRequests
                  .filter((request) => request.status === 'pending')
                  .map((request) => {
                    // Determine button text and action
                    const isVideoOrAudio = request.isVideoChat || request.isAudioChat;
                    const buttonText = isVideoOrAudio ? 'Start' : 'Reply';
                    const buttonColor = isVideoOrAudio ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';
                    
                    return (
                      <div
                        key={request.id}
                        className="border-b border-gray-200 pb-3 last:border-b-0"
                      >
                        {/* Name and Action Button Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {request.avatar ? (
                                <img 
                                  src={request.avatar} 
                                  alt={request.name || 'User'} 
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-white text-sm font-semibold">{request.name?.[0]?.toUpperCase() || '?'}</span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{request.name || 'Unknown'}</h4>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (request.senderId) {
                                navigate(`/profile/${request.senderId}`);
                              }
                            }}
                            className={`${buttonColor} text-white text-xs font-semibold px-3 py-1.5 rounded transition flex-shrink-0`}
                          >
                            {buttonText}
                          </button>
                        </div>
                        
                        {/* Message Preview */}
                        <div className="flex items-center space-x-1 ml-12">
                          {request.isVideoChat && (
                            <FaVideo className="text-green-500 text-xs flex-shrink-0" />
                          )}
                          {request.isAudioChat && (
                            <FaVolumeUp className="text-blue-500 text-xs flex-shrink-0" />
                          )}
                          {request.hasEmail && (
                            <FaEnvelope className="text-red-500 text-xs flex-shrink-0" />
                          )}
                          <p className="text-xs text-gray-600 truncate flex-1">
                            {request.message || 'New chat request'}
                          </p>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No chat requests
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
