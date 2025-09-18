"use client"

import { useState } from "react";
import SearchBar from './SearchBar';
import SectionHeader from './SectionHeader';
import CardGrid from './CardGrid';
import BrandHeader from "./BrandHeader";
import GiftCardSelector from "./GiftCardSelector";

const BrandSelector = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [favorites, setFavorites] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);


  const categories = ['All Categories', 'Fashion', 'Footwear', 'Clothing', 'Fashion & Footwear'];

  const premiumBrands = [
    {
      id: 1,
      name: "Versus Socks",
      category: "Fashion",
      description: "Market leaders in performance socks.",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3EVS%3C/text%3E%3C/svg%3E"
    },
    {
      id: 2,
      name: "Kecks",
      category: "Fashion",
      description: "Sports underwear for anywhere",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3EKECKS%3C/text%3E%3C/svg%3E"
    },
    {
      id: 3,
      name: "Sealand",
      category: "Fashion",
      description: "Shop our range of up-cycled bags",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='10'%3Esealand%3C/text%3E%3C/svg%3E"
    },
    {
      id: 4,
      name: "Reebok South Africa",
      category: "Footwear",
      description: "Shop the newest selection of footwear and apparel",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='8'%3EReebok%3C/text%3E%3C/svg%3E"
    },
    {
      id: 5,
      name: "FOM",
      category: "Fashion & Footwear",
      description: "Freedom of Movement",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3EFOM%3C/text%3E%3C/svg%3E"
    },
    {
      id: 6,
      name: "PUMA",
      category: "Footwear",
      description: "Welcome to PUMA, the world",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3EPUMA%3C/text%3E%3C/svg%3E"
    },
    {
      id: 7,
      name: "Huxley",
      category: "Clothing",
      description: "Adventuring since 2024",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3EHUXLEY%3C/text%3E%3C/svg%3E"
    },
    {
      id: 8,
      name: "Bata SA",
      category: "Fashion & Footwear",
      description: "Crafting stylish, comfortable, and durable footwear",
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='red'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3EBata%3C/text%3E%3C/svg%3E"
    }
  ];


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

  const handleSelectGiftCard = (brand) => {
    setSelectedBrand(null);
    console.log('Brand clicked:', brand);
  };

  const handleBack = () => {
    setSelectedBrand(null);
  };

  const filteredPremiumBrands = premiumBrands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedBrand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GiftCardSelector
          onBack={handleBack}
          brand={selectedBrand}
          onSelectGiftCard={handleSelectGiftCard}
        />
      </div>
    );
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