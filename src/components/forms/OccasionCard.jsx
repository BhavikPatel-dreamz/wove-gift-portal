import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

const OccasionCard = ({ occasion, onEdit, onDelete, disabled = false }) => {
  const statusActive = occasion.isActive || occasion.active;
  const statusVariant = statusActive ? "success" : "default";
  const statusText = statusActive ? "Active" : "Inactive";
  const cardCount = occasion.cardCount || occasion._count?.occasionCategories || 0;

  const handleEdit = () => !disabled && onEdit?.(occasion);
  const handleDelete = () => !disabled && onDelete?.(occasion.id);

  return (
    <div
      className={`group relative bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 flex flex-col
        hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 ${disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
    >
      {/* Image / Preview */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {occasion.image ? (
          <img
            src={occasion.image}
            alt={occasion.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center text-5xl font-semibold bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 ${occasion.image ? "hidden" : "flex"
            }`}
        >
          {occasion.preview || "✨"}
        </div>

        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-md ${statusVariant === "success"
            ? 'bg-[#DDFCE9] text-[#10B981] border-[#10B981]'
            : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
        >
          {statusText}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3
          className="font-semibold text-[18px] text-[#1A1A1A] leading-6 mb-1 truncate group-hover:text-blue-600 transition-colors"
          style={{ fontFamily: 'Poppins' }}
          title={occasion.name}
        >
          {occasion.name}
        </h3>
        <p
          className="text-[#4A4A4A] text-[14px] leading-5 font-normal mb-4 line-clamp-2"
          title={occasion.description}
        >
          {occasion.description || "No description available"}
        </p>

        <p
          className="text-xs text-[#364152] font-semibold leading-5 mb-3"
        >
          Type: {occasion.type || "N/A"}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span
            className="text-[14px] font-normal text-[#4A4A4A] leading-5"
            style={{ fontFamily: 'Inter' }}
          >
            {cardCount} {cardCount === 1 ? "Card" : "Cards"}
          </span>

          <div className="flex items-center gap-2">
            <Link href={`/occasions/${occasion.id}/cards`} passHref>
              <IconButton
                icon={<Eye size={16} />}
                tooltip="View Cards"
                color="blue"
                disabled={disabled}
              />
            </Link>
            <IconButton
              icon={<Edit size={16} />}
              tooltip="Edit Occasion"
              onClick={handleEdit}
              color="indigo"
              disabled={disabled}
            />
            <IconButton
              icon={<Trash2 size={16} />}
              tooltip="Delete Occasion"
              onClick={handleDelete}
              color="red"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Icon Button Component
const IconButton = ({ as: Component = 'button', icon, tooltip, onClick, color = "blue", disabled, ...props }) => {
  const colorMap = {
    blue: "hover:text-blue-600 hover:bg-blue-50",
    indigo: "hover:text-indigo-600 hover:bg-indigo-50",
    red: "hover:text-red-600 hover:bg-red-50",
  };

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      {...props}
      className={`text-gray-400 ${colorMap[color]} p-2 rounded-lg transition-all duration-200 
        hover:scale-110 focus:ring-2 focus:ring-offset-1 focus:ring-${color}-200 disabled:opacity-50`}
    >
      {icon}
    </Component>
  );
};

export default OccasionCard;