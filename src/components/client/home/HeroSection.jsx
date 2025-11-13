import React from 'react';
import { Gift, Sparkles, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="hero-section">

      {/* Decorative Emoji Icons with Figma-matched positioning */}
      <div className="emoji-float animate-float-1" style={{ top: '15%', left: '18%', fontSize: '3.5rem' }}>
        ❤️
      </div>
      <div className="emoji-float animate-float-2" style={{ top: '35%', left: '8%', fontSize: '4rem' }}>
        💍
      </div>
      <div className="emoji-float emoji-float-lg animate-float-3" style={{ top: '20%', right: '15%', fontSize: '4rem' }}>
        🎉
      </div>
      <div className="emoji-float animate-float-4" style={{ top: '50%', right: '8%', fontSize: '4rem' }}>
        🎁
      </div>

      {/* New emojis added below */}
      <div className="emoji-float animate-float-5" style={{ bottom: '15%', left: '20%', fontSize: '3.8rem' }}>
        💫
      </div>
      <div className="emoji-float animate-float-6" style={{ bottom: '10%', right: '25%', fontSize: '4rem' }}>
        🌸
      </div>
      <div className="emoji-float animate-float-6" style={{ top: '20%', right: '30%', fontSize: '3.5rem' }}>
        💖
      </div>
      <div className="emoji-float animate-float-6" style={{ bottom: '20%', left: '5%', fontSize: '3.8rem' }}>
        🎀
      </div>


      <div className="max-w-4xl mx-auto text-center px-4 relative z-10 py-10">

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
            Start Gifting
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