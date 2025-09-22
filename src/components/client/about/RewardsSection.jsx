import { Gift } from "lucide-react";

const RewardsSection = ({ 
  title = "Rewards at scale, made simple.",
  description = "Buy in bulk, receive 2-7% return, instantly track and reconnect with ease. Perfect for staff rewards, client campaigns, and loyalty programs.",
  buttonText = "Explore Bulk Gifting",
  stats = "2.7% return"
}) => {
  return (
    <div className="py-20 px-6 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Gift className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {title}
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
        <div className="text-3xl font-bold text-orange-500 mb-8">
          {stats}
        </div>
        <button className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RewardsSection;