import { useState, useRef, useEffect } from 'react';
import { FaEnvelope, FaSmile, FaCamera, FaVideo, FaPaperPlane, FaTimes, FaEllipsisV, FaHeart } from 'react-icons/fa';
import axios from 'axios';

const InboxEmailComposer = ({ email, onClose, onSent, user }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('snow');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [catalogGifts, setCatalogGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [sendingGiftId, setSendingGiftId] = useState(null);
  const fileInputRef = useRef(null);

  if (!email) return null;

  const getSenderName = () => {
    if (email.sender === user.id) {
      return email.receiverData?.profile?.firstName || email.receiverData?.email?.split('@')[0] || 'Unknown';
    }
    return email.senderData?.profile?.firstName || email.senderData?.email?.split('@')[0] || 'Unknown';
  };

  const getSenderImage = () => {
    if (email.sender === user.id) {
      const photos = email.receiverData?.profile?.photos;
      if (photos && Array.isArray(photos) && photos.length > 0) {
        return photos[0]?.url || photos[0] || null;
      }
      return null;
    }
    const photos = email.senderData?.profile?.photos;
    if (photos && Array.isArray(photos) && photos.length > 0) {
      return photos[0]?.url || photos[0] || null;
    }
    return null;
  };

  const getReceiverId = () => {
    // If we're replying, the receiver is the original sender
    // If email.sender is current user, we sent it, so receiver is the other person
    // If email.receiver is current user, we received it, so we reply to the sender
    if (email.sender === user.id) {
      // We sent this email, so receiver is the other person
      return email.receiver;
    } else {
      // We received this email, so we reply to the sender
      return email.sender;
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedMedia) {
      alert('Please enter a message or attach a photo/video');
      return;
    }

    try {
      setSending(true);
      const receiverId = getReceiverId();
      
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      formData.append('content', message.trim());
      
      if (subject && subject.trim()) {
        formData.append('subject', subject.trim());
      }
      
      if (selectedMedia) {
        formData.append('media', selectedMedia);
      }
      
      await axios.post('/api/messages/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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

  // Fetch gift catalog when composer is open
  useEffect(() => {
    if (!email) return;
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
  }, [email]);

  const sendGift = async (giftId) => {
    const receiverId = getReceiverId();
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

  const backgrounds = [
    { name: 'Vintage', thumbnail: '📮' },
    { name: 'Rural', thumbnail: '🌾' },
    { name: 'Town', thumbnail: '🏘️' },
    { name: 'Sunset', thumbnail: '🌅' },
    { name: 'Polka', thumbnail: '⚪' },
    { name: 'Beach', thumbnail: '🏖️' },
  ];

  const handlePhotoVideoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedMedia(file);
      // Create preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
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

  const senderName = getSenderName();
  const senderImage = getSenderImage();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: selectedBackground === 'snow' 
            ? 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #fafafa 100%)'
            : 'white',
        }}
      >
        {/* Header with recipient profile */}
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {senderImage ? (
                <img
                  src={senderImage}
                  alt={senderName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center border-2 border-white shadow-md">
                  <span className="text-white font-semibold text-2xl">
                    {senderName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  My Email to {senderName}
                </h2>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {/* Options Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <FaEllipsisV />
                  </button>
                  {showOptions && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-10">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                        Block User
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                        Report a Violation
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                        Disable Sound
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <FaTimes />
                </button>
              </div>
              {/* Small Photo/Video & Smiles links in header right corner */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <button 
                  onClick={handlePhotoVideoClick}
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <FaCamera className="text-sm" />
                  <span>Photo/Video</span>
                </button>
                <button 
                  onClick={handleSmilesClick}
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <FaSmile className="text-sm" />
                  <span>Smiles</span>
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
          </div>
        </div>

        {/* Email Composition Area */}
        <div className="p-6">
            {/* Subject Field */}
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />

            {/* Message Field */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
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

            {/* Send a heartfelt gift */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                Send {senderName} a heartfelt gift <FaHeart className="text-red-500 text-xs" />
              </h3>
              {loadingGifts ? (
                <div className="text-sm text-gray-500 py-2">Loading gifts...</div>
              ) : catalogGifts.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">No gifts available.</div>
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
              disabled={sending || !message.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              <FaEnvelope className="text-xl" />
              <span>{sending ? 'SENDING...' : 'SEND EMAIL'}</span>
            </button>

            {/* Background Themes */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
              {backgrounds.map((bg, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedBackground(bg.name.toLowerCase())}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
                    selectedBackground === bg.name.toLowerCase()
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={bg.name}
                >
                  {bg.thumbnail}
                  {selectedBackground === bg.name.toLowerCase() && (
                    <span className="absolute text-green-500 text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
};

export default InboxEmailComposer;
