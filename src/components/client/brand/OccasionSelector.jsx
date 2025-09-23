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
      <div className="min-h-screen flex items-center justify-center bg-wave-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-dashed rounded-full animate-spin border-wave-orange mx-auto loading-spinner"></div>
          <h2 className="text-xl font-medium text-wave-green mt-4">Loading Occasions...</h2>
          <p className="text-wave-brown text-sm">Finding the perfect moments for you!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wave-cream">
        <div className="text-center p-8 bg-white rounded-xl shadow-brand border border-wave-cream">
          <h2 className="text-xl font-semibold text-red-600">Oops! Something went wrong.</h2>
          <p className="text-wave-brown mt-2 text-sm">{error}</p>
          <button
            onClick={() => fetchOccasions(1)}
            className="mt-4 btn-primary px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-6">
        <ProgressIndicator />
        
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-wave-green hover:text-wave-orange mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold heading-primary mb-3">
            What's the Occasion?
          </h1>
          <p className="text-wave-brown text-base max-w-2xl mx-auto leading-relaxed">
            Choose the perfect moment to celebrate and we'll help you create something beautiful
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {occasions.map((occasion, index) => (
            <div
              key={`${occasion.id}-${index}`}
              className="card card-body text-center transition-all duration-200 hover:shadow-brand-lg cursor-pointer border border-wave-cream hover:border-wave-orange group"
              onClick={() => handleOccasionSelect(occasion.id)}
            >
              {/* Icon/Emoji */}
              <div className="w-20 h-20 mx-auto mb-6 bg-wave-cream-dark rounded-full flex items-center justify-center text-3xl transition-transform duration-200 group-hover:scale-110">
                {occasion.emoji}
              </div>
              
              {/* Title */}
              <h3 className="font-semibold text-xl text-wave-green mb-3">
                {occasion.name}
              </h3>
              
              {/* Description */}
              <p className="text-wave-brown text-sm mb-2 leading-relaxed">
                {occasion.description}
              </p>
              
              {/* Type/Category */}
              <p className="badge badge-outline text-xs font-medium mb-6 uppercase tracking-wide inline-block">
                {occasion.type}
              </p>
              
              {/* CTA Button */}
              <button
                className="w-full py-3 px-4 btn-primary font-medium text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOccasionSelect(occasion.id);
                }}
              >
                Choose This Occasion
              </button>
            </div>
          ))}
        </div>

        {/* Load More Section */}
        <div className="text-center">
          {loading && currentOccasionPage > 1 && (
            <div className="inline-flex items-center text-wave-brown">
              <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-wave-orange mr-2 loading-spinner"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          )}
          {!loading && occasionsPagination?.hasNextPage && (
            <button
              onClick={handleLoadMore}
              className="bg-white text-wave-green px-8 py-3 rounded-xl font-medium border border-wave-cream hover:bg-wave-cream-dark hover:border-wave-orange transition-all duration-200 text-sm"
            >
              Show More Occasions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}