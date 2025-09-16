import React from 'react';

const TermsTab = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-8">
      {/* Settlement Trigger */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Settlement Trigger
        </h3>
        <p className="text-sm text-gray-600 mb-4">When do we settle with this brand?</p>

        <div className="space-y-4">
          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="settlementTrigger"
              value="redemption"
              className="mt-1"
              checked={formData.settlementTrigger === 'redemption'}
              onChange={(e) => updateFormData('settlementTrigger', e.target.value)}
            />
            <div>
              <div className="font-medium">On Redemption</div>
              <div className="text-sm text-gray-500">Settle when customers redeem their vouchers</div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="settlementTrigger"
              value="purchase"
              checked={formData.settlementTrigger === 'purchase'}
              onChange={(e) => updateFormData('settlementTrigger', e.target.value)}
            />
            <div>
              <div className="font-medium">Amount Range</div>
              <div className="text-sm text-gray-500">If a customer is over a certain amount within a range</div>
            </div>
          </label>
        </div>
      </div>

      {/* Commission Model */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Commission Model</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.commissionType}
              onChange={(e) => updateFormData('commissionType', e.target.value)}
            >
              <option value="Percentage">Percentage</option>
              <option value="Fixed Amount">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Value</label>
            <div className="flex">
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                placeholder="0.00"
                value={formData.commissionValue}
                onChange={(e) => updateFormData('commissionValue', parseFloat(e.target.value) || 0)}
              />
              <span className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-gray-500">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.currency}
              onChange={(e) => updateFormData('currency', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="ZAR">ZAR</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (Optional)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="0"
              value={formData.minimumOrderValue || 0} // Fallback to 0 if undefined
              onChange={(e) => updateFormData('minimumOrderValue', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount % (Optional)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="0"
            value={formData.maxDiscount}
            onChange={(e) => updateFormData('maxDiscount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Breakage Policy */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Breakage Policy</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Breakage Policy</label>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="breakagePolicy"
                value="none"
                className="mt-1"
                checked={formData.breakagePolicy === 'none'}
                onChange={(e) => updateFormData('breakagePolicy', e.target.value)}
              />
              <div>
                <div className="font-medium">None</div>
                <div className="text-sm text-gray-500">No base commission breakage rules or policy.</div>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="breakagePolicy"
                value="percentage"
                checked={formData.breakagePolicy === 'percentage'}
                onChange={(e) => updateFormData('breakagePolicy', e.target.value)}
              />
              <div>
                <div className="font-medium">Share</div>
                <div className="text-sm text-gray-500">Split commissioning share with the brand.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Contract Terms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start *</label>
            <div className="flex">
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                value={formData.contractStart}
                onChange={(e) => updateFormData('contractStart', e.target.value)}
              />
              <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2">
                📅
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract End</label>
            <div className="flex">
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                value={formData.contractEnd}
                onChange={(e) => updateFormData('contractEnd', e.target.value)}
              />
              <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2">
                📅
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date Type (Optional)</label>
            <div className="flex">
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                value={formData.endDateType}
                onChange={(e) => updateFormData('endDateType', e.target.value)}
              />
              <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2">
                📅
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Renew Contract</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.autoRenew}
              onChange={(e) => updateFormData('autoRenew', e.target.value)}
            >
              <option value="Automatically renewal contract (default)">Automatically renewal contract (default)</option>
              <option value="Manual renewal required">Manual renewal required</option>
            </select>
          </div>
        </div>
      </div>

      {/* VAT & Notice */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">VAT & Notice</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="15"
              step="0.01"
              value={formData.vatRate}
              onChange={(e) => updateFormData('vatRate', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period (Days)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="30"
              value={formData.noticePeriod}
              onChange={(e) => updateFormData('noticePeriod', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
            placeholder="Any special terms about commercial terms..."
            value={formData.specialNotes}
            onChange={(e) => updateFormData('specialNotes', e.target.value)}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 mt-1">ℹ️</div>
            <p className="text-sm text-blue-800">
              When adding a brand commercial terms, a new contract will be created which existing the references for both payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsTab;