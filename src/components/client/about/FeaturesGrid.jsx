import React from "react";

const Features = () => {
  return (
    <section
      className="w-full my-15 px-4 py-10"
      style={{
        background:
          "linear-gradient(180deg, #FEF8F6 0%, #FDF7F8 100%), #D9D9D9",
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 rounded-xl overflow-hidden">
        
        {/* Feature 1 */}
        <div className="flex flex-col items-center text-center py-8 px-6">
          <div className="bg-[#DD99FF] rounded-lg p-3 mb-4 inline-flex">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path
                d="M39.5281 25.0361C38.7024 23.7518 37.8771 22.5132 37.0514 21.2293C36.8683 20.9542 36.8683 20.7706 37.0514 20.4955C37.8771 19.2574 38.6566 18.0188 39.4823 16.7806C40.4454 15.3131 39.941 13.891 38.2895 13.295L34.1622 11.736C33.8871 11.644 33.7493 11.4605 33.7493 11.1396C33.7036 9.62634 33.612 8.11266 33.52 6.64518C33.4284 5.03994 32.1903 4.12266 30.6308 4.53552L26.2738 5.7279C25.9529 5.81946 25.7698 5.7279 25.54 5.49858C24.6227 4.30578 23.6597 3.1596 22.7428 2.013C21.7336 0.729064 20.1741 0.729064 19.1195 2.013L16.3676 5.4528C16.1383 5.77368 15.909 5.81946 15.5423 5.7279L11.6897 4.67286C9.71777 4.21422 8.52539 4.99416 8.43341 6.64518C8.34185 8.15844 8.25029 9.67212 8.20409 11.2316C8.20409 11.5525 8.06675 11.6898 7.79165 11.8276L3.52655 13.4786C2.05865 14.075 1.60001 15.4967 2.47151 16.8264L4.94825 20.6329C5.13137 20.9084 5.13137 21.0915 4.94825 21.4128L2.42573 25.3108C1.64621 26.5494 2.15063 28.0169 3.52613 28.5671L7.83743 30.2181C8.15831 30.3101 8.25029 30.4932 8.25029 30.8145C8.29607 32.282 8.47961 33.7041 8.47961 35.1712C8.47961 36.6391 9.76355 37.9688 11.5523 37.4186L15.8174 36.2258C16.0925 36.1342 16.2761 36.1804 16.4596 36.4555L19.303 39.9869C20.3576 41.2708 21.8713 41.2708 22.8802 39.9869L25.7236 36.4555C25.9071 36.2262 26.0444 36.1342 26.3657 36.2262L30.7686 37.4186C32.2819 37.8314 33.5658 36.9142 33.612 35.3547L33.8413 30.7683C33.8413 30.4016 34.0244 30.2643 34.2999 30.1723L38.4731 28.5671C39.941 27.8333 40.3996 26.3663 39.5281 25.0361Z"
                fill="#34054C"
              />
            </svg>
          </div>

          <h4 className="font-semibold text-[22px] sm:text-2xl mb-2 text-[#1A1A1A]">
            Access to Brands
          </h4>
          <p className="text-sm sm:text-base text-[#4A4A4A] max-w-xs font-light">
            A curated catalog of local favorites and global names.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center text-center py-8 px-6">
          <div className="bg-[#DD99FF] rounded-lg p-3 mb-4 inline-flex">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path
                d="M16.529 42L19.4963 23.7238H8.28518L15.3622 0H27.8267L24.0827 12.7811H33.7148L16.529 42Z"
                fill="#34054C"
              />
            </svg>
          </div>

          <h4 className="font-semibold text-xl sm:text-2xl mb-2 text-[#1A1A1A]">
            Instant & Delightful
          </h4>
          <p className="text-sm sm:text-base text-[#4A4A4A] max-w-xs font-light">
            WhatsApp, email, or print—delivered in moments.
          </p>
        </div>

        {/* Feature 3 (Centered on tablet) */}
        <div className="flex flex-col items-center text-center py-8 px-6 sm:col-span-2 lg:col-span-1">
          <div className="bg-[#DD99FF] rounded-lg p-3 mb-4 inline-flex">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path
                d="M21 37C20.8179 37 20.6358 36.9517 20.4727 36.8548C20.2955 36.7497 16.0859 34.2377 11.8158 30.4525C7.26476 25.9842 3.00018 21.0639 3.00018 15.9045C3.01804 13.0074 4.02765 10.2829 5.84326 8.23271C7.68952 6.14801 10.1534 5 12.7812 5C16.1489 5 19.228 6.93888 21 10.0103C22.7721 6.93895 25.8512 5 29.2189 5C31.7015 5 34.0701 6.03585 35.8887 7.91677C37.8844 9.98088 39.0183 12.8974 38.9998 15.9183C38.9844 18.4037 38.021 21.0693 36.1361 23.8409C34.6782 25.9846 32.6608 28.2086 30.1399 30.4513C25.8855 34.2361 21.7061 36.7481 21.5302 36.8532C21.3692 36.9493 21.1862 37 21 37Z"
                fill="#34054C"
              />
            </svg>
          </div>

          <h4 className="font-semibold text-xl sm:text-2xl mb-2 text-[#1A1A1A]">
            For Everyone
          </h4>
          <p className="text-sm sm:text-base text-[#4A4A4A] font-light max-w-xs">
            One gift that fits every taste, budget, and occasion.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Features;