import React from "react";
import BrandCard from "./BrandCard";

const CardGrid = ({ 
  brands = [], 
  favorites = [], 
  onToggleFavorite, 
  onBrandClick, 
  isLoading = false 
}) => {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100"
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="text-center space-y-3">
              <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
              <div className="h-5 bg-gray-200 rounded w-32 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded-full w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No brands found</h3>
        <p className="text-gray-600">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {brands.map(brand => (
        <BrandCard
          key={brand.id}
          brand={brand}
          isFavorited={favorites.includes(brand.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onBrandClick}
        />
      ))}
    </div>
  );
};

export default CardGrid;