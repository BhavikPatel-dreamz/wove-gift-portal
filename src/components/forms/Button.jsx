const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '', 
  loading = false, // 👈 handle loading here
  ...props 
}) => {
  const baseClasses =
    'w-full py-3.5 bg-linear-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={loading} // 👈 disable when loading
      {...props} // no "loading" leaks here
    >
      {loading ? "Loading..." : children} {/* 👈 render state */}
    </button>
  );
};

export default Button;
