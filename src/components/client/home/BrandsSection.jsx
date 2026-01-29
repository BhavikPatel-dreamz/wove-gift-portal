"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getBrands } from "../../../lib/action/brandFetch";

const FeaturedBrands = ({
  title = "Featured Brands You'll Love",
  subtitle = "Curated partners, ready for your next gift.",
}) => {
  const [displayBrands, setDisplayBrands] = useState([]);

  useEffect(() => {
    const fetchFeaturedBrands = async () => {
      try {
        const featuredBrands = await getBrands({ isFeature: true });
        setDisplayBrands(featuredBrands || []);
      } catch (error) {
        console.error("Error fetching featured brands:", error);
      }
    };
    fetchFeaturedBrands();
  }, []);

  // Only show animation if we have enough brands (6+)
  const shouldAnimate = displayBrands.length >= 6;

  // Duplicate brands for seamless animation
  const getAnimatedBrands = (brands) => {
    const duplications = Math.max(6, Math.ceil(12 / brands.length));
    return Array(duplications).fill(brands).flat();
  };

  // Split brands into two rows
  const halfLength = Math.ceil(displayBrands.length / 2);
  const firstRowBrands = displayBrands.slice(0, halfLength);
  const secondRowBrands = displayBrands.slice(halfLength);

  const firstRow = shouldAnimate ? getAnimatedBrands(firstRowBrands) : firstRowBrands;
  const secondRow = shouldAnimate ? getAnimatedBrands(secondRowBrands) : secondRowBrands;

  const BrandCard = ({ brand }) => (
    <div
      className="
        bg-white
        w-[160px] sm:w-[180px] md:w-[213px]
        h-[80px] sm:h-[90px] md:h-[94px]
        rounded-[20px]
        p-4 sm:p-6 md:p-8
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
          <span className="text-[0.9rem] sm:text-[0.95rem] font-medium tracking-tight text-[#c7c7c7] text-center">
            {brand.brandName}
          </span>
        )}
      </div>
    </div>
  );

  // If no brands, render nothing
  if (displayBrands.length === 0) return null;

  return (
    <section className="py-[44px] bg-gradient-to-b from-[#FEF8F6] to-[#FDF7F8] overflow-hidden">
      <div className="max-w-7xl mx-auto  sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-[1.75rem] sm:text-[2.75rem] font-bold text-black mb-2 leading-tight tracking-tight brand-title">
            {title}
          </h2>
          <p className="text-[0.95rem] sm:text-[1.05rem] text-[#6d6d6d]">
            {subtitle}
          </p>
        </div>

        {/* Brand Display */}
        {shouldAnimate ? (
          <>
            {/* First Row - Scroll Left */}
            {firstRow.length > 0 && (
              <div className="mb-5 pause-on-hover overflow-hidden">
                <div className="flex gap-4 sm:gap-5 animate-scroll-left">
                  {firstRow.map((brand, index) => (
                    <BrandCard key={`row1-${brand.id}-${index}`} brand={brand} />
                  ))}
                </div>
              </div>
            )}

            {/* Second Row - Scroll Right */}
            {secondRow.length > 0 && (
              <div className="mb-10 sm:mb-12 pause-on-hover overflow-hidden">
                <div className="flex gap-4 sm:gap-5 animate-scroll-right">
                  {secondRow.map((brand, index) => (
                    <BrandCard key={`row2-${brand.id}-${index}`} brand={brand} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Static Grid */
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 max-w-4xl mx-auto">
              {displayBrands.map((brand, index) => (
                <BrandCard key={`brand-${brand.id}-${index}`} brand={brand} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link href="/gift">
            <button className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#FF6B9D] to-[#FFA06B] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300">
              See all Brands <span className="pl-2">▸</span>
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
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }

        .pause-on-hover:hover .animate-scroll-left,
        .pause-on-hover:hover .animate-scroll-right {
          animation-play-state: paused;
        }

        @media (max-width: 360px) {
          .brand-title {
            font-size: 1.5rem !important;
            line-height: 1.25;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedBrands;
