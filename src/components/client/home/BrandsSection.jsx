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
        w-40 sm:w-48 md:w-56 lg:w-64
        h-24 sm:h-28 md:h-32 lg:h-36
        rounded-[20px]
        p-4 sm:p-5 md:p-6
        flex
        items-center
        justify-center
        cursor-pointer
        shrink-0
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
            className="w-full h-full object-contain"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <span className="text-base sm:text-lg md:text-xl font-medium tracking-tight text-[#c7c7c7] text-center">
            {brand.brandName}
          </span>
        )}
      </div>
    </div>
  );

  // If no brands, render nothing
  if (displayBrands.length === 0) return null;

  return (
    <section className="py-11 bg-linear-to-b from-[#FEF8F6] to-[#FDF7F8] overflow-hidden">
      <div className="max-w-7xl mx-auto sm:px-6">
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
        <div className="text-center flex justify-center items-center">
          <Link href="/gift">
            <button className="group cursor-pointer max-w-fit bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:shadow-lg hover:scale-105 flex items-center gap-2 mb-4 md:mb-6 mx-auto md:mx-0 text-sm md:text-base m-auto">
              See all Brands 
              <span className="transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:scale-110"><svg width="8" height="9" viewBox="0 0 8 9" fill="none"><path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white"></path></svg></span>
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