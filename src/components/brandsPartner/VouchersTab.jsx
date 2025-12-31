import React, { useState } from "react";
import toast from "react-hot-toast";
import { currencyList } from "./currency";

const VouchersTab = ({ formData, updateFormData }) => {
  const [denominationValue, setDenominationValue] = useState("");
  const [denominationCurrency, setDenominationCurrency] = useState(formData?.currency);
  const [denominationExpiry, setDenominationExpiry] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currencies] = useState(currencyList);

  const addDenomination = () => {
    if (!denominationValue || isNaN(denominationValue)) {
      toast.error("Please enter a valid denomination amount.");
      return;
    }

    if (denominationExpiry) {
      const selectedDate = new Date(denominationExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        toast.error("Expiry date cannot be in the past.");
        return;
      }
    }

    const newDenom = {
      id: Date.now(),
      value: parseFloat(denominationValue),
      currency: formData?.currency,
      displayName: displayName || `${formData?.currency} ${denominationValue}`,
      isActive: isActive,
      isExpiry: !!denominationExpiry,
      expiresAt: denominationExpiry || null,
    };

    updateFormData("denominations", [...(formData.denominations || []), newDenom]);
    setDenominationValue("");
    setDenominationExpiry("");
    setDisplayName("");
    setIsActive(true);
    toast.success("Denomination added successfully!");
  };

  const removeDenomination = (id) => {
    updateFormData(
      "denominations",
      (formData.denominations || []).filter((d) => d.id !== id)
    );
  };

  const updateDenomination = (id, field, value) => {
    updateFormData(
      "denominations",
      (formData.denominations || []).map((d) => {
        if (d.id === id) {
          const updatedDenom = { ...d, [field]: value };
          if (field === 'expiresAt') {
            updatedDenom.isExpiry = !!value;
          }
          return updatedDenom;
        }
        return d;
      })
    );
  };

  const updateDenominationExpiry = (id, dateValue) => {
    updateFormData(
      "denominations",
      (formData.denominations || []).map((d) =>
        d.id === id ? { ...d, expiresAt: dateValue, isExpiry: !!dateValue } : d
      )
    );
  };

  const toggleDenominationActive = (id) => {
    updateFormData(
      "denominations",
      (formData.denominations || []).map((d) =>
        d.id === id ? { ...d, isActive: !d.isActive } : d
      )
    );
  };

  const getPreviewData = () => {
    const brandName = formData.brandName || "Brand Name";
    const brandInitial = brandName.charAt(0).toUpperCase();
    const primaryColor = formData.color || "#2563EB";

    let amountDisplay = "Amount";
    let expiryText = "Never expires";

    if (formData.denominations?.length > 0) {
      const activeDenoms = formData.denominations.filter(d => d.isActive);
      if (activeDenoms.length > 0) {
        const first = activeDenoms[0];
        amountDisplay = first.displayName || `${first.currency} ${first.value?.toFixed(2)}`;
        if (first.expiresAt) {
          expiryText = `Expires: ${new Date(first.expiresAt).toLocaleDateString()}`;
        }
      }
    } else if (formData.minAmount || formData.maxAmount) {
      amountDisplay = `${formData.currency || ''} ${formData.minAmount?.toFixed(2) || '0.00'} - ${formData.maxAmount?.toFixed(2) || '0.00'}`;
      if (formData.isExpiry && formData.expiresAt) {
        expiryText = `Expires: ${new Date(formData.expiresAt).toLocaleDateString()}`;
      }
    }

    return { brandName, brandInitial, primaryColor, amountDisplay, expiryText };
  };

  const preview = getPreviewData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-8">
        
        {/* Denomination Setup Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💳</span>
            <h2 className="text-lg font-semibold text-gray-900">Denomination Setup</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">When do we settle with this trend</p>

          {/* Amount Range Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Amount Range</h3>
            <p className="text-xs text-gray-500 mb-4">Allow any amount within a range with optional expiry date</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Amount*
                </label>
                <input
                  type="number"
                  value={formData.minAmount || ""}
                  onChange={(e) => updateFormData("minAmount", parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={formData.maxAmount || ""}
                  onChange={(e) => updateFormData("maxAmount", parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            {/* Amount Range Expiry */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <label className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 mt-1 focus:ring-2 focus:ring-amber-500"
                  checked={formData.isExpiry || false}
                  onChange={(e) => {
                    updateFormData("isExpiry", e.target.checked);
                    if (!e.target.checked) {
                      updateFormData("expiresAt", "");
                    }
                  }}
                />
                <div>
                  <span className="text-sm font-medium">
                    Set expiry date for all vouchers in this range
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    All vouchers within this amount range will share the same expiry date
                  </p>
                </div>
              </label>

              {formData.isExpiry && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt || ""}
                    onChange={(e) => updateFormData("expiresAt", e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Static Denominations Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Static Denominations</h3>
            <p className="text-xs text-gray-500 mb-4">Create fixed amounts with optional expiry dates</p>
            
           

            {/* Add New Denomination Form */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3\">Add New Denomination</h4>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData?.currency || ''}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                  >
                    {currencies.map((cur) => (
                      <option key={cur?.code} value={cur?.code}>
                        {cur?.symbol + " " + cur?.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount*
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={denominationValue}
                    onChange={(e) => setDenominationValue(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $50 Gift Card"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className={`grid gap-3 items-end grid-cols-4`}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expiry Date*
                  </label>
                  <input
                    type="date"
                    value={denominationExpiry}
                    onChange={(e) => setDenominationExpiry(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  
                </div>
                <div className="col-span-2">
                  <button
                    onClick={addDenomination}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    + Add New Brand
                  </button>
                </div>
              </div>

              <p className="text-xs text-blue-700 mt-2">
                * Required fields. Display name defaults to "{formData?.currency || 'USD'}" if left empty.
              </p>
            </div>

            {/* Active Denominations List */}
            {formData.denominations?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Active Denomination ({formData.denominations.filter(d => d.isActive).length}/{formData.denominations.length})
                </h4>
                
                {formData.denominations.map((denom) => (
                  <div
                    key={denom.id}
                    className={`border rounded-lg p-4 transition-all ${
                      denom.isActive
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={denom.displayName || ""}
                              onChange={(e) => updateDenomination(denom.id, 'displayName', e.target.value)}
                              placeholder={`${denom.currency} ${denom.value}`}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="pt-5">
                            <button
                              onClick={() => toggleDenominationActive(denom.id)}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                denom.isActive
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {denom.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Currency
                            </label>
                            <input
                              type="text"
                              value={denom.currency}
                              disabled
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Amount*
                            </label>
                            <input
                              type="number"
                              value={denom.value}
                              onChange={(e) => updateDenomination(denom.id, 'value', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="date"
                                value={denom.expiresAt ? new Date(denom.expiresAt).toISOString().split("T")[0] : ""}
                                onChange={(e) => updateDenomination(denom.id, 'expiresAt', e.target.value || null)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeDenomination(denom.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors mt-5"
                        title="Remove denomination"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Voucher Preview Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👁️</span>
            <h2 className="text-lg font-semibold text-gray-900">Voucher Preview</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden shadow-md"
                style={{ backgroundColor: preview.primaryColor }}
              >
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt={preview.brandName}
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {preview.brandInitial}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{preview.brandName}</h3>
                <p className="text-lg font-semibold mt-1" style={{ color: preview.primaryColor }}>
                  {preview.amountDisplay}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 text-center">
              {preview.expiryText}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VouchersTab;