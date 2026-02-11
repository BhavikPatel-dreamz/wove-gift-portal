const Toggle = ({ label, sublabel, checked, onChange, className = '' }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        {label && <span className="text-sm font-medium text-[#4A4A4A]">{label}</span>}
        {sublabel && <span className="text-xs text-[#A5A5A5] mt-1">{sublabel}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F59EE] focus:ring-offset-2 ${checked ? 'bg-[#1F59EE]' : 'bg-gray-200'
          }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );
};

export default Toggle;