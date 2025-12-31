const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 font-semibold text-xs border border-gray-800',
    primary: 'bg-indigo-100 text-indigo-800 font-semibold text-xs border border-indigo-800',
    success: 'bg-[#DFF6E4] text-[#10B981] font-semibold text-xs border border-[#10B981]',
    warning: 'bg-[#FFF7D4] text-[#F59E0B] font-semibold text-xs border border-[#F59E0B]',
    danger: 'bg-[#FEE2E2] text-[#DC2626] font-semibold text-xs border border-[#DC2626]',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;