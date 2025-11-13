"use client"
import React, { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, FileText, Search } from 'lucide-react';

const FAQComponent = () => {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [expandedItems, setExpandedItems] = useState({ 'Getting Started-0': true });
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'Getting Started', color: 'bg-gradient-to-r from-pink-500 to-orange-400' },
    { name: 'Countries and Brands'  },
    { name: 'Buying a Gift Card (Individual)', color: 'bg-white' },
    { name: 'Personalization & Delivery', color: 'bg-white' },
    { name: 'Redemption & Balance', color: 'bg-white' },
    { name: 'Orders, Changes & Refunds', color: 'bg-white' },
    { name: 'Payments & Security', color: 'bg-white' },
    { name: 'Technical Issues', color: 'bg-white' }
  ];

  const faqData = {
    'Getting Started': [
      {
        question: "What is Wove Gifts?",
        answer: "Wove is a digital gifting platform that lets you send branded gift cards instantly via WhatsApp, email, or print—locally and internationally."
      },
      {
        question: "How does it work?",
        answer: "It's simple! Choose a gift card from our selection of brands, personalize it with your message, select delivery method, and complete your purchase. The recipient will receive their gift card via email or WhatsApp and can redeem it at the chosen brand."
      },
      {
        question: "Who can use Wove?",
        answer: "Wove Gifts is available to anyone looking to send thoughtful gifts. Whether you're an individual sending a personal gift or a business looking for corporate gifting solutions, Wove Gifts makes it easy and convenient."
      },
      {
        question: "Do I need an account?",
        answer: "While you can browse our gift cards without an account, creating one allows you to track your orders, save favorite brands, access order history, and enjoy a more personalized experience."
      }
    ],
    'Countries and Brands': [],
    'Buying a Gift Card (Individual)': [],
    'Personalization & Delivery': [],
    'Redemption & Balance': [],
    'Orders, Changes & Refunds': [],
    'Payments & Security': [],
    'Technical Issues': []
  };

  const toggleExpand = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter FAQs based on search term
  const filteredFaqs = Object.values(faqData).flat().filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const filteredCategories = categories.filter(category =>
  //   category.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
      <div
        className="p-10 py-30"
        style={{
          borderRadius: '0 0 50px 50px',
          background: 'linear-gradient(126deg, #FBDCE3 31.7%, #FDE6DB 87.04%)',
        }}
      >
        <h1 className="text-center text-2xl md:text-3xl font-extrabold text-black">
          Frequently Asked Questions
        </h1>
        <p className="mt-7 text-center text-sm sm:text-base text-[#4A4A4A] max-w-xl mx-auto">
          Find answers to common questions about Wove Gifts, from getting started to bulk orders and everything in between.
        </p>
      </div>
     
      {/* Search Bar */}
      <div className="max-w-150 mx-auto px-4 -mt-6 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs (e.g., refund, WhatsApp, bulk CSV)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}

           className="w-full pl-12 pr-4 py-3.5 rounded-lg focus:outline-none shadow-sm"
            style={{ 
              backgroundColor: 'white',
              color:'black',
              borderRadius: '25px',
              border: '2px solid #FFB4B4',
            }}
          />
        </div>
      </div>

    <div className="min-h-screen bg-gray-50">
      {/* Category Pills */}
      <div className="bg-white border-b ml-[150px]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-7">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2 relative ${
                  activeCategory === category.name
                    ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white border-transparent shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {category.name}
                {category.badge && activeCategory === category.name && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                      {category.badge.flag}
                    </span>
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                      {category.badge.hug}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">
          {activeCategory}
        </h1>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {faqData[activeCategory] && faqData[activeCategory].map((faq, index) => {
            const key = `${activeCategory}-${index}`;
            const isExpanded = expandedItems[key];
            
            return (
              <div key={key} className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#FFB4B4] transition-colors duration-200 overflow-hidden">
                <button
                  onClick={() => toggleExpand(activeCategory, index)}
                  className="w-full p-6 flex justify-between items-start hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-left font-semibold text-gray-900 text-lg pr-4">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200 ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}>
                    {isExpanded ? (
                      <div className="w-5 h-0.5 bg-[#FFB4B4]"></div>
                    ) : (
                      <>
                        <div className="absolute w-5 h-0.5 bg-[#FFB4B4]"></div>
                        <div className="absolute w-0.5 h-5 bg-[#FFB4B4]"></div>
                      </>
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="bg-pink-50 rounded-3xl p-12 text-center border-2 border-[#FFB4B4]">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Didn't find what you need?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Our support team is here to help. Reach out through your preferred channel or check your order history.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-lg transition-shadow duration-200 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Support
            </button>
            <button className="bg-green-500 text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-lg transition-shadow duration-200 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              WhatsApp Support
            </button>
          </div>
        </div>
      </div>

     

        {/* Newsletter Section */}
        
      </div>
    // </div>
  );
};

export default FAQComponent;