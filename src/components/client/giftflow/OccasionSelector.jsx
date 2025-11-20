"use client"
import { useState, useEffect } from 'react';
import { getOccasions } from '@/lib/action/occasionAction';
import { ArrowLeft } from 'lucide-react';
import { goBack, goNext, setLoading, setOccasions, setSelectedOccasion, setError, setSelectedOccasionName } from '../../../redux/giftFlowSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function OccasionSelector() {
  const dispatch = useDispatch();
  const {
    occasions,
    loading,
    error,
    occasionsPagination,
    currentOccasionPage,
    selectedOccasion
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

  const handleOccasionSelect = (occasion) => {

    dispatch(setSelectedOccasion(occasion.id));
    dispatch(setSelectedOccasionName(occasion.name))
    dispatch(goNext());
  };

  const handleLoadMore = () => {
    if (occasionsPagination?.hasNextPage) {
      fetchOccasions(currentOccasionPage + 1);
    }
  };

  if (loading && currentOccasionPage === 1) {
    return (
      <div className="min-h-screen  py-30 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-dashed rounded-full animate-spin border-pink-500 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-900 mt-4">Loading Occasions...</h2>
          <p className="text-gray-600 text-sm">Finding the perfect moments for you!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  py-30  flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-red-600">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mt-2 text-sm">{error}</p>
          <button
            onClick={() => fetchOccasions(1)}
            className="mt-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm hover:from-pink-600 hover:to-orange-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  py-30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
          <button
            onClick={() => dispatch(goBack())}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 
               transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 group-hover:[&amp;&gt;path]:fill-white"><path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)"></path><defs><linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse"><stop stopColor="#ED457D"></stop><stop offset="1" stopColor="#FA8F42"></stop></linearGradient></defs></svg>
            <span className="text-base font-semibold text-gray-800">
              Previous
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            What's the Occasion?
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Choose the perfect moment to celebrate and we'll help you create something beautiful
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {occasions.map((occasion, index) => {
            console.log(occasion,"occasion")
            return(
            <div
              key={`${occasion.id}-${index}`}
              className={`bg-[#D9D9D933] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${selectedOccasion === occasion.id ? 'border-2 border-blue-500' : 'border-2 border-transparent'
                }`}
              onClick={() => handleOccasionSelect(occasion)}
            >
              {/* Image Container with rounded corners */}
              <div className="w-full px-4 pt-4">
                <div className="w-full h-56 overflow-hidden rounded-2xl bg-gray-200">
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(occasion.name);
                    }}
                  />
                </div>
              </div>

              {/* Card Content */}
              <div className="px-6 pt-5 pb-6 text-center">
                {/* Title */}
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {occasion.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-2">
                  {occasion.description}
                </p>

                {/* CTA Button */}
                <button
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold text-sm rounded-full transition-all duration-200 hover:shadow-xl hover:from-pink-600 hover:to-orange-500 flex items-center justify-center gap-2 transform hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOccasionSelect(occasion);
                  }}
                >
                  Choose this Occasion
                  <span className="text-lg font-bold">▸</span>
                </button>
              </div>
            </div>
          )})}
        </div>

        {/* Load More Section */}
        <div className="text-center">
          {loading && currentOccasionPage > 1 && (
            <div className="inline-flex items-center text-gray-600">
              <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-pink-500 mr-2"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          )}
          {!loading && occasionsPagination?.hasNextPage && (
            <button
              onClick={handleLoadMore}
              className="bg-white text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 hover:border-pink-300 transition-all duration-200 text-sm"
            >
              Show More Occasions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}