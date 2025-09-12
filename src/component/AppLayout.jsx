"use client"

import React, { useState } from 'react'
import PageHeader from './layout/PageHeader';
import DashboardSidebar from './layout/DashboardSidebar';
import TopNavigation from './layout/TopNavigation';
import { 
  ShoppingBag, 
  Building2, 
  Plus, 
  Calendar, 
  Database, 
  CreditCard, 
  FileText, 
  Settings, 
  Home, 
} from "lucide-react";
import { useRouter } from 'next/navigation';


const AppLayout = ({ 
  children, 
  pageTitle = "Admin Dashboard", 
  secondPageTitle = "Gift Card Management & Analytics" 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState('left');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPageTitle, setCurrentPageTitle] = useState(pageTitle);
  const [currentSecondPageTitle, setCurrentSecondPageTitle] = useState(secondPageTitle);
	const router = useRouter()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: '12' },
    { id: 'brands', label: 'Brands', icon: Building2, badge: null },
    { id: 'new-brands', label: 'New Brands', icon: Plus, badge: '3' },
    { id: 'occasions', label: 'Occasions', icon: Calendar, badge: null },
    { id: 'data', label: 'Data', icon: Database, badge: null },
    { id: 'settlements', label: 'Settlements', icon: CreditCard, badge: null },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'controls', label: 'Controls', icon: Settings, badge: null },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    router.push(`/${tabId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      
      {/* Header */}
      <PageHeader
        currentPageTitle={currentPageTitle}
        currentSecondPageTitle={currentSecondPageTitle}
        sidebarPosition={sidebarPosition}
        setSidebarPosition={setSidebarPosition}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {sidebarPosition === 'left' && (
          <DashboardSidebar
            isMobileMenuOpen={sidebarOpen}
            setIsMobileMenuOpen={setSidebarOpen}
            menuItems={menuItems}
            activeTab={activeTab}
            onTabClick={handleTabClick}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto`}>
          {/* Top Navigation (when sidebar is on top) */}
          {sidebarPosition === 'top' && (
            <TopNavigation
              menuItems={menuItems}
              activeTab={activeTab}
              onTabClick={handleTabClick}
            />
          )}

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout