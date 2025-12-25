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
        className="w-full text-sm px-2 py-2 bg-white border border-[#4A4A4A] rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between text-left"
      >
        <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
          {displayText}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-black transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute text-sm z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-500"
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </div>
            {options.map((option, idx) => (
              <div
                key={idx}
                className={`px-4 py-1.5 hover:bg-blue-50 cursor-pointer transition-colors ${
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