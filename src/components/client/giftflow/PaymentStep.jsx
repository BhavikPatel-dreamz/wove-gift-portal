import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Shield, Check, CreditCard, Gift, Printer, Download } from "lucide-react";
import { goBack, setSelectedPaymentMethod } from "../../../redux/giftFlowSlice";
import { createOrder } from "../../../lib/action/orderAction";
import toast, { Toaster } from 'react-hot-toast';
import { MessageCircle } from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "../../../lib/convertToSubcurrency";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Print Gift Card Component
const PrintableGiftCard = React.forwardRef(({ order, voucherCode, GiftCode, selectedBrand, selectedAmount, personalMessage, deliveryDetails }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
      {/* Gift Card Design */}
      <div className="border-4 border-red-500 rounded-3xl p-8 bg-gradient-to-br from-red-50 to-pink-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full opacity-20 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-200 rounded-full opacity-20 -ml-24 -mb-24"></div>

        <div className="relative z-10">
          {/* Header */}
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

          {/* Amount */}
          <div className="text-center mb-8">
            <div className="inline-block bg-white rounded-2xl px-12 py-6 shadow-lg">
              <p className="text-5xl font-bold text-red-500">
                {selectedAmount?.currency || '$'}{selectedAmount?.value || order?.amount}
              </p>
            </div>
          </div>

          {/* Personal Message */}
          {personalMessage && (
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <p className="text-center text-gray-700 text-lg italic">"{personalMessage}"</p>
              {deliveryDetails?.yourFullName && (
                <p className="text-center text-gray-600 mt-3">- {deliveryDetails.yourFullName}</p>
              )}
            </div>
          )}

          {/* Voucher Code */}
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

          {/* Recipient Info */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <p className="text-sm text-gray-600 mb-2">To:</p>
            <p className="text-xl font-semibold text-gray-800">
              {deliveryDetails?.recipientFullName || deliveryDetails?.recipientName || 'Valued Customer'}
            </p>
          </div>

          {/* Order Details */}
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

          {/* Redemption Link */}
          {voucherCode?.tokenizedLink && (
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <p className="text-xs text-gray-600 mb-2">Redeem Online</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {voucherCode.tokenizedLink}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-600">
            <p>Thank you for choosing {selectedBrand?.brandName || 'our gift card'}!</p>
            <p className="mt-2">For support, please contact customer service</p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions (Print Only) */}
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
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">Card Details</label>
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
          className="p-3 border border-gray-300 rounded-lg"
        />
      </div>
      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {cardError}
        </div>
      )}
      <button
        onClick={handleCardPayment}
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Pay ${(total / 100).toFixed(2)}</span>
          </>
        )}
      </button>
    </div>
  );
};

// Main Payment Step Component
const PaymentStep = () => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [voucherCode, setVoucherCode] = useState(null);
  const [GiftCode, setGiftCode] = useState(null);
  const printRef = useRef();

  const {
    selectedBrand,
    selectedAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
  } = useSelector((state) => state.giftFlowReducer);

  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = selectedAmount?.value || 0;
    return Math.round(baseAmount * 0.03);
  };

  const calculateTotal = () => {
    const baseAmount = selectedAmount?.value || 0;
    const serviceFee = calculateServiceFee();
    return baseAmount + serviceFee;
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
      // Here you would typically use a library like jsPDF or html2pdf
      // For now, we'll trigger print which allows "Save as PDF"
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
      const orderData = {
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
      };

      const result = await createOrder(orderData);
      if (result?.success) {
        setOrder(result?.data?.order);
        setVoucherCode(result?.data?.voucherCode);
        setGiftCode(result?.data?.giftCard?.code)
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

  if (order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 md:p-6">
        <Toaster />

        {/* Success Message - Only visible on screen */}
        <div className="max-w-2xl mx-auto mb-6 print:hidden">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4 text-left mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Number:</span>
                <span className="font-semibold text-gray-800">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold text-gray-800">{order.currency} {order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Method:</span>
                <span className="font-semibold text-gray-800 capitalize">{order.deliveryMethod}</span>
              </div>
            </div>

            {deliveryMethod === 'print' && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print Gift Card
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
            >
              Send Another Gift
            </button>
          </div>
        </div>

        {/* Printable Gift Card */}
        <div className="hidden print:block">
          <PrintableGiftCard
            ref={printRef}
            order={order}
            voucherCode={voucherCode}
            GiftCode={GiftCode}
            selectedBrand={selectedBrand}
            selectedAmount={selectedAmount}
            personalMessage={personalMessage}
            deliveryDetails={deliveryDetails}
          />
        </div>

        {/* Preview - Only visible on screen */}
        <div className="print:hidden">
          <PrintableGiftCard
            ref={printRef}
            order={order}
            voucherCode={voucherCode}
            GiftCode={GiftCode}
            selectedBrand={selectedBrand}
            selectedAmount={selectedAmount}
            personalMessage={personalMessage}
            deliveryDetails={deliveryDetails}
          />
        </div>
      </div>
    );
  }

  const getDeliveryIcon = () => {
    switch (deliveryMethod) {
      case 'email':
        return '📧';
      case 'whatsapp':
        return '💬';
      case 'print':
        return '🖨️';
      default:
        return '📱';
    }
  };

  const getDeliveryText = () => {
    switch (deliveryMethod) {
      case 'email':
        return 'Email';
      case 'whatsapp':
        return 'WhatsApp';
      case 'print':
        return 'Print at Home';
      default:
        return deliveryMethod;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => dispatch(goBack())}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Previous</span>
          </button>

          <h1 className="text-4xl font-bold text-gray-900">You're almost there!</h1>
          <p className="text-gray-600 mt-2">Let's deliver your beautiful gift and make someone's day absolutely wonderful</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-pink-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Secure card payment</p>

              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start">
                <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">Your payment is 100% secure and encrypted</span>
              </div>

              <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm">Credit or Debit Card</h4>
                    <p className="text-xs text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
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
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Gift className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Your Beautiful Gift</h3>
                <span className="ml-auto text-2xl">🎁</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Ready to make someone smile</p>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
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
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedBrand?.brandName || 'Gift Card'}</h4>
                    <span className="text-lg font-bold text-gray-900">{formatAmount(selectedAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  "{personalMessage}"
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-2xl">{getDeliveryIcon()}</span>
                <span className="text-sm text-green-700">
                  <span className="font-semibold">Delivering via {getDeliveryText()}</span>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Payment summary</h3>

              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gift Card Value</span>
                  <span className="font-semibold text-gray-900">{formatAmount(selectedAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Fee (3%)</span>
                  <span className="font-semibold text-gray-900">{selectedAmount?.currency}{calculateServiceFee()}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-2xl font-bold text-gray-900">{selectedAmount?.currency}{calculateTotal()}</span>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;