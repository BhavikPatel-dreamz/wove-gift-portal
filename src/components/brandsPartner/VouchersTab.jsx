import React from 'react';

const VouchersTab = ({ formData, updateFormData }) => {
  // Ensure redemptionChannels is always an object
  const redemptionChannels = formData.redemptionChannels || {};

  return (
    <div className="space-y-8">
      {/* Denomination Setup */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="mr-2">🎫</span>
          Denomination Setup
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Denomination Type</label>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="denominationType"
                value="fixed"
                className="mt-1"
                checked={formData.denominationType === 'fixed'}
                onChange={(e) => updateFormData('denominationType', e.target.value)}
              />
              <div>
                <div className="font-medium">Fixed Denominations</div>
                <div className="text-sm text-gray-500">Offer standard pre-determined voucher fixed</div>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="denominationType"
                value="amount"
                checked={formData.denominationType === 'amount'}
                onChange={(e) => updateFormData('denominationType', e.target.value)}
              />
              <div>
                <div className="font-medium">Amount Range</div>
                <div className="text-sm text-gray-500">Let customers set the amount within a range</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Denomination</label>
          <div className="flex space-x-2 mb-4">
            <input
              type="number"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              placeholder="100"
              value={formData.denominationValue || ''}
              onChange={(e) => updateFormData('denominationValue', e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add
            </button>
          </div>
          <p className="text-sm text-gray-500">Set denomination values for vouchers ($)</p>
        </div>
      </div>

      {/* Expiry & Grace Period */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Expiry & Grace Period</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Policy</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.expiryPolicy || 'neverExpires'}
              onChange={(e) => updateFormData('expiryPolicy', e.target.value)}
            >
              <option value="neverExpires">Never</option>
              <option value="fixedDay">Fixed Date</option>
              <option value="periodAfterPurchase">Period After Purchase</option>
            </select>
          </div>
          {formData.expiryPolicy === 'fixedDay' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Days</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="365"
                value={formData.fixedDays || ''}
                onChange={(e) => updateFormData('fixedDays', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
          {formData.expiryPolicy === 'periodAfterPurchase' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.expiresAt || ''}
                onChange={(e) => updateFormData('expiresAt', e.target.value)}
              />
            </div>
          )}
          {formData.expiryPolicy === 'months' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Months</label>
              <input
                type="month"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.expiryMonth || ''}
                onChange={(e) => updateFormData('expiryMonth', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Value</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Never"
              value={formData.expiryValue || ''}
              onChange={(e) => updateFormData('expiryValue', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grace Days</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="0"
              value={formData.graceDays || ''}
              onChange={(e) => updateFormData('graceDays', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Grace days allow a few extra days beyond the official expiry.
        </p>
      </div>

      {/* Redemption Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Redemption Settings</h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Redemption Channels</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 mr-3"
                checked={redemptionChannels.online || false}
                onChange={(e) => updateFormData('redemptionChannels', {
                  ...redemptionChannels,
                  online: e.target.checked
                })}
              />
              <span>Online</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 mr-3"
                checked={redemptionChannels.inStore || false}
                onChange={(e) => updateFormData('redemptionChannels', {
                  ...redemptionChannels,
                  inStore: e.target.checked
                })}
              />
              <span>In-Store</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 mr-3"
                checked={redemptionChannels.phone || false}
                onChange={(e) => updateFormData('redemptionChannels', {
                  ...redemptionChannels,
                  phone: e.target.checked
                })}
              />
              <span>Phone</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Partial Redemption</label>
            <p className="text-sm text-gray-500">Allow customers to spend voucher in multiple purchases</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.partialRedemption || false}
              onChange={(e) => updateFormData('partialRedemption', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {formData.partialRedemption ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Per Use Per Days</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="1"
            value={formData.maxUserPerDay || ''}
            onChange={(e) => updateFormData('maxUserPerDay', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Voucher Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="mr-2">👁️</span>
          Voucher Preview
        </h3>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h4 className="font-medium text-lg mb-2">Brand Name</h4>
          <p className="text-gray-600 text-sm mb-4">Gift Card • $100.00</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            This is a preview of how vouchers will appear to customers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VouchersTab;