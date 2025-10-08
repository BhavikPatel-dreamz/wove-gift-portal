import React, { useState } from "react";
import toast from "react-hot-toast";


const VouchersTab = ({ formData, updateFormData }) => {
  const [denominationValue, setDenominationValue] = useState("");
  const [denominationCurrency, setDenominationCurrency] = useState(formData?.currency);
  const [currencies]=useState([formData?.currency]);


  const handleDenominationTypeChange = (type) => {
    updateFormData("denominationType", type);
    if (type === "fixed") {
      updateFormData("minAmount", 0);
      updateFormData("maxAmount", 0);
      updateFormData("denominations", []);
    } else {
      setDenominationValue("");
      setDenominationCurrency("ZAR");
      updateFormData("denominations", []);
    }
  };

  const addDenomination = () => {
    if (!denominationValue || isNaN(denominationValue)) {
      toast.error("Please enter a valid denomination.");
      return;
    }
    const newDenom = {
      id: Date.now(),
      value: parseFloat(denominationValue),
      currency: denominationCurrency,
    };
    updateFormData("denominations", [...(formData.denominations || []), newDenom]);
    setDenominationValue("");
  };

  const removeDenomination = (id) => {
    updateFormData(
      "denominations",
      (formData.denominations || []).filter((d) => d.id !== id)
    );
  };

  const getPreviewData = () => {
    const brandName = formData.brandName || "Brand Name";
    const brandInitial = brandName.charAt(0).toUpperCase();
    const primaryColor = formData.color || "#2563EB"; // default blue

    let amountDisplay = "ZAR 100.00";
    if (formData.denominationType === "fixed" && formData.denominations?.length > 0) {
      const first = formData.denominations[0];
      amountDisplay = `${first.currency} ${first.value?.toFixed(2)}`;
    } else if (formData.denominationType === "amount") {
      amountDisplay = `${formData.minAmount?.toFixed(2)} - ${formData.maxAmount?.toFixed(2)}`;
    }

    let expiryText = "Never expires";
    if (formData.isExpiry && formData.expiresAt) {
      expiryText = `Expires: ${new Date(formData.expiresAt).toLocaleDateString()}`;
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
                <div className="font-medium capitalize">{type === "fixed" ? "Static Denominations" : "Amount Range"}</div>
                <p className="text-sm text-gray-500">
                  {type === "fixed"
                    ? "Customers choose from predefined amounts."
                    : "Customers can pick any amount within a range."}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Fixed Denominations */}
        {formData.denominationType === "fixed" && (
          <div>
            <div className="flex gap-2 mb-4">
              <select
                value={denominationCurrency}
                onChange={(e) => setDenominationCurrency(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="flex-1 border rounded-md px-3 py-2"
                value={denominationValue}
                onChange={(e) => setDenominationValue(e.target.value)}
              />
              <button
                onClick={addDenomination}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.denominations?.map((denom) => (
                <span
                  key={denom.id}
                  className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full flex items-center gap-2"
                >
                  {denom.currency} {denom.value}
                  <button
                    onClick={() => removeDenomination(denom.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amount Range */}
        {formData.denominationType === "amount" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Minimum</label>
              <input
                type="number"
                value={formData.minAmount || ""}
                onChange={(e) => updateFormData("minAmount", parseFloat(e.target.value) || 0)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum</label>
              <input
                type="number"
                value={formData.maxAmount || ""}
                onChange={(e) => updateFormData("maxAmount", parseFloat(e.target.value) || 0)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
        )}
      </section>

      {/* Expiry */}
      <section className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">⏳ Expiry & Grace Period</h3>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            className="rounded border-gray-300 mr-3 mt-1 focus:ring-2 focus:ring-blue-500"
            checked={formData.isExpiry || false}
            onChange={(e) => updateFormData('isExpiry', e.target.checked)}
          />
          <span className="text-sm">Set expiry date</span>
        </label>

        {formData.isExpiry && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              value={formData.expiresAt || ""}
              onChange={(e) => updateFormData("expiresAt", e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        )}
      </section>

      {/* Preview */}
      <section className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">👁️ Voucher Preview</h3>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border border-gray-200">
          <div
            className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center shadow-md mb-3"
            style={{ backgroundColor: preview.primaryColor }}
          >
            {formData.logo ? (
              <img src={formData.logo} alt="Brand" className="w-12 h-12 object-contain rounded" />
            ) : (
              <span className="text-white font-bold text-xl">{preview.brandInitial}</span>
            )}
          </div>

          <h4 className="font-bold text-xl mb-2">{preview.brandName}</h4>
          <p className="text-lg font-semibold" style={{ color: preview.primaryColor }}>
            {preview.amountDisplay} Voucher
          </p>
          <p className="text-sm text-gray-600 mt-2">{preview.expiryText}</p>
        </div>
      </section>
    </div>
  );
};

export default VouchersTab;