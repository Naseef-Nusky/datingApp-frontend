import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const SearchFilterModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    gender: 'woman',
    lookingFor: 'man',
    ageMin: 20,
    ageMax: 35,
    location: '',
    availableForVideoChat: false,
    compatibleZodiacOnly: false,
    zodiacSigns: [],
  });

  const zodiacSigns = [
    { id: 'aries', name: 'Aries', symbol: '♈' },
    { id: 'taurus', name: 'Taurus', symbol: '♉' },
    { id: 'gemini', name: 'Gemini', symbol: '♊' },
    { id: 'cancer', name: 'Cancer', symbol: '♋' },
    { id: 'leo', name: 'Leo', symbol: '♌' },
    { id: 'virgo', name: 'Virgo', symbol: '♍' },
    { id: 'libra', name: 'Libra', symbol: '♎' },
    { id: 'scorpio', name: 'Scorpio', symbol: '♏' },
    { id: 'sagittarius', name: 'Sagittarius', symbol: '♐' },
    { id: 'capricorn', name: 'Capricorn', symbol: '♑' },
    { id: 'aquarius', name: 'Aquarius', symbol: '♒' },
    { id: 'pisces', name: 'Pisces', symbol: '♓' },
  ];

  const handleChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleZodiacSign = (signId) => {
    setFilters(prev => ({
      ...prev,
      zodiacSigns: prev.zodiacSigns.includes(signId)
        ? prev.zodiacSigns.filter(id => id !== signId)
        : [...prev.zodiacSigns, signId],
    }));
  };

  const selectAllZodiac = () => {
    setFilters(prev => ({
      ...prev,
      zodiacSigns: zodiacSigns.map(sign => sign.id),
    }));
  };

  const setToDefault = () => {
    setFilters({
      gender: 'woman',
      lookingFor: 'man',
      ageMin: 20,
      ageMax: 35,
      location: '',
      availableForVideoChat: false,
      compatibleZodiacOnly: false,
      zodiacSigns: [],
    });
  };

  const handleShowMatches = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold">Search for Your Matches</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={setToDefault}
              className="text-sm text-blue-300 hover:text-blue-200"
            >
              Set to default
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Gender Preference */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              {filters.gender === 'woman' ? 'Woman' : filters.gender === 'man' ? 'Man' : 'Person'} Looking for a ...
            </label>
            <select
              value={filters.lookingFor}
              onChange={(e) => handleChange('lookingFor', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="man">Man</option>
              <option value="woman">Woman</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Ages</label>
            <div className="flex items-center space-x-2">
              <select
                value={filters.ageMin}
                onChange={(e) => handleChange('ageMin', parseInt(e.target.value))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Array.from({ length: 50 }, (_, i) => i + 18).map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              <span className="text-gray-500">-</span>
              <select
                value={filters.ageMax}
                onChange={(e) => handleChange('ageMax', parseInt(e.target.value))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Array.from({ length: 50 }, (_, i) => i + 18).map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Enter city or country</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Enter city or country"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availableForVideoChat}
                onChange={(e) => handleChange('availableForVideoChat', e.target.checked)}
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-gray-700">Available for Video Chat</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.compatibleZodiacOnly}
                onChange={(e) => handleChange('compatibleZodiacOnly', e.target.checked)}
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-gray-700">Show only the Zodiac Signs that are compatible with me</span>
            </label>
          </div>

          {/* Zodiac Signs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Zodiac Signs</h3>
              <button
                onClick={selectAllZodiac}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Select all
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {zodiacSigns.map((sign) => (
                <label
                  key={sign.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={filters.zodiacSigns.includes(sign.id)}
                    onChange={() => toggleZodiacSign(sign.id)}
                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex items-center space-x-1">
                    <span className="text-xl">{sign.symbol}</span>
                    <span className="text-sm text-gray-700">{sign.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Add more options */}
          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Add more options
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 rounded-b-lg">
          <button
            onClick={handleShowMatches}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            SHOW MATCHES
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterModal;

