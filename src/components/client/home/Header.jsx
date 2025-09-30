import { Gift, User, Heart, ShoppingCart, MapPin } from 'lucide-react';

const navLinks = {
  "Home": "/",
  "About": "/about",
  "FAQs": "/faq",
  "Send Gift Card": "/gift",
  "Brands": "/BrandsSelection",
};

const Header = () => {
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
                <a
                  key={item}
                  href={navLinks[item]}
                  className="nav-link"
                >
                  {item}
                </a>
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

              {/* Login/Register Button */}
              <button className="btn-secondary">
                <User size={18} />
                Login / Register
              </button>


              {/* Admin Button */}
              <button className="btn-outline flex items-center gap-2">
                <Heart size={16} />
                Admin
              </button>

              {/* Wishlist Icon Button */}
              <button className="btn-icon-circle">
                <Heart size={20} className="text-wave-pink" />
              </button>

              {/* Cart Icon Button */}
              <button className="btn-icon-circle">
                <ShoppingCart size={20} className="text-wave-pink" />
              </button>

            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;