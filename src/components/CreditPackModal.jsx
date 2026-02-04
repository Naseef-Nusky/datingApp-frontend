import { useState } from 'react';
import { FaTimes, FaComment, FaPaperPlane, FaCoins } from 'react-icons/fa';
import axios from 'axios';

const CreditPackModal = ({ isOpen, onClose, onCreditsAdded }) => {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const packs = [
    { credits: 150, wasPrice: 60, price: 50, save: '16%' },
    { credits: 600, wasPrice: 480, price: 150, save: '16%' },
    { credits: 1500, wasPrice: 360, price: 300, save: '16%' },
  ];

  const handlePurchase = async (pack) => {
    setError(null);
    setPurchasing(true);
    try {
      const { data } = await axios.post('/api/credits/purchase', {
        amount: pack.credits,
        paymentMethod: 'refill',
      });
      alert(`Success! ${data.creditsAdded} credits added. Your balance: ${data.totalCredits} credits.`);
      if (onCreditsAdded) onCreditsAdded();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add credits';
      setError(msg);
      alert(msg);
    } finally {
      setPurchasing(false);
    }
  };

  const bonuses = [
    {
      icon: '∞',
      iconBg: 'bg-blue-500',
      bold: 'Free Communication with all members, except Free Users',
      rest: '',
    },
    {
      icon: <FaCoins className="text-white text-lg" />,
      iconBg: 'bg-amber-500',
      bold: 'Get Credits Each Month',
      rest: ' to spend on gifts and communication',
    },
    {
      icon: <FaComment className="text-white text-lg" />,
      iconBg: 'bg-teal-500',
      bold: 'Read All Messages',
      rest: ' you receive in chat',
    },
    {
      icon: <FaPaperPlane className="text-white text-lg" />,
      iconBg: 'bg-red-500',
      bold: "Let's Mingle",
      rest: ' to reach out to members with one message.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-10">
            Subscribe to a Monthly Credit Pack & Date <span className="text-teal-600">FREELY!</span>
          </h2>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content - Two columns */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Credit packs */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              1. Choose Monthly Credit Pack Size:
            </h3>
            {error && (
              <p className="text-red-600 text-sm mb-3">{error}</p>
            )}
            <div className="space-y-3">
              {packs.map((pack) => (
                <button
                  key={pack.credits}
                  onClick={() => handlePurchase(pack)}
                  disabled={purchasing}
                  className="w-full relative bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white rounded-lg p-4 text-left transition shadow-md"
                >
                  <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-sm shadow">
                    SAVE {pack.save}
                  </span>
                  <div className="font-semibold text-lg">{pack.credits} Credits/Mo</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="line-through text-teal-200 text-sm">{pack.wasPrice}</span>
                    <span className="font-bold text-lg">{pack.price} USD</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Bonuses */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              2. Get Bonuses:
            </h3>
            <ul className="space-y-4">
              {bonuses.map((item, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center text-white border-2 border-white shadow`}
                  >
                    {typeof item.icon === 'string' ? (
                      <span className="text-xl font-bold">{item.icon}</span>
                    ) : (
                      item.icon
                    )}
                  </div>
                  <p className="text-gray-700 text-sm pt-1.5">
                    <span className="font-semibold text-gray-900">{item.bold}</span>
                    {item.rest}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 text-center">
          <button
            type="button"
            className="text-gray-500 text-sm underline hover:text-gray-700"
          >
            Click here to see the cost of services.
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditPackModal;
