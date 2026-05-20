import React, { useState } from 'react';
import { Search, ChevronDown, Heart, ArrowLeft, Sparkles } from 'lucide-react';

// Header Component
const BrandHeader = ({ title, subtitle, onBack }) => (
  <div className="relative bg-linear-to-br from-purple-50 via-pink-50 to-indigo-50 p-4 sm:p-6 md:p-8 text-center w-full mx-auto rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm">
    {/* Decorative background elements */}
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-linear-to-br from-pink-200 to-purple-200 rounded-full opacity-30 blur-xl"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-linear-to-br from-indigo-200 to-pink-200 rounded-full opacity-20 blur-xl"></div>
    </div>
    
    <div className="relative z-10">
      {/* Back button */}
      <button 
        onClick={onBack} 
        className="absolute left-2 sm:left-3 md:left-4 top-2 sm:top-3 md:top-4 p-2 sm:p-2.5 md:p-3 hover:bg-white/60 active:bg-white/80 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
      >
        <ArrowLeft size={18} className="text-gray-700 group-hover:text-gray-900 transition-colors sm:size-[20px] md:size-5" />
      </button>

      {/* Main heading with enhanced styling */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-2.5 md:mb-3">
          <Sparkles className="text-pink-500 animate-pulse" size={18} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
            Pick Your{' '}
            <span className="bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient">
              Perfect Brand
            </span>
          </h1>
          <Sparkles className="text-purple-500 animate-pulse" size={18} />
        </div>
        
        {/* Subtitle with better typography */}
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-3 sm:mb-4 font-medium max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
          {subtitle || "Discover curated brands that match your style and values"}
        </p>
        
        {/* Enhanced tagline */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/40">
            <Heart className="text-pink-500 fill-pink-500" size={12} />
            <span className="text-gray-600 font-medium text-xs sm:text-sm">Handpicked for moments that matter</span>
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      @keyframes gradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 3s ease-in-out infinite;
      }
      
      @media (max-width: 640px) {
        .animate-gradient {
          background-size: 150% 150%;
        }
      }
    `}</style>
  </div>
);

export default BrandHeader;