'use client'

import {
  LogOut,
  Menu,
  Search,
  User
} from 'lucide-react';
import Button from '../forms/Button';
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { destroySession } from '../../lib/action/userAction/session'
import Link from 'next/link';

const Header = ({ onMenuClick }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useSession()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await destroySession()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  }

  const getUserInitials = () => {
    if (user?.name) return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return 'A';
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
        
        {/* Left side: menu & search */}
        <div className="flex items-center w-full md:w-auto gap-2 md:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-[#1A1A1A]" />
          </button>

          {/* <div className="relative flex-1 md:flex-none w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div> */}
        </div>

        {/* Right side: user info & actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 w-full md:w-auto">
          
          {user?.role === 'CUSTOMER' && (
            <Link href="/">
              <button className="btn-outline flex items-center justify-center gap-2 border text-black border-gray-300 p-2 sm:p-3 rounded-lg hover:bg-blue-500 hover:text-white font-bold text-sm sm:text-base w-full sm:w-auto">
                Home Page
              </button>
            </Link>
          )}

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <div className="text-left sm:text-right flex-1 sm:flex-none">
              <span className="text-sm font-medium text-gray-700 block">
                Welcome, {getDisplayName()}
              </span>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user ? getUserInitials() : <User className="w-4 h-4" />}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
            >
              <LogOut className="w-4 h-4 mr-1" />
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
