import React from 'react';
import { X, Gift, Calendar, Copy, Download, ChevronDown, ExternalLink, RefreshCw } from 'lucide-react';

const GiftCardDetailModal = ({ card, onClose, onRedeem }) => {
  if (!card) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ', ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };


  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-blue-100 text-blue-600 border-[1px] border-[#0F64F633]',
      'CLAIMED': 'bg-green-100 text-green-600 border-[1px] border-[#22C55E33]',
      'UNCLAIMED': 'bg-gray-100 text-gray-600 border-[1px] border-[#D1D5DB]',
      'EXPIRED': 'bg-red-100 text-red-600 border-[1px] border-[#EF444433]',
      'REDEEMED': 'bg-green-100 text-green-600 border-[1px] border-[#22C55E33]'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy');
    }
  };

  // Calculate redemption values
  const totalRedeemed = card.totalAmount - card.remaining;
  const redemptionCount = card.redemptions?.length || 0;
  const lastRedemption = card.redemptions && card.redemptions.length > 0
    ? card.redemptions[0].redeemedAt
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Voucher Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Complete information for voucher {card.code}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Voucher Code */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Voucher Code</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg text-gray-900">
                        {card.code}
                      </span>
                      {/* <button
                        onClick={() => copyToClipboard(card.code)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button> */}
                    </div>
                  </div>
                  {/* <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                  </button> */}
                </div>
              </div>

              {/* Order Number */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Number</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{card.orderNumber}</span>
                    {/* <button className="text-blue-600 hover:underline text-sm">
                      View Order
                    </button> */}
                  </div>
                </div>
              </div>

              {/* Status & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                      {card.status}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Expiry Date</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{formatDate(card.expires)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-900">{card.receiverName || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-900">{card.receiverEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Value & Redemption */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Value & Redemption</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Voucher Type</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-900 capitalize">{card.denominationType || 'Fixed'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xl font-bold text-gray-900">
                        ${card.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Remaining Amount</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xl font-bold text-red-500">
                        ${card.remaining?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total Redeemed</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xl font-bold text-green-600">
                        ${totalRedeemed.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Pending Amount</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xl font-bold text-yellow-600">
                        ${(card.status === 'ACTIVE' ? card.remaining : 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Redemption Count</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xl font-bold text-gray-900">
                        {redemptionCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last Redemption */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Last Redemption</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {lastRedemption ? formatDateTime(lastRedemption) : 'No redemptions yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Redemption History */}
          <div className='mt-2'>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Redemption History</h3>
              <button className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {card.redemptions && card.redemptions.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Redeemed
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance After
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {card.redemptions.map((redemption, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(redemption.redeemedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                          -${redemption.amountRedeemed?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ${redemption.balanceAfter?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {redemption.storeUrl || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Redemption History</h4>
                <p className="text-sm text-gray-500">
                  This voucher hasn't been redeemed yet
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GiftCardDetailModal;