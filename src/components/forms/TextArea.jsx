

const TextArea = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm text-black font-medium">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 text-black  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
        {...props}
      />
    </div>
  );
};

export default TextArea;