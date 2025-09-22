import React from "react";
import { Heart, Star, Sparkles, Crown } from "lucide-react";
import BrandCard from "./BrandCard";


const CardGrid = ({ 
  brands = [], 
  favorites = [], 
  onToggleFavorite, 
  onBrandClick, 
  premiumBrands = [],
  isLoading = false 
}) => {
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 animate-pulse"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-300 rounded-2xl"></div>
            </div>
            <div className="text-center space-y-3">
              <div className="h-6 bg-gray-300 rounded-full w-20 mx-auto"></div>
              <div className="h-5 bg-gray-300 rounded w-32 mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!brands || brands.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No brands available</h3>
        <p className="text-gray-500">Check back later for new gift card options.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
      {brands.map(brand => (
        <BrandCard
          key={brand.id}
          brand={brand}
          isPremium={premiumBrands.includes(brand.id)}
          isFavorited={favorites.includes(brand.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onBrandClick}
        />
      ))}
    </div>
  );
};

export default CardGrid;