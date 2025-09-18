
"use client"
import { useState, useEffect, useCallback } from 'react';
import { getOccasionCategories } from '@/lib/action/occasionAction';
import { ArrowLeft } from 'lucide-react';

const occasionColors = [
    { bgColor: 'bg-orange-100', buttonColor: 'bg-orange-500 hover:bg-orange-600' },
    { bgColor: 'bg-blue-100', buttonColor: 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600' },
    { bgColor: 'bg-yellow-100', buttonColor: 'bg-yellow-500 hover:bg-yellow-600' },
    { bgColor: 'bg-red-100', buttonColor: 'bg-red-500 hover:bg-red-600' },
    { bgColor: 'bg-pink-100', buttonColor: 'bg-pink-500 hover:bg-pink-600' },
    { bgColor: 'bg-purple-100', buttonColor: 'bg-purple-500 hover:bg-purple-600' },
];

export default function SubCategorySelector({ selectedOccasion, onBack, onSelectSubCategory, selectedSubCategory }) {
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSubCategories = useCallback(async (page) => {
        if (!selectedOccasion) return;
        try {
            setLoading(true);
            const response = await getOccasionCategories({ occasionId: selectedOccasion, limit: 8, page });
            if (response.success) {
                setSubCategories(prev => (page === 1 ? response.data : [...prev, ...response.data]));
                setPagination(response.meta.pagination);
            } else {
                throw new Error(response.message || "Failed to fetch sub-categories.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedOccasion]);

    useEffect(() => {
        fetchSubCategories(currentPage);
    }, [currentPage, fetchSubCategories]);

    const handleSubCategorySelect = (subCategoryId) => {
        onSelectSubCategory?.(subCategoryId);
    };

    const handleLoadMore = () => {
        if (pagination?.hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500 mx-auto"></div>
                    <h2 className="text-2xl font-semibold text-gray-700 mt-4">Loading Sub-Categories...</h2>
                    <p className="text-gray-500">Getting more specific for you!</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600">Oops! Something went wrong.</h2>
                    <p className="text-gray-600 mt-2">{error}</p>
                    <button
                        onClick={() => fetchSubCategories(1)}
                        className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-6">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center text-teal-500 hover:text-teal-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Occasions
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                        Choose a Category
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Select a category that best fits the moment.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {subCategories.map((subCategory, index) => {
                        const colorScheme = occasionColors[index % occasionColors.length];
                        return (
                            <div
                                key={`${subCategory.id}-${index}`}
                                className={`${colorScheme.bgColor} rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-2 relative overflow-hidden group ${selectedSubCategory === subCategory.id
                                        ? 'border-teal-400 shadow-lg scale-105'
                                        : 'border-transparent'
                                    }`}
                                onClick={() => handleSubCategorySelect(subCategory.id)}
                            >
                                <div className="text-6xl mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                                    {subCategory.emoji}
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2 transition-transform duration-300 group-hover:-translate-y-1">
                                    {subCategory.name}
                                </h3>
                                <p
                                    className="text-sm text-gray-600 mb-3 leading-relaxed transition-transform duration-300 group-hover:-translate-y-1 h-10 overflow-hidden text-ellipsis"
                                    title={subCategory.description}
                                >
                                    {subCategory.description}
                                </p>
                                <button
                                    className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-all duration-300 transform ${colorScheme.buttonColor} 
                    translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-105
                    ${selectedSubCategory === subCategory.id ? 'translate-y-0 opacity-100' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubCategorySelect(subCategory.id);
                                    }}
                                >
                                    Select
                                </button>
                            </div>
                        )
                    })}
                </div>

                <div className="text-center mb-8">
                    {loading && currentPage > 1 && (
                        <div className="inline-flex items-center text-gray-600">
                            <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-teal-500 mr-2"></div>
                            Loading more...
                        </div>
                    )}
                    {!loading && pagination?.hasNextPage && (
                        <button
                            onClick={handleLoadMore}
                            className="bg-white text-teal-600 px-8 py-3 rounded-lg font-medium border border-teal-200 hover:bg-teal-50 transition-all duration-200 transform hover:scale-105"
                        >
                            Show More Categories
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
