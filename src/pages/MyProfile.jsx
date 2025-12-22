import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaEdit, FaCamera, FaHeart, FaGift, FaUmbrellaBeach, FaCar, FaGlobe, FaSearch, FaVolumeUp, FaChevronDown } from 'react-icons/fa';

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchContacts();
    fetchChatRequests();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post('/api/profiles/me/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update profile with new photos
      setProfile((prev) => ({
        ...prev,
        photos: response.data.photos,
      }));

      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload photo error:', error);
      alert(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('coverPhoto', file);

      const response = await axios.post('/api/profiles/me/cover-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update profile with new cover photo
      setProfile((prev) => ({
        ...prev,
        coverPhoto: response.data.coverPhoto,
      }));

      alert('Cover photo uploaded successfully!');
    } catch (error) {
      console.error('Upload cover photo error:', error);
      alert(error.response?.data?.message || 'Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoIndex) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/profiles/me/photos/${photoIndex}`);
      
      // Update profile with updated photos
      setProfile((prev) => ({
        ...prev,
        photos: response.data.photos,
      }));

      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Delete photo error:', error);
      alert(error.response?.data?.message || 'Failed to delete photo');
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
          message: 'Congratulations, G...',
          unreadCount: 4,
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
        { id: 1, name: 'Karina', message: 'If I leaned in just a little too close, what would you hope...', avatar: null },
        { id: 2, name: 'Anna', message: 'If I leaned in just a little too close, how long could you resist smilin...', avatar: null },
        { id: 3, name: 'Támara', message: 'Mi vida hermoso ❤️❤️❤️❤️❤️', avatar: null },
        { id: 4, name: 'Vera', message: 'What kind of behavior in a woman can really bring out the gentlema...', avatar: null },
        { id: 5, name: 'Elizabeth', message: "Hi, I'm Elizabeth, 34. I'm looking for a real partner and a...", avatar: null },
        { id: 6, name: 'MARIA', message: 'is inviting you to Video Chat...', avatar: null },
        { id: 7, name: 'Zhao Meng', message: 'What is your favorite exercise posture?', avatar: null },
        { id: 8, name: 'Daniela M', message: "Hi, I'm a woman who isn't looking for fairy tales, but rather f", avatar: null },
        { id: 9, name: 'Julieta', message: '"Love, because it has no geography, knows no limits" -...', avatar: null },
        { id: 10, name: 'Viktoriia', message: "I don't know where to begin this letter But I'm sure any day ca", avatar: null },
        { id: 11, name: 'Jayla', message: "Hello! I'm Jayla, and I'm here seeking meaningful connection...", avatar: null },
        { id: 12, name: 'Kseniya', message: 'Are you a man who', avatar: null },
      ]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Profile not found</div>
      </div>
    );
  }

  // Map interests to icons
  const interestIcons = {
    'Lying on the beach': { icon: FaUmbrellaBeach, color: 'bg-green-500' },
    'Cars': { icon: FaCar, color: 'bg-red-500' },
    'Dancing': { icon: FaGlobe, color: 'bg-purple-500' },
  };

  const displayedChatRequests = showLessChatRequests ? chatRequests.slice(0, 5) : chatRequests;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Cover Photo Banner */}
          <div className="relative h-64 bg-gradient-to-br from-orange-400 via-red-500 to-yellow-400 overflow-hidden">
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
            <div className="absolute inset-0 p-6">
              {/* Top Left */}
              <div className="absolute top-4 left-4 space-y-2">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-white bg-opacity-90 px-4 py-2 rounded hover:bg-opacity-100 transition"
                >
                  BACK
                </button>
                <button className="bg-white bg-opacity-90 px-4 py-2 rounded hover:bg-opacity-100 transition block">
                  CHANGE SUBSCRIPTION PLAN
                </button>
              </div>

              {/* Center Profile Picture */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="relative">
                  {profile.photos && profile.photos.length > 0 ? (
                    <img
                      src={profile.photos[0].url}
                      alt={profile.firstName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/128';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                      <FaHeart className="text-4xl text-gray-500" />
                    </div>
                  )}
                  <label className="mt-2 bg-white bg-opacity-90 px-4 py-2 rounded hover:bg-opacity-100 transition text-sm cursor-pointer inline-block">
                    {uploadingPhoto ? 'UPLOADING...' : 'UPLOAD PHOTO'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              </div>

              {/* Top Right */}
              <div className="absolute top-4 right-4">
                <label className="bg-white bg-opacity-90 px-4 py-2 rounded hover:bg-opacity-100 transition cursor-pointer inline-block">
                  {uploadingCover ? 'UPLOADING...' : 'UPDATE COVER'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                    className="hidden"
                    disabled={uploadingCover}
                  />
                </label>
              </div>

              {/* Bottom Right */}
              <div className="absolute bottom-4 right-4">
                <button className="bg-gradient-nex text-white px-6 py-2 rounded hover:opacity-90 transition font-semibold">
                  {user?.credits || 150} CREDITS - REFILL
                </button>
              </div>

              {/* Name and ID (Right of Profile Picture) */}
              <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 text-right">
                <div className="flex items-center space-x-2 justify-end mb-1">
                  <h1 className="text-3xl font-bold text-white">
                    {profile.firstName} {profile.lastName}, {profile.age}
                  </h1>
                  <button className="text-white hover:text-gray-200">×</button>
                  <button className="text-white hover:text-gray-200">
                    <FaEdit />
                  </button>
                </div>
                <p className="text-white text-sm">ID: {user?.id?.substring(0, 12) || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* A Few Words About Myself */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">A Few Words About Myself</h2>
                <button className="text-gray-600 hover:text-gray-800">
                  <FaEdit />
                </button>
              </div>
              <p className="text-gray-700">
                {profile.bio || 'To meet someone to have a loving relationship.'}
              </p>
            </div>

            {/* Your Wishlist */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Wishlist</h2>
                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition">
                  EDIT WISHLIST
                </button>
              </div>
              {profile.wishlist && profile.wishlist.length > 0 ? (
                <ul className="space-y-2">
                  {profile.wishlist.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      • {item.item} - {item.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">
                  Looks like the Wishlist hasn't been completed yet
                </p>
              )}
            </div>

            {/* Photos Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add more photos</h2>
                <label className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer inline-block">
                  {uploadingPhoto ? 'UPLOADING...' : 'ADD'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.photos && profile.photos.length > 0 ? (
                  profile.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200';
                        }}
                      />
                      {photo.isPublic && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Public
                        </span>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(index)}
                        className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1">
                    <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                      <FaCamera className="text-4xl text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* My Interests and About Me Side by Side */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* My Interests */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">My Interests</h2>
                  <button className="text-gray-600 hover:text-gray-800">
                    <FaEdit />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.slice(0, 3).map((interest, index) => {
                      const interestData = interestIcons[interest] || { icon: FaHeart, color: 'bg-blue-500' };
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
                    <p className="text-gray-600">No interests added yet</p>
                  )}
                </div>
              </div>

              {/* About Me */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">About Me</h2>
                  <button className="text-gray-600 hover:text-gray-800">
                    <FaEdit />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Zodiac sign: {profile.lifestyle?.zodiac || 'No answer'}</p>
                  <p>Live in: {profile.location?.city || 'No answer'}, {profile.location?.country || ''}</p>
                  <p>Work as: {profile.lifestyle?.work || 'No answer'}</p>
                  <p>Education: {profile.lifestyle?.education || 'No answer'}</p>
                  <p>Know: {profile.lifestyle?.languages?.join(', ') || 'No answer'}</p>
                  <p>Relationship: {profile.lifestyle?.relationship || 'No answer'}</p>
                  <p>Have kids: {profile.lifestyle?.haveKids !== undefined ? (profile.lifestyle.haveKids ? 'Yes' : 'No') : 'No answer'}</p>
                  <p>Smoke: {profile.lifestyle?.smoke || 'No answer'}</p>
                  <p>Drink: {profile.lifestyle?.drink || 'No answer'}</p>
                  <p>Height: {profile.lifestyle?.height || 'No answer'}</p>
                  <p>Body type: {profile.lifestyle?.bodyType || 'No answer'}</p>
                  <p>Eyes: {profile.lifestyle?.eyes || 'No answer'}</p>
                  <p>Hair: {profile.lifestyle?.hair || 'No answer'}</p>
                </div>
              </div>
            </div>

            {/* I'm Looking for */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">I'm Looking for</h2>
                <button className="text-gray-600 hover:text-gray-800">
                  <FaEdit />
                </button>
              </div>
              <div className="text-gray-700">
                <p>
                  {profile.preferences?.lookingFor === 'male' && 'Man'}
                  {profile.preferences?.lookingFor === 'female' && 'Woman'}
                  {profile.preferences?.lookingFor === 'both' && 'Both'},{' '}
                  {profile.preferences?.ageRange?.min || 20} - {profile.preferences?.ageRange?.max || 35} years old
                </p>
                {profile.preferences?.description && (
                  <p className="mt-2">{profile.preferences.description}</p>
                )}
              </div>
            </div>

            {/* Sparks Button */}
            <div className="text-center mb-6">
              <button className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition">
                0 SPARKS
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 h-screen sticky top-0 overflow-y-auto">
          {/* My Contacts */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">My Contacts</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">4</span>
            </div>

            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-3 mb-4 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold">{contact.name[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{contact.name}</span>
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
                    {request.name === 'MARIA' && (
                      <button className="mt-2 bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 transition">
                        REPLY
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
  );
};

export default MyProfile;
