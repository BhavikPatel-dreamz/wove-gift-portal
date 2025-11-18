import React from "react";
import { Settings, Zap, Heart } from "lucide-react";

const Features = () => {
  return (
    <section className="w-full my-10 px-4">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 rounded-xl overflow-hidden bg-white">
        {/* Feature 1 */}
        <div className="flex flex-col items-center text-center py-8 px-6">
          <div className="bg-purple-100 rounded-lg p-3 mb-4 inline-flex">
            <Settings className="w-10 h-10 text-purple-600" />
          </div>
          <h4 className="font-semibold text-xl sm:text-2xl mb-2 text-gray-900">
            Access to Brands
          </h4>
          <p className="text-sm sm:text-base text-gray-600 max-w-xs">
            A curated catalog of local favorites and global names.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center text-center py-8 px-6">
          <div className="bg-purple-100 rounded-lg p-3 mb-4 inline-flex">
            <Zap className="w-10 h-10 text-purple-600" />
          </div>
          <h4 className="font-semibold text-xl sm:text-2xl mb-2 text-gray-900">
            Instant & Delightful
          </h4>
          <p className="text-sm sm:text-base text-gray-600 max-w-xs">
            WhatsApp, email, or print—delivered in moments.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col items-center text-center py-8 px-6">
          <div className="bg-purple-100 rounded-lg p-3 mb-4 inline-flex">
            <Heart className="w-10 h-10 text-purple-600" />
          </div>
          <h4 className="font-semibold text-xl sm:text-2xl mb-2 text-gray-900">
            For Everyone
          </h4>
          <p className="text-sm sm:text-base text-gray-600 max-w-xs">
            One gift that fits every taste, budget, and occasion.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
