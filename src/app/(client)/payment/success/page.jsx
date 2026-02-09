"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import Header from "../../../../components/client/home/Header";
import Footer from "../../../../components/client/home/Footer";
import { getOrderById } from "../../../../lib/action/orderAction";
import SuccessScreen from "../../../../components/client/giftflow/payment/SuccessScreen";
import ThankYouScreen from "../../../../components/client/giftflow/payment/ThankYouScreen";


const PaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);


  useEffect(() => {
    const verifyOrder = async () => {
      const orderId = searchParams.get("orderId");

      if (!orderId) {
        setError("No order ID found in the URL.");
        setLoading(false);
        return;
      }

      try {
        const orderData = await getOrderById(orderId);

        if (orderData?.data) {
          if (orderData.data?.paymentStatus === "completed" || orderData.data?.paymentStatus === "COMPLETED") {
            setOrder(orderData.data);
          } else {
            setError(
              "Payment is still pending. We will notify you once it is complete."
            );
          }
        } else {
          setError("Could not retrieve order details.");
        }
      } catch (err) {
        setError("An error occurred while verifying your payment.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [searchParams]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center text-center">
          <Loader className="w-16 h-16 text-blue-500 animate-spin" />
          <h1 className="mt-4 text-2xl font-bold">
            Verifying your payment...
          </h1>
          <p className="text-gray-600">Please do not close this page.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold">Payment Issue</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/gift")}
            className="mt-6 px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Back to Gifting
          </button>
        </div>
      );
    }

    if (order) {
      if (showThankYou) {
        return <ThankYouScreen />;
      }

      const displayQuantity = order.totalOrderCount || 1;
      const isBulkMode =
        order.totalOrderCount > 1 || (order.quantity && order.quantity > 1);

      return (
        <SuccessScreen
          order={order}
          selectedBrand={
            order.brand ||
            order.selectedBrand
          }
          quantity={displayQuantity}
          selectedAmount={order.selectedAmount || order.amount}
          isBulkMode={isBulkMode}
          onNext={() => setShowThankYou(true)}
          deliveryDetails={order.deliveryDetails}
          processingInBackground={order.processingInBackground}
          processingStatus={order.processingStatus}
        />
      );
    }


    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-lg">{renderContent()}</div>
      </main>
      <Footer />
    </div>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;