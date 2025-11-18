"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';

const FeaturedBrands = ({
  brands = [],
  title = "Featured Brands You'll Love",
  subtitle = "Curated partners, ready for your next gift."
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const mockBrands = [
    {
      id: "mock-1",
      brandName: "Woolworths",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
      slug: "woolworths",
      isFeature: true
    },
    {
      id: "mock-2",
      brandName: "Pick n Pay",
      logo: "https://images.unsplash.com/photo-1557821552-17105176677c?w=200&h=100&fit=crop",
      slug: "pick-n-pay",
      isFeature: true
    },
    {
      id: "mock-3",
      brandName: "Checkers",
      logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=100&fit=crop",
      slug: "checkers",
      isFeature: true
    },
    {
      id: "mock-4",
      brandName: "Makro",
      logo: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=200&h=100&fit=crop",
      slug: "makro",
      isFeature: true
    },
    {
      id: "mock-5",
      brandName: "Showmax",
      logo: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=100&fit=crop",
      slug: "showmax",
      isFeature: true
    },
    {
      id: "mock-6",
      brandName: "Cotton On",
      logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=100&fit=crop",
      slug: "cotton-on",
      isFeature: true
    },
    {
      id: "mock-7",
      brandName: "Netflix",
      logo: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&h=100&fit=crop",
      slug: "netflix",
      isFeature: true
    },
    {
      id: "mock-8",
      brandName: "Spotify",
      logo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200&h=100&fit=crop",
      slug: "spotify",
      isFeature: true
    },
    {
      id: "mock-9",
      brandName: "Takealot",
      logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=200&h=100&fit=crop",
      slug: "takealot",
      isFeature: true
    },
    {
      id: "mock-10",
      brandName: "Mr Price",
      logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=100&fit=crop",
      slug: "mr-price",
      isFeature: true
    },
    {
      id: "mock-11",
      brandName: "Superbalist",
      logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=100&fit=crop",
      slug: "superbalist",
      isFeature: true
    },
    {
      id: "mock-12",
      brandName: "Game",
      logo: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=100&fit=crop",
      slug: "game",
      isFeature: true
    }
  ];

  // const displayBrands = brands.length > 0 ? brands : [];
  const displayBrands = mockBrands;


  // Split brands into two rows and duplicate for seamless loop
  const halfLength = Math.ceil(displayBrands.length / 2);
  const firstRowBrands = displayBrands.slice(0, halfLength);
  const secondRowBrands = displayBrands.slice(halfLength);

  const firstRow = [...firstRowBrands, ...firstRowBrands];
  const secondRow = [...secondRowBrands, ...secondRowBrands];

  const BrandCard = ({ brand, index }) => (
    <div className="bg-white rounded-[1.25rem] p-8 flex items-center justify-center hover:shadow-md transition-shadow duration-300 cursor-pointer flex-shrink-0" style={{ width: '180px', height: '130px' }}>
      <div className="flex items-center justify-center w-full h-full">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.brandName}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-[0.95rem] font-medium tracking-tight text-[#c7c7c7]">
            {brand.brandName}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-[44px] bg-gradient-to-b from-[#FEF8F6] to-[#FDF7F8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[2.75rem] font-bold text-black mb-2 leading-tight tracking-tight">
            {title}
          </h2>
          <p className="text-[1.05rem] text-[#6d6d6d]">
            {subtitle}
          </p>
        </div>

        {/* First Row - Continuous Scroll Left */}
        {firstRow.length > 0 && (
          <div className="mb-5 pause-on-hover">
            <div className="flex gap-5 animate-scroll-left">
              {firstRow.map((brand, index) => (
                <BrandCard key={`row1-${brand.id}-${index}`} brand={brand} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Second Row - Continuous Scroll Right */}
        {secondRow.length > 0 && (
          <div className="mb-12 pause-on-hover">
            <div className="flex gap-5 animate-scroll-right">
              {secondRow.map((brand, index) => (
                <BrandCard key={`row2-${brand.id}-${index}`} brand={brand} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center">
         <Link href="/gift">
         <button className="hero-cta">
            See all Brands
            <span className='pl-2'>▸</span>
          </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }

        .pause-on-hover:hover .animate-scroll-left,
        .pause-on-hover:hover .animate-scroll-right {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default FeaturedBrands;