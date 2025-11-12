'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
//import Link from 'next/link';
import { Gift } from 'lucide-react';

export default function ShopifyAppDashboard() {
  const router = useRouter();
  //const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState('');

  const fetchShopData = async (shopDomain) => {
    try {
      const response = await fetch(`/api/shopify/shop?shop=${shopDomain}`);
      if (response.status === 401) {
        // Redirect to install if unauthorized
        router.push(`/shopify/install?shop=${shopDomain}`);
        return;
      }
      //const data = await response.json();
      //setShopData(data.shop || { name: shopDomain });
    } catch (error) {
      console.error('Error fetching shop data:', error);
      //setShopData({ name: shopDomain });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Get shop from URL parameters or prompt user
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop');
    if (shopParam) {
      setShop(shopParam);
      fetchShopData(shopParam);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleShopSubmit = (e) => {
    e.preventDefault();
    if (shop) {
      fetchShopData(shop);
      // Update URL
      window.history.pushState({}, '', `?shop=${shop}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading your Shopify app...</h2>
        </div>
      </div>
    );
  }

  // if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <Gift className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Gift Card Manager</h2>
            <p className="text-gray-600 mt-2">Enter your Shopify shop domain to get started</p>
          </div>
          
          <form onSubmit={handleShopSubmit} className="space-y-4">
            <div>
              <label htmlFor="shop" className="block text-sm font-medium text-gray-700 mb-2">
                Shop Domain
              </label>
              <input
                type="text"
                id="shop"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="example.myshopify.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your full Shopify domain (e.g., yourstore.myshopify.com)
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Connect to Shop
            </button>
          </form>
        </div>
      </div>
    );
  // }

  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     {/* Header */}
  //     <div className="bg-white shadow-sm border-b">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //         <div className="flex justify-between items-center py-6">
  //           <div>
  //             <h1 className="text-3xl font-bold text-gray-900">Shopify Gift Card Manager</h1>
  //             {shopData && <p className="text-gray-600 mt-1">Connected to: {shopData.name}</p>}
  //           </div>
  //           <button 
  //             onClick={() => {
  //               // Clear session and redirect to install
  //               setShop('');
  //               setShopData(null);
  //               window.history.pushState({}, '', window.location.pathname);
  //             }}
  //             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
  //           >
  //             Disconnect
  //           </button>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Main Content */}
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
  //       {/* Quick Actions */}
  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  //         <Link 
  //           href={`/shopify/main?shop=${shop}`}
  //           className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500"
  //         >
  //           <div className="flex items-center">
  //             <Gift className="w-8 h-8 text-blue-600 mr-3" />
  //             <div>
  //               <h3 className="text-lg font-semibold text-gray-900">Gift Cards</h3>
  //               <p className="text-gray-600 text-sm">Manage gift cards</p>
  //             </div>
  //           </div>
  //         </Link>

  //         <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
  //           <div className="flex items-center">
  //             <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
  //             <div>
  //               <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
  //               <p className="text-gray-600 text-sm">View statistics</p>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
  //           <div className="flex items-center">
  //             <Users className="w-8 h-8 text-purple-600 mr-3" />
  //             <div>
  //               <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
  //               <p className="text-gray-600 text-sm">Customer management</p>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-500">
  //           <div className="flex items-center">
  //             <Settings className="w-8 h-8 text-gray-600 mr-3" />
  //             <div>
  //               <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
  //               <p className="text-gray-600 text-sm">App configuration</p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Main Gift Card Actions */}
  //       <div className="bg-white rounded-lg shadow p-6">
  //         <h2 className="text-xl font-semibold text-gray-900 mb-6">Gift Card Management</h2>
          
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //           <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
  //             <Plus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
  //             <h3 className="text-lg font-medium text-gray-900 mb-2">Create Gift Card</h3>
  //             <p className="text-gray-600 mb-4">Create new gift cards for your customers</p>
  //             <Link 
  //               href={`/shopify/main?shop=${shop}`}
  //               className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  //             >
  //               <Plus className="w-4 h-4 mr-2" />
  //               Create Now
  //             </Link>
  //           </div>

  //           <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
  //             <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
  //             <h3 className="text-lg font-medium text-gray-900 mb-2">View Statistics</h3>
  //             <p className="text-gray-600 mb-4">Track gift card performance and usage</p>
  //             <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
  //               <BarChart3 className="w-4 h-4 mr-2" />
  //               View Stats
  //             </button>
  //           </div>

  //           <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
  //             <Gift className="w-12 h-12 text-purple-600 mx-auto mb-4" />
  //             <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Existing</h3>
  //             <p className="text-gray-600 mb-4">View and manage existing gift cards</p>
  //             <Link 
  //               href={`/shopify/main?shop=${shop}`}
  //               className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
  //             >
  //               <Gift className="w-4 h-4 mr-2" />
  //               Manage
  //             </Link>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Instructions */}
  //       <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
  //         <h3 className="text-lg font-medium text-blue-900 mb-4">Getting Started</h3>
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
  //           <div>
  //             <h4 className="font-medium mb-2">Using the Web Interface:</h4>
  //             <ul className="space-y-1">
  //               <li>• Click "Create Gift Card" to create new gift cards</li>
  //               <li>• Use the main interface to view and manage existing cards</li>
  //               <li>• Track performance with built-in analytics</li>
  //             </ul>
  //           </div>
  //           <div>
  //             <h4 className="font-medium mb-2">Using the Command Line:</h4>
  //             <ul className="space-y-1">
  //               <li>• Run scripts/gift-card-manager.js for batch operations</li>
  //               <li>• Create multiple gift cards programmatically</li>
  //               <li>• Export data and generate reports</li>
  //             </ul>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}