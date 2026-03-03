"use client";
import { useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { setSelectedOccasion, setCurrentStep, resetFlow,clearCsvFileData } from '@/redux/giftFlowSlice';
import { useState, useRef } from 'react';

const OccasionsSection = ({ occasions = [], isLoading = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Slider states
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const sliderRef = useRef(null);
  const desktopSliderRef = useRef(null);
  const dragStateRef = useRef({ slider: null, startX: 0, scrollLeft: 0 });

  // Show skeleton while loading
  if (isLoading) {
    return <OccasionsSkeleton />;
  }

  if (!occasions.length) {
    return null;
  }

  const handleOccasionSelect = (occasion) => {
    if (pathname === "/") {
      dispatch(resetFlow());
      dispatch(setSelectedOccasion(occasion.id));
      dispatch(clearCsvFileData());
      router.push('/gift');
    } else {
      dispatch(setSelectedOccasion(occasion.id));
      dispatch(setCurrentStep(4));
    }
  };

  const beginDrag = (sliderElement, clientX) => {
    if (!sliderElement) return;

    const rect = sliderElement.getBoundingClientRect();
    dragStateRef.current = {
      slider: sliderElement,
      startX: clientX - rect.left,
      scrollLeft: sliderElement.scrollLeft,
    };

    setHasDragged(false);
    setIsDragging(true);
  };

  const dragSlider = (clientX) => {
    if (!isDragging) return;

    const { slider, startX, scrollLeft } = dragStateRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const x = clientX - rect.left;
    const walk = (x - startX) * 1.4;

    if (Math.abs(walk) > 6) {
      setHasDragged(true);
    }

    slider.scrollLeft = scrollLeft - walk;
  };

  const endDrag = () => {
    if (!isDragging) return;

    setIsDragging(false);
    dragStateRef.current.slider = null;
    setTimeout(() => setHasDragged(false), 0);
  };

  const handleDesktopMouseDown = (e) => {
    beginDrag(desktopSliderRef.current, e.clientX);
  };

  const handleMobileMouseDown = (e) => {
    beginDrag(sliderRef.current, e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    dragSlider(e.clientX);
  };

  const handleTouchStart = (e) => {
    beginDrag(sliderRef.current, e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    dragSlider(e.touches[0].clientX);
  };

  return (
    <section className="occasions-section">
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="occasions-section-title fontPoppins">Perfect for Every Occasion</h2>
          <p className="occasions-section-subtitle">Find the right moment to spread joy</p>
        </div>

        {/* Desktop Slider */}
        <div className="hidden lg:block relative">
          <div
            ref={desktopSliderRef}
            className={`flex gap-6 overflow-x-auto py-4 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseDown={handleDesktopMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            {occasions.map((occasion) => (
              <div
                key={occasion.id}
                className="occasion-card cursor-pointer shrink-0 transition-transform duration-300"
                style={{ width: 'calc(25% - 1.125rem)' }}
                onClick={(e) => {
                  if (hasDragged || isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleOccasionSelect(occasion);
                }}
              >
                
                {occasion.image && (
                  <div className='image-wrapper overflow-hidden rounded-lg'>
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="occasion-card-image"                                                                                                                                                                     
                    draggable="false"
                    loading="lazy"
                  />
                  </div>
                )}
                <div className="occasion-card-content">
                  <h3 className="occasion-card-title fontPoppins">{occasion.name}</h3>
                  <p className="occasion-card-description">{occasion.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Mobile Slider */}
        <div className="lg:hidden relative">
          <div
            ref={sliderRef}
            className={`flex gap-6 overflow-x-auto select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
            onMouseDown={handleMobileMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={endDrag}
          >
            {occasions.map((occasion) => (
              <div
                key={occasion.id}
                className="occasion-card shrink-0 cursor-pointer transition-transform duration-300 active:scale-[0.98]"
                onClick={(e) => {
                  // Prevent click when dragging
                  if (hasDragged || isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleOccasionSelect(occasion);
                }}
                style={{
                  width: 'calc(100vw - 3rem)',
                  maxWidth: '380px',
                  scrollSnapAlign: 'start'
                }}
              >
                {occasion.image && (
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="occasion-card-image"
                    draggable="false"
                    loading="lazy"
                  />
                )}
                <div className="occasion-card-content">
                  <h3 className="occasion-card-title fontPoppins">{occasion.name}</h3>
                  <p className="occasion-card-description">{occasion.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

// Skeleton Component (keep as is)
const OccasionsSkeleton = () => {
  return (
    <section className="occasions-section">
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Skeleton */}
        <div className="mb-12">
          <h2 className="occasions-section-title fontPoppins">Perfect for Every Occasion</h2>
          <p className="occasions-section-subtitle">Find the right moment to spread joy</p>
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
                className="occasion-card shrink-0"
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
        </div>
      </div>
    </section>
  );
};

export default OccasionsSection;
