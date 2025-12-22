import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaRing, FaUsers, FaHeart, FaKiss, FaLaugh, FaCheck } from 'react-icons/fa';

const TodayIAm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Get the page to return to from location state, or default to dashboard
  const returnTo = location.state?.from || '/dashboard';

  useEffect(() => {
    // Fetch current status
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const response = await axios.get('/api/user/status');
      setSelected(response.data.status);
    } catch (error) {
      console.error('Fetch status error:', error);
    }
  };

  const options = [
    { 
      id: 'serious', 
      label: 'Serious', 
      icon: FaRing, 
      gradient: 'from-teal-400 to-green-500',
      buttonColor: 'bg-green-100 text-green-700',
      selectedColor: 'bg-green-500 text-white',
      iconColor: 'text-teal-600'
    },
    { 
      id: 'penpal', 
      label: 'Pen pal', 
      icon: FaUsers, 
      gradient: 'from-yellow-400 to-orange-500',
      buttonColor: 'bg-yellow-100 text-yellow-700',
      selectedColor: 'bg-yellow-500 text-white',
      iconColor: 'text-orange-600'
    },
    { 
      id: 'romantic', 
      label: 'Romantic', 
      icon: FaHeart, 
      gradient: 'from-pink-300 to-red-500',
      buttonColor: 'bg-red-100 text-red-700',
      selectedColor: 'bg-red-500 text-white',
      iconColor: 'text-red-600'
    },
    { 
      id: 'flirty', 
      label: 'Flirty', 
      icon: FaKiss, 
      gradient: 'from-pink-400 to-pink-600',
      buttonColor: 'bg-pink-100 text-pink-700',
      selectedColor: 'bg-pink-500 text-white',
      iconColor: 'text-pink-600'
    },
    { 
      id: 'naughty', 
      label: 'Naughty', 
      icon: FaLaugh, 
      gradient: 'from-orange-400 to-orange-600',
      buttonColor: 'bg-orange-100 text-orange-700',
      selectedColor: 'bg-orange-500 text-white',
      iconColor: 'text-orange-600'
    },
  ];

  const handleSelect = async (optionId) => {
    setSelected(optionId);
    setSaving(true);
    
    try {
      // Save status to backend
      await axios.post('/api/user/status', { status: optionId });
      
      // Dispatch event to update header
      window.dispatchEvent(new Event('statusUpdated'));
      
      // Close modal and return to the page they came from (or dashboard)
      setTimeout(() => {
        navigate(returnTo);
      }, 500);
    } catch (error) {
      console.error('Save status error:', error);
      // Still close modal even if save fails
      setTimeout(() => {
        navigate(returnTo);
      }, 500);
    } finally {
      setSaving(false);
    }
  };

  const handleDontKnow = () => {
    setSelected(null);
    navigate(returnTo);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-4xl w-full relative">
        {/* Close button */}
        <button
          onClick={() => navigate(returnTo)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-center mb-8">Today I am</h2>

        {/* Options with dotted timeline */}
        <div className="relative mb-8">
          {/* Dotted timeline */}
          <div className="absolute top-12 left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-300"></div>
          
          {/* Options */}
          <div className="flex justify-between items-start relative z-10">
            {options.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selected === option.id;
              
              return (
                <div key={option.id} className="flex flex-col items-center flex-1">
                  {/* Icon Circle */}
                  <button
                    onClick={() => handleSelect(option.id)}
                    disabled={saving}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                      isSelected
                        ? `bg-gradient-to-br ${option.gradient} shadow-lg`
                        : 'bg-gray-200'
                    }`}
                  >
                    {isSelected ? (
                      <FaCheck className="text-white text-2xl" />
                    ) : (
                      <Icon className={`text-2xl ${option.iconColor}`} />
                    )}
                  </button>

                  {/* Label Button */}
                  <button
                    onClick={() => handleSelect(option.id)}
                    disabled={saving}
                    className={`mt-4 px-6 py-2 rounded-full text-sm font-medium transition ${
                      isSelected
                        ? option.selectedColor
                        : option.buttonColor
                    } hover:opacity-90`}
                  >
                    {option.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Don't know button */}
        <div className="text-center">
          <button
            onClick={handleDontKnow}
            disabled={saving}
            className="bg-gray-300 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-400 transition disabled:opacity-50"
          >
            Don't know...
          </button>
        </div>

        {/* Status indicator */}
        {selected && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Status: <span className="font-semibold text-gray-800">
                {options.find(o => o.id === selected)?.label}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayIAm;
