"use client"

import React from "react";
import { Heart, Star } from "lucide-react";

const CATEGORY_COLORS = [
  { bg: '#FFF0ED', text: '#FF6B35' },
  { bg: '#EDF5FF', text: '#3B82F6' },
  { bg: '#EDFFF4', text: '#16A34A' },
  { bg: '#F5EDFF', text: '#9333EA' },
  { bg: '#FFFBED', text: '#D97706' },
  { bg: '#FFEDF6', text: '#EC4899' },
  { bg: '#EDFFFD', text: '#0D9488' },
  { bg: '#FFF0F0', text: '#EF4444' },
];

const getCategoryColor = (categoryName) => {
  const str = String(categoryName || '');
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
};

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
    onToggleFavorite?.(brand);
  };

  const { bg, text } = getCategoryColor(brand.categoryName);
  const isSelected = selectedBrand?.id === brand.id;
  const isFeatured = Boolean(
    brand?.isFeature ||
    brand?.isFeatured ||
    brand?.featured === 1 ||
    brand?.featured === true
  );

  return (
    <div
      className="relative rounded-2xl group cursor-pointer p-[2px]"
      onClick={handleCardClick}
    >
      {/* Gradient border — hidden by default, shown on hover */}
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ED457D] to-[#FA8F42] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/*
        Use a full 2px ring (not fractional pixels) so gradient thickness
        stays visually even on all sides across displays.
      */}
      <div
        className="bg-white rounded-[14px] p-6 hover:shadow-lg transition-all duration-300 relative"
        style={{
          boxShadow: isSelected
            ? 'inset 0 0 0 1.5px #3b82f6'
            : 'inset 0 0 0 1.5px rgba(26,26,26,0.10)',
        }}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#FFF4E5] px-3 py-1 text-[#F59E0B]">
            <Star size={13} className="fill-current" />
            <span className="text-[14px] leading-4 font-semibold">Featured</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-50 transition-all duration-200 z-10 border border-gray-200 rounded-full"
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
            <span
              className="text-[14px] px-3 py-1 rounded-full font-bold"
              style={{
                color: text,
                backgroundColor: bg,
              }}
            >
              {brand.categoryName}
            </span>
          </div>

          <h3 className="font-semibold text-[#1A1A1A] text-[22px]">
            {brand.brandName}
          </h3>

          <p className="text-[#4A4A4A] text-[16px] font-normal leading-relaxed line-clamp-2 mb-2">
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
    border border-transparent
    transition-all duration-300 overflow-hidden group cursor-pointer
  "
          >
            {/* Outer gradient border */}
            <span
              className="
      absolute inset-0 rounded-full p-[1.5px]
      bg-linear-to-r from-[#ED457D] to-[#FA8F42]
    "
            ></span>

            {/* Inner white background layer */}
            <span
              className="
      absolute inset-0.5 rounded-full bg-white
      transition-all duration-300
      group-hover:bg-linear-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]
    "
            ></span>

            {/* Button content */}
            <div className="relative z-10 flex items-center gap-2 transition-all duration-300">
              {/* Gradient text → white on hover */}
              <span
                className="
        bg-linear-to-r from-[#ED457D] to-[#FA8F42] bg-clip-text text-transparent
        group-hover:bg-none group-hover:text-white
        transition-all duration-300
      "
              >
                Choose Brand
              </span>

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
    </div>
  );
};

export default BrandCard;
