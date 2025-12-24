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
      logo: "/brands/woolworths-seeklogo 1.svg",
      slug: "woolworths",
      isFeature: true
    },
    {
      id: "mock-2",
      brandName: "Pick n Pay",
      logo: "/brands/picknpay.svg",
      slug: "pick-n-pay",
      isFeature: true
    },
    {
      id: "mock-3",
      brandName: "Checkers",
      logo: "/brands/checkers.svg",
      slug: "checkers",
      isFeature: true
    },
    {
      id: "mock-4",
      brandName: "Makro",
      logo: "/brands/marko.svg",
      slug: "makro",
      isFeature: true
    },
    {
      id: "mock-5",
      brandName: "Showmax",
      logo: "/brands/showmax.svg",
      slug: "showmax",
      isFeature: true
    },
    {
      id: "mock-6",
      brandName: "Cotton On",
      logo: "/brands/cottornon.svg",
      slug: "cotton-on",
      isFeature: true
    },
    {
      id: "mock-7",
      brandName: "Netflix",
      logo: "/brands/Netflix.svg",
      slug: "netflix",
      isFeature: true
    },
    {
      id: "mock-8",
      brandName: "Woolworths",
      logo: "/brands/woolworths-seeklogo 1.svg",
      slug: "woolworths",
      isFeature: true
    },
    {
      id: "mock-9",
      brandName: "Pick n Pay",
      logo: "/brands/picknpay.svg",
      slug: "pick-n-pay",
      isFeature: true
    },
    {
      id: "mock-10",
      brandName: "Checkers",
      logo: "/brands/checkers.svg",
      slug: "checkers",
      isFeature: true
    },
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
    <div
      className="
    bg-white
    w-[213px]
    h-[94px]
    rounded-[20px]
    p-8
    flex
    items-center
    justify-center
    cursor-pointer
    flex-shrink-0
    border
    border-[rgba(0,36,2,0.15)]
    transition-shadow
    duration-300
    hover:shadow-md
  "
    >
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