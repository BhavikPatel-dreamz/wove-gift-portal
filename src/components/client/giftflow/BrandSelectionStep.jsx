"use client"

import { useState, useEffect, useCallback, useRef } from "react";
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
    error,
    selectedBrand
  } = useSelector((state) => state.giftFlowReducer);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [initialLoad, setInitialLoad] = useState(false); // Track initial load
  
  // Cache to track fetched data
  const fetchCacheRef = useRef(new Map());
  const isFetchingRef = useRef(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  // Fetch categories on mount (only once)
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
     
      // Create a unique cache key based on filters
      const cacheKey = `${debouncedSearchTerm}-${selectedCategory}-${currentPage}-${sortBy}`;
      
      // Check if we already have this data cached
      if (fetchCacheRef.current.has(cacheKey)) {
        const cachedData = fetchCacheRef.current.get(cacheKey);
        dispatch(setPremiumBrands(cachedData.brands));
        dispatch(setPagination(cachedData.pagination));
        setInitialLoad(false);
        return;
      }

      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return;
      }

      try {
        isFetchingRef.current = true;
        dispatch(setLoading(true));
        setInitialLoad(true);
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
          
          // Cache the result
          fetchCacheRef.current.set(cacheKey, {
            brands: data,
            pagination: paginationData
          });

          // Limit cache size to prevent memory issues (keep last 20 entries)
          if (fetchCacheRef.current.size > 20) {
            const firstKey = fetchCacheRef.current.keys().next().value;
            fetchCacheRef.current.delete(firstKey);
          }
        } else {
          dispatch(setError(message));
        }
      } catch (err) {
        dispatch(setError("An unexpected error occurred."));
      } finally {
        dispatch(setLoading(false));
        isFetchingRef.current = false;
        setInitialLoad(false);
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
    // Clear cache when filters are reset
    fetchCacheRef.current.clear();
    dispatch(resetFilters());
  }, [dispatch]);

  if (error && premiumBrands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-30">
        <div className="text-center p-8 bg-wave-cream rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error: {error}</h2>
          <button
            onClick={() => {
              fetchCacheRef.current.clear();
              window.location.reload();
            }}
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

      <div className="max-w-[75%] mx-auto">
        <CardGrid
          brands={premiumBrands}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onBrandClick={handleBrandClick}
          isLoading={loading || initialLoad} // Show loading during initial load too
          selectedBrand={selectedBrand}
        />

        {/* Pagination - Only show when not loading and have data */}
        {!loading && !initialLoad && pagination.totalPages > 1 && (
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