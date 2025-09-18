

const ActionCard = ({ icon: Icon, title, description, buttonText, bgColor }) => (
  <div className="text-center">
    <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-6">{description}</p>
    <button className={`${bgColor} text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity`}>
      {buttonText}
    </button>
  </div>
);

export default ActionCard;