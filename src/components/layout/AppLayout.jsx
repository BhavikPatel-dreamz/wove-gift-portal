"use client";

import React from 'react'
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from "react-hot-toast";

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)}  />
        
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