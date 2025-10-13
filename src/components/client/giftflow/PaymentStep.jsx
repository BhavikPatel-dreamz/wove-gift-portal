import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Shield, Check, CreditCard, Smartphone, Wallet, Building, Gift, Lock, Star } from "lucide-react";
import { goBack, setSelectedPaymentMethod } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";
import { createOrder } from "../../../lib/action/orderAction";
import toast, { Toaster } from 'react-hot-toast';
import { MessageCircle } from "lucide-react";

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

  console.log("data", data);


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
      if (result?.success) {
        setOrder(result?.data?.order);
        toast.success('Order placed successfully!', { id: toastId });
      } else {
        setError(result.error);
        toast.error(result.error, { id: toastId });
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Previous</span>
          </button>

          <h1 className="text-4xl font-bold text-gray-900">You're almost there!</h1>
          <p className="text-gray-600 mt-2">Let's deliver your beautiful gift and make someone's day absolutely wonderful</p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-pink-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Choose Your Payment Method</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Select how you'd like to complete this transaction</p>

              {/* Security Notice */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start">
                <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">Your payment is 100% secure and encrypted</span>
              </div>

              {/* Payment Methods Grid */}
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                        <method.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm">{method.name}</h4>
                        <p className="text-xs text-gray-600 truncate">{method.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 ${selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                        }`}>
                        {selectedPaymentMethod === method.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gift Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Gift className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Your Beautiful Gift</h3>
                <span className="ml-auto text-2xl">🎁</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Ready to make someone smile</p>

              {/* Gift Card */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                    {selectedBrand?.logo ? (
                      <img
                        src={selectedBrand.logo}
                        alt={selectedBrand.brandName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {(selectedBrand?.brandName || 'SB')?.substring(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-5">
                    <div>
                      <h4 className="font-bold text-gray-900">{selectedBrand?.brandName || 'Gift Card'}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{formatAmount(selectedAmount)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                        {selectedSubCategory?.image ? (
                          <img
                            src={selectedSubCategory?.image}
                            alt={selectedSubCategory.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {(selectedSubCategory?.name || 'SB')?.substring(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{selectedSubCategory?.name || 'Gift Card'}</h4>
                        <p className=" text-gray-900">{selectedSubCategory?.name || 'Gift Card'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed">
                  "{personalMessage}"
                </p>
              </div>

              {/* Delivery Info */}
              <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">
                  <span className="font-semibold">Delivering via WhatsApp</span> to Friend
                </span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Payment summary</h3>

              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gift Card Value</span>
                  <span className="font-semibold text-gray-900">{formatAmount(selectedAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-semibold text-gray-900">{selectedAmount?.currency}{calculateServiceFee()}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-2xl font-bold text-gray-900">{selectedAmount?.currency}{calculateTotal()}</span>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || isProcessing}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Complete Secure Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;

