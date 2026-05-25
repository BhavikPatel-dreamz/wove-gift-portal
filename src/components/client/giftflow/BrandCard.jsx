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
      className="group mx-auto w-full max-w-[19rem] cursor-pointer rounded-2xl bg-transparent p-[2px] transition-all duration-300 hover:bg-linear-to-r hover:from-[#ED457D] hover:to-[#FA8F42] sm:max-w-none"
      onClick={handleCardClick}
    >
      <div
        className="relative flex h-full min-h-[23rem] flex-col rounded-[14px] bg-white p-3 transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(17,24,39,0.10)] sm:p-4"
        style={{
          boxShadow: isSelected
            ? 'inset 0 0 0 1.5px #3b82f6'
            : 'inset 0 0 0 1.5px rgba(26,26,26,0.10)',
        }}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 inline-flex items-center gap-1 rounded-full bg-[#FFF4E5] px-2 sm:px-3 py-0.5 sm:py-1 text-[#F59E0B]">
            <Star size={11} className="fill-current sm:size-3" />
            <span className="text-[11px] sm:text-[14px] leading-4 font-semibold">Featured</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 hover:bg-gray-50 transition-all duration-200 z-10 border border-gray-200 rounded-full"
          aria-label={isFavorited ? `Remove ${brand.brandName} from favorites` : `Add ${brand.brandName} to favorites`}
        >
          <Heart
            size={16}
            className={`transition-all duration-200 sm:size-[18px] ${isFavorited
              ? "text-red-500 fill-current"
              : "text-gray-400 hover:text-red-500"
              }`}
          />
        </button>

        {/* Brand Logo */}
        <div className="mb-2 mt-4 sm:mb-3 sm:mt-4">
          {/* <div className="flex min-h-[9.5rem] sm:min-h-[10.5rem] items-center justify-center overflow-hidden rounded-[22px] border border-[#F1F1F4] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(247,247,250,0.96)_52%,_rgba(241,242,247,0.96)_100%)] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"> */}
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={`${brand.brandName} logo`}
                className="h-full max-h-[8.5rem] w-full object-contain sm:max-h-[9.5rem] [transform:scale(1.08)]"
                loading="lazy"
              />
            ) : (
              <div className="text-3xl sm:text-4xl font-bold text-gray-300">
                {brand.brandName?.[0]}
              </div>
            )}
          {/* </div> */}
        </div>

        {/* Brand Info */}
        <div className="flex flex-1 flex-col text-center">
          <div className="mb-2 flex justify-center">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-[11px]"
              style={{
                color: text,
                backgroundColor: bg,
              }}
            >
              {brand.categoryName}
            </span>
          </div>

          <h3 className="mb-2 px-2 font-medium leading-tight text-[#1A1A1A] text-[13px] sm:text-[14px]">
            {brand.brandName}
          </h3>

          <p
            className="mb-4 line-clamp-2 px-1 text-[12px] font-normal leading-5 text-[#666674] sm:mb-5 sm:text-[13px]"
            title={brand.description || ""}
          >
            {brand.description}
          </p>

          {/* Choose Brand Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(brand);
            }}
            className="
    relative mt-auto inline-flex w-full items-center justify-center gap-2
    rounded-full border border-transparent px-4 py-2.5 font-semibold text-sm sm:px-5 sm:py-3 sm:text-base
    border border-transparent
    transition-all duration-300 overflow-hidden group cursor-pointer
  "
          >
            {/* Outer gradient border */}
            <span
              className="
      absolute inset-0 rounded-full p-[1.5px]
      bg-linear-to-r from-[#ED457D] to-[#FA8F42]
      group-hover:bg-linear-to-r group-hover:from-[#FA8F42] group-hover:to-[#ED457D]
    "
            ></span>

            {/* Inner white background layer */}
            <span
              className="
      absolute inset-0.5 rounded-full bg-white
      transition-all duration-300
      group-hover:bg-linear-to-r group-hover:from-[#FA8F42] group-hover:to-[#ED457D]
    "
            ></span>

            {/* Button content */}
            <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 transition-all duration-300">
              {/* Gradient text → white on hover */}
              <span
                className="
        bg-linear-to-r from-[#ED457D] to-[#FA8F42] bg-clip-text text-transparent
        group-hover:bg-none group-hover:text-white
        transition-all duration-300
        text-sm sm:text-base
      "
              >
                Choose Brand
              </span>

             <span className="transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:scale-110">
                <svg
                  width="7"
                  height="9"
                  viewBox="0 0 8 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-all duration-300 group-hover:[&>path]:fill-white sm:w-2 sm:h-auto"
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
