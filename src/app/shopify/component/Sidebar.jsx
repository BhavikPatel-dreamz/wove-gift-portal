'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Calendar,
  FileText,
  Settings,
  X,
  Gift
} from 'lucide-react';

import { useSession } from '@/contexts/SessionContext';
import { useShopifyNavigation } from '@/hooks/useShopifyNavigation';


const DashboardIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.30875 5.48296e-07H1.425C1.23787 5.48296e-07 1.05256 0.0368593 0.879676 0.108472C0.706787 0.180085 0.549696 0.28505 0.417373 0.417373C0.150134 0.684613 0 1.04707 0 1.425V8.49625C0 8.87418 0.150134 9.23664 0.417373 9.50388C0.684612 9.77112 1.04707 9.92125 1.425 9.92125H6.30875C6.68668 9.92125 7.04914 9.77112 7.31638 9.50388C7.58362 9.23664 7.73375 8.87418 7.73375 8.49625V1.425C7.73375 1.23776 7.69685 1.05236 7.62516 0.879388C7.55347 0.706417 7.44839 0.549271 7.31594 0.416931C7.18348 0.284591 7.02624 0.179653 6.85321 0.108113C6.68017 0.0365738 6.49599 -0.000163696 6.30875 5.48296e-07ZM6.51 8.49625C6.50967 8.54986 6.48823 8.60117 6.45033 8.63908C6.41242 8.67698 6.3611 8.69842 6.3075 8.69875H1.425C1.37118 8.69875 1.31954 8.67746 1.28137 8.63952C1.24319 8.60158 1.22158 8.55007 1.22125 8.49625V1.425C1.22125 1.37096 1.24272 1.31914 1.28093 1.28093C1.31914 1.24272 1.37096 1.22125 1.425 1.22125H6.30875C6.36257 1.22158 6.41407 1.24319 6.45202 1.28137C6.48996 1.31954 6.51125 1.37118 6.51125 1.425L6.51 8.49625ZM6.3075 11.955H1.425C1.23787 11.955 1.05256 11.9919 0.879676 12.0635C0.706787 12.1351 0.549696 12.2401 0.417373 12.3724C0.150134 12.6396 0 13.0021 0 13.38V16.075C0 16.4529 0.150134 16.8154 0.417373 17.0826C0.684612 17.3499 1.04707 17.5 1.425 17.5H6.30875C6.68668 17.5 7.04914 17.3499 7.31638 17.0826C7.58362 16.8154 7.73375 16.4529 7.73375 16.075V13.38C7.73375 13.0021 7.58362 12.6396 7.31638 12.3724C7.04914 12.1051 6.68543 11.955 6.3075 11.955ZM6.51125 16.0763C6.51092 16.1299 6.48948 16.1812 6.45158 16.2191C6.41367 16.257 6.36236 16.2784 6.30875 16.2787H1.425C1.37118 16.2788 1.31954 16.2575 1.28137 16.2195C1.24319 16.1816 1.22158 16.1301 1.22125 16.0763V13.3787C1.22158 13.3249 1.24319 13.2734 1.28137 13.2355C1.31954 13.1975 1.37118 13.1762 1.425 13.1763H6.30875C6.36236 13.1766 6.41367 13.198 6.45158 13.2359C6.48948 13.2738 6.51092 13.3251 6.51125 13.3787V16.0763ZM16.0763 5.48296e-07H11.1912C10.8135 0.000331879 10.4514 0.150612 10.1844 0.417815C9.91746 0.685019 9.7675 1.04728 9.7675 1.425V4.12125C9.7675 4.49918 9.91763 4.86164 10.1849 5.12888C10.4521 5.39612 10.8146 5.54625 11.1925 5.54625H16.075C16.2622 5.54625 16.4476 5.50935 16.6206 5.43766C16.7936 5.36597 16.9507 5.26089 17.0831 5.12844C17.2154 4.99598 17.3203 4.83874 17.3919 4.66571C17.4634 4.49268 17.5002 4.30724 17.5 4.12V1.425C17.5 1.23787 17.4631 1.05257 17.3915 0.879677C17.3199 0.706788 17.215 0.549697 17.0826 0.417373C16.9503 0.28505 16.7932 0.180085 16.6203 0.108472C16.4474 0.0368593 16.2621 5.48296e-07 16.075 5.48296e-07M16.2775 4.12125C16.2772 4.17486 16.2557 4.22617 16.2178 4.26408C16.1799 4.30198 16.1286 4.32342 16.075 4.32375H11.1912C11.1376 4.32342 11.0863 4.30198 11.0484 4.26408C11.0105 4.22617 10.9891 4.17486 10.9888 4.12125V1.425C10.9887 1.37118 11.01 1.31954 11.048 1.28137C11.0859 1.24319 11.1374 1.22158 11.1912 1.22125H16.0763C16.1301 1.22158 16.1816 1.24319 16.2195 1.28137C16.2575 1.31954 16.2788 1.37118 16.2787 1.425L16.2775 4.12125ZM15.9675 7.58H11.0837C10.8966 7.58 10.7113 7.61686 10.5384 7.68847C10.3655 7.76009 10.2084 7.86505 10.0761 7.99737C9.9438 8.1297 9.83883 8.28679 9.76722 8.45968C9.69561 8.63257 9.65875 8.81787 9.65875 9.005V16.075C9.65875 16.4529 9.80888 16.8154 10.0761 17.0826C10.3434 17.3499 10.7058 17.5 11.0837 17.5H15.9675C16.3454 17.5 16.7079 17.3499 16.9751 17.0826C17.2424 16.8154 17.3925 16.4529 17.3925 16.075V9.005C17.3922 8.62728 17.2419 8.26515 16.9747 7.99818C16.7075 7.73121 16.3452 7.58 15.9675 7.58ZM16.1712 16.0775C16.1709 16.1313 16.1493 16.1828 16.1111 16.2208C16.073 16.2587 16.0213 16.28 15.9675 16.28H11.0837C11.0299 16.28 10.9783 16.2587 10.9401 16.2208C10.9019 16.1828 10.8803 16.1313 10.88 16.0775V9.00375C10.8803 8.94993 10.9019 8.89843 10.9401 8.86049C10.9783 8.82254 11.0299 8.80125 11.0837 8.80125H15.9675C16.0213 8.80125 16.073 8.82254 16.1111 8.86049C16.1493 8.89843 16.1709 8.94993 16.1712 9.00375V16.0775Z"
      fill="currentColor" />
  </svg>
);

const GiftCardIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.1875 9.58789V16.4629C17.1875 16.7944 17.0558 17.1124 16.8214 17.3468C16.587 17.5812 16.269 17.7129 15.9375 17.7129H4.0625C3.73098 17.7129 3.41304 17.5812 3.17862 17.3468C2.9442 17.1124 2.8125 16.7944 2.8125 16.4629V9.58789M9.6875 4.27539C9.6875 3.84274 9.55921 3.41981 9.31884 3.06008C9.07847 2.70035 8.73683 2.41997 8.33712 2.25441C7.93741 2.08884 7.49757 2.04552 7.07324 2.12992C6.64891 2.21433 6.25913 2.42267 5.9532 2.7286C5.64728 3.03452 5.43894 3.4243 5.35453 3.84863C5.27013 4.27296 5.31345 4.7128 5.47901 5.11251C5.64458 5.51222 5.92496 5.85387 6.28469 6.09423C6.64442 6.3346 7.06735 6.46289 7.5 6.46289H9.6875M9.6875 4.27539V6.46289M9.6875 4.27539C9.6875 3.84274 9.81579 3.41981 10.0562 3.06008C10.2965 2.70035 10.6382 2.41997 11.0379 2.25441C11.4376 2.08884 11.8774 2.04552 12.3018 2.12992C12.7261 2.21433 13.1159 2.42267 13.4218 2.7286C13.7277 3.03452 13.9361 3.4243 14.0205 3.84863C14.1049 4.27296 14.0616 4.7128 13.896 5.11251C13.7304 5.51222 13.45 5.85387 13.0903 6.09423C12.7306 6.3346 12.3076 6.46289 11.875 6.46289H9.6875M9.6875 6.46289V17.7129M2.5 9.58789H17.5C18.0175 9.58789 18.4375 9.16789 18.4375 8.65039V7.40039C18.4375 6.88206 18.0175 6.46289 17.5 6.46289H2.5C1.9825 6.46289 1.5625 6.88206 1.5625 7.40039V8.65039C1.5625 9.16789 1.9825 9.58789 2.5 9.58789Z"
      stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandsIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.50018 8.33203V15.832C2.50018 16.2741 2.67578 16.698 2.98834 17.0105C3.3009 17.3231 3.72482 17.4987 4.16685 17.4987H15.8335C16.2755 17.4987 16.6995 17.3231 17.012 17.0105C17.3246 16.698 17.5002 16.2741 17.5002 15.832V8.33203" stroke="currentColor" strokeWidth="1.2" />
    <path d="M12.361 17.4987V12.4987C12.361 12.0567 12.1854 11.6327 11.8729 11.3202C11.5603 11.0076 11.1364 10.832 10.6944 10.832H9.02769C8.58566 10.832 8.16174 11.0076 7.84918 11.3202C7.53662 11.6327 7.36102 12.0567 7.36102 12.4987V17.4987" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="16" />
    <path d="M18.1816 7.80333L16.77 2.8625C16.7401 2.75804 16.677 2.66615 16.5902 2.60075C16.5035 2.53534 16.3978 2.49998 16.2891 2.5H12.9166L13.3125 7.25333C13.3186 7.32973 13.3428 7.40358 13.3831 7.46878C13.4233 7.53398 13.4785 7.58867 13.5441 7.62833C13.8691 7.8225 14.5041 8.18083 15 8.33333C15.8466 8.59417 17.0833 8.5 17.7883 8.41333C17.8568 8.40447 17.9226 8.38076 17.981 8.34386C18.0395 8.30696 18.0891 8.25775 18.1266 8.19966C18.1641 8.14158 18.1884 8.07603 18.1979 8.00758C18.2074 7.93912 18.2018 7.86942 18.1816 7.80333Z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M11.6667 8.33333C12.14 8.1875 12.74 7.855 13.075 7.65667C13.1529 7.61004 13.2162 7.54239 13.2575 7.46147C13.2987 7.38055 13.3164 7.28965 13.3083 7.19917L12.9167 2.5H7.08333L6.69166 7.19917C6.68347 7.28978 6.70102 7.38086 6.7423 7.46195C6.78358 7.54303 6.8469 7.61081 6.92499 7.6575C7.25999 7.855 7.85999 8.1875 8.33333 8.33333C9.57749 8.71667 10.4225 8.71667 11.6667 8.33333Z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M3.22998 2.8625L1.81832 7.80417C1.79839 7.87015 1.79306 7.93968 1.80271 8.00793C1.81235 8.07618 1.83673 8.14151 1.87415 8.19939C1.91158 8.25727 1.96115 8.30632 2.01943 8.34312C2.07771 8.37992 2.1433 8.40359 2.21165 8.4125C2.91582 8.5 4.15332 8.59333 4.99998 8.33333C5.49582 8.18083 6.13165 7.8225 6.45582 7.62917C6.52151 7.58942 6.57678 7.5346 6.61707 7.46925C6.65736 7.40389 6.68149 7.32988 6.68748 7.25333L7.08332 2.5H3.71082C3.60217 2.49998 3.49647 2.53534 3.40971 2.60075C3.32295 2.66615 3.25986 2.75804 3.22998 2.8625Z" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const OccasionsIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_sidebar_occasions)">
      <path d="M18.75 1.87256L13.7456 1.87258V0.626953C13.7456 0.281641 13.4659 0.00195312 13.1206 0.00195312C12.7753 0.00195312 12.4956 0.281641 12.4956 0.626953V1.87227H7.49563V0.626953C7.49563 0.281641 7.21594 0.00195312 6.87063 0.00195312C6.52531 0.00195312 6.24563 0.281641 6.24563 0.626953V1.87227H1.25C0.559687 1.87227 0 2.43195 0 3.12227V18.7473C0 19.4376 0.559687 19.9973 1.25 19.9973H18.75C19.4403 19.9973 20 19.4376 20 18.7473V3.12227C20 2.43225 19.4403 1.87256 18.75 1.87256ZM18.75 18.7473H1.25V3.12227H6.24563V3.75195C6.24563 4.09725 6.52531 4.37695 6.87063 4.37695C7.21594 4.37695 7.49563 4.09725 7.49563 3.75195V3.12258H12.4956V3.75226C12.4956 4.09758 12.7753 4.37726 13.1206 4.37726C13.4659 4.37726 13.7456 4.09758 13.7456 3.75226V3.12258H18.75V18.7473ZM14.375 9.99756H15.625C15.97 9.99756 16.25 9.71756 16.25 9.37256V8.12256C16.25 7.77756 15.97 7.49756 15.625 7.49756H14.375C14.03 7.49756 13.75 7.77756 13.75 8.12256V9.37256C13.75 9.71756 14.03 9.99756 14.375 9.99756ZM14.375 14.9972H15.625C15.97 14.9972 16.25 14.7176 16.25 14.3722V13.1222C16.25 12.7772 15.97 12.4972 15.625 12.4972H14.375C14.03 12.4972 13.75 12.7772 13.75 13.1222V14.3722C13.75 14.7179 14.03 14.9972 14.375 14.9972ZM10.625 12.4972H9.375C9.03 12.4972 8.75 12.7772 8.75 13.1222V14.3722C8.75 14.7176 9.03 14.9972 9.375 14.9972H10.625C10.97 14.9972 11.25 14.7176 11.25 14.3722V13.1222C11.25 12.7776 10.97 12.4972 10.625 12.4972ZM10.625 7.49756H9.375C9.03 7.49756 8.75 7.77756 8.75 8.12256V9.37256C8.75 9.71756 9.03 9.99756 9.375 9.99756H10.625C10.97 9.99756 11.25 9.71756 11.25 9.37256V8.12256C11.25 7.77725 10.97 7.49756 10.625 7.49756ZM5.625 7.49756H4.375C4.03 7.49756 3.75 7.77756 3.75 8.12256V9.37256C3.75 9.71756 4.03 9.99756 4.375 9.99756H5.625C5.97 9.99756 6.25 9.71756 6.25 9.37256V8.12256C6.25 7.77725 5.97 7.49756 5.625 7.49756ZM5.625 12.4972H4.375C4.03 12.4972 3.75 12.7772 3.75 13.1222V14.3722C3.75 14.7176 4.03 14.9972 4.375 14.9972H5.625C5.97 14.9972 6.25 14.7176 6.25 14.3722V13.1222C6.25 12.7776 5.97 12.4972 5.625 12.4972Z"
        fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_sidebar_occasions">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SettlementsIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.31201 11.6816H3.99109" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.45904 15.1543H3.99109" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.5982 8.20898H3.99109" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.85668 19.5391H3.04062C1.69269 19.5391 0.599976 18.4608 0.599976 17.1308V4.94805C0.599976 3.61801 1.69269 2.53979 3.04062 2.53979H10.0797" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.97498 2.53939H12.549C13.8969 2.53939 14.9896 3.61761 14.9896 4.94765V7.5625" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.6 15.1547C19.6 17.5761 17.6106 19.5391 15.1566 19.5391C12.7026 19.5391 10.7133 17.5761 10.7133 15.1547C10.7133 12.7332 12.7026 10.7703 15.1566 10.7703C17.6106 10.7703 19.6 12.7332 19.6 15.1547Z" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.9989 13.7966V15.4707H16.2107" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReportsIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.9492 7.08475V18.6102C18.9492 20.4823 17.4315 22 15.5594 22H5.38989C3.51773 22 2.00006 20.4823 2.00006 18.6102V5.38983C2.00006 3.51767 3.51773 2 5.38989 2H14.1553C15.0543 2.00001 15.9165 2.35714 16.5523 2.99284L17.9564 4.39695C18.5921 5.03269 18.9492 5.8949 18.9492 6.79394V7.08475ZM18.9492 7.08475H15.5594C14.6233 7.08475 13.8645 6.32589 13.8645 5.38983V2M5.38989 16.9153H15.5594M7.08481 13.8644V16.9153M10.4746 12.1695V16.9153M13.8645 10.4746V16.9153"
      stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SupportIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1.667A8.333 8.333 0 1 0 10 18.334 8.333 8.333 0 0 0 10 1.667ZM10 14.167a.833.833 0 1 1 0-1.667.833.833 0 0 1 0 1.667Zm.833-3.334H9.167V5.834h1.666v4.999Z"
      fill="currentColor" />
  </svg>
);


