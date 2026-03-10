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

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-white rounded-t-2xl">
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
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
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
                    className={`p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${!isPartialPayment
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`block ${!isPartialPayment ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      <rect width="30" height="30" rx="6" fill="currentColor" fillOpacity="0.1" />
                      <g clip-path="url(#clip0_4204_1064)">
                        <path d="M16.9972 13.592C16.9972 14.8544 16.602 15.1584 15.1416 15.1584H13.5752V11.9492H15.14C16.602 11.9492 16.9972 12.3448 16.9972 13.592Z" fill="currentColor" />
                        <path d="M5.5 15.5C5.5 21.0228 9.9772 25.5 15.5 25.5C21.0228 25.5 25.5 21.0228 25.5 15.5C25.5 9.9772 21.0228 5.5 15.5 5.5C9.9772 5.5 5.5 9.9772 5.5 15.5ZM20.0088 21.5H17.636C17.2864 21.5 17.1796 21.3936 17.0276 21.1652L14.5476 17.2564H13.5752V21.2564C13.5752 21.4544 13.5296 21.5 13.3472 21.5H10.9896C10.8072 21.5 10.7616 21.4544 10.7616 21.2564V9.8964C10.7616 9.7444 10.8072 9.6988 10.9896 9.6836C12.48 9.5636 14.0012 9.5012 15.446 9.5012C18.7312 9.5012 19.8564 10.5048 19.8564 13.5012C19.8564 15.7368 19.2636 16.7104 17.6056 17.0752L20.1912 21.1952C20.3128 21.3644 20.2368 21.5 20.0088 21.5Z" fill="currentColor" />
                      </g>
                      <defs>
                        <clipPath id="clip0_4204_1064">
                          <rect width="20" height="20" fill="white" transform="translate(5.5 5.5)" />
                        </clipPath>
                      </defs>
                    </svg>
                    <div className="font-medium text-gray-900">Full Payment</div>
                    <div className="text-xs text-gray-500 mt-1">Pay entire amount</div>
                  </button>
                  <button
                    onClick={() => handlePaymentTypeChange(true)}
                    className={`p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${isPartialPayment
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`block ${isPartialPayment ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      <rect width="30" height="30" rx="6" fill="currentColor" fillOpacity="0.1" />
                      <g clip-path="url(#clip0_4204_1077)">
                        <path d="M19.2276 10.716C19.2276 11.3998 19.0135 11.5645 18.2225 11.5645H17.374V9.82617H18.2216C19.0135 9.82617 19.2276 10.0405 19.2276 10.716Z" fill="currentColor" />
                        <path d="M13 11.7497C13 14.7412 15.4251 17.1663 18.4167 17.1663C21.4082 17.1663 23.8333 14.7412 23.8333 11.7497C23.8333 8.75816 21.4082 6.33301 18.4167 6.33301C15.4251 6.33301 13 8.75816 13 11.7497ZM20.8589 14.9997H19.5737C19.3843 14.9997 19.3264 14.942 19.2441 14.8183L17.9008 12.7011H17.3741V14.8677C17.3741 14.975 17.3494 14.9997 17.2506 14.9997H15.9735C15.8747 14.9997 15.85 14.975 15.85 14.8677V8.71439C15.85 8.63206 15.8747 8.60736 15.9735 8.59912C16.7808 8.53412 17.6048 8.50032 18.3874 8.50032C20.1669 8.50032 20.7764 9.04394 20.7764 10.667C20.7764 11.8779 20.4553 12.4053 19.5572 12.6029L20.9577 14.8346C21.0236 14.9262 20.9824 14.9997 20.8589 14.9997Z" fill="currentColor" />
                      </g>
                      <path d="M19.9434 18.7498L14.7934 20.5404L11.7871 19.5279L12.6434 18.8936C12.8765 18.721 13.066 18.4964 13.1967 18.2376C13.3275 17.9787 13.3959 17.6929 13.3965 17.4029C13.3965 16.3811 12.5652 15.5498 11.5434 15.5498H9.43086C9.34023 15.5498 9.24648 15.5717 9.16211 15.6123L6.53398 16.8654C6.42738 16.9166 6.33739 16.9969 6.27437 17.0969C6.21135 17.197 6.17785 17.3128 6.17773 17.4311V22.9029C6.17767 23.0421 6.22405 23.1773 6.30953 23.2871C6.395 23.3969 6.51469 23.4751 6.64961 23.5092L14.4684 25.4811C14.5184 25.4936 14.5684 25.4998 14.6184 25.4998C14.7309 25.4998 14.8402 25.4717 14.934 25.4154L21.4371 21.6092C21.7865 21.3877 22.0379 21.0409 22.1396 20.6399C22.2413 20.2389 22.1856 19.8142 21.984 19.4529C21.791 19.1041 21.4757 18.8392 21.0988 18.7093C20.7219 18.5794 20.3102 18.5939 19.9434 18.7498Z" fill="currentColor" />
                      <defs>
                        <clipPath id="clip0_4204_1077">
                          <rect width="10.8333" height="10.8333" fill="white" transform="translate(13 6.33301)" />
                        </clipPath>
                      </defs>
                    </svg>
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
          <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200 shrink-0">
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
