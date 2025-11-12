"use client"

import React from "react";
import { Heart, Star, Sparkles, Crown } from "lucide-react";

const BrandCard = ({
  brand,
  isFavorited = false,
  onToggleFavorite,
  onClick,
}) => {
  const handleCardClick = () => {
    onClick?.(brand);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite?.(brand.id);
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 relative border border-gray-100"
      onClick={handleCardClick}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 p-1.5 hover:bg-gray-50 rounded-lg transition-all duration-200 z-10"
        aria-label={isFavorited ? `Remove ${brand.brandName} from favorites` : `Add ${brand.brandName} to favorites`}
      >
        <Heart
          size={18}
          className={`transition-all duration-200 ${
            isFavorited 
              ? "text-red-500 fill-current" 
              : "text-gray-400 hover:text-red-500"
          }`}
        />
      </button>

      {/* Brand Logo */}
      <div className="flex justify-center mb-6 mt-2">
        <div className="w-24 h-24 flex items-center justify-center">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={`${brand.brandName} logo`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="text-4xl font-bold text-gray-300">
              {brand.brandName?.[0]}
            </div>
          )}
        </div>
      </div>

      {/* Brand Info */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{
            color: brand.categoryColor || '#FF6B35',
            backgroundColor: brand.categoryBgColor || '#FFF0ED'
          }}>
            {brand.categoryName}
          </span>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg">
          {brand.brandName}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {brand.description}
        </p>

        {/* Choose Brand Button */}
        <button 
          className="w-full mt-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 border"
          style={{
            color: brand.buttonColor || '#E63946',
            borderColor: brand.buttonColor || '#E63946',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = brand.buttonColor || '#E63946';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = brand.buttonColor || '#E63946';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(brand);
          }}
        >
          Choose Brand →
        </button>
      </div>
    </div>
  );
};

export default BrandCard;