const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shopParam = searchParams.get("shop");
  const session = useSession();
  const { navigate } = useShopifyNavigation();

  const allMenuItems = [
    { name: 'Dashboard', icon: DashboardIcon, href: '/dashboard' },
    { name: 'Gift Cards / Orders', icon: GiftCardIcon, href: '/vouchers' },
    { name: 'Brands', icon: BrandsIcon, href: '/brandsPartner' },
    { name: 'Occasions', icon: OccasionsIcon, href: '/occasions' },
    { name: 'Settlements', icon: SettlementsIcon, href: '/settlements' },
    { name: 'Reports', icon: ReportsIcon, href: '/reports' },
  ];

  
  // --------------------------------
  // MODE HANDLING
  // --------------------------------
  let menuItems = [];

  if (shopParam) {
    // Shopify Admin Mode
    const shopifyRoutes = ['/dashboard', '/vouchers', '/settlements', '/reports'];

    menuItems = allMenuItems
      .filter(item => shopifyRoutes.includes(item.href))
      .map(item => ({
        ...item,
        href: `/shopify${item.href}`
      }));
  }
  else if (session?.user?.role === 'ADMIN') {
    // Full access for Admin
    menuItems = allMenuItems;
  }
  else {
    // Restricted normal user mode
    menuItems = allMenuItems.filter(item =>
      ['/dashboard', '/vouchers'].includes(item.href)
    );
  }

  // --------------------------------
  // ACTIVE STATE CHECK
  // --------------------------------
  const isActiveItem = (href) => {
    if (href === '/dashboard' || href === '/shopify/dashboard') {
      return (
        pathname === '/' ||
        pathname === '/dashboard' ||
        pathname === '/shopify/dashboard'
      );
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out 
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header - Matching height with top header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-fit h-fit">
              <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0H39C44.5228 0 49 4.47715 49 10V39C49 44.5228 44.5228 49 39 49H10C4.47715 49 0 44.5228 0 39V10C0 4.47715 4.47715 0 10 0Z" fill="url(#paint0_linear_3906_4784)" />
                <path d="M35.3889 19.0557H13.6111C12.8594 19.0557 12.25 19.6651 12.25 20.4169V23.1391C12.25 23.8908 12.8594 24.5002 13.6111 24.5002H35.3889C36.1406 24.5002 36.75 23.8908 36.75 23.1391V20.4169C36.75 19.6651 36.1406 19.0557 35.3889 19.0557Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24.5 19.0557V36.7502" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M34.0283 24.5V34.0278C34.0283 34.7498 33.7415 35.4422 33.2309 35.9527C32.7204 36.4632 32.028 36.75 31.306 36.75H17.6949C16.973 36.75 16.2805 36.4632 15.77 35.9527C15.2595 35.4422 14.9727 34.7498 14.9727 34.0278V24.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.3755 19.0551C17.473 19.0551 16.6075 18.6966 15.9694 18.0585C15.3312 17.4203 14.9727 16.5548 14.9727 15.6524C14.9727 14.7499 15.3312 13.8844 15.9694 13.2462C16.6075 12.6081 17.473 12.2496 18.3755 12.2496C19.6885 12.2267 20.9752 12.8638 22.0678 14.0778C23.1604 15.2918 24.0081 17.0263 24.5005 19.0551C24.9928 17.0263 25.8406 15.2918 26.9332 14.0778C28.0257 12.8638 29.3124 12.2267 30.6255 12.2496C31.528 12.2496 32.3935 12.6081 33.0316 13.2462C33.6698 13.8844 34.0283 14.7499 34.0283 15.6524C34.0283 16.5548 33.6698 17.4203 33.0316 18.0585C32.3935 18.6966 31.528 19.0551 30.6255 19.0551" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="paint0_linear_3906_4784" x1="49" y1="18.0283" x2="2.3578" y2="38.8528" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ED457D" />
                    <stop offset="1" stopColor="#FA8F42" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 mb-2">Gift Card Management & Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">

            {menuItems.map((item) => (
              <li key={item.name}>

                {/* -------------------------
                    Shopify Mode Navigation
                   ------------------------- */}
                {shopParam ? (
                  <button
                    onClick={() => {
                      navigate(item.href);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors cursor-pointer
                      ${isActiveItem(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                ) : (
                  /* -------------------------
                      Normal Navigation
                     ------------------------- */
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors cursor-pointer
                      ${isActiveItem(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )}

              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;