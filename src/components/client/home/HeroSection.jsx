"use client"
import React from 'react';
import { Gift, Sparkles, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import DashboardWishlistIcon from '@/icons/DashboardWishlistIcon';
import DashboardRingIcon from '@/icons/DashboardRingIcon';
import DashboardEmojiIcon from '@/icons/DashboardEmojiIcon';
import DashboardPartyPopper from '@/icons/DashboardPartyPopper';
import DashboardGiftIcon from '@/icons/DashboardGiftIcon';
import DashboardConfettiBall from '@/icons/DashboardConfettiBall';
import { useDispatch } from 'react-redux';
import { resetFlow, setCurrentStep } from '@/redux/giftFlowSlice';

const HeroSection = () => {
    const dispatch = useDispatch();
  
 const handleClick = () => {
    dispatch(resetFlow());
    dispatch(setCurrentStep(1));
  };


  return (
    <section className="hero-section">

      {/* Decorative Emoji Icons matching the design */}
      <div className="emoji-float animate-float-1 rotate-[-21.48deg] hidden sm:block" style={{ top: '20%', left: '12%', fontSize: '3.5rem', rotate: '21.48 deg' }}>
        <DashboardWishlistIcon />
      </div>
      <div className="emoji-float animate-float-2 rotate-[19.52deg] hidden sm:block" style={{ top: '45%', left: '6%', fontSize: '3.5rem' }}>
        <DashboardRingIcon />
      </div>
      <div className="emoji-float animate-float-3 rotate-[-19.52deg] hidden sm:block" style={{ top: '20%', right: '25%', fontSize: '3.5rem' }}>
      <DashboardPartyPopper/>
      </div>
      <div className="emoji-float animate-float-4 rotate-[-19.52deg] hidden sm:block" style={{ top: '45%', right: '15%', fontSize: '3.5rem' }}>
        <DashboardConfettiBall/>
      </div>
      <div className="emoji-float animate-float-5 rotate-[19.52deg] hidden sm:block" style={{ bottom: '15%', left: '20%', fontSize: '3.5rem' }}>
        <DashboardEmojiIcon/>
      </div>
      <div className="emoji-float animate-float-6 rotate-[-26.31deg] hidden sm:block" style={{ bottom: '15%', right: '25%', fontSize: '3.5rem' }}>
        <DashboardGiftIcon/>
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
          <button className="hero-cta font-inter w-full sm:w-auto max-w-xs sm:max-w-none mx-auto mt-6 sm:mt-8" onClick={handleClick}>
            Send Gift
          </button>
        </Link>

        {/* Trust Badge */}
        <div className="trust-badge flex flex-wrap items-center justify-center gap-2 mt-6 sm:mt-8">
          <div className="trust-icon flex-shrink-0">
            <Shield size={12} color="white" />
          </div>
          <span className="font-inter text-xs sm:text-sm md:text-base">Trusted by 1M+ customers worldwide</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;