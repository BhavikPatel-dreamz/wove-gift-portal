import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Heart, Lock, Shield, Edit, CreditCard } from "lucide-react";
import { goBack, goNext, resetFlow } from "../../../redux/giftFlowSlice";
import { addToCart, updateCartItem } from "../../../redux/cartSlice";
import { useSession } from '@/contexts/SessionContext'
import { useRouter } from "next/navigation";
import SecurityIcon from "../../../icons/SecurityIcon"
import HeartColorIcon from "../../../icons/HeartColorIcon"
import EditIcon from "../../../icons/EditIcon"

const ReviewConfirmStep = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const session = useSession();
  const router = useRouter();

  const {
    selectedBrand,
    selectedAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedTiming,
    selectedSubCategory,
    editingIndex,
    isEditMode,
  } = useSelector((state) => state.giftFlowReducer);

  const validateGift = () => {

    if (!selectedBrand) {
      setError("Please select a brand for your gift card.");
      return false;
    }
    if (!selectedAmount || (typeof selectedAmount === 'object' ? !selectedAmount.value : !selectedAmount)) {
      setError("Please select an amount for your gift card.");
      return false;
    }
    if (!deliveryMethod) {
      setError("Please select a delivery method.");
      return false;
    }
    if (deliveryMethod === 'email' && (!deliveryDetails?.recipientFullName || !deliveryDetails?.recipientEmailAddress)) {
      setError("Please provide the recipient's full name and email for email delivery.");
      return false;
    }
    if (deliveryMethod === 'whatsapp' && (!deliveryDetails?.recipientWhatsAppNumber)) {
      setError("Please provide the recipient's WhatsApp number for WhatsApp delivery.");
      return false;
    }
    setError(''); // Clear error if validation passes
    return true;
  };


  const handleBack = () => {
    dispatch(goBack());
  };

  const handleEditMessage = () => {
    dispatch({ type: "giftFlow/setCurrentStep", payload: 5 });
  };

  const handleChangeCard = () => {
    dispatch({ type: "giftFlow/setCurrentStep", payload: 1 });
  };

  const handleAddToCart = () => {
    if (!validateGift()) return;

    const cartItem = {
      selectedBrand,
      selectedAmount,
      personalMessage,
      deliveryMethod,
      deliveryDetails,
      selectedTiming,
      selectedSubCategory,
    };

    if (isEditMode && editingIndex !== null) {
      dispatch(updateCartItem({ index: editingIndex, item: cartItem }));
    } else {
      dispatch(addToCart(cartItem));
    }
    dispatch(resetFlow());
    router.push('/cart');
  };

  const handleBuyNow = () => { // Renamed from handleProceedToPayment for clarity
    if (!validateGift()) return;

    dispatch(goNext());
  };

  const formatAmount = (amount) => {
    if (typeof amount === "object" && amount?.value && amount?.currency) {
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
    <div className="max-w-[1440px] m-auto min-h-screen bg-gray-50 px-4 py-30 md:px-8 md:py-30">
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
      <div className="max-w-3xl mx-auto">
        {/* Previous Button */}
        {/* <button onClick={() => dispatch(goBack())} className="flex items-center gap-3 px-4 py-3.5 rounded-full border-2 border-rose-400 bg-white hover:bg-rose-50 transition-all duration-200 shadow-sm hover:shadow-md group">
          <ArrowLeft className="w-5 h-5 text-rose-500 group-hover:translate-x-[-2px] transition-transform duration-200" />
          <span className="text-base font-semibold text-gray-800">Previous</span>
        </button> */}


        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[40px] md:text-5xl font-bold text-[#1A1A1A] mb-3">
            Review Your Beautiful Gift
          </h1>
          <p className="text-[#4A4A4A] font-medium text-base md:text-lg">
            Confirm all details before proceeding to payment
          </p>
        </div>

        {/* Secure Preview Banner */}
        <div className="bg-green-50 border border-[#D9F0DB3B] rounded-3xl p-5 mb-8 flex items-center justify-center max-w-fit mx-auto">
          <div className="w-10 h-10 flex items-center justify-center mr-4 shrink-0">
            <SecurityIcon />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">Secure Preview Mode</h3>
            <p className="text-sm text-[#4A4A4A]">
              Gift code protected until payment completion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[313px_1fr] gap-8">
          {/* Left Column - Gift Card */}
          <div className="">
            {/* Gift Card Visual */}
            <div className="">
              <div className="w-[313px] h-[353px] aspect-square rounded-2xl bg-white shadow-md overflow-hidden border border-gray-200">
                {selectedSubCategory?.image ? (
                  <img
                    src={selectedSubCategory.image}
                    alt={selectedSubCategory.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                {/* Dummy Card - Birthday Theme */}
                <div
                  className="w-full h-full bg-linear-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col items-center justify-center p-6 relative overflow-hidden"
                  style={{ display: selectedSubCategory?.image ? 'none' : 'flex' }}
                >
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 text-red-400 opacity-30">
                    <Heart className="w-full h-full fill-red-400" />
                  </div>
                  <div className="absolute bottom-6 right-6 w-6 h-6 text-red-400 opacity-20">
                    <Heart className="w-full h-full fill-red-400" />
                  </div>

                  <div className="text-center space-y-4">
                    {/* Main Text */}
                    <div className="space-y-2">
                      <p className="text-red-500 text-lg font-semibold tracking-widest">HAPPY</p>
                      <h2 className="text-5xl font-bold text-red-500 font-serif">Birthday</h2>
                      <p className="text-red-500 text-lg font-semibold">TO YOU</p>
                    </div>

                    {/* Gift Box Icon */}
                    <div className="flex justify-center py-4">
                      <div className="relative">
                        {/* Box */}
                        <div className="w-24 h-20 bg-red-400 rounded-sm flex items-end justify-center">
                          {/* Ribbon pattern */}
                          <div className="w-full h-full bg-red-300 rounded-sm opacity-40"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #dc2626 0px, #dc2626 2px, transparent 2px, transparent 10px)' }}></div>
                        </div>
                        {/* Bow */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div className="flex gap-2">
                            <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                          </div>
                        </div>
                        {/* Ribbon */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-8 bg-teal-500 -top-2"></div>
                      </div>
                    </div>

                    {/* Decorative dots */}
                    <div className="flex gap-1 justify-center pt-2">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Gift Code */}
            <div className=" border-2 border-dashed border-pink-300 rounded-3xl p-6 mt-6 text-center bg-white">
              <div className="flex items-center justify-center mb-4">
                <Heart className="w-5 h-5 text-red-500 mr-2 fill-red-500" />
                <h4 className="font-semibold text-gray-800">Secure Gift Code</h4>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-gray-400 tracking-wider text-lg">
                •••  •••  •••
              </div>

              <div className="flex items-center justify-center text-xs text-gray-600">
                <Lock className="w-4 h-4 mr-2" />
                Code Revealed after payment completion
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Brand and Amount Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div>
                  <div className="w-20 h-20 bg-linear-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                    {selectedBrand?.logo ? (
                      <img
                        src={selectedBrand.logo}
                        alt={selectedBrand.brandName || selectedBrand.name}
                        className="w-full h-full object-contain p-2 rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {(selectedBrand?.brandName || selectedBrand?.name || 'SB')?.substring(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleChangeCard}
                    className="mt-4 flex gap-2 items-center text-pink-500 hover:text-pink-600 text-sm font-medium px-3 py-1.5 rounded-full transition-colors bg-[#F4F4F4]"
                  >
                    <HeartColorIcon />
                    <span className="font-bold text-[#1A1A1A] text-[16px]">
                      {formatAmount(selectedAmount)}
                    </span>
                    <EditIcon />
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-[18px] text-[#1A1A1A]">
                    {selectedBrand?.brandName || selectedBrand?.name || 'Selected Brand'}
                  </h3>
                  <p className="text-[#4A4A4A] text-sm mt-1">
                    {selectedBrand?.description || selectedBrand?.tagline || 'Gift card'}
                  </p>


                </div>
              </div>
            </div>

            {/* Personal Message */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-900">Personal Message</h3>
                  <Heart className="w-5 h-5 text-red-500 ml-2 fill-red-500" />
                </div>

              </div>

              <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  "{personalMessage || 'No message added'}"
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleEditMessage}
                  className="flex items-center text-pink-500 hover:text-pink-600 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  <EditIcon />
                </button>
              </div>
            </div>

            {/* Delivery Details */}
            {/* <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery Details</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Method:</span>
                  <span className="text-gray-900 font-semibold">{getDeliveryMethodDisplay()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Recipient:</span>
                  <span className="text-gray-900 font-semibold">{getRecipientInfo()}</span>
                </div>
                {selectedTiming && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Timing:</span>
                    <span className="text-gray-900 font-semibold">
                      {getTimingDisplay()}
                    </span>
                  </div>
                )}
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
                  {error}
                </div>
              )}
              <div>
                {/* {isEditMode ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white hover:bg-gray-100 text-pink-500 border-2 border-pink-500 py-3 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Update Gift in Cart
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white hover:bg-gray-100 text-pink-500 border-2 border-pink-500 py-3 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Add Another Gift
                  </button>
                )} */}
                {/* <p className="text-center text-xs text-gray-500 mt-2">Use this to add more gifts to your cart.</p> */}
              </div>
              <div>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[linear-gradient(114.06deg,rgba(237,69,125,1)_11.36%,rgba(250,143,66,1)_90.28%)] text-white py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                  <span className="text-xl"><svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                  </svg>
                  </span>
                </button>
                {/* <p className="text-center text-xs text-gray-500 mt-2">Use this to checkout with the current gift.</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewConfirmStep;