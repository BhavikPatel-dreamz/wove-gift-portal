"use client"
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Custom Dropdown Component
const CustomDropdown = ({ 
  options = [], 
  placeholder = "Select an option",
  value,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");

  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 lg:py-2.5 bg-white border border-gray-200  rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between text-left"
      >
        <span className="font-inter text-sm font-normal text-[#4A4A4A]">
          {displayText}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div
             className="px-4 py-2 cursor-pointer font-inter text-sm font-normal text-[#4A4A4A] hover:bg-blue-50"
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </div>
            {options.map((option, idx) => (
              <div
                key={idx}
                className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors ${
                  selectedValue === option.value ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDropdown;