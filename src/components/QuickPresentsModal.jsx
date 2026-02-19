import { FaTimes } from 'react-icons/fa';

const QuickPresentsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const cards = [
    {
      id: 'gift-1',
      title: 'Red underwear set',
      subtitle: 'For your match',
      description:
        'Red underwear set is a great choice to delight your match. Make the magic happen!',
    },
    {
      id: 'gift-2',
      title: 'A bouquet of 15 roses',
      subtitle: 'For your match',
      description:
        'A bouquet of 15 roses is a classic way to show your feelings. Make the magic happen!',
    },
  ];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-6 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-red-100 mb-4 flex items-center justify-center text-red-500 text-2xl font-semibold">
                  🎁
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium">
                  {card.subtitle}
                </p>
                <p className="mt-3 text-xs sm:text-sm text-gray-600">
                  {card.description}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 w-full max-w-xs bg-red-600 text-white text-xs sm:text-sm font-semibold py-2.5 rounded-md shadow hover:bg-red-700 transition"
                >
                  SEND PRESENT
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  CHOOSE ANOTHER
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPresentsModal;

