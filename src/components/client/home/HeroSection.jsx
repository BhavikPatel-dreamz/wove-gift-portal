"use client"
import React, { useEffect } from 'react';
import { Gift, Sparkles, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import DashboardWishlistIcon from '@/icons/DashboardWishlistIcon';
import DashboardRingIcon from '@/icons/DashboardRingIcon';
import DashboardEmojiIcon from '@/icons/DashboardEmojiIcon';
import DashboardPartyPopper from '@/icons/DashboardPartyPopper';
import DashboardGiftIcon from '@/icons/DashboardGiftIcon';
import DashboardConfettiBall from '@/icons/DashboardConfettiBall';
import { useDispatch } from 'react-redux';
import { resetFlow, setCurrentStep, clearCsvFileData } from '@/redux/giftFlowSlice';

const HeroSection = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(resetFlow());
    dispatch(setCurrentStep(1));
    dispatch(clearCsvFileData());
  };


  useEffect(() => {
    dispatch(resetFlow());
    dispatch(setCurrentStep(1));
    dispatch(clearCsvFileData());
  }, []);


  return (
    <section className="hero-section">

      {/* Decorative Emoji Icons matching the design */}
      <div className="hero-effect">
        <div className="emoji-float animate-float-1 rotate-[-21.48deg] hidden sm:block" style={{ top: '20%', left: '12%', fontSize: '3.5rem', rotate: '21.48 deg' }}>
          <DashboardWishlistIcon />
        </div>
        <div className="emoji-float animate-float-2 rotate-[19.52deg] hidden sm:block" style={{ top: '45%', left: '6%', fontSize: '3.5rem' }}>
          <DashboardRingIcon />
        </div>
        <div className="emoji-float animate-float-3 rotate-[-19.52deg] hidden sm:block" style={{ top: '20%', right: '25%', fontSize: '3.5rem' }}>
          <DashboardPartyPopper />
        </div>
        <div className="emoji-float animate-float-4 rotate-[-19.52deg] hidden sm:block" style={{ top: '45%', right: '15%', fontSize: '3.5rem' }}>
          <DashboardConfettiBall />
        </div>
        <div className="emoji-float animate-float-5 rotate-[19.52deg] hidden sm:block" style={{ bottom: '15%', left: '20%', fontSize: '3.5rem' }}>
          <DashboardEmojiIcon />
        </div>
        <div className="emoji-float animate-float-6 rotate-[-26.31deg] hidden sm:block" style={{ bottom: '15%', right: '25%', fontSize: '3.5rem' }}>
          <DashboardGiftIcon />
        </div>


        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10 py-6 sm:py-10 lg:py-12">

          {/* Main Heading */}
          <h1 className="hero-heading">
            <span className="hero-heading-dark">Turn Every Day</span>
            <span className="hero-heading-pink">Into a Celebration</span>
          </h1>

          {/* Subheading */}
          <p className="hero-subheading font-inter px-2 sm:px-4 md:px-0 mt-4 sm:mt-6">
            Choose from 1000+ brands, personalize your card,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            and deliver joy instantly.
          </p>

          {/* CTA Button */}
          <Link href="/gift">
            <button className="group flex justify-center items-center hero-cta font-inter w-full sm:w-auto max-w-xs sm:max-w-none mx-auto mt-6 sm:mt-8" onClick={handleClick}>
              Start Gifting
              <span className="ml-2 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:scale-110"><svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white"></path></svg>
              </span>
            </button>
          </Link>

          {/* Trust Badge */}
          <div className="trust-badge flex flex-wrap items-center justify-center gap-2 mt-6 sm:mt-8">
            <div className="trust-icon shrink-0">
              <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="11" fill="#497D54" />
                <path
                  d="M7 11.2L9.5 13.7L15 8.2"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="font-inter text-xs sm:text-sm md:text-base">Trusted by 500+ Companies</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;