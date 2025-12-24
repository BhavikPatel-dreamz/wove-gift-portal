import React from 'react';
import { Gift, Sparkles, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import DashboardWishlistIcon from '@/icons/DashboardWishlistIcon';
import DashboardRingIcon from '@/icons/DashboardRingIcon';
import DashboardEmojiIcon from '@/icons/DashboardEmojiIcon';
import DashboardPartyPopper from '@/icons/DashboardPartyPopper';
import DashboardGiftIcon from '@/icons/DashboardGiftIcon';
import DashboardConfettiBall from '@/icons/DashboardConfettiBall';

const HeroSection = () => {
  return (
    <section className="hero-section">

      {/* Decorative Emoji Icons matching the design */}
      <div className="emoji-float animate-float-1 rotate-[-21.48deg]" style={{ top: '20%', left: '12%', fontSize: '3.5rem', rotate: '21.48 deg' }}>
        <DashboardWishlistIcon />
      </div>
      <div className="emoji-float animate-float-2 rotate-[19.52deg]" style={{ top: '45%', left: '6%', fontSize: '3.5rem' }}>
        <DashboardRingIcon />
      </div>
      <div className="emoji-float animate-float-3 rotate-[-19.52deg]" style={{ top: '20%', right: '25%', fontSize: '3.5rem' }}>
      <DashboardPartyPopper/>
      </div>
      <div className="emoji-float animate-float-4 rotate-[-19.52deg]" style={{ top: '45%', right: '15%', fontSize: '3.5rem' }}>
        <DashboardConfettiBall/>
      </div>
      <div className="emoji-float animate-float-5 rotate-[19.52deg]" style={{ bottom: '15%', left: '20%', fontSize: '3.5rem' }}>
        <DashboardEmojiIcon/>
      </div>
      <div className="emoji-float animate-float-6 rotate-[-26.31deg]" style={{ bottom: '15%', right: '25%', fontSize: '3.5rem' }}>
        <DashboardGiftIcon/>
      </div>


      <div className="max-w-4xl mx-auto text-center px-4 relative z-10 py-10 pt-15">

        {/* Main Heading */}
        <h1 className="hero-heading">
          <span className="hero-heading-dark">Turn Every Day</span>
          <span className="hero-heading-pink">Into a Celebration</span>
        </h1>

        {/* Subheading */}
        <p className="hero-subheading font-inter" style={{ marginTop: '1.5rem' }}>
          Choose from 1000+ brands, personalize your card,
        </p>
        <p className="hero-subheading font-inter" style={{ marginBottom: '0' }}>
          and deliver joy instantly.
        </p>

        {/* CTA Button */}
        <Link href="/gift">
          <button className="hero-cta font-inter">
            Send Gift
          </button>
        </Link>

        {/* Trust Badge */}
        <div className="trust-badge">
          <div className="trust-icon">
            <Shield size={12} color="white" />
          </div>
          <span className='font-inter'>Trusted by 1M+ customers worldwide</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;