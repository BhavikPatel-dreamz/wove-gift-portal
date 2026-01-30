'use client';

import {
  Gift,
  User,
  ChevronDown,
  ShoppingBasket,
  Heart,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/contexts/SessionContext';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { destroySession } from '../../../lib/action/userAction/session';
import { usePathname, useRouter } from 'next/navigation';
import { resetFlow } from '../../../redux/giftFlowSlice';
import { initializeCart, initializeBulkCart } from '../../../redux/cartSlice';


// Desktop navigation links (without the three items)
const desktopNavLinks = {
  Home: '/',
  About: '/about',
  FAQs: '/faq',
  'Send Gift Card': '/gift',
};

// All navigation links for mobile (includes all items)
const mobileNavLinks = {
  Home: '/',
  About: '/about',
  FAQs: '/faq',
  'Send Gift Card': '/gift',
  'Vouchers & Gift Cards': '/my-gift',
  'Support & Requests' : '/support',
  'Track Request Status': '/track-request'
};



const countries = [
  { name: "South Africa", code: "za" },
  { name: "India", code: "in" },
  { name: "United States", code: "us" },
  { name: "United Kingdom", code: "gb" },
  { name: "Australia", code: "au" },
];

const Header = () => {
  const session = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  
  // ✅ Get both regular and bulk cart items
  const cartItems = useSelector((state) => state.cart.items);
  const bulkItems = useSelector((state) => state.cart.cartItems);

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(countries[0]);
  const [openDropdown, setOpenDropdown] = useState(false);


  const handleSelect = (country) => {
    setSelected(country);
    setOpen(false);
  };

  // ✅ Calculate combined cart count
  const cartCount = cartItems.length + bulkItems.length;

  // ✅ Initialize cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    // Initialize both carts from localStorage
    dispatch(initializeCart());
    dispatch(initializeBulkCart());

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await destroySession();
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = (item) => {
    // if (item === 'Send Gift Card') dispatch(resetFlow());
    setMobileMenuOpen(false);
  };
  const pathname = usePathname();


  const activeTab = Object.keys(desktopNavLinks).find(
    (key) => desktopNavLinks[key] === pathname
  );
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const linkClass = (path) =>
    `block px-6 py-2 text-sm rounded-md transition
     ${pathname === path
      ? "text-black font-semibold bg-gray-100"
      : "text-gray-700 hover:bg-gray-100"
    }`;


  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
          }`}
      >
        {/* Main Header - Hide when mobile menu is open */}
        <div className={`max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${mobileMenuOpen ? 'lg:block hidden' : ''}`}>
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
            {/* Mobile/Tablet Menu Toggle (hidden on desktop) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation (hidden on mobile/tablet) - Using desktopNavLinks */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {Object.keys(desktopNavLinks).map((item) => (
                <Link
                  key={item}
                  href={desktopNavLinks[item]}
                  onClick={() => handleNavClick(item)}
                  className={`nav-link font-poppins text-sm xl:text-base whitespace-nowrap ${activeTab === item
                    ? "text-[#ed457d] underline underline-offset-4"
                    : "text-gray-800"
                    }`}
                >
                  {item}
                </Link>
              ))}
            </nav>


            {/* Logo - Always Centered */}
            <div className="logo-container absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <svg width="188" height="49" viewBox="0 0 188 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_337_1059)">
                    <path d="M10 0H39C44.5228 0 49 4.47715 49 10V39C49 44.5228 44.5228 49 39 49H10C4.47715 49 0 44.5228 0 39V10C0 4.47715 4.47715 0 10 0Z" fill="url(#paint0_linear_337_1059)" />
                    <path d="M35.3889 19.0555H13.6111C12.8594 19.0555 12.25 19.6649 12.25 20.4167V23.1389C12.25 23.8906 12.8594 24.5 13.6111 24.5H35.3889C36.1406 24.5 36.75 23.8906 36.75 23.1389V20.4167C36.75 19.6649 36.1406 19.0555 35.3889 19.0555Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M24.5 19.0555V36.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M34.028 24.5V34.0278C34.028 34.7498 33.7412 35.4422 33.2306 35.9527C32.7201 36.4632 32.0277 36.75 31.3057 36.75H17.6946C16.9727 36.75 16.2802 36.4632 15.7697 35.9527C15.2592 35.4422 14.9724 34.7498 14.9724 34.0278V24.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.3752 19.0555C17.4727 19.0555 16.6072 18.697 15.9691 18.0589C15.3309 17.4207 14.9724 16.5552 14.9724 15.6528C14.9724 14.7503 15.3309 13.8848 15.9691 13.2466C16.6072 12.6085 17.4727 12.25 18.3752 12.25C19.6882 12.2271 20.9749 12.8642 22.0675 14.0782C23.1601 15.2922 24.0078 17.0267 24.5002 19.0555C24.9925 17.0267 25.8403 15.2922 26.9329 14.0782C28.0254 12.8642 29.3121 12.2271 30.6252 12.25C31.5277 12.25 32.3932 12.6085 33.0313 13.2466C33.6695 13.8848 34.028 14.7503 34.028 15.6528C34.028 16.5552 33.6695 17.4207 33.0313 18.0589C32.3932 18.697 31.5277 19.0555 30.6252 19.0555" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M84.1271 17.53L80.1481 33.745H74.6051L72.3741 23.809L70.0971 33.745H64.5541L60.6211 17.53H65.4971L67.3831 28.616L69.9361 17.53H74.8811L77.3651 28.524L79.2511 17.53H84.1271Z" fill="url(#paint1_linear_337_1059)" />
                    <path d="M92.043 33.906C90.755 33.906 89.5974 33.6377 88.57 33.101C87.558 32.5643 86.7607 31.7977 86.178 30.801C85.5954 29.8043 85.304 28.6313 85.304 27.282C85.304 25.948 85.5954 24.7827 86.178 23.786C86.776 22.7893 87.581 22.0227 88.593 21.486C89.6204 20.9493 90.778 20.681 92.066 20.681C93.354 20.681 94.504 20.9493 95.516 21.486C96.5434 22.0227 97.3484 22.7893 97.931 23.786C98.529 24.7827 98.828 25.948 98.828 27.282C98.828 28.616 98.529 29.789 97.931 30.801C97.3484 31.7977 96.5434 32.5643 95.516 33.101C94.4887 33.6377 93.331 33.906 92.043 33.906ZM92.043 29.996C92.6717 29.996 93.193 29.766 93.607 29.306C94.0364 28.8307 94.251 28.156 94.251 27.282C94.251 26.408 94.0364 25.741 93.607 25.281C93.193 24.821 92.6794 24.591 92.066 24.591C91.4527 24.591 90.939 24.821 90.525 25.281C90.111 25.741 89.904 26.408 89.904 27.282C89.904 28.1713 90.1034 28.846 90.502 29.306C90.9007 29.766 91.4144 29.996 92.043 29.996Z" fill="url(#paint2_linear_337_1059)" />
                    <path d="M106.849 29.49L109.264 20.842H114.071L109.632 33.745H104.02L99.5811 20.842H104.388L106.849 29.49Z" fill="url(#paint3_linear_337_1059)" />
                    <path d="M127.927 27.144C127.927 27.4967 127.904 27.8493 127.858 28.202H119.325C119.371 28.9073 119.562 29.4363 119.9 29.789C120.252 30.1263 120.697 30.295 121.234 30.295C121.985 30.295 122.522 29.9577 122.844 29.283H127.651C127.451 30.1723 127.06 30.9697 126.478 31.675C125.91 32.365 125.19 32.9093 124.316 33.308C123.442 33.7067 122.476 33.906 121.418 33.906C120.145 33.906 119.01 33.6377 118.014 33.101C117.032 32.5643 116.258 31.7977 115.691 30.801C115.139 29.8043 114.863 28.6313 114.863 27.282C114.863 25.9327 115.139 24.7673 115.691 23.786C116.243 22.7893 117.009 22.0227 117.991 21.486C118.987 20.9493 120.13 20.681 121.418 20.681C122.69 20.681 123.817 20.9417 124.799 21.463C125.78 21.9843 126.547 22.7357 127.099 23.717C127.651 24.683 127.927 25.8253 127.927 27.144ZM123.327 26.017C123.327 25.465 123.143 25.0357 122.775 24.729C122.407 24.407 121.947 24.246 121.395 24.246C120.843 24.246 120.39 24.3993 120.038 24.706C119.685 24.9973 119.455 25.4343 119.348 26.017H123.327Z" fill="url(#paint4_linear_337_1059)" />
                    <path d="M144.524 22.866C144.263 22.4367 143.903 22.107 143.443 21.877C142.998 21.647 142.469 21.532 141.856 21.532C140.721 21.532 139.824 21.9 139.165 22.636C138.521 23.372 138.199 24.361 138.199 25.603C138.199 26.9983 138.544 28.064 139.234 28.8C139.939 29.5207 140.959 29.881 142.293 29.881C143.872 29.881 144.999 29.168 145.674 27.742H141.143V24.499H149.561V28.869C149.208 29.7277 148.687 30.5327 147.997 31.284C147.322 32.0353 146.464 32.6563 145.421 33.147C144.378 33.6223 143.19 33.86 141.856 33.86C140.231 33.86 138.789 33.515 137.532 32.825C136.29 32.1197 135.324 31.146 134.634 29.904C133.959 28.6467 133.622 27.213 133.622 25.603C133.622 24.0083 133.959 22.59 134.634 21.348C135.324 20.0907 136.29 19.117 137.532 18.427C138.774 17.7217 140.208 17.369 141.833 17.369C143.872 17.369 145.559 17.8597 146.893 18.841C148.227 19.8223 149.055 21.164 149.377 22.866H144.524Z" fill="url(#paint5_linear_337_1059)" />
                    <path d="M153.858 19.646C153.061 19.646 152.417 19.4313 151.926 19.002C151.451 18.5573 151.213 18.0053 151.213 17.346C151.213 16.6713 151.451 16.1117 151.926 15.667C152.417 15.2223 153.061 15 153.858 15C154.64 15 155.269 15.2223 155.744 15.667C156.235 16.1117 156.48 16.6713 156.48 17.346C156.48 18.0053 156.235 18.5573 155.744 19.002C155.269 19.4313 154.64 19.646 153.858 19.646ZM156.089 20.842V33.745H151.581V20.842H156.089Z" fill="url(#paint6_linear_337_1059)" />
                    <path d="M165.625 24.591H163.601V33.745H159.07V24.591H157.667V20.842H159.07V20.727C159.07 19.071 159.553 17.806 160.519 16.932C161.501 16.0427 162.904 15.598 164.728 15.598C165.096 15.598 165.38 15.6057 165.579 15.621V19.462C165.457 19.4467 165.288 19.439 165.073 19.439C164.583 19.439 164.222 19.554 163.992 19.784C163.762 19.9987 163.632 20.3513 163.601 20.842H165.625V24.591Z" fill="url(#paint7_linear_337_1059)" />
                    <path d="M174.849 29.904V33.745H172.894C169.598 33.745 167.949 32.112 167.949 28.846V24.591H166.362V20.842H167.949V17.714H172.48V20.842H174.826V24.591H172.48V28.915C172.48 29.2677 172.557 29.5207 172.71 29.674C172.879 29.8273 173.155 29.904 173.538 29.904H174.849Z" fill="url(#paint8_linear_337_1059)" />
                    <path d="M182.414 33.906C181.249 33.906 180.206 33.7143 179.286 33.331C178.381 32.9323 177.661 32.3957 177.124 31.721C176.603 31.031 176.311 30.2567 176.25 29.398H180.62C180.681 29.812 180.873 30.134 181.195 30.364C181.517 30.594 181.916 30.709 182.391 30.709C182.759 30.709 183.05 30.6323 183.265 30.479C183.48 30.3257 183.587 30.1263 183.587 29.881C183.587 29.559 183.411 29.3213 183.058 29.168C182.705 29.0147 182.123 28.846 181.31 28.662C180.39 28.478 179.623 28.271 179.01 28.041C178.397 27.811 177.86 27.4353 177.4 26.914C176.955 26.3927 176.733 25.6873 176.733 24.798C176.733 24.0313 176.94 23.3413 177.354 22.728C177.768 22.0993 178.374 21.601 179.171 21.233C179.984 20.865 180.957 20.681 182.092 20.681C183.779 20.681 185.105 21.095 186.071 21.923C187.037 22.751 187.597 23.8397 187.75 25.189H183.679C183.602 24.775 183.418 24.4607 183.127 24.246C182.851 24.016 182.475 23.901 182 23.901C181.632 23.901 181.348 23.97 181.149 24.108C180.965 24.246 180.873 24.4377 180.873 24.683C180.873 24.9897 181.049 25.2273 181.402 25.396C181.755 25.5493 182.322 25.7103 183.104 25.879C184.039 26.0783 184.814 26.3007 185.427 26.546C186.056 26.7913 186.6 27.19 187.06 27.742C187.535 28.2787 187.773 29.0147 187.773 29.95C187.773 30.7013 187.551 31.376 187.106 31.974C186.677 32.572 186.056 33.0473 185.243 33.4C184.446 33.7373 183.503 33.906 182.414 33.906Z" fill="url(#paint9_linear_337_1059)" />
                  </g>
                  <defs>
                    <linearGradient id="paint0_linear_337_1059" x1="49" y1="18.0283" x2="2.3578" y2="38.8528" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ED457D" />
                      <stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_337_1059" x1="60" y1="20.6224" x2="99.7179" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint2_linear_337_1059" x1="60" y1="20.6224" x2="99.7178" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint3_linear_337_1059" x1="60" y1="20.6224" x2="99.7179" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint4_linear_337_1059" x1="60" y1="20.6224" x2="99.7179" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint5_linear_337_1059" x1="60" y1="20.6224" x2="99.7179" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint6_linear_337_1059" x1="59.9999" y1="20.6224" x2="99.7178" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint7_linear_337_1059" x1="60.0001" y1="20.6224" x2="99.718" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint8_linear_337_1059" x1="60.0001" y1="20.6224" x2="99.718" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <linearGradient id="paint9_linear_337_1059" x1="60.0001" y1="20.6224" x2="99.718" y2="85.981" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FA8F42" />
                      <stop offset="1" stopColor="#ED457D" />
                    </linearGradient>
                    <clipPath id="clip0_337_1059">
                      <rect width="188" height="49" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
            </div>

            {/* Right Section - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
              <div className="hidden lg:flex items-center space-x-2">
                {session ? (
                  <>
                    {(session.user.role === 'ADMIN') ? (
                      <Link href="/dashboard">
                        <button className="btn-outline flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 lg:px-4 py-2">
                          <User size={14} className="lg:w-4 lg:h-4" />
                          <span className="hidden xl:inline">
                            {session.user.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
                          </span>
                          <span className="xl:hidden">
                            {session.user.role === 'ADMIN' ? 'Admin' : 'Dash'}
                          </span>
                        </button>
                      </Link>
                    ) : (
                      <div className="relative inline-block text-left" ref={dropdownRef}>
                        <button
                          onClick={() => setOpenDropdown(!openDropdown)}
                          className="
                inline-flex items-center gap-1.5 sm:gap-2 
                cursor-pointer
                bg-[#ED457D] text-white
                text-xs lg:text-sm font-bold
                px-3 sm:px-3.5 lg:px-4 py-2
                rounded-full
                border-none
                transition-all duration-300 ease-in-out
                hover:bg-[#D93B6E]
                hover:-translate-y-0.5
                hover:shadow-[0_4px_10px_rgba(237,69,125,0.35)]
                active:translate-y-0
                active:scale-[0.96]
                active:shadow-[0_2px_6px_rgba(237,69,125,0.25)]
              "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 17 18"
                            fill="none"
                            className="w-4 h-4 sm:w-[17px] sm:h-[18px]"
                          >
                            <path
                              d="M8.36364 0C9.47272 0 10.5364 0.459739 11.3206 1.27808C12.1049 2.09642 12.5455 3.20633 12.5455 4.36364C12.5455 5.52095 12.1049 6.63085 11.3206 7.44919C10.5364 8.26753 9.47272 8.72727 8.36364 8.72727C7.25455 8.72727 6.19089 8.26753 5.40664 7.44919C4.6224 6.63085 4.18182 5.52095 4.18182 4.36364C4.18182 3.20633 4.6224 2.09642 5.40664 1.27808C6.19089 0.459739 7.25455 0 8.36364 0ZM8.36364 17.4545C8.36364 17.4545 16.7273 17.4545 16.7273 15.2727C16.7273 12.6545 12.65 9.81818 8.36364 9.81818C4.07727 9.81818 0 12.6545 0 15.2727C0 17.4545 8.36364 17.4545 8.36364 17.4545Z"
                              fill="white"
                            />
                          </svg>
                          <span className="hidden xl:inline whitespace-nowrap">
                            {session.user.firstName + " " + session.user.lastName}
                          </span>
                          <span className="xl:hidden">
                            {session.user.role === "ADMIN" ? "Admin" : "Dash"}
                          </span>
                        </button>

                        {openDropdown && (
                          <div className="origin-top-right absolute right-0 mt-2 w-48 sm:w-56 rounded-[20px] shadow-lg bg-white ring-opacity-5 z-50">
                            <div className="pt-2.5">
                              <button className="w-full text-left px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold text-black hover:text-gray-900 focus:outline-none">
                                My Profile
                              </button>
                            </div>
                            <div className="">
                              <Link
                                href="/my-gift"
                                className={linkClass("/my-gift")}
                              >
                                Vouchers & Gift Cards
                              </Link>
                              <Link
                                href="/support"
                                className={linkClass("/support")}
                              >
                                Support & Requests
                              </Link>
                              <Link
                                href="/track-request"
                                className={linkClass("/track-request")}
                              >
                                Track Request Status
                              </Link>
                            </div>
                            <div className="pb-2 border-t border-gray-200">
                              <Link
                                href="#"
                                className="block px-4 sm:px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                onClick={handleLogout}
                              >
                                Sign Out
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/login">
                    <button
                      className="
            inline-flex items-center gap-1.5 sm:gap-2
            cursor-pointer
            bg-[#ED457D] text-white
            text-xs lg:text-sm font-bold
            px-3 sm:px-3.5 lg:px-4 py-2
            rounded-full
            border-none
            transition-all duration-300 ease-in-out
            hover:bg-[#D93B6E]
            hover:-translate-y-0.5
            hover:shadow-[0_4px_10px_rgba(237,69,125,0.35)]
            active:translate-y-0
            active:scale-[0.96]
            active:shadow-[0_2px_6px_rgba(237,69,125,0.25)]
          "
                    >
                      <User size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden lg:inline">Login</span>
                    </button>
                  </Link>
                )}
              </div>

              {/* Cart - Always visible with combined count */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center p-1.5 sm:p-2 lg:p-2.5 
      rounded-full border border-[#ED457D]/50 bg-white 
      hover:bg-[#ED457D]/10 transition-all duration-200"
                aria-label="Shopping cart"
              >
                <ShoppingBasket
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  color="#ED457D"
                />

                {/* ✅ Show combined count badge */}
                {mounted && cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-[#ED457D] text-white 
          w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-[11px] flex items-center justify-center 
          rounded-full shadow-md font-medium"
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Fullscreen Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-[9999] lg:hidden overflow-y-auto">
            {/* Header Row */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] rounded-xl flex items-center justify-center">
                  <Gift size={18} className="sm:w-5 sm:h-5" color="white" strokeWidth={2.5} />
                </div>
                <span className="logo-text text-base sm:text-lg">Wove Gifts</span>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={22} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Nav Links - Using mobileNavLinks */}
            <div className="flex flex-col px-4 sm:px-6 mt-4 sm:mt-6 space-y-1">
              {Object.keys(mobileNavLinks).map((item) => (
                <Link
                  key={item}
                  href={mobileNavLinks[item]}
                  onClick={() => handleNavClick(item)}
                  className="py-3 sm:py-4 text-[#1A1A1A] text-[15px] sm:text-[16px] md:text-[18px] border-b border-b-[rgba(0,0,0,0.10)] hover:text-[#ED457D] transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Auth Buttons Container */}
            <div className="px-4 sm:px-6 mt-6 sm:mt-8 space-y-3">
              {/* Login/Logout Button */}
              {!mounted ? (
                <button className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#ED457D] text-white py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base font-medium hover:bg-[#d63d6e] transition-colors">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 3C11.5609 3 12.5783 3.42143 13.3284 4.17157C14.0786 4.92172 14.5 5.93913 14.5 7C14.5 8.06087 14.0786 9.07828 13.3284 9.82843C12.5783 10.5786 11.5609 11 10.5 11C9.43913 11 8.42172 10.5786 7.67157 9.82843C6.92143 9.07828 6.5 8.06087 6.5 7C6.5 5.93913 6.92143 4.92172 7.67157 4.17157C8.42172 3.42143 9.43913 3 10.5 3ZM10.5 19C10.5 19 18.5 19 18.5 17C18.5 14.6 14.6 12 10.5 12C6.4 12 2.5 14.6 2.5 17C2.5 19 10.5 19 10.5 19Z" fill="white" />
                  </svg>

                  Login / Register
                </button>
              )
                : session ? (
                  <div className='flex flex-col gap-3'>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#ED457D] text-white py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base font-medium hover:bg-[#d63d6e] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )
                  : (
                    <Link href="/login">
                      <button className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#ED457D] text-white py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base font-medium hover:bg-[#d63d6e] transition-colors">
                        <svg
                          width="20"
                          height="20"
                          className="sm:w-[22px] sm:h-[22px]"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.5 3C11.5609 3 12.5783 3.42143 13.3284 4.17157C14.0786 4.92172 14.5 5.93913 14.5 7C14.5 8.06087 14.0786 9.07828 13.3284 9.82843C12.5783 10.5786 11.5609 11 10.5 11C9.43913 11 8.42172 10.5786 7.67157 9.82843C6.92143 9.07828 6.5 8.06087 6.5 7C6.5 5.93913 6.92143 4.92172 7.67157 4.17157C8.42172 3.42143 9.43913 3 10.5 3ZM10.5 19C10.5 19 18.5 19 18.5 17C18.5 14.6 14.6 12 10.5 12C6.4 12 2.5 14.6 2.5 17C2.5 19 10.5 19 10.5 19Z"
                            fill="white"
                          />
                        </svg>
                        Login / Register
                      </button>
                    </Link>
                  )}
            </div>
          </div>
        )}
      </header>

    </>
  );
};

export default Header;