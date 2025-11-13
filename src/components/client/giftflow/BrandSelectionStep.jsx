"use client"

import { useState, useEffect, useCallback } from "react";
import SearchBar from './SearchBar';
import CardGrid from './CardGrid';
import { getBrandsForClient, getBrandCategories } from "@/lib/action/brandFetch";
import { useDispatch, useSelector } from "react-redux";
import { 
  goBack, 
  goNext, 
  setError, 
  setLoading, 
  setPremiumBrands, 
  setSearchTerm, 
  setSelectedBrand, 
  setSelectedCategory,
  setCategories,
  setPagination,
  setCurrentPage,
  setSortBy,
  toggleFavorite,
  resetFilters
} from "../../../redux/giftFlowSlice";
import Pagination from "./Pagination";
import { RefreshCw } from "lucide-react";

const BrandSelectionStep = () => {
  const dispatch = useDispatch();
  const {
    searchTerm,
    selectedCategory,
    currentPage,
    sortBy,
    favorites,
    premiumBrands,
    categories,
    pagination,
    loading,
    error
  } = useSelector((state) => state.giftFlowReducer);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { success, data } = await getBrandCategories();
      if (success) {
        dispatch(setCategories(data));
      }
    };
    
    if (categories.length <= 1) {
      fetchCategories();
    }
  }, [dispatch, categories.length]);

  // Fetch brands when filters change
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        
        const { success, data, pagination: paginationData, message } = await getBrandsForClient({
          searchTerm: debouncedSearchTerm,
          category: selectedCategory,
          page: currentPage,
          limit: 12,
          sortBy
        });

        if (success) {
          dispatch(setPremiumBrands(data));
          dispatch(setPagination(paginationData));
        } else {
          dispatch(setError(message));
        }
      } catch (err) {
        dispatch(setError("An unexpected error occurred."));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchBrands();
  }, [dispatch, debouncedSearchTerm, selectedCategory, currentPage, sortBy]);

  const handleToggleFavorite = useCallback((brandId) => {
    dispatch(toggleFavorite(brandId));
  }, [dispatch]);

  const handleBrandClick = useCallback((brand) => {
    dispatch(setSelectedBrand(brand));
    dispatch(goNext());
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // if (loading && premiumBrands.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-wave-orange mx-auto"></div>
  //         <h2 className="text-2xl font-semibold text-wave-green mt-4">Loading Brands...</h2>
  //       </div>
  //     </div>
  //   );
  // }

  if (error && premiumBrands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-30">
        <div className="text-center p-8 bg-wave-cream rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error: {error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-wave-orange text-white rounded-lg hover:bg-opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <SearchBar
        placeholder="Search for your perfect brand..."
        onSearch={(term) => dispatch(setSearchTerm(term))}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={(category) => dispatch(setSelectedCategory(category))}
        sortBy={sortBy}
        onSortChange={(sort) => dispatch(setSortBy(sort))}
      />

      {/* Active Filters & Results Count */}
      <div className="flex justify-between items-center px-6 max-w-7xl mx-auto">
        <div className="text-sm text-gray-600 ">
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            <span>
              Showing <strong>{premiumBrands.length}</strong> of{" "}
              <strong>{pagination.totalCount}</strong> brands
            </span>
          )}
        </div>

        {(searchTerm || selectedCategory !== "All Categories") && (
          <button
            onClick={handleResetFilters}
            className="text-sm text-wave-orange hover:text-wave-green flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <CardGrid
          brands={premiumBrands}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onBrandClick={handleBrandClick}
          isLoading={loading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasMore={pagination.hasMore}
          />
        )}
      </div>
    </div>
  );
};

export default BrandSelectionStep;
