"use client";
import { useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { setSelectedOccasion, setCurrentStep, resetFlow, clearCsvFileData } from '@/redux/giftFlowSlice';
import { useState, useRef, useEffect, useCallback } from 'react';

const AUTO_SLIDE_INTERVAL = 3500; // ms between auto-slides
const DRAG_THRESHOLD = 6; // px before drag is considered intentional

const OccasionsSection = ({ occasions = [], isLoading = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Slider state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const sliderRef = useRef(null);         // mobile
  const desktopSliderRef = useRef(null);  // desktop
  const dragStateRef = useRef({ slider: null, startX: 0, scrollLeft: 0 });
  const autoSlideTimer = useRef(null);
  const isUserInteracting = useRef(false);

  // ─── Auto-slide logic ─────────────────────────────────────────────────────

  const getItemWidth = useCallback((slider) => {
    if (!slider) return 0;
    const firstChild = slider.firstElementChild;
    if (!firstChild) return 0;
    const style = window.getComputedStyle(firstChild);
    const gap = parseFloat(window.getComputedStyle(slider).gap) || 24;
    return firstChild.offsetWidth + gap;
  }, []);

  const scrollToIndex = useCallback((slider, index, smooth = true) => {
    if (!slider) return;
    const itemWidth = getItemWidth(slider);
    slider.scrollTo({ left: itemWidth * index, behavior: smooth ? 'smooth' : 'instant' });
  }, [getItemWidth]);

  const syncActiveIndex = useCallback((slider) => {
    if (!slider) return;
    const itemWidth = getItemWidth(slider);
    if (itemWidth === 0) return;
    const idx = Math.round(slider.scrollLeft / itemWidth);
    setActiveIndex(Math.max(0, Math.min(idx, occasions.length - 1)));
  }, [getItemWidth, occasions.length]);

  const startAutoSlide = useCallback(() => {
    stopAutoSlide();
    if (occasions.length <= 1) return;
    autoSlideTimer.current = setInterval(() => {
      if (isUserInteracting.current) return;
      const slider = desktopSliderRef.current || sliderRef.current;
      if (!slider) return;

      const itemWidth = getItemWidth(slider);
      if (itemWidth === 0) return;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const nextScroll = slider.scrollLeft + itemWidth;

      if (nextScroll >= maxScroll - 4) {
        // Loop back to start
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        slider.scrollTo({ left: nextScroll, behavior: 'smooth' });
        setActiveIndex(prev => Math.min(prev + 1, occasions.length - 1));
      }
    }, AUTO_SLIDE_INTERVAL);
  }, [occasions.length, getItemWidth]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) {
      clearInterval(autoSlideTimer.current);
      autoSlideTimer.current = null;
    }
  }, []);

  const pauseAndResume = useCallback(() => {
    isUserInteracting.current = true;
    stopAutoSlide();
    clearTimeout(pauseAndResume._resumeTimer);
    pauseAndResume._resumeTimer = setTimeout(() => {
      isUserInteracting.current = false;
      startAutoSlide();
    }, 3000);
  }, [startAutoSlide, stopAutoSlide]);

  useEffect(() => {
    startAutoSlide();
    return () => {
      stopAutoSlide();
      clearTimeout(pauseAndResume._resumeTimer);
    };
  }, [startAutoSlide, stopAutoSlide, occasions.length]);

  // ─── Drag logic ───────────────────────────────────────────────────────────

  const beginDrag = useCallback((sliderElement, clientX) => {
    if (!sliderElement) return;
    const rect = sliderElement.getBoundingClientRect();
    dragStateRef.current = {
      slider: sliderElement,
      startX: clientX - rect.left,
      scrollLeft: sliderElement.scrollLeft,
    };
    setHasDragged(false);
    setIsDragging(true);
    pauseAndResume();
  }, [pauseAndResume]);

  const dragSlider = useCallback((clientX) => {
    if (!isDragging) return;
    const { slider, startX, scrollLeft } = dragStateRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const x = clientX - rect.left;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > DRAG_THRESHOLD) setHasDragged(true);
    slider.scrollLeft = scrollLeft - walk;
  }, [isDragging]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    const { slider } = dragStateRef.current;

    setIsDragging(false);
    dragStateRef.current.slider = null;

    // Snap to nearest item
    if (slider) {
      const itemWidth = getItemWidth(slider);
      if (itemWidth > 0) {
        const idx = Math.round(slider.scrollLeft / itemWidth);
        const snapped = Math.max(0, Math.min(idx, occasions.length - 1));
        scrollToIndex(slider, snapped);
        setActiveIndex(snapped);
      }
    }

    setTimeout(() => setHasDragged(false), 0);
  }, [isDragging, getItemWidth, scrollToIndex, occasions.length]);

  // Sync active index on scroll (for free scrolling)
  const handleScroll = useCallback((e) => {
    syncActiveIndex(e.currentTarget);
  }, [syncActiveIndex]);

  // ─── Event handlers ───────────────────────────────────────────────────────

  const handleDesktopMouseDown = (e) => beginDrag(desktopSliderRef.current, e.clientX);
  const handleMobileMouseDown = (e) => beginDrag(sliderRef.current, e.clientX);
  const handleMouseMove = (e) => { if (isDragging) { e.preventDefault(); dragSlider(e.clientX); } };
  const handleTouchStart = (e) => beginDrag(sliderRef.current, e.touches[0].clientX);
  const handleTouchMove = (e) => { if (isDragging) dragSlider(e.touches[0].clientX); };

  // ─── Occasion click ───────────────────────────────────────────────────────

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

  // ─── Dot navigation ───────────────────────────────────────────────────────

  const goToIndex = (idx) => {
    pauseAndResume();
    const slider = desktopSliderRef.current || sliderRef.current;
    scrollToIndex(slider, idx);
    setActiveIndex(idx);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) return <OccasionsSkeleton />;
  if (!occasions.length) return null;

  const sharedSliderStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
  };

  const renderCard = (occasion, isMobile = false) => (
    <div
      key={occasion.id}
      className={`occasion-card shrink-0 cursor-pointer transition-transform duration-300 ${isMobile ? 'active:scale-[0.98]' : ''}`}
      style={isMobile ? { width: 'calc(100vw - 3rem)', maxWidth: '380px', scrollSnapAlign: 'start' } : {}}
      onClick={(e) => {
        if (hasDragged || isDragging) { e.preventDefault(); e.stopPropagation(); return; }
        handleOccasionSelect(occasion);
      }}
    >
      {occasion.image && (
        <div className="image-wrapper overflow-hidden rounded-lg">
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
  );

  return (
    <section className="occasions-section">
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="occasions-section-title fontPoppins">Perfect for Every Occasion</h2>
          <p className="occasions-section-subtitle">Find the right moment to spread joy</p>
        </div>

        {/* ── Desktop Slider ── */}
        <div className="hidden lg:block relative">
          <div
            ref={desktopSliderRef}
            className={`flex gap-6 overflow-x-auto overflow-y-hidden py-4 select-none scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ ...sharedSliderStyle, scrollBehavior: 'auto' }}
            onMouseDown={handleDesktopMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onScroll={handleScroll}
          >
            {occasions.map((occasion) => (
              <div
                key={occasion.id}
                className="occasion-card cursor-pointer shrink-0 transition-transform duration-300 lg:w-[calc(33.33%-1rem)] xl:w-[calc(25%-1.125rem)]"
                onClick={(e) => {
                  if (hasDragged || isDragging) { e.preventDefault(); e.stopPropagation(); return; }
                  handleOccasionSelect(occasion);
                }}
              >
                {occasion.image && (
                  <div className="image-wrapper overflow-hidden rounded-lg">
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

        {/* ── Mobile Slider ── */}
        <div className="lg:hidden relative">
          <div
            ref={sliderRef}
            className={`flex gap-6 overflow-x-auto overflow-y-hidden select-none scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ ...sharedSliderStyle, scrollSnapType: 'x mandatory', scrollBehavior: 'auto' }}
            onMouseDown={handleMobileMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={endDrag}
            onScroll={handleScroll}
          >
            {occasions.map((o) => renderCard(o, true))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const OccasionsSkeleton = () => (
  <section className="occasions-section">
    <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="occasions-section-title fontPoppins">Perfect for Every Occasion</h2>
        <p className="occasions-section-subtitle">Find the right moment to spread joy</p>
      </div>
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
      <div className="lg:hidden relative">
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="occasion-card shrink-0" style={{ width: 'calc(100vw - 3rem)', maxWidth: '380px' }}>
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

export default OccasionsSection;