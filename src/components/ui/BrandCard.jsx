
import { Star, MoreVertical, Edit } from "lucide-react";

export function BrandCard({ brand, onToggleFeatured, onToggleActive }) {
  const getCategoryColor = (category) => {
    if (category.includes("Fashion"))
      return "bg-pink-50 text-pink-700 border-pink-200";
    if (category === "Clothing")
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (category === "Footwear")
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      {brand.featured && (
        <div className="bg-orange-400 text-white text-xs px-2 py-1 font-medium flex items-center gap-1">
          <Star size={12} fill="currentColor" />
          Featured
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
            style={{ backgroundColor: brand.color }}
          >
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              brand.name.charAt(0).toUpperCase()
            )}
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        <h3 className="font-bold text-lg text-gray-900 mb-1">{brand.name}</h3>
        <p className="text-gray-600 text-sm italic mb-3">"{brand.tagline}"</p>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {brand.description}
        </p>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
              brand.category
            )}`}
          >
            {brand.category}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-sm font-medium ${
              brand.active ? "text-green-600" : "text-red-600"
            }`}
          >
            {brand.active ? "Active" : "Inactive"}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onToggleFeatured(brand.id)}
              className={`p-2 rounded-lg transition-colors ${
                brand.featured
                  ? "text-orange-500 hover:bg-orange-50"
                  : "text-gray-400 hover:bg-gray-50 hover:text-orange-500"
              }`}
            >
              <Star size={16} fill={brand.featured ? "currentColor" : "none"} />
            </button>
            <button className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
              <Edit size={16} />
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Featured</span>
            <button
              onClick={() => onToggleFeatured(brand.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                brand.featured ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  brand.featured ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
