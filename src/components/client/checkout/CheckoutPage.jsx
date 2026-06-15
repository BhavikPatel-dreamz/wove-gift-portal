'use client';

import React, { useState, useEffect, useMemo } from 'react';
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from 'react-hot-toast';
import { createPendingOrder, getOrderStatus } from '../../../lib/action/orderAction';
import { AlertCircle, BadgePercent, Gift, Mail, Package, Shield, ShoppingBag, Users, WalletCards, X } from 'lucide-react';
import Header from '../../../components/client/home/Header';
import { useSession } from '@/contexts/SessionContext';
import AuthForm from '@/components/AuthForm';
import CheckoutIdentityChoiceModal from './CheckoutIdentityChoiceModal';
import { validatePromoCodeForCheckout } from '../../../lib/action/promoCodeAction';
import { calculateCheckoutTotals } from '../../../lib/promo/promoPricing';
// import StripeCardPayment from "../giftflow/payment/StripeCardPayment";
import ThankYouScreen from "../giftflow/payment/ThankYouScreen";
import SuccessScreen from "../giftflow/payment/SuccessScreen";
import { currencyList } from '../../brandsPartner/currency';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, clearBulkCart, clearCartAsync } from '@/redux/cartSlice';
import { resetFlow, setIsPaymentConfirmed } from '../../../redux/giftFlowSlice';

// ✅ STRIPE CODE COMMENTED OUT
// if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
//   throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
// }
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeBulkDeliveryOption = (value, csvRecipients = []) => {
  const option = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (
    option === 'multiple' ||
    option === 'csv' ||
    option === 'emails' ||
    option === 'individual' ||
    option === 'individual_emails'
  ) {
    return 'multiple';
  }

  if (!option && Array.isArray(csvRecipients) && csvRecipients.length > 0) {
    return 'multiple';
  }

  return 'email';
};

const getBrandDisplayName = (brand) =>
  brand?.brandName || brand?.name || 'Gift card';

const getCurrencySymbol = (code) =>
  currencyList.find((currency) => currency.code === code)?.symbol || 'R';

const formatCurrencyValue = (
  amount,
  currencyCode = 'ZAR',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
) => {
  const numericAmount = Number(amount || 0);

  return `${getCurrencySymbol(currencyCode)} ${new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount)}`;
};

