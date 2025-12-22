import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FaHeart, FaCamera, FaVideo, FaEnvelope, FaPhone, FaStar, 
  FaCheckCircle, FaLeaf, FaMedal, FaMapMarkerAlt, FaPlay,
  FaSearch, FaVolumeUp, FaChevronDown, FaTimes
} from 'react-icons/fa';

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

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchContacts();
      fetchChatRequests();
    }
  }, [id]);

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
      setChatRequests([
        { id: 1, name: 'Alex', message: 'Hi, beautiful 🌹, my name is Alex, and I decided to write to you', avatar: null },
      ]);
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
    navigate(`/chat/${id}`);
  };

  const handleAudioCall = () => {
    // Initiate audio call
    console.log('Initiating audio call with', id);
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
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Header */}
          <div className="relative bg-white">
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => navigate(-1)}
                className="bg-white bg-opacity-90 px-4 py-2 rounded hover:bg-opacity-100 transition"
              >
                BACK
              </button>
            </div>

            <div className="relative h-96 bg-gray-200">
              {mainPhoto ? (
                <>
                  <img
                    src={mainPhoto.url}
                    alt={profile.firstName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  
                  {/* Overlay with name and status */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                    <div className="flex items-center space-x-3 text-white">
                      <h1 className="text-3xl font-bold">
                        {profile.firstName} {profile.lastName || ''}, {profile.age}
                      </h1>
                      <FaCheckCircle className="text-blue-400 text-xl" />
                      {profile.isOnline && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Online</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Star icon for favorite */}
                  <div className="absolute top-4 right-4">
                    <button className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition">
                      <FaStar className="text-yellow-400 text-xl" />
                    </button>
                  </div>

                  {/* Secondary photo embedded */}
                  {secondaryPhoto && (
                    <div className="absolute bottom-20 left-6 w-32 h-32 border-4 border-white rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={secondaryPhoto.url}
                        alt="Secondary"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaHeart className="text-6xl text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="container mx-auto px-6 py-6 max-w-5xl">
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

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 h-screen sticky top-0 overflow-y-auto">
          {/* My Contacts */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">My Contacts</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1</span>
            </div>

            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-3 mb-4 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold">{contact.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800 text-sm">{contact.name}</span>
                    {contact.type && (
                      <span className="text-red-500 text-xs">{contact.type}</span>
                    )}
                    {contact.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.message}</p>
                </div>
              </div>
            ))}

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
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Chat Requests</h3>
              <button
                onClick={() => setShowLessChatRequests(!showLessChatRequests)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showLessChatRequests ? 'SHOW MORE' : 'SHOW LESS'}
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayedChatRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0">
                    {request.avatar ? (
                      <img src={request.avatar} alt={request.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-semibold">{request.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{request.name}</p>
                    <p className="text-xs text-gray-600 truncate mt-1">{request.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Center Button */}
      <div className="fixed left-4 bottom-4 z-50">
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center space-x-2">
          <span className="text-lg">Q</span>
          <span>Help Center</span>
        </button>
      </div>

      {/* Persistent Call Bar (if call is active) */}
      <div className="fixed bottom-0 right-0 bg-black text-white p-3 flex items-center space-x-4 z-50">
        <button className="text-white hover:text-gray-300">
          <FaTimes />
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
          {profile.photos && profile.photos.length > 0 ? (
            <img src={profile.photos[0].url} alt={profile.firstName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{profile.firstName[0]}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-700 rounded">
            <FaVolumeUp />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">
            <FaVolumeUp />
          </button>
          <div className="w-20 h-1 bg-gray-600 rounded"></div>
        </div>
        <button className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition">
          CALL
        </button>
      </div>
    </div>
  );
};

export default Profile;
