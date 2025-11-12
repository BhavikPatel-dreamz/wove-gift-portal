"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, CreditCard, Package } from 'lucide-react';

const ActionSelectionCards = (props) => {
  const router = useRouter();
  const { 
    title = "Choose Your Action",
    subtitle = "Browse brands, send individual gift cards, or purchase in bulk"
  } = props;

  const actionCards = [
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Browse Brands",
      description: "Explore all available gift card brands by category",
      buttonText: "View All Brands",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      borderColor: "border-orange-300",
      iconBg: "bg-orange-500",
      path: "/gift?mode=single"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-white" />,
      title: "Send Gift Card",
      description: "Send personalized gift cards via email, SMS, or WhatsApp",
      buttonText: "Start Sending",
      buttonColor: "bg-teal-500 hover:bg-teal-600",
      borderColor: "border-teal-300",
      iconBg: "bg-teal-500",
      path: "/gift?mode=single"
    },
    {
      icon: <Package className="w-8 h-8 text-white" />,
      title: "Buy in Bulk",
      description: "Purchase multiple gift cards for corporate gifts or events",
      buttonText: "Start Buying",
      buttonColor: "bg-green-500 hover:bg-green-600",
      borderColor: "border-green-300",
      iconBg: "bg-green-500",
      path: "/gift?mode=bulk"
    }
  ];

  const handleCardClick = (card) => {
    router.push(card.path);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 bg-gray-50">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {actionCards.map((card, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-2xl p-8 border-2 border-dashed ${card.borderColor} text-center hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer`}
            onClick={() => handleCardClick(card)}
          >
            {/* Icon */}
            <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              {card.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">{card.description}</p>

            {/* Button */}
            <button 
              className={`${card.buttonColor} text-white text-[16px] font-semibold py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center mx-auto`}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(card);
              }}
            >
              {card.buttonText}
              <span className="ml-2">▶</span>
            </button>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionSelectionCards;