"use client"
import { useState, useEffect, useCallback } from 'react';
import { getOccasionCategories } from '@/lib/action/occasionAction';
import { ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { goBack, goNext, setLoading, setSelectedSubCategory, setSubCategories } from '../../../redux/giftFlowSlice';
import ProgressIndicator from './ProgressIndicator';

export default function SubCategorySelector() {
    const dispatch = useDispatch();
  const { 
    selectedOccasion, 
    subCategories, 
    loading, 
    error, 
    subCategoriesPagination, 
    currentSubCategoryPage 
  } = useSelector((state) => state.giftFlowReducer);

  const occasionColors = [
    { bgColor: 'bg-orange-100', buttonColor: 'bg-orange-500 hover:bg-orange-600', accent: 'border-orange-200' },
    { bgColor: 'bg-blue-100', buttonColor: 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600', accent: 'border-blue-200' },
    { bgColor: 'bg-yellow-100', buttonColor: 'bg-yellow-500 hover:bg-yellow-600', accent: 'border-yellow-200' },
    { bgColor: 'bg-red-100', buttonColor: 'bg-red-500 hover:bg-red-600', accent: 'border-red-200' },
    { bgColor: 'bg-pink-100', buttonColor: 'bg-pink-500 hover:bg-pink-600', accent: 'border-pink-200' },
    { bgColor: 'bg-purple-100', buttonColor: 'bg-purple-500 hover:bg-purple-600', accent: 'border-purple-200' },
    { bgColor: 'bg-green-100', buttonColor: 'bg-green-500 hover:bg-green-600', accent: 'border-green-200' },
    { bgColor: 'bg-indigo-100', buttonColor: 'bg-indigo-500 hover:bg-indigo-600', accent: 'border-indigo-200' },
  ];

  // Consistent height for all cards
  const cardHeight = 'h-100';

  const fetchSubCategories = async (page) => {
    if (!selectedOccasion) return;
    try {
      dispatch(setLoading(true));
      const response = await getOccasionCategories({ occasionId: selectedOccasion, limit: 8, page });
      if (response.success) {
        dispatch(setSubCategories({
          data: response.data,
          page: page,
          pagination: response.meta.pagination
        }));
      } else {
        dispatch(setError(response.message || "Failed to fetch sub-categories."));
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (selectedOccasion && subCategories.length === 0) {
      fetchSubCategories(1);
    }
  }, [selectedOccasion, dispatch, subCategories.length]);

  const handleSubCategorySelect = (subCategoryId) => {
    dispatch(setSelectedSubCategory(subCategoryId));
    dispatch(goNext());
  };

  const handleLoadMore = () => {
    if (subCategoriesPagination?.hasNextPage) {
      fetchSubCategories(currentSubCategoryPage + 1);
    }
  };

  if (loading && currentSubCategoryPage === 1) {
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
      <div className="max-w-7xl mx-auto">
        <ProgressIndicator />
        
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-teal-500 hover:text-teal-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-4">
            Choose a Category
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select a category that best fits the moment.
          </p>
        </div>

        {/* Grid with consistent card heights */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 mb-8">
          {subCategories.map((subCategory, index) => {
            const colorScheme = occasionColors[index % occasionColors.length];
            
            return (
              <div
                key={`${subCategory.id}-${index}`}
                className={`bg-white rounded-2xl mb-6 break-inside-avoid ${cardHeight}
                transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer 
                shadow-lg relative overflow-hidden group flex flex-col`}
                onClick={() => handleSubCategorySelect(subCategory.id)}
              >
                {/* Category tag - positioned absolutely on the image */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-gray-100/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-gray-700 border border-white/50">
                    {subCategory.type || 'Artistic'}
                  </span>
                </div>

                {/* Image section - takes up most of the space */}
                <div className="relative flex-1 overflow-hidden rounded-t-2xl">
                  {subCategory.image ? (
                    <img 
                      src={subCategory.image} 
                      alt={subCategory.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback with emoji and gradient */}
                  <div 
                    className="w-full h-full bg-gradient-to-br from-pink-200 via-blue-200 to-green-200 flex items-center justify-center"
                    style={{ display: subCategory.image ? 'none' : 'flex' }}
                  >
                    <span className="text-6xl opacity-80">{subCategory.emoji || '🎁'}</span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button
                      className={`py-2 px-6 rounded-full text-white font-semibold text-sm transition-all duration-300 transform scale-90 group-hover:scale-100 ${colorScheme.buttonColor} shadow-lg`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubCategorySelect(subCategory.id);
                      }}
                    >
                      Select
                    </button>
                  </div>
                </div>

                {/* Content section - white background at bottom with fixed height */}
                <div className="p-5 bg-white rounded-b-2xl h-35 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight line-clamp-1">
                      {subCategory.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {subCategory.description}
                    </p>
                  </div>
                  
                  {/* Heart icons like in the birthday card */}
                  <div className="flex items-center space-x-1 mt-2">
                    <span className="text-pink-400 text-lg"> {subCategory.emoji}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mb-8">
          {loading && currentSubCategoryPage > 1 && (
            <div className="inline-flex items-center text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50">
              <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-teal-500 mr-2"></div>
              Loading more...
            </div>
          )}
          {!loading && subCategoriesPagination?.hasNextPage && (
            <button
              onClick={handleLoadMore}
              className="bg-white/80 backdrop-blur-sm text-teal-600 px-8 py-4 rounded-xl font-semibold border border-white/50 hover:bg-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Show More Categories
            </button>
          )}
        </div>
      </div>
    </div>
  );
}