const SummaryItemCard = ({ item }) => (
  <div className="rounded-[18px] border border-[#EFEFF4] bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
    <div className="flex items-start gap-2.5">
      {item.brandLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.brandLogo}
          alt={item.brandName}
          className="h-10 w-10 shrink-0 rounded-lg border border-[#F1F1F4] bg-white object-contain p-1"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#111827] text-[10px] font-semibold text-white">
          {item.brandName.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-4 text-[#1A1A1A]">{item.brandName}</p>
            <p className="mt-0.5 truncate text-[11px] leading-4 text-[#7E7E8A]">{item.kindLabel}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none ${item.badgeClass}`}>
            {item.badgeText}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#FBFBFD] px-2.5 py-1.5 text-[12px] text-[#4A4A4A]">
            {item.kind === 'bulk' ? (
              <Package className="h-3.5 w-3.5 shrink-0 text-[#ED457D]" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-[#ED457D]" />
            )}
            <span className="truncate">{item.amountLabel}</span>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#FBFBFD] px-2.5 py-1.5 text-[12px] text-[#4A4A4A]">
            {item.kind === 'bulk' ? (
              <Users className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
            ) : (
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
            )}
            <span className="truncate">{item.secondaryLabel}</span>
          </div>
        </div>

        {item.deliveryHelper ? (
          <p className="mt-1.5 truncate text-[11px] leading-4 text-[#7E7E8A]">{item.deliveryHelper}</p>
        ) : null}

        {item.note ? (
          <p className="mt-1.5 truncate rounded-lg bg-[#FFF8EF] px-2.5 py-1.5 text-[11px] italic leading-4 text-[#5F5F69]">
            &quot;{item.note}&quot;
          </p>
        ) : null}

        <div className="mt-2 flex items-center justify-between border-t border-[#ECECF2] pt-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A3A3AF]">
            Total
          </span>
          <span className="text-[13px] font-semibold text-[#1A1A1A]">{item.totalLabel}</span>
        </div>
      </div>
    </div>
  </div>
);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const session = useSession();

  // Get cart items from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const bulkItems = useSelector((state) => state.cart.bulkItems);
  const {
    isPaymentConfirmed,
  } = useSelector((state) => state.giftFlowReducer);
  const requiresLoginForBulkCheckout = bulkItems.length > 0;

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('payfast');
  const [showThankYou, setShowThankYou] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);
  const processingStatus = null;
  const [checkoutUserId, setCheckoutUserId] = useState(session?.user?.id || null);
  const [showIdentityChoiceModal, setShowIdentityChoiceModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(null);
  const [guestFormData, setGuestFormData] = useState({ fullName: "", email: "" });
  const [guestFormError, setGuestFormError] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccessMessage, setPromoSuccessMessage] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Track individual order processing
  const [orderStatuses, setOrderStatuses] = useState({});

  const clearCarts = () => {
    if (session?.user?.id) {
      if (bulkItems.length > 0) {
        dispatch(clearCartAsync({ userId: session.user.id, type: 'bulk' }));
      }
      if (cartItems.length > 0) {
        dispatch(clearCartAsync({ userId: session.user.id, type: 'regular' }));
      }
      return;
    }

    if (bulkItems.length > 0) dispatch(clearBulkCart());
    if (cartItems.length > 0) dispatch(clearCart());
  };

  const getAmountValue = (amount) => {
    if (typeof amount === 'object' && amount?.value) {
      return Number(amount.value) || 0;
    }
    return Number(amount) || 0;
  };

  const combinedSubtotal = useMemo(() => {
    const regularSubtotal = cartItems.reduce((total, item) => {
      return total + getAmountValue(item.selectedAmount);
    }, 0);

    const bulkSubtotal = bulkItems.reduce((total, item) => {
      const value = getAmountValue(item.selectedAmount);
      return total + (value * item.quantity);
    }, 0);

    return regularSubtotal + bulkSubtotal;
  }, [cartItems, bulkItems]);

  const checkoutCurrency = useMemo(() => {
    if (cartItems.length > 0) {
      const firstAmount = cartItems[0].selectedAmount;
      if (typeof firstAmount === 'object' && firstAmount?.currency) {
        return firstAmount.currency;
      }
    }

    if (bulkItems.length > 0) {
      const firstAmount = bulkItems[0].selectedAmount;
      if (typeof firstAmount === 'object' && firstAmount?.currency) {
        return firstAmount.currency;
      }
    }

    return 'ZAR';
  }, [cartItems, bulkItems]);

  const checkoutPricing = useMemo(
    () => calculateCheckoutTotals(combinedSubtotal, appliedPromo),
    [appliedPromo, combinedSubtotal],
  );

  const totalItemCount = cartItems.length + bulkItems.length;
  const totalVoucherCount = useMemo(
    () => cartItems.length + bulkItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [cartItems.length, bulkItems],
  );
  const checkoutModeLabel = bulkItems.length > 0 && cartItems.length > 0
    ? 'Mixed checkout'
    : bulkItems.length > 0
      ? 'Bulk checkout'
      : 'Gift checkout';
  const subtotalLabel = formatCurrencyValue(checkoutPricing.subtotal, checkoutCurrency);
  const totalAmountLabel = formatCurrencyValue(checkoutPricing.totalAmount, checkoutCurrency);
  const paymentButtonLabel = checkoutPricing.totalAmount === 0
    ? 'Complete checkout'
    : 'Pay with PayFast';
  const summaryItems = useMemo(
    () => [
      ...cartItems.map((item, index) => {
        const amountValue = getAmountValue(item.selectedAmount);
        const currency = item.selectedAmount?.currency || checkoutCurrency;

        return {
          key: `regular-${index}`,
          kind: 'regular',
          brandName: getBrandDisplayName(item.selectedBrand),
          brandLogo: item.selectedBrand?.logo || null,
          kindLabel: 'Single gift voucher',
          badgeText: 'Gift',
          badgeClass: 'bg-[#FFF3F7] text-[#ED457D]',
          amountLabel: formatCurrencyValue(
            amountValue,
            currency,
            Number.isInteger(amountValue) ? 0 : 2,
            2,
          ),
          secondaryLabel:
            item.deliveryMethod === 'whatsapp'
              ? 'WhatsApp delivery'
              : item.deliveryMethod === 'print'
                ? 'Printable gift'
                : 'Email delivery',
          deliveryHelper:
            item.deliveryMethod === 'email'
              ? item.deliveryDetails?.recipientEmailAddress ||
                item.deliveryDetails?.yourEmailAddress ||
                'Sent by email'
              : item.deliveryMethod === 'whatsapp'
                ? 'Shared manually with your recipient'
                : 'Downloadable and ready to print',
          note: item.personalMessage || '',
          totalLabel: formatCurrencyValue(amountValue, currency),
        };
      }),
      ...bulkItems.map((item, index) => {
        const amountValue = getAmountValue(item.selectedAmount);
        const currency = item.selectedAmount?.currency || checkoutCurrency;
        const quantity = Number(item.quantity) || 0;
        const deliveryOption = normalizeBulkDeliveryOption(item.deliveryOption, item.csvRecipients);
        const recipientCount = item.csvRecipients?.length || quantity;

        return {
          key: `bulk-${index}`,
          kind: 'bulk',
          brandName: getBrandDisplayName(item.selectedBrand),
          brandLogo: item.selectedBrand?.logo || null,
          kindLabel: `${quantity} voucher${quantity === 1 ? '' : 's'} in this bulk order`,
          badgeText: 'Bulk',
          badgeClass: 'bg-[#EEF5FF] text-[#2563EB]',
          amountLabel: `${formatCurrencyValue(
            amountValue,
            currency,
            Number.isInteger(amountValue) ? 0 : 2,
            2,
          )} x ${quantity}`,
          secondaryLabel:
            deliveryOption === 'multiple'
              ? `${recipientCount} recipient${recipientCount === 1 ? '' : 's'}`
              : 'Send to my email',
          deliveryHelper:
            deliveryOption === 'multiple'
              ? 'Individual delivery from your uploaded list'
              : item.companyInfo?.contactEmail || 'Voucher codes will be sent to your contact email',
          note: item.personalMessage || '',
          totalLabel: formatCurrencyValue(amountValue * quantity, currency),
        };
      }),
    ],
    [bulkItems, cartItems, checkoutCurrency],
  );

  useEffect(() => {
    if (!session?.user?.id) return;
    setCheckoutUserId(session.user.id);
    setGuestCheckout(null);
    setShowIdentityChoiceModal(false);
    setShowAuthModal(false);
    setShowGuestModal(false);
    setGuestFormError("");
  }, [session?.user?.id]);

  useEffect(() => {
    if (
      appliedPromo &&
      (appliedPromo.subtotal !== combinedSubtotal ||
        appliedPromo.currency !== checkoutCurrency)
    ) {
      setAppliedPromo(null);
      setPromoSuccessMessage("");
      setPromoError("");
    }
  }, [appliedPromo, combinedSubtotal, checkoutCurrency]);

  const closeIdentityModals = () => {
    setShowIdentityChoiceModal(false);
    setShowAuthModal(false);
    setShowGuestModal(false);
    setGuestFormError("");
  };

  const openIdentityChoiceModal = () => {
    setAuthMode('login');
    setShowAuthModal(false);
    setShowGuestModal(false);
    setShowIdentityChoiceModal(true);
    setGuestFormError("");
  };

  const openAuthModal = (nextMode = 'login') => {
    setAuthMode(nextMode);
    setShowIdentityChoiceModal(false);
    setShowGuestModal(false);
    setShowAuthModal(true);
    setGuestFormError("");
  };

  const openGuestModal = () => {
    if (requiresLoginForBulkCheckout) {
      toast.error("Bulk orders require login before payment.");
      openAuthModal('login');
      return;
    }

    const firstRegularDeliveryDetails = cartItems[0]?.deliveryDetails || {};
    const firstBulkCompanyInfo = bulkItems[0]?.companyInfo || {};

    setGuestFormData({
      fullName:
        guestCheckout?.fullName ||
        firstRegularDeliveryDetails?.yourFullName ||
        firstBulkCompanyInfo?.companyName ||
        "",
      email:
        guestCheckout?.email ||
        firstRegularDeliveryDetails?.yourEmailAddress ||
        firstBulkCompanyInfo?.contactEmail ||
        "",
    });
    setGuestFormError("");
    setShowIdentityChoiceModal(false);
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

    if (requiresLoginForBulkCheckout) {
      toast.error("Bulk orders require login before payment.");
      setShowGuestModal(false);
      setShowAuthModal(true);
      return;
    }

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

  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim();
    if (!code) {
      setPromoError("Please enter a promo code.");
      setPromoSuccessMessage("");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");
    setPromoSuccessMessage("");

    try {
      const result = await validatePromoCodeForCheckout({
        code,
        subtotal: combinedSubtotal,
        currency: checkoutCurrency,
      });

      if (!result?.success) {
        setAppliedPromo(null);
        setPromoError(result?.error || "Failed to apply promo code.");
        return;
      }

      setAppliedPromo(result.data);
      setPromoCodeInput(result.data.code);
      setPromoSuccessMessage(result.data.message || "Promo code applied successfully.");
      setPromoError("");
      toast.success(result.data.message || "Promo code applied.");
    } catch (error) {
      setAppliedPromo(null);
      setPromoSuccessMessage("");
      setPromoError(error?.message || "Failed to apply promo code.");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoError("");
    setPromoSuccessMessage("");
  };

  // Create separate pending orders for ALL cart items
  const handleInitiatePayment = async ({
    userIdOverride,
    guestCheckoutOverride,
  } = {}) => {
    const resolvedUserId = userIdOverride || checkoutUserId || session?.user?.id || null;
    const resolvedGuestCheckout = resolvedUserId
      ? null
      : (guestCheckoutOverride || guestCheckout);

    if (requiresLoginForBulkCheckout && !resolvedUserId) {
      toast.error("Please login first to process bulk orders.");
      openIdentityChoiceModal();
      return null;
    }

    if (!resolvedUserId && !resolvedGuestCheckout?.email) {
      openIdentityChoiceModal();
      return null;
    }

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Preparing your orders...');

    try {
      const allCartOrders = [
        ...bulkItems.map((item) => {
          const baseCompanyInfo = item.companyInfo || {};
          const companyInfo = resolvedGuestCheckout
            ? {
              ...baseCompanyInfo,
              contactEmail: baseCompanyInfo.contactEmail || resolvedGuestCheckout.email,
              companyName: baseCompanyInfo.companyName || resolvedGuestCheckout.fullName,
            }
            : baseCompanyInfo;

          return {
            selectedBrand: item.selectedBrand,
            selectedAmount: item.selectedAmount,
            personalMessage: item.personalMessage,
            quantity: item.quantity,
            companyInfo,
            deliveryOption: item.deliveryOption,
            selectedOccasion: item.selectedOccasion,
            selectedSubCategory: item.selectedSubCategory,
            totalAmount: getAmountValue(item.selectedAmount) * item.quantity,
            isBulkOrder: true,
            totalSpend: item.totalSpend,
            deliveryMethod: item.deliveryOption,
            csvRecipients: item.csvRecipients || [],
            userId: resolvedUserId,
            selectedTiming: item.selectedTiming,
          };
        }),
        ...cartItems.map((item) => {
          const baseDeliveryDetails = item.deliveryDetails || {};
          const deliveryDetails = resolvedGuestCheckout
            ? {
              ...baseDeliveryDetails,
              yourEmailAddress: baseDeliveryDetails.yourEmailAddress || resolvedGuestCheckout.email,
              yourFullName: baseDeliveryDetails.yourFullName || resolvedGuestCheckout.fullName,
            }
            : baseDeliveryDetails;

          return {
            selectedBrand: item.selectedBrand,
            selectedAmount: item.selectedAmount,
            personalMessage: item.personalMessage,
            deliveryMethod: item.deliveryMethod,
            deliveryDetails,
            selectedOccasion: item.selectedOccasion,
            selectedSubCategory: item.selectedSubCategory,
            selectedTiming: item.selectedTiming,
            totalAmount: getAmountValue(item.selectedAmount),
            isBulkOrder: false,
            userId: resolvedUserId,
          };
        }),
      ];

      // ✅ Send as multi-cart order
      const result = await createPendingOrder({
        isMultiCart: true,
        cartOrders: allCartOrders,
        appliedPromoCode: appliedPromo?.code || null,
        userId: resolvedUserId,
        guestCheckout: resolvedGuestCheckout,
      });

      if (!result.success) {
        throw new Error(`Failed to create orders: ${result.error}`);
      }

      setPendingOrderIds(result.data.orderIds);
      if (result?.data?.skipGateway && result?.data?.successUrl) {
        toast.success("Promo applied. Completing your free checkout...", { id: toastId });
        setPaymentSubmitted(true);
        setTimeout(() => {
          window.location.assign(result.data.successUrl);
        }, 100);
        return {
          orderIds: result.data.orderIds,
          successUrl: result.data.successUrl,
        };
      }

      const redirectUrl = result?.data?.payfastUrl;
      if (!redirectUrl) {
        setError("Payment link was not received.");
        toast.error("Failed to get payment link.", { id: toastId });
        setIsProcessing(false);
        return null;
      }

      toast.loading('Redirecting to PayFast...', { id: toastId });

      // Keep button/loading state visible until browser leaves this page.
      setTimeout(() => {
        window.location.assign(redirectUrl);
      }, 100);

      return {
        orderIds: result.data.orderIds,
        payfastUrl: redirectUrl,
      };

    } catch (error) {
      console.error('Error creating orders:', error);
      setError(error.message || "Failed to prepare orders.");
      toast.error(error.message || 'Failed to prepare orders.', { id: toastId });
      setIsProcessing(false);
      return null;
    }
  };

  const handlePaymentButtonClick = async () => {
    const resolvedUserId = checkoutUserId || session?.user?.id || null;

    if (requiresLoginForBulkCheckout && !resolvedUserId) {
      openIdentityChoiceModal();
      return;
    }

    const hasIdentity = resolvedUserId || guestCheckout?.email;
    if (!hasIdentity) {
      openIdentityChoiceModal();
      return;
    }

    await handleInitiatePayment();
  };

  console.log("cartItems", cartItems, bulkItems);

  // Preserved for the payment-return flow that may reuse order polling.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pollAllOrders = async (orderIds, attempts = 0) => {
    const maxAttempts = 20;
    const pollInterval = 2000;

    try {
      console.log(`🔍 Polling ${orderIds.length} orders - Attempt ${attempts + 1}/${maxAttempts}`);

      const statusPromises = orderIds.map(orderId =>
        getOrderStatus(orderId).catch(err => ({
          success: false,
          error: err.message,
          orderId
        }))
      );

      const responses = await Promise.all(statusPromises);

      const updatedStatuses = { ...orderStatuses };
      let allCompleted = true;
      let anyFailed = false;
      let anyInProgress = false;

      responses.forEach((response, idx) => {
        const orderId = orderIds[idx];
        const paymentStatus = response?.paymentStatus || response?.order?.paymentStatus;
        const processingStatus = response?.processingStatus;

        updatedStatuses[orderId] = {
          ...updatedStatuses[orderId],
          paymentStatus,
          processingStatus,
          order: response?.order || response
        };

        if (paymentStatus !== 'COMPLETED') {
          allCompleted = false;
        }

        if (paymentStatus === 'COMPLETED' && processingStatus === 'IN_PROGRESS') {
          anyInProgress = true;
        }

        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          anyFailed = true;
        }
      });

      setOrderStatuses(updatedStatuses);

      // ✅ Show order as soon as payment is confirmed - like PaymentStep
      const confirmedOrders = responses.filter(r => {
        const paymentStatus = r?.paymentStatus || r?.order?.paymentStatus;
        return paymentStatus === 'COMPLETED';
      });

      if (confirmedOrders.length > 0 && !order) {
        const firstOrderData = confirmedOrders[0]?.order || confirmedOrders[0];

        // Set single order like PaymentStep
        setOrder({
          ...firstOrderData,
          processingInBackground: anyInProgress,
          processingStatus: confirmedOrders[0]?.processingStatus || 'IN_PROGRESS',
          allOrders: responses.map(r => r?.order || r),
          totalOrderCount: orderIds.length
        });
        setIsProcessing(false);
        dispatch(resetFlow());

        if (anyInProgress) {
          toast.success(
            orderIds.length === 1
              ? 'Order confirmed! Gift card is being generated...'
              : `${confirmedOrders.length} order(s) confirmed! Gift cards are being generated...`,
            { duration: 5000 }
          );
        } else {
          toast.success('All orders completed successfully!', { duration: 3000 });
        }

        clearCarts();
        return;
      }

      // ✅ All processing completed
      if (allCompleted && !anyInProgress && order) {
        const firstOrderData = responses[0]?.order || responses[0];

        setOrder({
          ...firstOrderData,
          processingInBackground: false,
          processingStatus: 'COMPLETED',
          allOrders: responses.map(r => r?.order || r),
          totalOrderCount: orderIds.length
        });
        setIsProcessing(false);

        toast.success('All orders completed successfully!', { duration: 3000 });

        clearCarts();
        return;
      }

      if (anyFailed) {
        setError('Some orders failed. Please contact support.');
        toast.error('Some orders failed');
        setIsProcessing(false);
        return;
      }

      // Continue polling
      if (attempts < maxAttempts) {
        setTimeout(() => pollAllOrders(orderIds, attempts + 1), pollInterval);
      } else {
        // Max attempts reached - show success anyway
        toast.success(
          'Payment confirmed! Your orders are being processed. Check your email for updates.',
          { duration: 6000 }
        );

        const firstOrderData = responses.filter(r => r?.order)[0]?.order || responses[0];

        if (firstOrderData) {
          setOrder({
            ...firstOrderData,
            processingInBackground: true,
            processingStatus: 'IN_PROGRESS',
            allOrders: responses.map(r => r?.order || r),
            totalOrderCount: orderIds.length
          });
        }
        setIsProcessing(false);

        clearCarts();
      }
    } catch (error) {
      console.error('Error polling orders:', error);
      if (attempts < maxAttempts) {
        setTimeout(() => pollAllOrders(orderIds, attempts + 1), pollInterval);
      } else {
        setError('Could not verify all orders. Check your email for confirmation.');
        toast.error('Failed to confirm all orders');
        setIsProcessing(false);
      }
    }
  };

  const handleNext = () => {
    setShowThankYou(true);
  };

  // ✅ Success screen - using SuccessScreen component like PaymentStep
  if (order) {
    if (showThankYou) {
      return (
        <div>
          <Header />
          <ThankYouScreen />
        </div>
      );
    }

    // Calculate quantity for display (sum of all orders or single order)
    const displayQuantity = order.totalOrderCount || 1;
    const isBulkMode = order.totalOrderCount > 1 || (order.quantity && order.quantity > 1);

    return (
      <SuccessScreen
        order={order}
        selectedBrand={order.brand || cartItems[0]?.selectedBrand || bulkItems[0]?.selectedBrand}
        quantity={displayQuantity}
        selectedAmount={order.selectedAmount || order.amount}
        isBulkMode={isBulkMode}
        onNext={handleNext}
        deliveryDetails={order.deliveryDetails}
        processingInBackground={order.processingInBackground}
        processingStatus={order.processingStatus}
      />
    );
  }

  // ✅ Simple loading screen - EXACTLY like PaymentStep
  if (paymentSubmitted) {
    const totalOrders = pendingOrderIds.length;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Header />
        <div className="max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {processingStatus === 'PAYMENT_CONFIRMED' ? 'Payment Received!' : 'Processing Your Order...'}
          </h1>
          <p className="text-gray-600">
            {processingStatus === 'PAYMENT_CONFIRMED'
              ? "We've received your payment and are now preparing your orders."
              : "Confirming your orders and generating gift cards..."}
          </p>
          {pendingOrderIds.length > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              {totalOrders === 1
                ? `Order ID: ${pendingOrderIds[0].slice(0, 8)}`
                : `${totalOrders} Orders`}
            </p>
          )}
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              {totalOrders > 1
                ? `Processing ${totalOrders} orders...`
                : 'Preparing your gift card...'}
            </p>
          </div>

          {/* Progress indicator for multiple orders */}
          {totalOrders > 1 && (
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: '40%' }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main payment form
  const backButton = (
    <button
      className="group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent bg-white px-5 py-3 text-base font-semibold text-[#4A4A4A] transition-all duration-300"
      onClick={() => window.history.back()}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ED457D] to-[#FA8F42] p-[1.5px]"></span>
      <span className="absolute inset-[1.5px] rounded-full bg-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]"></span>
      <span className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
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
              fill="url(#checkoutBackButton)"
            />
            <defs>
              <linearGradient
                id="checkoutBackButton"
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
      </span>
    </button>
  );

  return (
    <div className={`min-h-screen bg-[linear-gradient(180deg,#F8F8FC_0%,#FDF2F5_100%)] px-4 pt-20 pb-8 sm:py-24 md:px-8 md:py-30 ${totalItemCount > 0 ? 'pb-44 sm:pb-44 md:pb-44 lg:pb-30' : ''}`}>
      <Header />
      <Toaster />
      <div className="mx-auto max-w-6xl">
        <div className="relative mb-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          {backButton}

          <div className="flex w-full items-center justify-center gap-3 p-2 md:absolute md:left-1/2 md:w-auto md:-translate-x-1/2">
            <div className="hidden h-px w-24 bg-gradient-to-r from-transparent via-[#FA8F42] to-[#ED457D] md:block" />
            <div className="rounded-full bg-gradient-to-r from-[#ED457D] to-[#FA8F42] p-px">
              <div className="rounded-full bg-white px-4 py-1.5">
                <span className="whitespace-nowrap text-sm font-semibold text-gray-700">{checkoutModeLabel}</span>
              </div>
            </div>
            <div className="hidden h-px w-24 bg-gradient-to-l from-transparent via-[#ED457D] to-[#FA8F42] md:block" />
          </div>

          <div className="hidden w-[140px] md:block" />
        </div>

        <div className="mb-6 text-center sm:mb-12">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#1A1A1A] sm:text-4xl">
            You&apos;re almost there!
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#666674] sm:text-base">
            Review every gift in your cart, confirm the details, and pay in one step.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8">
          <div className="rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_18px_60px_rgba(237,69,125,0.08)] sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#FEF8F6_0%,#FDF7F8_100%)]">
                <WalletCards className="h-5 w-5 text-[#ED457D]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Choose payment method</h2>
                <p className="text-sm text-[#7E7E8A]">Select how to complete this checkout</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#ECFAEF] px-4 py-3 text-sm font-semibold text-[#219653]">
              <Shield className="h-4 w-4" />
              100% secure and encrypted
            </div>

            <button
              type="button"
              onClick={() => setSelectedPaymentTab('payfast')}
              className={`mb-4 flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                selectedPaymentTab === 'payfast'
                  ? 'border-[#5A67FF] bg-[#F5F7FF] shadow-[0_10px_28px_rgba(90,103,255,0.14)]'
                  : 'border-[#E9EAF2] bg-white hover:border-[#D9DCEA]'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4A57FF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <path d="M29.3321 16C29.3321 17.7511 28.9872 19.485 28.3171 21.1027C27.647 22.7205 26.6648 24.1904 25.4266 25.4286C24.1884 26.6668 22.7185 27.6489 21.1008 28.319C19.483 28.9891 17.7491 29.334 15.9981 29.334C14.247 29.334 12.5131 28.9891 10.8954 28.319C9.27761 27.6489 7.80768 26.6668 6.5695 25.4286C5.33132 24.1904 4.34915 22.7205 3.67905 21.1027C3.00896 19.485 2.66406 17.7511 2.66406 16C2.66406 12.4636 4.06889 9.07206 6.5695 6.57145C9.07011 4.07084 12.4617 2.66602 15.9981 2.66602C19.5345 2.66602 22.926 4.07084 25.4266 6.57145C27.9272 9.07206 29.3321 12.4636 29.3321 16Z" stroke="#4A57FF" strokeWidth="2" />
                  <path d="M21.3308 15.9998C21.3308 17.7505 21.1921 19.4852 20.9241 21.1025C20.6575 22.7198 20.2641 24.1892 19.7681 25.4278C19.2735 26.6665 18.6855 27.6478 18.0388 28.3185C17.3908 28.9878 16.6975 29.3332 15.9975 29.3332C15.2975 29.3332 14.6041 28.9878 13.9575 28.3185C13.3095 27.6478 12.7215 26.6652 12.2268 25.4278C11.7308 24.1892 11.3375 22.7212 11.0695 21.1025C10.796 19.4154 10.6604 17.7089 10.6641 15.9998C10.6641 14.2492 10.8015 12.5145 11.0695 10.8972C11.3375 9.27984 11.7308 7.8105 12.2268 6.57184C12.7215 5.33317 13.3095 4.35184 13.9561 3.68117C14.6041 3.01317 15.2975 2.6665 15.9975 2.6665C16.6975 2.6665 17.3908 3.01184 18.0375 3.68117C18.6855 4.35184 19.2735 5.3345 19.7681 6.57184C20.2641 7.8105 20.6575 9.2785 20.9241 10.8972C21.1935 12.5145 21.3308 14.2492 21.3308 15.9998Z" stroke="#4A57FF" strokeWidth="2" />
                  <path d="M2.66406 16H29.3307" stroke="#4A57FF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1A1A1A]">PayFast</p>
                <p className="truncate text-xs text-[#7E7E8A]">Trusted South African gateway</p>
              </div>

              <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                selectedPaymentTab === 'payfast'
                  ? 'bg-[#5A67FF] text-white'
                  : 'border border-[#D9DCEA] bg-white text-transparent'
              }`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </button>

            {requiresLoginForBulkCheckout && !checkoutUserId && !session?.user?.id ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                  Bulk orders require account login before payment. Guest checkout is only available for single orders.
                </p>
              </div>
            ) : null}

            <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#FFF8EF] px-4 py-3.5">
              <input
                type="checkbox"
                checked={isPaymentConfirmed || false}
                onChange={(event) =>
                  dispatch(setIsPaymentConfirmed(event.target.checked))
                }
                className="sr-only"
              />
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                isPaymentConfirmed
                  ? 'border-transparent bg-gradient-to-r from-[#ED457D] to-[#FA8F42] text-white'
                  : 'border-[#F2C9D3] bg-white text-transparent'
              }`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-sm leading-6 text-[#4A4A4A]">
                I have reviewed all gift and recipient details in this checkout and confirm them as correct. Once payment is completed, vouchers cannot be modified or cancelled.
              </span>
            </label>

            <div className="rounded-2xl bg-[#FBFBFD] px-4 py-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#9E9EAA]">
                Payment summary
              </p>
              <div className="space-y-3 text-sm text-[#5F5F69]">
                <div className="flex items-center justify-between gap-4">
                  <span>Gift card value</span>
                  <span className="font-medium text-[#1A1A1A]">{subtotalLabel}</span>
                </div>

                {appliedPromo ? (
                  <div className="rounded-xl bg-[#FFF7FA] px-3 py-2 text-xs text-[#ED457D]">
                    Promo {appliedPromo.code} applied:{' '}
                    <span className="font-semibold">
                      -{formatCurrencyValue(checkoutPricing.discountAmount, checkoutCurrency)}
                    </span>
                  </div>
                ) : null}

              </div>

              <div className="mt-4 border-t border-[#ECECF2] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-semibold text-[#1A1A1A]">Total</span>
                  <span className="text-base font-semibold text-[#1A1A1A]">{totalAmountLabel}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePaymentButtonClick}
              disabled={isProcessing || !isPaymentConfirmed}
              className={`group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-white transition-all duration-300 sm:text-base ${
                (isProcessing || !isPaymentConfirmed)
                  ? 'cursor-not-allowed bg-gray-400 shadow-none'
                  : 'cursor-pointer bg-gradient-to-r from-[#FA9B5B] to-[#ED457D] shadow-[0_18px_35px_rgba(237,69,125,0.28)] hover:scale-[1.01]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {pendingOrderIds.length > 0
                    ? 'Processing payment...'
                    : `Preparing ${totalItemCount} order${totalItemCount > 1 ? 's' : ''}...`}
                </>
              ) : (
                <>
                  {paymentButtonLabel}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                </>
              )}
            </button>

            {!checkoutUserId && guestCheckout?.email ? (
              <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3">
                <p className="text-sm text-pink-700">
                  Paying as guest: <span className="font-semibold">{guestCheckout.email}</span>
                </p>
              </div>
            ) : null}
          </div>

          <div className="self-start rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_18px_60px_rgba(90,103,255,0.07)] sm:p-6 lg:sticky lg:top-24">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbe4e8]">
                <Gift className="h-5 w-5 text-[#ED457D]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Your checkout summary</h2>
                <p className="text-sm text-[#7E7E8A]">Everything lined up before you pay</p>
              </div>
            </div>

            <div className="relative mb-4 overflow-hidden rounded-[24px] bg-[#1E2139] p-4.5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(83,92,151,0.85),rgba(30,33,57,1)_50%,rgba(17,20,39,1)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px] opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(9,10,24,0.78)]" />

              <div className="relative">
                <p className="text-sm font-medium text-white/90">{checkoutModeLabel}</p>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {totalItemCount} item{totalItemCount === 1 ? '' : 's'} ready to go
                </h3>
                <p className="mt-2 max-w-md text-sm text-white/70">
                  One secure payment for every gift currently waiting in your cart.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Orders</p>
                    <p className="mt-1 text-lg font-semibold text-white">{totalItemCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Vouchers</p>
                    <p className="mt-1 text-lg font-semibold text-white">{totalVoucherCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Total</p>
                    <p className="mt-1 text-lg font-semibold text-white">{totalAmountLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 lg:max-h-[420px] lg:overflow-y-auto lg:pr-1">
              {summaryItems.map((item) => (
                <SummaryItemCard key={item.key} item={item} />
              ))}
            </div>

            <div className="mt-3 rounded-2xl border border-[#EFEFF4] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3F7] text-[#ED457D]">
                  <BadgePercent className="h-4 w-4" />
                </div>

                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(event) => {
                    setPromoCodeInput(event.target.value);
                    setPromoError('');
                    setPromoSuccessMessage('');
                  }}
                  placeholder="Have a promocode?"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#9E9EAA]"
                  disabled={isApplyingPromo}
                />

                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F2CCD8] bg-white text-[#8B8B8B] transition hover:text-[#1A1A1A]"
                    aria-label="Remove promo code"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCodeInput.trim()}
                    className="text-sm font-semibold text-[#ED457D] transition hover:text-[#D6366E] disabled:cursor-not-allowed disabled:text-[#F7A4B9]"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                )}
              </div>

              {appliedPromo ? (
                <div className="mt-3 rounded-2xl border border-[#F9C8D7] bg-[#FFF7FA] px-4 py-3">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {appliedPromo.code} applied
                  </p>
                  <p className="text-sm text-[#ED457D]">
                    You saved {formatCurrencyValue(checkoutPricing.discountAmount, checkoutCurrency)}
                  </p>
                </div>
              ) : null}

              {promoError ? (
                <p className="mt-3 text-sm text-red-500">{promoError}</p>
              ) : promoSuccessMessage ? (
                <p className="mt-3 text-sm text-green-600">{promoSuccessMessage}</p>
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Payment Error</p>
                <p className="mt-0.5 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showIdentityChoiceModal && (
        <div className="fixed inset-0 z-999 bg-black/60 p-4 flex items-center justify-center">
          <CheckoutIdentityChoiceModal
            onClose={closeIdentityModals}
            onContinueAsGuest={openGuestModal}
            onSignIn={() => openAuthModal('login')}
            onSignUp={() => openAuthModal('signup')}
            showGuestOption={!requiresLoginForBulkCheckout}
            guestUnavailableText="Bulk orders require account login before payment."
          />
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-999 bg-black/60 p-4 flex items-center justify-center">
          <AuthForm
            type={authMode}
            mode="modal"
            onClose={closeIdentityModals}
            onAuthSuccess={handleAuthSuccess}
            initialEmail={
              guestCheckout?.email ||
              cartItems[0]?.deliveryDetails?.yourEmailAddress ||
              bulkItems[0]?.companyInfo?.contactEmail ||
              ""
            }
          />
        </div>
      )}

      {showGuestModal && !requiresLoginForBulkCheckout && (
        <div className="fixed inset-0 z-999 bg-black/60 p-4 flex items-center justify-center">
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
                className="group w-full sm:w-auto max-w-fit
  px-6 md:px-8 py-3 md:py-4
  bg-gradient-to-r from-pink-500 to-orange-500
  hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500
  text-white font-semibold text-sm md:text-base
  rounded-full
  shadow-md hover:shadow-xl hover:scale-105
  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
  transition-all duration-300
  flex items-center justify-center gap-2 whitespace-nowrap"
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
                  openAuthModal('login');
                }}
                className="w-full py-3.5 border-2 border-pink-500 text-pink-500 rounded-full font-semibold hover:bg-pink-50 transition"
              >
                Sign in to account
              </button>
            </form>
          </div>
        </div>
      )}

      {totalItemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-12px_32px_rgba(17,24,39,0.14)] backdrop-blur lg:hidden mobile-safe-bottom">
          <div className="mx-auto max-w-6xl space-y-3">
            <label className="flex items-start gap-2.5 rounded-2xl bg-[#FFF8EF] px-3 py-2.5">
              <input
                type="checkbox"
                checked={isPaymentConfirmed || false}
                onChange={(event) =>
                  dispatch(setIsPaymentConfirmed(event.target.checked))
                }
                className="mt-1 h-4 w-4 rounded border-[#F2C9D3] text-[#ED457D] focus:ring-[#ED457D]"
              />
              <span className="text-xs leading-5 text-[#4A4A4A]">
                I confirm the checkout details are correct.
              </span>
            </label>

            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Total
                </p>
                <p className="truncate text-base font-bold text-[#1A1A1A]">
                  {totalAmountLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={handlePaymentButtonClick}
                disabled={isProcessing || !isPaymentConfirmed}
                className={`min-h-12 shrink-0 rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
                  (isProcessing || !isPaymentConfirmed)
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-gradient-to-r from-[#FA9B5B] to-[#ED457D] shadow-md'
                }`}
              >
                {isProcessing ? 'Preparing...' : paymentButtonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
