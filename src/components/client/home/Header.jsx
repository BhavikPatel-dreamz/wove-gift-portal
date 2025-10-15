'use client';
import { Gift, User, Heart, ShoppingCart, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/contexts/SessionContext'
import { useSelector } from 'react-redux';

const navLinks = {
  "Home": "/",
  "About": "/about",
  "FAQs": "/faq",
  "Send Gift Card": "/gift",
};

const Header = () => {
  const session = useSession();
  const cartCount = useSelector((state) => state.cart.items.length);

  return (
    <>
      {/* Top Banner */}
      <div className="bg-pink-600 text-white uppercase text-xs font-semibold tracking-widest flex justify-between items-center px-6 py-2">
        <span></span>
        <span>WHATSAPP · EMAIL · PRINT — YOUR PERFECT GIFT, DELIVERED PERFECTLY.</span>
        <div className="flex items-center space-x-2 cursor-pointer">
          <img
            src="https://flagcdn.com/w40/za.png"
            alt="South Africa"
            className="w-6 h-4 object-cover rounded-sm"
          />
          <span className="text-sm font-medium">South Africa</span>
          <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M7 7l3 3 3-3H7z" />
          </svg>
        </div>
      </div>

      {/* Main Header */}
      <header className="navbar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between" style={{ height: '72px' }}>

            {/* Left Section - Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {Object.keys(navLinks).map((item) => (
                <Link
                  key={item}
                  href={navLinks[item]}
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
              <span className="logo-text">Wave Gifts</span>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center space-x-3 ml-auto">

              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {session ? (
                <>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard">
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
                  <Link href="/api/auth/logout">
                    <button className="btn-secondary">
                      Logout
                    </button>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <button className="btn-secondary">
                    <User size={18} />
                    Login / Register
                  </button>
                </Link>
              )}



              {/* Wishlist Icon Button */}
              {/* <button className="btn-icon-circle">
                <Heart size={20} className="text-wave-pink" />
              </button> */}

              {/* Cart Icon Button */}
              {/* <button className="btn-icon-circle">
                <ShoppingCart size={20} className="text-wave-pink" />
              </button> */}

            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;