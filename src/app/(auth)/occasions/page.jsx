"use client";
import { useState, useEffect } from "react";
import OccasionCard from "@/components/forms/OccasionCard";
import CreateOccasionModal from "@/components/forms/CreateOccasionModal";
import { Plus, Loader } from "lucide-react";
import CardDesigns from "@/components/occasions/CardDesigns";
import Button from "@/components/forms/Button";
import { getOccasions, addOccasion, updateOccasion, deleteOccasion } from "../../../lib/action/occasionAction";
import { toast } from "react-hot-toast";

const OccasionsManager = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState(null);
  const [currentView, setCurrentView] = useState("occasions");
  const [selectedOccasion, setSelectedOccasion] = useState(null);

  const fetchOccasions = async () => {
    try {
      setLoading(true);
      // Pass query parameters as an object instead of Request
      const result = await getOccasions({
        page: 1,
        limit: 100
      });
      
      if (result.success) {
        setOccasions(result.data || []);
      } else {
        toast.error(result.message || "Failed to load occasions");
      }
    } catch (error) {
      console.error("Error fetching occasions:", error);
      toast.error("Error loading occasions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccasions();
  }, []);

  const handleAddOccasion = async (newOccasion) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(newOccasion).forEach(key => {
        if (newOccasion[key] !== null && newOccasion[key] !== undefined) {
          formData.append(key, newOccasion[key]);
        }
      });

      const result = await addOccasion(formData);

      if (result.success) {
        toast.success("Occasion added successfully");
        setIsModalOpen(false);
        await fetchOccasions(); // Refresh the list
      } else {
        toast.error(result.message || "Failed to add occasion");
      }
    } catch (error) {
      console.error("Error adding occasion:", error);
      toast.error("Failed to add occasion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOccasion = (occasion) => {
    setEditingOccasion(occasion);
    setIsModalOpen(true);
  };

  const handleUpdateOccasion = async (updatedOccasion) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      
      // Append the ID first
      formData.append('id', editingOccasion.id);
      
      // Append all other fields
      Object.keys(updatedOccasion).forEach(key => {
        if (updatedOccasion[key] !== null && updatedOccasion[key] !== undefined) {
          formData.append(key, updatedOccasion[key]);
        }
      });

      const result = await updateOccasion(formData);

      if (result.success) {
        toast.success("Occasion updated successfully");
        setIsModalOpen(false);
        setEditingOccasion(null);
        await fetchOccasions(); // Refresh the list
      } else {
        toast.error(result.message || "Failed to update occasion");
      }
    } catch (error) {
      console.error("Error updating occasion:", error);
      toast.error("Failed to update occasion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOccasion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this occasion? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(true);
      const result = await deleteOccasion(id);
      
      if (result.success) {
        toast.success("Occasion deleted successfully");
        await fetchOccasions(); // Refresh the list
      } else {
        toast.error(result.message || "Failed to delete occasion");
      }
    } catch (error) {
      console.error("Error deleting occasion:", error);
      toast.error("Failed to delete occasion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCards = (occasion) => {
    setSelectedOccasion(occasion);
    setCurrentView("cards");
  };

  const handleBackToOccasions = () => {
    setCurrentView("occasions");
    setSelectedOccasion(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={20} />
          Loading occasions...
        </div>
      </div>
    );
  }

  // Render CardDesigns view
  if (currentView === "cards" && selectedOccasion) {
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
            <h1 className="text-2xl font-bold text-gray-900">
              Occasions & Cards Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Manage occasions and their associated card designs ({occasions.length}{" "}
              {occasions.length === 1 ? 'occasion' : 'occasions'})
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingOccasion(null);
              setIsModalOpen(true);
            }}
            disabled={actionLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Add Occasion
          </Button>
        </div>

        {/* Loading overlay for actions */}
        {actionLoading && (
          <div className="fixed inset-0 bg-black/50 text-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader className="animate-spin" size={20} />
              <span>Processing...</span>
            </div>
          </div>
        )}

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.map((occasion) => (
            <OccasionCard
              key={occasion.id}
              occasion={occasion}
              onEdit={() => handleEditOccasion(occasion)}
              onDelete={() => handleDeleteOccasion(occasion.id)}
              onViewCards={handleViewCards}
              disabled={actionLoading}
            />
          ))}
        </div>

        {/* Empty State */}
        {occasions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No occasions yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first occasion.
            </p>
            <Button
              onClick={() => {
                setEditingOccasion(null);
                setIsModalOpen(true);
              }}
              disabled={actionLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <Plus size={20} />
              Add Your First Occasion
            </Button>
          </div>
        )}

        {/* Create/Edit Occasion Modal */}
        <CreateOccasionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOccasion(null);
          }}
          onSave={editingOccasion ? handleUpdateOccasion : handleAddOccasion}
          occasion={editingOccasion}
          actionLoading={actionLoading}
        />
      </div>
    </div>
  );
};

export default OccasionsManager;