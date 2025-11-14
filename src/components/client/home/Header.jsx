'use client';
import { Gift, User, ShoppingCart, ChevronDown, ShoppingBasket, Heart, Menu, X } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = cartItems.length;
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await destroySession();
      setMobileMenuOpen(false);
      router.push('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = (item) => {
    if (item === 'Send Gift Card') {
      dispatch(resetFlow());
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Mobile Menu Button - Left */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation Links - Left */}
            <nav className="hidden md:flex items-center space-x-8">
              {Object.keys(navLinks).map((item) => (
                <Link
                  key={item}
                  href={navLinks[item]}
                  onClick={() => handleNavClick(item)}
                  className="nav-link font-poppins"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Center - Logo */}
            <div className="logo-container absolute left-1/2 transform -translate-x-1/2">
              <div className="logo-icon">
                <Gift size={24} color="white" strokeWidth={2.5} />
              </div>
              <span className="logo-text">Wove Gifts</span>
            </div>

            {/* Right Section - Mobile & Desktop */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Country Selector - Hidden on Mobile */}
              <div className="hidden md:flex items-center space-x-3 mr-3">
                <img
                  src="https://flagcdn.com/w40/za.png"
                  alt="South Africa"
                  className="w-6 h-6 object-cover rounded-[50%]"
                />
                <span className="text-sm font-medium text-gray-700">South Africa</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                {!mounted ? (
                  <button className="btn-secondary">
                    <User size={18} />
                    Login / Register
                  </button>
                ) : session ? (
                  <>
                    {session.user.role === 'ADMIN' && (
                      <Link href="/dashboard">
                        <button className="btn-outline flex items-center gap-2">
                          <User size={16} />
                          Admin
                        </button>
                      </Link>
                    )}
                    {session.user.role === 'CUSTOMER' && (
                      <Link href="/dashboard">
                        <button className="btn-outline flex items-center gap-2">
                          <User size={16} />
                          Dashboard
                        </button>
                      </Link>
                    )}
                    <button className="btn-secondary" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login">
                    <button className="btn-secondary">
                      <User size={18} />
                      Login / Register
                    </button>
                  </Link>
                )}
              </div>

              {/* Wishlist & Cart Icons - Always Visible */}
              <Link
                href="/wishlist"
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-[#ED457D] rounded-[50%]"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6" color="#ED457D" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-pink-500 text-white text-[10px] md:text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-[#ED457D] rounded-[50%]"
              >
                <ShoppingBasket className="w-5 h-5 md:w-6 md:h-6" color="#ED457D" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-pink-500 text-white text-[10px] md:text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Right Section - Mobile (Icons Only) */}
            <div className="flex md:hidden items-center space-x-2 ml-auto">
              <Link
                href="/wishlist"
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-[#ED457D] rounded-[50%]"
              >
                <Heart className="w-5 h-5" color="#ED457D" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-[#ED457D] rounded-[50%]"
              >
                <ShoppingBasket className="w-5 h-5" color="#ED457D" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
            <nav className="flex flex-col p-6 space-y-6">
              {/* Navigation Links */}
              {Object.keys(navLinks).map((item) => (
                <Link
                  key={item}
                  href={navLinks[item]}
                  onClick={() => handleNavClick(item)}
                  className="text-lg font-medium text-gray-700 hover:text-[#ED457D] transition-colors"
                >
                  {item}
                </Link>
              ))}

              <hr className="border-gray-200" />

              {/* Country Selector */}
              <div className="flex items-center space-x-3">
                <img
                  src="https://flagcdn.com/w40/za.png"
                  alt="South Africa"
                  className="w-6 h-6 object-cover rounded-[50%]"
                />
                <span className="text-sm font-medium text-gray-700">South Africa</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>

              <hr className="border-gray-200" />

              {/* Auth Buttons */}
              {!mounted ? (
                <button className="btn-secondary w-full justify-center">
                  <User size={18} />
                  Login / Register
                </button>
              ) : session ? (
                <>
                  {(session.user.role === 'ADMIN' || session.user.role === 'CUSTOMER') && (
                    <Link href="/dashboard" className="w-full">
                      <button className="btn-outline w-full justify-center flex items-center gap-2">
                        <User size={16} />
                        {session.user.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
                      </button>
                    </Link>
                  )}
                  <button className="btn-secondary w-full justify-center" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="w-full">
                  <button className="btn-secondary w-full justify-center">
                    <User size={18} />
                    Login / Register
                  </button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;