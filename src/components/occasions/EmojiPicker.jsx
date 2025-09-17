

const EmojiPicker = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  emojis = ['🎁', '🎉', '🎂', '🎈', '💝', '🌟', '🎊', '🎀'],
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
              value === emoji
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="text-xl text-black">
        Selected: {value}
      </div>
    </div>
  );
};

export default EmojiPicker;


