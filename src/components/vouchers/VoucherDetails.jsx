import React from 'react';

const DetailItem = ({ label, value, isBadge, badgeColor }) => (
  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200">
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    {isBadge ? (
      <dd className={`text-sm font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${badgeColor}`}>
        {value}
      </dd>
    ) : (
      <dd className="text-sm text-gray-900">{value}</dd>
    )}
  </div>
);

export default function VoucherDetails({ voucher }) {
  if (!voucher) return null;

  const { 
    code, user, voucherType, totalAmount, remainingAmount, partialRedemption, 
    redemptionHistory, totalRedeemed, pendingAmount, redemptionCount, 
    lastRedemptionDate, expiryDate, status, orderNumber 
  } = voucher;

  const statusConfig = {
    Redeemed: { text: 'Redeemed', color: 'text-green-700 bg-green-100' },
    Active: { text: 'Active', color: 'text-blue-700 bg-blue-100' },
    Expired: { text: 'Expired', color: 'text-red-700 bg-red-100' },
    Inactive: { text: 'Inactive', color: 'text-yellow-700 bg-yellow-100' },
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 leading-6">Voucher Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Complete information for voucher <span className="font-mono bg-gray-100 p-1 rounded">{code}</span></p>
        </div>

        <dl className="divide-y divide-gray-200">
          <DetailItem label="Voucher Code" value={code} />
          <DetailItem label="Order Number" value={orderNumber} />
          <DetailItem label="Status" value={statusConfig[status]?.text} isBadge badgeColor={statusConfig[status]?.color} />
          <DetailItem label="Expiry Date" value={expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'} />
        </dl>

        <div>
          <h3 className="text-md font-semibold text-gray-800">User Information</h3>
          <dl className="mt-2 divide-y divide-gray-200">
            <DetailItem label="Name" value={`${user.firstName} ${user.lastName}`} />
            <DetailItem label="Email" value={user.email} />
          </dl>
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-800">Value & Redemption</h3>
          <dl className="mt-2 divide-y divide-gray-200">
            <DetailItem label="Voucher Type" value={voucherType} />
            <DetailItem label="Total Amount" value={`$${totalAmount.toFixed(2)}`} />
            <DetailItem label="Remaining Amount" value={`$${remainingAmount.toFixed(2)}`} />
            <DetailItem label="Total Redeemed" value={`$${totalRedeemed.toFixed(2)}`} />
            <DetailItem label="Pending Amount" value={`$${pendingAmount.toFixed(2)}`} />
            <DetailItem label="Partial Redemption" value={partialRedemption ? 'Supported' : 'Not Supported'} />
            <DetailItem label="Redemption Count" value={redemptionCount} />
            <DetailItem label="Last Redemption" value={lastRedemptionDate ? new Date(lastRedemptionDate).toLocaleString() : 'N/A'} />
          </dl>
        </div>

        {redemptionHistory && redemptionHistory.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-800">Redemption History</h3>
            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Redeemed</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {redemptionHistory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(item.redeemedAt).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-600">-${item.amountRedeemed.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">${item.balanceAfter.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
