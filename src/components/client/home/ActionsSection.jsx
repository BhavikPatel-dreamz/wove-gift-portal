"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, CreditCard, Package } from 'lucide-react';
import WishListIcon from '@/icons/WishListIcon';
import GiftCardIcon from '@/icons/GiftCardIcon';
import BoxIcon from '@/icons/BoxIcon';
import RightArrow from '@/icons/RightArrow';
import { useDispatch } from 'react-redux';
import { setCurrentStep, resetFlow } from '@/redux/giftFlowSlice';

const ActionSelectionCards = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { 
    title = "Choose Your Action",
    subtitle = "Browse brands, send individual gift cards, or purchase in bulk"
  } = props;

  const actionCards = [
    {
      icon: <WishListIcon/>,
      title: "Browse Brands",
      description: "Explore all available gift card brands by category",
      buttonText: "View All Brands",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      borderColor: "gradient-border-orange",
      iconBg: "bg-[#fdf6f0]",
      path: "/gift?mode=single"
    },
    {
      icon: <GiftCardIcon/>,
      title: "Send Gift Card",
      description: "Send personalized gift cards via email, SMS, or WhatsApp",
      buttonText: "Start Sending",
      buttonColor: "bg-teal-500 hover:bg-teal-600",
      borderColor: "gradient-border-blue",
      iconBg: "bg-[#f2faf9]",
      path: "/gift?mode=single"
    },
    {
      icon: <BoxIcon/>,
      title: "Buy in Bulk",
      description: "Purchase multiple gift cards for corporate gifts or events",
      buttonText: "Start Buying",
      buttonColor: "bg-green-500 hover:bg-green-600",
      borderColor: "gradient-border-green",
      iconBg: "bg-[#f0faf7]",
      path: "/gift?mode=bulk"
    }
  ];
  
  const handleCardClick = (card) => {
    if (card.path.startsWith('/gift')) {
      dispatch(resetFlow());
      dispatch(setCurrentStep(1));
    }
    router.push(card.path);
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 bg-gray-50">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-[#1A1A1A] mb-3 sm:mb-4 px-2">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-[#4A4A4A] max-w-2xl mx-auto px-4">
          {subtitle}
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {actionCards.map((card, index) => (
          <div
            key={index}
            className={`relative bg-white cursor-pointer rounded-2xl p-6 sm:p-7 lg:p-8 ${card.borderColor} text-center hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer`}
            onClick={() => handleCardClick(card)}
          >
            {/* Icon */}
            <div className={`w-17.5 h-17.5 sm:w-19.5 sm:h-19.5 lg:w-20.75 lg:h-20.75 ${card.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6`}>
              {card.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              {card.title}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-7 lg:mb-8 leading-relaxed px-2">
              {card.description}
            </p>

            {/* Button */}
            <button 
              className={`${card.buttonColor} text-white cursor-pointer text-sm sm:text-[15px] lg:text-[16px] font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full transition-colors duration-200 flex items-center justify-center mx-auto w-full sm:w-auto`}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(card);
              }}
            >
              {card.buttonText}
              <span className="ml-2"><RightArrow/></span>
            </button>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionSelectionCards;