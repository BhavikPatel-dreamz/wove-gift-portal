// components/payment/BillingAddressForm.jsx
import React from 'react';

const BillingAddressForm = ({ address, onChange, errors = {} }) => {
  const handleChange = (field, value) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Billing Address <span className="text-red-500">*</span>
      </h3>

      <div className="space-y-4">
        {/* Address Line 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={address.line1 || ''}
            onChange={(e) => handleChange('line1', e.target.value)}
            placeholder="Street address, P.O. box"
            className={`w-full px-4 py-3 border ${errors.line1 ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
            required
          />
          {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1}</p>}
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={address.line2 || ''}
            onChange={(e) => handleChange('line2', e.target.value)}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
              className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
              required
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="State"
              className={`w-full px-4 py-3 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
              required
            />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address.postalCode || ''}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="Postal code"
              className={`w-full px-4 py-3 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
              required
            />
            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={address.country || 'IN'}
              onChange={(e) => handleChange('country', e.target.value)}
              className={`w-full px-4 py-3 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
              required
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              {/* Add more countries as needed */}
            </select>
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingAddressForm;