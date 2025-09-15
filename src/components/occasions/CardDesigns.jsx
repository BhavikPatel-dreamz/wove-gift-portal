import { useState } from "react";
import Button from "../forms/Button";
import Badge from "../forms/Badge";
import Card from "../forms/Card";
import { ArrowLeft, Edit3, Plus, MoreVertical, Trash2, Copy } from "lucide-react";
import CreateNewCard from "./CreateNewCard";

const initialCards = [
  {
    id: 1,
    title: "Classic Birthday",
    description: "A timeless design for all ages.",
    preview: "🎂",
    imageUrl: "/placeholders/card1.png",
    active: true,
  },
  {
    id: 2,
    title: "Modern Celebration",
    description: "A sleek and stylish design.",
    preview: "🎉",
    imageUrl: "/placeholders/card2.png",
    active: true,
  },
  {
    id: 3,
    title: "Floral Thanks",
    description: "A beautiful way to show gratitude.",
    preview: "🙏",
    imageUrl: "/placeholders/card3.png",
    active: false,
  },
];

const CardDesigns = ({ occasion: initialOccasion, onBack, onEditOccasion }) => {
  const [occasion, setOccasion] = useState(initialOccasion);
  const [cards, setCards] = useState([]); // Initially empty
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  const handleAddCard = (newCard) => {
    const card = { ...newCard, id: Date.now() };
    setCards([...cards, card]);
  };

  const handleSaveNewCard = (newCardData) => {
    const newCard = {
        id: Date.now(),
        title: newCardData.cardName,
        description: `For ${occasion.name}`,
        preview: newCardData.previewEmoji,
        imageUrl: newCardData.imageUrl,
        active: newCardData.isActive,
    };
    setCards([...cards, newCard]);
  };

  if (isCreatingCard) {
    return <CreateNewCard occasion={occasion} onBack={() => setIsCreatingCard(false)} onSave={handleSaveNewCard} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
                <Button 
                variant="ghost" 
                onClick={onBack}
                icon={ArrowLeft}
                className="text-gray-600 hidden sm:flex"
                >
                Back
                </Button>
                 <Button 
                variant="ghost" 
                onClick={onBack}
                icon={ArrowLeft}
                size="icon"
                className="text-gray-600 flex sm:hidden"
                />
                
                <div className="flex items-center space-x-3">
                <div className="text-3xl">{occasion.emoji}</div>
                <div>
                    <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">{occasion.name}</h1>
                    <Badge variant={occasion.active ? 'success' : 'default'}>{occasion.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{occasion.description}</p>
                </div>
                </div>
            </div>
          
          <div className="flex items-center space-x-2">
            <Button 
                variant="outline" 
                onClick={() => setIsCreatingCard(true)}
                icon={Plus}
              >
                Add Card
              </Button>
            <Button 
                variant="ghost" 
                size="icon"
                onClick={onEditOccasion}
                className="text-gray-600"
            >
                <Edit3 className="h-5 w-5"/>
            </Button>
          </div>
        </div>

        {/* Card Designs Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Card Designs ({cards.length})
            </h2>
          </div>
          
          {cards.length === 0 ? (
            <div className="text-center px-6 py-24">
                <div className="inline-block bg-indigo-100 p-5 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="M18 4V2"/><path d="M10 4V2"/><path d="M18 18v-6"/><path d="M15 15h6"/></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create your first card design</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Bring the <span className="font-semibold">{occasion.name}</span> occasion to life by adding unique card designs that users can send.
                </p>
                <Button 
                  onClick={() => setIsCreatingCard(true)}
                  icon={Plus}
                  size="lg"
                >
                  Create Card Design
                </Button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <Card key={card.id} className="group overflow-hidden">
                    <div className="aspect-[3/4] bg-gray-100 relative">
                        {card.imageUrl ? (
                            <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-indigo-50 text-indigo-300">{card.preview}</div>
                        )}
                        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant={card.active ? 'success' : 'default'}>{card.active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 truncate">{card.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{card.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDesigns;
