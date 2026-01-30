"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Download, Eye, Gift, Calendar, ChevronLeft, ChevronRight, AlertCircle, Users, X } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getGiftCards } from '../../../lib/action/customerDashbordAction';
import GiftCardDetailModal from './GiftCardDetailModal';
import { useSession } from '@/contexts/SessionContext';

function MyGift() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 6,
    totalCount: 0,
    totalPages: 0
  });
  const [userRole, setUserRole] = useState('CUSTOMER');
  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedBulkOrder, setSelectedBulkOrder] = useState(null);
  const [bulkModalSearch, setBulkModalSearch] = useState('');
  const datePickerRef = useRef(null);
  const session = useSession();

  const tabs = [
    { id: 'all', label: 'All Gifts' },
    { id: 'sent', label: 'Sent Gifts' },
    { id: 'received', label: 'Received Gifts' },
    { id: 'expired', label: 'Expired Gifts' }
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Group gift cards by bulk order WHILE PRESERVING ORDER
  const groupGiftCards = useCallback((cards) => {
    const displayItems = [];
    const bulkOrdersProcessed = new Set();

    // Iterate through cards in their original order (already sorted by backend)
    cards.forEach(card => {
      if (card.bulkOrderNumber) {
        // Only process each bulk order once (when we encounter it first time)
        if (!bulkOrdersProcessed.has(card.bulkOrderNumber)) {
          bulkOrdersProcessed.add(card.bulkOrderNumber);
          // Collect all cards with this bulk order number
          const bulkCards = cards.filter(c => c.bulkOrderNumber === card.bulkOrderNumber);
          displayItems.push({
            type: 'bulk',
            bulkOrderNumber: card.bulkOrderNumber,
            cards: bulkCards,
            createdAt: card.purchaseDate // Use for any sorting if needed
          });
        }
        // If we've already processed this bulk order, skip it
      } else {
        // Single order - add directly
        displayItems.push({
          type: 'single',
          card: card,
          createdAt: card.purchaseDate
        });
      }
    });

    return displayItems;
  }, []);

  console.log("giftCards", giftCards)

  // Fetch gift cards data
  const fetchGiftCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {
        status: activeTab,
        searchQuery: debouncedSearch,
        page: currentPage,
        pageSize: 6,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        userEmail: session?.user?.email
      };

      const result = await getGiftCards(filters);

      if (result.success) {
        setGiftCards(result.data || []);
        setPagination(result.pagination || {
          page: 1,
          pageSize: 6,
          totalCount: 0,
          totalPages: 0
        });
        setUserRole(result.userRole || 'CUSTOMER');
        setUserId(result.userId);
      } else {
        setError(result.error || 'Failed to fetch gift cards');
        setGiftCards([]);
      }
    } catch (err) {
      console.error('Error fetching gift cards:', err);
      setError(err.message || 'An unexpected error occurred');
      setGiftCards([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, debouncedSearch, startDate, endDate, session?.user?.email]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setStartDate(null);
    setEndDate(null);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    // Only trigger API call and close picker when both dates are selected
    if (start && end) {
      setCurrentPage(1);
      setIsDatePickerOpen(false);
    }
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
    setIsDatePickerOpen(false);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/gift-cards/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: activeTab,
          searchQuery: debouncedSearch,
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gift-cards-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy code');
    }
  };

  const handleViewDetails = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleOpenBulkModal = (bulkOrderNumber, cards) => {
    setSelectedBulkOrder({ bulkOrderNumber, cards });
    setBulkModalSearch('');
    setIsBulkModalOpen(true);
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setSelectedBulkOrder(null);
    setBulkModalSearch('');
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-blue-100 text-blue-600 border-[1px] border-[#0F64F633]',
      'CLAIMED': 'bg-green-100 text-green-600 border-[1px] border-[#22C55E33]',
      'UNCLAIMED': 'bg-gray-100 text-gray-600 border-[1px] border-[#D1D5DB]',
      'EXPIRED': 'bg-red-100 text-red-600 border-[1px] border-[#EF444433]'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getGiftIconColor = (status) => {
    const colors = {
      'ACTIVE': 'from-pink-400 to-orange-400',
      'CLAIMED': 'from-orange-400 to-red-400',
      'UNCLAIMED': 'from-orange-400 to-red-500',
      'EXPIRED': 'from-gray-400 to-gray-500'
    };
    return colors[status] || 'from-pink-400 to-orange-400';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const { totalPages } = pagination;
    const buttons = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return buttons;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRedeem = (card) => {
    if (!card.brandDomain) {
      alert('Brand domain not available for this card.');
      return;
    }

    const domain = card.brandDomain.startsWith('http://') || card.brandDomain.startsWith('https://')
      ? card.brandDomain
      : `https://${card.brandDomain}`;

    window.open(`${domain}`, '_blank');
  };

  // Calculate bulk order statistics
  const getBulkOrderStats = (cards) => {
    const totalVouchers = cards.length;
    const totalAmount = cards.reduce((sum, card) => sum + card.totalAmount, 0);
    const totalRemaining = cards.reduce((sum, card) => sum + card.remaining, 0);
    const currencySymbol = cards[0]?.currencySymbol || '$';
    const avgSpent = ((totalAmount - totalRemaining) / totalAmount) * 100;

    return {
      totalVouchers,
      totalAmount,
      totalRemaining,
      currencySymbol,
      avgSpent: isNaN(avgSpent) ? 0 : avgSpent
    };
  };

  // Filter bulk modal cards based on search
  const getFilteredBulkCards = () => {
    if (!selectedBulkOrder) return [];
    if (!bulkModalSearch.trim()) return selectedBulkOrder.cards;

    const searchLower = bulkModalSearch.toLowerCase();
    return selectedBulkOrder.cards.filter(card => 
      card.code?.toLowerCase().includes(searchLower) ||
      card.receiverEmail?.toLowerCase().includes(searchLower) ||
      card.receiverName?.toLowerCase().includes(searchLower) ||
      card.orderNumber?.toLowerCase().includes(searchLower)
    );
  };

  // Render Bulk Order Card
  const renderBulkOrderCard = (bulkOrderNumber, cards) => {
    const stats = getBulkOrderStats(cards);
    const firstCard = cards[0];
    const overallStatus = firstCard.status;

    return (
      <div key={bulkOrderNumber} className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
        {/* Bulk Order Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-semibold rounded-full flex items-center gap-1">
          <Users className="w-3 h-3" />
          BULK ({stats.totalVouchers})
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${getGiftIconColor(overallStatus)} flex items-center justify-center`}>
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {firstCard.brandName}
              </h3>
              <p className="text-xs text-[#4A4A4A]">Bulk Order #{bulkOrderNumber}</p>
              <div className="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.667 2.91663H2.33366C1.68933 2.91663 1.16699 3.43896 1.16699 4.08329V9.91663C1.16699 10.561 1.68933 11.0833 2.33366 11.0833H11.667C12.3113 11.0833 12.8337 10.561 12.8337 9.91663V4.08329C12.8337 3.43896 12.3113 2.91663 11.667 2.91663Z" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1.16699 5.83337H12.8337" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex-1 font-medium text-[#75738C] text-[11px] leading-[16.5px] font-poppins">
                  {stats.totalVouchers} Vouchers
                </div>
              </div>
            </div>
          </div>

          {firstCard?.receiverEmail == session?.user?.email && (
            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(overallStatus)} whitespace-nowrap`}>
              {overallStatus}
            </span>
          )}
        </div>

        {/* Multiple Recipients Info */}
        <div className="flex items-center gap-2 mb-4 text-sm bg-[#FEF8F6] p-2 rounded-lg">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-[#ED457D]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-500 mb-0.5">
              Recipients
            </p>
            <p className="font-semibold text-[#2F2E38] text-[12px] leading-[18px] font-poppins truncate">
              Multiple Recipients
            </p>
            <p className="font-normal text-[#75738C] text-[10px] leading-[16.5px] font-poppins truncate">
              {stats.totalVouchers} vouchers sent
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">TOTAL AMOUNT</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              {stats.currencySymbol}{stats.totalAmount.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Purchase Date</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              {firstCard.purchaseDate || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => handleOpenBulkModal(bulkOrderNumber, cards)}
            className="flex-1 py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:bg-gray-50 transition-colors">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-[#4A5565]" />
            <span className="text-xs sm:text-sm font-medium text-[#4A5565]">View All {stats.totalVouchers} Vouchers</span>
          </button>
        </div>
      </div>
    );
  };

  // Render Single Order Card
  const renderSingleOrderCard = (card) => {
    const handleViewDetailsClick = (e) => {
      e.stopPropagation();
      handleViewDetails(card);
    };

    const handleRedeemClick = (e) => {
      e.stopPropagation();
      handleRedeem(card);
    };

    return (
      <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${getGiftIconColor(card.status)} flex items-center justify-center`}>
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {card.brandName}
              </h3>
              <p className="text-xs text-[#4A4A4A]">{card.orderNumber}</p>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.667 2.91663H2.33366C1.68933 2.91663 1.16699 3.43896 1.16699 4.08329V9.91663C1.16699 10.561 1.68933 11.0833 2.33366 11.0833H11.667C12.3113 11.0833 12.8337 10.561 12.8337 9.91663V4.08329C12.8337 3.43896 12.3113 2.91663 11.667 2.91663Z" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1.16699 5.83337H12.8337" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex-1 font-medium text-[#75738C] text-[11px] leading-[16.5px] font-poppins">
                  {card.code}
                </div>
              </div>
            </div>
          </div>

          {card?.receiverEmail == session?.user?.email && (
            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(card.status)} whitespace-nowrap`}>
              {card.status}
            </span>
          )}
        </div>

        {/* Receiver/Sender Info */}
        <div className="flex items-center gap-2 mb-4 text-sm bg-[#FEF8F6] p-2 rounded-lg">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8.59135 2.45459C9.45933 2.45459 10.2918 2.79939 10.9055 3.41315C11.5193 4.0269 11.8641 4.85934 11.8641 5.72732C11.8641 6.5953 11.5193 7.42773 10.9055 8.04149C10.2918 8.65524 9.45933 9.00004 8.59135 9.00004C7.72337 9.00004 6.89094 8.65524 6.27718 8.04149C5.66343 7.42773 5.31863 6.5953 5.31863 5.72732C5.31863 4.85934 5.66343 4.0269 6.27718 3.41315C6.89094 2.79939 7.72337 2.45459 8.59135 2.45459ZM8.59135 15.5455C8.59135 15.5455 15.1368 15.5455 15.1368 13.9091C15.1368 11.9455 11.9459 9.81823 8.59135 9.81823C5.23681 9.81823 2.0459 11.9455 2.0459 13.9091C2.0459 15.5455 8.59135 15.5455 8.59135 15.5455Z" fill="#ED457D" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-500 mb-0.5">
              {card.isSent ? 'Receiver' : 'Sender'}
            </p>
            <p className="font-semibold text-[#2F2E38] text-[12px] leading-[18px] font-poppins truncate">
              {card.receiverName || 'N/A'}
            </p>
            <p className="font-normal text-[#75738C] text-[10px] leading-[16.5px] font-poppins truncate">
              {card.receiverEmail || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">TOTAL AMOUNT</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              {card.currencySymbol}{card.totalAmount.toFixed(2)}
            </p>
          </div>
         <div>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Purchase Date</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              {card.purchaseDate || "N/A"}
            </p>
          </div>
        </div>

        {card?.receiverEmail == session?.user?.email && (
          <div>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${card.spent}%` }}
                ></div>
              </div>
              <p className="mt-1 font-normal text-[#75738C] text-[10px] leading-[15px] font-[Arial]">
                {card.spent}% spent
              </p>
            </div>

            {/* Labels */}
            <div className="flex justify-between mb-1 border-b border-[#F3F4F6] pb-2 mb-3">
              <div>
                <div className='flex gap-2 items-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5.33301 0.833374V3.50004" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.667 0.833374V3.50004" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.6667 2.16663H3.33333C2.59695 2.16663 2 2.76358 2 3.49996V12.8333C2 13.5697 2.59695 14.1666 3.33333 14.1666H12.6667C13.403 14.1666 14 13.5697 14 12.8333V3.49996C14 2.76358 13.403 2.16663 12.6667 2.16663Z" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 6.16663H14" stroke="#99A1AF" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <div className="font-normal text-[#75738C] text-[12px] leading-[13.5px] tracking-[0.225px] uppercase font-[Arial]">
                      Last Redemption
                    </div>
                    <div className="text-[12px] leading-[16px] text-[#2F2E38] font-medium mt-1">
                      {card.purchaseDate || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-right font-normal text-[#75738C] text-[12px] leading-[13.5px] tracking-[0.225px] uppercase font-[Arial]">
                  Expires
                </div>
                <div className="text-[12px] leading-[16px] text-[#FF6B00] font-medium mt-1">
                  {card.expires || "No Expiry"}
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleViewDetailsClick}
                className="flex-1 py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:bg-gray-50 transition-colors">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-[#4A5565]" />
                <span className="text-xs sm:text-sm font-medium text-[#4A5565]">View Details</span>
              </button>
              {card.status !== 'EXPIRED' && card.status !== 'CLAIMED' && card.isReceived && (
                <button 
                  onClick={handleRedeemClick} 
                  className="flex-1 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:shadow-lg transition-all">
                  <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Redeem</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get display items preserving order
  const displayItems = groupGiftCards(giftCards);

  return (
    <div className="min-h-screen py-8 sm:py-30 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 mb-8 bg-[#FEF8F7] p-2 mt-5 sm:mt-0 sm:p-3 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[calc(50%-4px)] sm:min-w-0 sm:w-[150px] lg:w-[300px] h-[40px] sm:h-[50px] px-3 sm:px-8 py-2 sm:py-3 rounded-lg text-xs sm:text-base font-medium transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-400 to-orange-400 text-[#FFFFFF] shadow-lg'
                : 'bg-white border border-[1px] border-[#1A1A1A1A] rounded-[10px] text-[#000000] hover:bg-gray-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] mb-2">
            Vouchers & Gift Cards
          </h1>
          <p className="text-sm sm:text-base text-[#4A4A4A]">
            {userRole === 'ADMIN'
              ? 'Track and manage all user-purchased vouchers and gift cards.'
              : `View and manage your ${activeTab === 'sent' ? 'sent' : activeTab === 'received' ? 'received' : ''} vouchers and gift cards.`}
          </p>
        </div>

        {/* Copy Success Toast */}
        {copySuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
            Code copied to clipboard!
          </div>
        )}

        {/* Search and Actions */}
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 mb-8">
          <div className="relative w-full sm:w-[619px] h-[40px] border border-[#E5E7EB] rounded-lg flex items-center px-4">
            <Search className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by code, receiver email, or brand"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-full pl-3 text-sm text-gray-900 placeholder:text-[#9CA3AF] bg-transparent border-none focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hidden sm:block flex-1"></div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
            {/* Custom Date Range Picker */}
            <div className="relative" ref={datePickerRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="w-full h-[40px] px-4 bg-white border border-[#4A4A4A] rounded-lg flex items-center justify-between text-[#4A4A4A] text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate">
                    {startDate && endDate
                      ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'Select Date Range'
                    }
                  </span>
                  <div className="flex items-center gap-2 ml-2">
                    {startDate && endDate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDateRange();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                  </div>
                </button>

                {isDatePickerOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 shadow-lg rounded-md bg-white">
                    <ReactDatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      inline
                      dateFormat="MM/dd/yyyy"
                      className="border-0"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Export Button */}
            {/* <button
              onClick={handleExport}
              className="h-[40px] px-4 bg-white border border-[1px] border-[#FF6B00] rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 text-[#000000]" />
              <span className="text-[#000000] text-sm font-medium whitespace-nowrap">Export</span>
            </button> */}
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">Error loading gift cards</h3>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchGiftCards}
                className="mt-2 text-sm text-red-700 underline hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : giftCards.length === 0 && !error ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gift cards found</h3>
            <p className="text-sm text-gray-500">
              {debouncedSearch
                ? 'Try adjusting your search query'
                : activeTab === 'sent'
                  ? 'You haven\'t sent any gift cards yet'
                  : activeTab === 'received'
                    ? 'You haven\'t received any gift cards yet'
                    : 'You don\'t have any gift cards yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Gift Cards Grid - Render in order */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {displayItems.map((item, index) => 
                item.type === 'bulk' 
                  ? renderBulkOrderCard(item.bulkOrderNumber, item.cards)
                  : renderSingleOrderCard(item.card)
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-b border-gray-300 px-4 py-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {((currentPage - 1) * pagination.pageSize) + 1} to {Math.min(currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} Results
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>

                  {renderPaginationButtons().map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-base font-medium flex-shrink-0 transition-all ${currentPage === page
                          ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-600'
                          }`}
                      >
                        {String(page).padStart(2, '0')}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Single Gift Card Detail Modal */}
      {isModalOpen && (
        <GiftCardDetailModal
          card={selectedCard}
          onClose={closeModal}
          onRedeem={() => handleRedeem(selectedCard)}
        />
      )}

      {/* Bulk Order Vouchers Modal - List View */}
      {isBulkModalOpen && selectedBulkOrder && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Bulk Order Vouchers</h2>
                  <p className="text-sm text-white/80">Order #{selectedBulkOrder.bulkOrderNumber} • {selectedBulkOrder.cards.length} Vouchers</p>
                </div>
              </div>
              <button
                onClick={closeBulkModal}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 text-black">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code, email, or name..."
                  value={bulkModalSearch}
                  onChange={(e) => setBulkModalSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {bulkModalSearch && (
                  <button
                    onClick={() => setBulkModalSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Showing {getFilteredBulkCards().length} of {selectedBulkOrder.cards.length} vouchers
              </p>
            </div>

            {/* Modal Content - List View */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {getFilteredBulkCards().length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your search query</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredBulkCards().map((card, index) => (
                    <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        {/* Left Section - Voucher Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Voucher Number */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">#{index + 1}</span>
                          </div>

                          {/* Voucher Details */}
                          <div className="flex-1 min-w-0">
                          
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 14 14" fill="none">
                                <path d="M11.667 2.91663H2.33366C1.68933 2.91663 1.16699 3.43896 1.16699 4.08329V9.91663C1.16699 10.561 1.68933 11.0833 2.33366 11.0833H11.667C12.3113 11.0833 12.8337 10.561 12.8337 9.91663V4.08329C12.8337 3.43896 12.3113 2.91663 11.667 2.91663Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1.16699 5.83337H12.8337" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className="font-mono">{card.code}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              <span className="font-medium">{card.receiverName || 'N/A'}</span>
                              {' • '}
                              <span>{card.receiverEmail || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Section - Amount & Progress */}
                        <div className="flex items-center gap-6 mx-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                            <p className="font-bold text-gray-900">{card.currencySymbol}{card.totalAmount.toFixed(2)}</p>
                          </div>
                          
                          {card?.receiverEmail == session?.user?.email && (
                            <div className="w-32">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Spent</span>
                                <span>{card.spent}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                                  style={{ width: `${card.spent}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-white flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {getFilteredBulkCards().length} voucher{getFilteredBulkCards().length !== 1 ? 's' : ''} displayed
              </p>
              <button
                onClick={closeBulkModal}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyGift;