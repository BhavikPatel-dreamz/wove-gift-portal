"use client"
import { useState, useEffect, useCallback } from 'react';
import { getOccasions } from '@/lib/action/occasionAction';
import { ArrowLeft } from 'lucide-react';
import { goBack, goNext, setLoading, setOccasions, setSelectedOccasion } from '../../../redux/giftFlowSlice';
import { useDispatch, useSelector } from 'react-redux';
import ProgressIndicator from './ProgressIndicator';

export default function OccasionSelector() {
  const dispatch = useDispatch();
  const { 
    occasions, 
    loading, 
    error, 
    occasionsPagination, 
    currentOccasionPage 
  } = useSelector((state) => state.giftFlowReducer);

  const occasionColors = [
    { bgColor: 'bg-orange-100', buttonColor: 'bg-orange-500 hover:bg-orange-600' },
    { bgColor: 'bg-blue-100', buttonColor: 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600' },
    { bgColor: 'bg-yellow-100', buttonColor: 'bg-yellow-500 hover:bg-yellow-600' },
    { bgColor: 'bg-red-100', buttonColor: 'bg-red-500 hover:bg-red-600' },
    { bgColor: 'bg-pink-100', buttonColor: 'bg-pink-500 hover:bg-pink-600' },
    { bgColor: 'bg-purple-100', buttonColor: 'bg-purple-500 hover:bg-purple-600' },
  ];

  const fetchOccasions = async (page) => {
    try {
      dispatch(setLoading(true));
      const response = await getOccasions({ isActive: true, limit: 8, page });
      if (response.success) {
        dispatch(setOccasions({
          data: response.data,
          page: page,
          pagination: response.meta.pagination
        }));
      } else {
        dispatch(setError(response.message || "Failed to fetch occasions."));
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (occasions.length === 0) {
      fetchOccasions(1);
    }
  }, [dispatch, occasions.length]);

  const handleOccasionSelect = (occasionId) => {
    dispatch(setSelectedOccasion(occasionId));
    dispatch(goNext());
  };

  const handleLoadMore = () => {
    if (occasionsPagination?.hasNextPage) {
      fetchOccasions(currentOccasionPage + 1);
    }
  };

  if (loading && currentOccasionPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-orange-500 mx-auto"></div>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">Loading Occasions...</h2>
          <p className="text-gray-500">Finding the perfect moments for you!</p>
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
            onClick={() => fetchOccasions(1)}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <ProgressIndicator />
        
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-orange-500 hover:text-orange-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
            What's the Occasion?
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose the perfect moment to celebrate and we'll help you create something beautiful
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {occasions.map((occasion, index) => {
            const colorScheme = occasionColors[index % occasionColors.length];
            return (
              <div
                key={`${occasion.id}-${index}`}
                className={`${colorScheme.bgColor} rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-2 relative overflow-hidden group border-transparent`}
                onClick={() => handleOccasionSelect(occasion.id)}
              >
                <div className="text-6xl mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                  {occasion.emoji}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2 transition-transform duration-300 group-hover:-translate-y-1">
                  {occasion.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed transition-transform duration-300 group-hover:-translate-y-1 h-10 overflow-hidden text-ellipsis">
                  {occasion.description}
                </p>
                <p className="text-xs text-orange-600 font-medium mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                  {occasion.cardCount > 0 ? `${occasion.cardCount} Designs Available` : 'New & Fresh'}
                </p>
                <button
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-all duration-300 transform ${colorScheme.buttonColor} 
                  translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-105`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOccasionSelect(occasion.id);
                  }}
                >
                  Choose This Occasion
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mb-8">
          {loading && currentOccasionPage > 1 && (
            <div className="inline-flex items-center text-gray-600">
              <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-orange-500 mr-2"></div>
              Loading more...
            </div>
          )}
          {!loading && occasionsPagination?.hasNextPage && (
            <button
              onClick={handleLoadMore}
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-medium border border-orange-200 hover:bg-orange-50 transition-all duration-200 transform hover:scale-105"
            >
              Show More Occasions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}