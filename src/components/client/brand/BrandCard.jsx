import { Heart } from "lucide-react";

const BrandCard = ({
  brand,
  isPremium = false,
  isFavorited = false,
  onToggleFavorite,
  onClick,
  className = "",
}) => {
  
  const gradients = [
    "bg-gradient-to-br from-pink-100 to-pink-200",
    "bg-gradient-to-br from-blue-100 to-blue-200",
    "bg-gradient-to-br from-yellow-100 to-yellow-200",
    "bg-gradient-to-br from-purple-100 to-purple-200",
    "bg-gradient-to-br from-green-100 to-green-200",
    "bg-gradient-to-br from-gray-100 to-gray-200",
  ];

const randomGradient = gradients[brand.id % gradients.length];


  return (
    <div
      className={`${randomGradient} rounded-xl p-6 cursor-pointer hover:scale-105 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out relative group ${className}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(brand.id);
        }}
        className="absolute top-3 left-3 p-2 hover:bg-white/20 rounded-lg transition-colors z-10"
      >
        <Heart
          size={16}
          className={isFavorited ? "text-red-500 fill-current" : "text-gray-400"}
        />
      </button>

      {isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-orange-400 text-white text-xs px-2 py-1 rounded-full font-medium">
            ⭐ Premium
          </span>
        </div>
      )}

      <div className="flex justify-center mb-4 mt-4">
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
          <img
            src={brand.logo}
            alt={brand.name}
            className="w-15 h-15 object-contain"
          />
        </div>
      </div>

      <div className="text-center">
        <span className="inline-block bg-white/60 text-xs px-2 py-1 rounded-full mb-2 text-gray-600">
          {brand.category}
        </span>
        <h3 className="font-semibold text-gray-800 mb-1">{brand.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {brand.description}
        </p>
      </div>

      {/* Overlay with Choose Brand button */}
      <div
        className="absolute inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-20"
        onClick={(e) => {
          e.stopPropagation();
          onClick(brand);
        }}
      >
        <button className="bg-white cursor-pointer  text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-gray-50 text-sm whitespace-nowrap border border-gray-200">
          Choose Brand
        </button>
      </div>
    </div>
  );
};

export default BrandCard;