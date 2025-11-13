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
      {/* Gradient Background */}
      <div
        className="pt-30 pb-30 text-center"
        style={{
          borderRadius: "0 0 50px 50px",
          background: "linear-gradient(126deg, #FBDCE3 31.7%, #FDE6DB 87.04%)",
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Pick Your Perfect Brand
        </h1>
        <p className="text-gray-600 text-base">
          Choose from our curated brands to make their day unforgettable
        </p>
      </div>

      {/* Search Bar + Dropdown */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl flex items-center justify-center gap-3 px-4">
        {/* Search Input with Gradient Border */}
        <div
          className="flex items-center w-full rounded-full p-[1px]"
          style={{
            background: "linear-gradient(90deg, #F16B86, #FDBB74)",
          }}
        >
          <div className="flex items-center w-full bg-white rounded-full px-5 py-3 shadow-md">
            <Search className="text-gray-400 mr-3" size={18} />
            <input
              type="text"
              placeholder={placeholder || "Search for your perfect brand"}
              onChange={(e) => onSearch(e.target.value)}
              className="flex-1 text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Custom Dropdown */}
        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-white rounded-full shadow-md border border-gray-100 px-6 py-3 cursor-pointer hover:shadow-lg transition"
          >
            <Filter className="w-4 h-4 text-gray-700" />
            <span className="text-gray-800 font-medium whitespace-nowrap">
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
            <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 z-50 w-49">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onCategoryChange(cat);
                    setOpen(false);
                  }}
                  className={`px-4 py-2 text-md text-gray-700 cursor-pointer hover:bg-pink-50 ${
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

      {/* Spacer */}
      <div className="h-24"></div>
    </div>
  );
};

export default SearchBar;
