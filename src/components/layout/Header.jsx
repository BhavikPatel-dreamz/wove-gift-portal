'use client'
import { LogOut, Menu, Search, User } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200 px-4 py-5.25 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Left side: menu & search */}
        <div className="flex items-center space-x-4">
          {/* Menu button - hidden on md and above */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search can be added here if needed */}
        </div>

        {/* Right side: user info & actions */}
        <div className="flex items-center space-x-4">
          {user?.role === 'CUSTOMER' && (
            <Link href="/">
              <Button variant="outline" size="sm">
                Home Page
              </Button>
            </Link>
          )}

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 hidden sm:block">
              Welcome, {getDisplayName()}
            </span>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user ? getUserInitials() : <User className="w-4 h-4" />}
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">
                {loading ? 'Signing out...' : 'Sign Out'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;