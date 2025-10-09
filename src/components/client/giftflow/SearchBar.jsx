import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

const SearchBar = ({ 
  placeholder, 
  onSearch, 
  selectedCategory, 
  categories, 
  onCategoryChange,
  sortBy,
  onSortChange 
}) => (
  <div className="relative">
    {/* Background Section with Rounded Bottom */}
    <div className="pt-26 pb-26 px-4" style={{ 
      borderRadius: '0 0 50px 50px',
      background: 'linear-gradient(126deg, #FBDCE3 31.7%, #FDE6DB 87.04%)'
    }}>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Pick Your Perfect Brand
        </h1>
        <p className="text-gray-600 text-base">
          Choose from our curated brands to make their day unforgettable
        </p>
      </div>
    </div>

    {/* Search Bar - Positioned Half Inside/Half Outside */}
    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4">
      <div className="flex items-center bg-white rounded-full shadow-xl border border-gray-200 overflow-hidden">
        {/* Search Input Section */}
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={placeholder || "Search for your perfect brand"}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        
        {/* Vertical Divider */}
        <div className="h-8 w-px bg-gray-300"></div>
        
        {/* Category Dropdown Section */}
        <div className="relative flex items-center gap-2 pl-6 pr-6">
          {/* Filter Icon */}
          <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
          
          {/* Select Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-transparent border-none py-4 pr-6 focus:outline-none text-gray-700 font-medium cursor-pointer"
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          {/* Chevron Down Icon */}
          <ChevronDown className="absolute right-6 text-gray-700" size={18} />
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-gray-300"></div>

        {/* Sort By Dropdown Section */}
        <div className="relative flex items-center gap-2 pl-6 pr-6">
          {/* Sort Icon */}
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
          
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-transparent border-none py-4 pr-6 focus:outline-none text-gray-700 font-medium cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="name">Name (A-Z)</option>
            <option value="newest">Newest</option>
          </select>
          
          {/* Chevron Down Icon */}
          <ChevronDown className="absolute right-6 text-gray-700" size={18} />
        </div>
      </div>
    </div>

    {/* Spacer to prevent content overlap */}
    <div className="h-16"></div>
  </div>
);

export default SearchBar;