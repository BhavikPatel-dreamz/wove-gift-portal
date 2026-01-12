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
        <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] flex items-center">
          Settlement Trigger
        </h3>
        <p className="font-inter text-xs font-medium leading-5 text-[#A5A5A5] mb-4">When do we settle with this brand?</p>

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
              <div className="font-inter text-sm font-semibold capitalize text-[#4A4A4A]">On Redemption</div>
              <div className="font-inter text-xs font-medium leading-5 text-[#A5A5A5]">Settle when customers redeem their vouchers</div>
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
              <div className="font-inter text-sm font-semibold capitalize text-[#4A4A4A]">On Purchase</div>
              <div className="font-inter text-xs font-medium leading-5 text-[#A5A5A5]">Settle when customers purchase vouchers</div>
            </div>
          </label>
        </div>
      </div>

      {/* Commission Model */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4">Commission Model</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Commission Type</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A]"
              value={formData.commissionType || 'Percentage'}
              onChange={(e) => updateFormData('commissionType', e.target.value)}
            >
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Commission Value</label>
            <div className="flex">
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A]"
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
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Currency</label>
            <select
              value={formData?.currency || ''}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed font-inter text-xs font-medium leading-5 text-[#4A4A4A]"
            >
              {currencies.map((cur) => (
                <option key={cur?.code} value={cur?.code}>
                  {cur?.symbol + " " + cur?.code}
                </option>
              ))}
            </select>

          </div>
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Minimum Order Value (Optional)</label>
            <input
              type="number"
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A] w-full"
              placeholder="0"
              step="0.01"
              value={formData.minOrderValue || 0}
              onChange={(e) => updateFormData('minOrderValue', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Max Discount % (Optional)</label>
          <input
            type="number"
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A] w-full"
            placeholder="0"
            step="0.01"
            value={formData.maxDiscount || 0}
            onChange={(e) => updateFormData('maxDiscount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* {formData.settlementTrigger === 'onPurchase' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4">Breakage Policy</h3>
          <div>
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
                  <div className="font-inter text-sm font-semibold capitalize text-[#4A4A4A]">Retain</div>
                  <div className="font-inter text-xs font-medium leading-5 text-[#A5A5A5]">Keep the unredeemed voucher value at expiry.</div>
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
                  <div className="font-inter text-sm font-semibold capitalize text-[#4A4A4A]">Share</div>
                  <div className="font-inter text-xs font-medium leading-5 text-[#A5A5A5]">Split the unredeemed value with the brand.</div>
                </div>
              </label>
            </div>
            {(formData.breakagePolicy === "Share" || formData.breakagePolicy === "share") && (
              <div className="mt-4">
                <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Breakage Share (%)</label>
                <input
                  type="number"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A] w-full"
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
      )} */}

      {formData.settlementTrigger === 'onRedemption' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4 flex items-center">
            Contract Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Contract Start *</label>
              <div className="flex">
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A]"
                  value={formData.contractStart || ''}
                  onChange={(e) => updateFormData('contractStart', e.target.value)}
                />
                <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2" type="button">
                  📅
                </button>
              </div>
            </div>
            <div>
              <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Contract End *</label>
              <div className="flex">
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A]"
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
              <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Go Live Date</label>
              <div className="flex">
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A]"
                  value={formData.goLiveDate || ''}
                  onChange={(e) => updateFormData('goLiveDate', e.target.value)}
                />
                <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2" type="button">
                  📅
                </button>
              </div>
            </div>
            {/* <div>
              <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Auto-Renew Contract</label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.renewContract || false}
                  onChange={(e) => updateFormData('renewContract', e.target.checked)}
                />
                <span className="text-sm">Automatically renew contract</span>
              </label>
            </div> */}
          </div>
        </div>
      )}

      {/* VAT & Internal Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4 flex items-center">VAT & Internal Notes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">VAT Rate (%)</label>
            <input
              type="number"
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-inter text-xs font-medium leading-5 text-[#4A4A4A] w-full"
              placeholder="15"
              step="0.01"
              min="0"
              max="100"
              value={formData.vatRate || 15}
              onChange={(e) => updateFormData('vatRate', parseFloat(e.target.value) || 0)}
            />
          </div>
          {/* <div className="flex items-end">
           <div className="font-inter text-xs font-medium leading-5 text-[#A5A5A5]">
              <p>Standard VAT rate applies to all transactions</p>
            </div>
          </div> */}
        </div>

        <div className="mt-6">
          <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">Internal Notes</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 font-inter text-xs font-medium leading-5 text-[#4A4A4A]"
            placeholder="Any internal notes about commercial terms..."
            value={formData.internalNotes || ''}
            onChange={(e) => updateFormData('internalNotes', e.target.value)}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-center flex-row gap-2">
            <p className="font-inter text-[10px] font-semibold leading-none text-[#1F59EE]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9.00012 6.375V10.5M9.00012 12.9352V12.5602M4.48512 8.0715C6.45612 4.19025 7.44012 2.25 9.00012 2.25C10.5601 2.25 11.5449 4.19025 13.5151 8.0715L13.7604 8.5545C15.3969 11.7795 16.2159 13.392 15.4756 14.571C14.7361 15.75 12.9061 15.75 9.24537 15.75H8.75487C5.09487 15.75 3.26412 15.75 2.52462 14.571C1.78512 13.392 2.60337 11.7795 4.23987 8.5545L4.48512 8.0715Z" stroke="#1F59EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            </p>
             <span className="font-inter text-[10px] font-semibold leading-none text-[#1F59EE]">When updating brand commercial terms, the contract will be modified which affects existing payment references.</span> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsTab;