import { useState, useRef } from 'react';
import { FaEnvelope, FaSmile, FaCamera, FaVideo, FaPaperPlane, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ProfileEmailComposer = ({ profile, onClose, onSent }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
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

  const stickers = [
    { emoji: '🍹', label: 'FREE' },
    { emoji: '🎂', label: 'Happy Birthday' },
    { emoji: '🌴', label: 'Palm Tree' },
    { emoji: '🌸', label: 'Flowers' },
    { emoji: '🎃', label: 'Halloween' },
    { emoji: '❄️', label: 'Winter' },
  ];

  const insertSticker = (emoji) => {
    setMessage(prev => prev + emoji + ' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
          <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center mb-3">
            <span className="text-3xl">👤</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            My Email to {profile.firstName}
          </h3>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Small Photo/Video & Smiles links in header right corner */}
          <div className="flex items-center gap-3 text-xs text-white bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <button 
              onClick={handlePhotoVideoClick}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FaCamera className="text-sm" />
              <span>Photo/Video</span>
            </button>
            <button 
              onClick={handleSmilesClick}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FaSmile className="text-sm" />
              <span>Smiles</span>
            </button>
          </div>
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

          {/* Stickers/Emojis */}
          <div className="mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {stickers.map((sticker, index) => (
                <button
                  key={index}
                  onClick={() => insertSticker(sticker.emoji)}
                  className="flex-shrink-0 w-14 h-14 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md rounded-lg flex flex-col items-center justify-center text-2xl transition-all group relative"
                  title={sticker.label}
                >
                  <span>{sticker.emoji}</span>
                  {sticker.label === 'FREE' && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 rounded font-bold">
                      FREE
                    </span>
                  )}
                </button>
              ))}
              <button className="flex-shrink-0 w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 border border-gray-200">
                <span className="text-xl font-bold">↑</span>
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
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
