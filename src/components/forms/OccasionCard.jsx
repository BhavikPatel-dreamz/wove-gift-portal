import Badge from "./Badge";
import Card from "./Card";
import Button from "./Button";
import { Edit3, Eye, Trash2 } from "lucide-react";

const OccasionCard = ({ occasion, onEdit, onViewCards, onDelete, disabled = false }) => {
  const statusVariant = occasion.isActive || occasion.active ? 'success' : 'default';
  const statusText = occasion.isActive || occasion.active ? 'Active' : 'Inactive';
  const cardCount = occasion.cardCount || occasion._count?.occasionCategories || 0;

  const handleEdit = () => {
    if (!disabled && onEdit) {
      onEdit(occasion);
    }
  };

  const handleViewCards = () => {
    if (!disabled && onViewCards) {
      onViewCards(occasion);
    }
  };

  const handleDelete = () => {
    if (!disabled && onDelete) {
      onDelete(occasion.id);
    }
  };

  return (
    <Card className={`p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300 ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}>
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl -mt-2">{occasion.emoji || '🎉'}</div>
          <Badge variant={statusVariant}>{statusText}</Badge>
        </div>
        
        <div className="space-y-2 mb-6">
          <h3 className="text-xl font-bold text-gray-900 truncate" title={occasion.name}>
            {occasion.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]" title={occasion.description}>
            {occasion.description || 'No description available'}
          </p>
        </div>

        {/* Optional: Show image if available */}
        {occasion.image && occasion.image.trim() && (
          <div className="mb-4">
            <img 
              src={occasion.image} 
              alt={occasion.name}
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-medium text-gray-500">
          {cardCount} {cardCount === 1 ? 'card' : 'cards'}
        </span>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEdit}
            disabled={disabled}
            icon={Edit3}
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDelete}
            disabled={disabled}
            icon={Trash2} 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewCards}
            disabled={disabled}
            icon={Eye}
            className="hover:bg-gray-50"
          >
            View Cards
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OccasionCard;