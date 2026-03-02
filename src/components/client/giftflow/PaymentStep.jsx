import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { goBack, setCurrentStep } from "../../../redux/giftFlowSlice";
import { createPendingOrder } from "../../../lib/action/orderAction";
import { useSession } from "@/contexts/SessionContext";
import AuthForm from "@/components/AuthForm";

// Import components
import PaymentMethodSelector from "./payment/PaymentMethodSelector";
import GiftDetailsCard from "./payment/GiftDetailsCard";
import PaymentSummary from "./payment/PaymentSummary";
import BulkPaymentSummary from "./payment/BulkPaymentSummary";
import SuccessScreen from "./payment/SuccessScreen";
import ThankYouScreen from "./payment/ThankYouScreen";
import { currencyList } from "../../brandsPartner/currency";

const normalizeBulkDeliveryOption = (value, csvRecipients = []) => {
  const option = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (
    option === "multiple" ||
    option === "csv" ||
    option === "emails" ||
    option === "individual" ||
    option === "individual_emails"
  ) {
    return "multiple";
  }

  if (!option && Array.isArray(csvRecipients) && csvRecipients.length > 0) {
    return "multiple";
  }

  return "email";
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PaymentStep = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const session = useSession();
  const mode = searchParams.get('mode');
  const editBulkIdFromUrl = searchParams.get('editBulkId');
  const editBulkIndexFromUrl = searchParams.get('editBulkIndex');
  const isBulkMode = mode === 'bulk';

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('card');
  const [showThankYou, setShowThankYou] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [checkoutUserId, setCheckoutUserId] = useState(session?.user?.id || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(null);
  const [guestFormData, setGuestFormData] = useState({ fullName: "", email: "" });
  const [guestFormError, setGuestFormError] = useState("");

  // Redux selectors
  const {
    selectedBrand,
    selectedAmount: giftFlowAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
    selectedOccasionName,
    isPaymentConfirmed,
    isEditMode,
    editFlowType,
    editingIndex,
    editingBulkOrderId,
  } = useSelector((state) => state.giftFlowReducer);

  const { bulkItems } = useSelector((state) => state.cart);
  const currentBulkOrderIndex = useMemo(() => {
    if (!isBulkMode || !bulkItems.length) return -1;

    if (editBulkIdFromUrl) {
      const indexByUrlId = bulkItems.findIndex(
        (item) => String(item?.id) === String(editBulkIdFromUrl)
      );
      if (indexByUrlId !== -1) return indexByUrlId;
    }

    if (editBulkIndexFromUrl !== null && editBulkIndexFromUrl !== undefined) {
      const parsedIndex = Number(editBulkIndexFromUrl);
      if (Number.isInteger(parsedIndex) && parsedIndex >= 0 && bulkItems[parsedIndex]) {
        return parsedIndex;
      }
    }

    if (isEditMode && editFlowType === 'bulk') {
      if (editingBulkOrderId !== null && editingBulkOrderId !== undefined) {
        const indexById = bulkItems.findIndex((item) => item?.id === editingBulkOrderId);
        if (indexById !== -1) return indexById;
      }

      if (
        editingIndex !== null &&
        editingIndex !== undefined &&
        bulkItems[editingIndex]
      ) {
        return editingIndex;
      }
    }

    return bulkItems.length - 1;
  }, [
    isBulkMode,
    bulkItems,
    editBulkIdFromUrl,
    editBulkIndexFromUrl,
    isEditMode,
    editFlowType,
    editingBulkOrderId,
    editingIndex
  ]);
  const currentBulkOrder = currentBulkOrderIndex >= 0 ? bulkItems[currentBulkOrderIndex] : null;

  // Derived values
  const selectedAmount = isBulkMode && currentBulkOrder ? currentBulkOrder.selectedAmount : giftFlowAmount;
  const quantity = isBulkMode && currentBulkOrder ? currentBulkOrder.quantity : 1;
  const companyInfo = isBulkMode && currentBulkOrder ? currentBulkOrder.companyInfo : null;
  const bulkDeliveryOption = isBulkMode && currentBulkOrder
    ? normalizeBulkDeliveryOption(currentBulkOrder.deliveryOption, currentBulkOrder.csvRecipients)
    : null;
  const csvRecipients = isBulkMode && currentBulkOrder ? currentBulkOrder.csvRecipients : [];
  const effectiveBulkBrand = isBulkMode && currentBulkOrder
    ? (currentBulkOrder.selectedBrand || selectedBrand)
    : selectedBrand;

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "";

  // Helper functions
  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${getCurrencySymbol(amount.currency)}${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    return Math.round(totalAmount * 0.05);
  };

  const calculateTotal = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    const serviceFee = calculateServiceFee();
    return Number(totalAmount) + Number(serviceFee);
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    setCheckoutUserId(session.user.id);
    setGuestCheckout(null);
    setShowAuthModal(false);
    setShowGuestModal(false);
    setGuestFormError("");
  }, [session?.user?.id]);

  const closeIdentityModals = () => {
    setShowAuthModal(false);
    setShowGuestModal(false);
    setGuestFormError("");
  };

  const openGuestModal = () => {
    setGuestFormData({
      fullName: guestCheckout?.fullName || deliveryDetails?.yourFullName || "",
      email: guestCheckout?.email || deliveryDetails?.yourEmailAddress || "",
    });
    setGuestFormError("");
    setShowAuthModal(false);
    setShowGuestModal(true);
  };

  const handleAuthSuccess = async (user) => {
    const authenticatedId = user?.id || null;
    if (!authenticatedId) {
      toast.error("Authentication succeeded but user identity is missing.");
      return;
    }

    setCheckoutUserId(authenticatedId);
    setGuestCheckout(null);
    closeIdentityModals();
    await handleInitiatePayment({
      userIdOverride: authenticatedId,
      guestCheckoutOverride: null,
    });
  };

  const handleGuestCheckoutSubmit = async (event) => {
    event.preventDefault();
    const fullName = guestFormData.fullName.trim();
    const email = guestFormData.email.trim().toLowerCase();

    if (!fullName) {
      setGuestFormError("Please enter your full name.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setGuestFormError("Please enter a valid email address.");
      return;
    }

    const guestData = { fullName, email };
    setGuestCheckout(guestData);
    closeIdentityModals();
    await handleInitiatePayment({ guestCheckoutOverride: guestData });
  };

  // Initiate payment with direct redirect
  const handleInitiatePayment = async ({
    userIdOverride,
    guestCheckoutOverride,
  } = {}) => {

    if (!isPaymentConfirmed) {
      toast.error('Please confirm that all details are correct');
      return null;
    }

    const resolvedUserId = userIdOverride || checkoutUserId || session?.user?.id || null;
    const resolvedGuestCheckout = resolvedUserId
      ? null
      : (guestCheckoutOverride || guestCheckout);

    if (!resolvedUserId && !resolvedGuestCheckout?.email) {
      setShowAuthModal(true);
      return null;
    }

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Preparing your order...');

    try {
      const guestCompanyInfo = resolvedGuestCheckout
        ? {
          ...companyInfo,
          contactEmail: resolvedGuestCheckout.email,
          companyName: companyInfo?.companyName || resolvedGuestCheckout.fullName,
        }
        : companyInfo;

      const guestDeliveryDetails = resolvedGuestCheckout
        ? {
          ...deliveryDetails,
          yourFullName: resolvedGuestCheckout.fullName,
          yourEmailAddress: resolvedGuestCheckout.email,
        }
        : deliveryDetails;

      const orderData = isBulkMode ? {
        selectedBrand: effectiveBulkBrand,
        selectedAmount,
        personalMessage: currentBulkOrder?.personalMessage || personalMessage,
        quantity,
        companyInfo: guestCompanyInfo,
        deliveryOption: bulkDeliveryOption,
        selectedOccasion: currentBulkOrder?.selectedOccasion || selectedOccasion,
        selectedSubCategory: currentBulkOrder?.selectedSubCategory || selectedSubCategory,
        totalAmount: calculateTotal(),
        isBulkOrder: true,
        totalSpend: currentBulkOrder.totalSpend,
        deliveryMethod: bulkDeliveryOption === "multiple" ? "multiple" : "email",
        csvRecipients,
        userId: resolvedUserId,
        guestCheckout: resolvedGuestCheckout,
        selectedTiming: currentBulkOrder?.selectedTiming || selectedTiming,
      } : {
        selectedBrand,
        selectedAmount,
        personalMessage,
        deliveryMethod,
        deliveryDetails: guestDeliveryDetails,
        selectedOccasion,
        selectedSubCategory,
        selectedTiming,
        totalAmount: calculateTotal(),
        isBulkOrder: false,
        userId: resolvedUserId,
        guestCheckout: resolvedGuestCheckout,
      };

      const result = await createPendingOrder(orderData);

      if (result?.success) {
        setPendingOrderId(result.data.orderId);

        const redirectUrl = result?.data?.payfastUrl;
        if (!redirectUrl) {
          setError("Payment link was not received.");
          toast.error("Failed to get payment link.", { id: toastId });
          setIsProcessing(false);
          return null;
        }

        console.log('✅ PayFast URL received:', redirectUrl);
        toast.loading('Redirecting to PayFast...', { id: toastId });
        setPaymentSubmitted(true);

        // Keep button loading visible until browser leaves this page.
        setTimeout(() => {
          window.location.assign(redirectUrl);
        }, 100);

        return {
          orderId: result.data.orderId
        };
      } else {
        setError(result.error);
        toast.error(result.error, { id: toastId });
        setIsProcessing(false);
        return null;
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError("Failed to prepare order.");
      toast.error('Failed to prepare order.', { id: toastId });
      setIsProcessing(false);
      return null;
    }
  };

  // Check if returning from PayFast
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
      // The new success/cancel pages will handle the status.
      // This component doesn't need to do anything.
    }
  }, []);

  const handleNext = () => {
    setShowThankYou(true);
  };

  const handlePaymentButtonClick = async () => {
    const hasIdentity = checkoutUserId || session?.user?.id || guestCheckout?.email;
    if (!hasIdentity) {
      setShowAuthModal(true);
      return;
    }

    await handleInitiatePayment();
  };

  // Success screen
  if (order) {
    if (showThankYou) {
      return <ThankYouScreen />;
    }

    return (
      <SuccessScreen
        order={order}
        selectedBrand={effectiveBulkBrand}
        quantity={quantity}
        selectedAmount={selectedAmount}
        isBulkMode={isBulkMode}
        onNext={handleNext}
        deliveryDetails={deliveryDetails}
        processingInBackground={order.processingInBackground}
        processingStatus={order.processingStatus}
      />
    );
  }

  // Main payment form
  return (
    <div className="min-h-screen bg-gray-50 py-30 md:px-8 md:py-30">
      <Toaster />

      <div className="max-w-7xl mx-auto sm:px-6">
        {/* Back Button and Bulk Mode Indicator */}
        <div className="relative flex flex-col items-start gap-4 mb-6 md:flex-row md:items-center md:justify-between md:gap-0">
          <button
            className="relative inline-flex items-center justify-center gap-2 
             px-5 py-3 rounded-full font-semibold text-base 
             text-[#4A4A4A] bg-white border border-transparent 
             transition-all duration-300 overflow-hidden 
             group cursor-pointer"
            onClick={() => {
              isBulkMode ? dispatch(setCurrentStep(7)) : dispatch(goBack())
            }}
          >
            {/* Gradient Border */}
            <span className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-r from-[#ED457D] to-[#FA8F42]"></span>

            {/* Background Layer */}
            <span className="absolute inset-[2px] rounded-full bg-white 
                   transition-all duration-300 
                   group-hover:bg-gradient-to-r 
                   group-hover:from-[#ED457D] 
                   group-hover:to-[#FA8F42]"></span>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-2 
                  transition-all duration-300 
                  group-hover:text-white">

              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                <svg
                  width="8"
                  height="9"
                  viewBox="0 0 8 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-all duration-300 group-hover:[&>path]:fill-white"
                >
                  <path
                    d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z"
                    fill="url(#paint0_linear_584_1923)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_584_1923"
                      x1="7.5"
                      y1="3.01721"
                      x2="-9.17006"
                      y2="13.1895"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#ED457D" />
                      <stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>

              Previous
            </div>
          </button>


          {isBulkMode && (
            <div className="flex items-center gap-3 justify-center w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto p-2">
              <div className="md:block w-30 h-px bg-gradient-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />
              <div className="rounded-full p-px bg-gradient-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">Bulk Gifting</span>
                </div>
              </div>
              <div className="md:block w-30 h-px bg-gradient-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
            </div>
          )}

          <div className="md:block w-[140px]" />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mt-6">
            {isBulkMode ? 'Complete your payment securely' : "You're almost there!"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2 max-w-2xl mx-auto">
            {isBulkMode
              ? 'Your vouchers will be generated instantly after payment'
              : "Let's deliver your beautiful gift and make someone's day absolutely wonderful"}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-5 sm:space-y-6">

            <PaymentMethodSelector
              selectedTab={selectedPaymentTab}
              onTabChange={setSelectedPaymentTab}
              isBulkMode={isBulkMode}
            />

            {/* PayFast Payment Button */}
            {selectedPaymentTab === 'payfast' && (
              <button
                onClick={handlePaymentButtonClick}
                disabled={isProcessing || !isPaymentConfirmed}
                className={`
      group w-full
      bg-gradient-to-r from-blue-500 to-blue-600
      text-white py-3 sm:py-4 px-6 rounded-xl
      font-semibold text-sm sm:text-base
      transition-all duration-300
      flex items-center justify-center gap-2
      shadow-lg
      ${(isProcessing || !isPaymentConfirmed)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-blue-600 hover:to-blue-700 hover:shadow-xl cursor-pointer'
                  }
    `}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay with PayFast
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <svg
                        width="8"
                        height="9"
                        viewBox="0 0 8 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                  </>
                )}
              </button>
            )}


            {/* Card Payment Button */}
            {selectedPaymentTab === 'card' && (
              <button
                onClick={handlePaymentButtonClick}
                disabled={isProcessing || !isPaymentConfirmed}
                className={`
      group w-full
      bg-gradient-to-r from-pink-500 to-orange-500
      text-white py-3 sm:py-4 px-6 rounded-xl
      font-semibold text-sm sm:text-base
      transition-all duration-300
      flex items-center justify-center gap-2
      shadow-lg
      ${(isProcessing || !isPaymentConfirmed)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-pink-600 hover:to-orange-600 hover:shadow-xl cursor-pointer'
                  }
    `}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay with Card
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <svg
                        width="8"
                        height="9"
                        viewBox="0 0 8 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                  </>
                )}
              </button>
            )}

            {!checkoutUserId && guestCheckout?.email && (
              <div className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3">
                <p className="text-sm text-pink-700">
                  Paying as guest: <span className="font-semibold">{guestCheckout.email}</span>
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5 sm:space-y-6">
            <GiftDetailsCard {...{
              selectedBrand,
              selectedAmount,
              selectedSubCategory,
              selectedOccasionName,
              personalMessage,
              deliveryMethod,
              deliveryDetails,
              formatAmount,
              isBulkMode,
              quantity,
              companyInfo,
            }} />

            {isBulkMode ? (
              <BulkPaymentSummary
                currentBulkOrder={currentBulkOrder}
                quantity={quantity}
                selectedAmount={selectedAmount}
                calculateServiceFee={calculateServiceFee}
                calculateTotal={calculateTotal}
              />
            ) : (
              <PaymentSummary
                selectedAmount={selectedAmount}
                formatAmount={formatAmount}
                calculateServiceFee={calculateServiceFee}
                calculateTotal={calculateTotal}
                isBulkMode={isBulkMode}
                quantity={quantity}
              />
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 sm:mt-6">
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 sm:gap-4">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm sm:text-base">!</span>
              <div className="flex-1 max-w-full">
                <p className="font-semibold text-red-800 text-sm sm:text-base">Payment Error</p>
                <p className="text-xs sm:text-sm text-red-700 mt-0.5 wrap-break-word">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 p-4 flex items-center justify-center">
          <AuthForm
            type="login"
            mode="modal"
            onClose={closeIdentityModals}
            onAuthSuccess={handleAuthSuccess}
            showGuestOption
            onPayAsGuest={openGuestModal}
            initialEmail={guestCheckout?.email || deliveryDetails?.yourEmailAddress || ""}
            initialName={guestCheckout?.fullName || deliveryDetails?.yourFullName || ""}
          />
        </div>
      )}

      {showGuestModal && (
        <div className="fixed inset-0 z-[80] bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-[#FFF9FA] rounded-3xl shadow-2xl p-8 border border-gray-100 relative">
            <button
              type="button"
              onClick={closeIdentityModals}
              className="absolute top-5 right-5 h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-400 transition flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="text-center mb-7">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Pay as Guest</h2>
              <p className="text-gray-600 text-sm">
                Enter your name and email to continue checkout without creating an account.
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleGuestCheckoutSubmit}>
              <input
                type="text"
                value={guestFormData.fullName}
                onChange={(event) => {
                  setGuestFormData((prev) => ({ ...prev, fullName: event.target.value }));
                  setGuestFormError("");
                }}
                placeholder="Enter full name"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                required
              />
              <input
                type="email"
                value={guestFormData.email}
                onChange={(event) => {
                  setGuestFormData((prev) => ({ ...prev, email: event.target.value }));
                  setGuestFormError("");
                }}
                placeholder="Enter email address"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                required
              />

              {guestFormError && (
                <p className="text-red-600 text-sm">{guestFormError}</p>
              )}

              <button
                type="submit"
                className="group w-full py-3.5 
  bg-linear-to-r from-pink-500 to-orange-500 
  text-white rounded-xl font-semibold 
  shadow-lg hover:shadow-xl 
  hover:from-pink-600 hover:to-orange-600 
  focus:outline-none focus:ring-2 focus:ring-pink-500 
  transition-all flex items-center justify-center gap-2"
              >
                Continue to Payment

                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  <svg
                    width="8"
                    height="9"
                    viewBox="0 0 8 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGuestModal(false);
                  setShowAuthModal(true);
                }}
                className="w-full py-3.5 border-2 border-pink-500 text-pink-500 rounded-full font-semibold hover:bg-pink-50 transition"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;
