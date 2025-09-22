import React from 'react';
import { Gift} from 'lucide-react';

// Hero Section Component
const HeroSection = ({ 
  title = "Gifting, made joyful.", 
  subtitle = "Wove connects you to the brands people love—so you can send meaningful, instant gifts that feel personal, wherever they are.",
  buttonText = "Send Gift Card",
  buttonIcon = Gift 
}) => {
  const Icon = buttonIcon;
  
  return (
    <div className="bg-gradient-to-br from-orange-50 to-pink-50 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        <button className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center mx-auto gap-2">
          <Icon className="w-5 h-5" />
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default HeroSection;

