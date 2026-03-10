"use client"

import { useCallback, useMemo, useState } from "react"
import SearchBar from './SearchBar'
import CardGrid from './CardGrid'
import { useDispatch, useSelector } from "react-redux"
import {
  goNext,
  setCurrentStep,
  setSelectedBrand
} from "../../../redux/giftFlowSlice"
import Pagination from "./Pagination"
import { useSearchParams } from "next/navigation"
import { toggleWishlistAsync } from "../../../redux/wishlistSlice"
import { useSession } from "@/contexts/SessionContext"
import toast from "react-hot-toast"
import AuthForm from "@/components/AuthForm"

const BrandSelectionStep = ({
  brands,
  loading,
  error,
  pagination,
  searchTerm,
  selectedCategory,
  currentPage,
  sortBy,
  updateUrlParams,
  clearFilters
}) => {
  const dispatch = useDispatch()
  const session = useSession()
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFavorite, setPendingFavorite] = useState(null);

  const { selectedBrand } = useSelector((state) => state.giftFlowReducer)
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const favorites = useMemo(
    () =>
      wishlistItems
        .filter((item) => item.sourceType === "brand")
        .map((item) =>
          item.brandId ?? String(item.key || "").replace(/^brand:/, "")
        ),
    [wishlistItems]
  );

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setPendingFavorite(null);
  }, []);

  const handleAuthSuccess = useCallback(async (user) => {
    const userId = user?.id;
    if (!userId || !pendingFavorite) {
      closeAuthModal();
      return;
    }

    try {
      await dispatch(toggleWishlistAsync({ userId, item: pendingFavorite })).unwrap();
    } catch (error) {
      const message = typeof error === 'string'
        ? error
        : error?.message || 'Failed to update wishlist.';
      toast.error(message);
    } finally {
      setPendingFavorite(null);
      setShowAuthModal(false);
    }
  }, [dispatch, pendingFavorite, closeAuthModal]);

  const handleToggleFavorite = useCallback((brand) => {
    const brandId = brand?.id ?? brand?.brandName ?? brand?.name;
    if (!brandId) {
      return;
    }

    if (!session?.user?.id) {
      const payload = {
        key: `brand:${brandId}`,
        sourceType: "brand",
        brandId,
        brandName: brand.brandName || brand.name || "Brand",
        logo: brand.logo || null,
      };
      setPendingFavorite(payload);
      setShowAuthModal(true);
      return;
    }

    const payload = {
      key: `brand:${brandId}`,
      sourceType: "brand",
      brandId,
      brandName: brand.brandName || brand.name || "Brand",
      logo: brand.logo || null,
    };

    dispatch(toggleWishlistAsync({ userId: session.user.id, item: payload }));
  }, [dispatch, session?.user?.id])

  const handleBrandClick = useCallback((brand) => {
    dispatch(setSelectedBrand(brand))
    if (isBulkMode) {
      dispatch(setCurrentStep(3))
    } else {
      dispatch(goNext())
    }
  }, [dispatch])

  const handlePageChange = useCallback((page) => {
    updateUrlParams({ page: page > 1 ? page.toString() : null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [updateUrlParams])

  const handleSearchChange = useCallback((term) => {
    updateUrlParams({
      search: term || null,
      page: null // Reset to page 1
    })
  }, [updateUrlParams])

  const handleCategoryChange = useCallback((category) => {
    updateUrlParams({
      category: category || null,
      page: null // Reset to page 1
    })
  }, [updateUrlParams])

  const handleSortChange = useCallback((sort) => {
    updateUrlParams({
      sort: null,
      page: null // Reset to page 1
    })
  }, [updateUrlParams])

  if (error && brands.length === 0) {
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
    )
  }

  return (
    <div className="space-y-6">
      <SearchBar
        placeholder="Search for your perfect brand..."
        value={searchTerm}
        onSearch={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[85%] xl:max-w-[75%] mx-auto text-black mt-8">
        {/* Show active filters */}
        {(searchTerm || selectedCategory && selectedCategory !== "All Categories") && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-wave-orange/10 text-wave-orange rounded-full text-sm">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="px-3 py-1 bg-wave-orange/10 text-wave-orange rounded-full text-sm">
                Category: {selectedCategory}
              </span>
            )}

            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        <CardGrid
          brands={brands}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onBrandClick={handleBrandClick}
          isLoading={loading}
          selectedBrand={selectedBrand}
        />

        {/* Pagination - Only show when not loading and have data */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasMore={pagination.hasMore}
          />
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 p-4 flex items-center justify-center">
          <AuthForm
            type="login"
            mode="modal"
            onClose={closeAuthModal}
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      )}
    </div>
  )
}

export default BrandSelectionStep
