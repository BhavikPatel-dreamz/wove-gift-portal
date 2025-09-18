import { Gift} from 'lucide-react';

// Header Component
const Header = ({ logo, navigation, userActions }) => (
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">{logo}</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item, index) => (
              <a key={index} href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {userActions.map((action, index) => (
            <button key={index} className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  </header>
);

export default Header;