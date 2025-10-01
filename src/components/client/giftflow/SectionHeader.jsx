

const SectionHeader = ({ icon, title, subtitle, bgColor = "bg-purple-500" }) => (
  <div className={`${bgColor} text-white p-4 rounded-lg text-center mb-6`}>
    <div className="flex items-center justify-center gap-2 mb-2">
      {icon}
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    <p className="text-wave-cream-dark text-sm">{subtitle}</p>
  </div>
);

export default SectionHeader;