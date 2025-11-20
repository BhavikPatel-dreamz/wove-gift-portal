import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Shield, Check, CreditCard, Gift, Printer, Download, Package } from "lucide-react";
import { goBack, goNext, setSelectedPaymentMethod } from "../../../redux/giftFlowSlice";
import { createOrder } from "../../../lib/action/orderAction";
import toast, { Toaster } from 'react-hot-toast';
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "../../../lib/convertToSubcurrency";
import { useSearchParams } from "next/navigation";
import GiftSmallIcon from "../../../icons/GiftSmallIcon"
import WhatsupIcon from "../../../icons/WhatsupIcon";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Print Gift Card Component
// const PrintableGiftCard = React.forwardRef(({ order, voucherCode, GiftCode, selectedBrand, selectedAmount, personalMessage, deliveryDetails }, ref) => {
//   return (
//     <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
//       <div className="border-4 border-red-500 rounded-3xl p-8 bg-gradient-to-br from-red-50 to-pink-50 relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full opacity-20 -mr-32 -mt-32"></div>
//         <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-200 rounded-full opacity-20 -ml-24 -mb-24"></div>

//         <div className="relative z-10">
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500 rounded-full mb-4">
//               {selectedBrand?.logo ? (
//                 <img src={selectedBrand.logo} alt={selectedBrand.brandName} className="w-20 h-20 object-cover rounded-full" />
//               ) : (
//                 <Gift className="w-12 h-12 text-white" />
//               )}
//             </div>
//             <h1 className="text-4xl font-bold text-gray-800 mb-2">Gift Card</h1>
//             <p className="text-xl text-gray-600">{selectedBrand?.brandName || 'Digital Gift Card'}</p>
//           </div>

//           <div className="text-center mb-8">
//             <div className="inline-block bg-white rounded-2xl px-12 py-6 shadow-lg">
//               <p className="text-5xl font-bold text-red-500">
//                 {selectedAmount?.currency || '$'}{selectedAmount?.value || order?.amount}
//               </p>
//             </div>
//           </div>

//           {personalMessage && (
//             <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
//               <p className="text-center text-gray-700 text-lg italic">"{personalMessage}"</p>
//               {deliveryDetails?.yourFullName && (
//                 <p className="text-center text-gray-600 mt-3">- {deliveryDetails.yourFullName}</p>
//               )}
//             </div>
//           )}

//           <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
//             <p className="text-sm text-gray-600 text-center mb-2">Gift Card Code</p>
//             {order.deliveryMethod == "print" ? (
//               <p className="text-3xl font-mono font-bold text-center text-gray-800 tracking-wider">
//                 {GiftCode || voucherCode?.code || '****-****-****'}
//               </p>
//             ) : (
//               <p className="text-3xl font-mono font-bold text-center text-gray-800 tracking-wider">
//                 {voucherCode?.code || '****-****-****'}
//               </p>
//             )}
//           </div>

//           <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
//             <p className="text-sm text-gray-600 mb-2">To:</p>
//             <p className="text-xl font-semibold text-gray-800">
//               {deliveryDetails?.recipientFullName || deliveryDetails?.recipientName || 'Valued Customer'}
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <div className="bg-white rounded-xl p-4 shadow-md">
//               <p className="text-xs text-gray-600 mb-1">Order Number</p>
//               <p className="text-sm font-semibold text-gray-800">{order?.orderNumber}</p>
//             </div>
//             <div className="bg-white rounded-xl p-4 shadow-md">
//               <p className="text-xs text-gray-600 mb-1">Valid Until</p>
//               <p className="text-sm font-semibold text-gray-800">
//                 {voucherCode?.expiresAt
//                   ? new Date(voucherCode.expiresAt).toLocaleDateString()
//                   : 'No Expiry'
//                 }
//               </p>
//             </div>
//           </div>

