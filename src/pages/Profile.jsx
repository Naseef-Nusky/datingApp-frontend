import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  FaHeart, FaCamera, FaVideo, FaEnvelope, FaPhone, FaStar, 
  FaCheckCircle, FaLeaf, FaMedal, FaMapMarkerAlt, FaPlay,
  FaSearch, FaVolumeUp, FaChevronDown, FaTimes
} from 'react-icons/fa';
import AgoraVideoCall from '../components/AgoraVideoCall';
import AgoraVoiceCall from '../components/AgoraVoiceCall';
import AgoraChat from '../components/AgoraChat';
import ProfileEmailComposer from '../components/ProfileEmailComposer';
import ProfilePhotoViewer from '../components/ProfilePhotoViewer';
import { createSafeChannelName } from '../utils/agoraUtils';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [callRequests, setCallRequests] = useState([]); // Missed calls
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [message, setMessage] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callChannelName, setCallChannelName] = useState(null); // Store channel name for RTC
  const [callerProfile, setCallerProfile] = useState(null); // Store caller's profile info
  const [outgoingCall, setOutgoingCall] = useState(null); // Track outgoing call waiting for acceptance
  const outgoingCallRef = useRef(null); // Ref to track outgoing call (for socket handlers)
  const socketRef = useRef(null);
  const ringtoneRef = useRef(null); // Ref for ringtone audio element

  // Open chat or email composer automatically when coming from dashboard with state
  useEffect(() => {
    if (location.state?.openEmailComposer) {
      setShowEmailComposer(true);
      setShowChat(false);
    } else if (location.state?.openChat) {
      setShowChat(true);
      setShowEmailComposer(false);
    }
  }, [location.state]);

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
        
        // Use channel name from caller if provided, otherwise create one (should match caller's)
        const channelName = data.channelName || createSafeChannelName('call', data.callerId, user.id);
        console.log('🔑 [RECEIVER] Using channel name:', channelName, '(from caller:', !!data.channelName, ')');
        
        setIncomingCall({
          callerId: data.callerId,
          callType: data.callType,
          channelName: channelName, // Store channel name to ensure both users use same channel
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

      // Listen for call accepted (CALLER side - receiver accepted the call)
      socket.on('call-accepted', (data) => {
        console.log('✅ [CALLER] Call accepted by receiver:', data);
        console.log('✅ [CALLER] Current outgoingCallRef:', outgoingCallRef.current);
        
        // Receiver accepted, now start the call
        // Use ref to get current value (not stale closure)
        const currentOutgoingCall = outgoingCallRef.current;
        
        if (currentOutgoingCall) {
          console.log('✅ [CALLER] Starting call now that receiver accepted:', currentOutgoingCall);
          
          // Ensure channel name is set
          if (currentOutgoingCall.channelName) {
            setCallChannelName(currentOutgoingCall.channelName);
            console.log('✅ [CALLER] Set channel name:', currentOutgoingCall.channelName);
          }
          
          // Start the appropriate call type
          if (currentOutgoingCall.callType === 'video') {
            console.log('✅ [CALLER] Starting video call');
            setShowVideoCall(true);
          } else if (currentOutgoingCall.callType === 'voice') {
            console.log('✅ [CALLER] Starting voice call');
            setShowVoiceCall(true);
          }
          
          // Clear outgoing call state and ref
          setOutgoingCall(null);
          outgoingCallRef.current = null;
        } else {
          console.warn('⚠️ [CALLER] Received call-accepted but no outgoingCall found');
        }
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
        // Also clear outgoing call if caller's call was rejected
        setOutgoingCall(null);
        outgoingCallRef.current = null;
        setShowVideoCall(false);
        setShowVoiceCall(false);
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
        setShowVideoCall(false);
        setShowVoiceCall(false);
        setIncomingCall(null);
        setOutgoingCall(null);
        outgoingCallRef.current = null;
      });

      // Listen for new chat requests
      socket.on('new-chat-request', (data) => {
        console.log('📬 New chat request received:', data);
        // Refresh chat requests list
        fetchChatRequests();
      });

      // Listen for contact updates (new messages, new chats, calls)
      socket.on('contact-update', (data) => {
        console.log('👥 Contact update received:', data);
        // Refresh contacts list
        fetchContacts();
      });

      // Listen for call request updates (missed calls)
      socket.on('call-request-update', (data) => {
        console.log('📞 Call request update received:', data);
        // Refresh call requests list
        fetchCallRequests();
      });

      // Listen for new messages
      socket.on('new-message', (data) => {
        console.log('💬 New message received:', data);
        // Refresh contacts to update last message
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
    if (id) {
      fetchProfile();
      fetchContacts();
      fetchChatRequests();
      fetchCallRequests();
    }
  }, [id]);
  
  // Handle call start from sessionStorage (when accepting incoming call)
  useEffect(() => {
    if (profile && id) {
      const pendingCall = sessionStorage.getItem('pendingCall');
      if (pendingCall) {
        try {
          const callData = JSON.parse(pendingCall);
          // Only start call if we're on the caller's profile
          if (callData.callerId === id) {
            // CRITICAL: Use the channel name from sessionStorage (must match caller's)
            if (callData.channelName) {
              setCallChannelName(callData.channelName);
              console.log('🔑 [RECEIVER] Using channel name from sessionStorage:', callData.channelName);
            }
            
            if (callData.callType === 'video') {
              setShowVideoCall(true);
            } else if (callData.callType === 'voice') {
              setShowVoiceCall(true);
            }
            sessionStorage.removeItem('pendingCall');
          }
        } catch (e) {
          console.error('Error parsing pending call:', e);
          sessionStorage.removeItem('pendingCall');
        }
      }
    }
  }, [profile, id]);

  // Refresh contacts and chat requests periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchContacts();
      fetchChatRequests();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (profile) {
      fetchSimilarProfiles();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/profiles/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProfiles = async () => {
    try {
      const response = await axios.get('/api/profiles?limit=20');
      const similar = (response.data.profiles || [])
        .filter(p => p.userId !== id)
        .slice(0, 5);
      setSimilarProfiles(similar);
    } catch (error) {
      console.error('Fetch similar profiles error:', error);
      setSimilarProfiles([]);
    }
  };

  const fetchContacts = async () => {
    try {
      // Fetch conversations/chats from API
      const response = await axios.get('/api/messages/conversations');
      
      // Fetch call requests to get call history
      let callRequestsData = [];
      try {
        const callResponse = await axios.get('/api/messages/call-requests');
        callRequestsData = callResponse.data || [];
      } catch (callError) {
        console.error('Error fetching call requests:', callError);
      }
      
      if (response.data && Array.isArray(response.data)) {
        const contactsList = response.data.map((conv) => {
          const otherUser = conv.user || {};
          const profile = otherUser?.profile || {};
          
          // Get name from profile or email
          let contactName = 'Unknown';
          if (profile?.firstName) {
            contactName = profile.firstName;
            if (profile.lastName) {
              contactName += ` ${profile.lastName}`;
            }
          } else if (otherUser?.email) {
            contactName = otherUser.email.split('@')[0];
          }
          
          // Get avatar from profile photos
          let avatar = null;
          if (profile?.photos && Array.isArray(profile.photos) && profile.photos.length > 0) {
            avatar = profile.photos[0]?.url || null;
          }
          
          // Get last message content
          let lastMessage = 'No messages yet';
          let lastMessageAt = conv.lastMessage?.createdAt || conv.lastMessage?.created_at;
          
          // Check for call history (missed or ended calls)
          const userId = conv.userId || otherUser?.id;
          // Find the most recent call where this user is involved (either as caller or receiver)
          const recentCall = callRequestsData
            .filter(call => {
              // Check if this contact is involved in the call
              const isContactCaller = call.callerId === userId;
              const isContactReceiver = call.receiverId === userId;
              const isCurrentUserCaller = call.callerId === user?.id;
              const isCurrentUserReceiver = call.receiverId === user?.id;
              
              // The call must involve both the current user and this contact
              return (isContactCaller || isContactReceiver) && 
                     (isCurrentUserCaller || isCurrentUserReceiver) &&
                     (call.status === 'missed' || call.status === 'completed') &&
                     (call.createdAt || call.created_at); // Handle both camelCase and snake_case
            })
            .sort((a, b) => {
              // Sort by most recent first
              const dateA = new Date(a.endedAt || a.ended_at || a.createdAt || a.created_at);
              const dateB = new Date(b.endedAt || b.ended_at || b.createdAt || b.created_at);
              return dateB - dateA;
            })[0]; // Get the most recent call
          
          // Prioritize call messages over regular messages
          if (recentCall) {
            const callDate = new Date(recentCall.endedAt || recentCall.ended_at || recentCall.createdAt || recentCall.created_at);
            const formattedDate = callDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            if (recentCall.status === 'missed') {
              const callType = recentCall.callType === 'video' ? 'Video Chat' : 'Voice Call';
              const isReceiver = recentCall.receiverId === user?.id;
              lastMessage = isReceiver 
                ? `You missed a ${callType} on ${formattedDate}`
                : `${callType} was missed on ${formattedDate}`;
              lastMessageAt = recentCall.createdAt || recentCall.created_at;
            } else if (recentCall.status === 'completed') {
              const callType = recentCall.callType === 'video' ? 'Video Chat' : 'Voice Call';
              lastMessage = `${callType} has ended on ${formattedDate}`;
              lastMessageAt = recentCall.endedAt || recentCall.ended_at || recentCall.createdAt || recentCall.created_at;
            }
          } else if (conv.lastMessage) {
            if (typeof conv.lastMessage === 'object') {
              lastMessage = conv.lastMessage.content || conv.lastMessage.message || lastMessage;
            } else {
              lastMessage = conv.lastMessage;
            }
          }
          
          // Determine if contact has call history (for icon overlay)
          // Check if there's any call between current user and this contact
          const hasCallHistory = callRequestsData.some(call => {
            const isContactCaller = call.callerId === userId;
            const isContactReceiver = call.receiverId === userId;
            const isCurrentUserCaller = call.callerId === user?.id;
            const isCurrentUserReceiver = call.receiverId === user?.id;
            
            // The call must involve both the current user and this contact
            return (isContactCaller || isContactReceiver) && 
                   (isCurrentUserCaller || isCurrentUserReceiver) &&
                   (call.status === 'missed' || call.status === 'completed');
          });
          
          // Check if it's a birthday (placeholder - can be enhanced later)
          const isBirthday = false; // Can be enhanced with birthday detection
          
          return {
            id: userId,
            name: contactName,
            type: contactName === 'Concierge' || contactName.includes('Concierge') ? 'Concierge' : null,
            message: lastMessage,
            unreadCount: conv.unreadCount || 0,
            avatar: avatar,
            lastMessageAt: lastMessageAt,
            hasCallHistory: hasCallHistory,
            recentCallType: recentCall?.callType || null,
            isBirthday: isBirthday,
            isCallMessage: recentCall ? true : false,
          };
        });
        
        // Add system contact (Concierge/Julia) at the beginning if not already present
        const hasConcierge = contactsList.some(c => c.id === 'system-concierge' || c.name?.includes('Concierge'));
        if (!hasConcierge) {
          contactsList.unshift({
            id: 'system-concierge',
            name: 'Julia',
            type: 'Concierge',
            message: 'Hello! Today your p...',
            unreadCount: 1,
            avatar: null,
            lastMessageAt: new Date(),
            hasCallHistory: false,
            isBirthday: false,
            isCallMessage: false,
          });
        }
        
        // Sort contacts: Concierge first, then by lastMessageAt (most recent first)
        contactsList.sort((a, b) => {
          // Concierge always first
          if (a.id === 'system-concierge') return -1;
          if (b.id === 'system-concierge') return 1;
          
          // Then sort by last message time (most recent first)
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
          return dateB - dateA;
        });
        
        setContacts(contactsList);
        console.log('✅ Loaded', contactsList.length, 'contacts');
      } else {
        // No conversations found - still show Concierge
        console.log('⚠️ No conversations found, showing Concierge only');
        setContacts([{
          id: 'system-concierge',
          name: 'Julia',
          type: 'Concierge',
          message: 'Hello! Today your p...',
          unreadCount: 1,
          avatar: null,
          lastMessageAt: new Date(),
          hasCallHistory: false,
          isBirthday: false,
          isCallMessage: false,
        }]);
      }
    } catch (error) {
      console.error('❌ Fetch contacts error:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Do not set any fallback contacts on error (just clear list)
      setContacts([]);
    }
  };

  const fetchCallRequests = async () => {
    try {
      const response = await axios.get('/api/messages/call-requests');
      
      if (response.data && Array.isArray(response.data)) {
        const requests = response.data.map((request) => {
          const caller = request.callerData || {};
          const profile = caller.profile || {};
          
          return {
            id: request.id,
            name: profile.firstName || caller.email?.split('@')[0] || 'Unknown',
            callType: request.callType, // 'video' or 'voice'
            status: request.status, // 'missed', 'completed'
            createdAt: request.createdAt || request.created_at, // Handle both camelCase and snake_case
            avatar: profile.photos?.[0]?.url || null,
            callerId: request.callerId,
          };
        });
        
        setCallRequests(requests);
        console.log('✅ Loaded', requests.length, 'call requests');
      } else {
        setCallRequests([]);
      }
    } catch (error) {
      console.error('❌ Fetch call requests error:', error);
      setCallRequests([]);
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
              
              return {
                id: request.id,
                name: senderName,
                message: request.firstMessage || request.content || request.message || 'New message',
                avatar: senderAvatar,
                createdAt: request.createdAt,
                status: request.status || 'pending',
                senderId: request.senderData?.id || request.senderId,
                senderData: request.senderData,
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

  const acceptChatRequestAndOpenChat = async (request) => {
    try {
      await axios.put(`/api/messages/chat-requests/${request.id}/accept`);
    } catch (error) {
      console.error('Accept chat request error (profile):', error);
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

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await axios.post('/api/messages', {
        receiver: id,
        content: message,
        type: 'text',
      });
      setMessage('');
      // Show success message or notification
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleChatNow = () => {
    // Open chat directly without requiring a request
    setShowChat(true);
    setShowEmailComposer(false); // Close email if open
  };

  const handleVideoCall = async () => {
    try {
      // Create channel name BEFORE emitting call request (must match receiver's channel name)
      const channelName = createSafeChannelName('call', user.id, id);
      console.log('🔑 [CALLER] Channel name created:', channelName);
      
      // Store channel name for RTC connection
      setCallChannelName(channelName);
      
      // Emit Socket.IO event for real-time notification
      if (socketRef.current && socketRef.current.connected && user?.id) {
        const callData = {
          callerId: String(user.id),
          receiverId: String(id),
          callType: 'video',
          channelName: channelName, // Send channel name to receiver
        };
        console.log('📞 Emitting call-request:', callData);
        socketRef.current.emit('call-request', callData);
      } else {
        console.warn('⚠️ Socket not connected, cannot send real-time notification');
        if (!socketRef.current) {
          console.error('❌ Socket ref is null');
        } else if (!socketRef.current.connected) {
          console.error('❌ Socket is not connected');
        }
      }

      // Also create database notification
      try {
        await axios.post('/api/notifications', {
          receiverId: id,
          type: 'call_request',
          title: 'Video Call Request',
          message: `${user?.email || 'Someone'} wants to video call you`,
          relatedId: id,
          relatedType: 'video_call',
        });
      } catch (notifError) {
        console.error('Error creating video call notification:', notifError);
      }
      
      // Store outgoing call info - wait for receiver to accept
      const outgoingCallData = {
        callType: 'video',
        channelName: channelName,
        receiverId: id,
      };
      setOutgoingCall(outgoingCallData);
      outgoingCallRef.current = outgoingCallData; // Also store in ref for socket handler
      // Don't start call yet - wait for receiver to accept
      console.log('⏳ [CALLER] Waiting for receiver to accept call...');
    } catch (error) {
      console.error('Error initiating video call:', error);
    }
  };

  const handleAudioCall = async () => {
    try {
      // Create channel name BEFORE emitting call request (must match receiver's channel name)
      const channelName = createSafeChannelName('call', user.id, id);
      console.log('🔑 [CALLER] Channel name created:', channelName);
      
      // Store channel name for RTC connection
      setCallChannelName(channelName);
      
      // Emit Socket.IO event for real-time notification
      if (socketRef.current && socketRef.current.connected && user?.id) {
        const callData = {
          callerId: String(user.id),
          receiverId: String(id),
          callType: 'voice',
          channelName: channelName, // Send channel name to receiver
        };
        console.log('📞 Emitting call-request:', callData);
        socketRef.current.emit('call-request', callData);
      } else {
        console.warn('⚠️ Socket not connected, cannot send real-time notification');
        if (!socketRef.current) {
          console.error('❌ Socket ref is null');
        } else if (!socketRef.current.connected) {
          console.error('❌ Socket is not connected');
        }
      }

      // Also create database notification
      try {
        await axios.post('/api/notifications', {
          receiverId: id,
          type: 'call_request',
          title: 'Voice Call Request',
          message: `${user?.email || 'Someone'} wants to voice call you`,
          relatedId: id,
          relatedType: 'voice_call',
        });
      } catch (notifError) {
        console.error('Error creating voice call notification:', notifError);
      }
      
      // Store outgoing call info - wait for receiver to accept
      const outgoingCallData = {
        callType: 'voice',
        channelName: channelName,
        receiverId: id,
      };
      setOutgoingCall(outgoingCallData);
      outgoingCallRef.current = outgoingCallData; // Also store in ref for socket handler
      // Don't start call yet - wait for receiver to accept
      console.log('⏳ [CALLER] Waiting for receiver to accept call...');
    } catch (error) {
      console.error('Error initiating voice call:', error);
    }
  };

  const handleAcceptCall = async () => {
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

      // CRITICAL: Use the channel name from incoming call (must match caller's exactly)
      const callChannelName = incomingCall.channelName || createSafeChannelName('call', incomingCall.callerId, user.id);
      console.log('🔑 [RECEIVER] Channel name for RTC:', callChannelName);
      
      // Store channel name in state for RTC connection
      setCallChannelName(callChannelName);
      
      // Navigate to caller's profile if we're not already there
      if (id !== incomingCall.callerId) {
        // Store call info in sessionStorage for after navigation
        sessionStorage.setItem('pendingCall', JSON.stringify({
          callType: incomingCall.callType,
          channelName: callChannelName, // CRITICAL: Must match caller's channel name
          callerId: incomingCall.callerId
        }));
        console.log('🔑 [RECEIVER] Stored channel name in sessionStorage:', callChannelName);
        navigate(`/profile/${incomingCall.callerId}`);
      } else {
        // Already on caller's profile, start call immediately
        console.log('🔑 [RECEIVER] Already on caller profile, starting call with channel:', callChannelName);
        if (incomingCall.callType === 'video') {
          setShowVideoCall(true);
        } else {
          setShowVoiceCall(true);
        }
      }
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

  const handleSendEmail = () => {
    setShowEmailComposer(true);
    setShowChat(false); // Close chat if open
  };

  const handleEmailSent = () => {
    setShowEmailComposer(false);
    // Refresh contacts or show success message
  };

  const displayedChatRequests = showLessChatRequests ? chatRequests.slice(0, 5) : chatRequests;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-500">Profile not found</div>
      </div>
    );
  }

  const mainPhoto = profile.photos && profile.photos.length > 0 ? profile.photos[0] : null;
  const secondaryPhoto = profile.photos && profile.photos.length > 1 ? profile.photos[1] : null;
  const photoCount = profile.photos?.length || 0;
  const videoCount = 0; // Placeholder for video count

  // Interest icons mapping
  const interestIcons = {
    'Nature': { icon: FaLeaf, color: 'bg-green-500' },
    'Sports': { icon: FaMedal, color: 'bg-blue-500' },
    'Travelling': { icon: FaMapMarkerAlt, color: 'bg-purple-500' },
    'Watching TV': { icon: FaPlay, color: 'bg-red-500' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ringtone Audio Element */}
      <audio ref={ringtoneRef} preload="auto" />
      
      <div className={`container mx-auto max-w-[1920px] px-2 sm:px-4 ${(showChat || showEmailComposer) ? 'lg:pr-80' : 'lg:pr-96'}`}>
        <div className={`flex flex-col lg:flex-row ${(showChat || showEmailComposer) ? 'lg:gap-6' : ''}`}>
          {/* Main Content - Left Column */}
          <div className={`${(showChat || showEmailComposer) ? 'w-full' : 'flex-1'} ${(showChat || showEmailComposer) ? 'hidden lg:block' : ''}`}>
            {/* Cover Photo Banner */}
            <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-orange-400 via-red-500 to-yellow-400 overflow-visible">
              {profile.coverPhoto ? (
                <img
                  src={profile.coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-yellow-400"></div>
              )}

              {/* Banner Overlay Content */}
              <div className="absolute inset-0 overflow-visible">
                {/* Top Left - Back Button */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-4 lg:left-6 z-10">
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-800 bg-opacity-90 text-white px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-opacity-100 transition"
                  >
                    BACK
                  </button>
                </div>

                {/* Top Right - Star icon for favorite */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-4 lg:right-6 z-10">
                  <button className="bg-gray-800 bg-opacity-90 p-2 sm:p-3 rounded-full hover:bg-opacity-100 transition">
                    <FaStar className="text-yellow-400 text-sm sm:text-xl" />
                  </button>
                </div>

                {/* Profile Picture - Left Side, Overlapping Bottom */}
                <div className="absolute bottom-0 left-2 sm:left-4 lg:left-6 transform translate-y-1/2 z-20">
                  <div className="relative">
                    {mainPhoto ? (
                      <img
                        src={mainPhoto.url}
                        alt={profile.firstName}
                        className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 object-cover border-2 sm:border-4 border-white shadow-xl rounded cursor-pointer hover:opacity-90 transition"
                        onClick={() => {
                          if (profile.photos && profile.photos.length > 0) {
                            setSelectedPhotoIndex(0);
                            setShowPhotoViewer(true);
                          }
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/192';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-gray-300 border-2 sm:border-4 border-white shadow-xl flex items-center justify-center rounded">
                        <FaHeart className="text-2xl sm:text-4xl lg:text-6xl text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Name, Age, and Status - Right of Profile Picture, Overlaid on Cover */}
                <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-28 sm:left-36 md:left-40 lg:left-64 z-10 max-w-[calc(100%-120px)] sm:max-w-none">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2 flex-wrap">
                    <h1 className="text-base sm:text-xl lg:text-3xl font-bold text-white truncate">
                      {profile.firstName} {profile.lastName || ''}
                    </h1>
                    <FaCheckCircle className="text-blue-400 text-xs sm:text-base lg:text-xl flex-shrink-0" />
                    <h1 className="text-base sm:text-xl lg:text-3xl font-bold text-white">
                      , {profile.age}
                    </h1>
                    {profile.isOnline && (
                      <div className="flex items-center space-x-1 sm:space-x-2 ml-1 sm:ml-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white text-xs sm:text-sm">Online</span>
                      </div>
                    )}
                  </div>
                  {profile.userId && (
                    <p className="text-white text-xs sm:text-sm truncate">ID: {profile.userId.substring(0, 12)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Sections */}
            <div className="mx-auto px-2 sm:px-4 lg:pl-8 py-4 sm:py-6 lg:py-8 mt-12 sm:mt-16 lg:mt-24">
            {/* About Section */}
            {profile.bio && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">About {profile.firstName}</h2>
                <p className="text-gray-700 text-sm sm:text-base">
                  {showFullBio ? profile.bio : `${profile.bio.substring(0, 150)}...`}
                  {profile.bio.length > 150 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-teal-600 hover:text-teal-800 ml-2"
                    >
                      {showFullBio ? 'Show Less' : 'Continue Reading'}
                    </button>
                  )}
                </p>
              </div>
            )}

            {/* Message Input and Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg mb-3 sm:mb-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4">
                <button
                  onClick={handleChatNow}
                  className="flex-1 bg-teal-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-teal-700 transition font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                >
                  <FaHeart className="text-base sm:text-lg" />
                  <span>CHAT NOW</span>
                </button>
                <button
                  onClick={handleVideoCall}
                  className="flex-1 bg-teal-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-teal-700 transition font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                >
                  <FaVideo className="text-base sm:text-lg" />
                  <span>VIDEO CALL</span>
                </button>
                <button
                  onClick={handleAudioCall}
                  className="flex-1 bg-teal-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-teal-700 transition font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                >
                  <FaPhone className="text-base sm:text-lg" />
                  <span>AUDIO CALL</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 gap-3 sm:gap-0">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Send exciting Email to your favorite man and make him happy!
                </p>
                <button
                  onClick={handleSendEmail}
                  className="w-full sm:w-auto bg-teal-600 text-white py-2 px-4 sm:px-6 rounded-lg hover:bg-teal-700 transition font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                >
                  <FaEnvelope className="text-xs sm:text-sm" />
                  <span>SEND EMAIL</span>
                </button>
              </div>
            </div>

            {/* Videos and Photos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* My Videos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-40 sm:h-56 md:h-64 bg-gray-200">
                  {videoCount > 0 ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaPlay className="text-4xl sm:text-5xl md:text-6xl text-white opacity-80" />
                      </div>
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center space-x-1 sm:space-x-2 text-white bg-black bg-opacity-50 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm">
                        <FaVideo className="text-xs sm:text-sm" />
                        <span className="text-xs sm:text-sm font-semibold">{videoCount}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaVideo className="text-2xl sm:text-3xl md:text-4xl text-gray-400 mx-auto mb-1 sm:mb-2" />
                        <p className="text-gray-500 text-xs sm:text-sm">No videos yet</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center space-x-2">
                    <FaVideo className="text-teal-600 text-sm sm:text-base" />
                    <span>My Videos</span>
                    {videoCount > 0 && <span className="text-gray-500 text-xs sm:text-sm">({videoCount})</span>}
                  </h3>
                </div>
              </div>

              {/* My Photos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-40 sm:h-56 md:h-64 bg-gray-200">
                  {photoCount > 0 ? (
                    <>
                      <img
                        src={mainPhoto?.url}
                        alt="Photos"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => {
                          if (profile.photos && profile.photos.length > 0) {
                            setSelectedPhotoIndex(0);
                            setShowPhotoViewer(true);
                          }
                        }}
                      />
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center space-x-1 sm:space-x-2 text-white bg-black bg-opacity-50 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm">
                        <FaCamera className="text-xs sm:text-sm" />
                        <span className="text-xs sm:text-sm font-semibold">{photoCount}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaCamera className="text-2xl sm:text-3xl md:text-4xl text-gray-400 mx-auto mb-1 sm:mb-2" />
                        <p className="text-gray-500 text-xs sm:text-sm">No photos yet</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center space-x-2">
                    <FaCamera className="text-teal-600 text-sm sm:text-base" />
                    <span>My Photos</span>
                    {photoCount > 0 && <span className="text-gray-500 text-xs sm:text-sm">({photoCount})</span>}
                  </h3>
                </div>
              </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* My Interests */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">My Interests</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.slice(0, 4).map((interest, index) => {
                      const interestData = interestIcons[interest] || { icon: FaHeart, color: 'bg-teal-500' };
                      const Icon = interestData.icon;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 ${interestData.color} rounded-full flex items-center justify-center text-white text-xl sm:text-2xl mb-1 sm:mb-2`}>
                            <Icon />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-700 text-center">{interest}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600 col-span-2 text-sm">No interests added yet</p>
                  )}
                </div>
              </div>

              {/* About Me */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About Me</h2>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-semibold">Zodiac sign:</span> {profile.lifestyle?.zodiac || 'No answer'}</p>
                  <p><span className="font-semibold">Live in:</span> {profile.location?.city || 'No answer'}, {profile.location?.country || ''}</p>
                  <p><span className="font-semibold">Work as:</span> {profile.lifestyle?.work || 'No answer'}</p>
                  <p><span className="font-semibold">Education:</span> {profile.lifestyle?.education || 'No answer'}</p>
                  <p><span className="font-semibold">Know:</span> {profile.lifestyle?.languages?.join(', ') || 'No answer'}</p>
                  <p><span className="font-semibold">Relationship:</span> {profile.lifestyle?.relationship || 'No answer'}</p>
                  <p><span className="font-semibold">Have kids:</span> {profile.lifestyle?.haveKids !== undefined ? (profile.lifestyle.haveKids ? 'Yes' : 'No') : 'No answer'}</p>
                  <p><span className="font-semibold">Smoke:</span> {profile.lifestyle?.smoke || 'No answer'}</p>
                  <p><span className="font-semibold">Drink:</span> {profile.lifestyle?.drink || 'No answer'}</p>
                  <p><span className="font-semibold">Height:</span> {profile.lifestyle?.height || 'No answer'}</p>
                  <p><span className="font-semibold">Body type:</span> {profile.lifestyle?.bodyType || 'No answer'}</p>
                  <p><span className="font-semibold">Eyes:</span> {profile.lifestyle?.eyes || 'No answer'}</p>
                  <p><span className="font-semibold">Hair:</span> {profile.lifestyle?.hair || 'No answer'}</p>
                </div>
              </div>

              {/* I'm Looking for */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">I'm Looking for</h2>
                <div className="text-gray-700 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                  <p>
                    {profile.preferences?.lookingFor === 'male' && 'Man'}
                    {profile.preferences?.lookingFor === 'female' && 'Woman'}
                    {profile.preferences?.lookingFor === 'both' && 'Both'},{' '}
                    {profile.preferences?.ageRange?.min || 18} years and older
                  </p>
                  {profile.preferences?.description && (
                    <p className="mt-3 leading-relaxed">{profile.preferences.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Report Violation */}
            <div className="text-center mb-4 sm:mb-6">
              <button className="text-gray-500 text-xs sm:text-sm hover:text-gray-700 underline">
                Report a Violation
              </button>
            </div>

            {/* See more people like Sam */}
            {similarProfiles.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">See more people like {profile.firstName}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                  {similarProfiles.map((similar) => (
                    <div
                      key={similar.id || similar.userId}
                      onClick={() => navigate(`/profile/${similar.userId}`)}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                    >
                      {similar.photos && similar.photos.length > 0 ? (
                        <img
                          src={similar.photos[0].url}
                          alt={similar.firstName}
                          className="w-full h-32 sm:h-40 md:h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 flex items-center justify-center">
                          <FaHeart className="text-2xl sm:text-3xl md:text-4xl text-gray-400" />
                        </div>
                      )}
                      <div className="p-2 sm:p-3">
                        <h3 className="font-semibold text-xs sm:text-sm">
                          {similar.firstName}, {similar.age}
                        </h3>
                        {similar.bio && (
                          <p className="text-[10px] sm:text-xs text-gray-600 mt-1 line-clamp-2">
                            {similar.bio}
                          </p>
                        )}
                        <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                          {similar.photos && (
                            <span className="flex items-center space-x-1">
                              <FaCamera className="text-xs" />
                              <span>{similar.photos.length}</span>
                            </span>
                          )}
                          {similar.isOnline && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Search Results */}
            <div className="text-center mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/search')}
                className="bg-gray-300 text-gray-700 px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm rounded-lg hover:bg-gray-400 transition w-full sm:w-auto"
              >
                BACK TO SEARCH RESULTS
              </button>
            </div>
          </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-4 sm:py-6 mt-6 sm:mt-12">
              <div className="container mx-auto px-2 sm:px-4 text-center text-xs sm:text-sm">
                <p className="mb-1 sm:mb-2">Copyright Dating.com 2025. All rights reserved.</p>
                <p className="text-gray-400 text-[10px] sm:text-sm">
                  This website is operated by VENTA SOLUTIONS PTE. LTD., located at 8 Eu Tong Sen Street #22-85, The Central, Singapore 059818 Registration No: 201900379G.
                </p>
              </div>
            </footer>
          </div>

          {/* Chat Window - Middle Panel (when chat is open) */}
          {showChat && user?.id && (
            <div className="w-full lg:w-[50%] h-[92vh] sticky top-16 overflow-hidden flex flex-col p-2 sm:p-4">
              <div className="bg-white h-full rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                <AgoraChat
                  userId={user.id}
                  remoteUserId={id}
                  onClose={() => setShowChat(false)}
                  embedded={true}
                  onOpenEmail={() => {
                    setShowChat(false); // Close chat
                    setShowEmailComposer(true); // Open email composer
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Composer - Middle Panel (when email composer is open) */}
          {showEmailComposer && profile && (
            <div className="w-full lg:w-[50%] h-[92vh] sticky top-16 overflow-hidden flex flex-col p-2 sm:p-4">
              <ProfileEmailComposer
                profile={profile}
                onClose={() => setShowEmailComposer(false)}
                onSent={handleEmailSent}
                onOpenChat={() => {
                  setShowEmailComposer(false); // Close email composer
                  setShowChat(true); // Open chat
                }}
              />
            </div>
          )}

        </div>
      </div>

      {/* Right Sidebar - Outside Container - Hidden on mobile */}
      <div className={`hidden lg:block ${(showChat || showEmailComposer) ? 'w-80' : 'w-96'} bg-white border-l border-gray-200 h-screen fixed right-0 top-0 overflow-y-auto z-40 pt-4`}>
        {/* My Contacts */}
        <div className="p-4 pt-8 border-b border-gray-200 bg-white mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-base">My Contacts</h3>
            {contacts.length > 0 && (
              <span className="bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                {contacts.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
              </span>
            )}
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaEnvelope className="text-gray-400 text-2xl" />
              </div>
              <p className="text-sm text-gray-500">No contacts yet</p>
              <p className="text-xs text-gray-400 mt-1">Start chatting to see your contacts here</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {contacts.map((contact) => {
                // Check if message is about a missed/ended call
                const isCallMessage = contact.isCallMessage || contact.message?.includes('missed') || contact.message?.includes('ended');
                const isBirthday = contact.isBirthday;
                
                return (
                  <div 
                    key={contact.id || `contact-${Math.random()}`} 
                    className={`relative flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition group ${
                      isBirthday ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (contact.id && contact.id !== 'system-concierge' && typeof contact.id === 'string' && !contact.id.includes('system-')) {
                        navigate(`/profile/${contact.id}`);
                      }
                    }}
                  >
                    {/* Birthday background decoration */}
                    {isBirthday && (
                      <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20">
                          <div className="absolute top-2 left-4 w-3 h-3 bg-pink-300 rounded-full"></div>
                          <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-300 rounded-full"></div>
                          <div className="absolute bottom-2 left-8 w-2.5 h-2.5 bg-green-300 rounded-full"></div>
                          <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-300 rounded-full"></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative flex-shrink-0 z-10">
                      {/* Use square avatar for Concierge, circular for others */}
                      <div className={`w-14 h-14 ${contact.id === 'system-concierge' ? 'rounded-lg' : 'rounded-full'} bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-teal-300 transition`}>
                        {contact.avatar ? (
                          <img 
                            src={contact.avatar} 
                            alt={contact.name || 'Contact'} 
                            className={`w-full h-full ${contact.id === 'system-concierge' ? 'rounded-lg' : 'rounded-full'} object-cover`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {(contact.name && contact.name[0]?.toUpperCase()) || '?'}
                          </span>
                        )}
                      </div>
                      {/* Video/Call icon overlay - only show for non-Concierge contacts with call history */}
                      {contact.hasCallHistory && contact.id !== 'system-concierge' && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white z-10">
                          <FaVideo className="text-gray-600 text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 ml-3 z-10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="font-semibold text-gray-800 text-sm truncate">
                            {contact.name || 'Unknown'}
                          </span>
                          {contact.type && (
                            <span className="text-red-500 text-xs font-medium whitespace-nowrap bg-red-50 px-2 py-0.5 rounded">
                              {contact.type}
                            </span>
                          )}
                        </div>
                        {/* Unread badge on the right */}
                        {contact.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-2">
                            {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${isCallMessage ? 'text-gray-500 italic' : 'text-gray-600'}`}>
                        {contact.message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search Contact */}
          <div className="relative mt-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contact"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <FaVolumeUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
          </div>
        </div>

        {/* Chat Requests (Profile Sidebar) */}
        <div className="p-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800">Chat Requests</h3>
              {displayedChatRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {displayedChatRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </div>
            {displayedChatRequests.length > 5 && (
              <button
                onClick={() => setShowLessChatRequests(!showLessChatRequests)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
              >
                {showLessChatRequests ? 'SHOW MORE' : 'SHOW LESS'}
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displayedChatRequests.filter(r => r.status === 'pending').length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No chat requests</p>
            ) : (
              displayedChatRequests
                .filter((request) => request.status === 'pending')
                .map((request) => {
                  const openProfileWithChat = () => {
                    acceptChatRequestAndOpenChat(request);
                  };

                  return (
                    <div
                      key={request.id}
                      className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-gray-100"
                      onClick={openProfileWithChat}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden">
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
                            <span className="text-white text-sm font-semibold">
                              {request.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {request.name || 'Unknown'}
                          </h4>
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
                          className="text-xs text-gray-600 leading-relaxed line-clamp-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProfileWithChat();
                          }}
                        >
                          {request.message || 'New chat request'}
                        </p>
                        {request.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

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

      {/* Help Center Button */}
      <div className="fixed left-4 bottom-4 z-50">
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center space-x-2">
          <span className="text-lg">Q</span>
          <span>Help Center</span>
        </button>
      </div>

      {/* Outgoing Call Waiting UI (Caller side - waiting for receiver to accept) */}
      {outgoingCall && !showVideoCall && !showVoiceCall && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            {(profile?.photos?.[0]?.url || (typeof profile?.photos?.[0] === 'string' ? profile.photos[0] : null)) ? (
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-teal-400 shadow-lg animate-pulse">
                <img 
                  src={profile.photos[0]?.url || profile.photos[0]} 
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <span className="text-5xl font-bold text-white">
                  {profile?.firstName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {profile?.firstName || 'Calling...'}
            </h3>
            <p className="text-gray-600 mb-4">
              {outgoingCall.callType === 'video' ? 'Video' : 'Voice'} Call
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-gray-500 mb-6">Waiting for {profile?.firstName || 'user'} to accept...</p>
            <button
              onClick={() => {
                console.log('❌ [CALLER] Canceling call');
                if (socketRef.current && socketRef.current.connected && user?.id && outgoingCall) {
                  // Emit call-cancel event to notify receiver
                  socketRef.current.emit('call-cancel', {
                    callerId: String(user.id),
                    receiverId: String(outgoingCall.receiverId),
                  });
                  console.log('✅ [CALLER] Call cancel event emitted');
                }
                // Clear local state
                setOutgoingCall(null);
                outgoingCallRef.current = null;
                setCallChannelName(null);
                console.log('✅ [CALLER] Call canceled, UI cleared');
              }}
              className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl transition-all duration-200 font-semibold"
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* Agora Components - Only show after receiver accepts */}
      {showVideoCall && user?.id && callChannelName && (
        <AgoraVideoCall
          channelName={callChannelName}
          userId={user.id}
          remoteUserId={profile?.firstName || profile?.userId || id || 'Unknown'}
          remoteUserProfile={profile || null} // Pass full profile object (may be null if still loading)
          onEndCall={(duration) => {
            setShowVideoCall(false);
            setCallChannelName(null); // Clear channel name
            // Emit call end event with duration
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('call-end', {
                userId: user.id,
                otherUserId: id,
                duration: duration || 0, // Pass call duration in seconds
              });
            }
          }}
          callType="video"
        />
      )}

      {showVoiceCall && user?.id && callChannelName && (
        <AgoraVoiceCall
          channelName={callChannelName}
          userId={user.id}
          remoteUserId={profile?.firstName || profile?.userId || id || 'Unknown'}
          remoteUserProfile={profile || null} // Pass full profile object (may be null if still loading)
          onEndCall={(duration) => {
            setShowVoiceCall(false);
            setCallChannelName(null); // Clear channel name
            // Emit call end event with duration
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('call-end', {
                userId: user.id,
                otherUserId: id,
                duration: duration || 0, // Pass call duration in seconds
              });
            }
          }}
        />
      )}

      {/* Photo Viewer Modal */}
      {showPhotoViewer && profile?.photos && profile.photos.length > 0 && (
        <ProfilePhotoViewer
          isOpen={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          photos={profile.photos}
          initialIndex={selectedPhotoIndex}
          profileName={profile.firstName}
        />
      )}
    </div>
  );
};

export default Profile;
