"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import Header from "../../../../components/client/home/Header";
import Footer from "../../../../components/client/home/Footer";

const PaymentCancelPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen text-black">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-lg text-center">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment process was cancelled. You have not been charged.
          </p>
          <button
            onClick={() => router.push("/gift")}
            className="mt-6 px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Return to Gifting
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCancelPage;