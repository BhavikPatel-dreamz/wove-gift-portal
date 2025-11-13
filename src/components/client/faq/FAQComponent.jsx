"use client"
import React, { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, FileText, Search } from 'lucide-react';

const FAQComponent = () => {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [expandedItems, setExpandedItems] = useState({ 'Getting Started-0': true });
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'Getting Started', color: 'bg-gradient-to-r from-pink-500 to-orange-400' },
    { name: 'Countries and Brands' },
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
      <div
        className="p-6 sm:p-10 py-25 sm:py-30"
        style={{
          borderRadius: '0 0 30px 30px',
          background: 'linear-gradient(126deg, #FBDCE3 31.7%, #FDE6DB 87.04%)',
        }}
      >
        <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-black px-4">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 sm:mt-7 text-center text-sm sm:text-base text-[#4A4A4A] max-w-xl mx-auto px-4">
          Find answers to common questions about Wove Gifts, from getting started to bulk orders and everything in between.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-lg focus:outline-none shadow-sm text-sm sm:text-base"
            style={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '25px',
              border: '2px solid #FFB4B4',
            }}
          />
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        {/* Category Pills */}
        <div className="bg-white px-4 mt-5">
          <div className="max-w-5xl mx-auto py-6">
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
              {categories.map((category, index) => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-200 border-2 relative ${
                    // Make first 4 buttons larger (first row)
                    index < 4 ? 'text-xs sm:text-base' : 'text-[11px] sm:text-sm'
                    } ${activeCategory === category.name
                      ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white border-transparent shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            {activeCategory}
          </h1>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            {faqData[activeCategory] && faqData[activeCategory].map((faq, index) => {
              const key = `${activeCategory}-${index}`;
              const isExpanded = expandedItems[key];

              return (
                <div key={key} className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-[#FFB4B4] transition-colors duration-200 overflow-hidden">
                  <button
                    onClick={() => toggleExpand(activeCategory, index)}
                    className="w-full p-4 sm:p-6 flex justify-between items-start hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-left font-semibold text-gray-900 text-base sm:text-lg pr-4">
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''
                      }`}>
                      {isExpanded ? (
                        <div className="w-4 sm:w-5 h-0.5 bg-[#FFB4B4]"></div>
                      ) : (
                        <>
                          <div className="absolute w-4 sm:w-5 h-0.5 bg-[#FFB4B4]"></div>
                          <div className="absolute w-0.5 h-4 sm:h-5 bg-[#FFB4B4]"></div>
                        </>
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative max-w-4xl mx-auto rounded-2xl sm:rounded-3xl p-[1px] bg-gradient-to-r from-[#ED457D] to-[#FA8F42]">
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF1F4] to-[#FFF5EF] p-6 sm:p-12 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                Didn't find what you need?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto px-2">
                Our support team is here to help. Reach out through your preferred channel or check your order history.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                <button className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:shadow-lg transition-shadow duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  Email Support
                </button>

                <button className="bg-green-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:shadow-lg transition-shadow duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  WhatsApp Support
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default FAQComponent;