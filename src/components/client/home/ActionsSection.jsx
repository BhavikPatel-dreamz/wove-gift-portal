"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import WishListIcon from '@/icons/WishListIcon';
import GiftCardIcon from '@/icons/GiftCardIcon';
import BoxIcon from '@/icons/BoxIcon';
import RightArrow from '@/icons/RightArrow';
import { useDispatch } from 'react-redux';
import { setCurrentStep, resetFlow, clearCsvFileData } from '@/redux/giftFlowSlice';

const ActionSelectionCards = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    title = "Choose Your Action",
    subtitle = "Browse brands, send individual gift cards, or purchase in bulk"
  } = props;

  const actionCards = [
  {
    icon: <WishListIcon />,
    title: "Browse Brands",
    description: "Explore all available gift card brands by category",
    buttonText: "View All Brands",
    buttonColor: `
      bg-[linear-gradient(114deg,#FA8F42_11.36%,#DA5B00_90.28%)]
      hover:bg-[linear-gradient(114deg,#DA5B00_11.36%,#FA8F42_90.28%)]
    `,
    borderColor: "gradient-border-orange",
    iconBg: "bg-[#fdf6f0]",
    path: "/gift?mode=single"
  },
  {
    icon: <GiftCardIcon />,
    title: "Send Gift Card",
    description: "Send personalized gift cards via email, SMS, or WhatsApp",
    buttonText: "Start Sending",
    buttonColor: `
      bg-[linear-gradient(93deg,#13B4A3_8.2%,#0E988B_74.19%)]
      hover:bg-[linear-gradient(93deg,#0E988B_33.66%,#13B4A3_99.66%)]
    `,
    borderColor: "gradient-border-blue",
    iconBg: "bg-[#f2faf9]",
    path: "/gift?mode=single"
  },
  {
    icon: <BoxIcon />,
    title: "Buy in Bulk",
    description: "Purchase multiple gift cards for corporate gifts or events",
    buttonText: "Start Buying",
    buttonColor: `
      bg-[linear-gradient(92deg,#20C25F_5.34%,#069868_73.64%)]
      hover:bg-[linear-gradient(92deg,#069868_31.69%,#20C25F_100%)]
    `,
    borderColor: "gradient-border-green",
    iconBg: "bg-[#f0faf7]",
    path: "/gift?mode=bulk"
  }
];

  const handleCardClick = (card) => {
    if (card.path.startsWith('/gift')) {
      dispatch(resetFlow());
      dispatch(setCurrentStep(1));
      dispatch(clearCsvFileData());
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

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {actionCards.map((card, index) => (
          <div
            key={index}
            className={`relative bg-white ${card.borderColor} rounded-2xl p-6 sm:p-7 lg:p-8 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
            onClick={() => handleCardClick(card)}
          >
            {/* Icon */}
            <div className={`${card.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              {card.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {card.title}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
              {card.description}
            </p>

            {/* Button */}
            <button
              className={`${card.buttonColor} group text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 flex items-center justify-center mx-auto w-full sm:w-auto`}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(card);
              }}
            >
              {card.buttonText}
              <span className="ml-2 transition-all duration-300 group-hover:translate-x-1">
                <RightArrow />
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionSelectionCards;