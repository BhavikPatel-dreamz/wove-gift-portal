import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgePercent, Clock3, Gift, Heart, Mail, Pencil, Shield, ShoppingCart, Users, WalletCards, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { goBack, setCurrentStep, setDeliveryFormEditReturn, setIsPaymentConfirmed } from "../../../redux/giftFlowSlice";
import { createPendingOrder } from "../../../lib/action/orderAction";
import { saveCartItemAsync } from "../../../redux/cartSlice";
import { useSession } from "@/contexts/SessionContext";
import AuthForm from "@/components/AuthForm";
import CheckoutIdentityChoiceModal from "../checkout/CheckoutIdentityChoiceModal";
import { validatePromoCodeForCheckout } from "../../../lib/action/promoCodeAction";
import { calculateCheckoutTotals } from "../../../lib/promo/promoPricing";
import { currencyList } from "../../brandsPartner/currency";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

const getCurrencySymbol = (code) =>
  currencyList.find((currency) => currency.code === code)?.symbol || "R";

const formatCurrencyValue = (
  amount,
  currencyCode = "ZAR",
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
) => {
  const numericAmount = Number(amount || 0);
  return `${getCurrencySymbol(currencyCode)} ${new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount)}`;
};

const formatTo12Hour = (time24) => {
  if (!time24 || typeof time24 !== "string") return "";

  const [hoursRaw, minutesRaw] = time24.split(":").map(Number);
  if (!Number.isFinite(hoursRaw) || !Number.isFinite(minutesRaw)) {
    return time24;
  }

  const period = hoursRaw >= 12 ? "PM" : "AM";
  const hours12 = hoursRaw === 0 ? 12 : hoursRaw > 12 ? hoursRaw - 12 : hoursRaw;

  return `${hours12}:${String(minutesRaw).padStart(2, "0")} ${period}`;
};

const formatTimingSummary = (timing) => {
  if (!timing || timing.type === "immediate") {
    return "Send now";
  }

  if (timing.type === "schedule" || timing.type === "scheduled") {
    const monthIndex = Number(timing.month);
    const day = Number(timing.date);
    const year = Number(timing.year);
    const monthName = MONTHS[monthIndex];
    const timeText = formatTo12Hour(timing.time);

    if (monthName && day && year && timeText) {
      return `${monthName} ${day}, ${year} at ${timeText}`;
    }

    if (monthName && day && year) {
      return `${monthName} ${day}, ${year}`;
    }

    return "Scheduled";
  }

  return "Send now";
};

const getBrandDisplayName = (brand) =>
  brand?.brandName || brand?.name || "Gift card";

const getDeliveryMethodLabel = (method, isBulkMode = false) => {
  if (isBulkMode && method === "multiple") return "Email delivery";
  if (method === "email") return "Email";
  if (method === "whatsapp") return "WhatsApp";
  if (method === "print") return "Print";
  return "Not selected";
};

const getDeliveryHelperText = (method, details) => {
  if (method === "email") {
    return details?.recipientEmailAddress || "Classic email delivery";
  }

  if (method === "whatsapp") {
    return "Shared manually";
  }

  if (method === "print") {
    return "Download and print at home";
  }

  return "";
};

