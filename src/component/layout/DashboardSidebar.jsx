import { X, LogOut } from "lucide-react";

const DashboardSidebar = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  menuItems, 
  activeTab, 
  onTabClick 
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${ isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full' } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out bg-white border-gray-200 border-r h-full flex flex-col`}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabClick(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;