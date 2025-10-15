'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Check, CreditCard, Gift, Printer, Download, Trash2, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from 'next/link';
import { createBulkOrder } from '../../../lib/action/bulkOrderAction';

// Initialize Stripe
if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Utility function
const convertToSubcurrency = (amount) => Math.round(amount * 100);

// ==================== PRINTABLE GIFT CARD COMPONENT ====================
const PrintableGiftCard = React.forwardRef(({ order, voucherCode, GiftCode, selectedBrand, selectedAmount, personalMessage, deliveryDetails, itemNumber, totalItems }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
      <div className="border-4 border-red-500 rounded-3xl p-8 bg-gradient-to-br from-red-50 to-pink-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full opacity-20 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-200 rounded-full opacity-20 -ml-24 -mb-24"></div>

        <div className="relative z-10">
          {/* Bulk Order Badge */}
          {totalItems > 1 && (
            <div className="text-center mb-4">
              <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Gift Card {itemNumber} of {totalItems}
              </span>
            </div>
          )}

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
                {selectedAmount?.currency || 'R'}{selectedAmount?.value || order?.amount}
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
            <p className="text-3xl font-mono font-bold text-center text-gray-800 tracking-wider">
              {GiftCode || voucherCode?.code || '****-****-****'}
            </p>
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
                  : 'No Expiry'}
              </p>
            </div>
          </div>

          {/* Bulk Order Reference */}
          {order?.bulkOrderNumber && (
            <div className="bg-purple-50 rounded-xl p-4 mb-6 border-2 border-purple-200">
              <p className="text-xs text-purple-600 mb-1 text-center">Bulk Order Reference</p>
              <p className="text-sm font-mono font-semibold text-purple-800 text-center">
                {order.bulkOrderNumber}
              </p>
            </div>
          )}

          {/* Redemption Link */}
          {voucherCode?.tokenizedLink && (
            <div className="bg-white rounded-xl p-4 shadow-md text-center mb-6">
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

      {/* Terms and Conditions */}
      <div className="mt-8 text-xs text-gray-600 space-y-2 print:block">
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

// ==================== STRIPE CARD PAYMENT COMPONENT ====================
const StripeCardPayment = ({ total, isProcessing, onPayment, cartItems }) => {
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
        return;
      }

      // Process payment through your API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/process-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.id,
          amount: total,
          currency: 'usd',
          cartItems: cartItems
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
      }
    } catch (err) {
      setCardError("Payment failed. Please try again.");
      console.error('Payment error:', err);
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{cardError}</span>
        </div>
      )}
      <button
        onClick={handleCardPayment}
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
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

