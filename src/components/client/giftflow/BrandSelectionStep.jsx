"use client"

import { useState, useEffect } from "react";
import SearchBar from './SearchBar';
import SectionHeader from './SectionHeader';
import CardGrid from './CardGrid';
import BrandHeader from "./BrandHeader";
import GiftCardSelector from "./GiftCardSelector";
import { getBrandsForClient } from "@/lib/action/brandFetch";
import OccasionSelector from "./OccasionSelector";
import SubCategorySelector from "./SubCategorySelector";
import { useDispatch, useSelector } from "react-redux";
import { goBack, goNext, setError, setLoading, setPremiumBrands, setSearchTerm, setSelectedBrand, setSelectedCategory } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";
import { ArrowLeft } from "lucide-react";

const BrandSelectionStep = () => {
  const dispatch = useDispatch();
  const {
    searchTerm,
    selectedCategory,
    favorites,
    premiumBrands,
    loading,
    error
  } = useSelector((state) => state.giftFlowReducer);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const { success, data, message } = await getBrandsForClient();
        if (success) {
          dispatch(setPremiumBrands(data));
        } else {
          dispatch(setError(message));
        }
      } catch (err) {
        dispatch(setError("An unexpected error occurred."));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (premiumBrands.length === 0) {
      fetchBrands();
    }
  }, [dispatch, premiumBrands.length]);

  const categories = ['All Categories', ...new Set(premiumBrands.map(brand => brand.category))];

  const handleToggleFavorite = (brandId) => {
    dispatch(toggleFavorite(brandId));
  };

  const handleBrandClick = (brand) => {
    dispatch(setSelectedBrand(brand));
    dispatch(goNext());
  };

  const filteredPremiumBrands = premiumBrands.filter(brand => {
    const matchesSearch = brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Categories' || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-wave-orange mx-auto"></div>
          <h2 className="text-2xl font-semibold text-wave-green mt-4">Loading Brands...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-wave-cream rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600">Error: {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <ProgressIndicator /> */}

      {/* <button
        onClick={() => dispatch(goBack())}
        className="flex items-center text-purple-500 hover:text-purple-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button> */}

      <SearchBar
        placeholder="Search for your perfect brand..."
        onSearch={(term) => dispatch(setSearchTerm(term))}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={(category) => dispatch(setSelectedCategory(category))}
      />

      <div className="p-6 max-w-7xl mx-auto">
        <CardGrid
          brands={filteredPremiumBrands}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onBrandClick={handleBrandClick}
        />
      </div>
    </div>
  );
};

export default BrandSelectionStep;