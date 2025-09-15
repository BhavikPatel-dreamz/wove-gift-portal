"use client"
import React, { useState } from 'react';
import { Search, Plus, Edit, Star, MoreVertical, Upload, Globe } from 'lucide-react';
import Modal from '@/components/Modal';
import BrandForm from '@/components/forms/BrandForm';

const BrandManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Brands');
  
  // Initial sample brands matching the design
  const [brands, setBrands] = useState([
    {
      id: 1,
      name: 'Alice Osborn',
      tagline: 'Amet id cupiditate',
      category: 'Fashion & Footwear',
      website: 'https://aliceosborn.com',
      description: 'Id cum molestiae re',
      logo: null,
      color: '#3B82F6',
      featured: true,
      active: true
    },
    {
      id: 2,
      name: 'Bata SA',
      tagline: 'crafting stylish, comfortable, and durable footwear',
      category: 'Fashion & Footwear',
      website: 'https://bata.com',
      description: 'Leading footwear brand with decades of experience',
      logo: null,
      color: '#DC2626',
      featured: true,
      active: true
    },
    {
      id: 3,
      name: 'FOM',
      tagline: 'Freedom of Movement',
      category: 'Fashion & Footwear',
      website: 'https://fom.com',
      description: 'Athletic wear focused on freedom of movement',
      logo: null,
      color: '#000000',
      featured: true,
      active: true
    },
    {
      id: 4,
      name: 'Huxlee',
      tagline: 'Adventuring since 2024',
      category: 'Clothing',
      website: 'https://huxlee.com',
      description: 'Adventure clothing brand for outdoor enthusiasts',
      logo: null,
      color: '#059669',
      featured: true,
      active: true
    },
    {
      id: 5,
      name: 'Kecks',
      tagline: 'Sports underwear for anywhere',
      category: 'Fashion',
      website: 'https://kecks.com',
      description: 'Premium sports underwear designed for comfort',
      logo: null,
      color: '#000000',
      featured: false,
      active: true
    },
    {
      id: 6,
      name: 'PUMA',
      tagline: 'Welcome to PUMA, the world',
      category: 'Footwear',
      website: 'https://puma.com',
      description: 'Global sports brand inspiring athletes worldwide',
      logo: null,
      color: '#000000',
      featured: false,
      active: true
    },
    {
      id: 7,
      name: 'Reebok South Africa',
      tagline: 'Shop the newest selection of footwear and apparel',
      category: 'Fashion & Footwear',
      website: 'https://reebok.co.za',
      description: 'South African division of the global fitness brand',
      logo: null,
      color: '#000000',
      featured: false,
      active: true
    },
    {
      id: 8,
      name: 'Sealand',
      tagline: 'Shop our range of up-cycled bags',
      category: 'Fashion',
      website: 'https://sealand.com',
      description: 'Sustainable fashion with up-cycled materials',
      logo: null,
      color: '#059669',
      featured: true,
      active: true
    },
    {
      id: 9,
      name: 'Versus Socks',
      tagline: 'Market leaders in performance socks',
      category: 'Fashion',
      website: 'https://versussocks.com',
      description: 'High-performance socks for athletes',
      logo: null,
      color: '#000000',
      featured: false,
      active: true
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    category: '',
    website: '',
    description: '',
    logo: null,
    color: '#000000',
    featured: false,
    active: true
  });

  const categories = ['All Brands', 'Fashion & Footwear', 'Clothing', 'Fashion', 'Footwear'];

  // Calculate stats
  const stats = {
    active: brands.filter(b => b.active).length,
    featured: brands.filter(b => b.featured).length,
    total: brands.length,
    activeRate: brands.length > 0 ? Math.round((brands.filter(b => b.active).length / brands.length) * 100) : 100
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      alert('Please fill in required fields');
      return;
    }

    const newBrand = {
      ...formData,
      id: Date.now(), // Better ID generation
    };
    setBrands(prev => [...prev, newBrand]);
    
    // Reset form
    setFormData({
      name: '',
      tagline: '',
      category: '',
      website: '',
      description: '',
      logo: null,
      color: '#000000',
      featured: false,
      active: true
    });
    setShowAddForm(false);
  };

  const toggleFeatured = (id) => {
    setBrands(prev => prev.map(brand => 
      brand.id === id ? { ...brand, featured: !brand.featured } : brand
    ));
  };

  const toggleActive = (id) => {
    setBrands(prev => prev.map(brand => 
      brand.id === id ? { ...brand, active: !brand.active } : brand
    ));
  };

  const autoPopulateFromWebsite = async () => {
    if (!formData.website) {
      alert('Please enter a website URL first');
      return;
    }

    // Simulate API call (replace with real implementation)
    try {
      // This would be your API call
      // const response = await fetch('/api/scrape-website', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: formData.website })
      // });
      // const data = await response.json();

      // Simulated response
      const simulatedData = {
        name: 'Auto Brand',
        tagline: 'Automatically populated tagline',
        description: 'This description was automatically extracted from the website'
      };

      setFormData(prev => ({
        ...prev,
        ...simulatedData
      }));
    } catch (error) {
      console.error('Failed to auto-populate:', error);
      alert('Failed to extract information from website');
    }
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Brands' || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    if (category.includes('Fashion')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (category === 'Clothing') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (category === 'Footwear') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <div className="text-white text-lg">📊</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brand Manager</h1>
              <p className="text-gray-600">Manage your brand partnerships with style</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add New Brand
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">🏪</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">{stats.active}</div>
                <div className="text-sm text-green-600">Active Brands</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600" size={16} />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-700">{stats.featured}</div>
                <div className="text-sm text-yellow-600">Featured</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Brands</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📈</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700">{stats.activeRate}%</div>
                <div className="text-sm text-purple-600">Active Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search brands by name, category, or tagline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand Portfolio Header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Brand Portfolio</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredBrands.length} brands
          </span>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {filteredBrands.map(brand => (
            <div key={brand.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              {brand.featured && (
                <div className="bg-orange-400 text-white text-xs px-2 py-1 font-medium flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  Featured
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      brand.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1">{brand.name}</h3>
                <p className="text-gray-600 text-sm italic mb-3">"{brand.tagline}"</p>
                
                <p className="text-gray-700 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{brand.description}</p>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(brand.category)}`}>
                    {brand.category}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-medium ${
                    brand.active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {brand.active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleFeatured(brand.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        brand.featured 
                          ? 'text-orange-500 hover:bg-orange-50' 
                          : 'text-gray-400 hover:bg-gray-50 hover:text-orange-500'
                      }`}
                    >
                      <Star size={16} fill={brand.featured ? 'currentColor' : 'none'} />
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Featured</span>
                    <button
                      onClick={() => toggleFeatured(brand.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brand.featured ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brand.featured ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'All Brands' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first brand'}
            </p>
            {!searchTerm && selectedCategory === 'All Brands' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Brand
              </button>
            )}
          </div>
        )}

        <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
          <BrandForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            autoPopulateFromWebsite={autoPopulateFromWebsite} 
            setShowAddForm={setShowAddForm} 
            setFormData={setFormData} 
          />
        </Modal>
      </div>
    </div>
  );
};

export default BrandManager;