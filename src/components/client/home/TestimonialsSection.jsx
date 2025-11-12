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
          <h2 className="testimonials-title">Loved by Gift Senders</h2>
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
                          <span key={i} className="star">⭐</span>
                        ))}
                      </div>
                      <h3 className="testimonial-text">{testimonial.text}</h3>
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