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

const BrandSelector = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [favorites, setFavorites] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [premiumBrands, setPremiumBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(null);


  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { success, data, message } = await getBrandsForClient();
        if (success) {
          setPremiumBrands(data);
        } else {
          setError(message);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);


  const categories = ['All Categories', ...new Set(premiumBrands.map(brand => brand.category))];

  const handleToggleFavorite = (brandId) => {
    setFavorites(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
  };

  const handleSelectGiftCard = (amount) => {
    setSelectedBrand(null);
    setSelectedAmount(amount);
  };

  const handleSelectOccasion = (occasion) => {
    setSelectedBrand(null);
    setSelectedAmount(null);
    setSelectedOccasion(occasion);
  };

  const handleSelectSubCategory = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  const handleSelectSubSubCategory = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    // Here you might want to proceed to the next step
    // For now, we'll just log it.
    console.log("Final selection:", {
      occasion: selectedOccasion,
      subCategory: selectedSubCategory,
      subSubCategory: subSubCategory,
    });
  };


  const handleBack = () => {
    if (selectedSubSubCategory) {
      setSelectedSubSubCategory(null);
    } else if (selectedSubCategory) {
      setSelectedSubCategory(null);
    } else if (selectedOccasion) {
      setSelectedOccasion(null);
    } else if (selectedAmount) {
      setSelectedAmount(null);
    } else if (selectedBrand) {
      setSelectedBrand(null);
    }
  };


  const filteredPremiumBrands = premiumBrands.filter(brand => {
    const matchesSearch = brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Categories' || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  if (error) {
    return <p>Error: {error}</p>;
  }

  if (selectedBrand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GiftCardSelector
          onBack={handleBack}
          brand={selectedBrand}
          voucherData={selectedBrand?.vouchers[0]}
          onSelectGiftCard={handleSelectGiftCard}
        />
      </div>
    );
  }

  if (selectedOccasion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SubCategorySelector
          onBack={handleBack}
          selectedOccasion={selectedOccasion}
          onSelectSubCategory={handleSelectSubCategory}
          selectedSubCategory={selectedSubCategory}
        />
      </div>
    )
  }

  if (selectedAmount) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OccasionSelector
          onBack={handleBack}
          selectedOccasion={selectedOccasion}
          onSelectGiftCard={handleSelectOccasion}

        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader
        title="Pick Your Perfect Brand"
        subtitle="Choose from our curated brands to make their day unforgettable 👍"
        onBack={handleBack}
      />

      <SearchBar
        placeholder="Search for your perfect brand..."
        onSearch={setSearchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={setSelectedCategory}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <SectionHeader
            icon={<span>💎</span>}
            title="Premium Collection"
            subtitle="Luxury brands for those special moments"
            bgColor="bg-purple-500"
          />
          <CardGrid
            brands={filteredPremiumBrands}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onBrandClick={handleBrandClick}
            premiumBrands={premiumBrands.map(b => b.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandSelector;