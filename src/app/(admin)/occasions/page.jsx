"use client";
import { useState, useEffect } from "react";
import { Plus, Loader, Search, Edit, Trash2, ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc, Eye } from "lucide-react";
import CardDesigns from "@/components/occasions/CardDesigns";
import Button from "@/components/forms/Button";
import { getOccasions, addOccasion, updateOccasion, deleteOccasion } from "../../../lib/action/occasionAction";
import { toast } from "react-hot-toast";
import CreateOccasionModal from "@/components/forms/CreateOccasionModal";
import OccasionCard from "@/components/forms/OccasionCard";

const OccasionsManager = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState(null);
  const [currentView, setCurrentView] = useState("occasions");
  const [selectedOccasion, setSelectedOccasion] = useState(null);

  // Filter and search states
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Debounce hook for search
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchOccasions = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : pagination?.currentPage;
      
      const params = {
        page: currentPage,
        limit: pagination?.itemsPerPage,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const result = await getOccasions(params);
      
      if (result.success) {
        setOccasions(result.data || []);
        setPagination(result.pagination);
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
    fetchOccasions(true);
  }, [debouncedSearch, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    if (pagination?.currentPage > 1) {
      fetchOccasions(false);
    }
  }, [pagination?.currentPage]);

  const handleFilterChange = (key, value) => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newLimit,
      currentPage: 1
    }));
    fetchOccasions(true);
  };

  const handleAddOccasion = async (newOccasion) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      
      Object.keys(newOccasion).forEach(key => {
        if (newOccasion[key] !== null && newOccasion[key] !== undefined) {
          formData.append(key, newOccasion[key]);
        }
      });

      const result = await addOccasion(formData);

      if (result.success) {
        toast.success("Occasion added successfully");
        setIsModalOpen(false);
        await fetchOccasions(true);
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
      
      formData.append('id', editingOccasion.id);
      
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
        await fetchOccasions(false);
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
        await fetchOccasions(false);
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

  const handleCardCountChange = () => {
    fetchOccasions(false); // Re-fetch occasions to update card counts
  };

  if (loading && occasions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={20} />
          Loading occasions...
        </div>
      </div>
    );
  }

  if (currentView === "cards" && selectedOccasion) {
    return (
      <CardDesigns
        occasion={selectedOccasion}
        onBack={handleBackToOccasions}
        onEditOccasion={handleEditOccasion}
        onCardCountChange={handleCardCountChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <div className="text-white text-lg">🎉</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Occasions Manager</h1>
              <p className="text-gray-600">Manage your occasions and card designs</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingOccasion(null);
              setIsModalOpen(true);
            }}
            disabled={actionLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
            Add New Occasion
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search occasions by name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="updatedAt">Updated Date</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Occasions Header with Pagination Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Occasions List</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {pagination?.totalItems} occasions
            </span>
            {pagination?.totalItems > 0 && (
              <span className="text-sm text-gray-600">
                Showing {pagination?.startIndex}-{pagination?.endIndex} of {pagination?.totalItems}
              </span>
            )}
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pagination?.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-10 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-lg">
              <Loader className="animate-spin" size={20} />
              <span>Loading occasions...</span>
            </div>
          </div>
        )}

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
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

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">
              Page {pagination?.currentPage} of {pagination?.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination?.currentPage - 1)}
                disabled={!pagination?.hasPrevPage || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination?.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination?.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination?.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination?.currentPage >= pagination?.totalPages - 2) {
                    pageNum = pagination?.totalPages - 4 + i;
                  } else {
                    pageNum = pagination?.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg ${
                        pageNum === pagination?.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination?.currentPage + 1)}
                disabled={!pagination?.hasNextPage || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {occasions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No occasions found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search ? 'Try adjusting your search criteria' : 'Get started by adding your first occasion'}
            </p>
            {!filters.search && (
              <Button
                onClick={() => {
                  setEditingOccasion(null);
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Occasion
              </Button>
            )}
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
