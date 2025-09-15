import Badge from "./Badge";
import Card from "./Card";
import Button from "./Button";
import { Edit3, Eye } from "lucide-react";

const OccasionCard = ({ occasion, onEdit, onViewCards }) => {
  const statusVariant = occasion.active ? 'success' : 'default';
  const statusText = occasion.active ? 'Active' : 'Inactive';

  return (
    <Card className="p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl -mt-2">{occasion.emoji}</div>
          <Badge variant={statusVariant}>{statusText}</Badge>
        </div>
        
        <div className="space-y-2 mb-6">
          <h3 className="text-xl font-bold text-gray-900 truncate">{occasion.name}</h3>
          <p className="text-gray-600 text-sm h-10">{occasion.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-medium text-gray-500">
          {occasion.cardCount} {occasion.cardCount === 1 ? 'card' : 'cards'}
        </span>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(occasion)} icon={Edit3}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onViewCards(occasion)} icon={Eye}>
            View Cards
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OccasionCard;