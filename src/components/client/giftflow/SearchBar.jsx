"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, Filter, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Categories } from "../../../lib/resourses";

const SearchBar = ({
  placeholder,
  onSearch,
  selectedCategory,
  onCategoryChange,
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';
  
  // Local state for immediate UI updates
  const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get('search') || '');
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((value) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(value);
      setIsSearching(false);
    }, 300); // 300ms delay
  }, [onSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  // Sync local state with URL params
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || '';
    if (urlSearchTerm !== localSearchTerm) {
      setLocalSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation for dropdown
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* 🌈 Gradient Header */}
      <div
        className="text-center px-4 py-30 sm:py-30"
        style={{
          borderRadius: "0 0 40px 40px",
          background: "linear-gradient(126deg, #FBDCE3 31.7%, #FDE6DB 87.04%)",
        }}
      >
        {isBulkMode && (
          <div className="w-full flex items-center justify-center mb-4">
            {/* Left line */}
            <div className="max-w-53.5 w-full h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]"></div>

            {/* Center pill */}
            <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
              <div className="px-4 py-1.5 bg-white rounded-full">
                <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                  Bulk Gifting
                </span>
              </div>
            </div>

            {/* Right line */}
            <div className="max-w-53.5 w-full h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]"></div>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {isBulkMode ? "Choose the Perfect Brand to Gift" : "Pick Your Perfect Brand"}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto px-2">
          {isBulkMode ? "Pick from our trusted partners for bulk orders" : "Choose from our curated brands to make their day unforgettable"}
        </p>
      </div>

      {/* 🔍 Search Input + Dropdown */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-full max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-2 sm:px-4 z-30">
        {/* Search Input */}
        <div
          className="flex items-center w-full rounded-full p-0.5"
          style={{
            background: "linear-gradient(90deg, #F16B86, #FDBB74)",
          }}
        >
          <div className="flex items-center w-full bg-white rounded-full px-4 sm:px-5 py-2 sm:py-3 shadow-md">
            <Search className={`mr-2 sm:mr-3 ${isSearching ? 'text-pink-500 animate-pulse' : 'text-gray-400'}`} size={18} />
            <input
              type="text"
              placeholder={placeholder || "Search for your perfect brand"}
              value={localSearchTerm}
              onChange={handleSearchChange}
              className="flex-1 text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none text-sm sm:text-base"
              aria-label="Search brands"
            />
            {localSearchTerm && (
              <button
                onClick={handleClearSearch}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown */}
        <div 
          className="relative w-full sm:w-auto sm:min-w-60" 
          ref={dropdownRef}
          onKeyDown={handleKeyDown}
        >
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between sm:justify-center gap-2 bg-white rounded-full shadow-md border border-gray-100 px-4 sm:px-6 py-2 sm:py-3 cursor-pointer hover:shadow-lg transition w-full"
            aria-label="Filter by category"
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <Filter className="w-4 h-4 text-gray-700 shrink-0" />
            <span className="text-gray-800 font-medium text-sm sm:text-base whitespace-nowrap truncate max-w-35 sm:max-w-none">
              {selectedCategory || "All Categories"}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform shrink-0 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown List */}
          {open && (
            <ul
              className="absolute top-full mt-2 right-0 left-0 sm:left-auto sm:right-0 
                    bg-white rounded-xl shadow-lg border border-gray-100 
                    w-full sm:w-auto sm:min-w-50 max-h-60 overflow-y-auto
                    z-50"
              role="listbox"
              aria-label="Category filter options"
            >
              {Categories.map((cat, i) => (
                <li
                  key={i}
                  onClick={() => {
                    onCategoryChange(cat);
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={cat === selectedCategory}
                  className={`px-4 py-2 text-sm sm:text-md text-gray-700 cursor-pointer 
                    hover:bg-pink-50 whitespace-nowrap transition-colors ${
                    cat === selectedCategory
                      ? "font-semibold text-pink-600 bg-pink-50"
                      : ""
                  }`}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;