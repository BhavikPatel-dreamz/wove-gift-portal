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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center gap-2 sm:gap-4 md:gap-6 px-2 sm:p-4 md:p-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="w-full rounded-2xl border border-gray-100 bg-white p-2.5 sm:p-4 animate-pulse"
          >
            <div className="mb-2 mt-7 sm:mb-5 sm:mt-9">
              <div className="min-h-[5.5rem] sm:min-h-[10.5rem] rounded-[18px] sm:rounded-[22px] border border-gray-100 bg-gray-100" />
            </div>
            <div className="text-center">
              <div className="mb-1.5 h-5 sm:h-6 rounded-full bg-gray-200 w-20 sm:w-24 mx-auto" />
              <div className="mb-1.5 sm:mb-2 h-3.5 sm:h-4 rounded bg-gray-200 w-24 sm:w-28 mx-auto" />
              <div className="mb-3 sm:mb-5 h-3 rounded bg-gray-200 w-full" />
              <div className="h-8 sm:h-10 rounded-full bg-gray-200 w-full mt-auto" />
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
    <div className="grid grid-cols-2 mb-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center gap-2 sm:gap-4 md:gap-6 px-2 sm:p-4 md:p-6 mt-2 sm:mt-4 md:mt-6 lg:mt-10">
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
