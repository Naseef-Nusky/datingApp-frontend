import { useState } from 'react';
import { FaTimes, FaApple, FaGoogle, FaBitcoin, FaCreditCard } from 'react-icons/fa';
import axios from 'axios';

const packs = [
  {
    id: 'starter',
    credits: 50,
    price: 39,
    badge: 'BESTSELLER',
    badgeColor: 'bg-amber-400 text-amber-900',
    saveLabel: 'SAVE 17%',
  },
  {
    id: 'standard',
    credits: 160,
    price: 99,
    badge: null,
    badgeColor: '',
    saveLabel: 'SAVE 16%',
  },
  {
    id: 'max',
    credits: 1000,
    price: 480,
    badge: 'BEST VALUE',
    badgeColor: 'bg-emerald-400 text-emerald-900',
    saveLabel: 'SAVE 16%',
  },
];

const CreditPackModal = ({ isOpen, onClose, onCreditsAdded }) => {
  const [selectedPackId, setSelectedPackId] = useState(packs[0]?.id || null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const selectedPack = packs.find((p) => p.id === selectedPackId) || packs[0];

  const handlePurchase = async (paymentMethod) => {
    if (!selectedPack) return;
    setError(null);
    setPurchasing(true);
    try {
      const { data } = await axios.post('/api/credits/purchase', {
        amount: selectedPack.credits,
        paymentMethod: paymentMethod || 'refill',
      });
      alert(
        `Success! ${data.creditsAdded} credits added. Your balance: ${data.totalCredits} credits.`
      );
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

  const payWith = (method) => {
    if (!selectedPack) {
      setError('Please select a credit pack first.');
      return;
    }
    handlePurchase(method);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Purchase Credits and continue communicating!
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl">
              Communication with Free Users costs: Live Chat — 1 Credit per minute, Offline message —
              1 Credit, Email — 10 Credits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Packs */}
        <div className="px-6 pt-4 pb-2">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {packs.map((pack) => {
              const isActive = selectedPackId === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPackId(pack.id)}
                  className={[
                    'relative flex flex-col items-stretch rounded-xl border p-4 shadow-sm text-left transition',
                    isActive
                      ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                      : 'border-gray-200 hover:border-red-400 hover:bg-red-50/40',
                  ].join(' ')}
                >
                  {pack.badge && (
                    <span
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-semibold shadow ${pack.badgeColor}`}
                    >
                      {pack.badge}
                    </span>
                  )}
                  <div className="mt-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {pack.credits} Credits
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">${pack.price}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {pack.saveLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment methods */}
        <div className="px-6 pt-4 pb-6 space-y-3">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => payWith('apple-pay')}
              disabled={purchasing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaApple className="text-xl" />
              <span>Pay with Apple Pay</span>
            </button>
            <button
              type="button"
              onClick={() => payWith('google-pay')}
              disabled={purchasing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-xl text-[#4285F4]" />
              <span>Pay with Google Pay</span>
            </button>
          </div>

          {/* Card payment */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FaCreditCard className="text-gray-500" />
              <span>Pay by card</span>
            </div>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              defaultValue="saved"
            >
              <option value="saved">Use saved card •••• 1254</option>
              <option value="new">Add new card</option>
            </select>
            <button
              type="button"
              onClick={() => payWith('card')}
              disabled={purchasing}
              className="w-full inline-flex items-center justify-center rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {purchasing ? 'PROCESSING...' : 'PAY BY CARD'}
            </button>
          </div>

          {/* Crypto */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-200 pt-3 text-xs text-gray-600">
            <button
              type="button"
              onClick={() => payWith('crypto')}
              disabled={purchasing}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaBitcoin className="text-lg text-amber-500" />
              <span>Pay via Crypto</span>
            </button>
            <p className="text-[11px] text-right sm:text-left text-gray-500 flex-1">
              Your transactions are protected. Selected credits will be added to your balance
              instantly after successful payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPackModal;
