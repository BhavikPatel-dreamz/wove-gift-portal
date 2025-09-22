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
  
  const gradients = [
    "bg-gradient-to-br from-rose-100 via-pink-50 to-pink-200",
    "bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200", 
    "bg-gradient-to-br from-amber-100 via-yellow-50 to-yellow-200",
    "bg-gradient-to-br from-purple-100 via-violet-50 to-purple-200",
    "bg-gradient-to-br from-emerald-100 via-green-50 to-green-200",
    "bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200",
    "bg-gradient-to-br from-orange-100 via-orange-50 to-orange-200",
    "bg-gradient-to-br from-teal-100 via-cyan-50 to-teal-200",
    "bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-200",
    "bg-gradient-to-br from-red-100 via-rose-50 to-red-200"
  ];

  const randomGradient = gradients[brand.id % gradients.length];

  const handleCardClick = () => {
    onClick(brand);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(brand.id);
  };

  return (
    <div
      className={`${randomGradient} rounded-2xl p-6 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out relative group border border-white/50 backdrop-blur-sm ${className}`}
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
        className="absolute top-4 left-4 p-2.5 hover:bg-white/30 rounded-xl transition-all duration-200 z-10 group/fav backdrop-blur-sm"
        aria-label={isFavorited ? `Remove ${brand.name} from favorites` : `Add ${brand.name} to favorites`}
      >
        <Heart
          size={18}
          className={`transition-all duration-200 ${
            isFavorited 
              ? "text-red-500 fill-current scale-110" 
              : "text-gray-500 group-hover/fav:text-red-400 group-hover/fav:scale-110"
          }`}
        />
      </button>

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1 animate-pulse">
            <Crown size={12} />
            Premium
          </div>
        </div>
      )}

      {/* Brand Logo */}
      <div className="flex justify-center mb-6 mt-2">
        <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/50">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={`${brand.name} logo`}
              className="w-16 h-16 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-600" />
            </div>
          )}
        </div>
      </div>

      {/* Brand Info */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <span className="inline-flex items-center bg-white/70 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full text-gray-700 font-medium border border-white/50">
            {brand.category}
          </span>
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg leading-tight">
          {brand.name}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {brand.description}
        </p>
      </div>

      {/* Interactive Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex items-end justify-center pb-8">
        <button 
          className="bg-white/95 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-xl hover:bg-white hover:scale-105 transition-all duration-200 text-sm border border-white/50 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Star size={16} className="text-yellow-500" />
          Choose Brand
        </button>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-white/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-1/2 right-4 w-2 h-2 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200"></div>
      </div>
    </div>
  );
};

export default BrandCard;