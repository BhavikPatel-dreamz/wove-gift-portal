"use client"
import { useState } from 'react';
import { Star, Grid3X3, List, ArrowRight } from 'lucide-react';
import BrandCard from './BrandCard';

const BrandsSection = ({ 
  brands = [],
  title = "Our Brand Partners", 
  subtitle = "Discover amazing brands and services from our trusted partners" 
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', ...new Set(brands.map(brand => brand.categorieName))];
  const filteredBrands = selectedCategory === 'all' 
    ? brands 
    : brands.filter(brand => brand.categorieName === selectedCategory);

  return (
    <section className="py-20 bg-wave-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-wave-orange text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-brand">
            <Star className="w-4 h-4" />
            Trusted Partners
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-wave-green mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-xl text-wave-brown max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-wave-orange text-white shadow-brand'
                    : 'bg-white text-wave-green hover:bg-wave-cream-dark border-2 border-wave-cream'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border-2 border-wave-cream">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-wave-cream text-wave-green' : 'text-wave-brown hover:text-wave-green'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-wave-cream text-wave-green' : 'text-wave-brown hover:text-wave-green'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brands Grid */}
        <div className={`grid gap-6 mb-12 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} {...brand} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-wave-green rounded-2xl p-12 shadow-brand-lg">
          <h3 className="text-2xl font-bold text-white mb-4">
            Want to partner with us?
          </h3>
          <p className="text-wave-cream mb-8 text-lg">
            Join our growing network of trusted brands and reach new audiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-wave-orange hover:bg-wave-orange-dark text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-brand hover:shadow-brand-lg hover:transform hover:scale-105">
              Become a Partner
            </button>
            <button className="text-white hover:text-wave-cream font-semibold px-6 py-4 rounded-xl border-2 border-white hover:border-wave-cream hover:bg-wave-green-light transition-all duration-300 flex items-center gap-2">
              View All Brands
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div className="bg-white rounded-xl p-6 shadow-brand hover:shadow-brand-lg transition-all duration-300">
            <div className="text-3xl font-bold text-wave-orange mb-2">{brands.length}+</div>
            <div className="text-wave-brown">Trusted Brands</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-brand hover:shadow-brand-lg transition-all duration-300">
            <div className="text-3xl font-bold text-wave-orange mb-2">{categories.length - 1}</div>
            <div className="text-wave-brown">Categories</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-brand hover:shadow-brand-lg transition-all duration-300">
            <div className="text-3xl font-bold text-wave-orange mb-2">100%</div>
            <div className="text-wave-brown">Satisfaction</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-brand hover:shadow-brand-lg transition-all duration-300">
            <div className="text-3xl font-bold text-wave-orange mb-2">24/7</div>
            <div className="text-wave-brown">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;