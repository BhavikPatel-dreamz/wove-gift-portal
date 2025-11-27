

'use client';

import { TitleBar } from '@shopify/app-bridge-react';
import { useShopifyNavigation } from '@/hooks/useShopifyNavigation';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { 
  Gift, 
  DollarSign, 
  Users, 
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';

function DashboardContent() {
  const { navigate } = useShopifyNavigation();
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');
  
  const [stats, setStats] = useState({
    totalGiftCards: 0,
    totalValue: 0,
    activeCards: 0,
    redeemedCards: 0,
    loading: true,
  });

  useEffect(() => {
    if (shop) {
      fetchDashboardStats();
    }
  }, [shop]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/giftcard/stats?shop=${shop}`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalGiftCards: data.total || 0,
          totalValue: data.totalValue || 0,
          activeCards: data.active || 0,
          redeemedCards: data.redeemed || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleNavigateToGiftCards = () => {
    navigate('/shopify/gift-cards');
  };

  const handleCreateGiftCard = () => {
    navigate('/shopify/gift-cards/create');
  };

  const statCards = [
    { 
      label: 'Total Gift Cards', 
      value: stats.totalGiftCards, 
      icon: Gift, 
      color: 'blue',
      trend: '+12.3%'
    },
    { 
      label: 'Total Value', 
      value: `$${stats.totalValue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'green',
      trend: '+8.1%'
    },
    { 
      label: 'Active Cards', 
      value: stats.activeCards, 
      icon: Users, 
      color: 'purple',
      trend: '+2.4%'
    },
    { 
      label: 'Redeemed', 
      value: stats.redeemedCards, 
      icon: ShoppingBag, 
      color: 'orange',
      trend: '+15.2%'
    },
  ];

  if (!shop) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: Shop parameter is missing</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TitleBar title="Dashboard" />
      
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gift Card Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and track your gift cards for {shop}
          </p>
        </div>

        {/* Stats Grid */}
        {stats.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  {stat.trend && (
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCreateGiftCard}
              className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Create Gift Card</h3>
                  <p className="text-sm text-gray-600">Issue a new gift card</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>

            <button
              onClick={handleNavigateToGiftCards}
              className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Manage Gift Cards</h3>
                  <p className="text-sm text-gray-600">View all gift cards</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600 text-center py-8">
            No recent activity to display
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
