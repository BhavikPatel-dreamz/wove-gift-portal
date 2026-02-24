'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Calendar,
  FileText,
  Settings,
  X,
  Gift
} from 'lucide-react';

import { useSession } from '@/contexts/SessionContext';
import { useShopifyNavigation } from '@/hooks/useShopifyNavigation';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shopParam = searchParams.get("shop");
  const session = useSession();
  const { navigate } = useShopifyNavigation();

  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Gift Cards / Orders', icon: Gift, href: '/vouchers' },
    { name: 'Brands', icon: Store, href: '/brandsPartner' },
    { name: 'Occasions', icon: Calendar, href: '/occasions' },
    { name: 'Settlements', icon: FileText, href: '/settlements' },
    { name: 'Reports', icon: FileText, href: '/reports' },
  ];

  // --------------------------------
  // MODE HANDLING
  // --------------------------------
  let menuItems = [];

  if (shopParam) {
    // Shopify Admin Mode
    const shopifyRoutes = ['/dashboard', '/vouchers', '/settlements', '/reports'];

    menuItems = allMenuItems
      .filter(item => shopifyRoutes.includes(item.href))
      .map(item => ({
        ...item,
        href: `/shopify${item.href}`
      }));
  }
  else if (session?.user?.role === 'ADMIN') {
    // Full access for Admin
    menuItems = allMenuItems;
  }
  else {
    // Restricted normal user mode
    menuItems = allMenuItems.filter(item =>
      ['/dashboard', '/vouchers'].includes(item.href)
    );
  }

  // --------------------------------
  // ACTIVE STATE CHECK
  // --------------------------------
  const isActiveItem = (href) => {
    if (href === '/dashboard' || href === '/shopify/dashboard') {
      return (
        pathname === '/' ||
        pathname === '/dashboard' ||
        pathname === '/shopify/dashboard'
      );
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out 
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header - Matching height with top header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-fit h-fit">
              <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0H39C44.5228 0 49 4.47715 49 10V39C49 44.5228 44.5228 49 39 49H10C4.47715 49 0 44.5228 0 39V10C0 4.47715 4.47715 0 10 0Z" fill="url(#paint0_linear_3906_4784)" />
                <path d="M35.3889 19.0557H13.6111C12.8594 19.0557 12.25 19.6651 12.25 20.4169V23.1391C12.25 23.8908 12.8594 24.5002 13.6111 24.5002H35.3889C36.1406 24.5002 36.75 23.8908 36.75 23.1391V20.4169C36.75 19.6651 36.1406 19.0557 35.3889 19.0557Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M24.5 19.0557V36.7502" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M34.0283 24.5V34.0278C34.0283 34.7498 33.7415 35.4422 33.2309 35.9527C32.7204 36.4632 32.028 36.75 31.306 36.75H17.6949C16.973 36.75 16.2805 36.4632 15.77 35.9527C15.2595 35.4422 14.9727 34.7498 14.9727 34.0278V24.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18.3755 19.0551C17.473 19.0551 16.6075 18.6966 15.9694 18.0585C15.3312 17.4203 14.9727 16.5548 14.9727 15.6524C14.9727 14.7499 15.3312 13.8844 15.9694 13.2462C16.6075 12.6081 17.473 12.2496 18.3755 12.2496C19.6885 12.2267 20.9752 12.8638 22.0678 14.0778C23.1604 15.2918 24.0081 17.0263 24.5005 19.0551C24.9928 17.0263 25.8406 15.2918 26.9332 14.0778C28.0257 12.8638 29.3124 12.2267 30.6255 12.2496C31.528 12.2496 32.3935 12.6081 33.0316 13.2462C33.6698 13.8844 34.0283 14.7499 34.0283 15.6524C34.0283 16.5548 33.6698 17.4203 33.0316 18.0585C32.3935 18.6966 31.528 19.0551 30.6255 19.0551" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <defs>
                  <linearGradient id="paint0_linear_3906_4784" x1="49" y1="18.0283" x2="2.3578" y2="38.8528" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#ED457D" />
                    <stop offset="1" stop-color="#FA8F42" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 mb-2">Gift Card Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">

            {menuItems.map((item) => (
              <li key={item.name}>

                {/* -------------------------
                    Shopify Mode Navigation
                   ------------------------- */}
                {shopParam ? (
                  <button
                    onClick={() => {
                      navigate(item.href);
                      onClose();
                    }}
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
                ) : (
                  /* -------------------------
                      Normal Navigation
                     ------------------------- */
                  <Link
                    href={item.href}
                    onClick={onClose}
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
                  </Link>
                )}

              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;