import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaCamera, FaEnvelope, FaVideo, FaGift, FaSearch, FaVolumeUp, FaChevronDown, FaFire, FaCheckCircle, FaPlay } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    fetchProfiles();
    fetchContacts();
    fetchChatRequests();
    fetchOnlineUsers();
  }, []);

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
      
      const response = await axios.get('/api/profiles');
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
      // This would fetch contacts - placeholder for now
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
    } catch (error) {
      console.error('Fetch contacts error:', error);
    }
  };

  const fetchChatRequests = async () => {
    try {
      const response = await axios.get('/api/messages/chat-requests');
      setChatRequests(response.data || []);
    } catch (error) {
      console.error('Fetch chat requests error:', error);
      // Mock data for now
      setChatRequests([
        { id: 1, name: 'Nwogu Chi...', message: 'is inviting you to Video Chat...', avatar: null, isVideoChat: true },
        { id: 2, name: 'Alex', message: 'Hi, beautiful 🌹, my name is Alex, and I decided to write to you', avatar: null, isVideoChat: false, hasEmail: true },
      ]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">{contacts.length}</span>
            </div>

            {contacts.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold text-lg">{contact.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="font-medium text-gray-800 text-sm truncate">{contact.name}</span>
                          {contact.type && (
                            <span className="text-red-500 text-xs font-semibold whitespace-nowrap">{contact.type}</span>
                          )}
                        </div>
                        {contact.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm mb-4">
                No contacts yet
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
                displayedChatRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {request.avatar ? (
                        <img src={request.avatar} alt={request.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-semibold">{request.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm mb-1 truncate">{request.name}</p>
                      <div className="flex items-center space-x-1">
                        {request.isVideoChat && (
                          <FaVideo className="text-green-500 text-xs flex-shrink-0" />
                        )}
                        {request.hasEmail && (
                          <FaEnvelope className="text-red-500 text-xs flex-shrink-0" />
                        )}
                        <p className="text-xs text-gray-600 truncate">{request.message}</p>
                      </div>
                    </div>
                  </div>
                ))
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

