"use client";
import React, { useState } from "react";
import BrandHeader from "./BrandHeader";

const GiftCardSelector = ({ brand, onSelectGiftCard, onBack }) => {
  
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const presetAmounts = [100, 250, 500, 1000, 2000];


  const handleGiftCardClick = (giftCard) => {
    setSelectedGiftCard(giftCard);
    onSelectGiftCard(giftCard);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BrandHeader brand={brand} onBack={onBack} />
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Select a Voucher
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {presetAmounts.map((voucher,index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 ${
                selectedGiftCard === voucher
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              onClick={() => handleGiftCardClick(voucher)}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Voucher
                </h3>
                <p className="text-gray-600">${voucher}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GiftCardSelector;