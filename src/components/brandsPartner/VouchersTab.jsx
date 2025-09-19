import React, { useState } from 'react';
import toast from 'react-hot-toast';

const VouchersTab = ({ formData, updateFormData }) => {
  const [denominationValue, setDenominationValue] = useState('');
  const [denominationCurrency, setDenominationCurrency] = useState('ZAR');

  const redemptionChannels = formData.redemptionChannels || {};

  const handleDenominationTypeChange = (type) => {
    updateFormData('denominationType', type);
    if (type === 'fixed') {
      updateFormData('minAmount', 0);
      updateFormData('maxAmount', 0);
      updateFormData('denominations', []);
    } else if (type === 'amount') {
      setDenominationValue('');
      setDenominationCurrency('ZAR');
      updateFormData('denominations', []);
    }
  };

  const addDenomination = () => {
    if (!denominationValue || isNaN(denominationValue)) {
      toast.error('Please enter a valid number for the denomination.');
      return;
    }

    const newDenomination = {
      id: Date.now(),
      value: parseFloat(denominationValue),
      currency: denominationCurrency,
    };

    const updatedDenominations = [...(formData.denominations || []), newDenomination];
    updateFormData('denominations', updatedDenominations);

    setDenominationValue('');
  };

  const removeDenomination = (id) => {
    const updatedDenominations = (formData.denominations || []).filter(d => d.id !== id);
    updateFormData('denominations', updatedDenominations);
  };

  // Generate dynamic preview data
  const getPreviewData = () => {
    const brandName = formData.brandName || 'Brand Name';
    const brandInitial = brandName.charAt(0).toUpperCase();
    const primaryColor = formData.color || '#000000';
    
    // Get amount display
    let amountDisplay = 'ZAR 100.00';
    if (formData.denominationType === 'fixed' && formData.denominations?.length > 0) {
      const firstDenom = formData.denominations[0];
      amountDisplay = `${firstDenom.currency} ${firstDenom?.value?.toFixed(2)}`;
    } else if (formData.denominationType === 'amount' && formData.minAmount && formData.maxAmount) {
      amountDisplay = `${formData.minAmount.toFixed(2)} - ${formData.maxAmount.toFixed(2)}`;
    }

    // Get redemption channels
    const channels = [];
    if (redemptionChannels.online) channels.push('online');
    if (redemptionChannels.inStore) channels.push('in_store');
    if (redemptionChannels.phone) channels.push('phone');
    const redemptionText = channels.length > 0 ? channels.join(', ') : 'online, in_store, phone';

    // Get expiry text
    let expiryText = 'Never expires';
    if (formData.expiryPolicy === 'fixedDay' && formData.fixedDays) {
      expiryText = `${formData.fixedDays} days from purchase`;
    } else if (formData.expiryPolicy === 'periodAfterPurchase' && formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      expiryText = `Expires: ${expiryDate.toLocaleDateString()}`;
    } else if (formData.expiryValue) {
      expiryText = formData.expiryValue;
    }

    return {
      brandName,
      brandInitial,
      primaryColor,
      amountDisplay,
      redemptionText,
      expiryText
    };
  };

  const previewData = getPreviewData();

  return (
    <div className="space-y-8">
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
                onChange={(e) => handleDenominationTypeChange(e.target.value)}
              />
              <div>
                <div className="font-medium">Static Denominations</div>
                <div className="text-sm text-gray-500">Fixed amounts that customers can choose from</div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="denominationType"
                value="amount"
                checked={formData.denominationType === 'amount'}
                onChange={(e) => handleDenominationTypeChange(e.target.value)}
              />
              <div>
                <div className="font-medium">Amount Range</div>
                <div className="text-sm text-gray-500">Let customers choose any amount within a range</div>
              </div>
            </label>
          </div>
        </div>

        {formData.denominationType === 'fixed' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Denomination</label>
            <div className="flex space-x-2 mb-4">
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={denominationCurrency}
                onChange={(e) => setDenominationCurrency(e.target.value)}
              >
                <option value="ZAR">ZAR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                placeholder="Amount"
                value={denominationValue}
                onChange={(e) => setDenominationValue(e.target.value)}
              />
              <button
                onClick={addDenomination}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <span className="text-lg mr-1">+</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">ZAR denominations must be multiples of 10</p>

            {/* Display added denominations */}
            {formData.denominations && formData.denominations.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Added Denominations</label>
                <div className="flex flex-wrap gap-2">
                  {formData.denominations.map((denom) => (
                    <div key={denom.id} className="flex items-center bg-blue-50 border border-blue-200 rounded-md px-3 py-1">
                      <span className="text-sm text-blue-800">{denom.currency} {denom.value}</span>
                      <button
                        onClick={() => removeDenomination(denom.id)}
                        className="ml-2 text-blue-600 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Amount Range Section */}
        {formData.denominationType === 'amount' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0"
                value={formData.minAmount || ''}
                onChange={(e) => updateFormData('minAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Amount</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0"
                value={formData.maxAmount || ''}
                onChange={(e) => updateFormData('maxAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}
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

      {/* Dynamic Voucher Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="mr-2">👁️</span>
          Voucher Preview
        </h3>

        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          {/* Brand Logo/Initial */}
          <div 
            className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: previewData.primaryColor }}
          >
            {formData.logo && typeof formData.logo === 'string' ? (
              <img 
                src={formData.logo} 
                alt="Brand logo" 
                className="w-12 h-12 object-contain rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <span 
              className="text-white font-bold text-xl"
              style={{ 
                display: (formData.logo && typeof formData.logo === 'string') ? 'none' : 'block',
                color: previewData.primaryColor === '#FFFFFF' ? '#000000' : '#FFFFFF'
              }}
            >
              {previewData.brandInitial}
            </span>
          </div>

          {/* Brand Name */}
          <h4 className="font-bold text-xl mb-2 text-gray-800">
            {previewData.brandName}
          </h4>

          {/* Amount Display */}
          <p className="text-lg font-semibold mb-1" style={{ color: previewData.primaryColor }}>
            {previewData.amountDisplay} Voucher
          </p>

          {/* Redemption Info */}
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <p>
              <span className="font-medium">Redemption:</span> {previewData.redemptionText}
            </p>
            <p>
              <span className="font-medium">Expires:</span> {previewData.expiryText}
            </p>
            {formData.partialRedemption && (
              <p className="text-green-600">
                <span className="font-medium">✓ Partial redemption allowed</span>
              </p>
            )}
            {formData.graceDays > 0 && (
              <p className="text-blue-600">
                <span className="font-medium">Grace period:</span> {formData.graceDays} days
              </p>
            )}
          </div>

          {/* Multiple Denominations Preview */}
          {formData.denominationType === 'fixed' && formData.denominations?.length > 1 && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-xs text-gray-500 mb-2">Available denominations:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {formData.denominations.slice(0, 4).map((denom) => (
                  <span 
                    key={denom.id} 
                    className="px-2 py-1 text-xs rounded border"
                    style={{ 
                      borderColor: previewData.primaryColor,
                      color: previewData.primaryColor
                    }}
                  >
                    {denom.currency} {denom.value}
                  </span>
                ))}
                {formData.denominations.length > 4 && (
                  <span className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-500">
                    +{formData.denominations.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-4 italic">
            This is a preview of how vouchers will appear to customers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VouchersTab;