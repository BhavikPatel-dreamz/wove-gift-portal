import React from 'react';
import { Sparkles } from 'lucide-react';

const OccasionCard = ({ name, emoji, description, image, isActive }) => (
  <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        <span className="text-3xl">{emoji}</span>
      </div>
      {image && (
        <div className="absolute -top-2 -right-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
    
    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors duration-300">
      {name}
    </h3>
    
    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
      {description}
    </p>
    
    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
      Choose This Occasion
    </button>
  </div>
);

export default OccasionCard;