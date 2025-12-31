"use client"
import React, { useState, useEffect, useTransition } from 'react';
import { Search, Plus, Edit, Star, MoreVertical, Trash2, Loader, ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc, Power, History } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createBrandPartner, updateBrand, deleteBrandPartner } from '../../../lib/action/brandPartner';
import CustomDropdown from '../../../components/ui/CustomDropdown';
import { Categories } from '../../../lib/resourses';

const BrandManager = ({ initialBrands, initialPagination, initialStatistics, initialCategoryStats, searchParams }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [brands, setBrands] = useState(initialBrands);
    const [pagination, setPagination] = useState(initialPagination);
    const [statistics, setStatistics] = useState(initialStatistics);
    const [categoryStats, setCategoryStats] = useState(initialCategoryStats);
    const [actionLoading, setActionLoading] = useState(false);

    // Local state for immediate UI updates
    const [searchInput, setSearchInput] = useState(searchParams?.search || '');
    const [debounceTimer, setDebounceTimer] = useState(null);

    const filters = {
        search: searchParams?.search || '',
        category: searchParams?.category || 'All Brands',
        isActive: searchParams?.isActive || null,
        isFeature: searchParams?.isFeature || null,
        sortBy: searchParams?.sortBy || 'createdAt',
        sortOrder: searchParams?.sortOrder || 'desc'
    };

    // Update local state when props change
    useEffect(() => {
        setBrands(initialBrands);
        setPagination(initialPagination);
        setStatistics(initialStatistics);
        setCategoryStats(initialCategoryStats);
    }, [initialBrands, initialPagination, initialStatistics, initialCategoryStats]);

    // Update search input when URL changes
    useEffect(() => {
        setSearchInput(searchParams?.search || '');
    }, [searchParams?.search]);

    // Helper function to build URL with search params
    const buildUrlWithParams = (updates) => {
        const params = new URLSearchParams();

        // Start with current params
        Object.entries(searchParams || {}).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        // Apply updates
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'All Brands' && value !== '') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset to page 1 when filters change (except for page changes)
        if (!updates.page && !updates.limit) {
            params.set('page', '1');
        }

        const queryString = params.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
    };

    const handleFilterChange = (key, value) => {
        startTransition(() => {
            const newUrl = buildUrlWithParams({ [key]: value });
            router.push(newUrl);
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new timer for debounced search
        const timer = setTimeout(() => {
            startTransition(() => {
                const newUrl = buildUrlWithParams({ search: value });
                router.push(newUrl);
            });
        }, 500); // 500ms debounce

        setDebounceTimer(timer);
    };

    const handlePageChange = (newPage) => {
        startTransition(() => {
            const newUrl = buildUrlWithParams({ page: newPage.toString() });
            router.push(newUrl);
        });

        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (newLimit) => {
        startTransition(() => {
            const newUrl = buildUrlWithParams({ limit: newLimit.toString(), page: '1' });
            router.push(newUrl);
        });
    };

    const createFormData = (brandData, isUpdate = false, existingBrand = null) => {
        const formDataToSend = new FormData();

        if (isUpdate && existingBrand) {
            formDataToSend.append('id', existingBrand.id);
        }

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

        Object.keys(fieldsToAppend).forEach(key => {
            if (key === 'isFeature' || key === 'isActive') {
                formDataToSend.append(key, fieldsToAppend[key].toString());
            } else {
                formDataToSend.append(key, fieldsToAppend[key]);
            }
        });

        if (brandData.logo && brandData.logo instanceof File) {
            formDataToSend.append('logo', brandData.logo);
        }

        return formDataToSend;
    };

    const handleDeleteBrand = async (brandId) => {
        if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(true);
            const result = await deleteBrandPartner(brandId);

            if (result.success) {
                toast.success('Brand deleted successfully');
                router.refresh();
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

            const toggleData = {
                ...brand,
                isFeature: !brand.isFeature,
                logo: null
            };

            const formDataToSend = createFormData(toggleData, true, brand);
            const result = await updateBrand(formDataToSend);

            if (result.success) {
                toast.success(`Brand ${!brand.isFeature ? 'featured' : 'unfeatured'} successfully`);
                router.refresh();
            } else {
                toast.error('Failed to update brand');
            }
        } catch (error) {
            toast.error('Failed to update brand');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleActive = async (id) => {
        const brand = brands.find(b => b.id === id);
        if (!brand) return;

        try {
            setActionLoading(true);

            const toggleData = {
                ...brand,
                isActive: !brand.isActive,
                logo: null
            };

            const formDataToSend = createFormData(toggleData, true, brand);
            const result = await updateBrand(formDataToSend);

            if (result.success) {
                toast.success(`Brand ${!brand.isActive ? 'activated' : 'deactivated'} successfully`);
                router.refresh();
            } else {
                toast.error('Failed to update brand');
            }
        } catch (error) {
            toast.error('Failed to update brand');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditClick = (brand) => {
        router.push(`/brandsPartner/edit/${brand.id}`);
    };

    const redirectToSettlement = (brandId) => {
        router.push(`/brandsPartner/${brandId}/settlements`);
    };

    const getCategoryColor = (category) => {
        if (category?.includes('Fashion')) return 'bg-pink-50 text-pink-700 border-pink-200';
        if (category === 'Clothing') return 'bg-purple-50 text-purple-700 border-purple-200';
        if (category === 'Footwear') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (category === 'Sports') return 'bg-green-50 text-green-700 border-green-200';
        return 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const clearAllFilters = () => {
        setSearchInput('');
        startTransition(() => {
            router.push(pathname);
        });
    };

    const hasActiveFilters = filters.search || filters.category !== 'All Brands' || filters.isActive || filters.isFeature;

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
                        onClick={() => router.push('/brandsPartner/new')}
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
                        {/* Search with loading indicator */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search brands by name, category, or tagline..."
                                value={searchInput}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {isPending && (
                                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={16} />
                            )}
                        </div>

                        {/* Category Filter */}
                        <CustomDropdown
                            value={filters.category}
                            onChange={(value) => handleFilterChange('category', value)}
                            options={[{ value: 'All Brands', label: 'All Brands' }, ...Categories.map(c => ({ value: c, label: c }))]}
                            placeholder="Select Category"
                            className="min-w-[150px]"
                        />

                        {/* Status Filters */}
                        <CustomDropdown
                            value={filters.isActive || ''}
                            onChange={(value) => handleFilterChange('isActive', value || null)}
                            options={[
                                { value: '', label: 'All Status' },
                                { value: 'true', label: 'Active Only' },
                                { value: 'false', label: 'Inactive Only' }
                            ]}
                            placeholder="All Status"
                            className="min-w-[150px]"
                        />

                        <CustomDropdown
                            value={filters.isFeature || ''}
                            onChange={(value) => handleFilterChange('isFeature', value || null)}
                            options={[
                                { value: '', label: 'All Brands' },
                                { value: 'true', label: 'Featured Only' },
                                { value: 'false', label: 'Non-Featured' }
                            ]}
                            placeholder="All Brands"
                            className="min-w-[150px]"
                        />

                        {/* Sort */}
                        <div className="flex gap-2">
                            <CustomDropdown
                                value={filters.sortBy}
                                onChange={(value) => handleFilterChange('sortBy', value)}
                                options={[
                                    { value: 'createdAt', label: 'Created Date' },
                                    { value: 'brandName', label: 'Name' },
                                    { value: 'categoryName', label: 'Category' },
                                    { value: 'updatedAt', label: 'Updated Date' }
                                ]}
                                className="min-w-[150px]"
                            />
                            <button
                                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                            >
                                {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Active filters display */}
                    {hasActiveFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2 items-center">
                            {filters.search && (
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    Search: "{filters.search}"
                                    <button
                                        onClick={() => {
                                            setSearchInput('');
                                            handleFilterChange('search', '');
                                        }}
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
                            <button
                                onClick={clearAllFilters}
                                className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Brands Grid with loading overlay */}
                <div className="relative">
                    {isPending && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                            <Loader className="animate-spin text-blue-600" size={32} />
                        </div>
                    )}

                    {brands.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                            {brands.map(brand => (
                                <div
                                    key={brand.id}
                                    className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                                >
                                    <div className="relative">
                                        {/* Image container */}
                                        <div
                                            className="h-40 w-full flex items-center justify-center text-white font-bold text-3xl"
                                            style={{ backgroundColor: brand.color || '#000000' }}
                                        >
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.brandName} className="w-full h-full object-cover" />
                                            ) : (
                                                brand.brandName?.charAt(0).toUpperCase() || 'B'
                                            )}
                                        </div>

                                        {/* Featured Badge */}
                                        {brand.isFeature && (
                                            <div className="absolute top-3 right-3 bg-orange-400 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-md">
                                                <Star size={12} fill="currentColor" />
                                                Featured
                                            </div>
                                        )}

                                        {/* Status Indicator */}
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md ${brand.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${brand.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-grow flex flex-col">
                                        <h3 className="font-bold text-xl text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">{brand.brandName}</h3>
                                        <p className="text-gray-500 text-sm italic mb-3 line-clamp-1">"{brand.tagline}"</p>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] flex-grow">{brand.description}</p>

                                        {/* Category */}
                                        <div className="mb-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(brand.categoryName)}`}>
                                                {brand.categoryName || 'Uncategorized'}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-2 mt-auto pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => redirectToSettlement(brand.id)}
                                                disabled={actionLoading}
                                                title={brand.isFeature ? 'Unfeature Brand' : 'Feature Brand'}
                                                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 bg-[#E5E5E5] text-[#4A4A4A] hover:bg-orange-200`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 12 14" fill="none">
                                                    <path d="M11.4809 3.56317V12.6533C11.4809 13.3958 10.8767 14 10.1342 14H3.98994C3.24739 14 2.64326 13.3958 2.64326 12.6533V6.74272C2.83535 6.77468 3.03132 6.7954 3.23243 6.7954C3.37505 6.7954 3.51503 6.7848 3.65328 6.76845V12.6533C3.65328 12.8389 3.80427 12.99 3.98994 12.99H10.1342C10.3198 12.99 10.4708 12.8389 10.4708 12.6533V3.56317C10.4708 3.37749 10.3198 3.2265 10.1342 3.2265H6.80135C6.80135 2.87538 6.74859 2.53696 6.65403 2.21651H10.1342C10.8767 2.21648 11.4809 2.82061 11.4809 3.56317ZM3.17619 6.3523C1.42478 6.3523 0 4.92752 0 3.17619C2.7812e-05 1.42478 1.42478 0 3.17619 0C4.92754 0 6.35238 1.42478 6.35238 3.17619C6.35238 4.92752 4.92754 6.3523 3.17619 6.3523ZM3.17619 5.67894C4.55617 5.67894 5.67897 4.55634 5.67897 3.17619C5.67897 1.79596 4.55634 0.673357 3.17619 0.673357C1.79599 0.673357 0.673357 1.79596 0.673357 3.17619C0.673357 4.55634 1.79616 5.67894 3.17619 5.67894ZM5.08107 3.51288C5.26691 3.51288 5.41773 3.36206 5.41773 3.17622C5.41773 2.99038 5.26691 2.83955 5.08107 2.83955H3.51286V1.51793C3.51286 1.33209 3.36203 1.18126 3.17619 1.18126C2.99035 1.18126 2.83953 1.33209 2.83953 1.51793V3.17622C2.83953 3.36206 2.99035 3.51288 3.17619 3.51288H5.08107ZM8.96685 6.24258H5.31958C5.13374 6.24258 4.98292 6.39341 4.98292 6.57925C4.98292 6.76511 5.13374 6.91591 5.31958 6.91591H8.96685C9.15278 6.91591 9.30352 6.76509 9.30352 6.57925C9.30355 6.39341 9.15278 6.24258 8.96685 6.24258ZM8.97278 8.28479H5.32551C5.13967 8.28479 4.98884 8.43553 4.98884 8.62146C4.98884 8.80738 5.13967 8.95812 5.32551 8.95812H8.97278C9.1587 8.95812 9.30941 8.80738 9.30941 8.62146C9.30941 8.43553 9.15887 8.28479 8.97278 8.28479ZM8.97278 10.4115H5.32551C5.13967 10.4115 4.98884 10.5624 4.98884 10.7482C4.98884 10.9341 5.13967 11.0848 5.32551 11.0848H8.97278C9.1587 11.0848 9.30941 10.9341 9.30941 10.7482C9.30944 10.5624 9.15887 10.4115 8.97278 10.4115Z" fill="#4A4A4A" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => toggleFeatured(brand.id)}
                                                disabled={actionLoading}
                                                title={brand.isFeature ? 'Unfeature Brand' : 'Feature Brand'}
                                                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${brand.isFeature
                                                    ? 'text-orange-500 bg-orange-100 hover:bg-orange-200'
                                                    : 'text-gray-400 hover:bg-gray-100 hover:text-orange-500'
                                                    }`}
                                            >
                                                <Star size={16} fill={brand.isFeature ? 'currentColor' : 'none'} />
                                            </button>
                                            <button
                                                onClick={() => toggleActive(brand.id)}
                                                disabled={actionLoading}
                                                title={brand.isActive ? 'Deactivate Brand' : 'Activate Brand'}
                                                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${brand.isActive
                                                    ? 'text-green-500 bg-green-100 hover:bg-green-200'
                                                    : 'text-gray-400 hover:bg-gray-100 hover:text-green-500'
                                                    }`}
                                            >
                                                <Power size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(brand)}
                                                disabled={actionLoading}
                                                title="Edit Brand"
                                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBrand(brand.id)}
                                                disabled={actionLoading}
                                                title="Delete Brand"
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800">No Brands Found</h3>
                            <p className="text-gray-500 mt-2">
                                {hasActiveFilters ? 'Try adjusting your filters' : 'Add a new brand to get started'}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
                            <span className="font-semibold">{pagination.totalItems}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevPage || isPending}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft size={14} />
                                Previous
                            </button>
                            <span className="text-sm text-gray-700 px-2">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage || isPending}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                Next
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandManager;