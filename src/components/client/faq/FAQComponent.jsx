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
          <h1 className="text-[35px] font-semibold text-center mb-8 sm:mb-12 fontPoppins">
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
                    <span className="text-left font-semibold text-[#1A1A1A] text-[18px] sm:text-lg pr-4">
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
                      <p className="text-[#4A4A4A] font-medium leading-relaxed text-base">
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
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.666 4.33337H4.33268C3.14102 4.33337 2.16602 5.30837 2.16602 6.50004V19.5C2.16602 20.6917 3.14102 21.6667 4.33268 21.6667H21.666C22.8577 21.6667 23.8327 20.6917 23.8327 19.5V6.50004C23.8327 5.30837 22.8577 4.33337 21.666 4.33337ZM21.2327 8.93754L14.1477 13.3684C13.4435 13.8125 12.5552 13.8125 11.851 13.3684L4.76602 8.93754C4.65739 8.87656 4.56226 8.79417 4.4864 8.69537C4.41053 8.59656 4.3555 8.48338 4.32464 8.36269C4.29378 8.242 4.28773 8.1163 4.30685 7.99321C4.32598 7.87011 4.36988 7.75217 4.4359 7.64653C4.50193 7.54089 4.5887 7.44975 4.69097 7.37862C4.79324 7.30749 4.90888 7.25784 5.03089 7.2327C5.1529 7.20755 5.27874 7.20742 5.4008 7.23232C5.52286 7.25721 5.6386 7.30662 5.74102 7.37754L12.9993 11.9167L20.2577 7.37754C20.3601 7.30662 20.4758 7.25721 20.5979 7.23232C20.72 7.20742 20.8458 7.20755 20.9678 7.2327C21.0898 7.25784 21.2055 7.30749 21.3077 7.37862C21.41 7.44975 21.4968 7.54089 21.5628 7.64653C21.6288 7.75217 21.6727 7.87011 21.6918 7.99321C21.711 8.1163 21.7049 8.242 21.6741 8.36269C21.6432 8.48338 21.5882 8.59656 21.5123 8.69537C21.4364 8.79417 21.3413 8.87656 21.2327 8.93754Z" fill="white" />
                  </svg>

                  Email Support
                </button>

                <button className="bg-green-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:shadow-lg transition-shadow duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1187_1600)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M13.6264 12.2858C13.21 12.456 12.944 13.1078 12.6742 13.4408C12.5358 13.6114 12.3708 13.638 12.1581 13.5525C10.5954 12.9299 9.39739 11.8871 8.535 10.4489C8.38891 10.2259 8.41512 10.0497 8.59129 9.84261C8.85168 9.53581 9.1791 9.18733 9.24957 8.77397C9.40598 7.8596 8.21059 5.02323 6.63192 6.30843C2.08926 10.0102 14.2099 19.8281 16.3974 14.518C17.0162 13.0128 14.3164 12.0031 13.6264 12.2858ZM11.0001 20.0782C9.39352 20.0782 7.8127 19.6511 6.42868 18.8424C6.20653 18.7122 5.93797 18.6778 5.68961 18.7453L2.68223 19.5707L3.72981 17.2629C3.79987 17.1088 3.82795 16.9389 3.8112 16.7705C3.79445 16.6021 3.73346 16.4411 3.63442 16.3038C2.51379 14.7505 1.92125 12.9166 1.92125 10.9998C1.92125 5.99347 5.99383 1.92089 11.0001 1.92089C16.0064 1.92089 20.0786 5.99347 20.0786 10.9998C20.0786 16.0056 16.006 20.0782 11.0001 20.0782ZM11.0001 -0.000244141C4.93465 -0.000244141 0.000120525 4.93429 0.000120525 10.9998C0.000120525 13.1336 0.60598 15.1828 1.75711 16.9612L0.086058 20.6415C0.0105473 20.8077 -0.0160567 20.992 0.00935913 21.1729C0.034775 21.3537 0.111159 21.5235 0.229574 21.6625C0.319886 21.7682 0.432021 21.853 0.558268 21.9113C0.684514 21.9695 0.821875 21.9997 0.960902 21.9998C1.58051 21.9998 4.95914 20.938 5.81895 20.7021C7.40836 21.5525 9.19114 21.9998 11.0001 21.9998C17.0652 21.9998 22.0001 17.0648 22.0001 10.9998C22.0001 4.93429 17.0652 -0.000244141 11.0001 -0.000244141Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1187_1600">
                        <rect width="22" height="22" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

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