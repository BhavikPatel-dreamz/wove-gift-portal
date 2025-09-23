"use client"
import { useState } from "react";
import { ArrowRight, ExternalLink, Star, Grid3X3, List } from 'lucide-react';

const BrandCard = ({ brandName, logo, website, categorieName, description, tagline, isFeature }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-brand-lg hover:transform hover:scale-105 ${
        isFeature ? 'border-wave-orange shadow-brand' : 'border-wave-cream shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isFeature && (
        <div className="absolute -top-3 left-4 z-10">
          <div className="bg-wave-orange text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-brand">
            <Star className="w-3 h-3" />
            Featured
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 bg-wave-cream rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-wave-cream-dark transition-colors">
            <img
              src={logo}
              alt={brandName}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" fill="#F5F3E7"/>
                    <text x="24" y="28" font-family="Arial" font-size="16" fill="#8B4513" text-anchor="middle">${brandName.charAt(0)}</text>
                  </svg>
                `)}`;
              }}
            />
          </div>
          
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-wave-cream rounded-lg"
          >
            <ExternalLink className="w-4 h-4 text-wave-brown" />
          </a>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-wave-green text-lg group-hover:text-wave-orange transition-colors">
              {brandName}
            </h3>
          </div>
          
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-wave-green text-white border border-wave-green">
            {categorieName}
          </div>
          
          {tagline && (
            <p className="text-wave-brown text-sm font-medium">
              {tagline}
            </p>
          )}
          
          {description && (
            <p className="text-wave-brown text-sm line-clamp-2 opacity-75">
              {description}
            </p>
          )}
        </div>
        
        <div className={`mt-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-wave-orange hover:text-wave-orange-dark text-sm font-medium transition-colors duration-200"
          >
            Visit Website
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BrandCard;