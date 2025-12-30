import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const SearchFilterModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('interests');
  const [filters, setFilters] = useState({
    gender: 'woman',
    lookingFor: 'man',
    ageMin: 20,
    ageMax: 35,
    location: '',
    availableForVideoChat: false,
    compatibleZodiacOnly: false,
    zodiacSigns: [],
    interests: [],
    education: '',
    languages: [],
    relationship: '',
    kids: '',
    smoke: '',
    drink: '',
    height: '',
    bodyType: '',
    eyes: '',
    hair: '',
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

  const interests = [
    'Lying on the beach',
    'Camping',
    'Dancing',
    'Fishing & Hunting',
    'Hockey',
    'Music & Concerts',
    'Sailing',
    'Travelling',
    'Biking',
    'Cars',
    'Diving',
    'Games',
    'Movies',
    'Nature',
    'Shopping',
    'Watching TV',
    'Reading books',
    'Cooking',
    'Fashion',
    'Hobbies & Crafts',
    'Museums & Art',
    'Party & Night Clubs',
    'Sports',
    'Meditation & Yoga',
  ];

  const educationOptions = ['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'];
  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Hindi', 'Other'];
  const relationshipOptions = ['Single', 'Divorced', 'Widowed', 'Separated', 'In a relationship', 'Married', 'It\'s complicated'];
  const kidsOptions = ['No kids', 'Has kids', 'Wants kids', 'Doesn\'t want kids', 'Has kids and wants more', 'Has kids and doesn\'t want more'];
  const smokeOptions = ['Non-smoker', 'Light smoker', 'Regular smoker', 'Social smoker'];
  const drinkOptions = ['Non-drinker', 'Light drinker', 'Social drinker', 'Regular drinker'];
  const heightOptions = ['4\'0" - 4\'5"', '4\'6" - 4\'11"', '5\'0" - 5\'5"', '5\'6" - 5\'11"', '6\'0" - 6\'5"', '6\'6" and above'];
  const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Curvy', 'Heavyset', 'Muscular'];
  const eyesOptions = ['Blue', 'Brown', 'Green', 'Hazel', 'Gray', 'Other'];
  const hairOptions = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'Bald', 'Other'];

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

  const toggleInterest = (interest) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleLanguage = (language) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
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
      interests: [],
      education: '',
      languages: [],
      relationship: '',
      kids: '',
      smoke: '',
      drink: '',
      height: '',
      bodyType: '',
      eyes: '',
      hair: '',
    });
    setShowMoreOptions(false);
    setSelectedCategory('interests');
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
          <div className="text-center border-t pt-4">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-blue-600 hover:text-blue-800 text-sm underline decoration-dotted"
            >
              Add more options
            </button>
            {showMoreOptions && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4">
                <div className="flex gap-4">
                  {/* Left Column - Categories */}
                  <div className="w-1/3 border-r border-gray-200 pr-4">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory('interests')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'interests' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Interests
                      </button>
                      <button
                        onClick={() => setSelectedCategory('education')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'education' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Education
                      </button>
                      <button
                        onClick={() => setSelectedCategory('languages')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'languages' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Languages
                      </button>
                      <button
                        onClick={() => setSelectedCategory('relationship')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'relationship' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Relationship
                      </button>
                      <button
                        onClick={() => setSelectedCategory('kids')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'kids' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Kids
                      </button>
                      <button
                        onClick={() => setSelectedCategory('smoke')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'smoke' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Smoke
                      </button>
                      <button
                        onClick={() => setSelectedCategory('drink')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'drink' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Drink
                      </button>
                      <button
                        onClick={() => setSelectedCategory('height')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'height' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Height
                      </button>
                      <button
                        onClick={() => setSelectedCategory('bodyType')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'bodyType' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Body type
                      </button>
                      <button
                        onClick={() => setSelectedCategory('eyes')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'eyes' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Eyes
                      </button>
                      <button
                        onClick={() => setSelectedCategory('hair')}
                        className={`w-full text-left px-3 py-2 rounded ${
                          selectedCategory === 'hair' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Hair
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Options */}
                  <div className="flex-1 pl-4">
                    {selectedCategory === 'interests' && (
                      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                        {interests.map((interest) => (
                          <label
                            key={interest}
                            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-gray-200"
                          >
                            <input
                              type="checkbox"
                              checked={filters.interests.includes(interest)}
                              onChange={() => toggleInterest(interest)}
                              className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{interest}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'education' && (
                      <div className="space-y-2">
                        {educationOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="education"
                              value={option}
                              checked={filters.education === option}
                              onChange={(e) => handleChange('education', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'languages' && (
                      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                        {languageOptions.map((language) => (
                          <label
                            key={language}
                            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-gray-200"
                          >
                            <input
                              type="checkbox"
                              checked={filters.languages.includes(language)}
                              onChange={() => toggleLanguage(language)}
                              className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{language}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'relationship' && (
                      <div className="space-y-2">
                        {relationshipOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="relationship"
                              value={option}
                              checked={filters.relationship === option}
                              onChange={(e) => handleChange('relationship', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'kids' && (
                      <div className="space-y-2">
                        {kidsOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="kids"
                              value={option}
                              checked={filters.kids === option}
                              onChange={(e) => handleChange('kids', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'smoke' && (
                      <div className="space-y-2">
                        {smokeOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="smoke"
                              value={option}
                              checked={filters.smoke === option}
                              onChange={(e) => handleChange('smoke', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'drink' && (
                      <div className="space-y-2">
                        {drinkOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="drink"
                              value={option}
                              checked={filters.drink === option}
                              onChange={(e) => handleChange('drink', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'height' && (
                      <div className="space-y-2">
                        {heightOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="height"
                              value={option}
                              checked={filters.height === option}
                              onChange={(e) => handleChange('height', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'bodyType' && (
                      <div className="space-y-2">
                        {bodyTypeOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="bodyType"
                              value={option}
                              checked={filters.bodyType === option}
                              onChange={(e) => handleChange('bodyType', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'eyes' && (
                      <div className="space-y-2">
                        {eyesOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="eyes"
                              value={option}
                              checked={filters.eyes === option}
                              onChange={(e) => handleChange('eyes', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedCategory === 'hair' && (
                      <div className="space-y-2">
                        {hairOptions.map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                              type="radio"
                              name="hair"
                              value={option}
                              checked={filters.hair === option}
                              onChange={(e) => handleChange('hair', e.target.value)}
                              className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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




