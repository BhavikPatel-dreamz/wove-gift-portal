"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Loader, Search, Edit, ChevronRight, ChevronLeft, SortAsc, SortDesc, Eye } from "lucide-react";
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
  const [modalOpen, setModalOpen] = useState(false);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch occasions function
  const fetchOccasions = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      };

      const result = await getOccasions(params);

      if (result.success) {
        setOccasions(result.data || []);
        
        if (result.meta?.pagination) {
          setTotalItems(result.meta.pagination.totalItems);
          setTotalPages(result.meta.pagination.totalPages);
        }
      } else {
        toast.error(result.message || "Failed to load occasions");
        setOccasions([]);
      }
    } catch (error) {
      console.error("Error fetching occasions:", error);
      toast.error("Error loading occasions");
      setOccasions([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, sortBy, sortOrder]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchOccasions();
  }, [fetchOccasions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, sortOrder, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortByChange = (value) => {
    setSortBy(value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(parseInt(newLimit));
    setCurrentPage(1);
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
        setCurrentPage(1);
        await fetchOccasions();
        setCurrentView("cards");
        setSelectedOccasion(result?.data);
        setModalOpen(true);
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
        await fetchOccasions();
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
        
        // If we're on the last item of a page (not page 1), go back one page
        if (occasions.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          await fetchOccasions();
        }
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
    fetchOccasions();
  };

  // Generate page numbers for pagination
  const getPageNumbers = useMemo(() => {
    const pages = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Pagination info
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

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
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />
    );
  }

  console.log("occasions",occasions);
  

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="60" rx="6" fill="#1F59EE" fillOpacity="0.08" />
              <g clipPath="url(#clip0_1859_7809)">
                <path d="M21.3378 29.0137L18.268 37.2019V37.2026C19.0192 40.2036 20.6704 42.8566 23.0077 44.8577L26.8594 43.4134C22.7683 39.7492 20.749 34.3595 21.3378 29.0137ZM17.2287 39.9736L14.8757 46.2476C14.5945 46.997 15.3276 47.7382 16.0825 47.4544L21.0466 45.5933C19.4049 43.9993 18.1058 42.0871 17.2287 39.9736Z" fill="#1F59EE" />
                <path d="M27.9187 28.2502L24.4195 24.7511C21.5824 31.1508 23.522 38.4657 28.8748 42.6581L32.6096 41.2576C29.3296 37.8703 27.5555 33.1423 27.9187 28.2502ZM29.7492 30.0808C29.8929 34.0586 31.6253 37.8178 34.5564 40.527H34.557L37.2943 39.5008C37.9337 39.2608 38.1087 38.4402 37.6281 37.9596L29.7492 30.0808ZM36.5961 33.0259C36.9622 33.392 37.5558 33.392 37.9219 33.0259C41.4486 29.4991 44.8828 30.5895 44.9171 30.6008C45.4082 30.7645 45.9391 30.4991 46.1029 30.0079C46.2667 29.5169 46.0011 28.9859 45.51 28.8221C45.3251 28.7606 40.9332 27.363 36.5962 31.7002C36.23 32.0662 36.23 32.6598 36.5961 33.0259ZM30.6304 25.7341C34.9676 21.3975 33.5696 17.0053 33.5083 16.8203C33.3446 16.3291 32.8134 16.0641 32.3221 16.2278C31.8315 16.3916 31.5659 16.9222 31.7297 17.4134C31.7409 17.4478 32.8315 20.8819 29.3042 24.4086C28.9404 24.7724 28.9367 25.3655 29.3042 25.7341C29.6722 26.1021 30.2653 26.0992 30.6304 25.7341ZM32.6189 27.723C32.2528 28.0891 32.2528 28.6826 32.6189 29.0487C32.9816 29.4115 33.571 29.4162 33.939 29.0543C34.4233 28.813 35.9265 29.718 36.7619 28.8829C37.5883 28.0565 36.7102 26.5839 36.9295 26.0678C37.4463 25.8479 38.9184 26.7264 39.7448 25.9001C40.5713 25.0736 39.6933 23.601 39.9126 23.0849C40.4301 22.8649 41.9013 23.7435 42.7277 22.9171C43.5543 22.0907 42.6762 20.6181 42.8955 20.1019C43.41 19.8831 44.8849 20.7597 45.7108 19.9341C46.5458 19.099 45.6424 17.5931 45.8819 17.1113C46.2425 16.7449 46.2406 16.1555 45.8764 15.7912C45.5103 15.4251 44.9167 15.4251 44.5506 15.7912C43.8118 16.5301 43.9563 17.5732 44.0955 18.319C43.3497 18.1798 42.3067 18.0352 41.5678 18.7741C40.8289 19.513 40.9734 20.5561 41.1126 21.3018C40.3668 21.1627 39.3237 21.018 38.5848 21.757C37.8459 22.4959 37.9905 23.539 38.1297 24.2848C37.3838 24.1456 36.3408 24.001 35.6019 24.7399C34.863 25.4788 35.0076 26.5219 35.1468 27.2677C34.4009 27.1286 33.3577 26.9841 32.6189 27.723ZM37.9219 19.7684C38.288 19.4023 38.288 18.8088 37.9219 18.4427C37.5558 18.0766 36.9622 18.0766 36.5961 18.4427C36.23 18.8088 36.23 19.4023 36.5961 19.7684C36.9622 20.1345 37.5558 20.1345 37.9219 19.7684Z" fill="#1F59EE" />
              </g>
            </svg>

            <div>
              <h1 className="text-[22px] font-semibold text-[#1A1A1A]">Occasions Manager</h1>
              <p className="text-[#64748B] text-sm font-medium">Manage your occasions and card designs</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingOccasion(null);
              setIsModalOpen(true);
            }}
            disabled={actionLoading}
            className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? <Loader className="animate-spin" size={14} /> : <Plus size={14} />}
            Add New Occasion
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-[10px] border-t border-r border-l border-[#E2E8F0] shadow-[0_0_60px_0_rgba(0,0,0,0.06)] p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search occasions by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg outline-none"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="updatedAt">Updated Date</option>
              </select>
              <button
                onClick={handleSortOrderToggle}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Occasions Header with Pagination Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Occasions List</h2>
            <span className="bg-[rgba(15,100,246,0.10)] text-[#0F64F6] px-2 py-1 rounded-[3px] border border-[rgba(15,100,246,0.20)] text-sm font-medium">
              {totalItems} occasions
            </span>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#A6A6A6]">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="px-1 py-1 border border-[#E2E8F0] rounded-lg text-xs outline-none"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-[#A6A6A6]">per page</span>
          </div>
        </div>

        {/* Occasions Grid */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg min-h-[400px]">
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-lg">
                <Loader className="animate-spin text-blue-600" size={20} />
                <span className="text-gray-700">Loading...</span>
              </div>
            </div>
          )}

          {occasions.length > 0 ? (
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
          ) : !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No occasions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first occasion'}
              </p>
              {!searchTerm && (
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && occasions.length > 0 && (
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex} to {endIndex} of {totalItems} occasions
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage || loading}
                className="p-2 border border-gray-300 text-black cursor-pointer rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1">
                {getPageNumbers.map((pageNum, index) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage || loading}
                className="p-2 border border-gray-300 text-black cursor-pointer rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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