// ==================== MAIN CHECKOUT COMPONENT ====================
const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkOrderResult, setBulkOrderResult] = useState(null);
  const [error, setError] = useState(null);
  const printRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    if (items.length === 0) {
      router.push('/cart');
    }
    setCartItems(items);
  }, [router]);

  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = calculateSubtotal();
    return Math.round(baseAmount * 0.03);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const value = typeof item.selectedAmount === 'object' ? item.selectedAmount.value : item.selectedAmount;
      return total + (Number(value) || 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const serviceFee = calculateServiceFee();
    return subtotal + serviceFee;
  };

  const removeFromCart = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
    
    if (updatedCart.length === 0) {
      router.push('/cart');
    }
  };

  const getDeliveryIcon = (method) => {
    switch (method) {
      case 'email': return '📧';
      case 'whatsapp': return '💬';
      case 'print': return '🖨️';
      default: return '📱';
    }
  };

  const getDeliveryText = (method) => {
    switch (method) {
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'print': return 'Print at Home';
      default: return method;
    }
  };

  const handlePayment = async (paymentData) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Creating bulk order with', cartItems.length, 'items');
      
      const result = await createBulkOrder(cartItems, paymentData);
      
      if (result?.success) {
        setBulkOrderResult(result.data);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('storage'));
        
        if (result.data.failedOrders?.length > 0) {
          console.warn('Some orders failed:', result.data.failedOrders);
        }
      } else {
        setError(result.error || 'Failed to create bulk order');
      }
    } catch (error) {
      setError("An unexpected error occurred during payment processing.");
      console.error('Bulk order creation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    handlePrint();
  };

  // ==================== SUCCESS SCREEN ====================
  if (bulkOrderResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 md:p-6">
        {/* Success Summary - Hidden on Print */}
        <div className="max-w-4xl mx-auto mb-6 print:hidden">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your bulk order has been processed successfully.
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4 text-left mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Bulk Order Number:</span>
                <span className="font-mono font-semibold text-gray-800">{bulkOrderResult.bulkOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Items:</span>
                <span className="font-semibold text-gray-800">{bulkOrderResult.totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Successful:</span>
                <span className="font-semibold text-green-600">{bulkOrderResult.successfulItems}</span>
              </div>
              {bulkOrderResult.failedItems > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Failed:</span>
                  <span className="font-semibold text-red-600">{bulkOrderResult.failedItems}</span>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t-2">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-bold text-gray-800">R {bulkOrderResult.totalAmount}</span>
              </div>
            </div>

            {/* Failed Orders Warning */}
            {bulkOrderResult.failedOrders?.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-yellow-800 mb-2">Some items couldn't be processed:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {bulkOrderResult.failedOrders.map((failed, idx) => (
                        <li key={idx}>• {failed.item}: {failed.error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print All ({bulkOrderResult.successfulItems})
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>

            <Link
              href="/"
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-center"
            >
              Send More Gifts
            </Link>
          </div>
        </div>

        {/* Gift Cards - Printable */}
        <div className="space-y-6">
          {bulkOrderResult.orders.map((orderData, index) => (
            <div key={index} className="print:break-after-page">
              <PrintableGiftCard
                ref={index === 0 ? printRef : null}
                order={orderData.order}
                voucherCode={orderData.voucherCode}
                GiftCode={orderData.voucherCode?.code}
                selectedBrand={cartItems[orderData.itemIndex]?.selectedBrand}
                selectedAmount={cartItems[orderData.itemIndex]?.selectedAmount}
                personalMessage={cartItems[orderData.itemIndex]?.personalMessage}
                deliveryDetails={cartItems[orderData.itemIndex]?.deliveryDetails}
                itemNumber={index + 1}
                totalItems={bulkOrderResult.successfulItems}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== EMPTY CART STATE ====================
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some gift cards to get started</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 px-8 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-all"
          >
            Browse Gift Cards
          </Link>
        </div>
      </div>
    );
  }

  // ==================== CHECKOUT SCREEN ====================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Back to Cart</span>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900">You're almost there!</h1>
          <p className="text-gray-600 mt-2">
            Complete your purchase of {cartItems.length} gift card{cartItems.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Payment Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-pink-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Secure card payment for {cartItems.length} gift card{cartItems.length > 1 ? 's' : ''}
              </p>

              {/* Security Badge */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start">
                <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">
                  Your payment is 100% secure and encrypted
                </span>
              </div>

              {/* Selected Payment Method */}
              <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 mb-5">
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

              {/* Stripe Payment Form */}
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
                  cartItems={cartItems}
                />
              </Elements>
            </div>
          </div>

          {/* Cart Items and Summary */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Gift className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  Your Gift Cards ({cartItems.length})
                </h3>
                <span className="ml-auto text-2xl">🎁</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Ready to make someone smile</p>

              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-pink-200 transition-all"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      {/* Brand Logo */}
                      <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.selectedBrand?.logo ? (
                          <img
                            src={item.selectedBrand.logo}
                            alt={item.selectedBrand.brandName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {(item.selectedBrand?.brandName || 'SB')?.substring(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {item.selectedBrand?.brandName || 'Gift Card'}
                            </h4>
                            <span className="text-lg font-bold text-red-500">
                              {formatAmount(item.selectedAmount)}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            disabled={isProcessing}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Personal Message */}
                    {item.personalMessage && (
                      <div className="p-3 bg-white rounded-lg mb-2">
                        <p className="text-sm text-gray-700 italic">"{item.personalMessage}"</p>
                      </div>
                    )}

                    {/* Delivery Method */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-lg">{getDeliveryIcon(item.deliveryMethod)}</span>
                      <span className="text-green-700 font-medium">
                        Delivering via {getDeliveryText(item.deliveryMethod)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h3>

              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Subtotal ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})
                  </span>
                  <span className="font-semibold text-gray-900">R {calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Fee (3%)</span>
                  <span className="font-semibold text-gray-900">R {calculateServiceFee()}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-2xl font-bold text-gray-900">R {calculateTotal()}</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;