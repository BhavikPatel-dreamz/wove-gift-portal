import { useState } from 'react';
import { Smile } from 'lucide-react';

const emojis = [
  '🎁', '🎉', '🎂', '🎈', '💝', '🌟', '🎊', '🎀', '🎄', '🎃', '👻', '🎅', '🐰', '🥚', '💐', '🌹',
  '💍', '❤️', '💔', '💯', '🔥', '👍', '👎', '😂', '😍', '😘', '😎', '😢', '🤔', '😴', '🥳', '🤩'
];

const EmojiPicker = ({ label, value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = emojis.filter(emoji => 
    emoji.includes(searchTerm)
  );

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <span className="text-2xl">{value}</span>
          <Smile className="text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <input
              type="text"
              placeholder="Search emoji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
              {filteredEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onChange(emoji);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                    value === emoji
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;