'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/forms/Button';
import Header from '../../../components/client/home/Header';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateState,
  setCurrentStep,
} from '@/redux/giftFlowSlice';
import { removeFromCart, removeFromBulk } from '@/redux/cartSlice';
import { currencyList } from '../../brandsPartner/currency';
import toast from 'react-hot-toast';

const CartPage = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const bulkItems = useSelector((state) => state.cart.bulkItems);
  const session = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'bulk'

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Auto-switch tabs based on what's available and save to localStorage
  useEffect(() => {
    if (isMounted) {
      // If current tab is empty, switch to the other tab if it has items
      if (activeTab === 'regular' && cartItems.length === 0 && bulkItems.length > 0) {
        setActiveTab('bulk');
        localStorage.setItem('activeCartTab', 'bulk');
      } else if (activeTab === 'bulk' && bulkItems.length === 0 && cartItems.length > 0) {
        setActiveTab('regular');
        localStorage.setItem('activeCartTab', 'regular');
      } else {
        // Save current active tab
        localStorage.setItem('activeCartTab', activeTab);
      }
    }
  }, [cartItems.length, bulkItems.length, activeTab, isMounted]);

  const handleRemoveItem = (index) => {
    dispatch(removeFromCart(index));
    toast.success('Item removed from cart');
  };

  const handleRemoveBulkItem = (index) => {
    dispatch(removeFromBulk(index));
    toast.success('Bulk order removed from cart');
  };

  const handleEditItem = (item, index) => {
    dispatch(updateState({
      ...item,
      editingIndex: index,
      isEditMode: true,
    }));
    dispatch(setCurrentStep(0));
    router.push('/gift');
  };

  // ✅ Fixed: Only proceed with items from active tab
  const handleProceedToPayment = () => {
    if (session) {
      // Check if active tab has items
      if (activeTab === 'regular' && cartItems.length === 0) {
        toast.error('Your regular cart is empty');
        return;
      }
      if (activeTab === 'bulk' && bulkItems.length === 0) {
        toast.error('Your bulk cart is empty');
        return;
      }
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/cart');
    }
  };

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "$";

  const formatAmount = (amount) => {
    if (typeof amount === "object" && amount?.value && amount?.currency) {
      return `${getCurrencySymbol(amount.currency)} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = (items, isBulk = false) => {
    const baseAmount = calculateSubtotal(items, isBulk);
    return Math.round(baseAmount * 0.05);
  };

  const calculateSubtotal = (items, isBulk = false) => {
    if (isBulk) {
      return items.reduce((total, item) => {
        const value = typeof item.selectedAmount === 'object' ? item.selectedAmount.value : item.selectedAmount;
        return total + ((Number(value) || 0) * (item.quantity || 1));
      }, 0);
    } else {
      return items.reduce((total, item) => {
        const value = typeof item.selectedAmount === 'object' ? item.selectedAmount.value : item.selectedAmount;
        return total + (Number(value) || 0);
      }, 0);
    }
  };

  const calculateTotal = (items, isBulk = false) => {
    return calculateSubtotal(items, isBulk) + calculateServiceFee(items, isBulk);
  };

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-25">
          <div className="flex items-center mb-6 sm:mb-8 md:mb-10">
            <Link href="/" className="group inline-flex items-center">
              <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400">
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full bg-white transition-all duration-200 group-hover:bg-linear-to-r group-hover:from-pink-500 group-hover:to-orange-400 group-hover:shadow-md">
                  <svg width="8" height="9" viewBox="0 0 8 9" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-200 w-2 h-2 sm:w-2.5 sm:h-2.5">
                    <path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" className="fill-[url(#grad)] group-hover:fill-white" />
                    <defs>
                      <linearGradient id="grad" x1="7.5" y1="3" x2="-9" y2="13">
                        <stop stopColor="#ED457D" />
                        <stop offset="1" stopColor="#FA8F42" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-white">Previous</span>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <div className="animate-pulse text-gray-400 text-sm sm:text-base">Loading cart...</div>
          </div>
        </main>
      </div>
    );
  }

  const currentItems = activeTab === 'regular' ? cartItems : bulkItems;
  const isBulkTab = activeTab === 'bulk';
  const hasRegularItems = cartItems.length > 0;
  const hasBulkItems = bulkItems.length > 0;
  const hasAnyItems = hasRegularItems || hasBulkItems;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-25 sm:py-12 md:py-16 lg:py-25">
        <div className="flex items-center mb-6 sm:mb-8 md:mb-10">
          <Link href="/" className="group inline-flex items-center">
            <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full bg-white transition-all duration-200 group-hover:bg-linear-to-r group-hover:from-pink-500 group-hover:to-orange-400 group-hover:shadow-md">
                <svg width="8" height="9" viewBox="0 0 8 9" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-200 w-2 h-2 sm:w-2.5 sm:h-2.5">
                  <path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" className="fill-[url(#grad)] group-hover:fill-white" />
                  <defs>
                    <linearGradient id="grad" x1="7.5" y1="3" x2="-9" y2="13">
                      <stop stopColor="#ED457D" />
                      <stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-white">Previous</span>
              </div>
            </div>
          </Link>
        </div>

        <div>
          <h1 className="mb-2 font-['Poppins'] text-2xl sm:text-3xl md:text-[40px] leading-tight sm:leading-8.75 md:leading-11.25 font-bold text-[#1A1A1A]">
            Your Shopping Cart
          </h1>
          <p className="mb-6 sm:mb-8 md:mb-10 font-['Inter'] text-sm sm:text-[15px] md:text-[16px] font-medium leading-5 sm:leading-5.5 md:leading-6 text-[#4A4A4A]">
            Review your items and proceed to a seamless checkout.
          </p>
        </div>

        {/* ✅ Tabs - Show only when both types have items */}
        {hasAnyItems && (hasRegularItems && hasBulkItems) && (
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('regular')}
              className={`pb-3 px-4 font-semibold transition-all ${activeTab === 'regular'
                ? 'border-b-2 border-pink-500 text-pink-500'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Regular Items ({cartItems.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`pb-3 px-4 font-semibold transition-all ${activeTab === 'bulk'
                ? 'border-b-2 border-pink-500 text-pink-500'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>Bulk Orders ({bulkItems.length})</span>
              </div>
            </button>
          </div>
        )}

        {/* ✅ Show single tab header when only one type exists */}
        {hasAnyItems && (hasRegularItems && !hasBulkItems) && (
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <div className="pb-3 px-4 border-b-2 border-pink-500">
              <div className="flex items-center gap-2 text-pink-500 font-semibold">
                <ShoppingBag className="w-5 h-5" />
                <span>Regular Items ({cartItems.length})</span>
              </div>
            </div>
          </div>
        )}

        {hasAnyItems && (!hasRegularItems && hasBulkItems) && (
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <div className="pb-3 px-4 border-b-2 border-pink-500">
              <div className="flex items-center gap-2 text-pink-500 font-semibold">
                <Package className="w-5 h-5" />
                <span>Bulk Orders ({bulkItems.length})</span>
              </div>
            </div>
          </div>
        )}

        {!hasAnyItems ? (
          <div className="rounded-[20px] border-2 border-dashed border-[#ED457D] bg-[rgba(244,236,217,0.30)] p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 80 80" fill="none" className="sm:w-17.5 sm:h-17.5 md:w-20 md:h-20">
              <path d="M15.0028 28.75L30.0028 11.25M65.0028 28.75L50.0028 11.25M25.0028 38.75V58.75M40.0028 38.75V58.75M55.0028 38.75V58.75M63.1229 68.75H16.8828C15.7999 68.7315 14.7551 68.3473 13.9181 67.6598C13.0812 66.9724 12.5013 66.022 12.2728 64.9633L5.14618 34.9633C4.95538 34.2448 4.92897 33.4926 5.06891 32.7625C5.20886 32.0324 5.51156 31.3432 5.95451 30.7462C6.39746 30.1492 6.96928 29.6597 7.62745 29.3141C8.28563 28.9685 9.01323 28.7757 9.75618 28.75H70.2495C70.9925 28.7757 71.7201 28.9685 72.3782 29.3141C73.0364 29.6597 73.6082 30.1492 74.0512 30.7462C74.4941 31.3432 74.7968 32.0324 74.9368 32.7625C75.0767 33.4926 75.0503 34.2448 74.8595 34.9633L67.7329 64.9633C67.5044 66.022 66.9245 66.9724 66.0876 67.6598C65.2506 68.3473 64.2058 68.7315 63.1229 68.75Z" stroke="#ED457D" strokeOpacity="0.5" strokeWidth="4.94545" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="mt-4 sm:mt-5 md:mt-6 text-center font-['Poppins'] font-semibold text-[#1A1A1A] text-xl sm:text-2xl md:text-3xl lg:text-[36px] leading-7 sm:leading-8 md:leading-9.5 lg:leading-11.25">
              Your cart is empty
            </h2>
            <p className="mt-2 text-center font-['Inter'] font-medium text-[#4A4A4A] text-sm sm:text-[15px] md:text-[16px] leading-5 sm:leading-5.5 md:leading-6 max-w-md">
              Looks like you haven't added any gifts to your cart yet.
            </p>
            <Link href="/gift" className="mt-6 sm:mt-7 md:mt-8 inline-flex items-center justify-center rounded-[50px] bg-[linear-gradient(114deg,#ED457D_11.36%,#FA8F42_90.28%)] px-6 sm:px-7 md:px-8 py-2.5 sm:py-2.75 md:py-3 text-sm sm:text-[15px] md:text-base text-center font-semibold text-white transition-all duration-200 hover:opacity-90">
              Start Gifting Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Regular Cart Items */}
              {activeTab === 'regular' && cartItems.map((item, index) => (
                <div key={index} onClick={() => handleEditItem(item, index)} className="flex justify-between cursor-pointer items-start gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-6 rounded-[20px] border border-[rgba(26,26,26,0.10)] bg-white transition-all hover:shadow-lg hover:border-pink-200">
                  <div className="flex cursor-pointer items-center gap-3 sm:gap-4 md:gap-6 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 border">
                      <img src={item.selectedBrand?.logo} alt={item.selectedBrand?.brandName} className="w-full h-full object-contain p-2 sm:p-2.5 md:p-3 rounded-lg" />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 min-w-0">
                      <h3 className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 font-['Poppins'] text-sm sm:text-[15px] md:text-[16px] font-semibold leading-4.5 sm:leading-5 md:leading-5.5 text-[#1A1A1A]">
                        <span className="shrink-0">
                          {item.selectedBrand?.brandName || item.selectedBrand?.name}
                        </span>
                        <span className="truncate text-xs sm:text-[13px] md:text-[14px] font-normal text-gray-500">
                          {item.personalMessage || 'No personal message.'}
                        </span>
                      </h3>
                      <div className="flex w-fit p-1.5 sm:p-2 items-center justify-center gap-0.5 sm:gap-1 rounded-[50px] bg-[#F4F4F4]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none" className="sm:w-5 sm:h-5 md:w-5.5 md:h-5.5">
                          <path d="M10.9994 11.9834V20.4874L7.42409 18.8483L6.94887 18.6308L5.09936 17.7832L4.99592 17.7356L1.95801 16.3425V7.82666L5.09936 9.27065L7.42409 10.3398L10.9994 11.9834Z" fill="#ED457D" />
                          <path d="M20.0414 7.82666V16.3425L17.3652 17.5729L16.691 17.883L15.4122 18.4708L14.3663 18.9521L11 20.4999V11.9834L14.3663 10.4356L16.691 9.36718L20.0414 7.82666Z" fill="#FF81AB" />
                          <path d="M7.42434 10.3399V18.8484L6.94912 18.6309L5.09961 17.7833V9.27075L7.42434 10.3399Z" fill="#FFF380" />
                          <path d="M16.6929 9.36731V17.8832L15.4141 18.4709L14.3682 18.9523V10.4358L16.6929 9.36731Z" fill="#FFF380" />
                          <path d="M20.5 5.88745V8.45675L17.1091 10.0158L14.7837 11.0849L11 12.8244L7.00731 10.989L4.68186 9.91992L1.5 8.45675V5.88745L4.68186 7.34996L7.00731 8.41907L11 10.2545L14.7837 8.51494L17.1091 7.44649L20.5 5.88745Z" fill="#FF8A0E" />
                          <path d="M20.5 5.88685L11 10.2545L1.5 5.88685L11 1.5L20.5 5.88685Z" fill="#FFB465" />
                          <path d="M7.00807 8.41921V10.9892L4.68262 9.92006V7.3501L7.00807 8.41921Z" fill="#FFEA26" />
                          <path d="M17.1087 7.44653V10.0158L14.7832 11.0849V8.51498L17.1087 7.44653Z" fill="#FFEA26" />
                          <path d="M4.68262 7.35008L10.9287 4.85217L13.2303 5.91467L7.00807 8.41919L4.68262 7.35008Z" fill="#FFF8B5" />
                          <path d="M17.3143 7.34996L11.5682 4.60205L9.2666 5.66455L14.9888 8.41907L17.3143 7.34996Z" fill="#FFF8B5" />
                          <path d="M11.0001 5.36987C11.0001 5.36987 9.85292 6.38741 9.19687 8.68828L8.61316 7.88231L7.67285 8.67572C7.67285 8.67572 7.67285 6.62609 9.91512 5.36987H11.0001Z" fill="#B3610A" />
                          <path d="M11.0723 5.36987C11.0723 5.36987 12.2194 6.38741 12.8755 8.68828L13.4592 7.88231L14.3995 8.67572C14.3995 8.67572 14.3995 6.62609 12.1572 5.36987H11.0723Z" fill="#B3610A" />
                          <path d="M10.6383 4.7086V5.43588C8.46833 6.09705 6.94938 5.83258 6.37073 5.1053C6.21955 4.9162 6.08429 4.66827 5.9946 4.40314C5.74072 3.65007 5.86368 2.75683 7.09404 2.65897C8.75766 2.52674 10.6383 4.7086 10.6383 4.7086Z" fill="#B3610A" />
                          <path d="M10.6407 5.43393V5.43591C8.4708 6.09708 6.95184 5.83261 6.37319 5.10533C6.22202 4.91623 6.08676 4.66829 5.99707 4.40317C6.17501 4.14399 6.49833 3.95688 7.02418 3.91522C8.1945 3.822 9.79519 4.82896 10.6407 5.43393Z" fill="#7B4001" />
                          <path d="M11.3623 4.7086V5.43588C13.5322 6.09705 15.0512 5.83258 15.6299 5.1053C15.781 4.9162 15.9163 4.66827 16.006 4.40314C16.2599 3.65007 16.1369 2.75683 14.9065 2.65897C13.2429 2.52674 11.3623 4.7086 11.3623 4.7086Z" fill="#B3610A" />
                          <path d="M11.3623 5.43393V5.43591C13.5322 6.09708 15.0512 5.83261 15.6299 5.10533C15.781 4.91623 15.9163 4.66829 16.006 4.40317C15.828 4.14399 15.5047 3.95688 14.9789 3.91522C13.8086 3.822 12.2079 4.82896 11.3623 5.43393Z" fill="#7B4001" />
                          <path d="M10.5659 5.43589C10.5659 5.43589 10.2766 4.51025 10.9999 4.51025C11.7232 4.51025 11.4339 5.43589 11.4339 5.43589C11.4339 5.43589 11.0723 5.76647 10.5659 5.43589Z" fill="#FF8A0E" />
                        </svg>
                        <p className="my-0.5 sm:my-1 font-['Poppins'] text-xs sm:text-[13px] md:text-[14px] font-semibold leading-4 sm:leading-4.25 md:leading-4.5 text-[#1A1A1A]">
                          {formatAmount(item.selectedAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }} className="text-gray-400 hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-red-50 transition-colors shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
                      <path d="M6.347 16.6667C5.97644 16.6667 5.6595 16.5347 5.39616 16.2709C5.13283 16.007 5.00089 15.6906 5.00033 15.3217V5.00002H4.58366C4.46533 5.00002 4.36644 4.96002 4.287 4.88002C4.20755 4.80002 4.16755 4.70086 4.167 4.58252C4.16644 4.46419 4.20644 4.3653 4.287 4.28586C4.36755 4.20641 4.46644 4.16669 4.58366 4.16669H7.50033C7.50033 3.99447 7.56422 3.84447 7.692 3.71669C7.81978 3.58891 7.96978 3.52502 8.142 3.52502H11.8587C12.0309 3.52502 12.1809 3.58891 12.3087 3.71669C12.4364 3.84447 12.5003 3.99447 12.5003 4.16669H15.417C15.5353 4.16669 15.6342 4.20669 15.7137 4.28669C15.7931 4.36669 15.8331 4.46586 15.8337 4.58419C15.8342 4.70252 15.7942 4.80141 15.7137 4.88086C15.6331 4.9603 15.5342 5.00002 15.417 5.00002H15.0003V15.3209C15.0003 15.6909 14.8684 16.0075 14.6045 16.2709C14.3406 16.5342 14.0239 16.6661 13.6545 16.6667H6.347ZM8.59033 14.1667C8.70866 14.1667 8.80783 14.1267 8.88783 14.0467C8.96783 13.9667 9.00755 13.8678 9.007 13.75V7.08336C9.007 6.96502 8.967 6.86614 8.887 6.78669C8.807 6.70725 8.70783 6.66725 8.5895 6.66669C8.47116 6.66614 8.37228 6.70614 8.29283 6.78669C8.21339 6.86725 8.17366 6.96614 8.17366 7.08336V13.75C8.17366 13.8684 8.21366 13.9672 8.29366 14.0467C8.37366 14.1267 8.47255 14.1667 8.59033 14.1667ZM11.4112 14.1667C11.5295 14.1667 11.6284 14.1267 11.7078 14.0467C11.7873 13.9667 11.827 13.8678 11.827 13.75V7.08336C11.827 6.96502 11.787 6.86614 11.707 6.78669C11.627 6.70669 11.5281 6.66669 11.4103 6.66669C11.292 6.66669 11.1928 6.70669 11.1128 6.78669C11.0328 6.86669 10.9931 6.96558 10.9937 7.08336V13.75C10.9937 13.8684 11.0337 13.9672 11.1137 14.0467C11.1937 14.1261 11.2928 14.1661 11.4112 14.1667Z" fill="black" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Bulk Cart Items */}
              {activeTab === 'bulk' && bulkItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-6 rounded-[20px] border border-[rgba(26,26,26,0.10)] bg-white transition-all hover:shadow-lg hover:border-pink-200">
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 border">
                      <img src={item.selectedBrand?.logo} alt={item.selectedBrand?.brandName} className="w-full h-full object-contain p-2 sm:p-2.5 md:p-3 rounded-lg" />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-pink-500" />
                        <span className="text-xs font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
                          BULK ORDER
                        </span>
                      </div>
                      <h3 className="font-['Poppins'] text-sm sm:text-[15px] md:text-[16px] font-semibold leading-4.5 sm:leading-5 md:leading-5.5 text-[#1A1A1A]">
                        {item.selectedBrand?.brandName || item.selectedBrand?.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span>Quantity: <strong>{item.quantity}</strong></span>
                        <span>•</span>
                        <span>Amount: <strong>{formatAmount(item.selectedAmount)}</strong></span>
                      </div>
                      {item.companyInfo?.companyName && (
                        <p className="text-xs text-gray-500 truncate">
                          Company: {item.companyInfo.companyName}
                        </p>
                      )}
                      <div className="flex w-fit p-1.5 sm:p-2 items-center justify-center gap-0.5 sm:gap-1 rounded-[50px] bg-[#F4F4F4] mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none" className="sm:w-5 sm:h-5 md:w-5.5 md:h-5.5">
                          <path d="M10.9994 11.9834V20.4874L7.42409 18.8483L6.94887 18.6308L5.09936 17.7832L4.99592 17.7356L1.95801 16.3425V7.82666L5.09936 9.27065L7.42409 10.3398L10.9994 11.9834Z" fill="#ED457D" />
                          <path d="M20.0414 7.82666V16.3425L17.3652 17.5729L16.691 17.883L15.4122 18.4708L14.3663 18.9521L11 20.4999V11.9834L14.3663 10.4356L16.691 9.36718L20.0414 7.82666Z" fill="#FF81AB" />
                          <path d="M7.42434 10.3399V18.8484L6.94912 18.6309L5.09961 17.7833V9.27075L7.42434 10.3399Z" fill="#FFF380" />
                          <path d="M16.6929 9.36731V17.8832L15.4141 18.4709L14.3682 18.9523V10.4358L16.6929 9.36731Z" fill="#FFF380" />
                          <path d="M20.5 5.88745V8.45675L17.1091 10.0158L14.7837 11.0849L11 12.8244L7.00731 10.989L4.68186 9.91992L1.5 8.45675V5.88745L4.68186 7.34996L7.00731 8.41907L11 10.2545L14.7837 8.51494L17.1091 7.44649L20.5 5.88745Z" fill="#FF8A0E" />
                          <path d="M20.5 5.88685L11 10.2545L1.5 5.88685L11 1.5L20.5 5.88685Z" fill="#FFB465" />
                          <path d="M7.00807 8.41921V10.9892L4.68262 9.92006V7.3501L7.00807 8.41921Z" fill="#FFEA26" />
                          <path d="M17.1087 7.44653V10.0158L14.7832 11.0849V8.51498L17.1087 7.44653Z" fill="#FFEA26" />
                          <path d="M4.68262 7.35008L10.9287 4.85217L13.2303 5.91467L7.00807 8.41919L4.68262 7.35008Z" fill="#FFF8B5" />
                          <path d="M17.3143 7.34996L11.5682 4.60205L9.2666 5.66455L14.9888 8.41907L17.3143 7.34996Z" fill="#FFF8B5" />
                          <path d="M11.0001 5.36987C11.0001 5.36987 9.85292 6.38741 9.19687 8.68828L8.61316 7.88231L7.67285 8.67572C7.67285 8.67572 7.67285 6.62609 9.91512 5.36987H11.0001Z" fill="#B3610A" />
                          <path d="M11.0723 5.36987C11.0723 5.36987 12.2194 6.38741 12.8755 8.68828L13.4592 7.88231L14.3995 8.67572C14.3995 8.67572 14.3995 6.62609 12.1572 5.36987H11.0723Z" fill="#B3610A" />
                          <path d="M10.6383 4.7086V5.43588C8.46833 6.09705 6.94938 5.83258 6.37073 5.1053C6.21955 4.9162 6.08429 4.66827 5.9946 4.40314C5.74072 3.65007 5.86368 2.75683 7.09404 2.65897C8.75766 2.52674 10.6383 4.7086 10.6383 4.7086Z" fill="#B3610A" />
                          <path d="M10.6407 5.43393V5.43591C8.4708 6.09708 6.95184 5.83261 6.37319 5.10533C6.22202 4.91623 6.08676 4.66829 5.99707 4.40317C6.17501 4.14399 6.49833 3.95688 7.02418 3.91522C8.1945 3.822 9.79519 4.82896 10.6407 5.43393Z" fill="#7B4001" />
                          <path d="M11.3623 4.7086V5.43588C13.5322 6.09705 15.0512 5.83258 15.6299 5.1053C15.781 4.9162 15.9163 4.66827 16.006 4.40314C16.2599 3.65007 16.1369 2.75683 14.9065 2.65897C13.2429 2.52674 11.3623 4.7086 11.3623 4.7086Z" fill="#B3610A" />
                          <path d="M11.3623 5.43393V5.43591C13.5322 6.09708 15.0512 5.83261 15.6299 5.10533C15.781 4.91623 15.9163 4.66829 16.006 4.40317C15.828 4.14399 15.5047 3.95688 14.9789 3.91522C13.8086 3.822 12.2079 4.82896 11.3623 5.43393Z" fill="#7B4001" />
                          <path d="M10.5659 5.43589C10.5659 5.43589 10.2766 4.51025 10.9999 4.51025C11.7232 4.51025 11.4339 5.43589 11.4339 5.43589C11.4339 5.43589 11.0723 5.76647 10.5659 5.43589Z" fill="#FF8A0E" />
                        </svg>
                        <p className="my-0.5 sm:my-1 font-['Poppins'] text-xs sm:text-[13px] md:text-[14px] font-semibold leading-4 sm:leading-4.25 md:leading-4.5 text-[#1A1A1A]">
                          Total: {formatAmount({ value: (item.selectedAmount.value * item.quantity), currency: item.selectedAmount.currency })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveBulkItem(index); }} className="text-gray-400 hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-red-50 transition-colors shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5">
                      <path d="M6.347 16.6667C5.97644 16.6667 5.6595 16.5347 5.39616 16.2709C5.13283 16.007 5.00089 15.6906 5.00033 15.3217V5.00002H4.58366C4.46533 5.00002 4.36644 4.96002 4.287 4.88002C4.20755 4.80002 4.16755 4.70086 4.167 4.58252C4.16644 4.46419 4.20644 4.3653 4.287 4.28586C4.36755 4.20641 4.46644 4.16669 4.58366 4.16669H7.50033C7.50033 3.99447 7.56422 3.84447 7.692 3.71669C7.81978 3.58891 7.96978 3.52502 8.142 3.52502H11.8587C12.0309 3.52502 12.1809 3.58891 12.3087 3.71669C12.4364 3.84447 12.5003 3.99447 12.5003 4.16669H15.417C15.5353 4.16669 15.6342 4.20669 15.7137 4.28669C15.7931 4.36669 15.8331 4.46586 15.8337 4.58419C15.8342 4.70252 15.7942 4.80141 15.7137 4.88086C15.6331 4.9603 15.5342 5.00002 15.417 5.00002H15.0003V15.3209C15.0003 15.6909 14.8684 16.0075 14.6045 16.2709C14.3406 16.5342 14.0239 16.6661 13.6545 16.6667H6.347ZM8.59033 14.1667C8.70866 14.1667 8.80783 14.1267 8.88783 14.0467C8.96783 13.9667 9.00755 13.8678 9.007 13.75V7.08336C9.007 6.96502 8.967 6.86614 8.887 6.78669C8.807 6.70725 8.70783 6.66725 8.5895 6.66669C8.47116 6.66614 8.37228 6.70614 8.29283 6.78669C8.21339 6.86725 8.17366 6.96614 8.17366 7.08336V13.75C8.17366 13.8684 8.21366 13.9672 8.29366 14.0467C8.37366 14.1267 8.47255 14.1667 8.59033 14.1667ZM11.4112 14.1667C11.5295 14.1667 11.6284 14.1267 11.7078 14.0467C11.7873 13.9667 11.827 13.8678 11.827 13.75V7.08336C11.827 6.96502 11.787 6.86614 11.707 6.78669C11.627 6.70669 11.5281 6.66669 11.4103 6.66669C11.292 6.66669 11.1928 6.70669 11.1128 6.78669C11.0328 6.86669 10.9931 6.96558 10.9937 7.08336V13.75C10.9937 13.8684 11.0337 13.9672 11.1137 14.0467C11.1937 14.1261 11.2928 14.1661 11.4112 14.1667Z" fill="black" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 sm:top-24 md:top-28 rounded-[20px] border border-[rgba(26,26,26,0.10)] bg-white p-5 sm:p-6 md:p-7">
                <h2 className="mb-4 sm:mb-5 pb-3 sm:pb-4 font-['Poppins'] text-base sm:text-[17px] md:text-[18px] font-semibold leading-4.5 sm:leading-4.75 md:leading-5 tracking-[0.25px] text-[#1A1A1A]">
                  Payment Summary {isBulkTab && <span className="text-pink-500">(Bulk)</span>}
                </h2>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex justify-between font-['Poppins'] font-medium text-sm sm:text-[15px] md:text-[16px] leading-4.5 sm:leading-4.75 md:leading-5 tracking-[0.25px] text-[#4A4A4A]">
                    <span>Subtotal</span>
                    <span>
                      {currentItems?.length > 0
                        ? `${getCurrencySymbol(currentItems[0]?.selectedAmount?.currency)} ${calculateSubtotal(currentItems, isBulkTab).toFixed(2)}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between font-['Poppins'] font-medium text-sm sm:text-[15px] md:text-[16px] leading-4.5 sm:leading-4.75 md:leading-5 tracking-[0.25px] text-[#4A4A4A]">
                    <span>Service Fee (5%)</span>
                    <span className="font-semibold">
                      {currentItems?.length > 0
                        ? `${getCurrencySymbol(currentItems[0]?.selectedAmount?.currency)} ${calculateServiceFee(currentItems, isBulkTab)}`
                        : '—'}
                    </span>
                  </div>
                </div>
                <div className="h-px my-4 sm:my-5 w-full bg-[rgba(26,26,26,0.10)]"></div>
                <div className="flex justify-between font-['Poppins'] font-semibold text-base sm:text-[17px] md:text-[18px] leading-4.5 sm:leading-4.75 md:leading-5 tracking-[0.25px] text-[#1A1A1A]">
                  <span>Total</span>
                  <span>
                    {currentItems?.length > 0
                      ? `${getCurrencySymbol(currentItems[0]?.selectedAmount?.currency)} ${calculateTotal(currentItems, isBulkTab).toFixed(2)}`
                      : '—'}
                  </span>
                </div>
                <Button onClick={handleProceedToPayment} className="w-full mt-6 sm:mt-7 md:mt-8 text-base sm:text-[17px] md:text-lg py-2.5 sm:py-2.75 md:py-3">
                  {session ? 'Proceed to Payment' : 'Login to Continue'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;