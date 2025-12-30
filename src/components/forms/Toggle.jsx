const Toggle = ({ label, sublabel, checked, onChange, className = '' }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
        {sublabel && <span className="text-sm text-gray-500">{sublabel}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F59EE] focus:ring-offset-2 ${
          checked ? 'bg-[#1F59EE]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;