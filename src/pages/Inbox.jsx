import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaReply, FaCamera, FaVideo, FaSpinner, FaSearch, FaVolumeUp, FaEllipsisV, FaPhone } from 'react-icons/fa';
import EmailDetailModal from '../components/EmailDetailModal';
import InboxEmailComposer from '../components/InboxEmailComposer';

const Inbox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [composerEmail, setComposerEmail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [showLessChatRequests, setShowLessChatRequests] = useState(false);
  const socketRef = useRef(null);

  // Socket.IO setup for real-time email updates
  useEffect(() => {
    if (user?.id) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🔌 [INBOX] Connecting to Socket.IO server:', apiUrl);
      
      const socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        timeout: 20000,
        forceNew: false,
        autoConnect: true,
        upgrade: true,
        rememberUpgrade: true,
      });

      socket.on('connect', () => {
        console.log('✅ [INBOX] Socket connected:', socket.id);
        socket.emit('join-room', String(user.id));
        console.log('📢 [INBOX] Joined room for user:', user.id);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ [INBOX] Socket connection error:', error);
        // Don't show error to user - socket will auto-reconnect
      });

      socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          // Server disconnected the socket, need to manually reconnect
          console.log('⚠️ [INBOX] Socket disconnected by server, reconnecting...');
          socket.connect();
        } else {
          // Client disconnected or transport error - will auto-reconnect
          console.log('⚠️ [INBOX] Socket disconnected:', reason);
        }
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 [INBOX] Socket reconnected after', attemptNumber, 'attempts');
        socket.emit('join-room', String(user.id));
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 [INBOX] Reconnection attempt', attemptNumber);
      });

      socket.on('reconnect_error', (error) => {
        console.error('❌ [INBOX] Reconnection error:', error);
      });

      socket.on('reconnect_failed', () => {
        console.error('❌ [INBOX] Reconnection failed after all attempts');
        // Could show a notification to user here
      });

      // Listen for new emails
      socket.on('new-email', async (data) => {
        console.log('📧 [INBOX] New email received:', data);
        // Fetch the full email details
        try {
          const response = await axios.get(`/api/messages/emails/${data.messageId}`);
          const newEmail = response.data;
          
          // Add to emails list if it matches current filter
          setEmails(prevEmails => {
            // Check if email already exists (avoid duplicates)
            const exists = prevEmails.find(e => e.id === newEmail.id);
            if (exists) return prevEmails;
            
            // Add to beginning of list
            return [newEmail, ...prevEmails];
          });
          
          // Update contacts if needed
          fetchContacts();
        } catch (error) {
          console.error('Error fetching new email details:', error);
          // Still refresh the list
          fetchEmails();
        }
      });

      // Listen for email read status updates
      socket.on('email-read', (data) => {
        console.log('✅ [INBOX] Email marked as read:', data);
        setEmails(prevEmails => 
          prevEmails.map(email => 
            email.id === data.emailId 
              ? { ...email, isRead: true, readAt: data.readAt }
              : email
          )
        );
      });

      // Listen for contact updates
      socket.on('contact-update', (data) => {
        console.log('👥 [INBOX] Contact update received:', data);
        fetchContacts();
      });

      socketRef.current = socket;

      return () => {
        console.log('🔌 [INBOX] Disconnecting socket');
        socket.disconnect();
      };
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEmails();
    fetchContacts();
    fetchChatRequests();
  }, [filter]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/messages/emails?filter=${filter}`);
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      if (response.data && Array.isArray(response.data)) {
        const contactsList = response.data.map((conv) => {
          const otherUser = conv.user || {};
          const profile = otherUser?.profile || {};
          
          let contactName = 'Unknown';
          if (profile?.firstName) {
            contactName = profile.firstName;
            if (profile.lastName) {
              contactName += ` ${profile.lastName}`;
            }
          } else if (otherUser?.email) {
            contactName = otherUser.email.split('@')[0];
          }
          
          let avatar = null;
          if (profile?.photos && Array.isArray(profile.photos) && profile.photos.length > 0) {
            avatar = profile.photos[0]?.url || null;
          }
          
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
        
        // Add system contact (Concierge)
        contactsList.unshift({
          id: 'system-concierge',
          name: 'Julia',
          type: 'Concierge',
          message: 'Hello! Today your p...',
          unreadCount: 1,
          avatar: null,
        });
        
        setContacts(contactsList);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    }
  };

  const fetchChatRequests = async () => {
    try {
      const response = await axios.get('/api/messages/chat-requests');
      if (response.data && Array.isArray(response.data)) {
        const requests = await Promise.all(
          response.data.map(async (request) => {
            try {
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
              };
            }
          })
        );
        setChatRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching chat requests:', error);
      setChatRequests([]);
    }
  };

  const handleEmailClick = async (email) => {
    try {
      const response = await axios.get(`/api/messages/emails/${email.id}`);
      const updatedEmail = response.data;
      setSelectedEmail(updatedEmail);
      setShowEmailModal(true);
      
      // Update email in list with read status
      setEmails(prevEmails => 
        prevEmails.map(e => 
          e.id === email.id 
            ? { ...e, isRead: updatedEmail.isRead, readAt: updatedEmail.readAt }
            : e
        )
      );
    } catch (error) {
      console.error('Error fetching email:', error);
    }
  };

  const handleReplyClick = (email) => {
    setComposerEmail(email);
    setShowComposer(true);
    setShowEmailModal(false);
  };

  const handleDelete = async (emailId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this email?')) return;

    try {
      setDeletingId(emailId);
      await axios.delete(`/api/messages/emails/${emailId}`);
      setEmails(emails.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      alert('Failed to delete email');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReply = (email) => {
    const receiverId = email.sender === user.id ? email.receiver : email.sender;
    navigate(`/compose-email?to=${receiverId}&replyTo=${email.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Just now';
    }

    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return 'Just now';
    }

    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      // Today: Show time only, e.g., "04:41"
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (days === 1) {
      // Yesterday: Show "Yesterday, HH:MM"
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } else if (days < 7) {
      // This week: Show weekday and time, e.g., "Monday, 04:41"
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${weekday}, ${time}`;
    } else {
      // Older: Show month, day, and time, e.g., "Dec 29, 13:18"
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${monthDay}, ${time}`;
    }
  };

  const getSenderName = (email) => {
    if (email.sender === user.id) {
      return email.receiverData?.profile?.firstName || email.receiverData?.email?.split('@')[0] || 'Unknown';
    }
    return email.senderData?.profile?.firstName || email.senderData?.email?.split('@')[0] || 'Unknown';
  };

  const getSenderImage = (email) => {
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

  const getPreview = (content) => {
    if (!content) return 'No content';
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
    // Show more characters for better preview (matching screenshot)
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  const hasMedia = (email) => {
    return !!email.mediaUrl;
  };

  const displayedChatRequests = showLessChatRequests ? chatRequests.slice(0, 5) : chatRequests;
  const totalUnreadContacts = contacts.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-[calc(100vh-64px)]">
           {/* Main Inbox Area */}
           <div className="flex-1 flex flex-col overflow-hidden" style={{ marginRight: '384px' }}>
          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Read & Unanswered
            </button>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-3xl text-nex-orange" />
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaEnvelope className="text-4xl mx-auto mb-4 opacity-50" />
                <p>No emails found</p>
              </div>
            ) : (
              <div>
                {emails.map((email) => {
                  const isUnread = !email.isRead && email.receiver === user.id;
                  const isSelected = selectedEmail?.id === email.id;
                  const senderName = getSenderName(email);
                  const senderImage = getSenderImage(email);
                  const preview = getPreview(email.content);
                  
                  return (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Profile Picture */}
                      <div className="flex-shrink-0 mr-4">
                        {senderImage ? (
                          <img
                            src={senderImage}
                            alt={senderName}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {senderName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                       {/* Message Content */}
                       <div className="flex-1 min-w-0 ml-4">
                         <div className="flex items-center justify-between mb-1">
                           <span className={`font-semibold text-sm ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                             {senderName}
                           </span>
                           <div className="flex items-center gap-2 ml-4">
                             {hasMedia(email) && (
                               <>
                                 <FaVideo className="text-gray-400 text-xs" />
                                 <FaCamera className="text-gray-400 text-xs" />
                               </>
                             )}
                             {!hasMedia(email) && email.mediaUrl && (
                               <FaCamera className="text-gray-400 text-xs" />
                             )}
                           </div>
                         </div>
                         <div className="flex items-center justify-between gap-4">
                           <p className="text-sm text-gray-600 mb-2 leading-relaxed" style={{ 
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical',
                             overflow: 'hidden'
                           }}>
                             {preview}
                           </p>
                           <div className="flex items-center gap-2 flex-shrink-0">
                             <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                               {formatDate(email.createdAt || email.created_at)}
                             </span>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 // Show menu or delete
                               }}
                               className="text-gray-400 hover:text-gray-600 p-1 ml-4"
                             >
                               <FaEllipsisV className="text-xs" />
                             </button>
                           </div>
                         </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Right Sidebar - Contacts and Chat Requests */}
      <div className="w-96 bg-white border-l border-gray-200 h-screen fixed right-0 top-16 overflow-y-auto z-40">
        {/* My Contacts */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Contacts</h3>
            {totalUnreadContacts > 0 && (
              <span className="bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                {totalUnreadContacts > 9 ? '9+' : totalUnreadContacts}
              </span>
            )}
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No contacts yet</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {contacts.map((contact) => (
                <div
                  key={contact.id || `contact-${Math.random()}`}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  onClick={() => {
                    if (contact.id && contact.id !== 'system-concierge') {
                      navigate(`/profile/${contact.id}`);
                    }
                  }}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className={`w-14 h-14 ${contact.id === 'system-concierge' ? 'rounded-lg' : 'rounded-full'} bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden`}>
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className={`w-full h-full ${contact.id === 'system-concierge' ? 'rounded-lg' : 'rounded-full'} object-cover`}
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {contact.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="font-semibold text-gray-800 text-sm truncate">
                          {contact.name}
                        </span>
                        {contact.type && (
                          <span className="text-red-500 text-xs font-medium bg-red-50 px-2 py-0.5 rounded">
                            {contact.type}
                          </span>
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-2">
                          {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {contact.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Contact */}
          <div className="relative mt-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search contact"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nex-orange focus:border-transparent text-sm"
            />
            <FaVolumeUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer text-xs" />
          </div>
        </div>

        {/* Chat Requests */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Chat Requests</h3>
            <button
              onClick={() => setShowLessChatRequests(!showLessChatRequests)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showLessChatRequests ? 'SHOW MORE' : 'SHOW LESS'}
            </button>
          </div>

          <div className="space-y-3">
            {displayedChatRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                onClick={() => {
                  if (request.senderId) {
                    navigate(`/profile/${request.senderId}`);
                  }
                }}
              >
                <div className="flex-shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden">
                    {request.avatar ? (
                      <img
                        src={request.avatar}
                        alt={request.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {request.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm mb-1">
                    {request.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {request.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Detail Modal */}
      <EmailDetailModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setSelectedEmail(null);
        }}
        email={selectedEmail}
        onReply={(email) => handleReplyClick(email)}
        user={user}
      />

      {/* Email Composer Modal */}
      <InboxEmailComposer
        email={composerEmail}
        onClose={() => {
          setShowComposer(false);
          setComposerEmail(null);
        }}
        onSent={() => {
          fetchEmails();
          fetchContacts();
        }}
        user={user}
      />
    </div>
  );
};

export default Inbox;
