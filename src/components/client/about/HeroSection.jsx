import React from 'react';
import { Gift} from 'lucide-react';

// Hero Section Component
const HeroSection = ({ 
  title = "Gifting, made joyful.", 
  subtitle = "Wave connects you to the brands people love—so you can send meaningful, instant gifts that feel personal, wherever they are.",
  buttonText = "Send Gift Card",
  buttonIcon = Gift 
}) => {
  const Icon = buttonIcon;
  
  return (
    <div 
      className="py-20 px-6"
      style={{ 
        background: 'linear-gradient(135deg, #F5F3E7 0%, #FFF4F1 50%, #FFE6DC 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 
          className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          style={{ color: '#2D5A3D' }}
        >
          {title}
        </h1>
        <p 
          className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#8B4513' }}
        >
          {subtitle}
        </p>
        <button 
          className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center mx-auto gap-2 text-white"
          style={{ 
            background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
            boxShadow: '0 4px 6px rgba(255, 107, 53, 0.3)'
          }}
        >
          <Icon className="w-5 h-5" />
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default HeroSection;

