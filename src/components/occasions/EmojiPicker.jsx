import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const CustomEmojiPicker = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Select emoji',
  disabled = false,
  error = null,
  className = '',
  theme = 'light',
  categories = [],
  searchDisabled = false,
  skinTonesDisabled = false,
  previewConfig = {
    showPreview: true,
    defaultEmoji: '1f60a',
    defaultCaption: "What's on your mind?",
  },
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [emojiName, setEmojiName] = useState('');

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  /* -------------------- Detect Mobile -------------------- */
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const handler = () => setIsMobile(media.matches);
    handler();
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  /* -------------------- Click Outside -------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isOpen]);

  /* -------------------- ESC Close -------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  /* -------------------- Body Scroll Lock (Mobile) -------------------- */
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => (document.body.style.overflow = '');
  }, [isOpen, isMobile]);

  /* -------------------- Handlers -------------------- */
  const handleEmojiSelect = (emojiData) => {
    onChange(emojiData.emoji);
    if (emojiData.names?.length) {
      setEmojiName(emojiData.names[0]);
    }
    setIsOpen(false);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
    setEmojiName('');
  };

  /* -------------------- Dropdown Classes -------------------- */
  const dropdownClasses = isMobile
    ? `
      fixed bottom-0 left-0 right-0 z-50 bg-white
      rounded-t-2xl shadow-xl
      transform transition-transform duration-300 ease-out
      ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      max-h-[85vh] flex flex-col
    `
    : `
      absolute left-0 right-0 z-50 mt-2 bg-white
      border border-gray-200 rounded-xl shadow-lg
      transform transition-all duration-200 ease-out origin-top
      ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
    `;

  const emojiPickerProps = {
    onEmojiClick: handleEmojiSelect,
    theme,
    lazyLoadEmojis: true,
    searchDisabled,
    skinTonesDisabled,
    previewConfig,
    width: '100%',
    height: isMobile ? '100%' : 360,
    ...(categories.length > 0 && { categories }),
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div ref={dropdownRef}>
        {/* -------------------- Trigger Button -------------------- */}
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((v) => !v)}
          className={`
            w-full h-[45px] flex items-center justify-between px-4
            rounded-lg border transition-all
            ${
              disabled
                ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                : error
                ? 'border-red-300 focus:ring-red-200'
                : 'border-gray-300 hover:border-gray-400 focus:ring-blue-200'
            }
            focus:outline-none focus:ring-2
          `}
        >
          <div className="flex items-center gap-2 min-w-0">
            {value ? (
              <>
                <span className="text-lg">{value}</span>
                {emojiName && (
                  <span className="text-sm text-gray-700 truncate capitalize">
                    {emojiName.replace(/_/g, ' ')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-400 truncate">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {value && !disabled && (
              <span
                onClick={clearSelection}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={14} />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {/* -------------------- Mobile Overlay -------------------- */}
        {isMobile && isOpen && (
          <div className="fixed inset-0 bg-black/40 z-40" />
        )}

        {/* -------------------- Dropdown -------------------- */}
        <div className={dropdownClasses}>
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-sm font-medium text-gray-700">
                Select Emoji
              </span>
              <button onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* Emoji Picker */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <EmojiPicker {...emojiPickerProps} />
            </div>
          </div>

          {/* Mobile Done Button */}
          {isMobile && (
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium"
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
