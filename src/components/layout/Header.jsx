'use client'

import {
  LogOut,
  Menu,
  Search,
  Bell,
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
  const { user, logout } = useSession()

  const handleLogout = async () => {
    setLoading(true)

    try {
      await destroySession() // Use the logout from SessionContext
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get display name - prioritize name, fallback to email first part, then default to Admin
  const getDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Admin';
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'A';
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative max-w-md flex gap-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5" />
          </button> */}

          <div className="flex items-center space-x-3">
            {user.role === 'CUSTOMER' && (
              <Link href="/">
                <button className="btn-outline flex items-center gap-2 border text-black border-gray-300 p-3 rounded-lg hover:bg-blue-500 hover:text-white font-bold">
                  Home Page
                </button>
              </Link>
            )}

            <div className="text-right">
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
              <LogOut className="w-4 h-4 mr-2" />
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;