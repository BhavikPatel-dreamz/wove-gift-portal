import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Heart, Lock, Shield, Edit, CreditCard } from "lucide-react";
import { goBack, goNext, resetFlow, setCurrentStep, setIsConfirmed } from "../../../redux/giftFlowSlice";
import { addToCart, updateCartItem } from "../../../redux/cartSlice";
import { useSession } from '@/contexts/SessionContext'
import { useRouter } from "next/navigation";
import SecurityIcon from "../../../icons/SecurityIcon"
import HeartColorIcon from "../../../icons/HeartColorIcon"
import EditIcon from "../../../icons/EditIcon"
import { ShoppingBasket } from "lucide-react";
import { currencyList } from "../../brandsPartner/currency";

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
    selectedOccasion,
    isConfirmed
  } = useSelector((state) => state.giftFlowReducer);

  console.log(deliveryMethod, deliveryDetails, selectedTiming);

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
      selectedOccasion
    };

    if (isEditMode && editingIndex !== null) {
      dispatch(updateCartItem({ index: editingIndex, item: cartItem }));
    } else {
      dispatch(addToCart(cartItem));
    }
    router.push('/cart');
  };

  const handleBuyNow = () => { // Renamed from handleProceedToPayment for clarity
    if (!validateGift()) return;

    dispatch(goNext());
  };

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "";

  const formatAmount = (amount) => {
    if (typeof amount === "object" && amount?.value && amount?.currency) {
      return `${getCurrencySymbol(amount.currency)} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const redirectToDeliveryMethod = () => {
    dispatch(setCurrentStep(7));
  }


  return (
    <div className="max-w-7xl m-auto min-h-screen bg-gray-50 px-4 py-30 md:px-4 md:py-30">
      <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 
                       transition-all duration-200 hover:shadow-md"
        >
          <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 group-hover:[&amp;&gt;path]:fill-white"><path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)"></path><defs><linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse"><stop stopColor="#ED457D"></stop><stop offset="1" stopColor="#FA8F42"></stop></linearGradient></defs></svg>
          <span className="text-base font-semibold text-gray-800">
            Previous
          </span>
        </button>
      </div>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-[40px] leading-[45px] font-bold text-[#1A1A1A] text-center font-['Poppins'] mb-3">
            Review Your Beautiful Gift
          </h1>
          <p className="text-[#4A4A4A] text-center font-['Inter'] text-base md:text-lg font-medium leading-[24px]">
            Confirm all details before proceeding to payment
          </p>
        </div>

        {/* Secure Preview Banner */}
        <div className="rounded-[20px] bg-[rgba(217,240,219,0.23)] border border-[#D9F0DB3B] p-5 mb-8 flex items-center justify-center max-w-fit mx-auto">
          <div className="w-15 h-15 flex items-center justify-center mr-4 shrink-0 rounded-[20px] bg-[rgba(57,174,65,0.1)]">
            <SecurityIcon />
          </div>
          <div>
            <h3 className="text-[15px] leading-[20px] font-semibold text-[#1A1A1A] font-['Poppins']">Secure Preview Mode</h3>
            <p className="text-sm font-normal leading-[18px] text-[#4A4A4A] font-['Inter']">
              Gift code protected until payment completion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[313px_1fr] gap-8 text-black">
          {/* Left Column - Gift Card */}
          <div className="">
            {/* Gift Card Visual */}
            <div className="relative max-w-fit mx-auto"> {/* Fixed typo here */}
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

                <button onClick={() => dispatch(setCurrentStep(3))}>
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17.46V20.5C3 20.78 3.22 21 3.5 21H6.54C6.67 21 6.8 20.95 6.89 20.85L17.81 9.94L14.06 6.19L3.15 17.1C3.05 17.2 3 17.32 3 17.46ZM20.71 7.04C20.8027 6.94749 20.8762 6.8376 20.9264 6.71663C20.9766 6.59565 21.0024 6.46597 21.0024 6.335C21.0024 6.20403 20.9766 6.07435 20.9264 5.95338C20.8762 5.83241 20.8027 5.72252 20.71 5.63L18.37 3.29C18.2775 3.1973 18.1676 3.12375 18.0466 3.07357C17.9257 3.02339 17.796 2.99756 17.665 2.99756C17.534 2.99756 17.4043 3.02339 17.2834 3.07357C17.1624 3.12375 17.0525 3.1973 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="url(#paint0_linear_736_2123)" />
                      <defs>
                        <linearGradient id="paint0_linear_736_2123" x1="3" y1="9.6211" x2="20.1362" y2="17.2719" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ED457D" />
                          <stop offset="1" stopColor="#FA8F42" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Secure Gift Code */}
            <div className="rounded-[20px] border-[1.5px] border-dashed border-[#ED457D] bg-[rgba(244,236,217,0.5)] p-6 mt-6 text-center">
              <div className="flex gap-2 items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path d="M13.7891 3.94818V7.61517C13.7891 10.0991 12.7734 11.9047 11.5537 13.1415C10.3919 14.3197 9.06786 14.9571 8.30762 15.1533C7.54728 14.9569 6.22305 14.3194 5.06152 13.1415C3.84194 11.9047 2.82715 10.0989 2.82715 7.61517V3.94818L8.30762 1.51263L13.7891 3.94818Z" stroke="#1A1A1A" strokeWidth="1.5" />
                </svg>
                <h4 className="text-[#1A1A1A] text-[14px] font-semibold leading-[18px] font-poppins">Secure Gift Code</h4>
              </div>

              <div className="bg-white rounded-[10px] border border-[rgba(26,26,26,0.15)] shadow-[0_10px_10px_0_rgba(0,0,0,0.08)] p-2 mb-4">
                •••  •••  •••
              </div>

            </div>
            <div className="flex gap-2 items-center mt-3 mx-auto w-fit">
              <div className="p-2 rounded-[8px] bg-[rgba(57,174,65,0.1)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" fill="none">
                  <path d="M11.1431 5.647V4.706C11.1431 2.11 9.06034 0 6.5 0C3.93966 0 1.85686 2.111 1.85686 4.706V5.647C0.830753 5.647 0 6.49 0 7.529V14.118C0 15.158 0.830753 16 1.85686 16H11.1431C12.1692 16 13 15.157 13 14.118V7.529C13 6.489 12.1683 5.647 11.1431 5.647ZM3.71372 4.706C3.71372 3.149 4.9638 1.882 6.5 1.882C8.0362 1.882 9.28628 3.149 9.28628 4.706V5.647H3.71274L3.71372 4.706ZM7.42843 11.294C7.42843 11.5436 7.33061 11.7829 7.1565 11.9594C6.98239 12.1359 6.74624 12.235 6.5 12.235C6.25377 12.235 6.01762 12.1359 5.8435 11.9594C5.66939 11.7829 5.57157 11.5436 5.57157 11.294V9.412C5.57157 9.16243 5.66939 8.92308 5.8435 8.74661C6.01762 8.57014 6.25377 8.471 6.5 8.471C6.74624 8.471 6.98239 8.57014 7.1565 8.74661C7.33061 8.92308 7.42843 9.16243 7.42843 9.412V11.294Z" fill="#39AE41" />
                </svg>
              </div>

              <span className="text-[#1A1A1A] text-[12px] font-medium leading-[16px] font-poppins">
                Code Revealed after payment completion
              </span>

            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Brand and Amount Card */}

            <div className="bg-white flex flex-col gap-3 rounded-2xl py-4 p-4 border border-gray-200">
              <div>
                <div className="flex items-start gap-2">
                  <div className="text-[#1A1A1A] font-poppins text-[16px] font-semibold leading-[22px]">
                    Delivery Method
                  </div>

                  <div>
                    <button onClick={() => redirectToDeliveryMethod()}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 14.55V17.0833C2.5 17.3166 2.68333 17.5 2.91667 17.5H5.45C5.55833 17.5 5.66667 17.4583 5.74167 17.375L14.8417 8.28329L11.7167 5.15829L2.625 14.25C2.54167 14.3333 2.5 14.4333 2.5 14.55ZM17.2583 5.86663C17.3356 5.78953 17.3969 5.69796 17.4387 5.59715C17.4805 5.49634 17.502 5.38827 17.502 5.27913C17.502 5.16999 17.4805 5.06192 17.4387 4.96111C17.3969 4.8603 17.3356 4.76872 17.2583 4.69163L15.3083 2.74163C15.2312 2.66438 15.1397 2.60309 15.0389 2.56127C14.938 2.51945 14.83 2.49792 14.7208 2.49792C14.6117 2.49792 14.5036 2.51945 14.4028 2.56127C14.302 2.60309 14.2104 2.66438 14.1333 2.74163L12.6083 4.26663L15.7333 7.39163L17.2583 5.86663Z" fill="url(#paint0_linear_3104_3730)" />
                        <defs>
                          <linearGradient id="paint0_linear_3104_3730" x1="2.5" y1="8.01754" x2="16.7802" y2="14.3932" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ED457D" />
                            <stop offset="1" stopColor="#FA8F42" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-[#4A4A4A] font-inter text-[14px] font-normal leading-[24px]">
                  {deliveryMethod}
                </div>
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <div className="text-[#1A1A1A] font-poppins text-[16px] font-semibold leading-[22px]">Recipient WhatsApp Number</div>
                  <div>
                    <button onClick={() => redirectToDeliveryMethod()}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 14.55V17.0833C2.5 17.3166 2.68333 17.5 2.91667 17.5H5.45C5.55833 17.5 5.66667 17.4583 5.74167 17.375L14.8417 8.28329L11.7167 5.15829L2.625 14.25C2.54167 14.3333 2.5 14.4333 2.5 14.55ZM17.2583 5.86663C17.3356 5.78953 17.3969 5.69796 17.4387 5.59715C17.4805 5.49634 17.502 5.38827 17.502 5.27913C17.502 5.16999 17.4805 5.06192 17.4387 4.96111C17.3969 4.8603 17.3356 4.76872 17.2583 4.69163L15.3083 2.74163C15.2312 2.66438 15.1397 2.60309 15.0389 2.56127C14.938 2.51945 14.83 2.49792 14.7208 2.49792C14.6117 2.49792 14.5036 2.51945 14.4028 2.56127C14.302 2.60309 14.2104 2.66438 14.1333 2.74163L12.6083 4.26663L15.7333 7.39163L17.2583 5.86663Z" fill="url(#paint0_linear_3104_3730)" />
                        <defs>
                          <linearGradient id="paint0_linear_3104_3730" x1="2.5" y1="8.01754" x2="16.7802" y2="14.3932" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ED457D" />
                            <stop offset="1" stopColor="#FA8F42" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-[#4A4A4A] font-inter text-[14px] font-normal leading-[24px]">{deliveryMethod == "email" ? deliveryDetails?.recipientEmailAddress : deliveryDetails?.recipientWhatsAppNumber}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl py-4 p-4  border border-gray-200">
              <div className="flex items-start gap-2">
                <div>
                  {selectedBrand?.logo ? (
                    <div className="w-20 h-20 rounded-lg flex items-center justify-center shrink-0 ">
                      <img
                        src={selectedBrand.logo}
                        alt={selectedBrand.brandName || selectedBrand.name}
                        className="w-full h-full object-contain p-2 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-3xl">
                        {(selectedBrand?.brandName || selectedBrand?.name || 'SB')?.substring(0, 1).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleChangeCard}
                    className="mt-4 flex gap-1 items-center max-w-fit  text-pink-500 hover:text-pink-600 text-sm font-medium px-2 py-2 rounded-full transition-colors bg-[#F4F4F4]"
                  >
                    <HeartColorIcon />
                    <span className="text-[#1A1A1A] text-[16px] font-semibold leading-5.5 font-poppins text-center">
                      {formatAmount(selectedAmount)}
                    </span>
                    <EditIcon />
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="text-[#1A1A1A] text-[18px] font-semibold leading-5.5 font-poppins">
                    {selectedBrand?.brandName || selectedBrand?.name || 'Selected Brand'}
                  </h3>
                  <p className="text-[#4A4A4A] text-[14px] font-normal leading-6 font-inter mt-1">
                    {selectedBrand?.description || selectedBrand?.tagline || 'Gift card'}
                  </p>


                </div>
              </div>
              <div></div>
            </div>

            {/* Personal Message */}
            <div className="bg-white rounded-2xl py-4 p-4  border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-[#1A1A1A] text-[16px] font-semibold leading-[22px] font-poppins">
                    Personal Message</h3>
                  <Heart className="w-5 h-5 text-red-500 ml-2 fill-red-500" />
                </div>

              </div>

              <div className="bg-[#F6F6F6] rounded-[10px] p-4 max-h-40 overflow-y-auto">
                <p className="text-[#4A4A4A] text-[14px] font-medium leading-[24px] italic font-inter">
                  "{personalMessage || 'No message added'}"
                </p>
                <div className="flex justify-end">
                  <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
                    <button
                      onClick={handleEditMessage}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-rose-50 
                       transition-all duration-200 hover:shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.5 14.55V17.0834C2.5 17.3167 2.68333 17.5 2.91667 17.5H5.45C5.55833 17.5 5.66667 17.4584 5.74167 17.375L14.8417 8.28336L11.7167 5.15836L2.625 14.25C2.54167 14.3334 2.5 14.4334 2.5 14.55ZM17.2583 5.86669C17.3356 5.78959 17.3969 5.69802 17.4387 5.59721C17.4805 5.4964 17.502 5.38833 17.502 5.27919C17.502 5.17005 17.4805 5.06198 17.4387 4.96117C17.3969 4.86036 17.3356 4.76878 17.2583 4.69169L15.3083 2.74169C15.2312 2.66444 15.1397 2.60315 15.0389 2.56133C14.938 2.51951 14.83 2.49799 14.7208 2.49799C14.6117 2.49799 14.5036 2.51951 14.4028 2.56133C14.302 2.60315 14.2104 2.66444 14.1333 2.74169L12.6083 4.26669L15.7333 7.39169L17.2583 5.86669Z" fill="url(#paint0_linear_3002_2212)" />
                        <defs>
                          <linearGradient id="paint0_linear_3002_2212" x1="2.5" y1="8.0176" x2="16.7802" y2="14.3933" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ED457D" />
                            <stop offset="1" stopColor="#FA8F42" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="ml-1 text-[#1A1A1A] text-[14px] font-semibold font-inter text-center">Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center animate-fadeIn">
                  {error}
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isConfirmed ?? false}
                    onChange={(e) => dispatch(setIsConfirmed(e.target.checked))}
                    className="sr-only"
                  />
                  <div className={`
                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                    ${isConfirmed
                      ? 'bg-gradient-to-r from-pink-500 to-orange-400 border-transparent'
                      : 'bg-white border-gray-300'
                    }
                  `}>
                    {isConfirmed && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 font-inter text-sm font-medium leading-relaxed flex-1">
                    I have reviewed and confirmed all recipient and gift details are correct.
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                {isEditMode ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={!isConfirmed}
                    className={`
                      w-full h-14 bg-white text-pink-500 border-2 border-pink-500 rounded-full 
                      font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2
                      ${isConfirmed
                        ? 'hover:bg-pink-50 hover:shadow-md cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <Edit className="w-5 h-5" />
                    Update Gift in Cart
                  </button>
                ) : (
                  <div className={`p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 inline-block w-full ${isConfirmed
                    ? 'hover:bg-rose-50 hover:shadow-md cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                    }
                      `}>
                    <button
                      onClick={handleAddToCart}
                      disabled={!isConfirmed}
                      className={`
                        w-full h-14 flex items-center justify-center gap-3 px-5 rounded-full 
                        bg-white text-pink-500 font-bold transition-all duration-200
                       
                      `}
                    >
                      Add to Cart
                      <ShoppingBasket className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleBuyNow}
                  disabled={!isConfirmed}
                  className={`
                    w-full h-14 bg-gradient-to-r from-pink-500 to-orange-400 text-white 
                    rounded-full font-semibold text-lg transition-all duration-200 shadow-lg 
                    flex items-center justify-center gap-2
                    ${isConfirmed
                      ? 'hover:shadow-xl cursor-pointer hover:opacity-95'
                      : 'opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  Proceed to Payment
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
                    <path
                      d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ReviewConfirmStep;