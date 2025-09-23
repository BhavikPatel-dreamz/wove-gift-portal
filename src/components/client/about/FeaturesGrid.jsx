

import React from 'react';
import { Gift, Users, Zap, Heart, CheckCircle, Star, Globe, ArrowRight, Play } from 'lucide-react';


const FeaturesGrid = ({ features = [] }) => {
  const defaultFeatures = [
    {
      icon: Users,
      title: "Access to Brands",
      description: "A curated catalog of trusted favorites and global names.",
      color: "#FF6B35",
      bgColor: "#FFF4F1"
    },
    {
      icon: Zap,
      title: "Instant & Delightful",
      description: "Wow-thing, weird, or practical—delivered in moments.",
      color: "#2D5A3D",
      bgColor: "#F0F4F1"
    },
    {
      icon: Heart,
      title: "For Everyone",
      description: "One gift that fits every taste, budget, and occasion.",
      color: "#8B4513",
      bgColor: "#F7E6D8"
    }
  ];

  const featuresToRender = features.length > 0 ? features : defaultFeatures;

  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#EBE7D4' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {featuresToRender.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="text-center p-8 rounded-2xl transition-all duration-300 hover:transform hover:scale-105"
                style={{ 
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <Icon 
                    className="w-8 h-8" 
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ color: '#2D5A3D' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="leading-relaxed"
                  style={{ color: '#8B4513' }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesGrid;