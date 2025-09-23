

const ActionCard = ({ icon: Icon, title, description, buttonText, bgColor }) => (
  <div className="text-center group">
      <div className={`w-16 h-16 rounded-2xl bg-wave-orange  flex items-center justify-center mx-auto mb-4 shadow-brand transition-all duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-wave-green mb-2 group-hover:text-wave-orange transition-colors duration-300">{title}</h3>
      <p className="text-wave-brown text-sm mb-6 leading-relaxed">{description}</p>
      <button className={`text-white bg-wave-orange px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-brand hover:shadow-brand-lg transform hover:scale-105`}>
        {buttonText}
      </button>
    </div>
);

export default ActionCard;