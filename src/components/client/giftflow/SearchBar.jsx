"use client";
import { useState } from "react";
import { ChevronDown, Search, Filter } from "lucide-react";

const SearchBar = ({
  placeholder,
  onSearch,
  selectedCategory,
  categories,
  onCategoryChange,
}) => {
  const [open, setOpen] = useState(false);

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
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          Pick Your Perfect Brand
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto px-2">
          Choose from our curated brands to make their day unforgettable
        </p>
      </div>

      {/* 🔍 Search Input + Dropdown */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-full max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-2 sm:px-4">
        {/* Search Input */}
        <div
          className="flex items-center w-full rounded-full p-[1px]"
          style={{
            background: "linear-gradient(90deg, #F16B86, #FDBB74)",
          }}
        >
          <div className="flex items-center w-full bg-white rounded-full px-4 sm:px-5 py-2 sm:py-3 shadow-md">
            <Search className="text-gray-400 mr-2 sm:mr-3" size={18} />
            <input
              type="text"
              placeholder={placeholder || "Search for your perfect brand"}
              onChange={(e) => onSearch(e.target.value)}
              className="flex-1 text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative w-full sm:w-auto">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between sm:justify-center gap-2 bg-white rounded-full shadow-md border border-gray-100 px-4 sm:px-6 py-2 sm:py-3 cursor-pointer hover:shadow-lg transition"
          >
            <Filter className="w-4 h-4 text-gray-700" />
            <span className="text-gray-800 font-medium text-sm sm:text-base whitespace-nowrap truncate max-w-[140px] sm:max-w-none">
              {selectedCategory || "All Categories"}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown List */}
          {open && (
            <div className="absolute top-full mt-2 right-0 left-0 sm:left-auto sm:right-0 bg-white rounded-xl shadow-lg border border-gray-100 z-50 w-full sm:w-48 max-h-60 overflow-y-auto">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onCategoryChange(cat);
                    setOpen(false);
                  }}
                  className={`px-4 py-2 text-sm sm:text-md text-gray-700 cursor-pointer hover:bg-pink-50 ${
                    cat === selectedCategory ? "font-semibold text-pink-600" : ""
                  }`}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
