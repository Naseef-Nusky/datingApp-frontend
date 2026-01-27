import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaEdit, FaCamera, FaHeart, FaGift, FaUmbrellaBeach, FaCar, FaGlobe, FaSearch, FaVolumeUp, FaChevronDown, FaTimes, FaLock, FaUnlock } from 'react-icons/fa';
import PhotoUploadModal from '../components/PhotoUploadModal';
import PhotoViewModal from '../components/PhotoViewModal';

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAdditionalPhoto, setUploadingAdditionalPhoto] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [showPhotoViewModal, setShowPhotoViewModal] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(null);
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioText, setBioText] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);
  const [showLookingForModal, setShowLookingForModal] = useState(false);
  const [lookingForGender, setLookingForGender] = useState('female');
  const [minAge, setMinAge] = useState(20);
  const [maxAge, setMaxAge] = useState(35);
  const [lookingForDescription, setLookingForDescription] = useState('');
  const [savingLookingFor, setSavingLookingFor] = useState(false);
  const [showAboutMeModal, setShowAboutMeModal] = useState(false);
  const [aboutMeData, setAboutMeData] = useState({
    location: '',
    work: '',
    education: '',
    languages: [],
    relationship: '',
    haveKids: '',
    smoke: '',
    drink: '',
    height: '',
    bodyType: '',
    eyes: '',
    hair: '',
  });
  const [savingAboutMe, setSavingAboutMe] = useState(false);
  const [showWishlistEdit, setShowWishlistEdit] = useState(false);
  const [wishlistCatalog, setWishlistCatalog] = useState({ categories: [], products: [] });
  const [draftWishlist, setDraftWishlist] = useState([]);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistActiveTab, setWishlistActiveTab] = useState('wishlist');

  useEffect(() => {
    fetchProfile();
    fetchContacts();
    fetchChatRequests();
  }, []);

  // Periodic refresh for contacts and chat requests
  useEffect(() => {
    const contactsInterval = setInterval(() => {
      fetchContacts();
    }, 10000); // Refresh every 10 seconds

    const chatRequestsInterval = setInterval(() => {
      fetchChatRequests();
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(contactsInterval);
      clearInterval(chatRequestsInterval);
    };
  }, []);

  // Periodic refresh for contacts and chat requests
  useEffect(() => {
    const contactsInterval = setInterval(() => {
      fetchContacts();
    }, 10000); // Refresh every 10 seconds

    const chatRequestsInterval = setInterval(() => {
      fetchChatRequests();
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(contactsInterval);
      clearInterval(chatRequestsInterval);
    };
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

  // Handle main profile photo upload (replaces first photo)
  const handleProfilePhotoUpload = async (file, isPublic) => {
    if (!file) return;

    setUploadingProfilePhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('isPublic', isPublic);

      // This updates/replaces the main profile photo
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

      setShowProfilePhotoModal(false);
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Upload profile photo error:', error);
      alert(error.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  // Handle adding additional photos (adds to gallery, doesn't replace first)
  const handleAddMorePhotos = async (file, isPublic) => {
    if (!file) return;

    setUploadingAdditionalPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('isPublic', isPublic);

      // This adds a new photo to the gallery (doesn't replace first)
      const response = await axios.post('/api/profiles/me/photos/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update profile with new photos
      setProfile((prev) => ({
        ...prev,
        photos: response.data.photos,
      }));

      setShowAddPhotoModal(false);
      alert('Photo added successfully!');
    } catch (error) {
      console.error('Add photo error:', error);
      alert(error.response?.data?.message || 'Failed to add photo');
    } finally {
      setUploadingAdditionalPhoto(false);
    }
  };

  // Handle toggling photo privacy
  const handleTogglePhotoPrivacy = async (photoIndex) => {
    try {
      const photo = profile.photos[photoIndex];
      // Handle both string and object formats
      const currentPrivacy = typeof photo === 'string' ? true : (photo?.isPublic !== false);
      const newPrivacy = !currentPrivacy;

      const response = await axios.put(`/api/profiles/me/photos/${photoIndex}/privacy`, {
        isPublic: newPrivacy,
      });

      // Update profile with updated photos
      setProfile((prev) => ({
        ...prev,
        photos: response.data.photos,
      }));

      // Update the modal if it's open
      if (showPhotoViewModal && selectedPhotoIndex === photoIndex) {
        // Modal will re-render with updated photo
      }
    } catch (error) {
      console.error('Toggle photo privacy error:', error);
      alert(error.response?.data?.message || 'Failed to update photo privacy');
    }
  };

  // Handle setting photo as thumbnail
  const handleSetAsThumbnail = async (photoIndex) => {
    try {
      const response = await axios.put(`/api/profiles/me/photos/${photoIndex}/set-thumbnail`);

      // Update profile with updated photos
      setProfile((prev) => ({
        ...prev,
        photos: response.data.photos,
      }));

      alert('Photo set as thumbnail successfully!');
    } catch (error) {
      console.error('Set thumbnail error:', error);
      alert(error.response?.data?.message || 'Failed to set photo as thumbnail');
    }
  };

  // Handle opening photo view modal
  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setShowPhotoViewModal(true);
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

  const handleOpenBioModal = () => {
    setBioText(profile?.bio || 'To meet someone to have a loving relationship');
    setShowBioModal(true);
  };

  const handleCloseBioModal = () => {
    setShowBioModal(false);
    setBioText('');
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const response = await axios.put('/api/profiles/me', {
        bio: bioText,
      });

      // Update profile with new bio
      setProfile((prev) => ({
        ...prev,
        bio: bioText,
      }));

      setShowBioModal(false);
      alert('Bio updated successfully!');
    } catch (error) {
      console.error('Update bio error:', error);
      alert(error.response?.data?.message || 'Failed to update bio');
    } finally {
      setSavingBio(false);
    }
  };

  const handleOpenInterestsModal = () => {
    setSelectedInterests(profile?.interests || []);
    setShowInterestsModal(true);
  };

  const handleCloseInterestsModal = () => {
    setShowInterestsModal(false);
    setSelectedInterests([]);
  };

  const handleToggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    try {
      const response = await axios.put('/api/profiles/me', {
        interests: selectedInterests,
      });

      // Update profile with new interests
      setProfile((prev) => ({
        ...prev,
        interests: selectedInterests,
      }));

      setShowInterestsModal(false);
      alert('Interests updated successfully!');
    } catch (error) {
      console.error('Update interests error:', error);
      alert(error.response?.data?.message || 'Failed to update interests');
    } finally {
      setSavingInterests(false);
    }
  };

  const handleOpenLookingForModal = () => {
    const preferences = profile?.preferences || {};
    setLookingForGender(preferences.lookingFor || 'female');
    setMinAge(preferences.ageRange?.min || 20);
    setMaxAge(preferences.ageRange?.max || 35);
    setLookingForDescription(preferences.description || '');
    setShowLookingForModal(true);
  };

  const handleCloseLookingForModal = () => {
    setShowLookingForModal(false);
    setLookingForGender('female');
    setMinAge(20);
    setMaxAge(35);
    setLookingForDescription('');
  };

  const handleSaveLookingFor = async () => {
    setSavingLookingFor(true);
    try {
      const response = await axios.put('/api/profiles/me', {
        preferences: {
          lookingFor: lookingForGender,
          ageRange: {
            min: minAge,
            max: maxAge,
          },
          description: lookingForDescription,
        },
      });

      // Update profile with new preferences
      setProfile((prev) => ({
        ...prev,
        preferences: {
          lookingFor: lookingForGender,
          ageRange: {
            min: minAge,
            max: maxAge,
          },
          description: lookingForDescription,
        },
      }));

      setShowLookingForModal(false);
      alert('Preferences updated successfully!');
    } catch (error) {
      console.error('Update preferences error:', error);
      alert(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSavingLookingFor(false);
    }
  };

  const handleOpenAboutMeModal = () => {
    const lifestyle = profile?.lifestyle || {};
    const location = profile?.location || {};
    setAboutMeData({
      location: location.city && location.country 
        ? `${location.city}, ${location.country}` 
        : (location.city || location.country || ''),
      work: lifestyle.work || '',
      education: lifestyle.education || '',
      languages: lifestyle.languages || [],
      relationship: lifestyle.relationship || '',
      haveKids: lifestyle.haveKids !== undefined ? (lifestyle.haveKids ? 'Yes' : 'No') : '',
      smoke: lifestyle.smoke || '',
      drink: lifestyle.drink || '',
      height: lifestyle.height || '',
      bodyType: lifestyle.bodyType || '',
      eyes: lifestyle.eyes || '',
      hair: lifestyle.hair || '',
    });
    setShowAboutMeModal(true);
  };

  const handleCloseAboutMeModal = () => {
    setShowAboutMeModal(false);
    setAboutMeData({
      location: '',
      work: '',
      education: '',
      languages: [],
      relationship: '',
      haveKids: '',
      smoke: '',
      drink: '',
      height: '',
      bodyType: '',
      eyes: '',
      hair: '',
    });
  };

  const handleSaveAboutMe = async () => {
    setSavingAboutMe(true);
    try {
      // Parse location
      const locationParts = aboutMeData.location.split(',').map(s => s.trim());
      const location = {
        city: locationParts[0] || '',
        country: locationParts[1] || '',
      };

      const response = await axios.put('/api/profiles/me', {
        location,
        lifestyle: {
          work: aboutMeData.work,
          education: aboutMeData.education,
          languages: Array.isArray(aboutMeData.languages) ? aboutMeData.languages : [aboutMeData.languages].filter(Boolean),
          relationship: aboutMeData.relationship,
          haveKids: aboutMeData.haveKids === 'Yes',
          smoke: aboutMeData.smoke,
          drink: aboutMeData.drink,
          height: aboutMeData.height,
          bodyType: aboutMeData.bodyType,
          eyes: aboutMeData.eyes,
          hair: aboutMeData.hair,
        },
      });

      // Update profile with new data
      setProfile((prev) => ({
        ...prev,
        location,
        lifestyle: {
          work: aboutMeData.work,
          education: aboutMeData.education,
          languages: Array.isArray(aboutMeData.languages) ? aboutMeData.languages : [aboutMeData.languages].filter(Boolean),
          relationship: aboutMeData.relationship,
          haveKids: aboutMeData.haveKids === 'Yes',
          smoke: aboutMeData.smoke,
          drink: aboutMeData.drink,
          height: aboutMeData.height,
          bodyType: aboutMeData.bodyType,
          eyes: aboutMeData.eyes,
          hair: aboutMeData.hair,
        },
      }));

      setShowAboutMeModal(false);
      alert('About Me updated successfully!');
    } catch (error) {
      console.error('Update about me error:', error);
      alert(error.response?.data?.message || 'Failed to update About Me');
    } finally {
      setSavingAboutMe(false);
    }
  };

  const handleOpenWishlistEdit = async () => {
    setShowWishlistEdit(true);
    setWishlistActiveTab('wishlist');
    const current = Array.isArray(profile?.wishlist) ? profile.wishlist : [];
    setDraftWishlist(current.map((item) => ({
      productId: item.productId || item.id || '',
      name: item.name || item.item || '',
      imageUrl: item.imageUrl || '',
    })));
    try {
      const { data } = await axios.get('/api/wishlist/catalog');
      setWishlistCatalog({ categories: data.categories || [], products: data.products || [] });
    } catch (err) {
      console.error('Wishlist catalog error:', err);
      setWishlistCatalog({ categories: [], products: [] });
    }
  };

  const handleCloseWishlistEdit = () => {
    setShowWishlistEdit(false);
    setDraftWishlist([]);
  };

  const handleRemoveFromWishlist = (index) => {
    setDraftWishlist((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddToWishlist = (product) => {
    const entry = { productId: product.id, name: product.name, imageUrl: product.imageUrl || '' };
    setDraftWishlist((prev) => (prev.some((w) => w.productId === product.id) ? prev : [...prev, entry]));
  };

  const handleSaveWishlist = async () => {
    setSavingWishlist(true);
    try {
      await axios.put('/api/profiles/me', { wishlist: draftWishlist });
      setProfile((prev) => ({ ...prev, wishlist: draftWishlist }));
      setShowWishlistEdit(false);
    } catch (err) {
      console.error('Save wishlist error:', err);
      alert(err.response?.data?.message || 'Failed to save wishlist');
    } finally {
      setSavingWishlist(false);
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
        
        // Add system contact (Concierge) at the beginning
        contactsList.unshift({
          id: 'system-concierge',
          name: 'Julia Concierge',
          type: 'Concierge',
          message: 'Welcome to Dating...',
          unreadCount: 1,
          avatar: null,
        });
        
        setContacts(contactsList);
        console.log('✅ Loaded', contactsList.length, 'contacts');
      } else {
        // Fallback to default contact
        console.log('⚠️ No conversations found, using default contact');
        setContacts([
          {
            id: 'system-concierge',
            name: 'Julia Concierge',
            type: 'Concierge',
            message: 'Welcome to Dating...',
            unreadCount: 1,
            avatar: null,
          },
        ]);
      }
    } catch (error) {
      console.error('❌ Fetch contacts error:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Fallback to default contact on error
      setContacts([
        {
          id: 'system-concierge',
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

  const handleAcceptChatRequest = async (requestId, senderId) => {
    try {
      const response = await axios.put(`/api/messages/chat-requests/${requestId}/accept`);
      
      if (response.data && response.data.chatId) {
        alert('Chat request accepted! You can now send messages.');
        // Refresh chat requests and contacts
        fetchChatRequests();
        fetchContacts();
        // Optionally navigate to chat or refresh contacts
        if (senderId) {
          // Navigate to sender's profile or open chat
          navigate(`/profile/${senderId}`);
        }
      }
    } catch (error) {
      console.error('Accept chat request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept chat request';
      alert(errorMessage);
    }
  };

  const handleRejectChatRequest = async (requestId) => {
    try {
      await axios.put(`/api/messages/chat-requests/${requestId}/reject`);
      alert('Chat request rejected');
      // Refresh chat requests
      fetchChatRequests();
    } catch (error) {
      console.error('Reject chat request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject chat request';
      alert(errorMessage);
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
    'Nature': { icon: FaHeart, color: 'bg-green-500' },
    'Sports': { icon: FaHeart, color: 'bg-blue-500' },
    'Travelling': { icon: FaHeart, color: 'bg-purple-500' },
    'Watching TV': { icon: FaHeart, color: 'bg-red-500' },
    'Reading': { icon: FaHeart, color: 'bg-indigo-500' },
    'Music': { icon: FaHeart, color: 'bg-pink-500' },
    'Cooking': { icon: FaHeart, color: 'bg-orange-500' },
    'Photography': { icon: FaCamera, color: 'bg-gray-500' },
    'Fitness': { icon: FaHeart, color: 'bg-teal-500' },
  };

  // Available interests list
  const availableInterests = Object.keys(interestIcons);

  const displayedChatRequests = showLessChatRequests ? chatRequests.slice(0, 5) : chatRequests;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 overflow-visible lg:mr-80">
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

            {/* Banner Overlay Content with Container */}
            <div className="absolute inset-0 overflow-visible">
              <div className="container mx-auto px-2 sm:px-4 lg:px-6 h-full relative max-w-6xl overflow-visible">
                {/* Top Left */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-4 lg:left-6 space-y-1 sm:space-y-2 z-10">
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-800 bg-opacity-90 text-white px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-opacity-100 transition"
                  >
                    BACK
                  </button>
                  <button className="bg-gray-800 bg-opacity-90 text-white px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-opacity-100 transition block">
                    CHANGE SUBSCRIPTION PLAN
                  </button>
                </div>

                {/* Top Right */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-4 lg:right-6 z-10">
                  <label className="bg-gray-800 bg-opacity-90 text-white px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-opacity-100 transition cursor-pointer inline-block">
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

                {/* Bottom Right - Credits */}
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:bottom-4 lg:right-6 z-10">
                  <button className="bg-black bg-opacity-70 text-white px-3 py-1 sm:px-6 sm:py-2 text-xs sm:text-sm rounded hover:bg-opacity-90 transition font-semibold">
                    {user?.credits || 135} CREDITS - REFILL
                  </button>
                </div>

                {/* Profile Picture - Left Side, Overlapping Bottom */}
                <div className="absolute bottom-0 left-2 sm:left-4 lg:left-6 transform translate-y-1/2 z-20">
                  <div className="relative">
                    {profile.photos && profile.photos.length > 0 ? (
                      <div className="relative">
                        <img
                          src={typeof profile.photos[0] === 'string' ? profile.photos[0] : profile.photos[0]?.url}
                          alt={profile.firstName}
                          className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 object-cover border-2 sm:border-4 border-white shadow-xl cursor-pointer hover:opacity-90 transition"
                          onClick={() => handlePhotoClick(0)}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/192';
                          }}
                        />
                        {/* Upload Photo Button Overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setButtonPosition({
                              top: rect.top,
                              bottom: rect.bottom,
                              left: rect.left,
                              right: rect.right,
                              width: rect.width,
                              height: rect.height
                            });
                            setShowProfilePhotoModal(true);
                          }}
                          className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 text-white px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-center cursor-pointer hover:bg-opacity-100 transition"
                          disabled={uploadingProfilePhoto}
                        >
                          {uploadingProfilePhoto ? 'UPLOADING...' : 'UPLOAD PHOTO'}
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-gray-300 border-2 sm:border-4 border-white shadow-xl flex items-center justify-center">
                        <FaHeart className="text-2xl sm:text-4xl lg:text-6xl text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Name, Age, and ID - Right of Profile Picture, Overlaid on Cover */}
                <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-28 sm:left-36 md:left-40 lg:left-64 z-10 max-w-[calc(100%-120px)] sm:max-w-[calc(100%-160px)] md:max-w-none">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2 flex-wrap">
                    <h1 className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold text-white truncate">
                      {profile.firstName}
                    </h1>
                    <button className="text-white hover:text-gray-200 text-xs sm:text-sm md:text-xl flex-shrink-0">×</button>
                    <h1 className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold text-white">
                      , {profile.age}
                    </h1>
                    <button className="text-white hover:text-gray-200 flex-shrink-0">
                      <FaEdit className="text-xs sm:text-sm" />
                    </button>
                  </div>
                  <p className="text-white text-[10px] sm:text-xs md:text-sm truncate">ID: {user?.id?.substring(0, 12) || '112305522631'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Sections - Container */}
          <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
            {/* A Few Words About Myself */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 mt-12 sm:mt-16 lg:mt-24">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">A Few Words About Myself</h2>
                <button 
                  onClick={handleOpenBioModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaEdit className="text-xs sm:text-sm" />
                </button>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">
                {profile.bio || 'To meet someone to have a loving relationship'}
              </p>
            </div>

            {/* Your Wishlist */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Your Wishlist</h2>
                <button
                  onClick={handleOpenWishlistEdit}
                  className="bg-gray-300 text-gray-700 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-gray-400 transition cursor-pointer"
                >
                  EDIT WISHLIST
                </button>
              </div>

              {profile.wishlist && profile.wishlist.length > 0 ? (
                <ul className="space-y-2">
                  {profile.wishlist.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      • {item.name || item.item || ''} {item.description ? `- ${item.description}` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">
                  Looks like the Wishlist hasn't been completed yet
                </p>
              )}
            </div>

            {/* Wishlist popup modal */}
            {showWishlistEdit && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                onClick={(e) => e.target === e.currentTarget && handleCloseWishlistEdit()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="wishlist-modal-title"
              >
                <div
                  className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal header with X */}
                  <div className="flex items-center justify-between shrink-0 px-4 py-3 border-b border-gray-200">
                    <h2 id="wishlist-modal-title" className="text-lg font-semibold text-gray-800">
                      Edit Wishlist
                    </h2>
                    <button
                      type="button"
                      onClick={handleCloseWishlistEdit}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                      aria-label="Close"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Category tabs */}
                  <div className="shrink-0 flex flex-wrap gap-2 px-4 pt-3 pb-2 border-b border-gray-200 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => setWishlistActiveTab('wishlist')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-t text-sm font-medium transition ${
                        wishlistActiveTab === 'wishlist'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                          : 'text-gray-600 hover:bg-white/80'
                      }`}
                    >
                      <FaGift className="text-sm" /> Wishlist
                    </button>
                    {wishlistCatalog.categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setWishlistActiveTab(cat.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-t text-sm font-medium transition ${
                          wishlistActiveTab === cat.id
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                            : 'text-gray-600 hover:bg-white/80'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto p-4 min-h-0">
                    {wishlistActiveTab === 'wishlist' && (
                      <div>
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Wishlist</h3>
                        {draftWishlist.length === 0 ? (
                          <p className="text-gray-500 py-4">No items in your wishlist. Add from the categories above.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {draftWishlist.map((item, index) => (
                              <div key={`${item.productId}-${index}`} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                <div className="aspect-square bg-gray-100 relative">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <FaGift className="w-12 h-12" />
                                    </div>
                                  )}
                                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                                    <FaGift className="w-3 h-3" /> Wishlist
                                  </span>
                                </div>
                                <p className="p-3 font-medium text-gray-800 truncate">{item.name}</p>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromWishlist(index)}
                                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition"
                                >
                                  REMOVE FROM WISHLIST
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {wishlistActiveTab !== 'wishlist' && (
                      <div>
                        {(() => {
                          const cat = wishlistCatalog.categories.find((c) => c.id === wishlistActiveTab);
                          const prods = wishlistCatalog.products.filter((p) => p.categoryId === wishlistActiveTab || (p.category && p.category.id === wishlistActiveTab));
                          return (
                            <>
                              <h3 className="text-base font-semibold text-gray-800 mb-4">{cat?.name || 'Products'}</h3>
                              {prods.length === 0 ? (
                                <p className="text-gray-500 py-4">No products in this category.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {prods.map((p) => {
                                    const inWishlist = draftWishlist.some((w) => w.productId === p.id);
                                    return (
                                      <div key={p.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <div className="aspect-square bg-gray-100 relative">
                                          {p.imageUrl ? (
                                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                              <FaGift className="w-12 h-12" />
                                            </div>
                                          )}
                                        </div>
                                        <p className="p-3 font-medium text-gray-800 truncate">{p.name}</p>
                                        <button
                                          type="button"
                                          onClick={() => !inWishlist && handleAddToWishlist(p)}
                                          disabled={inWishlist}
                                          className={`w-full py-2.5 text-sm font-medium transition ${
                                            inWishlist ? 'bg-gray-300 text-gray-500 cursor-default' : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                                          }`}
                                        >
                                          {inWishlist ? 'In Wishlist' : 'ADD TO WISHLIST'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Footer: Cancel + SAVE CHANGES */}
                  <div className="shrink-0 flex justify-end items-center gap-3 px-4 py-4 border-t border-gray-200 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={handleCloseWishlistEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveWishlist}
                      disabled={savingWishlist}
                      className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow disabled:opacity-50"
                    >
                      {savingWishlist ? 'Saving...' : 'SAVE CHANGES'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Photos Section */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Add more photos</h2>
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setButtonPosition({
                      top: rect.top,
                      bottom: rect.bottom,
                      left: rect.left,
                      right: rect.right,
                      width: rect.width,
                      height: rect.height
                    });
                    setShowAddPhotoModal(true);
                  }}
                  className="bg-gray-300 text-gray-700 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-gray-400 transition cursor-pointer"
                  disabled={uploadingAdditionalPhoto}
                >
                  {uploadingAdditionalPhoto ? 'UPLOADING...' : 'ADD'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {profile.photos && profile.photos.length > 0 ? (
                  profile.photos.map((photo, index) => {
                    // Handle both string and object formats
                    const photoUrl = typeof photo === 'string' ? photo : photo?.url;
                    const isPublic = typeof photo === 'string' ? true : (photo?.isPublic !== false);
                    
                    return (
                      <div key={index} className="relative group cursor-pointer" onClick={() => handlePhotoClick(index)}>
                        <img
                          src={photoUrl}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 sm:h-40 md:h-48 object-cover rounded transition hover:opacity-90"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200';
                          }}
                        />
                        {/* Privacy Indicator */}
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isPublic
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Thumbnail
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(index);
                          }}
                          className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* My Interests */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold">My Interests</h2>
                  <button 
                    onClick={handleOpenInterestsModal}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaEdit className="text-sm sm:text-base" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.slice(0, 3).map((interest, index) => {
                      const interestData = interestIcons[interest] || { icon: FaHeart, color: 'bg-blue-500' };
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
                    <p className="text-gray-600 text-sm">No interests added yet</p>
                  )}
                </div>
              </div>

              {/* About Me */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold">About Me</h2>
                  <button 
                    onClick={handleOpenAboutMeModal}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaEdit className="text-sm sm:text-base" />
                  </button>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
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
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">I'm Looking for</h2>
                <button 
                  onClick={handleOpenLookingForModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaEdit className="text-sm sm:text-base" />
                </button>
              </div>
              <div className="text-gray-700 text-sm sm:text-base">
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
            <div className="text-center mb-4 sm:mb-6">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 sm:px-8 sm:py-3 text-xs sm:text-sm rounded-lg hover:bg-gray-400 transition w-full sm:w-auto">
                0 SPARKS
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200 h-screen sticky top-0 overflow-y-auto">
          {/* My Contacts */}
          <div className="p-4 pt-6 border-b border-gray-200 bg-white mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">My Contacts</h3>
              {contacts.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {contacts.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
                </span>
              )}
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No contacts yet</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div 
                  key={contact.id || `contact-${Math.random()}`} 
                  className="flex items-center space-x-3 mb-4 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                  onClick={() => {
                    if (contact.id && contact.id !== 'system-concierge' && typeof contact.id === 'string' && !contact.id.includes('system-')) {
                      navigate(`/profile/${contact.id}`);
                    }
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                        {(contact.name && contact.name[0]) || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-medium text-gray-800 text-sm truncate">
                        {contact.name || 'Unknown'}
                      </span>
                      {contact.type && (
                        <span className="text-red-500 text-xs whitespace-nowrap">{contact.type}</span>
                      )}
                      {contact.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {contact.message || 'No messages yet'}
                    </p>
                    {contact.lastMessageAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(contact.lastMessageAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
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
      </div>

      {/* About Me Edit Modal */}
      {showAboutMeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 my-8 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseAboutMeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Where do you live? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">Where do you live?</label>
                  <input
                    type="text"
                    value={aboutMeData.location}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, location: e.target.value })}
                    placeholder="Hatfield Peverel, United Kingdom"
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* What is your occupation? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">What is your occupation?</label>
                  <input
                    type="text"
                    value={aboutMeData.work}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, work: e.target.value })}
                    placeholder="Work as:"
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* What's your educational level? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">What's your educational level?</label>
                  <select
                    value={aboutMeData.education}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, education: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="High School">High School</option>
                    <option value="Some College">Some College</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                  </select>
                </div>

                {/* What languages do you know? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">What languages do you know?</label>
                  <select
                    multiple
                    value={aboutMeData.languages}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setAboutMeData({ ...aboutMeData, languages: selected });
                    }}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Russian">Russian</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>

                {/* What's your relationship status? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">What's your relationship status?</label>
                  <select
                    value={aboutMeData.relationship}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, relationship: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                {/* Do you have kids? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">Do you have kids?</label>
                  <select
                    value={aboutMeData.haveKids}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, haveKids: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Do you smoke? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">Do you smoke?</label>
                  <select
                    value={aboutMeData.smoke}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, smoke: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Sometimes">Sometimes</option>
                  </select>
                </div>

                {/* Do you drink? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">Do you drink?</label>
                  <select
                    value={aboutMeData.drink}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, drink: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Sometimes">Sometimes</option>
                  </select>
                </div>

                {/* How tall are you? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">How tall are you?</label>
                  <select
                    value={aboutMeData.height}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, height: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const feet = Math.floor((i + 48) / 12);
                      const inches = (i + 48) % 12;
                      const cm = Math.round((feet * 30.48) + (inches * 2.54));
                      return (
                        <option key={i} value={`${feet}'${inches}" (${cm}cm)`}>
                          {feet}'{inches}" ({cm}cm)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* What's your body type? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">What's your body type?</label>
                  <select
                    value={aboutMeData.bodyType}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, bodyType: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Slim">Slim</option>
                    <option value="Athletic">Athletic</option>
                    <option value="Average">Average</option>
                    <option value="Curvy">Curvy</option>
                    <option value="Plus Size">Plus Size</option>
                  </select>
                </div>

                {/* What's your eye color? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">What's your eye color?</label>
                  <select
                    value={aboutMeData.eyes}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, eyes: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Brown">Brown</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Hazel">Hazel</option>
                    <option value="Gray">Gray</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* What's your hair color? */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-1/3">What's your hair color?</label>
                  <select
                    value={aboutMeData.hair}
                    onChange={(e) => setAboutMeData({ ...aboutMeData, hair: e.target.value })}
                    className="w-2/3 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Black">Black</option>
                    <option value="Brown">Brown</option>
                    <option value="Blonde">Blonde</option>
                    <option value="Red">Red</option>
                    <option value="Gray">Gray</option>
                    <option value="White">White</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveAboutMe}
                  disabled={savingAboutMe}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingAboutMe ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Looking For Edit Modal */}
      {showLookingForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseLookingForModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              {/* I am a: Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a:
                </label>
                <select
                  value={lookingForGender}
                  onChange={(e) => setLookingForGender(e.target.value)}
                  className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="female">Man Looking for a Woman</option>
                  <option value="male">Woman Looking for a Man</option>
                  <option value="both">Looking for Both</option>
                </select>
              </div>

              {/* Between ages: Dropdowns */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Between ages:
                </label>
                <div className="flex items-center space-x-3">
                  <select
                    value={minAge}
                    onChange={(e) => setMinAge(parseInt(e.target.value))}
                    className="flex-1 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 18).map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-600">-</span>
                  <select
                    value={maxAge}
                    onChange={(e) => setMaxAge(parseInt(e.target.value))}
                    className="flex-1 p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 18).map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description Text Area */}
              <div className="mb-4">
                <textarea
                  value={lookingForDescription}
                  onChange={(e) => setLookingForDescription(e.target.value)}
                  className="w-full h-32 p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Loyal caring loving"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveLookingFor}
                  disabled={savingLookingFor}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingLookingFor ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interests Edit Modal */}
      {showInterestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseInterestsModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              {/* Example Text */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 italic">
                  <span className="font-semibold">E.G.:</span> Select your interests to help others learn more about you. You can select multiple interests.
                </p>
              </div>

              {/* Interests Selection */}
              <div className="border-2 border-blue-300 rounded-lg p-4 min-h-40">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    const interestData = interestIcons[interest] || { icon: FaHeart, color: 'bg-blue-500' };
                    const Icon = interestData.icon;
                    return (
                      <button
                        key={interest}
                        onClick={() => handleToggleInterest(interest)}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className={`w-8 h-8 ${interestData.color} rounded-full flex items-center justify-center text-white`}>
                          <Icon className="text-sm" />
                        </div>
                        <span className="text-sm text-gray-700">{interest}</span>
                        {isSelected && (
                          <span className="ml-auto text-blue-500">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveInterests}
                  disabled={savingInterests}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingInterests ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bio Edit Modal */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseBioModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Modal Content */}
            <div className="p-6">
              {/* Example Text */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 italic">
                  <span className="font-semibold">E.G.:</span> Hello, I'm looking for a companion. Someone with a big personality but able to give me plenty of attention too. Please message me if you've got a good appetite, interesting conversation and the ability to laugh at yourself.
                </p>
              </div>

              {/* Text Area */}
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full h-40 p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                placeholder="To meet someone to have a loving relationship"
              />

              {/* Save Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingBio ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 sm:py-6 mt-6 sm:mt-12">
        <div className="container mx-auto px-2 sm:px-4 text-center text-xs sm:text-sm">
          <p className="mb-1 sm:mb-2">Copyright Dating.com 2025. All rights reserved.</p>
          <p className="text-gray-400 text-[10px] sm:text-sm">
            This website is operated by VENTA SOLUTIONS PTE. LTD., located at 8 Eu Tong Sen Street #22-85, The Central, Singapore 059818 Registration No: 201900379G.
          </p>
        </div>
      </footer>

      {/* Photo Upload Modals */}
      <PhotoUploadModal
        isOpen={showProfilePhotoModal}
        onClose={() => {
          setShowProfilePhotoModal(false);
          setButtonPosition(null);
        }}
        onUpload={handleProfilePhotoUpload}
        isMainPhoto={true}
        uploading={uploadingProfilePhoto}
        buttonPosition={buttonPosition}
      />
      <PhotoUploadModal
        isOpen={showAddPhotoModal}
        onClose={() => {
          setShowAddPhotoModal(false);
          setButtonPosition(null);
        }}
        onUpload={handleAddMorePhotos}
        isMainPhoto={false}
        uploading={uploadingAdditionalPhoto}
        buttonPosition={buttonPosition}
      />

      {/* Photo View Modal */}
      {showPhotoViewModal && profile.photos && selectedPhotoIndex !== null && (
        <PhotoViewModal
          isOpen={showPhotoViewModal}
          onClose={() => {
            setShowPhotoViewModal(false);
            setSelectedPhotoIndex(null);
          }}
          photo={profile.photos[selectedPhotoIndex]}
          photoIndex={selectedPhotoIndex}
          onTogglePrivacy={handleTogglePhotoPrivacy}
          onSetAsThumbnail={handleSetAsThumbnail}
          onDelete={(index) => {
            handleDeletePhoto(index);
            setShowPhotoViewModal(false);
            setSelectedPhotoIndex(null);
          }}
          isThumbnail={selectedPhotoIndex === 0}
        />
      )}
    </div>
  );
};

export default MyProfile;
