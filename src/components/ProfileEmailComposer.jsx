import { useState, useRef, useEffect } from 'react';
import { FaEnvelope, FaSmile, FaCamera, FaTimes, FaComments, FaHeart } from 'react-icons/fa';
import axios from 'axios';

const ProfileEmailComposer = ({ profile, onClose, onSent, onOpenChat }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [catalogGifts, setCatalogGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [sendingGiftId, setSendingGiftId] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim() && !selectedMedia) {
      alert('Please enter a message or attach a photo/video');
      return;
    }

    if (!profile) {
      alert('Error: Profile information is missing');
      return;
    }

    try {
      setSending(true);
      console.log('📧 Sending email to profile:', profile);
      
      // The profile object from the API has userId field
      const receiverId = profile.userId;
      
      if (!receiverId) {
        console.error('❌ Profile userId missing:', profile);
        alert('Error: Could not find receiver ID. Please refresh the page and try again.');
        setSending(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      formData.append('content', message.trim());
      
      // Only include subject if it's not empty
      if (subject && subject.trim()) {
        formData.append('subject', subject.trim());
      }
      
      if (selectedMedia) {
        formData.append('media', selectedMedia);
      }
      
      console.log('📧 Sending email payload:', { receiverId, hasSubject: !!subject, contentLength: message.length, hasMedia: !!selectedMedia });
      
      const response = await axios.post('/api/messages/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Email sent successfully:', response.data);
      
      alert('Email sent successfully!');
      setSubject('');
      setMessage('');
      setSelectedMedia(null);
      setMediaPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onSent) onSent();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  // Fetch gift catalog when composer is open – virtual gifts show in place of stickers
  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    const load = async () => {
      setLoadingGifts(true);
      try {
        const { data } = await axios.get('/api/gifts/catalog');
        if (!cancelled) setCatalogGifts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setCatalogGifts([]);
      } finally {
        if (!cancelled) setLoadingGifts(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [profile]);

  const sendGift = async (giftId) => {
    const receiverId = profile?.userId;
    if (!receiverId || !giftId) return;
    const gift = catalogGifts.find((g) => g.id === giftId);
    setSendingGiftId(giftId);
    try {
      await axios.post('/api/gifts/send', { receiverId, giftId });
      // Send gift as attachment inside email (like a sticker)
      const emailForm = new FormData();
      emailForm.append('receiverId', receiverId);
      emailForm.append('subject', '');
      emailForm.append('content', '');
      if (gift?.imageUrl) emailForm.append('mediaUrl', gift.imageUrl);
      await axios.post('/api/messages/send-email', emailForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (onSent) onSent();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send gift';
      const balance = err.response?.data?.balance;
      alert(balance != null ? `${msg} (Your balance: ${balance} credits)` : msg);
    } finally {
      setSendingGiftId(null);
    }
  };

  const handlePhotoVideoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedMedia(file);
      // Create preview for both images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSmilesClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Common emojis
  const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header with decorative background - watercolor style */}
      <div className="relative h-40 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-6 left-8 text-7xl transform rotate-12">🗼</div>
          <div className="absolute top-10 right-12 text-5xl transform -rotate-12">🦋</div>
          <div className="absolute bottom-6 left-1/3 text-4xl transform rotate-6">🌸</div>
          <div className="absolute bottom-8 right-1/4 text-3xl">🌺</div>
        </div>
        {/* PARIS text vertically */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90 origin-left">
          <span className="text-2xl font-bold text-gray-700 opacity-40">PARIS</span>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center mb-3 overflow-hidden">
            {profile.photos && profile.photos.length > 0 ? (
              <img 
                src={profile.photos[0]?.url || profile.photos[0]} 
                alt={profile.firstName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-3xl">👤</span>';
                }}
              />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            My Email to {profile.firstName}
          </h3>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-100 transition"
          >
            <FaTimes />
          </button>
        </div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Email Composition Area */}
      <div className="p-6">
          {/* Chat, Email, Photo/Video, Smiles - Same line, 2 corners */}
          <div className="flex items-center justify-between mb-4">
            {/* Left corner - Chat and Email */}
            <div className="flex items-center gap-4">
              {onOpenChat && (
                <button
                  onClick={onOpenChat}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaComments className="text-lg" />
                  <span className="font-medium">Chat</span>
                </button>
              )}
              <button
                className="flex items-center gap-2 px-4 py-2 text-teal-600 transition-colors"
              >
                <FaEnvelope className="text-lg" />
                <span className="font-medium">Email</span>
              </button>
            </div>
            
            {/* Right corner - Photo/Video and Smiles */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePhotoVideoClick}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Photo/Video"
              >
                <FaCamera className="text-base" />
                <span>Photo/Video</span>
              </button>
              <button 
                onClick={handleSmilesClick}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Smiles"
              >
                <FaSmile className="text-base" />
                <span>Smiles</span>
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />

          {/* Message Field */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />

          {/* Media Preview */}
          {mediaPreview && (
            <div className="mb-4 relative">
              {selectedMedia?.type.startsWith('image/') ? (
                <img src={mediaPreview} alt="Preview" className="max-w-full max-h-48 rounded-lg" />
              ) : selectedMedia?.type.startsWith('video/') ? (
                <video src={mediaPreview} controls className="max-w-full max-h-48 rounded-lg" />
              ) : null}
              <button
                onClick={() => {
                  setSelectedMedia(null);
                  setMediaPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <div className="grid grid-cols-8 gap-2">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Send a heartfelt gift – virtual gifts from catalog (replaces stickers) */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
              Send {profile?.firstName || 'them'} a heartfelt gift <FaHeart className="text-red-500 text-xs" />
            </h3>
            {loadingGifts ? (
              <div className="text-sm text-gray-500 py-2">Loading gifts...</div>
            ) : catalogGifts.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">No gifts available. Add virtual gifts in Admin.</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {catalogGifts.map((g) => {
                  const cost = g.creditCost ?? 0;
                  const isFree = cost === 0;
                  const sending = sendingGiftId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => sendGift(g.id)}
                      disabled={sending}
                      className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 hover:border-pink-300 hover:shadow-md rounded-lg transition-all relative min-w-[70px] disabled:opacity-60"
                      title={g.name}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-1">
                        {g.imageUrl ? (
                          <img src={g.imageUrl} alt={g.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <span className="text-2xl">🎁</span>
                        )}
                      </div>
                      {isFree && (
                        <span className="absolute top-0.5 right-0.5 bg-green-600 text-white text-[10px] px-1 rounded font-medium">FREE</span>
                      )}
                      <span className="text-xs font-semibold text-gray-600">
                        {isFree ? '0 Credits' : `${cost} Credits`}
                      </span>
                      {sending && <span className="text-[10px] text-gray-500">Sending...</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || (!message.trim() && !selectedMedia)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaEnvelope />
            {sending ? 'SENDING...' : 'SEND EMAIL'}
          </button>
        </div>
    </div>
  );
};

export default ProfileEmailComposer;
