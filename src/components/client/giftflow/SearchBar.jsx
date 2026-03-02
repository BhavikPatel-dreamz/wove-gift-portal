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
  const mode = searchParams.get("mode");
  const isBulkMode = mode === "bulk";

  const [localSearchTerm, setLocalSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [isSearching, setIsSearching] = useState(false);

  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const debouncedSearch = useCallback(
    (value) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(value);
        setIsSearching(false);
      }, 300);
    },
    [onSearch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    onSearch("");
  };

  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    if (urlSearchTerm !== localSearchTerm) setLocalSearchTerm(urlSearchTerm);
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  };

  const allCategories = ["All Categories", ...Categories];

  return (
    <div className="relative w-full">
      {/* Gradient Header */}
      <div
        className="text-center px-4 py-30 sm:py-30"
        style={{
          borderRadius: "0 0 40px 40px",
          background: "linear-gradient(126deg, #FBDCE3 31.7%, #FDE6DB 87.04%)",
        }}
      >
        {isBulkMode && (
          <div className="w-full flex items-center justify-center mb-4">
            <div className="max-w-53.5 w-full h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />
            <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
              <div className="px-4 py-1.5 bg-white rounded-full">
                <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                  Bulk Gifting
                </span>
              </div>
            </div>
            <div className="max-w-53.5 w-full h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {isBulkMode
            ? "Choose the Perfect Brand to Gift"
            : "Pick Your Perfect Brand"}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto px-2">
          {isBulkMode
            ? "Pick from our trusted partners for bulk orders"
            : "Choose from our curated brands to make their day unforgettable"}
        </p>
      </div>

      {/* Search Input + Dropdown */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-full max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-2 sm:px-4 z-30">
        {/* Search Input */}
        <div
          className="flex items-center w-full rounded-full p-0.5"
          style={{ background: "linear-gradient(90deg, #F16B86, #FDBB74)" }}
        >
          <div className="flex items-center w-full bg-white rounded-full px-4 sm:px-5 py-2 sm:py-3 shadow-md">
            <Search
              className={`mr-2 sm:mr-3 ${
                isSearching ? "text-pink-500 animate-pulse" : "text-gray-400"
              }`}
              size={18}
            />
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
          className="relative w-full sm:w-auto sm:min-w-55"
          ref={dropdownRef}
          onKeyDown={handleKeyDown}
        >
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between gap-3 rounded-full bg-[#F7F7F7] px-3 py-2.5 pr-4 border border-white/70 shadow-[0_10px_24px_rgba(17,24,39,0.08)] transition hover:shadow-[0_12px_26px_rgba(17,24,39,0.12)]"
            aria-label="Filter by category"
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D9D9]/20 shadow-sm shrink-0">
              <Filter className="w-4 h-4 text-gray-700" />
            </span>
            <span className="flex-1 text-left text-gray-700 font-medium text-sm sm:text-base whitespace-nowrap truncate max-w-[9.5rem] sm:max-w-none">
              {selectedCategory || "All Categories"}
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-800 transition-transform shrink-0 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown List */}
          {open && (
            <ul
              className="absolute top-full mt-2 right-0 left-0 sm:left-auto sm:right-0 
                bg-white rounded-2xl shadow-[0_18px_35px_rgba(17,24,39,0.12)] border border-gray-100 
                min-w-full sm:w-auto sm:min-w-55 max-h-60 overflow-y-auto z-50 p-1.5"
              role="listbox"
              aria-label="Category filter options"
            >
              {allCategories.map((cat, i) => {
                const isSelected =
                  cat === selectedCategory ||
                  (cat === "All Categories" && !selectedCategory);

                return (
                  <li
                    key={i}
                    onClick={() => {
                      onCategoryChange(cat === "All Categories" ? "" : cat);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`px-3.5 py-2.5 text-sm cursor-pointer rounded-lg whitespace-nowrap transition-colors ${
                      isSelected
                        ? "font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={
                      isSelected
                        ? {
                            background:
                              "linear-gradient(180deg, #FEF8F6 0%, #FDF7F8 100%), #FFF",
                          }
                        : {}
                    }
                  >
                    {isSelected ? (
                      <span className="bg-gradient-to-r from-[#ED457D] to-[#FA8F42] bg-clip-text text-transparent">
                        {cat}
                      </span>
                    ) : (
                      cat
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;