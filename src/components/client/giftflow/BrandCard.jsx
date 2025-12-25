"use client"

import React from "react";
import { Heart, Star, Sparkles, Crown } from "lucide-react";

const BrandCard = ({
  brand,
  isFavorited = false,
  onToggleFavorite,
  onClick,
  selectedBrand
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
      className={`bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 relative border border-[#1A1A1A1A] ${selectedBrand?.id === brand.id ? 'border-1 border-blue-500' : 'border-1 border-[rgba(26,26,26,0.10)]'}`}
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
          className={`transition-all duration-200 ${isFavorited
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
          <span className="text-[14px] px-3 py-1 rounded-full font-bold" style={{
            color: brand.categoryColor || '#FF6B35',
            backgroundColor: brand.categoryBgColor || '#FFF0ED'
          }}>
            {brand.categoryName}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-xl">
          {brand.brandName}
        </h3>

        <p className="text-gray-600 text-[16px] leading-relaxed line-clamp-2 mb-2">
          {brand.description}
        </p>

        {/* Choose Brand Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(brand);
          }}
          className="
    relative w-full inline-flex items-center justify-center gap-2
    px-5 py-3 rounded-full font-semibold text-base
    text-gray-800 bg-white border border-transparent
    transition-all duration-300 overflow-hidden group cursor-pointer
  "
        >
          {/* Outer gradient border */}
          <span
            className="
      absolute inset-0 rounded-full p-[1.5px]
      bg-gradient-to-r from-[#ED457D] to-[#FA8F42]
    "
          ></span>

          {/* Inner white background layer */}
          <span
            className="
      absolute inset-[1.5px] rounded-full bg-white
      transition-all duration-300
      group-hover:bg-gradient-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]
    "
          ></span>

          {/* Button content */}
          <div className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
            Choose Brand
            <span className="mt-1">
              <svg
                width="8"
                height="9"
                viewBox="0 0 8 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-300 group-hover:[&>path]:fill-white"
              >
                <path
                  d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                  fill="url(#paint0_linear_2062_919)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_2062_919"
                    x1="-2.27994e-08"
                    y1="3.01721"
                    x2="16.6701"
                    y2="13.1895"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#ED457D" />
                    <stop offset="1" stopColor="#FA8F42" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </div>
        </button>

      </div>
    </div>
  );
};

export default BrandCard;