"use client"
import React, { useState, useEffect } from 'react';

const TestimonialsSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  
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
      author: "Michael P."
    },
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
      author: "Michael P."
    }
  ];

  const totalSlides = Math.ceil(testimonials.length / 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const getCurrentTestimonials = () => {
    const startIndex = activeSlide * 4;
    return testimonials.slice(startIndex, startIndex + 4);
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title fontPoppins">Loved by Gift Senders</h2>
          <p className="testimonials-subtitle">Real stories from real people spreading joy</p>
        </div>

        <div className="testimonials-slider-wrapper">
          <div 
            className="testimonials-slider"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="testimonials-slide">
                <div className="testimonials-grid">
                  {testimonials.slice(slideIndex * 4, slideIndex * 4 + 4).map((testimonial, index) => (
                    <div key={index} className="testimonial-card">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="star"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.46955 0.565775C6.83319 -0.188597 7.90753 -0.188597 8.27117 0.565775L9.74491 3.6231C9.89068 3.92551 10.1785 4.13459 10.5111 4.17978L13.8742 4.63663C14.704 4.74935 15.036 5.77111 14.4309 6.35006L11.9787 8.69644C11.7361 8.92852 11.6262 9.26683 11.686 9.59717L12.2908 12.9368C12.44 13.7609 11.5708 14.3924 10.8332 13.9958L7.8439 12.3886C7.54822 12.2296 7.1925 12.2296 6.89682 12.3886L3.90749 13.9958C3.16989 14.3924 2.30073 13.7609 2.44995 12.9368L3.05472 9.59717C3.11454 9.26683 3.00462 8.92852 2.76206 8.69644L0.309779 6.35006C-0.295302 5.77111 0.0366881 4.74935 0.866508 4.63663L4.22961 4.17978C4.56226 4.13459 4.85004 3.92551 4.99581 3.6231L6.46955 0.565775Z" fill="#FDA84F"/>
                          </svg>
                          </span>
                        ))}
                      </div>
                      <h3 className="testimonial-text fontPoppins">{`"${testimonial.text}"`}</h3>
                      <p className="testimonial-description">{testimonial.description}</p>
                      <p className="testimonial-author">-{testimonial.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;