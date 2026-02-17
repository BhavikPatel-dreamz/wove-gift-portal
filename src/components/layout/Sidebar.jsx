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
            <div className="w-fit h-fit ">
              <svg width="50" height="60" viewBox="0 0 50 60"  fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_2405_1275)">
                  <rect x="15" y="12" width="34" height="34" rx="3" fill="url(#paint0_linear_2405_1275)" shape-rendering="crispEdges" />
                  <path d="M32.3117 20.7734C33.4691 20.7734 34.579 21.2332 35.3973 22.0515C36.2156 22.8699 36.6754 23.9798 36.6754 25.1371C36.6754 26.2944 36.2156 27.4043 35.3973 28.2226C34.579 29.041 33.4691 29.5007 32.3117 29.5007C31.1544 29.5007 30.0445 29.041 29.2262 28.2226C28.4078 27.4043 27.9481 26.2944 27.9481 25.1371C27.9481 23.9798 28.4078 22.8699 29.2262 22.0515C30.0445 21.2332 31.1544 20.7734 32.3117 20.7734ZM32.3117 38.228C32.3117 38.228 41.039 38.228 41.039 36.0462C41.039 33.428 36.7845 30.5916 32.3117 30.5916C27.839 30.5916 23.5845 33.428 23.5845 36.0462C23.5845 38.228 32.3117 38.228 32.3117 38.228Z" fill="white" />
                </g>
                <defs>
                  <filter id="filter0_d_2405_1275" x="-5" y="0" width="74" height="74" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="8" />
                    <feGaussianBlur stdDeviation="10" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.968627 0 0 0 0 0.486275 0 0 0 0 0.317647 0 0 0 0.2 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2405_1275" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2405_1275" result="shape" />
                  </filter>
                  <linearGradient id="paint0_linear_2405_1275" x1="15" y1="24.5094" x2="47.364" y2="38.9591" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#ED457D" />
                    <stop offset="1" stop-color="#FA8F42" />
                  </linearGradient>
                </defs>
              </svg>

            </div>
            <div>
              <h1 className="text-md font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 pb-2">Gift Card Management</p>
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