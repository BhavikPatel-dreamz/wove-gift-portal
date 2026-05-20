import React from "react";
import BrandCard from "./BrandCard";

const CardGrid = ({ 
  brands = [], 
  favorites = [], 
  onToggleFavorite, 
  onBrandClick, 
  isLoading = true,
  selectedBrand = null
}) => {
  const favoriteSet = new Set(favorites.map((id) => String(id)));

  // 1️⃣ SHOW SKELETON FIRST - Only show when actually loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center gap-3 sm:gap-4 md:gap-6 px-2 sm:p-4 md:p-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="w-full max-w-sm sm:max-w-none bg-white rounded-2xl p-4 sm:p-6 animate-pulse border border-gray-100"
          >
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg" />
            </div>
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="h-5 sm:h-6 bg-gray-200 rounded-full w-16 sm:w-20 mx-auto" />
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 sm:w-32 mx-auto" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full" />
              <div className="h-8 sm:h-10 bg-gray-200 rounded-full w-full mt-3 sm:mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2️⃣ SHOW EMPTY STATE ONLY AFTER LOADING IS DONE
  if (brands.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
          No brands found
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  // 3️⃣ SHOW DATA
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center gap-3 sm:gap-4 md:gap-6 px-2 sm:p-4 md:p-6 mt-2 sm:mt-4 md:mt-6 lg:mt-10">
      {brands.map((brand) => (
        <BrandCard
          key={brand.id}
          brand={brand}
          isFavorited={favoriteSet.has(String(brand.id))}
          onToggleFavorite={onToggleFavorite}
          onClick={onBrandClick}
          selectedBrand={selectedBrand}
        />
      ))}
    </div>
  );
};

export default CardGrid;
