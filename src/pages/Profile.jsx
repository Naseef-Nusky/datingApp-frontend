import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { createSafeChannelName } from '../utils/agoraUtils';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [message, setMessage] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const socketRef = useRef(null);

  // Socket.IO setup for real-time call notifications
  useEffect(() => {
    if (user?.id) {
      // Initialize socket connection - use same base URL as axios
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      console.log('🔌 Connecting to Socket.IO server:', apiUrl);
      
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
        console.log('✅ Socket connected:', socket.id);
        // Join user's room
        socket.emit('join-room', user.id);
        console.log('📢 Joined room: user-' + user.id);
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
        socket.emit('join-room', user.id);
      });

      // Listen for incoming calls
      socket.on('incoming-call', (data) => {
        console.log('📞 Incoming call received:', data);
        // Create channel name that matches what caller is using
        const channelName = createSafeChannelName('call', data.callerId, user.id);
        setIncomingCall({
          callerId: data.callerId,
          callType: data.callType,
          channelName: channelName, // Store channel name to ensure both users use same channel
        });
      });

      // Listen for call accepted
      socket.on('call-accepted', (data) => {
        console.log('✅ Call accepted:', data);
        // Call is accepted, continue with call
      });

      // Listen for call rejected
      socket.on('call-rejected', (data) => {
        console.log('❌ Call rejected:', data);
        setIncomingCall(null);
      });

      // Listen for call ended
      socket.on('call-ended', (data) => {
        console.log('📴 Call ended:', data);
        setShowVideoCall(false);
        setShowVoiceCall(false);
        setIncomingCall(null);
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
          if (conv.lastMessage) {
            if (typeof conv.lastMessage === 'object') {
              lastMessage = conv.lastMessage.content || conv.lastMessage.message || lastMessage;
            } else {
              lastMessage = conv.lastMessage;
            }
          }
          
          return {
            id: conv.userId || otherUser?.id,
            name: contactName,
            type: null,
            message: lastMessage,
            unreadCount: conv.unreadCount || 0,
            avatar: avatar,
            lastMessageAt: conv.lastMessage?.createdAt || conv.lastMessage?.created_at,
          };
        });
        
        setContacts(contactsList);
        console.log('✅ Loaded', contactsList.length, 'contacts');
      } else {
        // No conversations found
        console.log('⚠️ No conversations found');
        setContacts([]);
      }
    } catch (error) {
      console.error('❌ Fetch contacts error:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Do not set any fallback contacts on error (just clear list)
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
  };

  const handleVideoCall = async () => {
    try {
      // Emit Socket.IO event for real-time notification
      if (socketRef.current && socketRef.current.connected && user?.id) {
        const callData = {
          callerId: user.id,
          receiverId: id,
          callType: 'video',
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
      
      setShowVideoCall(true);
    } catch (error) {
      console.error('Error initiating video call:', error);
      // Continue with call even if notification fails
      setShowVideoCall(true);
    }
  };

  const handleAudioCall = async () => {
    try {
      // Emit Socket.IO event for real-time notification
      if (socketRef.current && socketRef.current.connected && user?.id) {
        const callData = {
          callerId: user.id,
          receiverId: id,
          callType: 'voice',
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
      
      setShowVoiceCall(true);
    } catch (error) {
      console.error('Error initiating voice call:', error);
      // Continue with call even if notification fails
      setShowVoiceCall(true);
    }
  };

  const handleAcceptCall = async () => {
    if (incomingCall && socketRef.current && user?.id) {
      // Emit call accepted event
      socketRef.current.emit('call-accept', {
        callerId: incomingCall.callerId,
        receiverId: user.id,
      });

      // Use the channel name from incoming call to ensure both users join same channel
      const callChannelName = incomingCall.channelName || createSafeChannelName('call', incomingCall.callerId, user.id);
      
      // Navigate to caller's profile if we're not already there
      if (id !== incomingCall.callerId) {
        // Store call info in sessionStorage for after navigation
        sessionStorage.setItem('pendingCall', JSON.stringify({
          callType: incomingCall.callType,
          channelName: callChannelName,
          callerId: incomingCall.callerId
        }));
        navigate(`/profile/${incomingCall.callerId}`);
      } else {
        // Already on caller's profile, start call immediately
        if (incomingCall.callType === 'video') {
          setShowVideoCall(true);
        } else {
          setShowVoiceCall(true);
        }
      }
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall && socketRef.current && user?.id) {
      socketRef.current.emit('call-reject', {
        callerId: incomingCall.callerId,
        receiverId: user.id,
      });
      setIncomingCall(null);
    }
  };

  const handleSendEmail = () => {
    navigate(`/send-email/${id}`);
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
      <div className="container mx-auto max-w-[1920px] px-4" style={{ paddingRight: showChat ? '320px' : '384px' }}>
        <div className={`flex ${showChat ? 'gap-6' : ''}`}>
          {/* Main Content */}
          <div className={`${showChat ? 'w-full' : 'flex-1'}`}>
            {/* Cover Photo Banner */}
            <div className="relative h-80 bg-gradient-to-br from-orange-400 via-red-500 to-yellow-400 overflow-visible">
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
                <div className="absolute top-4 left-6 z-10">
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded hover:bg-opacity-100 transition"
                  >
                    BACK
                  </button>
                </div>

                {/* Top Right - Star icon for favorite */}
                <div className="absolute top-4 right-6 z-10">
                  <button className="bg-gray-800 bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition">
                    <FaStar className="text-yellow-400 text-xl" />
                  </button>
                </div>

                {/* Profile Picture - Left Side, Overlapping Bottom */}
                <div className="absolute bottom-0 left-6 transform translate-y-1/2 z-20">
                  <div className="relative">
                    {mainPhoto ? (
                      <img
                        src={mainPhoto.url}
                        alt={profile.firstName}
                        className="w-48 h-48 object-cover border-4 border-white shadow-xl rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/192';
                        }}
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-300 border-4 border-white shadow-xl flex items-center justify-center rounded">
                        <FaHeart className="text-6xl text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Name, Age, and Status - Right of Profile Picture, Overlaid on Cover */}
                <div className="absolute bottom-8 left-64 z-10">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {profile.firstName} {profile.lastName || ''}
                    </h1>
                    <FaCheckCircle className="text-blue-400 text-xl" />
                    <h1 className="text-3xl font-bold text-white">
                      , {profile.age}
                    </h1>
                    {profile.isOnline && (
                      <div className="flex items-center space-x-2 ml-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white text-sm">Online</span>
                      </div>
                    )}
                  </div>
                  {profile.userId && (
                    <p className="text-white text-sm">ID: {profile.userId.substring(0, 12)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Sections */}
            <div className="mx-auto pl-8 py-8 mt-24">
            {/* About Section */}
            {profile.bio && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">About {profile.firstName}</h2>
                <p className="text-gray-700">
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={handleChatNow}
                  className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition font-semibold flex items-center justify-center space-x-2"
                >
                  <FaHeart className="text-lg" />
                  <span>CHAT NOW</span>
                </button>
                <button
                  onClick={handleVideoCall}
                  className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition font-semibold flex items-center justify-center space-x-2"
                >
                  <FaVideo className="text-lg" />
                  <span>VIDEO CALL</span>
                </button>
                <button
                  onClick={handleAudioCall}
                  className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition font-semibold flex items-center justify-center space-x-2"
                >
                  <FaPhone className="text-lg" />
                  <span>AUDIO CALL</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Send exciting Email to your favorite man and make him happy!
                </p>
                <button
                  onClick={handleSendEmail}
                  className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition font-semibold flex items-center space-x-2"
                >
                  <FaEnvelope className="text-sm" />
                  <span>SEND EMAIL</span>
                </button>
              </div>
            </div>

            {/* Videos and Photos */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* My Videos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-64 bg-gray-200">
                  {videoCount > 0 ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaPlay className="text-6xl text-white opacity-80" />
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white bg-black bg-opacity-50 px-3 py-2 rounded">
                        <FaVideo className="text-sm" />
                        <span className="text-sm font-semibold">{videoCount}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaVideo className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No videos yet</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <FaVideo className="text-teal-600" />
                    <span>My Videos</span>
                    {videoCount > 0 && <span className="text-gray-500">({videoCount})</span>}
                  </h3>
                </div>
              </div>

              {/* My Photos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-64 bg-gray-200">
                  {photoCount > 0 ? (
                    <>
                      <img
                        src={mainPhoto?.url}
                        alt="Photos"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white bg-black bg-opacity-50 px-3 py-2 rounded">
                        <FaCamera className="text-sm" />
                        <span className="text-sm font-semibold">{photoCount}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaCamera className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No photos yet</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <FaCamera className="text-teal-600" />
                    <span>My Photos</span>
                    {photoCount > 0 && <span className="text-gray-500">({photoCount})</span>}
                  </h3>
                </div>
              </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* My Interests */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">My Interests</h2>
                <div className="grid grid-cols-2 gap-4">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.slice(0, 4).map((interest, index) => {
                      const interestData = interestIcons[interest] || { icon: FaHeart, color: 'bg-teal-500' };
                      const Icon = interestData.icon;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-16 h-16 ${interestData.color} rounded-full flex items-center justify-center text-white text-2xl mb-2`}>
                            <Icon />
                          </div>
                          <span className="text-sm text-gray-700 text-center">{interest}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600 col-span-2">No interests added yet</p>
                  )}
                </div>
              </div>

              {/* About Me */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">About Me</h2>
                <div className="space-y-2 text-sm text-gray-700">
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">I'm Looking for</h2>
                <div className="text-gray-700 text-sm space-y-2">
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
            <div className="text-center mb-6">
              <button className="text-gray-500 text-sm hover:text-gray-700 underline">
                Report a Violation
              </button>
            </div>

            {/* See more people like Sam */}
            {similarProfiles.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">See more people like {profile.firstName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <FaHeart className="text-4xl text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-semibold text-sm">
                          {similar.firstName}, {similar.age}
                        </h3>
                        {similar.bio && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {similar.bio}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          {similar.photos && (
                            <span className="flex items-center space-x-1">
                              <FaCamera />
                              <span>{similar.photos.length}</span>
                            </span>
                          )}
                          {similar.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Search Results */}
            <div className="text-center mb-6">
              <button
                onClick={() => navigate('/search')}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                BACK TO SEARCH RESULTS
              </button>
            </div>
          </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6 mt-12">
              <div className="container mx-auto px-4 text-center text-sm">
                <p className="mb-2">Copyright Dating.com 2025. All rights reserved.</p>
                <p className="text-gray-400">
                  This website is operated by VENTA SOLUTIONS PTE. LTD., located at 8 Eu Tong Sen Street #22-85, The Central, Singapore 059818 Registration No: 201900379G.
                </p>
              </div>
            </footer>
          </div>

          {/* Chat Window - Middle Panel (when chat is open) */}
          {showChat && user?.id && (
            <div className="w-[50%] h-[92vh] sticky top-16 overflow-hidden flex flex-col p-4">
              <div className="bg-white h-full rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                <AgoraChat
                  userId={user.id}
                  remoteUserId={id}
                  onClose={() => setShowChat(false)}
                  embedded={true}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Sidebar - Outside Container */}
      <div className={`${showChat ? 'w-80' : 'w-96'} bg-white border-l border-gray-200 h-screen fixed right-0 top-0 overflow-y-auto z-40 pt-4`}>
        {/* My Contacts */}
        <div className="p-4 pt-8 border-b border-gray-200 bg-white mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-base">My Contacts</h3>
            {contacts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
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
            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                        <span className="text-white font-semibold text-lg">
                          {(contact.name && contact.name[0]?.toUpperCase()) || '?'}
                        </span>
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
                        <span className="font-semibold text-gray-800 text-sm truncate">
                          {contact.name || 'Unknown'}
                        </span>
                        {contact.type && (
                          <span className="text-red-500 text-xs font-medium whitespace-nowrap bg-red-50 px-2 py-0.5 rounded">
                            {contact.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {contact.message || 'No messages yet'}
                    </p>
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

        {/* Chat Requests */}
        <div className="p-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Chat Requests</h3>
            <button
              onClick={() => setShowLessChatRequests(!showLessChatRequests)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showLessChatRequests ? 'SHOW MORE' : 'SHOW LESS'}
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {displayedChatRequests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No chat requests</p>
            ) : (
              displayedChatRequests
                .filter((request) => request.status === 'pending')
                .map((request) => {
                  return (
                    <div
                      key={request.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      {/* Name and Action Buttons Row */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-base">{request.name}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptChatRequest(request.id, request.senderId);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-1.5 rounded transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectChatRequest(request.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-1.5 rounded transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      
                      {/* Message Preview */}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {request.message || 'New chat request'}
                      </p>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {incomingCall.callType === 'video' ? (
                  <FaVideo className="text-white text-3xl" />
                ) : (
                  <FaPhone className="text-white text-3xl" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
              </h3>
              <p className="text-gray-600">Someone wants to {incomingCall.callType === 'video' ? 'video' : 'voice'} call you</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleRejectCall}
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center space-x-2"
              >
                <FaTimes />
                <span>Decline</span>
              </button>
              <button
                onClick={handleAcceptCall}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center space-x-2"
              >
                <FaPhone />
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

      {/* Agora Components */}
      {showVideoCall && user?.id && profile && (
        <AgoraVideoCall
          channelName={createSafeChannelName('call', user.id, id)}
          userId={user.id}
          remoteUserId={profile.firstName || profile.id}
          onEndCall={() => {
            setShowVideoCall(false);
            // Emit call end event
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('call-end', {
                userId: user.id,
                otherUserId: id,
              });
            }
          }}
          callType="video"
        />
      )}

      {showVoiceCall && user?.id && profile && (
        <AgoraVoiceCall
          channelName={createSafeChannelName('call', user.id, id)}
          userId={user.id}
          remoteUserId={profile.firstName || profile.id}
          onEndCall={() => {
            setShowVoiceCall(false);
            // Emit call end event
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('call-end', {
                userId: user.id,
                otherUserId: id,
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default Profile;
