import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const CustomEmojiPicker = ({ 
  label, 
  value, 
  onChange, 
  required = false, 
  placeholder = "Select emoji",
  disabled = false,
  error = null,
  className = "",
  theme = 'light',
  categories = [],
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
  const [emojiName, setEmojiName] = useState('');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    onChange(emojiData.emoji);
    // Store the emoji name for display
    if (emojiData.names && emojiData.names.length > 0) {
      setEmojiName(emojiData.names[0]);
    }
    setIsOpen(false);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
    setEmojiName('');
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
          {label} {required && <span className="text-gray-700">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
             w-full h-[45px] flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-left  border-1 border-gray-300 rounded-lg transition-all duration-200
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
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1  sm:h-[15px]">
            {value ? (
              <>
                <span className=" text-[12px] h-[15px] sm:text-[14px] text-[#4A4A4A] flex items-center justify-center flex-shrink-0" role="img" aria-label="Selected emoji">
                  {value}
                </span>
                {emojiName && (
                  <span className="text-[#4A4A4A] text-[12px] h-[15px] sm:text-[14px] font-medium truncate capitalize">
                    {emojiName.replace(/_/g, ' ')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm sm:text-[12px] h-[15px] truncate">{placeholder}</span>
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

        {isMobile && isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        )}

        <div className={getDropdownClasses()}>
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <h4 className="text-[12px] font-medium text-gray-400">Select Emoji</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Close emoji picker"
              >
                {/* <X size={20} /> */}
              </button>
            </div>
          )}

          <div className={`${isMobile ? 'flex-1 overflow-hidden' : ''}`}>
            <EmojiPicker {...emojiPickerProps} />
          </div>

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