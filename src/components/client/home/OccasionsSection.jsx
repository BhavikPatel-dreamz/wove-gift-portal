"use client";
import { useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { setSelectedOccasion, setCurrentStep, resetFlow } from '@/redux/giftFlowSlice';
import { useState, useRef, useEffect, useCallback } from 'react';

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
  const desktopSliderRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Smooth scroll function using requestAnimationFrame with Promise return
  const smoothScrollTo = useCallback((element, target, duration = 300) => {
    return new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }
      
      const start = element.scrollLeft;
      const change = target - start;
      const startTime = performance.now();
      
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      
      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother transition (easeInOutQuad)
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
        
        element.scrollLeft = start + change * easeProgress;
        
        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        } else {
          scrollAnimationRef.current = null;
          resolve();
        }
      };
      
      scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    });
  }, []);

  // Auto-scroll function for both desktop and mobile
  const startAutoScroll = useCallback(() => {
    if (!occasions.length || isAutoScrolling) return;
    
    const scroll = async () => {
      if (isHovering || isDragging) return;
      
      if (isMobile) {
        // Mobile slider
        const slider = sliderRef.current;
        if (!slider) return;
        
        const cardWidth = slider.children[0]?.offsetWidth || 0;
        const gap = 24;
        const slideWidth = cardWidth + gap;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const currentScroll = slider.scrollLeft;
        const currentIndex = Math.round(currentScroll / slideWidth);
        
        if (currentIndex >= occasions.length - 1) {
          // Go back to first slide
          setIsAutoScrolling(true);
          await smoothScrollTo(slider, 0, 400);
          setIsAutoScrolling(false);
        } else {
          // Go to next slide
          const nextScroll = (currentIndex + 1) * slideWidth;
          await smoothScrollTo(slider, nextScroll, 600);
        }
      } else {
        // Desktop slider
        const slider = desktopSliderRef.current;
        if (!slider || isHovering) return;
        
        const cards = slider.querySelectorAll('.occasion-card');
        if (cards.length === 0) return;
        
        const cardWidth = cards[0].offsetWidth;
        const gap = 24;
        const scrollAmount = cardWidth + gap;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const currentScroll = slider.scrollLeft;
        
        if (currentScroll >= maxScroll - 10) {
          // Go back to first slide
          setIsAutoScrolling(true);
          await smoothScrollTo(slider, 0, 400);
          setIsAutoScrolling(false);
        } else {
          // Go to next slide
          const nextScroll = currentScroll + scrollAmount;
          await smoothScrollTo(slider, nextScroll, 600);
        }
      }
    };

    // Clear any existing interval
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }

    // Start auto-scroll interval
    autoScrollRef.current = setInterval(() => {
      if (!isDragging && !isHovering) {
        scroll();
      }
    }, 2500);

  }, [isMobile, isHovering, isDragging, isAutoScrolling, occasions.length, smoothScrollTo]);

  // Start/stop auto-scroll based on conditions
  useEffect(() => {
    if (occasions.length === 0) return;

    // Start auto-scroll
    startAutoScroll();

    // Cleanup
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
      }
    };
  }, [startAutoScroll, occasions.length]);

  // Handle hover for desktop
  useEffect(() => {
    if (!isMobile) {
      if (isHovering) {
        // Pause auto-scroll on hover
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
          autoScrollRef.current = null;
        }
      } else {
        // Resume auto-scroll when not hovering
        startAutoScroll();
      }
    }
  }, [isHovering, isMobile, startAutoScroll]);

  // Dragging handlers for mobile
  const handleMouseDown = (e) => {
    if (isAutoScrolling || !sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
    
    // Pause auto-scroll during drag
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const handleTouchStart = (e) => {
    if (isAutoScrolling || !sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
    
    // Pause auto-scroll during drag
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isAutoScrolling || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isAutoScrolling || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    snapToClosest();
    
    // Resume auto-scroll after drag ends
    setTimeout(() => {
      startAutoScroll();
    }, 1000); // Wait 1 second before resuming
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    snapToClosest();
    
    // Resume auto-scroll after drag ends
    setTimeout(() => {
      startAutoScroll();
    }, 1000); // Wait 1 second before resuming
  };

  const snapToClosest = async () => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.children[0]?.offsetWidth || 0;
    const gap = 24;
    const slideWidth = cardWidth + gap;
    const newIndex = Math.round(sliderRef.current.scrollLeft / slideWidth);
    const clampedIndex = Math.max(0, Math.min(newIndex, occasions.length - 1));
    setCurrentIndex(clampedIndex);
    
    await smoothScrollTo(sliderRef.current, clampedIndex * slideWidth, 200);
  };

  // Update current index on scroll (for dots indicator)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        const cardWidth = slider.children[0]?.offsetWidth || 0;
        const gap = 24;
        const slideWidth = cardWidth + gap;
        const newIndex = Math.round(slider.scrollLeft / slideWidth);
        const clampedIndex = Math.max(0, Math.min(newIndex, occasions.length - 1));
        setCurrentIndex(clampedIndex);
        rafId = null;
      });
    };

    slider.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      slider.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [occasions.length]);

  // Handle dot navigation click for mobile
  const handleDotClick = async (index) => {
    const slider = isMobile ? sliderRef.current : desktopSliderRef.current;
    if (!slider || isAutoScrolling) return;
    
    // Pause auto-scroll during manual navigation
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    
    if (isMobile) {
      const cardWidth = slider.children[0]?.offsetWidth || 0;
      const gap = 24;
      const slideWidth = cardWidth + gap;
      await smoothScrollTo(slider, index * slideWidth, 300);
    } else {
      const cards = slider.querySelectorAll('.occasion-card');
      if (cards.length === 0) return;
      const cardWidth = cards[0].offsetWidth;
      const gap = 24;
      const slideWidth = cardWidth + gap;
      await smoothScrollTo(slider, index * slideWidth, 300);
    }
    
    setCurrentIndex(index);
    
    // Resume auto-scroll after delay
    setTimeout(() => {
      startAutoScroll();
    }, 1000);
  };

  return (
    <section className="occasions-section">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="occasions-section-title fontPoppins">Perfect for Every Occasion</h2>
          <p className="occasions-section-subtitle">Find the right moment to spread joy</p>
        </div>

        {/* Desktop Slider */}
        <div 
          className="hidden lg:block relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            ref={desktopSliderRef}
            className="flex gap-6 overflow-x-hidden py-4"
            style={{ 
              scrollBehavior: 'auto',
              cursor: isHovering ? 'grab' : 'default'
            }}
          >
            {occasions.map((occasion) => (
              <div 
                key={occasion.id} 
                className="occasion-card cursor-pointer flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]" 
                style={{ width: 'calc(25% - 1.125rem)' }}
                onClick={() => handleOccasionSelect(occasion)}
              >
                {occasion.image && (
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="occasion-card-image transition-transform duration-300 hover:scale-105"
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
          
          {/* Desktop dots indicator */}
          {/* <div className="flex justify-center gap-2 mt-8">
            {occasions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                  Math.floor((desktopSliderRef.current?.scrollLeft || 0) / 
                  ((desktopSliderRef.current?.querySelector('.occasion-card')?.offsetWidth || 0) + 24)) === index
                    ? 'bg-gradient-to-r from-[#ed457d] to-[#fa8f42] w-8'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div> */}
        </div>

        {/* Mobile Slider */}
        <div className="lg:hidden relative">
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-hidden cursor-grab active:cursor-grabbing select-none"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollBehavior: 'auto'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {occasions.map((occasion) => (
              <div
                key={occasion.id}
                className="occasion-card flex-shrink-0 cursor-pointer transition-transform duration-300 active:scale-[0.98]"
                onClick={(e) => {
                  // Prevent click when dragging
                  if (isDragging) {
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

          {/* Mobile dots indicator */}
          {/* <div className="flex justify-center gap-2 mt-6">
            {occasions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-gradient-to-r from-[#ed457d] to-[#fa8f42] w-8'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
};

// Skeleton Component (keep as is)
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
        </div>
      </div>
    </section>
  );
};

export default OccasionsSection;