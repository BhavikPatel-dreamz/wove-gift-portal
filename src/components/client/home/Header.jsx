'use client';

import {
  User,
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
import { resetFlow,clearCsvFileData } from '../../../redux/giftFlowSlice';
import {
  removeFromWishlist,
  toggleWishlistAsync,
} from '../../../redux/wishlistSlice';


// Desktop navigation links (without the three items)
const desktopNavLinks = {
  Home: '/',
  About: '/about',
  FAQs: '/faq',
  'Send Gift Card': '/gift',
};

// All navigation links for mobile (includes all items)
const mobilePublicNavLinks = {
  Home: '/',
  About: '/about',
  FAQs: '/faq',
  'Send Gift Card': '/gift',
};

const mobileMemberNavLinks = {
  'My Profile': '/profile',
  'Vouchers & Gift Cards': '/my-gift',
  'Support & Requests': '/support',
  'Track Request Status': '/track-request',
};

const Header = () => {
  const session = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  
  // ✅ Get both regular and bulk cart items
  const cartItems = useSelector((state) => state.cart.items);
  const bulkItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // ✅ Calculate combined cart count
  const cartCount = cartItems.length + bulkItems.length;
  const wishlistCount = wishlistItems.length;
  const mobileNavLinks = session
    ? { ...mobilePublicNavLinks, ...mobileMemberNavLinks }
    : mobilePublicNavLinks;

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const handleRemoveWishlist = (item) => {
    if (session?.user?.id) {
      dispatch(toggleWishlistAsync({ userId: session.user.id, item }));
      return;
    }
    dispatch(removeFromWishlist(item.key));
  };

  useEffect(() => {
    if (!mounted) return;

    const isMobileViewport = window.matchMedia('(max-width: 1023px)').matches;
    if (!mobileMenuOpen || !isMobileViewport) return;

    const scrollY = window.scrollY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen, mounted]);

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
    if (item == 'Send Gift Card') {
      dispatch(resetFlow());
      dispatch(clearCsvFileData());
    }
    setMobileMenuOpen(false);
  };
  const pathname = usePathname();


  const activeTab = Object.keys(desktopNavLinks).find(
    (key) => desktopNavLinks[key] === pathname
  );
  const dropdownRef = useRef(null);
  const wishlistDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
      if (
        wishlistDropdownRef.current &&
        !wishlistDropdownRef.current.contains(event.target)
      ) {
        setWishlistOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatWishlistPrice = (item) => {
    if (item?.sourceType === 'brand') {
      return 'Brand wishlist';
    }

    const currency = item?.amountCurrency || 'ZAR';
    const amount = (Number(item?.amountValue) || 0) * (Number(item?.quantity) || 1);

    try {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  };
  const linkClass = (path) =>
    `block px-6 py-2 text-sm rounded-md transition
     ${pathname === path
      ? "text-black font-semibold bg-gray-100"
      : "text-gray-700 hover:bg-gray-100"
    }`;


  return (
    <>
      <header
        className={`fixed top-0 z-999 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
          }`}
      >
        {/* Main Header - Hide when mobile menu is open */}
        <div className={`max-w-360 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${mobileMenuOpen ? 'lg:block hidden' : ''}`}>
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* Mobile/Tablet Menu Toggle (hidden on desktop) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#000000] hover:text-[#000000] hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} color="#000000" /> : <Menu size={24} color="#000000" />}
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
              <Link href="/" className="flex items-center cursor-pointer h-8 sm:h-9 lg:h-10">
                <img
                  src="/wovelogo.png"
                  alt="Wove Gift"
                  className="h-full w-auto max-w-[120px] sm:max-w-[150px] object-contain"
                />
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
                          onClick={() => {
                            setOpenDropdown(!openDropdown);
                            setWishlistOpen(false);
                          }}
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
                            className="w-4 h-4 sm:w-4.25 sm:h-4.5"
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
                              <Link
                                href="/profile"
                                onClick={() => setOpenDropdown(false)}
                                className={linkClass("/profile")}
                              >
                                My Profile
                              </Link>
                            </div>
                            <div className="">
                              <Link
                                href="/my-gift"
                                onClick={() => setOpenDropdown(false)}
                                className={linkClass("/my-gift")}
                              >
                                Vouchers & Gift Cards
                              </Link>
                              <Link
                                href="/support"
                                onClick={() => setOpenDropdown(false)}
                                className={linkClass("/support")}
                              >
                                Support & Requests
                              </Link>
                              <Link
                                href="/track-request"
                                onClick={() => setOpenDropdown(false)}
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
                      <User size={16} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      <span className="hidden lg:inline">Login</span>
                    </button>
                  </Link>
                )}
              </div>

              <div className="relative" ref={wishlistDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setWishlistOpen((prev) => !prev);
                    setOpenDropdown(false);
                  }}
                  className="relative flex items-center justify-center p-1 sm:p-1.5 lg:p-2 rounded-full border border-[#ED457D]/50 bg-transparent hover:bg-[#ED457D]/10 transition-all duration-200 cursor-pointer"
                  aria-label="Wishlist"
                  aria-expanded={wishlistOpen}
                >
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${mounted && wishlistCount > 0 ? 'fill-[#ED457D]' : ''}`}
                    color="#ED457D"
                  />

                  {mounted && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ED457D] text-white w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-[11px] flex items-center justify-center rounded-full shadow-md font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {wishlistOpen && (
                  <div className="absolute right-0 mt-2 w-[290px] max-w-[90vw] rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">Wishlist</p>
                      <p className="text-xs font-medium text-[#ED457D]">{wishlistCount} item{wishlistCount === 1 ? '' : 's'}</p>
                    </div>

                    {!mounted || wishlistCount === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500 text-center">
                        No wishlist items yet.
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto">
                        {wishlistItems.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                                {item.logo ? (
                                  <img
                                    src={item.logo}
                                    alt={item.brandName}
                                    className="w-full h-full object-contain p-1 rounded-lg"
                                  />
                                ) : (
                                  <Heart className="w-4 h-4 text-[#ED457D]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {item.brandName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatWishlistPrice(item)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveWishlist(item)}
                              className="text-xs text-[#ED457D] hover:text-[#D93B6E] font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart - Always visible with combined count */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center p-1 sm:p-1.5 lg:p-2 
      rounded-full border border-[#ED457D]/50 bg-transparent
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
          <div className="fixed inset-0 bg-white z-99 lg:hidden overflow-y-auto">
            {/* Header Row */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="logo-container">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center cursor-pointer h-8 sm:h-9 lg:h-10"
                >
                  <img
                    src="/wovelogo.png"
                    alt="Wove Gift"
                    className="h-full w-auto max-w-[120px] sm:max-w-[150px] object-contain"
                  />
                </Link>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#000000] hover:text-[#000000] rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={22} color="#000000" className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Nav Links - Using mobileNavLinks */}
            <div className="flex flex-col px-4 sm:px-6 mt-4 sm:mt-6 space-y-1">
              {Object.keys(mobileNavLinks).map((item) => (
                <Link
                  key={item}
                  href={mobileNavLinks[item]}
                  onClick={() => handleNavClick(item)}
                  className={`py-3 sm:py-4 ${activeTab === item
                    ? "text-[#ed457d]"
                    : "text-gray-800"
                    } text-[15px] sm:text-[16px] md:text-[18px] border-b border-b-[rgba(0,0,0,0.10)] hover:text-[#ED457D] transition-colors`}
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
                          className="sm:w-5.5 sm:h-5.5"
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
