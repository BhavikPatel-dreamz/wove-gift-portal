"use client";

import React from 'react'
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from "react-hot-toast";
import { useSearchParams } from 'next/navigation';
import ShopAdminHeader from "../../components/layout/ShopAdminHeader";
import { useSession } from '@/contexts/SessionContext'

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useSearchParams();
  const shopParam = params.get('shop');
  const session = useSession()


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} shopParam={shopParam} type={shopParam ? "shopAdmin" : "admin"} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {
          session ? (
            <Header onMenuClick={() => setSidebarOpen(true)} />
          ) : (
            <ShopAdminHeader onMenuClick={() => setSidebarOpen(true)} shopParam={shopParam} />
          )
        }


        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
            },
            success: {
              style: {
                background: "#4caf50",
              },
            },
            error: {
              style: {
                background: "#f44336",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AppLayout