const renderDeliveryMedia = (method) => {
  console.log("method", method)
  if (method === "whatsapp") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEFBF0]">
        <div className="scale-[0.34]">
          <svg width="70" height="70" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M27.2527 24.5721C26.42 24.9124 25.8881 26.2161 25.3484 26.8821C25.0716 27.2233 24.7416 27.2766 24.3163 27.1055C21.1907 25.8603 18.7948 23.7746 17.07 20.8983C16.7778 20.4523 16.8302 20.0999 17.1826 19.6857C17.7034 19.0721 18.3582 18.3752 18.4991 17.5484C18.812 15.7197 16.4212 10.047 13.2638 12.6173C4.17852 20.0209 28.4198 39.6567 32.7948 29.0366C34.0323 26.0262 28.6329 24.0066 27.2527 24.5721ZM22.0002 40.1569C18.787 40.1569 15.6254 39.3027 12.8574 37.6853C12.4131 37.4249 11.8759 37.3562 11.3792 37.4911L5.36446 39.142L7.45962 34.5263C7.59975 34.2181 7.65591 33.8784 7.6224 33.5415C7.5889 33.2047 7.46692 32.8826 7.26884 32.6081C5.02759 29.5015 3.84251 25.8337 3.84251 22C3.84251 11.9874 11.9877 3.84227 22.0002 3.84227C32.0128 3.84227 40.1571 11.9874 40.1571 22C40.1571 32.0117 32.012 40.1569 22.0002 40.1569ZM22.0002 0C9.8693 0 0.00024105 9.86906 0.00024105 22C0.00024105 26.2677 1.21196 30.366 3.51423 33.923L0.172116 41.2835C0.0210947 41.616 -0.0321134 41.9846 0.0187183 42.3462C0.0695499 42.7078 0.222319 43.0474 0.459147 43.3254C0.639772 43.5368 0.864043 43.7066 1.11654 43.823C1.36903 43.9395 1.64375 43.9998 1.9218 44C3.16102 44 9.91829 41.8765 11.6379 41.4047C14.8167 43.1054 18.3823 44 22.0002 44C34.1303 44 44.0002 34.1301 44.0002 22C44.0002 9.86906 34.1303 0 22.0002 0Z" fill="#39AE41" />
          </svg>
        </div>
      </div>
    );
  }

  if (method === "print") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6]">
        <div className="scale-[0.3]">
          <svg width="70" height="70" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5204 34.5336H32.4796M16.5204 41.0168H32.4796M37.4864 37.0034H45.3632C45.9299 37.0034 46.4734 36.7813 46.8741 36.3859C47.2749 35.9906 47.5 35.4544 47.5 34.8953V20.0235L42.6038 14.7329C41.5366 13.5798 40.0269 12.9228 38.4441 12.9228H10.8025C9.25854 12.9228 7.78226 13.5481 6.71885 14.6525L2.43878 19.0973L1.5 20.0235V35.1504C1.5 35.5512 1.63176 35.9418 1.87551 36.2624C2.23009 36.7288 2.78658 37.0034 3.37755 37.0034H11.8265M47.5 20.0235H1.5M8.07143 28.3591H12.1395M12.1395 28.3591V45.1223C12.1395 45.8446 12.4723 46.5278 13.0439 46.979C13.4713 47.3162 14.0022 47.5 14.5495 47.5H34.7935C35.3251 47.5 35.8449 47.3447 36.2873 47.0538C37.0364 46.5611 37.4864 45.7315 37.4864 44.8432V28.3591M12.1395 28.3591H37.4864M37.4864 28.3591H40.9286M11.8265 5.2047C11.8265 4.40311 12.0901 3.62315 12.5776 2.98188C13.2867 2.04901 14.3997 1.5 15.5816 1.5H34.2812C35.1313 1.5 35.9465 1.83316 36.5476 2.42617C37.1487 3.01919 37.4864 3.8235 37.4864 4.66216V12.9228H11.8265V5.2047Z" stroke="black" strokeWidth="3" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF]">
      <div className="scale-[0.3]">
        <svg width="70" height="55" viewBox="0 0 42 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 3L20.5 17L38 3" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.5 23.3866V6.95669C1.5 3.94304 3.94304 1.5 6.95668 1.5H34.8623C37.6998 1.5 40 3.80023 40 6.6377V22.9645C40 25.2282 39.1007 27.3993 37.5 29C35.8993 30.6007 33.7282 31.5 31.4645 31.5H9.61341C7.31336 31.5 5.1214 30.5238 3.58276 28.8142C2.24192 27.3244 1.5 25.3909 1.5 23.3866Z" stroke="black" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
};
const DetailTile = ({
  label,
  value,
  helperText,
  icon: Icon,
  accentClass = "bg-[#FFF3F7] text-[#ED457D]",
  media = null,
  onEdit = null,
}) => (
  <div className="rounded-2xl border border-[#EFEFF4] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
    <div className="flex items-center gap-3">
      {media || (
        <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accentClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A3A3AF]">
          {label}
        </p>
        <p className="break-words text-sm font-semibold leading-5 text-[#1A1A1A]">
          {value || "Not set"}
        </p>
        {helperText ? (
          <p className="mt-0.5 break-words text-[10px] leading-5 text-[#7E7E8A]">{helperText}</p>
        ) : null}
      </div>

      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#FFD4E0] bg-[#FFF7FA] text-[#ED457D] transition hover:border-[#ED457D]"
          aria-label={`Edit ${label.toLowerCase()}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  </div>
);

const PaymentStep = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const mode = searchParams.get("mode");
  const editBulkIdFromUrl = searchParams.get("editBulkId");
  const editBulkIndexFromUrl = searchParams.get("editBulkIndex");
  const isBulkMode = mode === "bulk";

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState("payfast");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isSavingCart, setIsSavingCart] = useState(false);
  const [checkoutUserId, setCheckoutUserId] = useState(null);
  const [showIdentityChoiceModal, setShowIdentityChoiceModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authSuccessAction, setAuthSuccessAction] = useState("payment");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(null);
  const [guestFormData, setGuestFormData] = useState({ fullName: "", email: "" });
  const [guestFormError, setGuestFormError] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccessMessage, setPromoSuccessMessage] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const {
    selectedBrand,
    selectedAmount: giftFlowAmount,
    quantity: giftFlowQuantity,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    companyInfo: giftFlowCompanyInfo,
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

  const { items: cartItems, bulkItems } = useSelector((state) => state.cart);

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

    if (isEditMode && editFlowType === "bulk") {
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
    editingIndex,
  ]);

  const currentBulkOrder = currentBulkOrderIndex >= 0 ? bulkItems[currentBulkOrderIndex] : null;
  const currentRegularCartItem = useMemo(() => {
    if (isBulkMode || !isEditMode || editFlowType === "bulk") {
      return null;
    }

    if (
      editingIndex !== null &&
      editingIndex !== undefined &&
      cartItems[editingIndex]
    ) {
      return cartItems[editingIndex];
    }

    return null;
  }, [cartItems, editFlowType, editingIndex, isBulkMode, isEditMode]);
  const draftBulkBrand = isBulkMode ? (selectedBrand || currentBulkOrder?.selectedBrand || null) : selectedBrand;
  const draftBulkAmount = isBulkMode ? (giftFlowAmount || currentBulkOrder?.selectedAmount || null) : giftFlowAmount;
  const draftBulkQuantity = isBulkMode
    ? (giftFlowQuantity > 0 ? giftFlowQuantity : (currentBulkOrder?.quantity || 1))
    : 1;
  const draftBulkCompanyInfo = isBulkMode
    ? (giftFlowCompanyInfo || currentBulkOrder?.companyInfo || null)
    : null;
  const bulkDeliveryOption = isBulkMode && currentBulkOrder
    ? normalizeBulkDeliveryOption(currentBulkOrder.deliveryOption, currentBulkOrder.csvRecipients)
    : null;
  const csvRecipients = isBulkMode && currentBulkOrder ? currentBulkOrder.csvRecipients : [];
  const selectedAmount = draftBulkAmount;
  const quantity = draftBulkQuantity;
  const companyInfo = draftBulkCompanyInfo;
  const effectiveBulkBrand = draftBulkBrand;
  const displayBrand = effectiveBulkBrand;
  const displaySubCategory = isBulkMode
    ? (selectedSubCategory || currentBulkOrder?.selectedSubCategory || null)
    : selectedSubCategory;
  const displayTiming = isBulkMode
    ? (selectedTiming || currentBulkOrder?.selectedTiming || null)
    : selectedTiming;
  const displayMessage = isBulkMode
    ? (personalMessage || currentBulkOrder?.personalMessage || "")
    : personalMessage;
  const displayDeliveryMethod = isBulkMode
    ? (bulkDeliveryOption === "multiple" ? "email" : bulkDeliveryOption || deliveryMethod)
    : deliveryMethod;
  const currentCurrency = selectedAmount?.currency || "ZAR";
  const previewCaption = [selectedOccasionName, displaySubCategory?.name]
    .filter(Boolean)
    .join(" · ") || getBrandDisplayName(displayBrand);

  const subtotal = useMemo(() => {
    const baseAmount = selectedAmount?.value || 0;
    return isBulkMode ? baseAmount * quantity : baseAmount;
  }, [isBulkMode, quantity, selectedAmount?.value]);

  const checkoutPricing = useMemo(
    () => calculateCheckoutTotals(subtotal, appliedPromo),
    [appliedPromo, subtotal]
  );

  const totalAmountLabel = formatCurrencyValue(checkoutPricing.totalAmount, currentCurrency);
  const serviceFeeLabel = formatCurrencyValue(checkoutPricing.serviceFee, currentCurrency);
  const subtotalLabel = formatCurrencyValue(checkoutPricing.subtotal, currentCurrency);
  const selectedAmountLabel = formatCurrencyValue(
    selectedAmount?.value || 0,
    currentCurrency,
    Number.isInteger(Number(selectedAmount?.value || 0)) ? 0 : 2,
    2
  );
  const paymentButtonLabel = checkoutPricing.totalAmount === 0
    ? "Complete checkout"
    : "Pay with PayFast";
  const bulkRecipientCount = csvRecipients.length || quantity || 0;
  const displayDeliveryTileValue = isBulkMode
    ? (bulkDeliveryOption === "multiple" ? "Individual emails" : "Send to my email")
    : getDeliveryMethodLabel(displayDeliveryMethod, isBulkMode);
  const displayDeliveryTileHelper = isBulkMode
    ? (
      bulkDeliveryOption === "multiple"
        ? `${bulkRecipientCount} recipient${bulkRecipientCount === 1 ? "" : "s"} from CSV upload`
        : (companyInfo?.contactEmail || "Voucher codes will be sent to your contact email")
    )
    : getDeliveryHelperText(displayDeliveryMethod, deliveryDetails);
  const showTimingTile = !isBulkMode && displayDeliveryMethod === "email";
  const isBulkCartEdit = isBulkMode && typeof currentBulkOrder?.cartItemId === "string";
  const isRegularCartEdit = !isBulkMode && typeof currentRegularCartItem?.cartItemId === "string";

  const calculateTotal = () => checkoutPricing.totalAmount;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!session?.user?.id) {
      setCheckoutUserId(null);
      return;
    }

    setCheckoutUserId(session.user.id);
    setGuestCheckout(null);
    setGuestFormError("");
  }, [hasHydrated, session?.user?.id]);

  useEffect(() => {
    if (
      appliedPromo &&
      (appliedPromo.subtotal !== subtotal || appliedPromo.currency !== currentCurrency)
    ) {
      setAppliedPromo(null);
      setPromoSuccessMessage("");
      setPromoError("");
    }
  }, [appliedPromo, currentCurrency, subtotal]);

  const closeIdentityModals = () => {
    setShowIdentityChoiceModal(false);
    setShowAuthModal(false);
    setShowGuestModal(false);
    setGuestFormError("");
  };

  const openIdentityChoiceModal = () => {
    setAuthSuccessAction("payment");
    setAuthMode("login");
    setShowAuthModal(false);
    setShowGuestModal(false);
    setShowIdentityChoiceModal(true);
    setGuestFormError("");
  };

  const openAuthModal = (nextMode = "login", nextAction = "payment") => {
    setAuthSuccessAction(nextAction);
    setAuthMode(nextMode);
    setShowIdentityChoiceModal(false);
    setShowGuestModal(false);
    setShowAuthModal(true);
    setGuestFormError("");
  };

  const openGuestModal = () => {
    setAuthSuccessAction("payment");
    setGuestFormData({
      fullName: guestCheckout?.fullName || deliveryDetails?.yourFullName || "",
      email: guestCheckout?.email || deliveryDetails?.yourEmailAddress || "",
    });
    setGuestFormError("");
    setShowIdentityChoiceModal(false);
    setShowAuthModal(false);
    setShowGuestModal(true);
  };

  const startReviewEditFlow = (step) => {
    dispatch(setDeliveryFormEditReturn({
      enabled: true,
      method: deliveryMethod || null,
      returnStep: 8,
    }));
    dispatch(setCurrentStep(step));
  };

  const saveCartItemForUser = async (userId, item) => {
    const cartItemId = isBulkMode
      ? (typeof currentBulkOrder?.cartItemId === "string" ? currentBulkOrder.cartItemId : null)
      : (typeof currentRegularCartItem?.cartItemId === "string" ? currentRegularCartItem.cartItemId : null);

    await dispatch(saveCartItemAsync({
      userId,
      type: isBulkMode ? "bulk" : "regular",
      item,
      cartItemId,
    })).unwrap();
  };

  const buildCartItemPayload = () => {
    if (isBulkMode) {
      return {
        ...currentBulkOrder,
        selectedBrand: effectiveBulkBrand,
        selectedAmount,
        personalMessage: displayMessage,
        quantity,
        companyInfo,
        deliveryOption: bulkDeliveryOption,
        deliveryMethod: bulkDeliveryOption === "multiple" ? "multiple" : "email",
        selectedOccasion: selectedOccasion || currentBulkOrder?.selectedOccasion,
        selectedSubCategory: displaySubCategory,
        selectedTiming: displayTiming,
        totalAmount: calculateTotal(),
        isBulkOrder: true,
        csvRecipients,
      };
    }

    return {
      selectedBrand,
      selectedAmount,
      personalMessage,
      deliveryMethod,
      deliveryDetails,
      selectedOccasion,
      selectedSubCategory,
      selectedTiming,
    };
  };

  const validateCartItem = () => {
    if (!selectedAmount || !displayBrand) {
      setError("Please complete your gift details before adding to cart.");
      return false;
    }

    if (isBulkMode && !currentBulkOrder) {
      setError("No bulk order was found to save.");
      return false;
    }

    if (!isBulkMode && !deliveryMethod) {
      setError("Please select a delivery method before adding to cart.");
      return false;
    }

    setError(null);
    return true;
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
    if (authSuccessAction === "cart") {
      await handleAddToCart({ userIdOverride: authenticatedId });
      return;
    }

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
        subtotal,
        currency: currentCurrency,
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
    } catch (promoValidationError) {
      setAppliedPromo(null);
      setPromoSuccessMessage("");
      setPromoError(promoValidationError?.message || "Failed to apply promo code.");
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

  const handleInitiatePayment = async ({
    userIdOverride,
    guestCheckoutOverride,
  } = {}) => {
    if (!isPaymentConfirmed) {
      toast.error("Please confirm that all details are correct");
      return null;
    }

    const resolvedUserId = userIdOverride || checkoutUserId || session?.user?.id || null;
    const resolvedGuestCheckout = resolvedUserId
      ? null
      : (guestCheckoutOverride || guestCheckout);

    if (!resolvedUserId && !resolvedGuestCheckout?.email) {
      openIdentityChoiceModal();
      return null;
    }

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading("Preparing your order...");

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
        personalMessage: displayMessage,
        quantity,
        companyInfo: guestCompanyInfo,
        deliveryOption: bulkDeliveryOption,
        selectedOccasion: selectedOccasion || currentBulkOrder?.selectedOccasion,
        selectedSubCategory: displaySubCategory,
        totalAmount: calculateTotal(),
        appliedPromoCode: appliedPromo?.code || null,
        isBulkOrder: true,
        totalSpend: currentBulkOrder?.totalSpend,
        deliveryMethod: bulkDeliveryOption === "multiple" ? "multiple" : "email",
        csvRecipients,
        userId: resolvedUserId,
        guestCheckout: resolvedGuestCheckout,
        selectedTiming: displayTiming,
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
        appliedPromoCode: appliedPromo?.code || null,
        isBulkOrder: false,
        userId: resolvedUserId,
        guestCheckout: resolvedGuestCheckout,
      };

      const result = await createPendingOrder(orderData);

      if (!result?.success) {
        setError(result?.error || "Failed to prepare order.");
        toast.error(result?.error || "Failed to prepare order.", { id: toastId });
        setIsProcessing(false);
        return null;
      }

      if (result?.data?.skipGateway && result?.data?.successUrl) {
        toast.success("Promo applied. Completing your free checkout...", { id: toastId });
        setTimeout(() => {
          window.location.assign(result.data.successUrl);
        }, 100);
        return { orderId: result.data.orderId };
      }

      const redirectUrl = result?.data?.payfastUrl;
      if (!redirectUrl) {
        setError("Payment link was not received.");
        toast.error("Failed to get payment link.", { id: toastId });
        setIsProcessing(false);
        return null;
      }

      toast.loading("Redirecting to PayFast...", { id: toastId });
      setTimeout(() => {
        window.location.assign(redirectUrl);
      }, 100);

      return { orderId: result.data.orderId };
    } catch (paymentError) {
      console.error("Payment initiation error:", paymentError);
      setError("Failed to prepare order.");
      toast.error("Failed to prepare order.", { id: toastId });
      setIsProcessing(false);
      return null;
    }
  };

  const handlePaymentButtonClick = async () => {
    const hasIdentity = checkoutUserId || session?.user?.id || guestCheckout?.email;
    if (!hasIdentity) {
      openIdentityChoiceModal();
      return;
    }

    await handleInitiatePayment();
  };

  const handleAddToCart = async ({ userIdOverride } = {}) => {
    if (!validateCartItem() || isSavingCart) {
      return;
    }

    const resolvedUserId = userIdOverride || session?.user?.id || null;

    if (!resolvedUserId) {
      openAuthModal("login", "cart");
      return;
    }

    setIsSavingCart(true);
    setError(null);

    try {
      const cartItem = buildCartItemPayload();
      await saveCartItemForUser(resolvedUserId, cartItem);
      toast.success(
        isBulkMode
          ? (isBulkCartEdit ? "Bulk order updated in cart!" : "Bulk order added to cart!")
          : (isRegularCartEdit ? "Gift updated in cart!" : "Gift added to cart!"),
      );
      router.push("/cart");
    } catch (cartError) {
      const message =
        typeof cartError === "string"
          ? cartError
          : cartError?.message || "Failed to add item to cart.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSavingCart(false);
    }
  };

  const handleOccasionEdit = () => {
    startReviewEditFlow(4);
  };

  const handleBrandEdit = () => {
    startReviewEditFlow(1);
  };

  const handleAmountEdit = () => {
    if (isBulkMode) {
      dispatch(setCurrentStep(6));
      return;
    }

    startReviewEditFlow(2);
  };

  const handleDeliveryEdit = () => {
    if (isBulkMode) {
      dispatch(setCurrentStep(7));
      return;
    }

    startReviewEditFlow(6);
  };

  const handleTimingEdit = () => {
    dispatch(setCurrentStep(7));
  };

  const handleMessageEdit = () => {
    startReviewEditFlow(5);
  };

  const backButton = (
    <button
      type="button"
      className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-base font-semibold text-[#4A4A4A] transition-all duration-300 group"
      onClick={() => {
        if (isBulkMode) {
          dispatch(setCurrentStep(7));
          return;
        }

        if (displayDeliveryMethod !== "email") {
          dispatch(setCurrentStep(6));
          return;
        }

        dispatch(goBack());
      }}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ED457D] to-[#FA8F42] p-[1.5px]" />
      <span className="absolute inset-[2px] rounded-full bg-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]" />
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
              fill="url(#paymentStepBackButton)"
            />
            <defs>
              <linearGradient
                id="paymentStepBackButton"
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8F8FC_0%,#FDF2F5_100%)] px-4 py-20 sm:py-24 md:px-8 md:py-30">
      {hasHydrated ? <Toaster /> : null}

      <div className="mx-auto max-w-6xl">
        <div className="relative mb-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          {backButton}

          {isBulkMode ? (
            <div className="flex w-full items-center justify-center gap-3 p-2 md:absolute md:left-1/2 md:w-auto md:-translate-x-1/2">
              <div className="hidden h-px w-30 bg-gradient-to-r from-transparent via-[#FA8F42] to-[#ED457D] md:block" />
              <div className="rounded-full bg-gradient-to-r from-[#ED457D] to-[#FA8F42] p-px">
                <div className="rounded-full bg-white px-4 py-1.5">
                  <span className="whitespace-nowrap text-sm font-semibold text-gray-700">Bulk Gifting</span>
                </div>
              </div>
              <div className="hidden h-px w-30 bg-gradient-to-l from-transparent via-[#ED457D] to-[#FA8F42] md:block" />
            </div>
          ) : (
            <div className="hidden w-[140px] md:block" />
          )}

          <div className="hidden w-[140px] md:block" />
        </div>

        <div className="mb-10 text-center sm:mb-12">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#1A1A1A] sm:text-4xl">
            You&apos;re almost there!
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#666674] sm:text-base">
            Review, edit and pay — all in one place
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
                  <p className="text-sm text-[#7E7E8A]">Select how to complete this</p>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#ECFAEF] px-4 py-3 text-sm font-semibold text-[#219653]">
                <Shield className="h-4 w-4" />
                100% secure and encrypted
              </div>

              <button
                type="button"
                onClick={() => setSelectedPaymentTab("payfast")}
                className={`mb-4 flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${selectedPaymentTab === "payfast"
                  ? "border-[#5A67FF] bg-[#F5F7FF] shadow-[0_10px_28px_rgba(90,103,255,0.14)]"
                  : "border-[#E9EAF2] bg-white hover:border-[#D9DCEA]"
                  }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffffff] text-[#4A57FF]">
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

                <div className={`flex h-5 w-5 items-center justify-center rounded-full ${selectedPaymentTab === "payfast" ? "bg-[#5A67FF] text-white" : "border border-[#D9DCEA] bg-white text-transparent"
                  }`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </button>

              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#FFF8EF] px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={isPaymentConfirmed || false}
                  onChange={(event) =>
                    dispatch(setIsPaymentConfirmed(event.target.checked))
                  }
                  className="sr-only"
                />
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${isPaymentConfirmed
                  ? "border-transparent bg-gradient-to-r from-[#ED457D] to-[#FA8F42] text-white"
                  : "border-[#F2C9D3] bg-white text-transparent"
                  }`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm leading-6 text-[#4A4A4A]">
                  I have reviewed all recipient and gift details and confirm them as correct. Once payment is completed, the voucher cannot be modified or cancelled.
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
                      Promo {appliedPromo.code} applied:
                      {" "}
                      <span className="font-semibold">
                        -{formatCurrencyValue(checkoutPricing.discountAmount, currentCurrency)}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-4">
                    <span>Service Fee (5% incl. VAT)</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {checkoutPricing.serviceFee === 0 ? "Free" : serviceFeeLabel}
                    </span>
                  </div>

                  {/* <details className="rounded-xl bg-white px-3 py-2">
                    <summary className="cursor-pointer text-xs font-medium text-[#7E7E8A]">
                      Fee breakdown
                    </summary>
                    <div className="mt-2 space-y-2 text-xs text-[#7E7E8A]">
                      <div className="flex items-center justify-between gap-4">
                        <span>Service Fee excl. VAT 4.35%</span>
                        <span>{formatCurrencyValue(checkoutPricing.serviceFeeExVat, currentCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>VAT on Service Fee 15%</span>
                        <span>{formatCurrencyValue(checkoutPricing.serviceFeeVat, currentCurrency)}</span>
                      </div>
                    </div>
                  </details> */}
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
                className={`group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-white transition-all duration-300 sm:text-base ${(isProcessing || !isPaymentConfirmed)
                  ? "cursor-not-allowed bg-gray-400 shadow-none"
                  : "cursor-pointer bg-gradient-to-r from-[#FA9B5B] to-[#ED457D] shadow-[0_18px_35px_rgba(237,69,125,0.28)] hover:scale-[1.01]"
                  }`}
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
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

              <button
                type="button"
                onClick={() => handleAddToCart()}
                disabled={isSavingCart || isProcessing}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-sm font-semibold transition-all duration-300 sm:text-base ${
                  (isSavingCart || isProcessing)
                    ? "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF]"
                    : "cursor-pointer border-[#FFD4E0] bg-white text-[#ED457D] hover:border-[#ED457D] hover:bg-[#FFF7FA]"
                }`}
              >
                {isSavingCart ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving to cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    {isBulkMode
                      ? (isBulkCartEdit ? "Update Cart Order" : "Add Bulk Order to Cart")
                      : (isRegularCartEdit ? "Update Cart" : "Add to Cart")}
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

              <div className="rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_18px_60px_rgba(90,103,255,0.07)] sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbe4e8]">
                    <Gift className="h-5 w-5 text-[#ED457D]" />
                  </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">Your beautiful gift</h2>
                  <p className="text-sm text-[#7E7E8A]">Tap any pencil to edit</p>
                </div>
              </div>

              <div className="relative mb-4 overflow-hidden rounded-[24px] bg-[#1E2139]">
                {displaySubCategory?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displaySubCategory.image}
                    alt={displaySubCategory?.name || "Gift preview"}
                    className="h-60 w-full object-cover opacity-40"
                  />
                ) : (
                  <div className="h-60 w-full bg-[radial-gradient(circle_at_top_left,rgba(83,92,151,0.85),rgba(30,33,57,1)_50%,rgba(17,20,39,1)_100%)]" />
                )}

                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px] opacity-45" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(9,10,24,0.78)]" />

                <button
                  type="button"
                  onClick={handleOccasionEdit}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#ED457D] shadow-sm transition hover:scale-105"
                  aria-label="Edit gift design"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                  <p className="text-sm font-medium text-white/90">{previewCaption}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailTile
                  label="Brand"
                  value={getBrandDisplayName(displayBrand)}
                  media={displayBrand?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayBrand.logo}
                      alt={getBrandDisplayName(displayBrand)}
                      className="h-12 w-12 shrink-0 rounded-xl border border-[#F1F1F4] bg-white object-contain"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-xs font-semibold text-white">
                      {getBrandDisplayName(displayBrand).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  onEdit={handleBrandEdit}
                />

                <DetailTile
                  label="Amount"
                  value={selectedAmountLabel}
                  icon={Gift}
                  accentClass="bg-[#fbe4e8] text-[#ED457D]"
                  onEdit={handleAmountEdit}
                />

                {isBulkMode ? (
                  <DetailTile
                    label="Quantity"
                    value={`${quantity} voucher${quantity > 1 ? "s" : ""}`}
                    icon={Users}
                    accentClass="bg-[#EEF5FF] text-[#2563EB]"
                    onEdit={handleAmountEdit}
                  />
                ) : null}

                <DetailTile
                  label="Delivery"
                  value={displayDeliveryTileValue}
                  helperText={displayDeliveryTileHelper}
                  icon={Mail}
                  media={renderDeliveryMedia(isBulkMode ? "email" : displayDeliveryMethod)}
                  onEdit={handleDeliveryEdit}
                />

                {showTimingTile ? (
                  <DetailTile
                    label="Timing"
                    value={formatTimingSummary(displayTiming)}
                    icon={Clock3}
                    accentClass="bg-[#FFF4F1] text-[#F97316]"
                    onEdit={handleTimingEdit}
                  />
                ) : null}

              </div>

              <div className="mt-3 rounded-2xl border border-[#EFEFF4] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
                <div className="flex items-start gap-3">
                 
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2"> <Heart className="h-4 w-4 text-[#1A1A1A]" /> Personal message</p>
                      <button
                        type="button"
                        onClick={handleMessageEdit}
                        className="flex items-center gap-1 rounded-full border border-[#FFD4E0] bg-[#FFF7FA] px-3 py-1.5 text-xs font-semibold text-[#ED457D] transition hover:border-[#ED457D]"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    </div>
                    <p className="mt-2 text-sm italic text-[#5F5F69]">
                      &quot;{displayMessage || "No personal message added yet."}&quot;
                    </p>
                  </div>
                </div>
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
                      setPromoError("");
                      setPromoSuccessMessage("");
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
                      {isApplyingPromo ? "Applying..." : "Apply"}
                    </button>
                  )}
                </div>

                {appliedPromo ? (
                  <div className="mt-3 rounded-2xl border border-[#F9C8D7] bg-[#FFF7FA] px-4 py-3">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {appliedPromo.code} applied
                    </p>
                    <p className="text-sm text-[#ED457D]">
                      You saved {formatCurrencyValue(appliedPromo.discountAmount, currentCurrency)}
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
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </span>
              <div>
                <p className="font-semibold text-red-800">Payment Error</p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.16em] text-red-500">
                  Action failed
                </p>
                <p className="mt-0.5 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showIdentityChoiceModal ? (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4">
          <CheckoutIdentityChoiceModal
            onClose={closeIdentityModals}
            onContinueAsGuest={openGuestModal}
            onSignIn={() => openAuthModal("login", "payment")}
            onSignUp={() => openAuthModal("signup", "payment")}
          />
        </div>
      ) : null}

      {showAuthModal ? (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4">
          <AuthForm
            type={authMode}
            mode="modal"
            onClose={closeIdentityModals}
            onAuthSuccess={handleAuthSuccess}
            initialEmail={guestCheckout?.email || deliveryDetails?.yourEmailAddress || ""}
            initialName={guestCheckout?.fullName || deliveryDetails?.yourFullName || ""}
            showSignupSuccessStep
          />
        </div>
      ) : null}

      {showGuestModal ? (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-[#FFF9FA] p-8 shadow-2xl">
            <button
              type="button"
              onClick={closeIdentityModals}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="mb-7 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Pay as Guest</h2>
              <p className="text-sm text-gray-600">
                Enter your name and email to continue checkout without creating an account.
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleGuestCheckoutSubmit}>
              <input
                type="text"
                value={guestFormData.fullName}
                onChange={(event) => {
                  setGuestFormData((previous) => ({ ...previous, fullName: event.target.value }));
                  setGuestFormError("");
                }}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <input
                type="email"
                value={guestFormData.email}
                onChange={(event) => {
                  setGuestFormData((previous) => ({ ...previous, email: event.target.value }));
                  setGuestFormError("");
                }}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />

              {guestFormError ? (
                <p className="text-sm text-red-600">{guestFormError}</p>
              ) : null}

              <button
                type="submit"
                className="group flex min-w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-orange-500 hover:to-pink-500 hover:shadow-xl md:px-8 md:py-4 md:text-base"
              >
                Continue to Payment
                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  openAuthModal("login", "payment");
                }}
                className="w-full rounded-full border-2 border-pink-500 py-3.5 font-semibold text-pink-500 transition hover:bg-pink-50"
              >
                Sign in to account
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PaymentStep;
