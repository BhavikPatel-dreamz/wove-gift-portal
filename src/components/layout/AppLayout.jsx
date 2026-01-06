"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from "react-hot-toast";
import { useSearchParams } from 'next/navigation';
import ShopAdminHeader from "../../components/layout/ShopAdminHeader";
import { useSession } from '@/contexts/SessionContext';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useSearchParams();
  const shopParam = params.get('shop');
  const session = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          shopParam={shopParam}
          type={shopParam ? "shopAdmin" : "admin"}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {session ? (
          <Header onMenuClick={() => setSidebarOpen(true)} />
        ) : (
          <ShopAdminHeader
            onMenuClick={() => setSidebarOpen(true)}
            shopParam={shopParam}
          />
        )}

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {children}
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#333", color: "#fff" },
            success: { style: { background: "#4caf50" } },
            error: { style: { background: "#f44336" } },
          }}
        />
      </div>
    </div>
  );
};

export default AppLayout;
