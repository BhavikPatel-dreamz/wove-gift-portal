import { useState } from 'react';

const occasions = [
  {
    id: 'birthday',
    title: 'Birthday',
    emoji: '🎂',
    description: 'Make their special day unforgettable',
    subtitle: 'Celebrations & Joy',
    bgColor: 'bg-orange-100',
    buttonColor: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    emoji: '💎',
    description: 'Celebrate your journey together',
    subtitle: 'Love & Romance',
    bgColor: 'bg-blue-100',
    buttonColor: 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600'
  },
  {
    id: 'thankyou',
    title: 'Thank You',
    emoji: '🙏',
    description: 'Show your heartfelt appreciation',
    subtitle: 'Gratitude & Thanks',
    bgColor: 'bg-yellow-100',
    buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    id: 'congratulations',
    title: 'Congratulations',
    emoji: '🎉',
    description: 'Celebrate their amazing achievement',
    subtitle: 'Success & Pride',
    bgColor: 'bg-red-100',
    buttonColor: 'bg-red-500 hover:bg-red-600'
  },
  {
    id: 'getwellsoon',
    title: 'Get Well Soon',
    emoji: '😊',
    description: 'Send comfort and healing thoughts',
    subtitle: 'Care & Support',
    bgColor: 'bg-yellow-100',
    buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    id: 'justbecause',
    title: 'Just Because',
    emoji: '🌸',
    description: 'Sometimes no reason is the best reason',
    subtitle: 'Spontaneous Joy',
    bgColor: 'bg-pink-100',
    buttonColor: 'bg-pink-500 hover:bg-pink-600'
  },
  {
    id: 'newbaby',
    title: 'New Baby',
    emoji: '👶',
    description: 'Welcome the newest bundle of joy',
    subtitle: 'New Beginnings',
    bgColor: 'bg-yellow-100',
    buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    id: 'loveromance',
    title: 'Love & Romance',
    emoji: '❤️',
    description: 'Express your deepest feelings',
    subtitle: 'Hearts & Passion',
    bgColor: 'bg-red-100',
    buttonColor: 'bg-red-500 hover:bg-red-600'
  },
  {
    id: 'wedding',
    title: 'Wedding',
    emoji: '💒',
    description: 'Celebrate their perfect union',
    subtitle: 'Vows & Bliss',
    bgColor: 'bg-pink-100',
    buttonColor: 'bg-pink-500 hover:bg-pink-600'
  },
  {
    id: 'graduation',
    title: 'Graduation',
    emoji: '🎓',
    description: 'Honor their educational milestone',
    subtitle: 'Achievement & Future',
    bgColor: 'bg-blue-100',
    buttonColor: 'bg-blue-500 hover:bg-blue-600'
  }
];

export default function OccasionSelector() {
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [currentStep] = useState(3);
  const [totalSteps] = useState(4);

  const handleOccasionSelect = (occasionId) => {
    setSelectedOccasion(occasionId);
    console.log('Selected occasion:', occasionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center text-sm text-gray-600 mb-6">
            <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
              {currentStep}
            </span>
            Step {currentStep} of {totalSteps} • Setting the mood
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
            What's the Occasion?
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose the perfect moment to celebrate and we'll help you create something beautiful
          </p>
        </div>

        {/* Occasion Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {occasions.map((occasion) => (
            <div
              key={occasion.id}
              className={`${occasion.bgColor} rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-2 relative overflow-hidden group ${
                selectedOccasion === occasion.id 
                  ? 'border-orange-400 shadow-lg scale-105' 
                  : 'border-transparent'
              }`}
              onClick={() => handleOccasionSelect(occasion.id)}
            >
              {/* Emoji Icon */}
              <div className="text-6xl mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                {occasion.emoji}
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg text-gray-800 mb-2 transition-transform duration-300 group-hover:-translate-y-1">
                {occasion.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed transition-transform duration-300 group-hover:-translate-y-1">
                {occasion.description}
              </p>

              {/* Subtitle */}
              <p className="text-xs text-orange-600 font-medium mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                {occasion.subtitle}
              </p>

              {/* Button - Hidden by default, shows on hover */}
              <button
                className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-all duration-300 transform ${occasion.buttonColor} 
                  translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-105
                  ${selectedOccasion === occasion.id ? 'translate-y-0 opacity-100' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOccasionSelect(occasion.id);
                }}
              >
                Choose This Occasion
              </button>
            </div>
          ))}
        </div>

        {/* Selected Occasion Display */}
        {selectedOccasion && (
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <p className="text-gray-600 mb-2">You selected:</p>
            <h3 className="text-2xl font-bold text-orange-600">
              {occasions.find(o => o.id === selectedOccasion)?.title}
            </h3>
            <p className="text-gray-500 mt-2">
              {occasions.find(o => o.id === selectedOccasion)?.description}
            </p>
            <button 
              className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              onClick={() => console.log('Continue to next step')}
            >
              Continue to Next Step
            </button>
          </div>
        )}
      </div>
    </div>
  );
}