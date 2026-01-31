import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Calendar,
  FileText,
  Settings,
  X,
  Gift
} from 'lucide-react';
import { useSession } from '@/contexts/SessionContext'
import { useSelector } from 'react-redux';
import { setHasChanges } from '../../redux/giftFlowSlice';
import { useDispatch } from 'react-redux';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const session = useSession();
  const { hasChanges } = useSelector(state => state.giftFlowReducer);

  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Gift Cards / Orders', icon: Gift, href: '/vouchers' },
    { name: 'Brands', icon: Store, href: '/brandsPartner' },
    { name: 'Occasions', icon: Calendar, href: '/occasions' },
    { name: 'Settlements', icon: FileText, href: '/settlements' },
    { name: 'Reports', icon: FileText, href: '/reports' },
    { name: 'Support Requests', icon: Settings, href: '/supportRequests' },
  ];

  // Filter menu items based on user role
  const menuItems = session?.user?.role === 'ADMIN'
    ? allMenuItems
    : allMenuItems.filter(item =>
      item.href === '/dashboard' || item.href === '/vouchers'
    );

  // Check if the current path matches the menu item
  const isActiveItem = (href) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Handle navigation with unsaved changes check
  const handleNavigation = (e, href) => {
    e.preventDefault();
    
    // Don't navigate if already on the page
    if (isActiveItem(href)) {
      onClose();
      return;
    }

    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push(href);
        dispatch(setHasChanges(false));
        onClose();
      }
    } else {
      router.push(href);
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop - only show on screens smaller than md */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out 
        md:translate-x-0 md:static md:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-fit px-6 border-b border-gray-200 py-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Gift Card Management & Analytics</p>
            </div>
          </div>
          {/* Close button - only show on screens smaller than md */}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4" aria-label="Main navigation">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={(e) => handleNavigation(e, item.href)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors cursor-pointer
                    ${isActiveItem(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;