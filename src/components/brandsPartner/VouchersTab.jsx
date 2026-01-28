import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { currencyList } from "./currency";

const VouchersTab = ({ formData, updateFormData }) => {
  const [denominationValue, setDenominationValue] = useState("");
  const [denominationExpiry, setDenominationExpiry] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currencies] = useState(currencyList);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (formData.logo) {
      if (typeof formData.logo === 'string') {
        setLogoPreview(formData.logo);
      } else if (formData.logo instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(formData.logo);
      }
    } else {
      setLogoPreview(null);
    }
  }, [formData.logo]);

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

    updateFormData("denominations", [
      ...(formData.denominations || []),
      newDenom,
    ]);
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
          if (field === "expiresAt") {
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
    <div className="w-full">
      <div className="bg-white px-5 py-6 rounded-lg border border-gray-200">
        <div className="">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-6 h-6  rounded flex items-center justify-center">
                {/* <span className="text-white text-xs">✕</span> */}
                <img
                  src="/mdi_voucher.svg"
                  alt="Voucher Icon"
                  className="w-6 h-6 text-white text-xs"
                />
              </div>
              <p className="font-inter text-base font-semibold capitalize text-[#4A4A4A]">
                Denomination Setup
              </p>
            </div>
            <p className="font-inter text-xs font-medium leading-5 text-[#A5A5A5] mb-4">
              When do we settle with this trend
            </p>
          </div>
          {/* Amount Range Section */}
          <div className="rounded-lg pt-3">
            <p className="font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-1">
              Amount Range
            </p>
            <p className="font-inter text-xs font-medium leading-5 text-[#A5A5A5] mb-4">
              Allow any amount within a range with optional expiry date
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
                  Minimum Amount*
                </label>
                <input
                  type="number"
                  value={formData.minAmount || ""}
                  onChange={(e) =>
                    updateFormData("minAmount", parseFloat(e.target.value) || 0)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={formData.maxAmount || ""}
                  onChange={(e) =>
                    updateFormData("maxAmount", parseFloat(e.target.value) || 0)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Amount Range Expiry */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
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
          <div className="pt-6">
            <p className="font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-1">
              Static Denominations
            </p>
            <p className="font-inter text-xs font-medium leading-5 text-[#A5A5A5] mb-4">
              Create fixed amounts with optional expiry dates
            </p>

            {/* Add New Denomination Form */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4">
                Add New Denomination
              </p>

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formData?.currency || ""}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white cursor-not-allowed text-gray-500"
                  >
                    {currencies.map((cur) => (
                      <option key={cur?.code} value={cur?.code}>
                        {cur?.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-1.5">
                    Amount*
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={denominationValue}
                    onChange={(e) => setDenominationValue(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $50 Gift Card"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-1.5">
                    Expiry Date*
                  </label>
                  <input
                    type="date"
                    value={denominationExpiry}
                    onChange={(e) => setDenominationExpiry(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center h-[38px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Active
                    </span>
                  </label>
                </div>

                <div className="flex justify-end md:justify-end">
                  <button
                    onClick={addDenomination}
                    className="w-full max-w-fit px-2 bg-[#175EFD] hover:bg-blue-700 text-white px-2 py-3 rounded-md text-sm font-medium transition-colors"
                  >
                    + Add New Voucher
                  </button>
                </div>
              </div>

              <p className="font-inter text-xs font-medium leading-5 text-[#1F59EE] mt-3 break-words">
                * Required fields. Display name defaults to '{formData?.currency || "USD"}' if left empty.
              </p>
            </div>
          </div>

        </div>
      </div>
      {/* Active Denominations List */}
      {formData.denominations?.length > 0 && (
        <div className="space-y-4 pt-6">
          <p className="font-inter text-base font-semibold text-[#4A4A4A]">
            Active Denomination (
            {formData.denominations.filter((d) => d.isActive).length}/
            {formData.denominations.length})
          </p>

          {formData.denominations.map((denom) => (
            <div
              key={denom.id}
              className={`border rounded-lg p-4 transition-all ${denom.isActive
                  ? "bg-white border-gray-200"
                  : "bg-gray-50 border-gray-300 opacity-60"
                }`}
            >
              {/* Header Row */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left */}
                <div className="flex-1 space-y-4">
                  {/* Display Name + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1">
                      <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={denom.displayName || ""}
                        onChange={(e) =>
                          updateDenomination(
                            denom.id,
                            "displayName",
                            e.target.value
                          )
                        }
                        placeholder={`${denom.currency} ${denom.value}`}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <button
                      onClick={() => toggleDenominationActive(denom.id)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${denom.isActive
                          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                    >
                      {denom.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-2">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={denom.currency}
                        disabled
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-2">
                        Amount*
                      </label>
                      <input
                        type="number"
                        value={denom.value}
                        onChange={(e) =>
                          updateDenomination(
                            denom.id,
                            "value",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-inter text-sm font-semibold text-[#4A4A4A] mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={
                          denom.expiresAt
                            ? new Date(denom.expiresAt)
                              .toISOString()
                              .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateDenomination(
                            denom.id,
                            "expiresAt",
                            e.target.value || null
                          )
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <div className="flex justify-end md:pt-8">
                  <button
                    onClick={() => removeDenomination(denom.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Remove denomination"
                  >
                    <svg
                      className="w-4 h-4"
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
            </div>
          ))}
        </div>
      )}


      {/* Voucher Preview */}
      <div className="border rounded-lg p-4 transition-all bg-white border-gray-200 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6  flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99986 2.5C14.4932 2.5 18.2315 5.73333 19.0157 10C18.2324 14.2667 14.4932 17.5 9.99986 17.5C5.50653 17.5 1.7682 14.2667 0.984863 10C1.7682 5.73333 5.50653 2.5 9.99986 2.5ZM9.99986 15.8333C11.6996 15.8332 13.3489 15.256 14.6778 14.1962C16.0066 13.1365 16.9364 11.657 17.3149 10C16.9354 8.34401 16.0052 6.8658 14.6765 5.80712C13.3478 4.74844 11.6992 4.17196 10.0003 4.17196C8.30137 4.17196 6.65274 4.74844 5.32403 5.80712C3.99532 6.8658 3.06516 8.34401 2.6857 10C3.06411 11.6569 3.99376 13.1363 5.32248 14.196C6.65121 15.2557 8.30031 15.833 9.99986 15.8333ZM9.99986 13.75C9.0053 13.75 8.05147 13.3549 7.34821 12.6516C6.64495 11.9484 6.24986 10.9946 6.24986 10C6.24986 9.00544 6.64495 8.05161 7.34821 7.34835C8.05147 6.64509 9.0053 6.25 9.99986 6.25C10.9944 6.25 11.9483 6.64509 12.6515 7.34835C13.3548 8.05161 13.7499 9.00544 13.7499 10C13.7499 10.9946 13.3548 11.9484 12.6515 12.6516C11.9483 13.3549 10.9944 13.75 9.99986 13.75ZM9.99986 12.0833C10.5524 12.0833 11.0823 11.8638 11.473 11.4731C11.8637 11.0824 12.0832 10.5525 12.0832 10C12.0832 9.44747 11.8637 8.91756 11.473 8.52686C11.0823 8.13616 10.5524 7.91667 9.99986 7.91667C9.44733 7.91667 8.91742 8.13616 8.52672 8.52686C8.13602 8.91756 7.91653 9.44747 7.91653 10C7.91653 10.5525 8.13602 11.0824 8.52672 11.4731C8.91742 11.8638 9.44733 12.0833 9.99986 12.0833Z"
                fill="#4A4A4A"
              />
            </svg>
          </div>
          <p className="font-inter text-base font-semibold capitalize text-[#4A4A4A]">
            Voucher Preview
          </p>
        </div>

        <div className="p-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
              Brand Logo*
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-lg h-48">
              <div className="flex items-center justify-center">
                {formData.logo || formData.imagePreview ? (
                  <img
                    src={formData.logo || formData.imagePreview}
                    alt="Brand logo"
                    className="max-w-full max-h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 text-center">
                Expires{" "}
                {formData.denominations?.[0]?.expiresAt
                  ? new Date(
                    formData.denominations[0].expiresAt
                  ).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })
                  : "31/12/2025"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VouchersTab;