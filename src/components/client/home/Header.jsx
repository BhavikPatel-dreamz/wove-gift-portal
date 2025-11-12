'use client';
import { Gift, User, ShoppingCart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/contexts/SessionContext';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { destroySession } from '../../../lib/action/userAction/session';
import { useRouter } from 'next/navigation';
import { resetFlow } from '../../../redux/giftFlowSlice'; // ✅ import your action

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
  const cartCount = cartItems.length;
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await destroySession();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = (item) => {
    if (item === 'Send Gift Card') {
      dispatch(resetFlow()); // ✅ Reset gift flow when clicking
    }
  };

  return (
    <>
      <header className="navbar bg-[linear-gradient(151.97deg,#fbdce3_17.3%,#fde6db_95.19%)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between" style={{ height: '72px' }}>
            {/* Left Section - Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {Object.keys(navLinks).map((item) => (
                <Link
                  key={item}
                  href={navLinks[item]}
                  onClick={() => handleNavClick(item)} // ✅ attach click handler
                  className="nav-link"
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

            {/* Right Section */}
            <div className="flex items-center space-x-3 ml-auto">
              <img
                src="https://flagcdn.com/w40/za.png"
                alt="South Africa"
                className="w-6 h-4 object-cover rounded-sm"
              />
              <span className="text-sm font-medium text-gray-700">South Africa</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />

              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <ShoppingCart className="w-6 h-6" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

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
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
