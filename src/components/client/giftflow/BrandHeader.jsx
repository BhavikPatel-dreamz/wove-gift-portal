import React, { useState } from 'react';
import { Search, ChevronDown, Heart, ArrowLeft, Sparkles } from 'lucide-react';

// Header Component
const BrandHeader = ({ title, subtitle, onBack }) => (
  <div className="relative bg-linear-to-br from-purple-50 via-pink-50 to-indigo-50 p-8 text-center w-full mx-auto rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm">
    {/* Decorative background elements */}
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-linear-to-br from-pink-200 to-purple-200 rounded-full opacity-30 blur-xl"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-linear-to-br from-indigo-200 to-pink-200 rounded-full opacity-20 blur-xl"></div>
    </div>
    
    <div className="relative z-10">
      {/* Back button */}
      <button 
        onClick={onBack} 
        className="absolute left-4 top-4 p-3 hover:bg-white/60 active:bg-white/80 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
      >
        <ArrowLeft size={20} className="text-gray-700 group-hover:text-gray-900 transition-colors" />
      </button>

      {/* Main heading with enhanced styling */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="text-pink-500 animate-pulse" size={24} />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Pick Your{' '}
            <span className="bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient">
              Perfect Brand
            </span>
          </h1>
          <Sparkles className="text-purple-500 animate-pulse" size={24} />
        </div>
        
        {/* Subtitle with better typography */}
        <p className="text-xl text-gray-700 mb-4 font-medium max-w-2xl mx-auto leading-relaxed">
          {subtitle || "Discover curated brands that match your style and values"}
        </p>
        
        {/* Enhanced tagline */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/40">
            <Heart className="text-pink-500 fill-pink-500" size={16} />
            <span className="text-gray-600 font-medium">Handpicked for moments that matter</span>
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
    `}</style>
  </div>
);

export default BrandHeader;