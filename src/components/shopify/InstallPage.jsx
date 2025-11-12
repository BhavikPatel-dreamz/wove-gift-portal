'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertTriangle, Store } from 'lucide-react';

export default function InstallPage() {
  const [shop, setShop] = useState('');
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const shopParam = searchParams?.get('shop');
    if (shopParam) {
      setShop(shopParam);
    }
  }, [searchParams]);

  const isValidShopDomain = (domain) => {
    if (!domain) return true;
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const shopifyPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    const shortPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/;
    return shopifyPattern.test(cleanDomain) || shortPattern.test(cleanDomain);
  };

  const handleInstall = async (e) => {
    e.preventDefault();
    
    if (!shop) {
      setError('Please enter your shop domain');
      return;
    }

    if (!isValidShopDomain(shop)) {
      setError('Please enter a valid Shopify domain');
      return;
    }

    setError('');
    setInstalling(true);
    
    const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const shopDomain = cleanShop.includes('.myshopify.com') 
      ? cleanShop.replace('.myshopify.com', '') 
      : cleanShop;

    try {
      window.location.href = `/api/shopify/auth?shop=${shopDomain}`;
    } catch (error) {
      console.error('Installation error:', error);
      setInstalling(false);
      setError('Installation failed. Please try again.');
    }
  };

  return (
    <div className=" bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Installation Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Store className="text-indigo-600" size={24} />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-center mb-2 text-black">Install Shopify App</h1>
          <p className="text-gray-600 text-center mb-8">
            Connect your Shopify store to get started with our gift card management platform
          </p>
          
          <form onSubmit={handleInstall} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Domain *
              </label>
              <input
                type="text"
                value={shop}
                onChange={(e) => {
                  setShop(e.target.value);
                  setError('');
                }}
                placeholder="your-store.myshopify.com"
                required
                disabled={installing}
                className={`w-full border rounded-md px-3 py-2 text-sm text-black ${
                  error
                    ? 'border-red-300 bg-red-50'
                    : isValidShopDomain(shop) || !shop
                    ? 'border-gray-300'
                    : 'border-yellow-300 bg-yellow-50'
                }`}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <AlertTriangle size={12} />
                  <span>{error}</span>
                </p>
              )}
              {!error && shop && !isValidShopDomain(shop) && (
                <p className="text-yellow-600 text-xs mt-1 flex items-center space-x-1">
                  <AlertTriangle size={12} />
                  <span>Please enter a valid Shopify domain</span>
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Enter your shop's .myshopify.com domain or just your store name
              </p>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={installing || !shop || !isValidShopDomain(shop)}
            >
              {installing ? 'Installing...' : 'Install App'}
            </button>
          </form>
        </div>


        {/* Features Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium mb-4 text-black">What You'll Get</h3>
          <div className="space-y-3">
            {[
              'Seamless gift card product synchronization',
              'Real-time inventory and order management',
              'Automated gift card code generation',
              'Customer purchase tracking and analytics',
              'Secure API integration with your store'
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}