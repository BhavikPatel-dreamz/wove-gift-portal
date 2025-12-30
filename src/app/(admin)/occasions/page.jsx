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
  const [modalOpen,setModalOpen]= useState(false);

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

      console.log("result", result);


      if (result.success) {
        setOccasions(result.data || []);
        setPagination(result.meta.pagination);
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
        setCurrentView("cards");
        setSelectedOccasion(result?.data)
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
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="60" rx="6" fill="#1F59EE" fill-opacity="0.08" />
              <g clip-path="url(#clip0_1859_7809)">
                <path d="M21.3378 29.0137L18.268 37.2019V37.2026C19.0192 40.2036 20.6704 42.8566 23.0077 44.8577L26.8594 43.4134C22.7683 39.7492 20.749 34.3595 21.3378 29.0137ZM17.2287 39.9736L14.8757 46.2476C14.5945 46.997 15.3276 47.7382 16.0825 47.4544L21.0466 45.5933C19.4049 43.9993 18.1058 42.0871 17.2287 39.9736Z" fill="#1F59EE" />
                <path d="M27.9187 28.2502L24.4195 24.7511C21.5824 31.1508 23.522 38.4657 28.8748 42.6581L32.6096 41.2576C29.3296 37.8703 27.5555 33.1423 27.9187 28.2502ZM29.7492 30.0808C29.8929 34.0586 31.6253 37.8178 34.5564 40.527H34.557L37.2943 39.5008C37.9337 39.2608 38.1087 38.4402 37.6281 37.9596L29.7492 30.0808ZM36.5961 33.0259C36.9622 33.392 37.5558 33.392 37.9219 33.0259C41.4486 29.4991 44.8828 30.5895 44.9171 30.6008C45.4082 30.7645 45.9391 30.4991 46.1029 30.0079C46.2667 29.5169 46.0011 28.9859 45.51 28.8221C45.3251 28.7606 40.9332 27.363 36.5962 31.7002C36.23 32.0662 36.23 32.6598 36.5961 33.0259ZM30.6304 25.7341C34.9676 21.3975 33.5696 17.0053 33.5083 16.8203C33.3446 16.3291 32.8134 16.0641 32.3221 16.2278C31.8315 16.3916 31.5659 16.9222 31.7297 17.4134C31.7409 17.4478 32.8315 20.8819 29.3042 24.4086C28.9404 24.7724 28.9367 25.3655 29.3042 25.7341C29.6722 26.1021 30.2653 26.0992 30.6304 25.7341ZM32.6189 27.723C32.2528 28.0891 32.2528 28.6826 32.6189 29.0487C32.9816 29.4115 33.571 29.4162 33.939 29.0543C34.4233 28.813 35.9265 29.718 36.7619 28.8829C37.5883 28.0565 36.7102 26.5839 36.9295 26.0678C37.4463 25.8479 38.9184 26.7264 39.7448 25.9001C40.5713 25.0736 39.6933 23.601 39.9126 23.0849C40.4301 22.8649 41.9013 23.7435 42.7277 22.9171C43.5543 22.0907 42.6762 20.6181 42.8955 20.1019C43.41 19.8831 44.8849 20.7597 45.7108 19.9341C46.5458 19.099 45.6424 17.5931 45.8819 17.1113C46.2425 16.7449 46.2406 16.1555 45.8764 15.7912C45.5103 15.4251 44.9167 15.4251 44.5506 15.7912C43.8118 16.5301 43.9563 17.5732 44.0955 18.319C43.3497 18.1798 42.3067 18.0352 41.5678 18.7741C40.8289 19.513 40.9734 20.5561 41.1126 21.3018C40.3668 21.1627 39.3237 21.018 38.5848 21.757C37.8459 22.4959 37.9905 23.539 38.1297 24.2848C37.3838 24.1456 36.3408 24.001 35.6019 24.7399C34.863 25.4788 35.0076 26.5219 35.1468 27.2677C34.4009 27.1286 33.3577 26.9841 32.6189 27.723ZM37.9219 19.7684C38.288 19.4023 38.288 18.8088 37.9219 18.4427C37.5558 18.0766 36.9622 18.0766 36.5961 18.4427C36.23 18.8088 36.23 19.4023 36.5961 19.7684C36.9622 20.1345 37.5558 20.1345 37.9219 19.7684Z" fill="#1F59EE" />
                <path d="M43.8877 26.6718C44.4054 26.6718 44.8251 26.2521 44.8251 25.7343C44.8251 25.2166 44.4054 24.7969 43.8877 24.7969C43.37 24.7969 42.9503 25.2166 42.9503 25.7343C42.9503 26.2521 43.37 26.6718 43.8877 26.6718Z" fill="#1F59EE" />
                <path d="M41.8991 34.352C41.533 34.7181 41.533 35.3116 41.8991 35.6777C42.2652 36.0438 42.8587 36.0438 43.2248 35.6777C43.5909 35.3116 43.5909 34.7181 43.2248 34.352C42.8588 33.9859 42.2652 33.9859 41.8991 34.352ZM28.6416 21.0944C29.0077 20.7283 29.0077 20.1348 28.6416 19.7687C28.2755 19.4026 27.682 19.4026 27.3159 19.7687C26.9498 20.1348 26.9498 20.7283 27.3159 21.0944C27.682 21.4606 28.2756 21.4606 28.6416 21.0944Z" fill="#1F59EE" />
              </g>
              <defs>
                <clipPath id="clip0_1859_7809">
                  <rect width="32" height="32" fill="white" transform="translate(14.4827 15.5166)" />
                </clipPath>
              </defs>
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
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg   outline-none"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg   outline-none"
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
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Occasions List</h2>
            <span className="bg-[rgba(15,100,246,0.10)] text-[#0F64F6] px-2 py-1 rounded-[3px] border border-[rgba(15,100,246,0.20)] text-sm font-medium">
              {pagination?.totalItems} occasions
            </span>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#A6A6A6]">Show:</span>
            <select
              value={pagination?.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className="px-1 py-1 border border-[#E2E8F0] rounded-lg text-xs   outline-none"
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

        {/* Loading overlay */}
        {/* {loading && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-10 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-lg">
              <Loader className="animate-spin" size={20} />
              <span>Loading occasions...</span>
            </div>
          </div>
        )} */}

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
              {/* <button
                onClick={() => handlePageChange(pagination?.currentPage - 1)}
                disabled={!pagination?.hasPrevPage || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Previous
              </button> */}
              <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
                <button
                  onClick={() => dispatch(goBack())}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 
                             transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-all duration-300 group-hover:[&amp;&gt;path]:fill-white"><path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)"></path><defs><linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse"><stop stopColor="#ED457D"></stop><stop offset="1" stopColor="#FA8F42"></stop></linearGradient></defs></svg>
                  <span className="text-base font-semibold text-gray-800">
                    Previous
                  </span>
                </button>
              </div>

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
                      className={`px-3 py-2 rounded-lg ${pageNum === pagination?.currentPage
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
