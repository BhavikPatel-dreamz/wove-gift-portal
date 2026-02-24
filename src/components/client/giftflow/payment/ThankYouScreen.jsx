import React from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from "next/link";

const ThankYouScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSendAnotherGift = () => {
    router.push("/")
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="rounded-2xl p-5 text-center">
        <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">
          Thanks for your purchase!
        </h1>
        <p className="text-[#4A4A4A] font-medium text-[16px] mb-6">
          Create your account now to track your order and access exclusive rewards.
        </p>
        <div className="w-full flex justify-center">
          <button
            onClick={handleSendAnotherGift}
            className="px-6 py-3 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white rounded-full font-semibold hover:shadow-lg transition-all flex gap-3 items-center cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
              <path d="M10.41 1.31226C10.1208 1.10854 9.77557 0.999463 9.42185 1.00005C9.06814 0.999472 8.72295 1.10855 8.43379 1.31226L1.72952 6.15186C1.50415 6.31048 1.32022 6.52098 1.19326 6.76559C1.06629 7.0102 1.00001 7.28176 1 7.55736V15.2656C1 16.2149 1.76952 16.9844 2.71874 16.9844H6.7031V12.5469C6.7031 11.5977 8.47263 10.8281 9.42185 10.8281C10.3711 10.8281 12.1406 11.5977 12.1406 12.5469V16.9844H16.125C17.0742 16.9844 17.8437 16.2149 17.8437 15.2656V7.55736C17.8437 7.28176 17.7774 7.01021 17.6505 6.76559C17.5235 6.52098 17.3396 6.31048 17.1142 6.15186L10.41 1.31226Z" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            Back to Home
          </button>
        </div>

        <p
          className="
    text-[#4A4A4A]
    text-center
    font-inter
    text-[16px]
    font-normal
    leading-[24px]
    mt-6
  "
        >
          <strong className="font-bold">Need help?</strong> Have questions or want to cancel or modify your gift? <Link href="/support">Contact Support</Link>
        </p>
      </div>
    </div>
  );
};

export default ThankYouScreen;