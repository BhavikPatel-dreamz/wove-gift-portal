import { ChevronDown, Search } from "lucide-react";


const SearchBar = ({ placeholder, onSearch, selectedCategory, categories, onCategoryChange }) => (
  <div className="bg-white p-6 flex gap-4 w-[50%] mx-auto text-black">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
    <div className="relative">
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
         {categories.map((category, index) => (
    <option key={index} value={category}>
      {category}
    </option>
  ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
    </div>
  </div>
);

export default SearchBar;