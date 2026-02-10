'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearCart, clearBulkCart } from '@/redux/cartSlice';
import { resetFlow } from '@/redux/giftFlowSlice';
import { getOrderStatus } from '@/lib/action/orderAction';
import SuccessScreen from '@/components/client/giftflow/payment/SuccessScreen';
import ThankYouScreen from '@/components/client/giftflow/payment/ThankYouScreen';
import Header from '@/components/client/home/Header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    // ✅ Fetch the order and all related orders
    fetchOrderAndRelated(orderId);
  }, [searchParams]);

  const fetchOrderAndRelated = async (orderId) => {
    try {
      console.log('🔍 Fetching order:', orderId);

      // ✅ Get the primary order
      const primaryOrderResponse = await getOrderStatus(orderId);

      console.log("primaryOrderResponse",primaryOrderResponse)
      
      if (!primaryOrderResponse.success) {
        throw new Error(primaryOrderResponse.error || 'Failed to fetch order');
      }

      const primaryOrder = primaryOrderResponse.order;

      // ✅ Find all orders with the same payment intent (multi-cart orders)
      const relatedOrders = await fetchRelatedOrders(primaryOrder.paymentIntentId);

      console.log('✅ Found orders:', {
        primary: primaryOrder.orderNumber,
        total: relatedOrders.length,
        orders: relatedOrders.map(o => o.orderNumber)
      });

      // ✅ Set order with all related orders
      setOrder({
        ...primaryOrder,
        allOrders: relatedOrders,
        totalOrderCount: relatedOrders.length,
        processingInBackground: false,
        processingStatus: 'COMPLETED'
      });

      // ✅ Clear cart items
      dispatch(clearCart());
      dispatch(clearBulkCart());
      dispatch(resetFlow());

      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
      setLoading(false);
    }
  };

  // ✅ Helper function to fetch all orders with same payment intent
  const fetchRelatedOrders = async (paymentIntentId) => {
    try {
      const response = await fetch('/api/orders/by-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch related orders');
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching related orders:', error);
      // Fallback: return just the primary order
      return [];
    }
  };

  const handleNext = () => {
    setShowThankYou(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Header />
        <div className="max-w-md text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800 mb-2">Error</h1>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div>
        <Header />
        <ThankYouScreen />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <p className="text-gray-600">No order found</p>
      </div>
    );
  }

  // ✅ Determine if bulk order
  const allOrders = order.allOrders || [order];
  const isActualBulkOrder = order.bulkOrderNumber || allOrders.some(o => o.bulkOrderNumber);

  return (
    <SuccessScreen
      order={order}
      selectedBrand={order.brand || allOrders[0]?.brand}
      quantity={order.totalOrderCount || order.quantity || 1}
      selectedAmount={order.selectedAmount || order.amount}
      isBulkMode={isActualBulkOrder}
      onNext={handleNext}
      deliveryDetails={order.receiverDetail}
      processingInBackground={order.processingInBackground}
      processingStatus={order.processingStatus}
    />
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}