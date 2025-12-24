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
    { name: 'Controls', icon: Settings, href: '/controls' },
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
        {/* Header */}
        <div className="flex items-center justify-between h-19 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">
                Gift Card Management & Analytics
              </p>
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
