import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Button from "../forms/Button";
import Badge from "../forms/Badge";
import Card from "../forms/Card";
import Toggle from "../forms/Toggle";
import { ArrowLeft, Edit3, Plus, MoreVertical, Trash2, Copy, Loader2, Search, Filter, SortDesc, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import CreateNewCard from "./CreateNewCard";
import { getOccasionCategories, updateOccasionCategory, deleteOccasionCategory, getOccasionCategoryById } from "../../lib/action/occasionAction";

const CardDesigns = ({ occasion: initialOccasion, onBack, modalOpen, setModalOpen, onCardCountChange }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State from URL for CardDesigns
  const currentPage = Number(searchParams.get('cardPage')) || 1;
  const searchTermFromUrl = searchParams.get('cardSearch') || '';
  const filterStatus = searchParams.get('cardFilter') || 'all';
  const sortBy = searchParams.get('cardSortBy') || 'newest';
  const itemsPerPage = Number(searchParams.get('cardLimit')) || 12;

  const [occasion] = useState(initialOccasion); // Remove setOccasion as it's not used
  const [cards, setCards] = useState([]);
  const [isCreatingCard, setIsCreatingCard] = useState(modalOpen || false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const dropdownRef = useRef(null);

  // Pagination info
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCards);


  // Local state for controlled search input
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTermFromUrl);

  // Ref to track if we're currently fetching to prevent duplicate calls
  const fetchingRef = useRef(false);
  const lastFetchParamsRef = useRef('');

  // Debounce search term and update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTermFromUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (localSearchTerm) {
          params.set('cardSearch', localSearchTerm);
        } else {
          params.delete('cardSearch');
        }
        params.set('cardPage', '1'); // Reset page on new search
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTermFromUrl, pathname, router, searchParams]);

  // Sync search input with URL when URL changes externally
  useEffect(() => {
    setLocalSearchTerm(searchTermFromUrl);
  }, [searchTermFromUrl]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Memoized fetch function to prevent unnecessary recreations
  const fetchCards = useCallback(async () => {
    // Create a unique key for this fetch request
    const fetchKey = `${occasion.id}-${currentPage}-${searchTermFromUrl}-${filterStatus}-${sortBy}-${itemsPerPage}`;

    // Prevent duplicate fetches
    if (fetchingRef.current || lastFetchParamsRef.current === fetchKey) {
      return;
    }

    try {
      fetchingRef.current = true;
      lastFetchParamsRef.current = fetchKey;
      setLoading(true);
      setError(null);

      const result = await getOccasionCategories({
        occasionId: occasion.id,
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active',
        page: currentPage,
        limit: itemsPerPage,
        search: searchTermFromUrl || undefined,
        sortBy: sortBy === 'name' ? 'name' : 'createdAt',
        sortOrder: sortBy === 'oldest' ? 'asc' : 'desc',
      });

      if (result.success) {
        const transformedCards = result.data.map(category => ({
          id: category.id,
          title: category.name,
          description: category.description || `For ${occasion.name}`,
          preview: category.emoji,
          imageUrl: category.image,
          category: category.category,
          active: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }));

        setCards(transformedCards);
        setTotalPages(result.meta.pagination.totalPages);
        setTotalCards(result.meta.pagination.totalItems);
      } else {
        setError(result.message || 'Failed to fetch card designs');
        setCards([]);
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load card designs. Please try again.');
      setCards([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [occasion.id, occasion.name, currentPage, searchTermFromUrl, filterStatus, sortBy, itemsPerPage]);

  // Fetch cards when dependencies change
  useEffect(() => {
    if (occasion.id && !isCreatingCard && !editingCardId) {
      fetchCards();
    }
  }, [occasion.id, fetchCards, isCreatingCard, editingCardId]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('cardPage', String(newPage));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [totalPages, loading, searchParams, pathname, router]);

  const handleFilterChange = useCallback((newFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('cardFilter', newFilter);
    params.set('cardPage', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handleSortChange = useCallback((newSort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('cardSortBy', newSort);
    params.set('cardPage', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handleSaveNewCard = useCallback((newCardData) => {
    // Reset fetch tracking to allow new fetch
    lastFetchParamsRef.current = '';
    setIsCreatingCard(false);

    // Notify parent and refetch
    if (onCardCountChange) {
      onCardCountChange();
    }

    // Go to first page to see the new card
    const params = new URLSearchParams(searchParams.toString());
    params.set('cardPage', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [onCardCountChange, searchParams, pathname, router]);

  const handleUpdateCard = useCallback((updatedCardData) => {
    // Reset fetch tracking to allow new fetch
    lastFetchParamsRef.current = '';
    setEditingCardId(null);
    setCardToEdit(null);

    // Notify parent and refetch
    if (onCardCountChange) {
      onCardCountChange();
    }

    fetchCards();
  }, [onCardCountChange, fetchCards]);

  const handleDeleteCard = useCallback(async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card design?')) {
      try {
        setLoading(true);
        const result = await deleteOccasionCategory(cardId);

        if (result.success) {
          // Reset fetch tracking
          lastFetchParamsRef.current = '';

          // If last item on a page (not page 1), go to previous page
          if (cards.length === 1 && currentPage > 1) {
            handlePageChange(currentPage - 1);
          } else {
            // Notify parent and refetch
            if (onCardCountChange) {
              onCardCountChange();
            }
            fetchCards();
          }
        } else {
          console.error('Failed to delete card:', result.message);
          setError(result.message || 'Failed to delete card');
        }
      } catch (err) {
        console.error('Error deleting card:', err);
        setError('Failed to delete card');
      } finally {
        setLoading(false);
        setOpenDropdown(null);
      }
    }
  }, [cards.length, currentPage, onCardCountChange, fetchCards, handlePageChange]);

  const handleToggleCardActive = useCallback(async (cardId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append('id', cardId);
      formData.append('isActive', !currentStatus);

      const result = await updateOccasionCategory(formData);

      if (result.success) {
        // Optimistic update
        setCards(prevCards => prevCards.map(card =>
          card.id === cardId ? { ...card, active: !currentStatus } : card
        ));

        if (onCardCountChange) {
          onCardCountChange();
        }
      } else {
        console.error('Failed to update card active status:', result.message);
        setError(result.message || 'Failed to update card status');
      }
    } catch (err) {
      console.error('Error toggling card active:', err);
      setError('Failed to update card status');
    }
  }, [onCardCountChange]);

  const handleEditCard = useCallback(async (cardId) => {
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
          category: category.category,
          active: category.isActive,
        };

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
  }, []);

  const handleBackFromCreateEdit = useCallback(() => {
    setIsCreatingCard(false);
    setEditingCardId(null);
    setCardToEdit(null);
  }, []);

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

  const handleClearFilters = useCallback(() => {
    setLocalSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cardSearch');
    params.set('cardFilter', 'all');
    params.set('cardPage', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Memoized calculations
  const activeCards = useMemo(() => cards.filter(card => card.active).length, [cards]);
  const inactiveCards = useMemo(() => cards.filter(card => !card.active).length, [cards]);

  const handleItemsPerPageChange = (newLimit) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('cardLimit', String(newLimit));
    params.set('cardPage', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Show create/edit views
  if (isCreatingCard) {
    return <CreateNewCard occasion={occasion} onBack={handleBackFromCreateEdit} onSave={handleSaveNewCard} setModalOpen={setModalOpen} />;
  }

  if (editingCardId && cardToEdit) {
    return <CreateNewCard occasion={occasion} onBack={handleBackFromCreateEdit} onSave={handleUpdateCard} initialCardData={cardToEdit} setModalOpen={setModalOpen} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={onBack}
                icon={ArrowLeft}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 p-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center space-x-3">
                {occasion.emoji && occasion.emoji !== "Select Emoji" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xl border border-indigo-100">
                      {occasion.emoji}
                    </div>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#1A1A1A] truncate max-w-[220px] sm:max-w-none">{occasion.name}</h1>
                    <Badge
                      variant={occasion.active ? 'success' : 'default'}
                      className={occasion.active ? 'bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1' : 'bg-gray-50 text-gray-600 border-gray-200 text-xs px-2 py-1'}
                    >
                      {occasion.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-[#64748B] text-sm leading-relaxed font-medium">{occasion.description}</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                onClick={() => setIsCreatingCard(true)}
                icon={Plus}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2 text-sm"
              >
                Create New Card
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-[0_0_60px_0_rgba(0,0,0,0.06)] mb-4 text-black">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <div className="absolute left-2 top-3.5 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="#A6A6A6" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search card designs..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 w-full border border-gray-300 rounded-md text-[#4A4A4A] transition-colors duration-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="appearance-none pl-8 pr-7 py-2 border border-gray-300 rounded-md text-[#4A4A4A] bg-white transition-colors duration-200 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="all">All Cards</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none pl-8 pr-7 py-2 border border-gray-300 rounded-md text-[#4A4A4A] bg-white transition-colors duration-200 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                  </select>
                  <SortDesc className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Results count */}
              <div className="text-xs sm:text-sm text-[#A6A6A6] self-start lg:self-auto">
                Showing <span className="text-[#4A4A4A] font-medium">{cards.length}</span> of <span className="text-[#4A4A4A] font-medium">{totalCards}</span> cards
              </div>
            </div>
          </div>
        </div>

        {/* Card Designs Section */}
        <div className="bg-[#FAFBFC] rounded-t-[10px] border border-[#E5E7EB] overflow-hidden">
          <div className="
  px-4 py-4 border-b border-gray-200
  bg-gradient-to-r from-gray-50 to-white
  flex flex-col gap-3
  sm:flex-row sm:items-center sm:justify-between
">
            {/* Title */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                Card Designs
              </h2>
              <p className="text-[#64748B] text-xs sm:text-sm font-medium">
                Manage your card design collection
              </p>
            </div>

            {/* Stats */}
            <div className="
    flex flex-wrap gap-x-4 gap-y-2
    sm:flex-nowrap sm:items-center
  ">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{activeCards}</span> Active
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <span className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{inactiveCards}</span> Inactive
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                <span className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{totalCards}</span> Total
                </span>
              </div>
            </div>
          </div>


          {/* Occasions Header with Pagination Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 m-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Occasions List</h2>
              <span className="bg-[rgba(15,100,246,0.10)] text-[#0F64F6] px-2 py-1 rounded-[3px] border border-[rgba(15,100,246,0.20)] text-sm font-medium">
                {totalCards} occasions
              </span>
            </div>

            {/* Items per page selector */}
            <div className="text-black flex items-center gap-2">
              <span className="text-sm text-[#A6A6A6]">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-1 py-1 border border-[#E2E8F0] rounded-lg text-xs outline-none"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span className="text-sm text-[#A6A6A6]">per page</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center w-full h-full px-8 py-24">
              <div className="flex items-center gap-2">
                <Loader className="animate-spin text-indigo-600" size={20} />
                <span className="text-gray-600">Loading Card Designs...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center px-8 py-24">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Cards</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
              <Button
                onClick={() => {
                  lastFetchParamsRef.current = '';
                  fetchCards();
                }}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Try Again
              </Button>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center px-8 py-24">
              {searchTermFromUrl || filterStatus !== 'all' ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cards Found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    No card designs match your current search and filter criteria.
                  </p>
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="mr-3"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <path d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                      <path d="M18 4V2" />
                      <path d="M10 4V2" />
                      <path d="M18 18v-6" />
                      <path d="M15 15h6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your First Card Design</h3>
                  <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                    Get started by creating beautiful card designs for <span className="font-semibold text-indigo-600">{occasion.name}</span>.
                    Your cards will help users express their feelings and connect with others.
                  </p>
                  <Button
                    onClick={() => setIsCreatingCard(true)}
                    icon={Plus}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Create Your First Card
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <Card key={card.id} className="group relative overflow-hidden bg-white border border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                    {/* Card Image/Preview */}
                    <div className="aspect-4/4 relative overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-5xl">
                          {card.preview}
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={card.active ? 'success' : 'default'} className="text-xs">
                          {card.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCard(card.id)}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 shadow-sm"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCard(card.id)}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-red-600 shadow-sm hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-4 border-t border-gray-100">
                      <div className="mb-4">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-[18px] text-[#1A1A1A] truncate flex-1 mr-2">{card.title}</h4>
                          <Toggle
                            checked={card.active}
                            onChange={() => handleToggleCardActive(card.id, card.active)}
                            small
                            className="flex-shrink-0"
                          />
                        </div>
                        <p className="text-sm text-[#4A4A4A] truncate mb-3">{card.description}</p>
                      </div>

                      <p className="text-xs text-[#4A4A4A] font-normal truncate">Category: {card.category}</p>
                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-[#4A4A4A]">
                        <span>
                          {new Date(card.createdAt).toLocaleDateString()}
                        </span>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpenDropdown(openDropdown === card.id ? null : card.id)}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-6 w-6"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                          {openDropdown === card.id && (
                            <div ref={dropdownRef} className="absolute right-0 bottom-full mb-1 w-40 origin-bottom-right rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                              <button
                                onClick={() => handleEditCard(card.id)}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors duration-150"
                              >
                                <Edit3 className="mr-2 h-3 w-3" /> Edit
                              </button>
                              <div className="border-t border-gray-100"></div>
                              <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-150"
                              >
                                <Trash2 className="mr-2 h-3 w-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex} to {endIndex} of {totalCards} occasions
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
                            className={`px-3 py-1 rounded-lg transition-colors ${pageNum === currentPage
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDesigns;