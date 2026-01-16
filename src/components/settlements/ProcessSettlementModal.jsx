"use client"
import { DollarSign } from "lucide-react";
import { X } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { currencyList } from "@/components/brandsPartner/currency";
import { processSettlement } from "@/lib/action/analytics";

const ProcessSettlementModal = ({ isOpen, onClose, settlement, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPartialPayment, setIsPartialPayment] = useState(false);

  useEffect(() => {
    if (settlement) {
      setPaymentAmount(settlement.remainingAmount.toString());
      setIsPartialPayment(false);
      setProcessMessage(null);
      setPaymentNotes('');
    }
  }, [settlement]);

  console.log('Settlement:', settlement);

  if (!isOpen) return null;

  const handleProcessSettlement = async () => {
    if (!settlement?.id) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setProcessMessage({ type: 'error', text: 'Please enter a valid payment amount' });
      return;
    }

    if (amount > settlement.remainingAmount) {
      setProcessMessage({ type: 'error', text: 'Payment amount cannot exceed outstanding amount' });
      return;
    }

    try {
      setProcessing(true);
      setProcessMessage(null);

      const result = await processSettlement(
        settlement.id,
        amount,
        paymentNotes.trim() || undefined
      );

      if (result.success) {
        setProcessMessage({
          type: "success",
          text: `Payment processed successfully! ${result.data.paymentReference
            ? `Payment Reference: ${result.data.paymentReference}`
            : ""
            }`,
        });
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to process payment");
      }
    } catch (err) {
      console.error("Process settlement error:", err);
      setProcessMessage({ type: 'error', text: err.message || 'Failed to process settlement' });
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentTypeChange = (isPartial) => {
    setIsPartialPayment(isPartial);
    if (!isPartial && settlement) {
      setPaymentAmount(settlement.remainingAmount.toString());
    } else {
      setPaymentAmount('');
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbol = currencyList.find(c => c.code === currency)?.symbol || '$';
    return `${symbol}${amount?.toLocaleString()}`;
  };

  const calculateRemaining = () => {
    if (!settlement || !paymentAmount) return 0;
    const amount = parseFloat(paymentAmount);
    return isNaN(amount) ? settlement.remainingAmount : settlement.remainingAmount - amount;
  };

 return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Modal Header - Fixed */}
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-900">Process Settlement</h3>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="px-6 py-6 overflow-y-auto flex-1 min-h-0">
          {processMessage ? (
            <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${processMessage.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
              }`}>
              {processMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${processMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                {processMessage.text}
              </p>
            </div>
          ) : (
            <>
              {/* Brand Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {settlement.logo && (
                    <img
                      src={settlement.logo}
                      alt={settlement.brandName}
                      className="w-10 h-10 object-contain"
                    />
                  )}
                  <span className="font-semibold text-gray-900 text-lg">
                    {settlement.brandName}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  {/* Settlement Period */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Settlement Period</span>
                    <span className="font-medium text-gray-900">
                      {settlement.settlementPeriod}
                    </span>
                  </div>

                  {/* Total Issued */}
                  <div className="flex items-start justify-between">
                    <span className="text-gray-500">Total Issued</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(settlement.totalSoldAmount, settlement.currency)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {settlement.totalSold} vouchers
                      </p>
                    </div>
                  </div>

                  {/* Total Redeemed (conditional) */}
                  {settlement.settlementTrigger === "onRedemption" && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Total Redeemed</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(settlement.redeemedAmount, settlement.currency)}
                      </span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        Total Outstanding
                      </span>
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(settlement.remainingAmount, settlement.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePaymentTypeChange(false)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${!isPartialPayment
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <DollarSign className={`w-6 h-6 mx-auto mb-2 ${!isPartialPayment ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    <div className="font-medium text-gray-900">Full Payment</div>
                    <div className="text-xs text-gray-500 mt-1">Pay entire amount</div>
                  </button>
                  <button
                    onClick={() => handlePaymentTypeChange(true)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${isPartialPayment
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <DollarSign className={`w-6 h-6 mx-auto mb-2 ${isPartialPayment ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    <div className="font-medium text-gray-900">Partial Payment</div>
                    <div className="text-xs text-gray-500 mt-1">Pay custom amount</div>
                  </button>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {currencyList.find(c => c.code === settlement.currency)?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={!isPartialPayment || processing}
                    min="0"
                    max={settlement.remainingAmount}
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isPartialPayment ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="Enter amount"
                  />
                </div>
                {isPartialPayment && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {formatCurrency(settlement.remainingAmount, settlement.currency)}
                  </p>
                )}
              </div>

              {/* Remaining Amount */}
              {isPartialPayment && paymentAmount && parseFloat(paymentAmount) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">
                      Remaining Balance:
                    </span>
                    <span className="font-bold text-blue-900">
                      {formatCurrency(calculateRemaining(), settlement.currency)}
                    </span>
                  </div>
                  {calculateRemaining() > 0 && (
                    <p className="text-xs text-blue-700 mt-1">
                      A new settlement will be created for the remaining amount
                    </p>
                  )}
                </div>
              )}

              {/* Payment Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  disabled={processing}
                  rows="3"
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add payment notes or reference..."
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ This action will process the payment and cannot be undone.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer - Fixed */}
        {!processMessage && (
          <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessSettlement}
              disabled={processing || !paymentAmount || parseFloat(paymentAmount) <= 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Payment'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessSettlementModal;