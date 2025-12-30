import { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { FaPhone, FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaTimes } from 'react-icons/fa';
import { validateChannelName } from '../utils/agoraUtils';

const AgoraVideoCall = ({ 
  channelName, 
  userId, 
  remoteUserId, 
  onEndCall,
  callType = 'video' // 'video' or 'voice'
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  
  const clientRef = useRef(null);
  const localVideoContainerRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);

  useEffect(() => {
    initializeAgora();
    return () => {
      leaveChannel();
    };
  }, []);

  const initializeAgora = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!channelName) {
        throw new Error('Channel name is required');
      }

      // Validate channel name
      const validation = validateChannelName(channelName);
      if (!validation.valid) {
        console.error('Invalid channel name:', validation.error);
        throw new Error(`Invalid channel name: ${validation.error}`);
      }

      // Use sanitized channel name if validation provided one
      const safeChannelName = validation.sanitized || channelName;
      console.log('RTC Channel:', safeChannelName, 'Length:', new TextEncoder().encode(safeChannelName).length, 'bytes');

      // Get RTC token from backend
      // Send userId as-is (backend will convert it to numeric UID)
      const tokenResponse = await axios.post('/api/agora/rtc-token', {
        channelName: safeChannelName,
        uid: userId, // Send original userId, backend will convert
      });

      if (!tokenResponse.data || !tokenResponse.data.token || !tokenResponse.data.appId) {
        throw new Error('Failed to get Agora token. Please check your Agora credentials in .env file.');
      }

      const { token, appId, uid: tokenUid } = tokenResponse.data;

      if (!appId || appId === '') {
        throw new Error('Agora App ID is not configured. Please add AGORA_APP_ID to your .env file.');
      }

      if (!token || token === '') {
        throw new Error('Failed to get valid token from server. Please check your Agora credentials.');
      }

      // Use the UID from token response to ensure it matches
      console.log('Token received - AppID:', appId, 'UID from token:', tokenUid);

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Set up event handlers
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-left', handleUserLeft);

      // Use the UID from token response (backend already converted it correctly)
      const agoraUid = tokenUid || 0;

      console.log('Joining channel - AppID:', appId, 'Channel:', safeChannelName, 'UID:', agoraUid, 'Token length:', token.length);

      // Join the channel (use the same channel name and UID as token)
      // Pass token as string (not null) - Agora requires the token parameter
      try {
        await client.join(appId, safeChannelName, token, agoraUid);
        setIsJoined(true);
      } catch (joinError) {
        // Handle UID_CONFLICT by getting a new token with a different UID
        if (joinError.code === 'UID_CONFLICT' || joinError.message?.includes('UID_CONFLICT')) {
          console.warn('UID_CONFLICT detected, requesting new token with different UID...');
          
          // Request a new token (will have different UID due to timestamp/random component)
          const retryTokenResponse = await axios.post('/api/agora/rtc-token', {
            channelName: safeChannelName,
            uid: userId,
          });
          
          const { token: newToken, appId: newAppId, uid: newUid } = retryTokenResponse.data;
          
          console.log('Retrying join with new UID:', newUid);
          
          // Retry join with new token and UID
          await client.join(newAppId, safeChannelName, newToken, newUid);
          setIsJoined(true);
        } else {
          throw joinError; // Re-throw if it's not a UID_CONFLICT error
        }
      }

      // Create and publish local tracks
      if (callType === 'video') {
        try {
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          if (localVideoContainerRef.current) {
            videoTrack.play(localVideoContainerRef.current);
          }
          setLocalVideoTrack(videoTrack);
          await client.publish([videoTrack]);
        } catch (videoError) {
          console.error('Video track error:', videoError);
          // Continue with audio only if video fails
        }
      }

      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(audioTrack);
        await client.publish([audioTrack]);
      } catch (audioError) {
        console.error('Audio track error:', audioError);
        throw new Error('Microphone access denied. Please allow microphone access and try again.');
      }

    } catch (error) {
      console.error('Initialize Agora error:', error);
      let errorMessage = 'Failed to initialize call. ';
      
      if (error.response) {
        // Backend error
        errorMessage += error.response.data?.message || error.response.statusText || 'Server error';
      } else if (error.message) {
        // Frontend error
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your Agora credentials and try again.';
      }
      
      alert(errorMessage);
      onEndCall();
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    await clientRef.current.subscribe(user, mediaType);

    if (mediaType === 'video') {
      const remoteVideoTrack = user.videoTrack;
      setRemoteUsers((prev) => [...prev, user]);
      
      // Play remote video
      setTimeout(() => {
        if (remoteVideoContainerRef.current) {
          remoteVideoTrack.play(remoteVideoContainerRef.current);
        }
      }, 100);
    }

    if (mediaType === 'audio') {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack.play();
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    }
  };

  const handleUserLeft = (user) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  };

  const toggleMute = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveChannel = async () => {
    try {
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
    } catch (error) {
      console.error('Leave channel error:', error);
    }
  };

  const handleEndCall = async () => {
    await leaveChannel();
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Video Container */}
      <div className="flex-1 relative">
        <div
          ref={remoteVideoContainerRef}
          className="w-full h-full"
          style={{ minHeight: '100%' }}
        />
        
        {/* Local Video Container (Picture-in-Picture) */}
        {callType === 'video' && localVideoTrack && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
            <div ref={localVideoContainerRef} className="w-full h-full" />
          </div>
        )}

        {/* Call Info Overlay */}
        <div className="absolute top-4 left-4 text-white">
          <p className="text-sm">Calling {remoteUserId}</p>
          <p className="text-xs text-gray-300">{isJoined ? 'Connected' : 'Connecting...'}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full ${
            isMuted ? 'bg-red-500' : 'bg-gray-700'
          } text-white hover:opacity-80 transition`}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>

        {callType === 'video' && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoOff ? 'bg-red-500' : 'bg-gray-700'
            } text-white hover:opacity-80 transition`}
          >
            {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
        >
          <FaPhone className="rotate-135" />
        </button>
      </div>
    </div>
  );
};

export default AgoraVideoCall;

