import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Shield, Check, CreditCard, Smartphone, Wallet, Building, Gift, Lock, Star } from "lucide-react";
import { goBack, setSelectedPaymentMethod } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";
import { createOrder } from "../../../lib/action/orderAction";
import toast, { Toaster } from 'react-hot-toast';

const PaymentStep = () => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  
  const {
    selectedBrand,
    selectedAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
    selectedPaymentMethod,
  } = useSelector((state) => state.giftFlowReducer);

  const data = useSelector((state) => state.giftFlowReducer);

  console.log("data",data);
  

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit or Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      color: 'bg-blue-500',
      popular: true,
      processing: 'Instant'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Trusted by millions worldwide',
      icon: Wallet,
      color: 'bg-blue-600',
      popular: false,
      processing: 'Instant'
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      description: 'Touch ID or Face ID',
      icon: Smartphone,
      color: 'bg-gray-800',
      popular: false,
      processing: 'Instant'
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      description: 'Quick and secure',
      icon: Smartphone,
      color: 'bg-green-500',
      popular: false,
      processing: 'Instant'
    }
  ];

  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = selectedAmount?.value || 0;
    return Math.round(baseAmount * 0.03); // 3% service fee
  };

  const calculateTotal = () => {
    const baseAmount = selectedAmount?.value || 0;
    const serviceFee = calculateServiceFee();
    return baseAmount + serviceFee;
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
        return 'Email';
    }
  };

  const getRecipientName = () => {
    if (deliveryMethod === 'whatsapp') {
      return deliveryDetails?.recipientName || 'Recipient';
    } else if (deliveryMethod === 'email') {
      return deliveryDetails?.recipientFullName || 'Recipient';
    }
    return 'Self';
  };

  const handlePaymentMethodSelect = (methodId) => {
    dispatch(setSelectedPaymentMethod(methodId));
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Processing your order...');

    try {
      const orderData = {
        selectedBrand,
        selectedAmount,
        personalMessage,
        deliveryMethod,
        deliveryDetails,
        selectedOccasion,
        selectedSubCategory,
        selectedTiming,
        selectedPaymentMethod,
      };
      const result = await createOrder(orderData);
      console.log("result", result);
      
      if (result.error) {
        setError(result.error);
        toast.error(result.error, { id: toastId });
      } else {
        setOrder(result.order);
        toast.success('Order placed successfully!', { id: toastId });
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const progressSteps = [
    { name: 'Brand Chosen', completed: true },
    { name: 'Card Picked', completed: true },
    { name: 'Message Written', completed: true },
    { name: 'Preview Complete', completed: true },
    { name: 'Secure Payment', completed: false, current: true }
  ];

  if (order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 md:p-6 flex items-center justify-center">
        <Toaster />
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
          <div className="bg-gray-50 rounded-xl p-6 space-y-4 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number:</span>
              <span className="font-semibold text-gray-800">{order.orderNumber}</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-500">Gift Code:</span>
              <span className="font-semibold text-gray-800">{order.giftCode}</span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-semibold text-gray-800">{order.currency} {order.totalAmount}</span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()} // Or redirect to a different page
            className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
          >
            Send Another Gift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 md:p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <ProgressIndicator />
        
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-purple-500 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm mb-4">
            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-2">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Final Step</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              You're almost there!
            </span>
          </h1>
          <p className="text-gray-600">
            Let's deliver your beautiful gift and make someone's day absolutely wonderful
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {progressSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.completed ? 'bg-green-500 text-white' : 
                  step.current ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.completed ? 'text-green-600' : 
                  step.current ? 'text-pink-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Gift Summary */}
          <div className="space-y-6">
            {/* Gift Card Preview */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Gift className="w-5 h-5 text-pink-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Your Beautiful Gift</h3>
                <div className="ml-auto text-2xl">🎁</div>
              </div>
              
              <p className="text-gray-600 mb-4">Ready to make someone smile</p>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
                    {selectedBrand?.logo ? (
                      <img 
                        src={selectedBrand.logo} 
                        alt={selectedBrand.brandName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {(selectedBrand?.brandName || 'SB')?.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {selectedBrand?.brandName || 'Gift Card'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatAmount(selectedAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Occasion & Message */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-800 mb-1">Forever Yours</h4>
                  <p className="text-sm text-purple-600">Anniversary</p>
                </div>
                
                <div className="p-4 bg-pink-50 rounded-xl">
                  <p className="text-gray-700 italic">
                    "{personalMessage || 'Special gift just for you'}"
                  </p>
                  <p className="text-right text-sm text-gray-500 mt-2">— With love 💕</p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Delivery Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivering via:</span>
                  <span className="font-medium text-blue-600">{getDeliveryMethodDisplay()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{getRecipientName()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {/* Security Badge */}
            <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 mr-3" />
                <div className="text-center">
                  <h3 className="text-xl font-bold">Secure Payment</h3>
                  <p className="text-pink-100">Protected by 256-bit SSL encryption</p>
                </div>
                <Lock className="w-8 h-8 ml-3" />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Your Payment Method</h3>
              <p className="text-gray-600 mb-6">Select how you'd like to complete this joyful transaction</p>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center mr-3`}>
                          <method.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-semibold text-gray-800">{method.name}</h4>
                            {method.popular && (
                              <div className="ml-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                Most Popular
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPaymentMethod === method.id 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPaymentMethod === method.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <p className="text-xs text-green-600 font-medium mt-1">{method.processing}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 font-medium">
                    Your payment is 100% secure and encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gift Card Value</span>
                  <span className="font-medium">{formatAmount(selectedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{selectedAmount?.currency} {calculateServiceFee()}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">{selectedAmount?.currency} {calculateTotal()}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedPaymentMethod || isProcessing}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Complete Secure Payment
                </>
              )}
            </button>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            What happens next?
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center text-blue-700">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
              <span className="text-sm">Payment processed securely in seconds</span>
            </div>
            <div className="flex items-center text-blue-700">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
              <span className="text-sm">Beautiful gift card generated instantly</span>
            </div>
            <div className="flex items-center text-blue-700">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</div>
              <span className="text-sm">Delivered exactly how you chose</span>
            </div>
            <div className="flex items-center text-blue-700">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">4</div>
              <span className="text-sm">Confirmation sent to you immediately</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;

