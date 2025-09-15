"use client"
import { useState } from "react";
import Button from "../../../components/forms/Button";
import OccasionCard from "../../../components/forms/OccasionCard";
import CreateOccasionModal from "../../../components/forms/CreateOccasionModal";
import { Plus } from "lucide-react";
import CardDesigns from "../../../components/occasions/CardDesigns";

const OccasionsManager = () => {
  const [occasions, setOccasions] = useState([
    {
      id: 1,
      name: 'Birthday',
      emoji: '🎂',
      description: 'Celebrate another year of life',
      cardCount: 0,
      active: true
    },
    {
      id: 2,
      name: 'Congratulations',
      emoji: '🎉',
      description: 'Celebrate achievements',
      cardCount: 0,
      active: true
    },
    {
      id: 3,
      name: 'Thank You',
      emoji: '🙏',
      description: 'Show your appreciation',
      cardCount: 0,
      active: true
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('occasions'); // 'occasions' or 'cards'
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  
  const handleAddOccasion = (newOccasion) => {
    const occasion = {
      ...newOccasion,
      id: Date.now(),
      cardCount: 0
    };
    setOccasions([...occasions, occasion]);
  };
  
  const handleEditOccasion = (occasion) => {
    console.log('Edit occasion:', occasion);
    // Implement edit functionality - could open a modal or navigate to edit page
  };
  
  const handleViewCards = (occasion) => {
    setSelectedOccasion(occasion);
    setCurrentView('cards');
  };
  
  const handleBackToOccasions = () => {
    setCurrentView('occasions');
    setSelectedOccasion(null);
  };

  // Render CardDesigns view
  if (currentView === 'cards' && selectedOccasion) {
    return (
      <CardDesigns 
        occasion={selectedOccasion}
        onBack={handleBackToOccasions}
        onEditOccasion={handleEditOccasion}
      />
    );
  }
  

  
  // Render Occasions view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Occasions & Cards Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage occasions and their associated card designs ({occasions.length} occasions)
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Add Occasion
          </Button>
        </div>
        
        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.map((occasion) => (
            <OccasionCard
              key={occasion.id}
              occasion={occasion}
              onEdit={handleEditOccasion}
              onViewCards={handleViewCards}
            />
          ))}
        </div>
        
        {/* Empty State */}
        {occasions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No occasions yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first occasion.</p>
            <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
              Add Your First Occasion
            </Button>
          </div>
        )}
        
        {/* Create Occasion Modal */}
        <CreateOccasionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddOccasion}
        />
      </div>
    </div>
  );
};

export default OccasionsManager;