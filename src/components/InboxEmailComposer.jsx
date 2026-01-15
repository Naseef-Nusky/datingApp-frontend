import { useState } from 'react';
import { FaEnvelope, FaSmile, FaCamera, FaVideo, FaPaperPlane, FaTimes, FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';

const InboxEmailComposer = ({ email, onClose, onSent, user }) => {
  const [activeTab, setActiveTab] = useState('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('snow');

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
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSending(true);
      const receiverId = getReceiverId();
      
      const payload = {
        receiverId: receiverId,
        content: message.trim(),
      };
      
      if (subject && subject.trim()) {
        payload.subject = subject.trim();
      }
      
      await axios.post('/api/messages/send-email', payload);
      alert('Email sent successfully!');
      setSubject('');
      setMessage('');
      if (onSent) onSent();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const stickers = [
    { emoji: '🍹', label: 'FREE', price: '0' },
    { emoji: '🏝️', label: 'Island', price: '820' },
    { emoji: '🌹', label: 'Roses', price: '498' },
    { emoji: '🎃', label: 'Pumpkin', price: '440' },
    { emoji: '❄️', label: 'Snowflake', price: '750' },
  ];

  const backgrounds = [
    { name: 'Vintage', thumbnail: '📮' },
    { name: 'Rural', thumbnail: '🌾' },
    { name: 'Town', thumbnail: '🏘️' },
    { name: 'Sunset', thumbnail: '🌅' },
    { name: 'Polka', thumbnail: '⚪' },
    { name: 'Beach', thumbnail: '🏖️' },
  ];

  const insertSticker = (emoji) => {
    setMessage(prev => prev + emoji + ' ');
  };

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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'photo'
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Photo/Video
          </button>
          <button
            onClick={() => setActiveTab('smiles')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'smiles'
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Smiles
          </button>
        </div>

        {/* Email Composition Area */}
        {activeTab === 'email' && (
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

            {/* Action Icons */}
            <div className="flex items-center gap-4 mb-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <FaCamera className="text-lg" />
                <span className="text-sm">Photo/Video</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <FaSmile className="text-lg" />
                <span className="text-sm">Smiles</span>
              </button>
            </div>

            {/* Stickers/Gifts Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {stickers.map((sticker, index) => (
                  <button
                    key={index}
                    onClick={() => insertSticker(sticker.emoji)}
                    className="flex-shrink-0 flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md rounded-lg transition-all group relative min-w-[80px]"
                    title={sticker.label}
                  >
                    <span className="text-3xl mb-1">{sticker.emoji}</span>
                    <span className="text-xs font-semibold text-gray-600">
                      {sticker.price === '0' ? 'FREE 0' : sticker.price}
                    </span>
                  </button>
                ))}
                <button className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 border border-gray-200">
                  <span className="text-lg font-bold">↑</span>
                </button>
              </div>
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
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="p-6 text-center text-gray-500">
            <p>Chat functionality coming soon</p>
          </div>
        )}

        {/* Photo/Video Tab */}
        {activeTab === 'photo' && (
          <div className="p-6 text-center text-gray-500">
            <p>Photo/Video upload coming soon</p>
          </div>
        )}

        {/* Smiles Tab */}
        {activeTab === 'smiles' && (
          <div className="p-6">
            <div className="grid grid-cols-6 gap-2">
              {stickers.map((sticker, index) => (
                <button
                  key={index}
                  onClick={() => insertSticker(sticker.emoji)}
                  className="w-12 h-12 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center text-2xl transition-colors"
                  title={sticker.label}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxEmailComposer;
