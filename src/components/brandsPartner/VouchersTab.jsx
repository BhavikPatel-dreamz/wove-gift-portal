import React, { useState } from "react";
import toast from "react-hot-toast";
import {currencyList} from "./currency";

const VouchersTab = ({ formData, updateFormData }) => {
  const [denominationValue, setDenominationValue] = useState("");
  const [denominationCurrency, setDenominationCurrency] = useState(formData?.currency);
  const [denominationExpiry, setDenominationExpiry] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currencies] = useState(currencyList);

  const handleDenominationTypeChange = (type) => {
    updateFormData("denominationType", type);
    if (type === "fixed") {
      updateFormData("minAmount", 0);
      updateFormData("maxAmount", 0);
      updateFormData("denominations", []);
      // Clear amount range expiry
      updateFormData("isExpiry", false);
      updateFormData("expiresAt", "");
    } else {
      setDenominationValue("");
      setDenominationCurrency(formData?.currency);
      setDenominationExpiry("");
      setDisplayName("");
      setIsActive(true);
      updateFormData("denominations", []);
      // Reset isExpiry for amount range
      updateFormData("isExpiry", false);
    }
  };

  const addDenomination = () => {
    if (!denominationValue || isNaN(denominationValue)) {
      toast.error("Please enter a valid denomination amount.");
      return;
    }

    // Only validate expiry if isExpiry is true
    if (formData.isExpiry) {
      if (!denominationExpiry) {
        toast.error("Please select an expiry date for this denomination.");
        return;
      }

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
      currency: denominationCurrency,
      displayName: displayName || `${denominationCurrency} ${denominationValue}`,
      isActive: isActive,
      // Only set expiresAt if isExpiry is true
      isExpiry: formData.isExpiry,
      expiresAt: formData.isExpiry ? denominationExpiry : null,
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
      (formData.denominations || []).map((d) =>
        d.id === id ? { ...d, [field]: value } : d
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

    let amountDisplay = "ZAR 100.00";
    let expiryText = "Never expires";

    if (formData.denominationType === "fixed" && formData.denominations?.length > 0) {
      const activeDenoms = formData.denominations.filter(d => d.isActive);
      if (activeDenoms.length > 0) {
        const first = activeDenoms[0];
        amountDisplay = first.displayName || `${first.currency} ${first.value?.toFixed(2)}`;
        if (formData.isExpiry && first.expiresAt) {
          expiryText = `Expires: ${new Date(first.expiresAt).toLocaleDateString()}`;
        }
      }
    } else if (formData.denominationType === "amount") {
      amountDisplay = `${formData.minAmount?.toFixed(2)} - ${formData.maxAmount?.toFixed(2)}`;
      if (formData.isExpiry && formData.expiresAt) {
        expiryText = `Expires: ${new Date(formData.expiresAt).toLocaleDateString()}`;
      }
    }

    return { brandName, brandInitial, primaryColor, amountDisplay, expiryText };
  };

  const preview = getPreviewData();

  return (
    <div className="space-y-8">
      {/* Denomination Setup */}
      <section className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🎫 Denomination Setup
        </h3>

        {/* Type Selection */}
        <div className="space-y-3 mb-6">
          {["fixed", "amount"].map((type) => (
            <label key={type} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="denominationType"
                value={type}
                checked={formData.denominationType === type}
                onChange={() => handleDenominationTypeChange(type)}
                className="mt-1"
              />
              <div>
                <div className="font-medium capitalize">
                  {type === "fixed" ? "Static Denominations" : "Amount Range"}
                </div>
                <p className="text-sm text-gray-500">
                  {type === "fixed"
                    ? "Create fixed amounts with optional expiry dates."
                    : "Allow any amount within a range with optional expiry date."}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Fixed Denominations */}
        {formData.denominationType === "fixed" && (
          <div className="space-y-4">
            {/* Expiry Toggle for Fixed Denominations */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <label className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 mt-1 focus:ring-2 focus:ring-amber-500"
                  checked={formData.isExpiry || false}
                  onChange={(e) => {
                    updateFormData("isExpiry", e.target.checked);
                    // Don't clear expiry dates - let users manage them individually
                    setDenominationExpiry("");
                  }}
                />
                <div>
                  <span className="text-sm font-medium">
                    Enable expiry dates for denominations
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    When enabled, each denomination can have its own expiry date. Existing denominations keep their dates.
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-blue-900">
                Add New Denomination
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {/* Row 1: Currency, Amount, Display Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Currency</label>
                    <select
                      value={denominationCurrency}
                      onChange={(e) => setDenominationCurrency(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-white"
                    >
                      {currencies.map((cur) => (
                        <option key={cur?.code} value={cur?.code}>
                          {cur?.symbol + " " + cur?.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Amount *</label>
                    <input
                      type="number"
                      placeholder="e.g., 50"
                      className="w-full border rounded-md px-3 py-2 bg-white"
                      value={denominationValue}
                      onChange={(e) => setDenominationValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g., $50 Gift Card"
                      className="w-full border rounded-md px-3 py-2 bg-white"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2: Expiry Date (conditional), Active Status, Add Button */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  {formData.isExpiry && (
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">Expiry Date *</label>
                      <input
                        type="date"
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        value={denominationExpiry}
                        onChange={(e) => setDenominationExpiry(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  )}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                  <button
                    onClick={addDenomination}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                * Required fields. Display name defaults to "{denominationCurrency} {denominationValue}" if left empty.
              </p>
            </div>

            {/* List of Added Denominations */}
            {formData.denominations?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Active Denominations ({formData.denominations.filter(d => d.isActive).length}/{formData.denominations.length})
                </h4>
                {formData.denominations.map((denom) => {
                  // Check if denomination is expired
                  const isExpired = denom.expiresAt && new Date(denom.expiresAt) < new Date();
                  
                  return (
                    <div
                      key={denom.id}
                      className={`p-4 border rounded-lg transition-all ${
                        denom.isActive
                          ? 'bg-white border-gray-200 hover:bg-gray-50'
                          : 'bg-gray-50 border-gray-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          {/* Display Name, Status & Expiry Badge */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
                              <input
                                type="text"
                                value={denom.displayName || ""}
                                onChange={(e) => updateDenomination(denom.id, 'displayName', e.target.value)}
                                placeholder={`${denom.currency} ${denom.value}`}
                                className="w-full border rounded px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Expired Badge */}
                              {isExpired && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  ⚠️ Expired
                                </span>
                              )}
                              {/* Active/Inactive Button */}
                              <button
                                onClick={() => toggleDenominationActive(denom.id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  denom.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {denom.isActive ? '✓ Active' : '✕ Inactive'}
                              </button>
                            </div>
                          </div>

                          {/* Amount, Currency, Expiry Date */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                              <input
                                type="text"
                                value={denom.currency}
                                disabled
                                className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                              <input
                                type="number"
                                value={denom.value}
                                onChange={(e) => updateDenomination(denom.id, 'value', parseFloat(e.target.value) || 0)}
                                className="w-full border rounded px-3 py-2 text-sm"
                              />
                            </div>
                          {denom.isExpiry && (
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Expiry Date {!formData.isExpiry && '(Optional)'}
                              </label>
                              <input
                                type="date"
                                value={denom.expiresAt ? new Date(denom.expiresAt).toISOString().split("T")[0] : ""}
                                onChange={(e) => updateDenomination(denom.id, 'expiresAt', e.target.value || null)}
                                className={`w-full border rounded px-3 py-2 text-sm ${
                                  isExpired ? 'border-red-300 bg-red-50' : ''
                                }`}
                                min={new Date().toISOString().split("T")[0]}
                              />
                              {isExpired && (
                                <p className="text-xs text-red-600 mt-1">
                                  This date has passed
                                </p>
                              )}
                            </div>
                              )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeDenomination(denom.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                          title="Remove denomination"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Amount Range with Single Expiry */}
        {formData.denominationType === "amount" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Amount
                </label>
                <input
                  type="number"
                  value={formData.minAmount || ""}
                  onChange={(e) =>
                    updateFormData("minAmount", parseFloat(e.target.value) || 0)
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={formData.maxAmount || ""}
                  onChange={(e) =>
                    updateFormData("maxAmount", parseFloat(e.target.value) || 0)
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Expiry for Amount Range */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-amber-900">
                Expiry Settings
              </h4>
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
                    className="border rounded-md px-3 py-2 w-full md:w-64"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Preview */}
      <section className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          👁️ Voucher Preview
        </h3>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border border-gray-200">
          <div
            className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center shadow-md mb-3"
            style={{ backgroundColor: preview.primaryColor }}
          >
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Brand"
                className="w-12 h-12 object-contain rounded"
              />
            ) : (
              <span className="text-white font-bold text-xl">
                {preview.brandInitial}
              </span>
            )}
          </div>

          <h4 className="font-bold text-xl mb-2">{preview.brandName}</h4>
          <p
            className="text-lg font-semibold"
            style={{ color: preview.primaryColor }}
          >
            {preview.amountDisplay}
          </p>
          <p className="text-sm text-gray-600 mt-2">{preview.expiryText}</p>
        </div>
      </section>
    </div>
  );
};

export default VouchersTab;