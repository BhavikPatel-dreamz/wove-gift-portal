"use client"
import React, { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, FileText, Search } from 'lucide-react';

const FAQComponent = () => {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'Getting Started',
    'Countries & Brands', 
    'Buying a Gift Card (Individual)',
    'Personalization & Delivery',
    'Redemption & Balance',
    'Orders, Changes & Refunds',
    'Payments & Security',
    'Bulk & Corporate Gifting',
    'Technical Issues'
  ];

  const faqData = {
    'Getting Started': [
      {
        question: "What is Wave Gifts?",
        answer: "Wave Gifts is South Africa's #1 Gift Card Platform, making gifting magical and smart at a time. We offer a wide range of gift cards from popular brands that you can purchase, personalize, and send to your loved ones."
      },
      {
        question: "How does it work?",
        answer: "It's simple! Choose a gift card from our selection of brands, personalize it with your message, select delivery method, and complete your purchase. The recipient will receive their gift card via email or WhatsApp and can redeem it at the chosen brand."
      },
      {
        question: "Who can use Wave?",
        answer: "Wave Gifts is available to anyone looking to send thoughtful gifts. Whether you're an individual sending a personal gift or a business looking for corporate gifting solutions, Wave Gifts makes it easy and convenient."
      },
      {
        question: "Do I need an account?",
        answer: "While you can browse our gift cards without an account, creating one allows you to track your orders, save favorite brands, access order history, and enjoy a more personalized experience."
      }
    ]
  };

  const toggleExpand = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3E7' }}>
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold mb-4" style={{ 
          background: 'linear-gradient(135deg, #FF6B35, #E55A2B)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Frequently Asked Questions
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#8B4513' }}>
          Find answers to common questions about Wave Gifts, from getting started to bulk orders and everything in between.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#8B4513' }} />
          <input
            type="text"
            placeholder="Search FAQs (e.g. refund, WhatsApp, bulk CSV)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
            style={{ 
              borderColor: '#EBE7D4',
              backgroundColor: 'white',
              focusBorderColor: '#FF6B35'
            }}
            onFocus={(e) => e.target.style.borderColor = '#FF6B35'}
            onBlur={(e) => e.target.style.borderColor = '#EBE7D4'}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 mb-8">
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {filteredCategories.map((category, index) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category
                  ? 'text-white shadow-lg transform scale-105'
                  : 'text-white hover:scale-105 hover:shadow-md'
              }`}
              style={{
                backgroundColor: activeCategory === category ? '#FF6B35' : '#FF8A5C'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#2D5A3D' }}>
            {activeCategory}
          </h2>
          
          <div className="space-y-4">
            {(faqData[activeCategory] || []).map((faq, index) => {
              const isExpanded = expandedItems[`${activeCategory}-${index}`];
              return (
                <div
                  key={index}
                  className="rounded-lg border shadow-sm overflow-hidden"
                  style={{ 
                    backgroundColor: 'white',
                    borderColor: '#EBE7D4'
                  }}
                >
                  <button
                    onClick={() => toggleExpand(activeCategory, index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#F5F3E7' }}
                  >
                    <span className="font-medium text-lg" style={{ color: '#2D5A3D' }}>
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      style={{ color: '#FF6B35' }}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 py-4 border-t" style={{ borderColor: '#EBE7D4' }}>
                      <p style={{ color: '#8B4513' }} className="leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#FF6B35' }}>
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#2D5A3D' }}>
            Didn't find what you need?
          </h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: '#8B4513' }}>
            Our support team is here to help. Reach out through your preferred channel or check your order history.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#FF6B35' }}>
              <Mail className="w-5 h-5" />
              Email Support
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity border-2" style={{ 
              color: '#FF6B35',
              borderColor: '#FF6B35',
              backgroundColor: 'transparent'
            }}>
              <MessageCircle className="w-5 h-5" />
              WhatsApp Support
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity border-2" style={{ 
              color: '#FF6B35',
              borderColor: '#FF6B35',
              backgroundColor: 'transparent'
            }}>
              <FileText className="w-5 h-5" />
              View Order History
            </button>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="text-center p-8 rounded-lg" style={{ backgroundColor: 'white' }}>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#2D5A3D' }}>
            Stay in the loop
          </h3>
          <p className="mb-6" style={{ color: '#8B4513' }}>
            Get updates and special gifting moments
          </p>
          
          <div className="flex max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none"
              style={{ 
                borderColor: '#EBE7D4',
                backgroundColor: '#F5F3E7'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF6B35'}
              onBlur={(e) => e.target.style.borderColor = '#EBE7D4'}
            />
            <button 
              className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#FF6B35' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQComponent;