import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { FaHeart, FaCamera, FaEnvelope, FaVideo, FaGift, FaSearch, FaVolumeUp, FaChevronDown, FaFire, FaCheckCircle, FaPlay, FaPhone, FaTimes, FaComment } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import MingleIntroModal from '../components/MingleIntroModal';
import LetsMingleModal from '../components/LetsMingleModal';
import MingleSuccessModal from '../components/MingleSuccessModal';
import StoriesCarousel from '../components/StoriesCarousel';
import ContactsSidebar from '../components/ContactsSidebar';
import FreeUserBadge from '../components/FreeUserBadge';
import VerifiedBadge from '../components/VerifiedBadge';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set()); // Track which users are typing
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerProfile, setCallerProfile] = useState(null); // Store caller's profile info
  const socketRef = useRef(null);
  const ringtoneRef = useRef(null); // Ref for ringtone audio element
  
  // Filter states
  const [filters, setFilters] = useState({
    gender: '',
    lookingFor: '',
    ageMin: '',
    ageMax: '',
    location: '',
    availableForVideoChat: false,
  });

  // Mingle states
  const [showMingleIntro, setShowMingleIntro] = useState(false);
  const [showMingleModal, setShowMingleModal] = useState(false);
  const [showMingleSuccess, setShowMingleSuccess] = useState(false);
  const [mingleMatchedProfiles, setMingleMatchedProfiles] = useState([]);

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
        
        // Play ringtone for incoming call
        try {
          // Get user's profile to check for custom ringtone
          const userProfileResponse = await axios.get('/api/profiles/me');
          const ringtoneFile = userProfileResponse.data.ringtone || 'defaultRingtone.mp3';
          const ringtonePath = `/ringtones/${ringtoneFile}`;
          
          if (ringtoneRef.current) {
            ringtoneRef.current.src = ringtonePath;
            ringtoneRef.current.loop = true;
            ringtoneRef.current.volume = 0.7;
            ringtoneRef.current.play().catch(err => {
              console.error('Error playing ringtone:', err);
            });
            console.log('🔔 Playing ringtone:', ringtonePath);
          }
        } catch (error) {
          console.error('Error setting up ringtone:', error);
          // Try default ringtone if user profile fetch fails
          if (ringtoneRef.current) {
            ringtoneRef.current.src = '/ringtones/defaultRingtone.mp3';
            ringtoneRef.current.loop = true;
            ringtoneRef.current.volume = 0.7;
            ringtoneRef.current.play().catch(err => {
              console.error('Error playing default ringtone:', err);
            });
          }
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
        // Stop ringtone
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }
        setIncomingCall(null);
        setCallerProfile(null);
      });

      // Listen for call cancelled (when caller cancels before receiver accepts)
      socket.on('call-cancelled', (data) => {
        console.log('❌ [RECEIVER] Call cancelled by caller:', data);
        // Stop ringtone
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }
        setIncomingCall(null);
        setCallerProfile(null);
      });

      // Listen for call ended
      socket.on('call-ended', (data) => {
        console.log('📴 Call ended:', data);
        // Stop ringtone
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }
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

      // Listen for typing events
      socket.on('user-typing', (data) => {
        if (data.userId && data.userId !== String(user.id)) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
          setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }, 3000);
        }
      });

      socket.on('user-stopped-typing', (data) => {
        if (data.userId && data.userId !== String(user.id)) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
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

  // Check if we should open search modal, mingle intro, or redirect to complete profile
  useEffect(() => {
    if (location.state?.openSearchModal) {
      setShowSearchModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.openMingleIntro) {
      setShowMingleIntro(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Login link with incomplete registration: open dashboard first, then redirect to complete profile
    if (location.state?.openCompleteProfile) {
      navigate('/complete-profile', { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Listen for custom event to apply search filters from Header
  useEffect(() => {
    const handleApplySearchFilters = (event) => {
      const filters = event.detail;
      handleApplyFilters(filters);
    };
    
    window.addEventListener('applySearchFilters', handleApplySearchFilters);
    
    return () => {
      window.removeEventListener('applySearchFilters', handleApplySearchFilters);
    };
  }, []);

  // Listen for custom event to open mingle intro modal
  useEffect(() => {
    const handleOpenMingleIntro = () => {
      setShowMingleIntro(true);
    };
    
    window.addEventListener('openMingleIntro', handleOpenMingleIntro);
    
    return () => {
      window.removeEventListener('openMingleIntro', handleOpenMingleIntro);
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
          
          const lastMsg = conv.lastMessage;
          const senderId = lastMsg?.sender ?? lastMsg?.sender_id;
          const giftFromThem = lastMsg?.messageType === 'gift' && senderId === conv.userId;
          let message = conv.lastMessage?.content || 'No messages yet';
          if (lastMsg?.messageType === 'gift') {
            message = giftFromThem ? 'Received a gift' : 'You sent a gift';
          }
          if (
            typeof message === 'string' &&
            message.trim() === 'Added you to my contacts.' &&
            senderId === user?.id
          ) {
            message = 'Added to your Contacts';
          }
          return {
            id: conv.userId,
            name: profile?.firstName || otherUser?.email?.split('@')[0] || 'Unknown',
            type: null,
            message,
            unreadCount: conv.unreadCount || 0,
            avatar: profile?.photos?.[0]?.url || null,
            lastMessageAt: conv.lastMessage?.createdAt,
            giftFromThem: !!giftFromThem,
          };
        });
        // Remove contacts with no activity (\"No messages yet\" and no timestamp)
        const filtered = contactsList.filter(
          (c) => c.lastMessageAt || (c.message && c.message !== 'No messages yet')
        );
        // Sort by latest activity (newest first)
        filtered.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
          return dateB - dateA;
        });
        setContacts(filtered);
      } else {
        // No conversations found – no contacts
        setContacts([]);
      }
    } catch (error) {
      console.error('Fetch contacts error:', error);
      // On error, clear contacts (no fake Concierge)
      setContacts([]);
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
              let senderAge = null;
              
              if (request.senderData?.id) {
                try {
                  const profileResponse = await axios.get(`/api/profiles/${request.senderData.id}`);
                  if (profileResponse.data) {
                    senderName = profileResponse.data.firstName || senderName;
                    senderAvatar = profileResponse.data.photos?.[0]?.url || null;
                    senderAge = profileResponse.data.age ?? senderAge;
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
                age: senderAge,
                message: messageText,
                avatar: senderAvatar,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
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
                age: null,
                message: request.firstMessage || request.content || 'New message',
                avatar: null,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
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


  const acceptChatRequestAndOpenChat = async (request) => {
    try {
      // Accept the chat request so it becomes a real chat/conversation
      await axios.put(`/api/messages/chat-requests/${request.id}/accept`);
    } catch (error) {
      console.error('Accept chat request error (dashboard):', error);
      // If already accepted, backend may return an error – ignore for navigation
    } finally {
      // Ensure contacts/chat lists update
      fetchChatRequests();
      fetchContacts();

      if (request.senderId) {
        navigate(`/profile/${request.senderId}`, {
          state: { openChat: true, from: 'chat-request', requestId: request.id },
        });
      }
    }
  };

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
      
      // Stop ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      
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
      
      // Stop ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      
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
      {/* Ringtone Audio Element */}
      <audio ref={ringtoneRef} preload="auto" />
      
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

      {/* Stories Carousel */}
      <StoriesCarousel />


      {/* Mingle Intro Modal - Step 1 */}
      <MingleIntroModal
        isOpen={showMingleIntro}
        onClose={() => setShowMingleIntro(false)}
        onGetStarted={() => {
          setShowMingleIntro(false);
          setShowMingleModal(true);
        }}
      />

      {/* Let's Mingle Modal - Step 2 */}
      <LetsMingleModal
        isOpen={showMingleModal}
        onClose={() => setShowMingleModal(false)}
        onSuccess={(matchedProfiles) => {
          setMingleMatchedProfiles(matchedProfiles);
          setShowMingleModal(false);
          setShowMingleSuccess(true);
        }}
      />

      {/* Mingle Success Modal - Step 3 */}
      <MingleSuccessModal
        isOpen={showMingleSuccess}
        onClose={() => setShowMingleSuccess(false)}
        matchedProfiles={mingleMatchedProfiles}
        onMingleAgain={() => {
          setShowMingleSuccess(false);
          setShowMingleIntro(true);
        }}
      />

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:mr-80">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-6">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {profiles.map((profile) => {
              // Count photos and videos from the photos array
              const allMedia = profile.photos || [];
              const photoCount = allMedia.filter(photo => {
                // Check if it's a photo (not a video)
                // Videos typically have .mp4, .mov, .webm extensions or video/ mimetype
                if (typeof photo === 'string') return true; // Assume string URLs are photos
                const url = photo?.url || photo;
                if (!url) return false;
                const lowerUrl = url.toLowerCase();
                return !lowerUrl.includes('.mp4') && !lowerUrl.includes('.mov') && !lowerUrl.includes('.webm') && !lowerUrl.includes('video/');
              }).length;
              
              const videoCount = allMedia.filter(photo => {
                // Check if it's a video
                if (typeof photo === 'string') {
                  const lowerUrl = photo.toLowerCase();
                  return lowerUrl.includes('.mp4') || lowerUrl.includes('.mov') || lowerUrl.includes('.webm');
                }
                const url = photo?.url || photo;
                if (!url) return false;
                const lowerUrl = url.toLowerCase();
                return lowerUrl.includes('.mp4') || lowerUrl.includes('.mov') || lowerUrl.includes('.webm') || lowerUrl.includes('video/') || photo?.type === 'video' || photo?.mediaType === 'video';
              }).length;
              
              const isOnline = profile.isOnline || false;
              
              return (
                <div
                  key={profile.id || profile.userId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition relative cursor-pointer isolate"
                  style={{
                    minHeight: '400px',
                    backgroundImage: profile.photos && profile.photos.length > 0 
                      ? `url(${typeof profile.photos[0] === 'string' ? profile.photos[0] : profile.photos[0]?.url || ''})` 
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onClick={() => navigate(`/profile/${profile.userId}`)}
                >
                  {/* Fallback background if no image */}
                  {(!profile.photos || profile.photos.length === 0) && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-0">
                      <FaHeart className="text-3xl sm:text-4xl lg:text-6xl text-gray-400" />
                    </div>
                  )}

                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent z-[5]"></div>

                  {/* Top-left: Free User badge (flame) – only if user is Free User */}
                  {profile.user?.isFreeUser !== false && (
                    <div className="absolute top-1 left-1 sm:top-3 sm:left-3 z-[20]" onClick={(e) => e.stopPropagation()}>
                      <FreeUserBadge size="sm" />
                    </div>
                  )}
                  {/* Top-right: Verified badge – only if user is verified */}
                  {profile.user?.isVerified && (
                    <div className="absolute top-1 right-1 sm:top-3 sm:right-3 z-[20]" onClick={(e) => e.stopPropagation()}>
                      <VerifiedBadge size="sm" />
                    </div>
                  )}
                  
                  {/* Bottom-left photo/video count */}
                  <div className="absolute bottom-20 left-1 sm:bottom-24 sm:left-3 flex items-center space-x-1 sm:space-x-3 z-[20]">
                    {photoCount > 0 && (
                      <span 
                        className="flex items-center space-x-0.5 sm:space-x-1 text-white text-[10px] sm:text-xs bg-black bg-opacity-60 rounded px-1 sm:px-2 py-0.5 sm:py-1 cursor-pointer hover:bg-opacity-80 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${profile.userId}`, { state: { showPhotos: true } });
                        }}
                        title={`${photoCount} photo${photoCount !== 1 ? 's' : ''}`}
                      >
                        <FaCamera className="text-[10px] sm:text-xs" />
                        <span className="font-semibold">{photoCount}</span>
                      </span>
                    )}
                    {videoCount > 0 && (
                      <span 
                        className="flex items-center space-x-0.5 sm:space-x-1 text-white text-[10px] sm:text-xs bg-black bg-opacity-60 rounded px-1 sm:px-2 py-0.5 sm:py-1 cursor-pointer hover:bg-opacity-80 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${profile.userId}`, { state: { showVideos: true } });
                        }}
                        title={`${videoCount} video${videoCount !== 1 ? 's' : ''}`}
                      >
                        <FaVideo className="text-[10px] sm:text-xs" />
                        <span className="font-semibold">{videoCount}</span>
                      </span>
                    )}
                  </div>

                  {/* Profile Info - Overlaid at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 z-[30] bg-gradient-to-t from-black/70 via-black/50 to-transparent">
                    <div className="flex items-center space-x-1 sm:space-x-2 mb-2 relative z-[35]">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white truncate drop-shadow-lg">
                        {profile.firstName} {profile.lastName ? profile.lastName : ''}, {profile.age}
                      </h3>
                      {/* Online/Offline Status Indicator */}
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      {profile.user?.userType === 'streamer' && (
                        <FaVideo className="text-white text-xs sm:text-sm flex-shrink-0 drop-shadow-lg" />
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="relative z-[40]">
                      {isOnline ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${profile.userId}`, {
                              state: { openChat: true },
                            });
                          }}
                          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded transition font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg relative z-[40]"
                        >
                          <FaComment className="text-xs" />
                          <span>CHAT NOW</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${profile.userId}`, {
                              state: { openEmailComposer: true },
                            });
                          }}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg relative z-[40]"
                        >
                          <FaEnvelope className="text-xs" />
                          <span>SEND EMAIL</span>
                        </button>
                      )}
                    </div>
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

        {/* Right Sidebar - Fixed - Hidden on mobile */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200 fixed right-0 top-16 h-[calc(100vh-4rem)] flex flex-col z-20 shadow-lg overflow-hidden">
          <ContactsSidebar
            contacts={contacts}
            chatRequests={chatRequests}
            typingUsers={typingUsers}
            onContactClick={(contact) => {
              if (contact.id && contact.id !== 'system-concierge' && typeof contact.id === 'string' && !contact.id.includes('system-')) {
                navigate(`/profile/${contact.id}`, { state: { openChat: true } });
              }
            }}
            onAcceptChatRequest={acceptChatRequestAndOpenChat}
            showLessChatRequests={showLessChatRequests}
            onToggleShowMoreChatRequests={() => setShowLessChatRequests(!showLessChatRequests)}
            contactsMaxHeight="max-h-64"
            chatRequestsMaxHeight="flex-1 min-h-0"
            chatRequestLimit={5}
          />
        </div>
    </div>
  );
};

export default Dashboard;
