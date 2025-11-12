import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Shield, Check, CreditCard, Gift, Printer, Download, Package } from "lucide-react";
import { goBack, setSelectedPaymentMethod } from "../../../redux/giftFlowSlice";
import { createOrder } from "../../../lib/action/orderAction";
import toast, { Toaster } from 'react-hot-toast';
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "../../../lib/convertToSubcurrency";
import { useSearchParams } from "next/navigation";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Print Gift Card Component
const PrintableGiftCard = React.forwardRef(({ order, voucherCode, GiftCode, selectedBrand, selectedAmount, personalMessage, deliveryDetails }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
      <div className="border-4 border-red-500 rounded-3xl p-8 bg-gradient-to-br from-red-50 to-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full opacity-20 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-200 rounded-full opacity-20 -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500 rounded-full mb-4">
              {selectedBrand?.logo ? (
                <img src={selectedBrand.logo} alt={selectedBrand.brandName} className="w-20 h-20 object-cover rounded-full" />
              ) : (
                <Gift className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Gift Card</h1>
            <p className="text-xl text-gray-600">{selectedBrand?.brandName || 'Digital Gift Card'}</p>
          </div>

          <div className="text-center mb-8">
            <div className="inline-block bg-white rounded-2xl px-12 py-6 shadow-lg">
              <p className="text-5xl font-bold text-red-500">
                {selectedAmount?.currency || '$'}{selectedAmount?.value || order?.amount}
              </p>
            </div>
          </div>

          {personalMessage && (
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <p className="text-center text-gray-700 text-lg italic">"{personalMessage}"</p>
              {deliveryDetails?.yourFullName && (
                <p className="text-center text-gray-600 mt-3">- {deliveryDetails.yourFullName}</p>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <p className="text-sm text-gray-600 text-center mb-2">Gift Card Code</p>
            {order.deliveryMethod == "print" ? (
              <p className="text-3xl font-mono font-bold text-center text-gray-800 tracking-wider">
                {GiftCode || voucherCode?.code || '****-****-****'}
              </p>
            ) : (
              <p className="text-3xl font-mono font-bold text-center text-gray-800 tracking-wider">
                {voucherCode?.code || '****-****-****'}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <p className="text-sm text-gray-600 mb-2">To:</p>
            <p className="text-xl font-semibold text-gray-800">
              {deliveryDetails?.recipientFullName || deliveryDetails?.recipientName || 'Valued Customer'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-xs text-gray-600 mb-1">Order Number</p>
              <p className="text-sm font-semibold text-gray-800">{order?.orderNumber}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-xs text-gray-600 mb-1">Valid Until</p>
              <p className="text-sm font-semibold text-gray-800">
                {voucherCode?.expiresAt
                  ? new Date(voucherCode.expiresAt).toLocaleDateString()
                  : 'No Expiry'
                }
              </p>
            </div>
          </div>

          {voucherCode?.tokenizedLink && (
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <p className="text-xs text-gray-600 mb-2">Redeem Online</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {voucherCode.tokenizedLink}
              </p>
            </div>
          )}

          <div className="text-center mt-8 text-sm text-gray-600">
            <p>Thank you for choosing {selectedBrand?.brandName || 'our gift card'}!</p>
            <p className="mt-2">For support, please contact customer service</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-600 space-y-2">
        <p className="font-semibold">Terms & Conditions:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>This gift card is valid for one-time use only</li>
          <li>Gift cards cannot be redeemed for cash</li>
          <li>Lost or stolen gift cards cannot be replaced</li>
          <li>Check balance and terms at the merchant's website</li>
          <li>This gift card is issued by {selectedBrand?.brandName}</li>
        </ul>
      </div>
    </div>
  );
});

PrintableGiftCard.displayName = 'PrintableGiftCard';

// Stripe Card Payment Component
const StripeCardPayment = ({ total, isProcessing, onPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);

  const handleCardPayment = async () => {
    if (!stripe || !elements) return;

    setCardError(null);
    const cardElement = elements.getElement(CardElement);

    try {
      const { error, token } = await stripe.createToken(cardElement);
      if (error) {
        setCardError(error.message);
        toast.error(error.message);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/process-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.id,
          amount: total,
          currency: 'usd',
        }),
      });

      const result = await response.json();

      if (result.success) {
        await onPayment({
          method: 'card',
          token: token.id,
          chargeId: result.chargeId,
          brand: token.card.brand,
          last4: token.card.last4
        });
      } else {
        setCardError(result.error || 'Payment failed');
        toast.error(result.error || 'Payment failed');
      }
    } catch (err) {
      setCardError("Payment failed. Please try again.");
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
          }}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500" />
        <span className="text-sm text-gray-700">Securely save this card for future gifts</span>
      </label>

      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {cardError}
        </div>
      )}

      <button
        onClick={handleCardPayment}
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Make Payment</span>
            <span>▶</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-600">
        By completing this payment, you agree to spread joy<br />and make someone's day special!
      </p>
    </div>
  );
};

// Main Payment Step Component
const PaymentStep = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [voucherCode, setVoucherCode] = useState(null);
  const [GiftCode, setGiftCode] = useState(null);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('card');
  const printRef = useRef();

  const {
    selectedBrand,
    selectedAmount: giftFlowAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
  } = useSelector((state) => state.giftFlowReducer);

  const { bulkItems } = useSelector((state) => state.cart);
  const currentBulkOrder = isBulkMode && bulkItems.length > 0 ? bulkItems[bulkItems.length - 1] : null;

  const selectedAmount = isBulkMode && currentBulkOrder ? currentBulkOrder.selectedAmount : giftFlowAmount;
  const quantity = isBulkMode && currentBulkOrder ? currentBulkOrder.quantity : 1;
  const companyInfo = isBulkMode && currentBulkOrder ? currentBulkOrder.companyInfo : null;
  const bulkDeliveryOption = isBulkMode && currentBulkOrder ? currentBulkOrder.deliveryOption : null;

  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency}${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    return Math.round(totalAmount * 0.03);
  };

  const calculateTotal = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    const serviceFee = calculateServiceFee();
    return totalAmount + serviceFee;
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=800,height=600');
    windowPrint.document.write('<html><head><title>Gift Card</title>');
    windowPrint.document.write('<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;}@media print{body{margin:0;}}</style>');
    windowPrint.document.write('</head><body>');
    windowPrint.document.write(printContent.innerHTML);
    windowPrint.document.write('</body></html>');
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    toast.loading('Generating PDF...');
    try {
      handlePrint();
      toast.dismiss();
      toast.success('Use "Save as PDF" in the print dialog');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  const handlePayment = async (paymentData) => {
    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Processing your order...');

    try {
      const orderData = isBulkMode ? {
        selectedBrand,
        selectedAmount,
        quantity,
        companyInfo,
        deliveryOption: bulkDeliveryOption,
        selectedPaymentMethod: 'card',
        paymentData,
        totalAmount: calculateTotal(),
        isBulkOrder: true,
        totalSpend: currentBulkOrder.totalSpend,
      } : {
        selectedBrand,
        selectedAmount,
        personalMessage,
        deliveryMethod,
        deliveryDetails,
        selectedOccasion,
        selectedSubCategory,
        selectedTiming,
        selectedPaymentMethod: 'card',
        paymentData,
        totalAmount: calculateTotal(),
        isBulkOrder: false,
      };

      const result = await createOrder(orderData);
      if (result?.success) {
        setOrder(result?.data?.order);
        setVoucherCode(result?.data?.voucherCode);
        setGiftCode(result?.data?.giftCard?.code);
        toast.success(isBulkMode ? 'Bulk order placed successfully!' : 'Order placed successfully!', { id: toastId });
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

  if (order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 md:p-6">
        <Toaster />
        <div className="max-w-2xl mx-auto mb-6 print:hidden">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              {isBulkMode 
                ? `Your bulk order of ${quantity} gift cards has been placed successfully.`
                : 'Your order has been placed successfully.'}
            </p>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4 text-left mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Number:</span>
                <span className="font-semibold text-gray-800">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold text-gray-800">{order.currency} {order.totalAmount}</span>
              </div>
              {isBulkMode && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-semibold text-gray-800">{quantity} vouchers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Company:</span>
                    <span className="font-semibold text-gray-800">{companyInfo?.companyName}</span>
                  </div>
                </>
              )}
            </div>

            {!isBulkMode && deliveryMethod === 'print' && (
              <div className="flex gap-3 mb-6">
                <button onClick={handlePrint} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                  <Printer className="w-5 h-5" />
                  Print Gift Card
                </button>
                <button onClick={handleDownloadPDF} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            )}

            {isBulkMode && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📧 Your voucher codes will be sent to <strong>{companyInfo?.contactEmail}</strong> within minutes.
                </p>
              </div>
            )}

            <button onClick={() => window.location.reload()} className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200">
              {isBulkMode ? 'Create Another Bulk Order' : 'Send Another Gift'}
            </button>
          </div>
        </div>

        {!isBulkMode && (
          <>
            <div className="hidden print:block">
              <PrintableGiftCard ref={printRef} order={order} voucherCode={voucherCode} GiftCode={GiftCode} selectedBrand={selectedBrand} selectedAmount={selectedAmount} personalMessage={personalMessage} deliveryDetails={deliveryDetails} />
            </div>
            <div className="print:hidden">
              <PrintableGiftCard ref={printRef} order={order} voucherCode={voucherCode} GiftCode={GiftCode} selectedBrand={selectedBrand} selectedAmount={selectedAmount} personalMessage={personalMessage} deliveryDetails={deliveryDetails} />
            </div>
          </>
        )}
      </div>
    );
  }

  const getDeliveryIcon = () => {
    if (isBulkMode) {
      return bulkDeliveryOption === 'csv' ? '📊' : bulkDeliveryOption === 'email' ? '📧' : '🎁';
    }
    return deliveryMethod === 'email' ? '📧' : deliveryMethod === 'whatsapp' ? '💬' : '🖨️';
  };

  const getDeliveryText = () => {
    if (isBulkMode) {
      return bulkDeliveryOption === 'csv' ? 'CSV' : bulkDeliveryOption === 'email' ? 'Email' : 'Multiple Recipients';
    }
    return deliveryMethod === 'email' ? 'Email' : deliveryMethod === 'whatsapp' ? 'WhatsApp' : 'Print';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button onClick={() => dispatch(goBack())} className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Previous</span>
          </button>

          {isBulkMode && (
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-1.5 bg-pink-100 border border-pink-300 rounded-full">
                <span className="text-pink-600 font-semibold text-sm">Bulk Gifting</span>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            {isBulkMode ? 'Complete your payment securely' : "You're almost there!"}
          </h1>
          <p className="text-gray-600 text-center">
            {isBulkMode 
              ? 'Your vouchers will be generated instantly after payment'
              : "Let's deliver your beautiful gift and make someone's day absolutely wonderful"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Payment Method */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Choose Your Payment Method</h2>
                  <p className="text-sm text-gray-600">Select how you'd like to complete this transaction</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-5">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700 font-medium">Your payment is 100% secure and encrypted</span>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setSelectedPaymentTab('payfast')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedPaymentTab === 'payfast' ? 'border-gray-300 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-600 rounded-full"></div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">PayFast</p>
                    <p className="text-xs text-gray-600">Trusted South African...</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPaymentTab('card')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedPaymentTab === 'card' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Card</p>
                    <p className="text-xs text-gray-600">Visa, Mastercard</p>
                  </div>
                </button>
              </div>

              {selectedPaymentTab === 'card' && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    mode: "payment",
                    amount: convertToSubcurrency(calculateTotal()),
                    currency: "usd",
                  }}
                >
                  <StripeCardPayment
                    total={convertToSubcurrency(calculateTotal())}
                    isProcessing={isProcessing}
                    onPayment={handlePayment}
                  />
                </Elements>
              )}
            </div>
          </div>

          {/* Right Column - Gift Details & Summary */}
          <div className="space-y-6">
            {/* Your Beautiful Gift / Bulk Order */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{isBulkMode ? 'Your Bulk Order' : 'Your Beautiful Gift'}</h2>
                  <p className="text-sm text-gray-600">{isBulkMode ? 'Ready to be delivered' : 'Ready to make someone smile'}</p>
                </div>
              </div>

              {/* Brand Display */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                <div className="w-16 h-16 flex-shrink-0">
                  {selectedBrand?.logo ? (
                    <img src={selectedBrand.logo} alt={selectedBrand.brandName} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{(selectedBrand?.brandName || 'B').substring(0, 1).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{selectedBrand?.brandName || 'Gift Card'}</h3>
                  <p className="text-sm text-gray-600">{isBulkMode ? `${quantity} Vouchers` : selectedOccasion?.name || 'Gift'}</p>
                  <p className="font-bold text-pink-600 mt-1">{formatAmount(selectedAmount)}</p>
                </div>
              </div>

              {/* Personal Message for Single Gift */}
              {!isBulkMode && personalMessage && (
                <div className="p-4 bg-gray-50 rounded-xl mb-4 border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-800 italic leading-relaxed">"{personalMessage}"</p>
                </div>
              )}

              {/* Delivery Info */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-2xl">{getDeliveryIcon()}</span>
                <div>
                  <p className="text-sm font-semibold text-green-800">Delivering via {getDeliveryText()}</p>
                  <p className="text-xs text-green-700">
                    {isBulkMode 
                      ? `to ${companyInfo?.contactEmail || 'your email'}`
                      : deliveryMethod === 'email' 
                        ? `to ${deliveryDetails?.recipientEmailAddress || 'Friend'}`
                        : deliveryMethod === 'whatsapp'
                          ? 'to Friend'
                          : 'Print at home'}
                  </p>
                </div>
              </div>

              {/* Promocode */}
              {!isBulkMode && (
                <div className="mt-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <span className="text-red-500">🎟️</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Promocode" 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900" 
                      />
                    </div>
                    <button className="px-6 py-2.5 bg-white border border-pink-500 text-pink-500 font-semibold rounded-lg hover:bg-pink-50 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Payment summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-gray-700">
                  <span>{isBulkMode ? 'Gift Card Value' : 'Gift Card Value'}</span>
                  <span className="font-semibold">{formatAmount(selectedAmount)}</span>
                </div>
                {isBulkMode && (
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Quantity</span>
                    <span className="font-semibold">{quantity} vouchers</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-700">
                  <span>Service Fee</span>
                  <span className="font-semibold">{selectedAmount?.currency}{calculateServiceFee()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-red-500">{selectedAmount?.currency}{calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* Additional Info for Bulk Orders */}
            {isBulkMode && companyInfo && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-4">Company Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-semibold text-gray-900">{companyInfo.companyName}</span>
                  </div>
                  {companyInfo.vatNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT Number:</span>
                      <span className="font-semibold text-gray-900">{companyInfo.vatNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-semibold text-gray-900">{companyInfo.contactNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900 break-all">{companyInfo.contactEmail}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 max-w-6xl mx-auto">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <p className="font-semibold text-red-800">Payment Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;