
const WhySection = ({ 
  title = "Why Wave exists",
  description = "Gifting should feel joyful, not stressful. We built Wave to turn \"What do I buy?\" into \"That was easy.\" With access to trusted brands and instant delivery, you choose the vibe—fashion, food, wellness, travel—and we deliver a beautiful gift card that always fits.",
  primaryButtonText = "Start Gifting",
  secondaryButtonText = "Explore Bulk Gifting"
}) => {
  return (
    <div className="py-20 px-6" style={{ backgroundColor: '#F5F3E7' }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className="text-4xl md:text-5xl font-bold mb-8"
          style={{ color: '#2D5A3D' }}
        >
          {title}
        </h2>
        <p 
          className="text-lg mb-12 max-w-3xl mx-auto leading-relaxed"
          style={{ color: '#8B4513' }}
        >
          {description}
        </p>
        <p 
          className="text-2xl font-semibold mb-8"
          style={{ color: '#FF6B35' }}
        >
          Give freedom to choose, and the gift always fits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            className="px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 text-white"
            style={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)'
            }}
          >
            {primaryButtonText}
          </button>
          <button 
            className="px-8 py-3 rounded-full font-semibold transition-all duration-300 border-2"
            style={{ 
              backgroundColor: 'white',
              color: '#FF6B35',
              borderColor: '#FF6B35'
            }}
          >
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhySection;