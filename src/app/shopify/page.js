import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ShopifyAppDashboard() {
  const router = useRouter();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { shop } = router.query;
    if (shop) {
      fetchShopData(shop);
    }
  }, [router.query]);

  const fetchShopData = async (shop) => {
    try {
      const response = await fetch(`/api/shopify/shop?shop=${shop}`);
      if (response.status === 401) {
        // Redirect to install if unauthorized
        router.push(`/shopify/install?shop=${shop}`);
        return;
      }
      const data = await response.json();
      setShopData(data);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading your Shopify app...</h2>
      </div>
    );
  }

  return (
    <div className="shopify-dashboard">
      <header className="dashboard-header">
        <h1>Shopify App Dashboard</h1>
        {shopData && <p>Connected to: {shopData.shop?.name}</p>}
        <button 
          onClick={() => {
            // Clear session and redirect to install
            document.cookie = 'shopify_session=; Max-Age=0; path=/';
            router.push('/shopify/install');
          }}
          className="logout-btn"
        >
          Disconnect
        </button>
      </header>

      <nav className="dashboard-nav">
        <div className="nav-grid">
          <Link href={`/shopify/products?shop=${router.query.shop}`} className="nav-card">
            <h3>Products</h3>
            <p>Manage your store products</p>
          </Link>

          <Link href={`/shopify/orders?shop=${router.query.shop}`} className="nav-card">
            <h3>Orders</h3>
            <p>View and manage orders</p>
          </Link>

          <Link href={`/shopify/customers?shop=${router.query.shop}`} className="nav-card">
            <h3>Customers</h3>
            <p>Customer management</p>
          </Link>

          <Link href={`/shopify/analytics?shop=${router.query.shop}`} className="nav-card">
            <h3>Analytics</h3>
            <p>Store analytics and reports</p>
          </Link>

          <Link href={`/shopify/settings?shop=${router.query.shop}`} className="nav-card">
            <h3>Settings</h3>
            <p>App configuration</p>
          </Link>
        </div>
      </nav>

      <style jsx>{`
        .shopify-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        
        .logout-btn {
          padding: 8px 16px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .nav-card {
          display: block;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
        }
        
        .nav-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .nav-card h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
        }
        
        .nav-card p {
          margin: 0;
          color: #666;
        }
      `}</style>
    </div>
  );
}