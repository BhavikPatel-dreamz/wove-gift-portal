import { Gift } from "lucide-react";


const CTASection = ({ 
  title = "Ready to gift better?",
  primaryButtonText = "Start Gifting",
  secondaryButtonText = "For Business"
}) => {
  return (
    <div className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-8">
              {title}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
                {primaryButtonText}
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border border-white/30 px-8 py-3 rounded-full font-semibold transition-all duration-300">
                {secondaryButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;