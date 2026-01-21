import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Calendar } from 'lucide-react';

const BankingTab = ({ formData, updateFormData }) => {
  // Local state for showing/hiding sensitive information
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showSwiftCode, setShowSwiftCode] = useState(false);

  // Helper function to mask account number
  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  // Helper function to mask SWIFT code
  const maskSwiftCode = (swiftCode) => {
    if (!swiftCode) return '';
    if (swiftCode.length <= 3) return swiftCode;
    return swiftCode.slice(0, 3) + '*'.repeat(swiftCode.length - 3);
  };

  // Generate day options (1-28 for monthly settlement)
  const dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Settlement Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="text-blue-600" size={20} />
          <h3 className="font-inter text-[16px] font-semibold leading-none capitalize text-[#4A4A4A]">Settlement Schedule</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">
              Settlement Frequency *
            </label>

            <select
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 
      text-[#4A4A4A] bg-gray-100 cursor-not-allowed opacity-70 
      focus:outline-none"
              value={formData.settlementFrequency || 'monthly'}
              onChange={(e) => updateFormData('settlementFrequency', e.target.value)}
            >
              <option value="monthly">Monthly</option>
            </select>
          </div>


          {formData.settlementFrequency === 'monthly' && (
            <div>
              <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">
                Day of Month *
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.dayOfMonth || 1}
                onChange={(e) => updateFormData('dayOfMonth', parseInt(e.target.value))}
                disabled={formData.settlementFrequency !== 'monthly'}
              >
                {dayOptions.map(day => (
                  <option key={day} value={day}>Day {day}</option>
                ))}
              </select>
              <p className="mt-1 font-inter text-[12px] font-medium leading-[20px] text-[#A5A5A5]">
                Settlement will occur on this day each month (1-28 only)
              </p>
            </div>
          )}

          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">
              Payout Method *
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.payoutMethod || 'EFT'}
              onChange={(e) => updateFormData('payoutMethod', e.target.value)}
            >
              <option value="EFT">EFT (Electronic Funds Transfer)</option>
              <option value="wire_transfer">Wire Transfer</option>
              <option value="manual">Manual Processing</option>
              <option value="paypal">paypal</option>
              <option value="stripe">stripe</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">
                Invoice Required
              </label>
              <p className="font-inter text-[12px] font-medium leading-5 text-[#A5A5A5]">Require invoice before settlement</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.invoiceRequired || false}
                onChange={(e) => updateFormData('invoiceRequired', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* <div className="mt-6">
          <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">
            Remittance Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="jucyquzeco@mailinator.com"
            value={formData.remittanceEmail || ''}
            onChange={(e) => updateFormData('remittanceEmail', e.target.value)}
          />
          <p className="font-inter text-[12px] font-medium leading-5 text-[#A5A5A5] mt-1">
            Settlement notifications and remittances will be sent here
          </p>
        </div> */}
      </div>

      {/* Banking Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-inter text-[16px] font-semibold text-[#4A4A4A] capitalize mb-4">Banking Details</h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-yellow-500 mt-0.5" size={16} />
            <p className="font-inter text-[12px] font-bold leading-[18px] text-[#7F3305]">
              <strong>Security Notice:</strong> Account numbers are encrypted and tokenised. Only masked values are displayed after saving.
            </p>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">Account Holder *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Account holder name"
              value={formData.accountHolder || ''}
              onChange={(e) => updateFormData('accountHolder', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">Bank Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bank name"
              value={formData.bankName || ''}
              onChange={(e) => updateFormData('bankName', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">Account Number *</label>
            <div className="relative">
              <input
                type={showAccountNumber ? "text" : "password"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Account number"
                value={showAccountNumber ? formData.accountNumber || '' : maskAccountNumber(formData.accountNumber || '')}
                onChange={(e) => updateFormData('accountNumber', e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowAccountNumber(!showAccountNumber)}
              >
                {showAccountNumber ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <p className="mt-1 font-inter text-[12px] font-medium leading-[20px] text-[#A5A5A5]">
              {showAccountNumber ? 'Click to hide' : 'Click to show'} account number
            </p>
          </div>

          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">Branch Code *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Branch code"
              value={formData.branchCode || ''}
              onChange={(e) => updateFormData('branchCode', e.target.value)}
            />
          </div>

          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">SWIFT/BIC Code</label>
            <div className="relative">
              <input
                type={showSwiftCode ? "text" : "password"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SWIFT/BIC (for international transfers)"
                value={showSwiftCode ? formData.swiftCode || '' : maskSwiftCode(formData.swiftCode || '')}
                onChange={(e) => updateFormData('swiftCode', e.target.value)}
              />
              {formData.swiftCode && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowSwiftCode(!showSwiftCode)}
                >
                  {showSwiftCode ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              )}
            </div>
            <p className="mt-1 font-inter text-[12px] font-medium leading-[20px] text-[#A5A5A5]">Required for international transfers</p>
          </div>

          <div>
            <label className="block font-inter text-[14px] font-semibold leading-none capitalize text-[#4A4A4A] mb-2">Country</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.country || 'South Africa'}
              onChange={(e) => updateFormData('country', e.target.value)}
            >
              <option value="South Africa">South Africa (ZA)</option>
              <option value="United States">United States (US)</option>
              <option value="United Kingdom">United Kingdom (GB)</option>
              <option value="Canada">Canada (CA)</option>
              <option value="Australia">Australia (AU)</option>
              <option value="Germany">Germany (DE)</option>
              <option value="France">France (FR)</option>
              <option value="Netherlands">Netherlands (NL)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <button
            type="button"
            className="bg-[#175EFD] text-white px-4 py-2 text-xs rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!formData.accountNumber || !formData.branchCode || !formData.bankName}
          >
            Verify Account
          </button>

          <div className="flex items-center space-x-2">
            {formData.accountVerification ? (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium">Account Verified</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs font-medium">Not Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settlement Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A]">Settlement Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-inter text-[10px] font-medium uppercase text-[#AAA] leading-normal">Frequency</div>
            <div className="mt-1 font-inter text-[14px] font-semibold capitalize text-[#4A4A4A]">
              {formData.settlementFrequency || 'Monthly'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-inter text-[10px] font-medium uppercase text-[#AAA] leading-normal">Schedule</div>
            <div className="mt-1 font-inter text-[14px] font-semibold capitalize text-[#4A4A4A]">
              {formData.settlementFrequency === 'monthly'
                ? `Day ${formData.dayOfMonth || 1} of month`
                : formData.settlementFrequency === 'weekly'
                  ? 'Every Monday'
                  : formData.settlementFrequency === 'quarterly'
                    ? 'Every 3 months'
                    : 'Manual'
              }
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-inter text-[10px] font-medium uppercase text-[#AAA] leading-normal">Method</div>
            <div className="mt-1 font-inter text-[14px] font-semibold capitalize text-[#4A4A4A]">
              {formData.payoutMethod || 'EFT'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-inter text-[10px] font-medium uppercase text-[#AAA] leading-normal">Invoice Required</div>
            <div className="mt-1 font-inter text-[14px] font-semibold capitalize text-[#4A4A4A]">
              <span className={`px-2 py-1 rounded-full text-xs ${formData.invoiceRequired
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {formData.invoiceRequired ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="mb-2 font-inter text-[14px] font-semibold capitalize text-[#1F59EE]">Next Settlement</h4>
          <p className="font-inter text-[10px] font-semibold leading-normal text-[#1F59EE]">
            Based on your current settings, the next settlement would be processed on{' '}
            <span className="font-medium">
              {formData.settlementFrequency === 'monthly'
                ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(formData.dayOfMonth || 1).padStart(2, '0')}`
                : 'Next scheduled date'
              }
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankingTab;