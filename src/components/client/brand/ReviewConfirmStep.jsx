import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Heart, Lock, Shield, Edit, CreditCard, ExternalLink } from "lucide-react";
import { goBack, goNext } from "../../../redux/giftFlowSlice";

const ReviewConfirmStep = () => {
  const dispatch = useDispatch();
  
  const {
    selectedBrand,
    selectedAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedTiming,
    selectedOccasion
  } = useSelector((state) => state.giftFlowReducer);

  const handleBack = () => {
    dispatch(goBack());
  };

  const handleEditMessage = () => {
    // Navigate back to personal message step
    // You could implement a more sophisticated navigation system
    // For now, just going back to step 5 (PersonalMessageStep)
    dispatch({ type: 'giftFlow/setCurrentStep', payload: 5 });
  };

  const handleChangeCard = () => {
    // Navigate back to brand selection
    dispatch({ type: 'giftFlow/setCurrentStep', payload: 1 });
  };

  const handleProceedToPayment = () => {
    dispatch(goNext());
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const getDeliveryMethodDisplay = () => {
    switch (deliveryMethod) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'Email';
      case 'print':
        return 'Print it Yourself';
      default:
        return 'Not selected';
    }
  };

  const getRecipientInfo = () => {
    if (deliveryMethod === 'whatsapp') {
      return deliveryDetails?.recipientName || 'Not specified';
    } else if (deliveryMethod === 'email') {
      return deliveryDetails?.recipientFullName || 'Not specified';
    }
    return 'Self';
  };

  const getTimingDisplay = () => {
    if (!selectedTiming) return 'Not specified';
    
    switch (selectedTiming.type) {
      case 'immediate':
        return 'Send Immediately';
      case 'now':
        return 'Send Now';
      case 'scheduled':
        return `Scheduled for ${selectedTiming.date}`;
      default:
        return selectedTiming.type || 'Not specified';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center text-pink-500 hover:text-pink-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        {/* Header with Step Indicator */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">👁️</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Preview & Confirm</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Review Your Beautiful Gift
            </span>
            <span className="ml-2">🎁</span>
          </h1>
          <p className="text-gray-600">
            Confirm all details before proceeding to payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Gift Card Preview */}
          <div className="space-y-6">
            {/* Gift Card Visual */}
            <div className="bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl p-8 text-white relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <div className="w-32 h-32 border-2 border-white rounded-full"></div>
              </div>
              <div className="absolute -bottom-8 -left-8 opacity-10">
                <div className="w-40 h-40 bg-white rounded-full"></div>
              </div>
              
              {/* Gift Card Content */}
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Special Gift
                  </h3>
                </div>

                {/* Lock overlay for gift code protection */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="text-center">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-white" />
                    <h4 className="font-semibold text-lg mb-1">Gift Code Protected</h4>
                    <p className="text-sm opacity-90">Revealed after payment</p>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <div className="text-4xl font-bold">
                    {formatAmount(selectedAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Gift Code Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="font-semibold text-gray-800">Secure Gift Code</h3>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-400 tracking-wider">••••••••••••••••</span>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center text-green-600">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Protected</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                🔒 Code revealed after payment completion
              </p>
            </div>
          </div>

          {/* Right Column - Details Summary */}
          <div className="space-y-6">
            {/* Brand and Amount */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
                    {selectedBrand?.logo ? (
                      <img 
                        src={selectedBrand.logo} 
                        alt={selectedBrand.brandName || selectedBrand.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {(selectedBrand?.brandName || selectedBrand?.name || 'SB')?.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {selectedBrand?.brandName || selectedBrand?.name || 'Selected Brand'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedBrand?.description || selectedBrand?.tagline || 'Gift card'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-600">
                    {formatAmount(selectedAmount)}
                  </div>
                  <button 
                    onClick={handleChangeCard}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 mt-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Message */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-pink-500 mr-2" />
                  <h3 className="font-semibold text-gray-800">Personal Message</h3>
                </div>
                <button
                  onClick={handleEditMessage}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Message
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 italic">
                  "{personalMessage || 'No message added'}"
                </p>
                <div className="text-right mt-2">
                  <span className="text-sm text-gray-500">— With love 💕</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Delivery Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{getDeliveryMethodDisplay()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium">{getRecipientInfo()}</span>
                </div>
                {selectedTiming && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timing:</span>
                    <span className="font-medium">
                      {getTimingDisplay()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Secure Preview Mode */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Secure Preview Mode</h4>
                  <p className="text-sm text-blue-600">
                    Gift code protected until payment completion
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Payment
              </button>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleEditMessage}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Message
                </button>
                <button
                  onClick={handleChangeCard}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Change Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewConfirmStep;