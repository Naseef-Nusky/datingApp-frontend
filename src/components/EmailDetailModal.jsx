import { FaTimes, FaEnvelope, FaCamera } from 'react-icons/fa';

const EmailDetailModal = ({ isOpen, onClose, email, onReply, user }) => {
  if (!isOpen || !email) return null;

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

  const getSubject = () => {
    // Extract subject from content or use first line
    if (email.subject) return email.subject;
    const content = email.content || '';
    const text = content.replace(/<[^>]*>/g, '');
    const firstLine = text.split('\n')[0];
    return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
  };

  const getMessageBody = () => {
    const content = email.content || '';
    const text = content.replace(/<[^>]*>/g, '');
    // Remove subject line if it's the first line
    const lines = text.split('\n');
    if (lines.length > 1) {
      return lines.slice(1).join('\n').trim();
    }
    return text;
  };

  const senderName = getSenderName();
  const senderImage = getSenderImage();
  const subject = getSubject();
  const messageBody = getMessageBody();
  const hasMedia = !!email.mediaUrl;

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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(to bottom, #fff 0%, #fff 25%, #fff 100%)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-md transition"
        >
          <FaTimes size={20} />
        </button>

        {/* Header Section with Decorative Background */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          {/* Decorative Background - Sunset Scene */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, #ff8c42 0%, #ffa366 30%, #ffb380 60%, #ffc299 100%)',
            }}
          >
            {/* Sun - Large orange disk */}
            <div 
              className="absolute top-4 right-6 w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, #ff8c42 0%, #ff6b35 100%)',
                boxShadow: '0 0 60px rgba(255, 140, 66, 0.6)',
              }}
            />
            
            {/* Trees Silhouette - Multiple trees */}
            <div className="absolute bottom-0 left-0 right-0 h-40">
              {/* Left side trees */}
              <div 
                className="absolute bottom-0 left-2 w-20 h-32 rounded-t-full opacity-80"
                style={{ background: '#1a3009' }}
              />
              <div 
                className="absolute bottom-0 left-16 w-16 h-28 rounded-t-full opacity-90"
                style={{ background: '#2d5016' }}
              />
              <div 
                className="absolute bottom-0 left-28 w-18 h-30 rounded-t-full opacity-85"
                style={{ background: '#1a3009' }}
              />
              
              {/* Right side trees */}
              <div 
                className="absolute bottom-0 right-20 w-16 h-26 rounded-t-full opacity-80"
                style={{ background: '#2d5016' }}
              />
              <div 
                className="absolute bottom-0 right-4 w-14 h-24 rounded-t-full opacity-90"
                style={{ background: '#1a3009' }}
              />
            </div>

            {/* Lamppost - Right side */}
            <div className="absolute bottom-0 right-16">
              <div 
                className="w-1.5 h-24"
                style={{ background: '#3a3a3a' }}
              />
              <div 
                className="absolute top-0 right-0 w-6 h-6 rounded-full -translate-x-1/2"
                style={{ 
                  background: '#ffd700',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.9)',
                }}
              />
            </div>

            {/* Couple on Bench - Center left */}
            <div className="absolute bottom-12 left-1/4">
              {/* Bench */}
              <div 
                className="w-20 h-3 rounded"
                style={{ background: '#4a4a4a' }}
              />
              {/* Person 1 */}
              <div 
                className="absolute -top-4 left-2 w-4 h-4 rounded-full"
                style={{ background: '#2d2d2d' }}
              />
              {/* Person 2 */}
              <div 
                className="absolute -top-4 right-2 w-4 h-4 rounded-full"
                style={{ background: '#2d2d2d' }}
              />
            </div>
          </div>

          {/* Profile Picture and Name Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full pt-6">
            <div className="mb-4">
              {senderImage ? (
                <img
                  src={senderImage}
                  alt={senderName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-white font-semibold text-3xl">
                    {senderName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <p className="text-white font-semibold text-xl drop-shadow-2xl">
              Email from {senderName}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-white">
          {/* Subject Line */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {subject}
          </h3>

          {/* Message Body with Media Placeholder */}
          <div className="flex gap-4 mb-6">
            {/* Media Placeholder */}
            {hasMedia && (
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                  {email.mediaUrl ? (
                    <img
                      src={email.mediaUrl}
                      alt="Attachment"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <FaCamera className="text-gray-400 text-2xl" />
                  )}
                </div>
              </div>
            )}

            {/* Message Text */}
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {messageBody || 'No message content'}
              </p>
            </div>
          </div>

          {/* Reply Button */}
          <button
            onClick={() => {
              if (onReply) {
                onReply(email);
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            <FaEnvelope className="text-xl" />
            <span>REPLY</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetailModal;
