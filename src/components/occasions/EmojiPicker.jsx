import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const emojiCategories = {
  'Celebrations': ['🎁', '🎉', '🎂', '🎈', '🎊', '🎀', '🥳', '🎆', '✨', '🌟'],
  'Holidays': ['🎄', '🎃', '👻', '🎅', '🐰', '🥚', '💐', '🌹', '🦃', '🕯️'],
  'Emotions': ['😂', '😍', '😘', '😎', '😢', '🤔', '😴', '🤩', '😊', '🥰'],
  'Reactions': ['💯', '🔥', '👍', '👎', '👏', '🙌', '💪', '✌️', '🤝', '👌'],
  'Hearts': ['❤️', '💔', '💖', '💝', '💗', '💙', '💚', '💛', '🧡', '💜'],
  'Objects': ['💍', '📱', '💻', '🏆', '🎯', '🎪', '🎭', '🎨', '🎵', '🎸']
};

const allEmojis = Object.values(emojiCategories).flat();

const EmojiPicker = ({ 
  label, 
  value, 
  onChange, 
  required = false, 
  placeholder = "Select an emoji",
  disabled = false,
  error = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Celebrations');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const filteredEmojis = searchTerm 
    ? allEmojis.filter(emoji => {
        // Simple emoji search - you could enhance this with emoji names/descriptions
        return emoji.includes(searchTerm) || 
               Object.keys(emojiCategories).some(category => 
                 category.toLowerCase().includes(searchTerm.toLowerCase()) && 
                 emojiCategories[category].includes(emoji)
               );
      })
    : emojiCategories[activeCategory] || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleEmojiSelect = (emoji) => {
    onChange(emoji);
    setIsOpen(false);
    setSearchTerm('');
    setActiveCategory('Celebrations');
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
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
            w-full flex items-center justify-between px-4 py-3 text-left bg-white border-2 rounded-xl shadow-sm transition-all duration-200
            ${disabled 
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
              : error 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }
            focus:outline-none
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center space-x-3">
            {value ? (
              <>
                <span className="text-2xl flex items-center justify-center w-8 h-8" role="img" aria-label="Selected emoji">
                  {value}
                </span>
                <span className="text-gray-700 font-medium">Emoji selected</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {value && !disabled && (
              <div
                onClick={clearSelection}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                <X size={16} />
              </div>
            )}
            <ChevronDown 
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
              size={20}
            />
          </div>
        </button>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search emojis or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Tabs (only show when not searching) */}
            {!searchTerm && (
              <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                {Object.keys(emojiCategories).map((category) => (
                  <div
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`
                      px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 cursor-pointer flex-shrink-0
                      ${activeCategory === category
                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                        : 'text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50'
                      }
                    `}
                    role="tab"
                    tabIndex={0}
                    aria-selected={activeCategory === category}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveCategory(category);
                      }
                    }}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}

            {/* Emoji Grid */}
            <div className="p-3">
              {filteredEmojis.length > 0 ? (
                <>
                  {searchTerm && (
                    <p className="text-sm text-gray-600 mb-3">
                      {filteredEmojis.length} emoji{filteredEmojis.length !== 1 ? 's' : ''} found
                    </p>
                  )}
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1">
                    {filteredEmojis.map((emoji, index) => (
                      <div
                        key={`${emoji}-${index}`}
                        onClick={() => handleEmojiSelect(emoji)}
                        className={`
                          text-xl w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-150 hover:scale-105 cursor-pointer
                          ${value === emoji
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                          }
                        `}
                        title={`Select ${emoji}`}
                        role="option"
                        tabIndex={0}
                        aria-selected={value === emoji}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleEmojiSelect(emoji);
                          }
                        }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No emojis found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;