import React from 'react';

const OccasionsSkeleton = () => {
  return (
    <section className="occasions-section">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Skeleton */}
        <div className="mb-12">
          <div className="h-10 w-72 bg-gray-200 rounded-lg mb-3 animate-pulse" />
          <div className="h-5 w-56 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Desktop Grid Skeleton (hidden on mobile) */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="occasion-card overflow-hidden">
              <div className="occasion-card-image bg-gray-200 animate-pulse" style={{ height: '240px' }} />
              <div className="occasion-card-content">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded-lg mb-1 animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Slider Skeleton (shown only on mobile) */}
        <div className="lg:hidden relative">
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="occasion-card flex-shrink-0"
                style={{
                  width: 'calc(100vw - 3rem)',
                  maxWidth: '380px'
                }}
              >
                <div className="occasion-card-image bg-gray-200 animate-pulse" style={{ height: '240px' }} />
                <div className="occasion-card-content">
                  <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded-lg mb-1 animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator Skeleton */}
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full bg-gray-200 animate-pulse ${
                  index === 0 ? 'w-8' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OccasionsSkeleton;