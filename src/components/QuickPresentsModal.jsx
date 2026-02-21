import { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useRefillModal } from '../context/RefillModalContext';

const QuickPresentsModal = ({ isOpen, onClose, receiverId }) => {
  const { openRefillModal } = useRefillModal();
  const [receiver, setReceiver] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !receiverId) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, catalogRes] = await Promise.all([
          axios.get(`/api/profiles/${receiverId}`),
          axios.get('/api/gifts/catalog?type=physical'),
        ]);

        if (!cancelled) {
          setReceiver(profileRes.data || null);
          const allGifts = Array.isArray(catalogRes.data) ? catalogRes.data : [];
          setGifts(allGifts);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Quick presents load error:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, receiverId]);

  const cards = useMemo(() => {
    if (!gifts.length) return [];
    // Pick two cheapest physical gifts as quick suggestions
    return gifts.slice(0, 2);
  }, [gifts]);

  if (!isOpen) return null;

  const handleSend = async (giftId) => {
    if (!receiverId || !giftId) return;
    setSendingId(giftId);
    try {
      await axios.post('/api/gifts/send', {
        receiverId,
        giftId,
        message: null,
      });
      alert('Your present has been sent!');
      onClose?.();
    } catch (error) {
      const msg = error.response?.data?.message;
      if (msg === 'Insufficient credits') {
        openRefillModal();
      } else {
        alert(msg || 'Failed to send present');
      }
    } finally {
      setSendingId(null);
    }
  };

  const receiverName = receiver?.firstName || 'your match';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-10 pt-6 pb-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Delight your match with a present
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Touch the heart of your match with an amazing present which will be carefully
              delivered to their doorstep.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* Cards */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-10 py-6">
          {loading && (
            <div className="text-sm text-gray-500">Loading presents...</div>
          )}
          {!loading && cards.length === 0 && (
            <div className="text-sm text-gray-500">No presents available right now.</div>
          )}
          {!loading && cards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
            {cards.map((gift) => (
              <div
                key={gift.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-6 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-red-100 mb-4 flex items-center justify-center text-red-500 text-2xl font-semibold">
                  🎁
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {gift.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium">
                  For {receiverName}
                </p>
                <p className="mt-3 text-xs sm:text-sm text-gray-600">
                  {gift.description ||
                    'A special present carefully delivered to make your match smile.'}
                </p>
                <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-800">
                  {gift.creditCost ?? 0} Credits
                </p>
                <button
                  type="button"
                  onClick={() => handleSend(gift.id)}
                  disabled={sendingId === gift.id}
                  className="mt-5 w-full max-w-xs bg-red-600 text-white text-xs sm:text-sm font-semibold py-2.5 rounded-md shadow hover:bg-red-700 transition"
                >
                  {sendingId === gift.id ? 'SENDING...' : 'SEND PRESENT'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (receiverId) {
                      window.dispatchEvent(
                        new CustomEvent('openPresentShop', {
                          detail: { receiverId },
                        })
                      );
                    }
                    onClose?.();
                  }}
                  className="mt-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  CHOOSE ANOTHER
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickPresentsModal;

