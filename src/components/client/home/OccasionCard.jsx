import { Gift } from "lucide-react";


const OccasionCard = ({ title, description, bgColor, textColor, buttonColor }) => (
  <div className={`${bgColor} rounded-3xl p-6 text-center`}>
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
      <Gift className={`w-6 h-6 ${textColor}`} />
    </div>
    <h3 className={`text-lg font-semibold ${textColor} mb-2`}>{title}</h3>
    <p className={`text-sm ${textColor} opacity-80 mb-4`}>{description}</p>
    <button className={`${buttonColor} text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity`}>
      Choose This Occasion
    </button>
  </div>
);

export default OccasionCard;