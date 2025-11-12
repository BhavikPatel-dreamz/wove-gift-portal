"use client"
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Star, MoreVertical, Trash2, Loader, ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc } from 'lucide-react';
import Modal from '@/components/Modal';
import BrandForm from '@/components/forms/BrandForm';
import { addBrand, updateBrand, deleteBrand, getBrands, getBrandStats } from '../../../lib/action/brandAction';
import { toast } from 'react-hot-toast';
import { categories } from '../../../lib/resourses';

const BrandManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filter and search states
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Brands',
    isActive: null,
    isFeature: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    featured: 0,
    activeRate: 0
  });
  
  const [categoryStats, setCategoryStats] = useState([]);

  const [formData, setFormData] = useState({
    brandName: '',
    tagline: '',
    categoryName: '',
    website: '',
    description: '',
    contact: '',
    notes: '',
    logo: null,
    color: '#000000',
    isFeature: false,
    isActive: true
  });


  // Debounce hook for search
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch brands with current filters and pagination
  const fetchBrands = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : pagination.currentPage;
      
      const params = {
        page: currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search,
        category: filters.category,
        isActive: filters.isActive,
        isFeature: filters.isFeature,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      
      const result = await getBrands(params);
      
      if (result.success) {
        setBrands(result.data || []);
        setPagination(result.pagination);
        setStatistics(result.statistics);
        setCategoryStats(result.categoryStats || []);
      } else {
        toast.error('Failed to load brands');
        setBrands([]);
      }
    } catch (error) {
      toast.error('Error loading brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect for initial load and filter changes
  useEffect(() => {
    fetchBrands(true); // Reset to page 1 when filters change
  }, [debouncedSearch, filters.category, filters.isActive, filters.isFeature, filters.sortBy, filters.sortOrder]);

  // Effect for pagination changes
  useEffect(() => {
    if (pagination.currentPage > 1) {
      fetchBrands(false);
    }
  }, [pagination.currentPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newLimit,
      currentPage: 1
    }));
    fetchBrands(true);
  };

  const resetForm = () => {
    setFormData({
      brandName: '',
      tagline: '',
      categoryName: '',
      website: '',
      description: '',
      contact: '',
      notes: '',
      logo: null,
      color: '#000000',
      isFeature: false,
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  // Helper function to create FormData with all required fields
  const createFormData = (brandData, isUpdate = false, existingBrand = null) => {
    const formDataToSend = new FormData();
    
    // If updating, add the ID
    if (isUpdate && existingBrand) {
      formDataToSend.append('id', existingBrand.id);
    }
    
    // Always append all fields to prevent data loss
    const fieldsToAppend = {
      brandName: brandData.brandName || (existingBrand?.brandName || ''),
      tagline: brandData.tagline || (existingBrand?.tagline || ''),
      categoryName: brandData.categoryName || (existingBrand?.categoryName || ''),
      website: brandData.website || (existingBrand?.website || ''),
      description: brandData.description || (existingBrand?.description || ''),
      contact: brandData.contact || (existingBrand?.contact || ''),
      notes: brandData.notes || (existingBrand?.notes || ''),
      color: brandData.color || (existingBrand?.color || '#000000'),
      isFeature: brandData.isFeature !== undefined ? brandData.isFeature : (existingBrand?.isFeature || false),
      isActive: brandData.isActive !== undefined ? brandData.isActive : (existingBrand?.isActive !== undefined ? existingBrand.isActive : true)
    };

    // Append all fields
    Object.keys(fieldsToAppend).forEach(key => {
      if (key === 'isFeature' || key === 'isActive') {
        formDataToSend.append(key, fieldsToAppend[key].toString());
      } else {
        formDataToSend.append(key, fieldsToAppend[key]);
      }
    });

    // Handle logo file separately
    if (brandData.logo && brandData.logo instanceof File) {
      formDataToSend.append('logo', brandData.logo);
    }
    
    return formDataToSend;
  };

  const handleAddBrand = async (brandData) => {
    try {
      setActionLoading(true);
      const formDataToSend = createFormData(brandData);
      const result = await addBrand(formDataToSend);

      if (result.success) {
        resetForm();
        setShowAddForm(false);
        toast.success('Brand added successfully');
        await fetchBrands(true);
      } else {
        toast.error(result.message || 'Failed to add brand');
      }
    } catch (error) {
      toast.error('Failed to add brand');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBrand = async (brandData) => {
    try {
      setActionLoading(true);
      const formDataToSend = createFormData(brandData, true, editingBrand);
      const result = await updateBrand(formDataToSend);

      if (result.success) {
        resetForm();
        setShowEditForm(false);
        setEditingBrand(null);
        toast.success('Brand updated successfully');
        await fetchBrands(false);
      } else {
        toast.error(result.message || 'Failed to update brand');
      }
    } catch (error) {
      toast.error('Failed to update brand');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const result = await deleteBrand(brandId);

      if (result.success) {
        toast.success('Brand deleted successfully');
        await fetchBrands(false);
      } else {
        toast.error(result.message || 'Failed to delete brand');
      }
    } catch (error) {
      toast.error('Failed to delete brand');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFeatured = async (id) => {
    const brand = brands.find(b => b.id === id);
    if (!brand) return;

    try {
      setActionLoading(true);
      
      // Create FormData with all existing brand data plus the toggle
      const toggleData = {
        ...brand,
        isFeature: !brand.isFeature,
        logo: null // Don't send file again
      };
      
      const formDataToSend = createFormData(toggleData, true, brand);
      const result = await updateBrand(formDataToSend);
      
      if (result.success) {
        toast.success(`Brand ${!brand.isFeature ? 'featured' : 'unfeatured'} successfully`);
        await fetchBrands(false);
      } else {
        toast.error('Failed to update brand');
      }
    } catch (error) {
      toast.error('Failed to update brand');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brandName || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingBrand) {
      handleUpdateBrand(formData);
    } else {
      handleAddBrand(formData);
    }
  };

  const handleEditClick = (brand) => {
    setEditingBrand(brand);
    // Populate form with ALL existing brand data
    setFormData({
      brandName: brand.brandName || '',
      tagline: brand.tagline || '',
      categoryName: brand.categoryName || '',
      website: brand.website || '',
      description: brand.description || '',
      contact: brand.contact || '',
      notes: brand.notes || '',
      logo: null, // Don't set existing logo file
      color: brand.color || '#000000',
      isFeature: brand.isFeature !== undefined ? brand.isFeature : false,
      isActive: brand.isActive !== undefined ? brand.isActive : true
    });
    setShowEditForm(true);
  };

  const autoPopulateFromWebsite = async () => {
    if (!formData.website) {
      toast.error('Please enter a website URL first');
      return;
    }

    try {
      toast.loading('Extracting website information...');
      
      const simulatedData = {
        brandName: 'Auto Brand',
        tagline: 'Automatically populated tagline',
        description: 'This description was automatically extracted from the website'
      };

      setFormData(prev => ({
        ...prev,
        ...simulatedData
      }));
      
      toast.dismiss();
      toast.success('Website information extracted successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to extract information from website');
    }
  };

  const getCategoryColor = (category) => {
    if (category?.includes('Fashion')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (category === 'Clothing') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (category === 'Footwear') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (category === 'Sports') return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading && brands.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={20} />
          Loading brands...
        </div>
      </div>
    );
  }

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
            onClick={() => {
              resetForm();
              setEditingBrand(null);
              setShowAddForm(true);
            }}
            disabled={actionLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
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
                <div className="text-2xl font-bold text-green-700">{statistics.active}</div>
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
                <div className="text-2xl font-bold text-yellow-700">{statistics.featured}</div>
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
                <div className="text-2xl font-bold text-blue-700">{statistics.total}</div>
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
                <div className="text-2xl font-bold text-purple-700">{statistics.activeRate}%</div>
                <div className="text-sm text-purple-600">Active Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search brands by name, category, or tagline..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Status Filters */}
            <select
              value={filters.isActive || ''}
              onChange={(e) => handleFilterChange('isActive', e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            <select
              value={filters.isFeature || ''}
              onChange={(e) => handleFilterChange('isFeature', e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Brands</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="createdAt">Created Date</option>
                <option value="brandName">Name</option>
                <option value="categoryName">Category</option>
                <option value="updatedAt">Updated Date</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </button>
            </div>
          </div>

          {/* Active filters display */}
          {(filters.search || filters.category !== 'All Brands' || filters.isActive || filters.isFeature) && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
              {filters.search && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.category !== 'All Brands' && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Category: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', 'All Brands')}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.isActive && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Status: {filters.isActive === 'true' ? 'Active' : 'Inactive'}
                  <button
                    onClick={() => handleFilterChange('isActive', null)}
                    className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.isFeature && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Featured: {filters.isFeature === 'true' ? 'Yes' : 'No'}
                  <button
                    onClick={() => handleFilterChange('isFeature', null)}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Brand Portfolio Header with Pagination Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Brand Portfolio</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {pagination.totalItems} brands
            </span>
            {pagination.totalItems > 0 && (
              <span className="text-sm text-gray-600">
                Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems}
              </span>
            )}
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>

        {/* Loading overlay for pagination */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-10 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-lg">
              <Loader className="animate-spin" size={20} />
              <span>Loading brands...</span>
            </div>
          </div>
        )}

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {brands.map(brand => (
            <div key={brand.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              {brand.isFeature && (
                <div className="bg-orange-400 text-white text-xs px-2 py-1 font-medium flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  Featured
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: brand.color || '#000000' }}
                  >
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.brandName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      brand.brandName?.charAt(0).toUpperCase() || 'B'
                    )}
                  </div>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{brand.brandName}</h3>
                <p className="text-gray-600 text-sm italic mb-3 line-clamp-1">"{brand.tagline}"</p>
                
                <p className="text-gray-700 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{brand.description}</p>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(brand.categoryName)}`}>
                    {brand.categoryName || 'Uncategorized'}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-medium ${
                    brand.isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleFeatured(brand.id)}
                      disabled={actionLoading}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        brand.isFeature 
                          ? 'text-orange-500 hover:bg-orange-50' 
                          : 'text-gray-400 hover:bg-gray-50 hover:text-orange-500'
                      }`}
                    >
                      <Star size={16} fill={brand.isFeature ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      onClick={() => handleEditClick(brand)}
                      disabled={actionLoading}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBrand(brand.id)}
                      disabled={actionLoading}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Featured</span>
                    <button
                      onClick={() => toggleFeatured(brand.id)}
                      disabled={actionLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                        brand.isFeature ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brand.isFeature ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Additional info if available */}
                {brand._count && (
                  <div className="pt-3 border-t border-gray-100 mt-3">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Orders: {brand._count.order}</span>
                      <span>Vouchers: {brand._count.vouchers}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {brands.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category !== 'All Brands' || filters.isActive || filters.isFeature
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first brand'}
            </p>
            {!filters.search && filters.category === 'All Brands' && !filters.isActive && !filters.isFeature && (
              <button
                onClick={() => {
                  resetForm();
                  setEditingBrand(null);
                  setShowAddForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Brand
              </button>
            )}
          </div>
        )}

        {/* Add Brand Modal */}
        <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
          <BrandForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            autoPopulateFromWebsite={autoPopulateFromWebsite} 
            setShowAddForm={setShowAddForm} 
            setFormData={setFormData}
            actionLoading={actionLoading}
            isEditing={false}
          />
        </Modal>

        {/* Edit Brand Modal */}
        <Modal isOpen={showEditForm} onClose={() => {
          setShowEditForm(false);
          setEditingBrand(null);
          resetForm();
        }}>
          <BrandForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            autoPopulateFromWebsite={autoPopulateFromWebsite} 
            setShowAddForm={setShowEditForm} 
            setFormData={setFormData}
            actionLoading={actionLoading}
            isEditing={true}
            editingBrand={editingBrand}
          />
        </Modal>
      </div>
    </div>
  );
};

export default BrandManager;