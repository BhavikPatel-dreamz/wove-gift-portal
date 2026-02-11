"use client"
import React, { useState, useEffect, useRef } from 'react';

const TestimonialsSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const sliderRef = useRef(null);
  
  const testimonials = [
    {
      text: "Beautiful Cards.",
      description: "Best gifting experience ever. The card designs are beautiful! 🌸",
      author: "Michael P."
    },
    {
      text: "Never miss a moment",
      description: "Saved me when I forgot my anniversary. Wife was so happy!",
      author: "Thabo K."
    },
    {
      text: "Make them cry happy tears",
      description: "I sent a gift card in 2 minutes and she cried happy tears! 😊💕",
      author: "Naledi R."
    },
    {
      text: "Still feels personal.",
      description: "Perfect for last-minute gifts! My mom loved the personalized message 🎉",
      author: "Sarah L."
    },
    {
      text: "Quick and Easy",
      description: "Best gifting experience ever. The card designs are beautiful! 🌸",
      author: "David M."
    },
    {
      text: "Life Saver",
      description: "Saved me when I forgot my anniversary. Wife was so happy!",
      author: "James K."
    },
    {
      text: "Emotional Moments",
      description: "I sent a gift card in 2 minutes and she cried happy tears! 😊💕",
      author: "Emma R."
    },
    {
      text: "Highly Recommended",
      description: "Perfect for last-minute gifts! My mom loved the personalized message 🎉",
      author: "Lisa P."
    }
  ];

  const totalSlides = isMobile 
    ? testimonials.length 
    : isTablet 
    ? Math.ceil(testimonials.length / 2) 
    : Math.ceil(testimonials.length / 4);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 599);
      setIsTablet(width >= 600 && width <= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobile && !isTablet) {
      const timer = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % totalSlides);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [totalSlides, isMobile, isTablet]);

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const handleDragStart = (e) => {
    if (!isMobile && !isTablet) return;
    setIsDragging(true);
    setStartX(e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging || (!isMobile && !isTablet)) return;
    const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    setCurrentX(x - startX);
  };

  const handleDragEnd = () => {
    if (!isDragging || (!isMobile && !isTablet)) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (currentX > threshold && activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    } else if (currentX < -threshold && activeSlide < totalSlides - 1) {
      setActiveSlide(activeSlide + 1);
    }
    
    setCurrentX(0);
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Loved by Gift Senders</h2>
          <p style={styles.subtitle}>Real stories from real people spreading joy</p>
        </div>

        <div style={styles.sliderWrapper}>
          <div 
            ref={sliderRef}
            style={{ 
              ...styles.slider,
              transform: `translateX(calc(-${activeSlide * 100}% + ${isDragging ? currentX : 0}px))`,
              transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {isMobile ? (
              testimonials.map((testimonial, index) => (
                <div key={index} style={styles.slide}>
                  <div style={styles.gridMobile}>
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                </div>
              ))
            ) : isTablet ? (
              Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} style={styles.slide}>
                  <div style={styles.gridTablet}>
                    {testimonials.slice(slideIndex * 2, slideIndex * 2 + 2).map((testimonial, index) => (
                      <TestimonialCard key={index} testimonial={testimonial} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} style={styles.slide}>
                  <div style={styles.gridDesktop}>
                    {testimonials.slice(slideIndex * 4, slideIndex * 4 + 4).map((testimonial, index) => (
                      <TestimonialCard key={index} testimonial={testimonial} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.dot,
                ...(index === activeSlide ? styles.dotActive : {})
              }}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }) => (
  <div style={styles.card}>
    <div style={styles.stars}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={styles.star}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.46955 0.565775C6.83319 -0.188597 7.90753 -0.188597 8.27117 0.565775L9.74491 3.6231C9.89068 3.92551 10.1785 4.13459 10.5111 4.17978L13.8742 4.63663C14.704 4.74935 15.036 5.77111 14.4309 6.35006L11.9787 8.69644C11.7361 8.92852 11.6262 9.26683 11.686 9.59717L12.2908 12.9368C12.44 13.7609 11.5708 14.3924 10.8332 13.9958L7.8439 12.3886C7.54822 12.2296 7.1925 12.2296 6.89682 12.3886L3.90749 13.9958C3.16989 14.3924 2.30073 13.7609 2.44995 12.9368L3.05472 9.59717C3.11454 9.26683 3.00462 8.92852 2.76206 8.69644L0.309779 6.35006C-0.295302 5.77111 0.0366881 4.74935 0.866508 4.63663L4.22961 4.17978C4.56226 4.13459 4.85004 3.92551 4.99581 3.6231L6.46955 0.565775Z" fill="#FDA84F"/>
          </svg>
        </span>
      ))}
    </div>
    <h3 style={styles.cardText}>{`"${testimonial.text}"`}</h3>
    <p style={styles.cardDescription}>{testimonial.description}</p>
    <p style={styles.cardAuthor}>-{testimonial.author}</p>
  </div>
);

const styles = {
  section: {
    background: 'linear-gradient(180deg, rgba(221, 153, 255, 0.2) 0%, rgba(221, 153, 255, 0) 100%)',
    padding: '60px 0 0px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    overflow: 'hidden',
  },
  container: {
    margin: '0 auto',
    padding: '0 20px',
    minWidth: '320px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  title: {
    fontSize: 'clamp(28px, 5vw, 40px)',
    fontWeight: 600,
    color: '#1a1a1a',
    margin: '0 0 12px 0',
    letterSpacing: '-0.02em',
    fontFamily: 'Poppins, sans-serif',
  },
  subtitle: {
    fontSize: 'clamp(14px, 3vw, 18px)',
    color: '#4a4a4a',
    fontWeight: 500,
    margin: 0,
  },
  sliderWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '90%',
    margin: '0 auto',
    overflow: 'hidden',
  },
  slider: {
    display: 'flex',
    willChange: 'transform',
  },
  slide: {
    width: '100%',
    flexShrink: 0,
    paddingBottom: '10px',
  },
  gridDesktop: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '9px',
    maxWidth: '1160px',
    margin: '0 auto',
    padding: 0,
  },
  gridTablet: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '9px',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 20px',
    justifyItems: 'center',
  },
  gridMobile: {
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 10px',
  },
  card: {
    width: '100%',
    maxWidth: '332px',
    height: '229px',
    padding: '32px 24px',
    borderRadius: '20px',
    background: '#FFF',
    boxShadow: '0 4px 10px 0 rgba(221, 153, 255, 0.10)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    margin: '0 auto',
  },
  stars: {
    display: 'flex',
    gap: '4px',
    marginBottom: '4px',
  },
  star: {
    fontSize: '16px',
    lineHeight: 1,
  },
  cardText: {
    fontSize: 'clamp(16px, 3vw, 20px)',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
    lineHeight: 1.4,
    fontFamily: 'Poppins, sans-serif',
  },
  cardDescription: {
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    color: '#4a4a4a',
    margin: 0,
    lineHeight: 1.5,
  },
  cardAuthor: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontWeight: 500,
    color: '#1A1A1A',
    margin: 0,
    fontStyle: 'italic',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '36px',
    flexWrap: 'wrap',
    padding: '0 20px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#d1c4e9',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.3s ease',
  },
  dotActive: {
    background: '#e91e63',
    borderRadius: '4px',
  },
};

export default TestimonialsSection;