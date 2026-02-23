import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * "Verify your identity" modal – portrait photo criteria, upload area, Start Verification.
 * Shows user's profile photo in "The selected photo" when no new upload. Powered by sumsub.
 */
export default function VerifyIdentityModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // When modal opens, fetch current user's profile to show their photo in "The selected photo"
  useEffect(() => {
    if (!isOpen) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setProfilePhotoUrl(null);
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/profiles/me');
        const url = data?.photos?.[0]?.url || data?.coverPhoto || null;
        setProfilePhotoUrl(url);
      } catch {
        setProfilePhotoUrl(null);
      }
    };
    fetchProfile();
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) setSelectedFile(file);
    e.target.value = '';
  };

  const hasPhoto = selectedFile || profilePhotoUrl;
  const handleStartVerification = () => {
    if (!hasPhoto) return;
    // TODO: integrate with SumSub or backend verification API (use selectedFile or existing profile photo)
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Verify your identity</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 text-gray-800 text-sm">
          <p className="mb-4">
            Please start verification by selecting a photo that meets the criteria below.
          </p>

          <div className="flex gap-4 mb-4">
            {/* Upload area / placeholder */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50/50 hover:bg-blue-50 text-blue-600 transition"
              >
                <FaUser className="w-10 h-10 mb-1 text-blue-400" />
                <span className="text-xs">Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Criteria list */}
            <ol className="list-decimal list-inside space-y-2 text-gray-700 flex-1">
              <li>A portrait photo showing your head and shoulders</li>
              <li>Facing forward, looking directly at the camera</li>
              <li>Your face should be in focus and clearly visible</li>
              <li>No obstructions, with minimal editing only</li>
            </ol>
          </div>

          {/* The selected photo – show new upload preview, or current profile photo, or placeholder */}
          <p className="text-gray-600 font-medium mb-2">The selected photo</p>
          <div className="mb-4 flex justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected for verification"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            ) : profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Your profile photo"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                No photo selected
              </div>
            )}
          </div>

          <p className="text-red-600 text-sm mb-4">
            The selected photo cannot be deleted or hidden after verification is complete.
          </p>

          <div className="flex flex-col items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:underline font-medium"
            >
              Upload Profile Photo
            </button>
            <button
              type="button"
              onClick={handleStartVerification}
              disabled={!hasPhoto}
              className="w-full max-w-xs py-3 px-4 rounded-lg font-semibold transition disabled:bg-gray-200 disabled:text-gray-500 bg-gray-700 text-white hover:bg-gray-800 disabled:hover:bg-gray-200 disabled:cursor-not-allowed"
            >
              START VERIFICATION
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mb-4">
            By clicking &quot;Start Verification&quot;, you hereby acknowledge and agree that your biometric data while capturing your face will be processed in accordance with{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline" onClick={onClose}>
              Privacy Policy
            </Link>
            .
          </p>

          <div className="pt-4 border-t border-gray-200 text-center text-gray-400 text-xs">
            Powered by <span className="font-semibold text-gray-600">sumsub</span>
          </div>
        </div>
      </div>
    </div>
  );
}
