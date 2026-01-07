"use client";
import { useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { setSelectedOccasion, setCurrentStep, resetFlow } from '@/redux/giftFlowSlice';
import { useState, useRef, useEffect } from 'react';

const OccasionsSection = ({ occasions = [], isLoading = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  // Slider states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

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
      router.push('/gift');
    } else {
      dispatch(setSelectedOccasion(occasion.id));
      dispatch(setCurrentStep(4));
    }
  };

  // Dragging handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    snapToClosest();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    snapToClosest();
  };

  const snapToClosest = () => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.children[0]?.offsetWidth || 0;
    const gap = 24; // 1.5rem = 24px
    const slideWidth = cardWidth + gap;
    const newIndex = Math.round(sliderRef.current.scrollLeft / slideWidth);
    setCurrentIndex(newIndex);
    sliderRef.current.scrollTo({
      left: newIndex * slideWidth,
      behavior: 'smooth'
    });
  };

  // Update current index on scroll (for dots indicator)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const cardWidth = slider.children[0]?.offsetWidth || 0;
      const gap = 24;
      const slideWidth = cardWidth + gap;
      const newIndex = Math.round(slider.scrollLeft / slideWidth);
      setCurrentIndex(newIndex);
    };

    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="occasions-section">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="occasions-section-title fontPoppins">Perfect for Every Occasion</h2>
          <p className="occasions-section-subtitle">Find the right moment to spread joy</p>
        </div>

        {/* Desktop Grid (hidden on mobile) */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {occasions.slice(0, 4).map((occasion) => (
            <div key={occasion.id} className="occasion-card cursor-pointer" onClick={() => handleOccasionSelect(occasion)}>
              {occasion.image && (
                <img
                  src={occasion.image}
                  alt={occasion.title}
                  className="occasion-card-image"
                />
              )}
              <div className="occasion-card-content">
                <h3 className="occasion-card-title fontPoppins">{occasion.name}</h3>
                <p className="occasion-card-description">{occasion.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Slider (shown only on mobile) */}
        <div className="lg:hidden relative">
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {occasions.slice(0, 4).map((occasion) => (
              <div
                key={occasion.id}
                className="occasion-card flex-shrink-0 cursor-pointer"
                onClick={() => handleOccasionSelect(occasion)}
                style={{
                  width: 'calc(100vw - 3rem)',
                  maxWidth: '380px',
                  scrollSnapAlign: 'start'
                }}
              >
                {occasion.image && (
                  <img
                    src={occasion.image}
                    alt={occasion.title}
                    className="occasion-card-image"
                    draggable="false"
                  />
                )}
                <div className="occasion-card-content">
                  <h3 className="occasion-card-title fontPoppins">{occasion.name}</h3>
                  <p className="occasion-card-description">{occasion.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {occasions.slice(0, 4).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const cardWidth = sliderRef.current?.children[0]?.offsetWidth || 0;
                  const gap = 24;
                  const slideWidth = cardWidth + gap;
                  sliderRef.current?.scrollTo({
                    left: index * slideWidth,
                    behavior: 'smooth'
                  });
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-gradient-to-r from-[#ed457d] to-[#fa8f42] w-8'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Skeleton Component
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

export default OccasionsSection;