//           {voucherCode?.tokenizedLink && (
//             <div className="bg-white rounded-xl p-4 shadow-md text-center">
//               <p className="text-xs text-gray-600 mb-2">Redeem Online</p>
//               <p className="text-xs font-mono text-gray-700 break-all">
//                 {voucherCode.tokenizedLink}
//               </p>
//             </div>
//           )}

//           <div className="text-center mt-8 text-sm text-gray-600">
//             <p>Thank you for choosing {selectedBrand?.brandName || 'our gift card'}!</p>
//             <p className="mt-2">For support, please contact customer service</p>
//           </div>
//         </div>
//       </div>

//       <div className="mt-8 text-xs text-gray-600 space-y-2">
//         <p className="font-semibold">Terms & Conditions:</p>
//         <ul className="list-disc list-inside space-y-1 ml-2">
//           <li>This gift card is valid for one-time use only</li>
//           <li>Gift cards cannot be redeemed for cash</li>
//           <li>Lost or stolen gift cards cannot be replaced</li>
//           <li>Check balance and terms at the merchant's website</li>
//           <li>This gift card is issued by {selectedBrand?.brandName}</li>
//         </ul>
//       </div>
//     </div>
//   );
// });

// PrintableGiftCard.displayName = 'PrintableGiftCard';

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
  const [showThankYou, setShowThankYou] = useState(false);
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
    selectedOccasionName
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
        personalMessage,
        quantity,
        companyInfo,
        deliveryOption: bulkDeliveryOption,
        selectedOccasion,
        selectedSubCategory,
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

  const handleNext = () => {
    //  dispatch(goNext());
    setShowThankYou(true)
  }
  console.log(showThankYou, "show")

  if (order) {
    return (
      <>
        {
          !showThankYou ? (
            <div className="min-h-screen px-4 py-30 md:px-6 md:py-30">
              <Toaster />
              <div className="max-w-[1440px] mx-auto mb-6 print:hidden relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-3/4 rounded-2xl p-8 text-center">
                  {/* <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div> */}
                  <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">Gift Sent Successfully</h1>
                  <p className="font-normal text-[16px] text-[#4A4A4A] mb-6">
                    {/* {isBulkMode
              ? `Your bulk order of ${quantity} gift cards has been placed successfully.`
              : 'Your order has been placed successfully.'} */}
                    Your beautiful H&M gift card is on its way to Friend!
                  </p>

                  {/* <div className="bg-gray-50 rounded-xl p-6 space-y-4 text-left mb-6">
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
          </div> */}
                  {/* 
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
          )} */}

                  {isBulkMode && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        📧 Your voucher codes will be sent to <strong>{companyInfo?.contactEmail}</strong> within minutes.
                      </p>
                    </div>
                  )}

                  <div className="w-full flex justify-center">
                    <button onClick={() => handleNext()} className="w-fit cursor-pointer rounded-[50px] flex gap-3 items-center justify-center text-white py-3 px-6  font-semibold transition-all duration-200 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)]">
                      {isBulkMode ? 'Create Another Bulk Order' : 'Send Another Gift'}
                      <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                      </svg>

                    </button>
                  </div>
                </div>
              </div>


              {/* {!isBulkMode && (
        <>
          <div className="hidden print:block">
            <PrintableGiftCard ref={printRef} order={order} voucherCode={voucherCode} GiftCode={GiftCode} selectedBrand={selectedBrand} selectedAmount={selectedAmount} personalMessage={personalMessage} deliveryDetails={deliveryDetails} />
          </div>
          <div className="print:hidden">
            <PrintableGiftCard ref={printRef} order={order} voucherCode={voucherCode} GiftCode={GiftCode} selectedBrand={selectedBrand} selectedAmount={selectedAmount} personalMessage={personalMessage} deliveryDetails={deliveryDetails} />
          </div>
        </>
      )} */}
            </div>) : (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="rounded-2xl p-12  text-center">
                <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">
                  Thanks for your purchase!
                </h1>
                <p className="text-[#4A4A4A] font-medium text-[16px] mb-6">
                  Create your account now to track your order and access exclusive rewards.
                </p>
                <div className="w-full flex justify-center ">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white rounded-full font-semibold hover:shadow-lg transition-all flex gap-3 items-center cursor-pointer"
                  >
                    Send Another Gift
                    <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        }

      </>
    )

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
    <div className="min-h-screen bg-gray-50 px-4 py-30 md:px-8 md:py-30">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
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
                <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30.6673 9.33334V26.6667H5.33398V24H28.0007V9.33334H30.6673ZM25.334 21.3333H1.33398V5.33334H25.334V21.3333ZM17.334 13.3333C17.334 11.12 15.5473 9.33334 13.334 9.33334C11.1207 9.33334 9.33398 11.12 9.33398 13.3333C9.33398 15.5467 11.1207 17.3333 13.334 17.3333C15.5473 17.3333 17.334 15.5467 17.334 13.3333Z" fill="url(#paint0_linear_2267_1209)" />
                    <defs>
                      <linearGradient id="paint0_linear_2267_1209" x1="1.33398" y1="13.1824" x2="25.6556" y2="28.1134" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ED457D" />
                        <stop offset="1" stopColor="#FA8F42" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Choose Your Payment Method</h2>
                  <p className="text-sm text-gray-600">Select how you'd like to complete this transaction</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 mb-6 w-fit m-auto rounded-[50px]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 0L2 3.27273C2 3.27273 2 6.54545 2 8.18182C2 14.5882 7.00811 17.5795 9 18C10.9919 17.5795 16 14.5882 16 8.18182C16 6.54545 16 3.27273 16 3.27273L9 0ZM8.22222 12.6115L4.96722 9.18736L6.067 8.03045L8.22222 10.2976L12.7271 5.55873L13.8269 6.71564L8.22222 12.6115Z" fill="#39AE41" />
                </svg>

                <span className="text-sm font-semibold text-[#39AE41]">
                  Your payment is 100% secure and encrypted
                </span>
              </div>
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => setSelectedPaymentTab('payfast')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${selectedPaymentTab === 'payfast' ? 'border-[#2563EB] bg-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M29.3321 16C29.3321 17.7511 28.9872 19.485 28.3171 21.1027C27.647 22.7205 26.6648 24.1904 25.4266 25.4286C24.1884 26.6668 22.7185 27.6489 21.1008 28.319C19.483 28.9891 17.7491 29.334 15.9981 29.334C14.247 29.334 12.5131 28.9891 10.8954 28.319C9.27761 27.6489 7.80768 26.6668 6.5695 25.4286C5.33132 24.1904 4.34915 22.7205 3.67905 21.1027C3.00896 19.485 2.66406 17.7511 2.66406 16C2.66406 12.4636 4.06889 9.07206 6.5695 6.57145C9.07011 4.07084 12.4617 2.66602 15.9981 2.66602C19.5345 2.66602 22.926 4.07084 25.4266 6.57145C27.9272 9.07206 29.3321 12.4636 29.3321 16Z" stroke="#2563EB" strokeWidth="2" />
                      <path d="M21.3308 15.9998C21.3308 17.7505 21.1921 19.4852 20.9241 21.1025C20.6575 22.7198 20.2641 24.1892 19.7681 25.4278C19.2735 26.6665 18.6855 27.6478 18.0388 28.3185C17.3908 28.9878 16.6975 29.3332 15.9975 29.3332C15.2975 29.3332 14.6041 28.9878 13.9575 28.3185C13.3095 27.6478 12.7215 26.6652 12.2268 25.4278C11.7308 24.1892 11.3375 22.7212 11.0695 21.1025C10.796 19.4154 10.6604 17.7089 10.6641 15.9998C10.6641 14.2492 10.8015 12.5145 11.0695 10.8972C11.3375 9.27984 11.7308 7.8105 12.2268 6.57184C12.7215 5.33317 13.3095 4.35184 13.9561 3.68117C14.6041 3.01317 15.2975 2.6665 15.9975 2.6665C16.6975 2.6665 17.3908 3.01184 18.0375 3.68117C18.6855 4.35184 19.2735 5.3345 19.7681 6.57184C20.2641 7.8105 20.6575 9.2785 20.9241 10.8972C21.1935 12.5145 21.3308 14.2492 21.3308 15.9998Z" stroke="#2563EB" strokeWidth="2" />
                      <path d="M2.66406 16H29.3307" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                    </svg>

                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">PayFast</p>
                    <p className="text-xs text-gray-600">Trusted South African...</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPaymentTab('card')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${selectedPaymentTab === 'card' ? 'border-[#9333EA] bg-pink-100' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.66797 16.0002C2.66797 10.9722 2.66797 8.4575 4.23064 6.89616C5.7933 5.33483 8.30664 5.3335 13.3346 5.3335H18.668C23.696 5.3335 26.2106 5.3335 27.772 6.89616C29.3333 8.45883 29.3346 10.9722 29.3346 16.0002C29.3346 21.0282 29.3346 23.5428 27.772 25.1042C26.2093 26.6655 23.696 26.6668 18.668 26.6668H13.3346C8.30664 26.6668 5.79197 26.6668 4.23064 25.1042C2.6693 23.5415 2.66797 21.0282 2.66797 16.0002Z" stroke="#9333EA" strokeWidth="2" />
                      <path d="M13.3346 21.3335H8.0013M18.668 21.3335H16.668M2.66797 13.3335H29.3346" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
                    </svg>

                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Card</p>
                    <p className="text-xs text-gray-600">Visa, Mastercard</p>
                  </div>
                </button>
              </div>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setSelectedPaymentTab('discovery')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${selectedPaymentTab === 'discovery' ? 'border-[#20A752] bg-[#20A75214]' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="w-10 h-10 bg-[#20A75214] rounded-lg flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.2037 7.21063C13.893 4.18129 14.737 2.66663 15.9997 2.66663C17.2623 2.66663 18.1063 4.18129 19.7957 7.21063L20.233 7.99463C20.713 8.85596 20.953 9.28663 21.3263 9.57063C21.6997 9.85463 22.1663 9.95996 23.0997 10.1706L23.9477 10.3626C27.2277 11.1053 28.8663 11.476 29.257 12.7306C29.6463 13.984 28.529 15.292 26.293 17.9066L25.7143 18.5826C25.0797 19.3253 24.761 19.6973 24.6183 20.156C24.4757 20.616 24.5237 21.112 24.6197 22.1026L24.7077 23.0053C25.045 26.4946 25.2143 28.2386 24.193 29.0133C23.1717 29.788 21.6357 29.0813 18.5663 27.668L17.7703 27.3026C16.8983 26.9 16.4623 26.7 15.9997 26.7C15.537 26.7 15.101 26.9 14.229 27.3026L13.4343 27.668C10.3637 29.0813 8.82766 29.788 7.80766 29.0146C6.785 28.2386 6.95433 26.4946 7.29166 23.0053L7.37966 22.104C7.47566 21.112 7.52366 20.616 7.37966 20.1573C7.23833 19.6973 6.91966 19.3253 6.285 18.584L5.70633 17.9066C3.47033 15.2933 2.353 13.9853 2.74233 12.7306C3.13166 11.476 4.773 11.104 8.053 10.3626L8.901 10.1706C9.833 9.95996 10.2983 9.85463 10.673 9.57063C11.0477 9.28663 11.2863 8.85596 11.7663 7.99463L12.2037 7.21063Z" stroke="#20A752" strokeWidth="2" />
                    </svg>


                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Discovery Miles</p>
                    <p className="text-xs text-gray-600">Pay with your Discove...</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPaymentTab('ebucks')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${selectedPaymentTab === 'ebucks' ? 'border-[#EA580C] bg-[#EA580C14' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="w-10 h-10 bg-[#EA580C14] rounded-lg flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.33203 6.6665H30.6654V25.3332H1.33203V6.6665Z" stroke="#EA580C" strokeWidth="2" />
                      <path d="M2 11.5C3.11391 11.5 4.1822 11.0259 4.96985 10.182C5.7575 9.33807 6.2 8.19347 6.2 7M2 20.5C3.11391 20.5 4.1822 20.9741 4.96985 21.818C5.7575 22.6619 6.2 23.8065 6.2 25M30 11.5C28.8861 11.5 27.8178 11.0259 27.0302 10.182C26.2425 9.33807 25.8 8.19347 25.8 7M30 20.5C28.8861 20.5 27.8178 20.9741 27.0302 21.818C26.2425 22.6619 25.8 23.8065 25.8 25" stroke="#EA580C" strokeWidth="2" />
                      <path d="M20 16C20 18.7625 18.2093 21 16 21C13.7907 21 12 18.7625 12 16C12 13.2375 13.7907 11 16 11C18.2093 11 20 13.2375 20 16Z" stroke="#EA580C" strokeWidth="2" />
                    </svg>


                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">eBucks (FNB)</p>
                    <p className="text-xs text-gray-600">Pay with your FNB eB...</p>
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
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#1A1A1A1A]">
                <div className="w-10 h-10 bg-[linear-gradient(180deg,#FEF8F6_0%,#FDF7F8_100%)] rounded-lg flex items-center justify-center">
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.62 25.9565C1.62 26.5337 2.10263 27 2.7 27H12.3525V14.7391H1.62V25.9565ZM14.6475 27H24.3C24.8974 27 25.38 26.5337 25.38 25.9565V14.7391H14.6475V27ZM25.92 6.91304H20.9385C21.3975 6.21522 21.6675 5.38696 21.6675 4.5C21.6675 2.01848 19.5784 0 17.01 0C15.6128 0 14.3539 0.6 13.5 1.54565C12.6461 0.6 11.3873 0 9.99 0C7.42163 0 5.3325 2.01848 5.3325 4.5C5.3325 5.38696 5.59913 6.21522 6.0615 6.91304H1.08C0.482625 6.91304 0 7.37935 0 7.95652V12.5217H12.3525V6.91304H14.6475V12.5217H27V7.95652C27 7.37935 26.5174 6.91304 25.92 6.91304ZM12.3525 6.78261H9.99C8.68725 6.78261 7.6275 5.7587 7.6275 4.5C7.6275 3.2413 8.68725 2.21739 9.99 2.21739C11.2928 2.21739 12.3525 3.2413 12.3525 4.5V6.78261ZM17.01 6.78261H14.6475V4.5C14.6475 3.2413 15.7073 2.21739 17.01 2.21739C18.3127 2.21739 19.3725 3.2413 19.3725 4.5C19.3725 5.7587 18.3127 6.78261 17.01 6.78261Z" fill="url(#paint0_linear_748_1897)" />
                    <defs>
                      <linearGradient id="paint0_linear_748_1897" x1="-1.87342e-07" y1="9.93396" x2="25.7008" y2="21.4087" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ED457D" />
                        <stop offset="1" stopColor="#FA8F42" />
                      </linearGradient>
                    </defs>
                  </svg>

                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{isBulkMode ? 'Your Bulk Order' : 'Your Beautiful Gift'}</h2>
                  <p className="text-sm text-gray-600">{isBulkMode ? 'Ready to be delivered' : 'Ready to make someone smile'}</p>
                </div>
              </div>

              {/* Brand Display */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 shrink-0">
                    {selectedBrand?.logo ? (
                      <img src={selectedBrand.logo} alt={selectedBrand.brandName} className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{(selectedBrand?.brandName || 'B').substring(0, 1).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[16px] text-[#1A1A1A]">{selectedBrand?.brandName || 'Gift Card'}</h3>
                    <div className="flex items-center gap-2">
                      <GiftSmallIcon />
                      {/* <p className="text-sm text-gray-600">{isBulkMode ? `${quantity} Vouchers` : selectedOccasion?.name || 'Gift'}</p> */}
                      <p className="font-semibold text-[14px] text-[#1A1A1A] mt-1">{formatAmount(selectedAmount)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 shrink-0">
                    {selectedSubCategory?.image ? (
                      <img src={selectedSubCategory?.image} alt={selectedSubCategory?.name} className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{(selectedSubCategory?.name || 'B').substring(0, 1).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{selectedSubCategory?.name || 'Gift Card'}</h3>
                    <p className="text-sm text-gray-600">{selectedOccasionName || 'Gift'}</p>
                  </div>
                </div>
              </div>

              {/* Personal Message for Single Gift */}
              <div className="border-b border-[#1A1A1A1A] mb-5">
                {!isBulkMode && personalMessage && (
                  <div className="p-4 bg-gray-50 rounded-xl mb-4 border-2 border-dashed border-gray-300 ">
                    <p className="text-sm text-gray-800 italic leading-relaxed">"{personalMessage}"</p>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-3 ">
                <div className="w-7 h-7 bg-[#39AE41] rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_748_2009)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.0484 9.96167C10.7108 10.0996 10.4952 10.6281 10.2764 10.8982C10.1642 11.0365 10.0304 11.0581 9.85794 10.9887C8.59083 10.4839 7.6195 9.63836 6.92027 8.47228C6.80182 8.29146 6.82307 8.14862 6.96591 7.98069C7.17704 7.73194 7.44252 7.44939 7.49965 7.11423C7.62647 6.37285 6.65724 4.07309 5.37723 5.11514C1.694 8.11657 11.5215 16.077 13.2952 11.7716C13.7969 10.5512 11.6079 9.73242 11.0484 9.96167ZM8.91902 16.2798C7.61637 16.2798 6.33462 15.9335 5.21244 15.2778C5.03232 15.1723 4.81457 15.1444 4.6132 15.1991L2.17478 15.8684L3.02417 13.9971C3.08098 13.8722 3.10375 13.7345 3.09016 13.5979C3.07658 13.4613 3.02713 13.3308 2.94683 13.2195C2.03821 11.9601 1.55777 10.4731 1.55777 8.91892C1.55777 4.85977 4.85986 1.55768 8.91902 1.55768C12.9782 1.55768 16.2799 4.85977 16.2799 8.91892C16.2799 12.9777 12.9778 16.2798 8.91902 16.2798ZM8.91902 0C4.00107 0 9.77229e-05 4.00097 9.77229e-05 8.91892C9.77229e-05 10.6491 0.491335 12.3105 1.42469 13.7526L0.0697768 16.7366C0.0085519 16.8713 -0.0130189 17.0208 0.00758848 17.1674C0.0281959 17.314 0.0901292 17.4517 0.186141 17.5643C0.259367 17.6501 0.350288 17.7189 0.452649 17.7661C0.555011 17.8133 0.666385 17.8378 0.77911 17.8378C1.2815 17.8378 4.02093 16.977 4.71807 16.7857C6.00678 17.4752 7.45227 17.8378 8.91902 17.8378C13.8366 17.8378 17.8379 13.8365 17.8379 8.91892C17.8379 4.00097 13.8366 0 8.91902 0Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_748_2009">
                        <rect width="17.8378" height="17.8378" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                {/* <span className="text-2xl">{getDeliveryIcon()}</span> */}
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
                      <input
                        type="text"
                        placeholder="Promocode"
                        className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                      />
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 text-sm font-bold rounded-lg hover:bg-pink-50 transition-colors bg-linear-to-tr from-[#ED457D] to-[#FA8F42] bg-clip-text text-transparent cursor-pointer"
                      >
                        Apply
                      </button>

                    </div>
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
                  <span className="text-2xl font-bold text-[#1A1A1A]">{selectedAmount?.currency}{calculateTotal()}</span>
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
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
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


