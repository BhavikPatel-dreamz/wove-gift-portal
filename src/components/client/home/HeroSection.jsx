import React from 'react';
import { Gift, Sparkles, Shield, Globe } from 'lucide-react';

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

      <div className="max-w-4xl mx-auto text-center px-4 relative z-10" style={{ paddingTop: '1rem' }}>
        
        {/* Main Heading */}
        <h1 className="hero-heading">
          <span className="hero-heading-dark">Turn Every Day</span>
          <span className="hero-heading-pink">Into a Celebration</span>
        </h1>

        {/* Subheading */}
        <p className="hero-subheading" style={{ marginTop: '1.5rem' }}>
          Choose from 1000+ brands, personalize your card,
        </p>
        <p className="hero-subheading" style={{ marginBottom: '0' }}>
          and deliver joy instantly.
        </p>

        {/* CTA Button */}
        <button className="hero-cta">
          Start Gifting
        </button>

        {/* Trust Badge */}
        <div className="trust-badge">
          <div className="trust-icon">
            <Shield size={12} color="white" />
          </div>
          <span>Trusted by 1M+ customers worldwide</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;