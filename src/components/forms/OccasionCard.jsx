import { Edit, Trash2, Eye } from 'lucide-react';

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
    <div 
      className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}>
      <div className="relative">
        <div 
          className="h-40 w-full flex items-center justify-center text-white font-bold text-5xl bg-blue-500"
        >
          {occasion.emoji || '🎉'}
        </div>

        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md ${
          statusVariant === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${statusVariant === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {statusText}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-xl text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors" title={occasion.name}>
          {occasion.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] flex-grow" title={occasion.description}>
          {occasion.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-500">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleViewCards}
              disabled={disabled}
              title="View Cards"
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={handleEdit}
              disabled={disabled}
              title="Edit Occasion"
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={handleDelete}
              disabled={disabled}
              title="Delete Occasion"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccasionCard;
