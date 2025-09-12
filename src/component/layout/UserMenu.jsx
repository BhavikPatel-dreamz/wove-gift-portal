const { User, ChevronDown } = require("lucide-react");
const { useState } = require("react");
import { useRouter } from 'next/navigation';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter()

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          Welcome, Admin
        </span>
        <ChevronDown className="w-4 h-4 hidden sm:block" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 bg-white border border-gray-200">
            <div className="py-1">
              <div href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile
              </div>
              <div href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </div>
              <hr className="my-1 border-gray-200" />
              <div href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"  onClick={() => router.push('/login')}>
                Logout
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;


