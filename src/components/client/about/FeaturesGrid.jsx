import React from 'react';
import { Settings, Zap, Heart } from 'lucide-react';

const Features = () => {
  return (
    <section className="w-full my-8 flex divide-x divide-gray-200 max-w-screen-xl mx-auto">
      {/* Feature 1 */}
      <div className="flex-1 flex flex-col items-center py-6 px-8 text-left">
        <div className="bg-purple-100 rounded-md p-2 mb-3 inline-flex">
          <Settings className="w-10 h-10 text-purple-600" />
        </div>
        <h4 className="font-semibold text-2xl mb-1 text-gray-900">Access to Brands</h4>
        <p className="text-sm text-center text-gray-600 max-w-[14rem]">
          A curated catalog of local favorites and global names.
        </p>
      </div>

      {/* Feature 2 */}
      <div className="flex-1 flex flex-col items-center py-6 px-8 text-left">
        <div className="bg-purple-100 rounded-md p-2 mb-3 inline-flex">
          <Zap className="w-10 h-10 text-purple-600" />
        </div>
        <h4 className="font-semibold text-2xl mb-1 text-gray-900">Instant & Delightful</h4>
        <p className="text-sm text-center text-gray-600 max-w-[14rem]">
          WhatsApp, email, or print—delivered in moments.
        </p>
      </div>

      {/* Feature 3 */}
      <div className="flex-1 flex flex-col items-center py-6 px-8 text-left">
        <div className="bg-purple-100 rounded-md p-2 mb-3 inline-flex">
          <Heart className="w-10 h-10 text-purple-600" />
        </div>
        <h4 className="font-semibold text-2xl mb-1 text-gray-900">For Everyone</h4>
        <p className="text-sm text-center text-gray-600 max-w-[14rem]">
          One gift that fits every taste, budget, and occasion.
        </p>
      </div>
    </section>
  );
};

export default Features;