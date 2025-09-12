import { 
  Menu, 
  Bell, 
  Search, 
  Maximize2,
  Minimize2
} from "lucide-react";
import UserMenu from "./UserMenu";

// Header Component
const PageHeader = ({ 
  currentPageTitle, 
  currentSecondPageTitle, 
  sidebarPosition,
  setSidebarPosition,
  toggleSidebar 
}) => {
  return (
    <header className="bg-white border-gray-200 border-b px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {currentPageTitle}
            </h1>
            {currentSecondPageTitle && (
              <p className="text-sm text-gray-500 hidden sm:block">
                {currentSecondPageTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-64 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Layout Toggle */}
        <button
          onClick={() => setSidebarPosition(sidebarPosition === 'left' ? 'top' : 'left')}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title="Toggle sidebar position"
        >
          {sidebarPosition === 'left' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-md hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};

export default PageHeader;