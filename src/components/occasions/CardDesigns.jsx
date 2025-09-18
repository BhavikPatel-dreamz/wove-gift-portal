import { useState, useEffect } from "react";
import Button from "../forms/Button";
import Badge from "../forms/Badge";
import Card from "../forms/Card";
import Toggle from "../forms/Toggle";
import { ArrowLeft, Edit3, Plus, MoreVertical, Trash2, Copy, Loader2 } from "lucide-react";
import CreateNewCard from "./CreateNewCard";
import { getOccasionCategories, updateOccasionCategory, deleteOccasionCategory, getOccasionCategoryById } from "../../lib/action/occasionAction";

const CardDesigns = ({ occasion: initialOccasion, onBack, onEditOccasion }) => {
  const [occasion, setOccasion] = useState(initialOccasion);
  const [cards, setCards] = useState([]);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);

  // Fetch occasion categories when component mounts or occasion.id changes
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getOccasionCategories({
          occasionId: occasion.id,
          isActive: undefined,
          page: 1,
          limit: 100
        });

        if (result.success) {
          const transformedCards = result.data.map(category => ({
            id: category.id,
            title: category.name,
            description: category.description || `For ${occasion.name}`,
            preview: category.emoji,
            imageUrl: category.image,
            active: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          }));
          
          setCards(transformedCards);
        } else {
          setError(result.message || 'Failed to fetch card designs');
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Failed to load card designs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (occasion.id) {
      fetchCards();
    }
  }, [occasion.id]);

  const handleSaveNewCard = (newCardData) => {
    const newCard = {
        id: newCardData.id,
        title: newCardData.name,
        description: newCardData.description || `For ${occasion.name}`,
        preview: newCardData.emoji,
        imageUrl: newCardData.image,
        active: newCardData.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    setCards(prevCards => [...prevCards, newCard]);
  };

  const handleUpdateCard = (updatedCardData) => {
    setCards(prevCards => prevCards.map(card => 
      card.id === updatedCardData.id ? {
        ...card,
        title: updatedCardData.name,
        description: updatedCardData.description || `For ${occasion.name}`,
        preview: updatedCardData.emoji,
        imageUrl: updatedCardData.image,
        active: updatedCardData.isActive,
        updatedAt: new Date().toISOString()
      } : card
    ));
    setEditingCardId(null);
    setCardToEdit(null);
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card design?')) {
      setLoading(true);
      const result = await deleteOccasionCategory(cardId);
      if (result.success) {
        setCards(cards.filter(card => card.id !== cardId));
        console.log('Card deleted successfully');
      } else {
        console.error('Failed to delete card:', result.message);
        setError(result.message || 'Failed to delete card');
      }
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  const handleToggleCardActive = async (cardId, currentStatus) => {
    const formData = new FormData();
    formData.append('id', cardId);
    formData.append('isActive', !currentStatus);

    const result = await updateOccasionCategory(formData);
    if (result.success) {
      setCards(cards.map(card => 
        card.id === cardId ? { ...card, active: !currentStatus } : card
      ));
      console.log('Card active status updated successfully');
    } else {
      console.error('Failed to update card active status:', result.message);
      setError(result.message || 'Failed to update card status');
    }
  };

  const handleEditCard = async (cardId) => {
    try {
      setLoading(true);
      const result = await getOccasionCategoryById(cardId);
      
      if (result.success) {
        const category = result.data;
        const cardData = {
          id: category.id,
          title: category.name,
          description: category.description,
          preview: category.emoji,
          imageUrl: category.image,
          active: category.isActive,
        };
        
        console.log('Setting card to edit:', cardData); // Debug log
        setCardToEdit(cardData);
        setEditingCardId(cardId);
        setOpenDropdown(null);
      } else {
        console.error('Failed to fetch card for editing:', result.message);
        setError(result.message || 'Failed to load card for editing');
      }
    } catch (err) {
      console.error('Error in handleEditCard:', err);
      setError('Failed to load card for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromCreateEdit = () => {
    setIsCreatingCard(false);
    setEditingCardId(null);
    setCardToEdit(null);
  };

  if (isCreatingCard) {
    return <CreateNewCard occasion={occasion} onBack={handleBackFromCreateEdit} onSave={handleSaveNewCard} />;
  }

  if (editingCardId && cardToEdit) {
    console.log('Rendering edit mode with cardToEdit:', cardToEdit); // Debug log
    return <CreateNewCard occasion={occasion} onBack={handleBackFromCreateEdit} onSave={handleUpdateCard} initialCardData={cardToEdit} />;
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
                disabled={loading}
              >
                Add Card
              </Button>
          </div>
        </div>

        {/* Card Designs Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Card Designs ({loading ? '...' : cards.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center px-6 py-24">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-gray-600">Loading card designs...</p>
            </div>
          ) : error ? (
            <div className="text-center px-6 py-24">
              <div className="inline-block bg-red-100 p-5 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading card designs</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : cards.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {cards.map((card) => (
                  <Card key={card.id} className="group overflow-hidden relative">
                    <div className="aspect-[3/4] bg-gray-100 relative">
                        {card.imageUrl ? (
                            <img 
                              src={card.imageUrl} 
                              alt={card.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-3xl bg-indigo-50 text-indigo-600 ${card.imageUrl ? 'hidden' : 'flex'}`}>
                          {card.preview}
                        </div>
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                            <Toggle
                                checked={card.active}
                                onChange={() => handleToggleCardActive(card.id, card.active)}
                                small
                            />
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setOpenDropdown(openDropdown === card.id ? null : card.id)}
                                    className="text-gray-600 hover:bg-gray-200"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                {openDropdown === card.id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <button
                                            onClick={() => handleEditCard(card.id)}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
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