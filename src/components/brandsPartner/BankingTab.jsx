import React from 'react';
import { AlertTriangle } from 'lucide-react';

const BankingTab = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-8">
      {/* Banking Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Banking Details</h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-yellow-500 mt-0.5" size={16} />
            <p className="text-sm text-yellow-800">
              <strong>Security Notice:</strong> Account numbers are encrypted and tokenised. Only masked values are displayed after saving.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Account holder name"
              value={formData.accountHolderName}
              onChange={(e) => updateFormData('accountHolderName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Bank name"
              value={formData.bankNameDetails}
              onChange={(e) => updateFormData('bankNameDetails', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Account number"
              value={formData.accountNumberDetails}
              onChange={(e) => updateFormData('accountNumberDetails', e.target.value)}
            />
            <button className="text-blue-600 text-sm mt-1 hover:text-blue-800">Show</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Branch code"
              value={formData.branchCodeDetails}
              onChange={(e) => updateFormData('branchCodeDetails', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT/BIC Code</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="SWIFT/BIC (for international transfers)"
              value={formData.swiftCode}
              onChange={(e) => updateFormData('swiftCode', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Required for international transfers</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.country}
              onChange={(e) => updateFormData('country', e.target.value)}
            >
              <option value="South Africa (ZA)">South Africa (ZA)</option>
              <option value="United States (US)">United States (US)</option>
              <option value="United Kingdom (GB)">United Kingdom (GB)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Verify Account
          </button>
        </div>
      </div>

      {/* Settlement Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Settlement Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-gray-600">Frequency:</span>
            <span className="ml-2 font-medium">Monthly</span>
          </div>
          <div>
            <span className="text-gray-600">Method:</span>
            <span className="ml-2 font-medium">EFT</span>
          </div>
          <div>
            <span className="text-gray-600">Invoice Required:</span>
            <span className="ml-2 font-medium">Yes</span>
          </div>
          <div>
            <span className="text-gray-600">Bank Verified:</span>
            <span className="ml-2 font-medium text-red-600">No</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingTab;