import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { goBack, goNext } from '../../../redux/giftFlowSlice';
import { addToBulk } from '../../../redux/cartSlice';

const BulkOrderSetup = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { selectedBrand,selectedAmount } = useSelector((state) => state.giftFlowReducer);
  
  const [selectedDenomination, setSelectedDenomination] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  // Get available denominations from selected brand
  const denominations = selectedBrand?.vouchers?.[0]?.denominations || [];
  
  // Calculate total spend
  const totalSpend = selectedDenomination && quantity 
    ? (selectedDenomination.value * parseInt(quantity || 0)).toFixed(2)
    : '0.00';

  const handleBackToBrands = () => {
    dispatch(goBack());
  };

  const handleDenominationSelect = (denom) => {
    setSelectedDenomination(denom);
    setError('');
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value || 0);
      
      // Check maximum limit
      if (numValue > 10000) {
        setError('Maximum 10,000 vouchers per order');
        setQuantity('10000');
      } else {
        setQuantity(value);
        setError('');
      }
    }
  };

  useEffect(()=>{
    if(selectedAmount && selectedAmount!==""){
        const selectedDenomination = denominations?.filter((data)=> data?.value == selectedAmount?.value)
        setSelectedDenomination(selectedDenomination[0])
    }
  },[selectedAmount])


  const handleAddToBulkOrder = () => {
    // Validation
    if (!selectedDenomination) {
      setError('Please select a denomination');
      return;
    }
    
    if (!quantity || parseInt(quantity) === 0) {
      setError('Please enter quantity');
      return;
    }
    
    if (parseInt(quantity) < 1) {
      setError('Minimum quantity is 1');
      return;
    }

    // Create bulk order item
    const bulkOrderItem = {
      selectedBrand,
      selectedAmount: {
        value: selectedDenomination.value,
        currency: selectedDenomination.currency || 'R'
      },
      quantity: parseInt(quantity),
      totalSpend: parseFloat(totalSpend),
      deliveryMethod: 'bulk', // Special flag for bulk orders
      isBulkOrder: true
    };

    // Dispatch to cart
    dispatch(addToBulk(bulkOrderItem));
    
    // Reset and navigate
    dispatch(goNext());

  };

  if (!selectedBrand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4  py-30">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No brand selected</p>
          <button
            onClick={() => router.push('/gift')}
            className="text-pink-500 hover:text-pink-600 font-semibold"
          >
            Select a Brand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4  py-30 md:px-8 md:py-30">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToBrands}
          className="flex items-center gap-2 text-pink-500 hover:text-pink-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Brands</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 bg-white border border-pink-300 rounded-full mb-4">
            <span className="text-pink-500 font-semibold text-sm">Bulk Gifting</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Set up your bulk order
          </h1>
          <p className="text-gray-600">
            We'll generate unique codes for each voucher, ready for you to send out.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Selected Brand */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Selected Brand</h3>
            
            {/* Brand Card */}
            <div className="flex flex-col items-center text-center">
              {/* Brand Logo */}
              <div className="w-32 h-32 mb-4 flex items-center justify-center">
                {selectedBrand.logo ? (
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.brandName || selectedBrand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-5xl">
                      {(selectedBrand.brandName || selectedBrand.name || 'B').substring(0, 1).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Brand Name */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedBrand.brandName || selectedBrand.name}
              </h2>

              {/* Category Badge */}
              {selectedBrand.category && (
                <div className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-3">
                  {selectedBrand.category}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedBrand.description || selectedBrand.tagline || 'Premium gift card'}
              </p>
            </div>
          </div>

          {/* Right Column - Order Details */}
          <div className="space-y-6">
            {/* Denomination Selection */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Denomination
              </label>
              
              <div className="relative">
                <select
                  value={selectedDenomination?.value || ''}
                  onChange={(e) => {
                    const denom = denominations.find(d => d.value === parseFloat(e.target.value));
                    handleDenominationSelect(denom);
                  }}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 bg-white cursor-pointer"
                >
                  <option value="">Select Denomination</option>
                  {denominations.map((denom, index) => (
                    <option key={index} value={denom.value}>
                      {denom.currency || 'R'} {denom.value}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Quantity Input */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quantity
              </label>
              
              <input
                type="text"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="e.g., 50 Vouchers"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700"
              />
              
              <p className="text-xs text-gray-500 mt-2">
                Maximum 10,000 vouchers per order
              </p>
            </div>

            {/* Total Spend */}
            <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl p-6 border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Total Spend</span>
                {quantity && selectedDenomination && (
                  <span className="text-xs text-gray-600">
                    {quantity} × {selectedDenomination.currency || 'R'}{selectedDenomination.value}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-pink-600">
                {selectedDenomination?.currency || 'R'}{totalSpend}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Add to Bulk Order Button */}
            <button
              onClick={handleAddToBulkOrder}
              disabled={!selectedDenomination || !quantity || parseInt(quantity) === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Add to Bulk Order
              <span className="text-xl">▶</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderSetup;