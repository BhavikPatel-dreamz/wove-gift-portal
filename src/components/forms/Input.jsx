

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  required = false,
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
          {label} {required && <span className="text-[#4A4A4A]">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-10 px-3 py-2 border border-gray-300 text-[12px] font-medium text-[#4A4A4A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...props}
      />
    </div>
  );
};

export default Input;