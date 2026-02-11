'use client'; // Add this if using app directory

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // App Router
// OR
// import { useRouter } from 'next/compat/router'; // Pages Router compatibility

function InstallContent() {
  const [shop, setShop] = useState('');
  const [installing, setInstalling] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // App Router only

  useEffect(() => {
    // App Router way
    const shopParam = searchParams?.get('shop');
    
    // Pages Router way (if using pages directory)
    // const shopParam = router.query?.shop;
    
    if (shopParam) {
      setShop(shopParam);
    }
  }, [searchParams]); // or [router.query] for pages router

  const handleInstall = async (e) => {
    e.preventDefault();
    if (!shop) {
      alert('Please enter your shop domain');
      return;
    }

    setInstalling(true);
    
    const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const shopDomain = cleanShop.includes('.myshopify.com') 
      ? cleanShop.replace('.myshopify.com', '') 
      : `${cleanShop}.myshopify.com`;

    try {
      window.location.href = `/api/shopify/auth?shop=${shopDomain}`;

    } catch (error) {
      console.error('Installation error:', error);
      setInstalling(false);
      alert('Installation failed. Please try again.');
    }
  };

  return (
    <div className="install-page">
      <div className="install-container">
        <div className="install-card">
          <h1>Install Shopify App</h1>
          <p>Connect your Shopify store to get started</p>
          
          <form onSubmit={handleInstall} className="install-form">
            <div className="form-group">
              <label>Shop Domain</label>
              <input
                type="text"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="your-store.myshopify.com"
                required
                className='text-black'
                disabled={installing}
              />
              <small>Enter your shop's .myshopify.com domain</small>
            </div>
            
            <button 
              type="submit" 
              className="install-btn"
              disabled={installing}
            >
              {installing ? 'Installing...' : 'Install App'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .install-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .install-container {
          width: 100%;
          max-width: 400px;
        }
        
        .install-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          text-align: center;
        }
        
        h1 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        p {
          color: #666;
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }
        
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          box-sizing: border-box;
        }
        
        small {
          color: #666;
          font-size: 14px;
        }
        
        .install-btn {
          width: 100%;
          padding: 12px;
          background: #5469d4;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .install-btn:hover:not(:disabled) {
          background: #4c63d2;
        }
        
        .install-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InstallContent />
    </Suspense>
  );
}