import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const CustomEmojiPicker = ({ 
  label, 
  value, 
  onChange, 
  required = false, 
  placeholder = "Select an emoji",
  disabled = false,
  error = null,
  className = "",
  theme = 'light', // 'light' or 'dark'
  categories = [], // Optional: limit categories
  searchDisabled = false,
  skinTonesDisabled = false,
  previewConfig = {
    showPreview: true,
    defaultEmoji: "1f60a",
    defaultCaption: "What's on your mind?"
  }
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when dropdown is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  const handleEmojiSelect = (emojiData) => {
    // emojiData contains: { emoji, names, originalUnified, unified, etc. }
    onChange(emojiData.emoji);
    setIsOpen(false);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const getDropdownClasses = () => {
    if (isMobile) {
      return `
        fixed inset-0 z-50 bg-white flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `;
    }
    
    return `
      absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden
      transform transition-all duration-200 ease-out origin-top
      ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
    `;
  };

  // Emoji picker configuration
  const emojiPickerProps = {
    onEmojiClick: handleEmojiSelect,
    theme: theme,
    lazyLoadEmojis: true,
    searchDisabled: searchDisabled,
    skinTonesDisabled: skinTonesDisabled,
    previewConfig: previewConfig,
    width: isMobile ? '100%' : 350,
    height: isMobile ? 400 : 350,
    ...(categories.length > 0 && { categories: categories })
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-left bg-white border-2 rounded-xl shadow-sm transition-all duration-200
            ${disabled 
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
              : error 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }
            focus:outline-none touch-manipulation
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={value ? `Selected emoji: ${value}` : placeholder}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {value ? (
              <>
                <span className="text-lg sm:text-2xl flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" role="img" aria-label="Selected emoji">
                  {value}
                </span>
                <span className="text-gray-700 font-medium text-sm sm:text-base truncate">Emoji selected</span>
              </>
            ) : (
              <span className="text-gray-500 text-sm sm:text-base truncate">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {value && !disabled && (
              <div
                onClick={clearSelection}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer touch-manipulation"
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    clearSelection(e);
                  }
                }}
              >
                <X size={14} className="sm:w-4 sm:h-4" />
              </div>
            )}
            <ChevronDown 
              className={`text-gray-400 transition-transform duration-200 w-4 h-4 sm:w-5 sm:h-5 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {/* Mobile Overlay */}
        {isMobile && isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        )}

        {/* Dropdown/Modal with Emoji Picker */}
        <div className={getDropdownClasses()}>
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Select Emoji</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Close emoji picker"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Emoji Picker Container */}
          <div className={`${isMobile ? 'flex-1 overflow-hidden' : ''}`}>
            <EmojiPicker {...emojiPickerProps} />
          </div>

          {/* Mobile Footer */}
          {isMobile && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-manipulation"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomEmojiPicker;