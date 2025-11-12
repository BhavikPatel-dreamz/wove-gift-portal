"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InstallSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      const shop = router.query.shop;
      if (shop) {
        router.push(`/shopify?shop=${shop}`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1>Installation Successful!</h1>
          <p>Your Shopify app has been installed successfully.</p>
          
          <div className="redirect-info">
            <p>Redirecting to dashboard in 3 seconds...</p>
            <Link 
              href={`/shopify?shop=${router.query.shop}`}
              className="dashboard-btn"
            >
              Go to Dashboard Now
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .success-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .success-container {
          width: 100%;
          max-width: 400px;
        }
        
        .success-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          text-align: center;
        }
        
        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        h1 {
          margin: 0 0 15px 0;
          color: #333;
        }
        
        p {
          color: #666;
          margin-bottom: 30px;
        }
        
        .redirect-info p {
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .dashboard-btn {
          display: inline-block;
          padding: 12px 24px;
          background: #5469d4;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        .dashboard-btn:hover {
          background: #4c63d2;
        }
      `}</style>
    </div>
  );
}