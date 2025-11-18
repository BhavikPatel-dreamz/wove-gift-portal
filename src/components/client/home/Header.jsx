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
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { destroySession } from '../../../lib/action/userAction/session';
import { useRouter } from 'next/navigation';
import { resetFlow } from '../../../redux/giftFlowSlice';

const navLinks = {
  Home: '/',
  About: '/about',
  FAQs: '/faq',
  'Send Gift Card': '/gift',
};

const Header = () => {
  const session = useSession();
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItems.length;

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (item === 'Send Gift Card') dispatch(resetFlow());
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
            {/* Mobile/Tablet Menu Toggle (hidden on desktop) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation (hidden on mobile/tablet) */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {Object.keys(navLinks).map((item) => (
                <Link
                  key={item}
                  href={navLinks[item]}
                  onClick={() => handleNavClick(item)}
                  className="nav-link font-poppins text-sm xl:text-base whitespace-nowrap"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Logo - Always Centered */}
            <div className="logo-container absolute left-1/2 transform -translate-x-1/2">
              <div className="logo-icon w-8 h-8 sm:w-10 sm:h-10">
                <Gift size={20} className="sm:w-6 sm:h-6" color="white" strokeWidth={2.5} />
              </div>
              <span className="logo-text text-sm sm:text-base lg:text-lg">Wove Gifts</span>
            </div>

            {/* Right Section - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
              {/* Country Selector - Hidden on mobile, visible on tablet+ */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <img
                  src="https://flagcdn.com/w40/za.png"
                  alt="South Africa"
                  className="w-5 h-5 lg:w-6 lg:h-6 rounded-full object-cover"
                />
                <span className="text-xs lg:text-sm font-medium text-gray-700 hidden xl:inline">
                  South Africa
                </span>
                <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
              </div>

              {/* Auth Section - Hidden on mobile/small tablets */}
              <div className="hidden md:flex items-center space-x-2">
                {!mounted ? (
                  <button className="btn-secondary text-xs lg:text-sm px-3 lg:px-4 py-2">
                    <User size={16} className="lg:w-[18px] lg:h-[18px]" />
                    <span className="hidden lg:inline">Login / Register</span>
                    <span className="lg:hidden">Login</span>
                  </button>
                ) : session ? (
                  <>
                    {(session.user.role === 'ADMIN' || session.user.role === 'CUSTOMER') && (
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
                    )}

                    <button
                      className="btn-secondary text-xs lg:text-sm px-3 lg:px-4 py-2"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login">
                    <button className="btn-secondary text-xs lg:text-sm px-3 lg:px-4 py-2">
                      <User size={16} className="lg:w-[18px] lg:h-[18px]" />
                      <span className="hidden lg:inline">Login / Register</span>
                      <span className="lg:hidden">Login</span>
                    </button>
                  </Link>
                )}
              </div>

              {/* Wishlist - Always visible */}
              <Link
                href="/wishlist"
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 border border-[#ED457D] rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" color="#ED457D" />
                {mounted && cartCount > 0 && (
                  <span className="badge text-[10px] sm:text-xs">{cartCount}</span>
                )}
              </Link>

              {/* Cart - Always visible */}
              <Link
                href="/cart"
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 border border-[#ED457D] rounded-full transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBasket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" color="#ED457D" />
                {mounted && cartCount > 0 && (
                  <span className="badge text-[10px] sm:text-xs">{cartCount}</span>
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

            {/* Nav Links */}
            <div className="flex flex-col px-4 sm:px-6 mt-4 sm:mt-6 space-y-1">
              {Object.keys(navLinks).map((item) => (
                <Link
                  key={item}
                  href={navLinks[item]}
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
              ) : session ? (
                <>
                  {(session.user.role === 'ADMIN' || session.user.role === 'CUSTOMER') && (
                    <Link href="/dashboard">
                      <button className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gray-100 text-gray-900 py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base font-medium hover:bg-gray-200 transition-colors">
                        <User size={18} className="sm:w-5 sm:h-5" />
                        {session.user.role === 'ADMIN' ? 'Admin Dashboard' : 'My Dashboard'}
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#ED457D] text-white py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base font-medium hover:bg-[#d63d6e] transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
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

            {/* Country Selector */}
            <div className="px-4 sm:px-6 mt-8 sm:mt-10 mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <img
                  src="https://flagcdn.com/w40/za.png"
                  alt="South Africa"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover"
                />
                <span className="text-sm sm:text-base font-medium text-gray-700">South Africa</span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;