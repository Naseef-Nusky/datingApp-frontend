import { Capacitor } from '@capacitor/core';

export function isIosNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

export function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export function isNativeMobile() {
  return isIosNative() || isAndroidNative();
}

/**
 * H.264 is required for iOS WKWebView and must match between caller/callee.
 * Modern desktop browsers support H.264 in WebRTC — use it for all video calls.
 */
export function getRtcCodec() {
  return 'h264';
}

export function getLocalVideoPlayConfig() {
  return { fit: 'cover', mirror: true };
}

export function getRemoteVideoPlayConfig() {
  return { fit: 'cover', mirror: false };
}

/**
 * Warm up camera/mic permissions before Agora creates tracks (helps iOS prompt + grant flow).
 */
export async function requestCallMediaPermissions(includeVideo = true) {
  if (!navigator.mediaDevices?.getUserMedia) return;

  const constraints = includeVideo
    ? { video: { facingMode: 'user' }, audio: true }
    : { audio: true };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  stream.getTracks().forEach((track) => track.stop());
}

/**
 * Play Agora video into a DOM container with retries (iOS WebView can mount video late).
 */
export async function playAgoraVideoTrack(track, container, config = {}, maxAttempts = 10) {
  if (!track || !container) return false;

  const playConfig = { fit: 'cover', ...config };

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await track.play(container, playConfig);
      applyIosInlineVideoAttributes(container);
      return true;
    } catch (err) {
      if (attempt === maxAttempts - 1) {
        console.warn('[Agora] play() failed after retries:', err);
        return false;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 80 * (attempt + 1));
      });
    }
  }
  return false;
}

export function applyIosInlineVideoAttributes(container) {
  if (!container?.querySelectorAll) return;
  container.querySelectorAll('video').forEach((video) => {
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.playsInline = true;
    video.autoplay = true;
    video.muted = true;
  });
}

export function getCameraTrackInitConfig() {
  if (!isNativeMobile()) return {};

  return {
    facingMode: 'user',
    encoderConfig: {
      width: 640,
      height: 480,
      frameRate: 24,
      bitrateMax: 800,
    },
  };
}
