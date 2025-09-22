
const WhySection = ({ 
  title = "Why Wove exists",
  description = "Gifting should feel joyful, not stressful. We built Wove to turn \"What do I buy?\" into \"That was easy.\" With access to trusted brands and instant delivery, you choose the vibe—fashion, food, wellness, travel—and we deliver a beautiful gift card that always fits.",
  primaryButtonText = "Start Gifting",
  secondaryButtonText = "Explore Bulk Gifting"
}) => {
  return (
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          {title}
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
        <p className="text-2xl font-semibold text-orange-500 mb-8">
          Give freedom to choose, and the gift always fits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
            {primaryButtonText}
          </button>
          <button className="bg-white hover:bg-gray-50 text-orange-500 border-2 border-orange-200 px-8 py-3 rounded-full font-semibold transition-all duration-300">
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhySection;