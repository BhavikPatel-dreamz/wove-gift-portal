import { useState, useEffect, useRef } from "react";
import Button from "../forms/Button";
import Badge from "../forms/Badge";
import Card from "../forms/Card";
import Toggle from "../forms/Toggle";
import { ArrowLeft, Edit3, Plus, MoreVertical, Trash2, Copy, Loader2, Search, Filter, SortDesc, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import CreateNewCard from "./CreateNewCard";
import { getOccasionCategories, updateOccasionCategory, deleteOccasionCategory, getOccasionCategoryById } from "../../lib/action/occasionAction";

const CardDesigns = ({ occasion: initialOccasion, onBack, modalOpen,setModalOpen, onCardCountChange }) => {
  console.log("initialOccasion",modalOpen);
  
  const [occasion, setOccasion] = useState(initialOccasion);
  const [cards, setCards] = useState([]);
  const [isCreatingCard, setIsCreatingCard] = useState(modalOpen ? modalOpen :false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const dropdownRef = useRef(null);

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
  }, [openDropdown]);

  // Fetch occasion categories when component mounts or occasion.id changes
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getOccasionCategories({
          occasionId: occasion.id,
          isActive: filterStatus === 'all' ? undefined : filterStatus === 'active',
          page: currentPage,
          limit: 10, // Testing limit
          search: searchTerm,
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
  }, [occasion.id, currentPage, searchTerm, filterStatus, sortBy]);

  const handleSaveNewCard = (newCardData) => {
    const newCard = {
      id: newCardData.id,
      title: newCardData.name,
      description: newCardData.description || `For ${occasion.name}`,
      preview: newCardData.emoji,
      imageUrl: newCardData.image,
      category: newCardData.category,
      active: newCardData.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCards(prevCards => [...prevCards, newCard]);
    onCardCountChange();
  };

  const handleUpdateCard = (updatedCardData) => {
    setCards(prevCards => prevCards.map(card =>
      card.id === updatedCardData.id ? {
        ...card,
        title: updatedCardData.name,
        description: updatedCardData.description || `For ${occasion.name}`,
        preview: updatedCardData.emoji,
        imageUrl: updatedCardData.image,
        category: updatedCardData.category,
        active: updatedCardData.isActive,
        updatedAt: new Date().toISOString()
      } : card
    ));
    setEditingCardId(null);
    setCardToEdit(null);
    onCardCountChange();
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card design?')) {
      setLoading(true);
      const result = await deleteOccasionCategory(cardId);
      if (result.success) {
        setCards(cards.filter(card => card.id !== cardId));
        onCardCountChange();
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
      onCardCountChange();
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
  };

  const handleBackFromCreateEdit = () => {
    setIsCreatingCard(false);
    setEditingCardId(null);
    setCardToEdit(null);
  };

  // Cards are now filtered and sorted by the server.
  const filteredAndSortedCards = cards;

  const activeCards = cards.filter(card => card.active).length;
  const inactiveCards = cards.filter(card => !card.active).length;

  if (isCreatingCard) {
    return <CreateNewCard occasion={occasion} onBack={handleBackFromCreateEdit} onSave={handleSaveNewCard} setModalOpen={setModalOpen}/>;
  }

  if (editingCardId && cardToEdit) {
    return <CreateNewCard occasion={occasion} onBack={handleBackFromCreateEdit} onSave={handleUpdateCard} initialCardData={cardToEdit} setModalOpen={setModalOpen} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                {occasion.emoji !== "Select Emoji" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xl border border-indigo-100">
                      {occasion.emoji}
                    </div>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-[22px] font-semibold text-[#1A1A1A] truncate">{occasion.name}</h1>
                    <Badge
                      variant={occasion.active ? 'success' : 'default'}
                      className={occasion.active ? 'bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1' : 'bg-gray-50 text-gray-600 border-gray-200 text-xs px-2 py-1'}
                    >
                      {occasion.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-[#64748B] text-sm leading-relaxed font-medium">{occasion.description}</p>

                  {/* Stats */}

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 w-full border border-gray-300 rounded-md text-[#4A4A4A] transition-colors duration-200 text-xs"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none pl-8 pr-7 py-2 border border-gray-300 rounded-md text-[#4A4A4A] bg-white transition-colors duration-200 text-sm"
                  >
                    <option value="all">All Cards</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-8 pr-7 py-2 border border-gray-300 rounded-md text-[#4A4A4A] bg-white transition-colors duration-200 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                  </select>
                  <SortDesc className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                </div>
              </div>

              {/* Results count */}
              <div className="text-sm text-[#A6A6A6]">
                Showing <span className="text-[#4A4A4A]">{filteredAndSortedCards.length}</span> of <span className="text-[#4A4A4A]">{totalCards}</span> cards
              </div>
            </div>
          </div>
        </div>

        {/* Card Designs Section */}
        <div className="bg-[#FAFBFC] rounded-t-[10px] border border-[#E5E7EB] overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between items-center border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Card Designs</h2>
              <p className="text-[#64748B] text-sm font-medium">Manage your card design collection</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{activeCards}</span> Active
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{inactiveCards}</span> Inactive
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{totalCards}</span> Total
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center w-full h-full px-8 py-24">
              <div className="flex items-center gap-2">
                <Loader className="animate-spin text-gray-600" size={20} />
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
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Try Again
              </Button>
            </div>
          ) : filteredAndSortedCards.length === 0 ? (
            <div className="text-center px-8 py-24">
              {searchTerm || filterStatus !== 'all' ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cards Found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    No card designs match your current search and filter criteria.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
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
                {filteredAndSortedCards.map((card) => (
                  <Card key={card.id} className="group relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                    {/* Card Image/Preview */}
                    <div className="aspect-[4/4] relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 ${card.imageUrl ? 'hidden' : 'flex'}`}>
                        {card.preview}
                      </div>

                      {/* Status Overlay */}
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={card.active ? 'success' : 'default'}
                          className={`text-xs font-medium ${card.active
                            ? 'bg-[#DDFCE9] text-[#10B981] border-[#10B981]'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                        >
                          {card.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
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
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="px-3 py-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="px-3 py-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </nav>
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