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
    'inline-flex items-center justify-center text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

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
