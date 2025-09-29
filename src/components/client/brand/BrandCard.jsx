"use client"

import React from "react";
import { Heart, Star, Sparkles, Crown } from "lucide-react";

const BrandCard = ({
  brand,
  isPremium = false,
  isFavorited = false,
  onToggleFavorite,
  onClick,
  className = "",
}) => {
  
  // Wave Gifts brand backgrounds for variety
  const gradients = [
    "bg-white",
    "bg-wave-cream", 
    "bg-white",
    "bg-wave-cream",
    "bg-white",
    "bg-wave-cream",
    "bg-white",
    "bg-wave-cream",
    "bg-white",
    "bg-wave-cream"
  ];

  const randomGradient = gradients[brand.id % gradients.length];

  const handleCardClick = () => {
    onClick(brand);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(brand.id);
  };

  console.log("brand",brand);
  

  return (
    <div
      className={`${randomGradient} rounded-2xl p-6 cursor-pointer hover:scale-[1.02] hover:shadow-brand-lg hover:-translate-y-1 transition-all duration-300 ease-out relative group border border-wave-cream backdrop-blur-sm ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Select ${brand.name} gift card`}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 left-4 p-2.5 hover:bg-wave-cream-dark rounded-xl transition-all duration-200 z-10 group/fav backdrop-blur-sm"
        aria-label={isFavorited ? `Remove ${brand.name} from favorites` : `Add ${brand.name} to favorites`}
      >
        <Heart
          size={18}
          className={`transition-all duration-200 ${
            isFavorited 
              ? "text-wave-orange fill-current scale-110" 
              : "text-wave-brown group-hover/fav:text-wave-orange group-hover/fav:scale-110"
          }`}
        />
      </button>

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-4 right-4 z-10">
          <div className="badge bg-wave-orange text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-brand flex items-center gap-1">
            <Crown size={12} />
            Premium
          </div>
        </div>
      )}

      {/* Brand Logo */}
      <div className="flex justify-center mb-6 mt-2">
        <div className="w-20 h-20 bg-white backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-brand group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-wave-cream">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={`${brand.name} logo`}
              className="w-16 h-16 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 bg-wave-cream-dark rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-wave-green" />
            </div>
          )}
        </div>
      </div>

      {/* Brand Info */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <span className="badge badge-outline text-xs px-3 py-1.5 rounded-full font-medium">
            {brand.categoryName}
          </span>
        </div>
        
        <h3 className="font-bold text-wave-green text-lg leading-tight">
          {brand.brandName}
        </h3>
        
        <p className="text-wave-brown text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {brand.description}
        </p>
      </div>

      {/* Interactive Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex items-end justify-center pb-8">
        <button 
          className="btn-primary px-6 py-3 rounded-xl font-semibold shadow-brand hover:scale-105 transition-all duration-200 text-sm flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Star size={16} className="text-white" />
          Choose Brand
        </button>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-wave-orange/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-1/2 right-4 w-2 h-2 bg-wave-orange/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200"></div>
      </div>
    </div>
  );
};

export default BrandCard;