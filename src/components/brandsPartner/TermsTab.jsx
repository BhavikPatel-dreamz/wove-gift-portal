import React from 'react';
import { currencyList } from './currency';
import { useState } from 'react';

const TermsTab = ({ formData, updateFormData }) => {
    const [currencies] = useState(currencyList);
  
  // Handle settlement trigger change and clear relevant fields
  const handleSettlementTriggerChange = (value) => {
    updateFormData('settlementTrigger', value);

    // Clear contract-related fields when switching to "On Purchase"
    if (value === 'onPurchase') {
      updateFormData('contractStart', '');
      updateFormData('contractEnd', '');
      updateFormData('goLiveDate', '');
      updateFormData('renewContract', false);
    }

    // Clear breakage-related fields when switching to "On Redemption"
    if (value === 'onRedemption') {
      updateFormData('breakagePolicy', '');
      updateFormData('breakageShare', 0);
    }
  };

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
              value="onRedemption"
              className="mt-1"
              checked={formData.settlementTrigger === 'onRedemption'}
              onChange={(e) => handleSettlementTriggerChange(e.target.value)}
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
              value="onPurchase"
              checked={formData.settlementTrigger === 'onPurchase'}
              onChange={(e) => handleSettlementTriggerChange(e.target.value)}
            />
            <div>
              <div className="font-medium">On Purchase</div>
              <div className="text-sm text-gray-500">Settle when customers purchase vouchers</div>
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
              value={formData.commissionType || 'Percentage'}
              onChange={(e) => updateFormData('commissionType', e.target.value)}
            >
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Value</label>
            <div className="flex">
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                placeholder="0.00"
                step="0.01"
                value={formData.commissionValue || 0}
                onChange={(e) => updateFormData('commissionValue', parseFloat(e.target.value) || 0)}
              />
              <span className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-gray-500">
                {formData.commissionType === 'Fixed Amount' ? formData.currency || 'USD' : '%'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={formData?.currency || ''}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
            >
              {currencies.map((cur) => (
                <option key={cur?.code} value={cur?.code}>
                  {cur?.symbol + " " + cur?.code}
                </option>
              ))}
            </select>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (Optional)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="0"
              step="0.01"
              value={formData.minOrderValue || 0}
              onChange={(e) => updateFormData('minOrderValue', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount % (Optional)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="0"
            step="0.01"
            value={formData.maxDiscount || 0}
            onChange={(e) => updateFormData('maxDiscount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {formData.settlementTrigger === 'onPurchase' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Breakage Policy</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breakage Policy</label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="breakagePolicy"
                  value="Retain"
                  className="mt-1"
                  checked={formData.breakagePolicy === 'Retain'}
                  onChange={(e) => updateFormData('breakagePolicy', e.target.value)}
                />
                <div>
                  <div className="font-medium">Retain</div>
                  <div className="text-sm text-gray-500">Keep the unredeemed voucher value at expiry.</div>
                </div>
              </label>
              <label className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="breakagePolicy"
                  value="Share"
                  checked={formData.breakagePolicy === 'Share'}
                  onChange={(e) => updateFormData('breakagePolicy', e.target.value)}
                />
                <div>
                  <div className="font-medium">Share</div>
                  <div className="text-sm text-gray-500">Split the unredeemed value with the brand.</div>
                </div>
              </label>
            </div>
            {(formData.breakagePolicy === "Share" || formData.breakagePolicy === "share") && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Breakage Share (%)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="50"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.breakageShare ?? ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateFormData("breakageShare", isNaN(val) ? null : val);
                  }}
                />

              </div>
            )}
          </div>
        </div>
      )}

      {formData.settlementTrigger === 'onRedemption' && (
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
                  value={formData.contractStart || ''}
                  onChange={(e) => updateFormData('contractStart', e.target.value)}
                />
                <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2" type="button">
                  📅
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contract End *</label>
              <div className="flex">
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                  value={formData.contractEnd || ''}
                  onChange={(e) => updateFormData('contractEnd', e.target.value)}
                />
                <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2" type="button">
                  📅
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Go Live Date</label>
              <div className="flex">
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                  value={formData.goLiveDate || ''}
                  onChange={(e) => updateFormData('goLiveDate', e.target.value)}
                />
                <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2" type="button">
                  📅
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Renew Contract</label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.renewContract || false}
                  onChange={(e) => updateFormData('renewContract', e.target.checked)}
                />
                <span className="text-sm">Automatically renew contract</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* VAT & Internal Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">VAT & Internal Notes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="15"
              step="0.01"
              min="0"
              max="100"
              value={formData.vatRate || 15}
              onChange={(e) => updateFormData('vatRate', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              <p>Standard VAT rate applies to all transactions</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
            placeholder="Any internal notes about commercial terms..."
            value={formData.internalNotes || ''}
            onChange={(e) => updateFormData('internalNotes', e.target.value)}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 mt-1">ℹ️</div>
            <p className="text-sm text-blue-800">
              When updating brand commercial terms, the contract will be modified which affects existing payment references.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsTab;