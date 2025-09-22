"use client"
import React from 'react';

const OrderDetails = ({ order }) => {
  if (!order) return null;

  const senderDetails = JSON.parse(order.senderDetails);

  return (
    <div className="p-6 bg-gray-50 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Order Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Basic Order Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Basic Information</h3>
          <div className="space-y-3">
            <p><strong>Order ID:</strong> {order.orderNumber}</p>
            <p><strong>Status:</strong> <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.redemptionStatus)}`}>{order.redemptionStatus}</span></p>
            <p><strong>Order Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
            <p><strong>Amount:</strong> <span className="font-bold text-green-600">${order.amount} {order.currency}</span></p>
          </div>
        </div>

        {/* Brand & Occasion */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Brand & Occasion</h3>
          <div className="space-y-3">
            <p><strong>Brand:</strong> {order.brands.brandName}</p>
            <p><strong>Occasion:</strong> {order.occasions.name}</p>
            {order.subCategory && <p><strong>Category:</strong> {order.subCategory.name}</p>}
            {order.subSubCategory && <p><strong>Sub-Category:</strong> {order.subSubCategory.name}</p>}
          </div>
        </div>

        {/* Receiver Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Receiver Details</h3>
          <div className="space-y-3">
            <p><strong>Name:</strong> {order.receiverDetail.name}</p>
            <p><strong>Email:</strong> {order.receiverDetail.email}</p>
            <p><strong>Phone:</strong> {order.receiverDetail.phone}</p>
          </div>
        </div>

        {/* Sender Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Sender Details</h3>
          <div className="space-y-3">
            <p><strong>Name:</strong> {senderDetails.yourFullName}</p>
            <p><strong>Email:</strong> {senderDetails.yourEmailAddress}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Payment & Delivery</h3>
          <div className="space-y-3">
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p><strong>Total Amount:</strong> <span className="font-bold text-green-.600">${order.totalAmount}</span></p>
            <p><strong>Delivery Method:</strong> {order.deliveryMethod}</p>
            <p><strong>Send Type:</strong> {order.sendType === 'sendImmediately' ? 'Sent Immediately' : 'Scheduled'}</p>
          </div>
        </div>

        {/* Voucher Codes */}
        {order.voucherCodes && order.voucherCodes.length > 0 && (
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Voucher Codes</h3>
            <div className="space-y-4">
              {order.voucherCodes.map((voucher) => (
                <div key={voucher.id} className="p-4 border rounded-lg bg-gray-50">
                  <p><strong>Code:</strong> <span className="font-mono bg-gray-200 p-1 rounded">{voucher.code}</span></p>
                  <p><strong>Original Value:</strong> ${voucher.originalValue}</p>
                  <p><strong>Remaining Value:</strong> ${voucher.remainingValue}</p>
                  <p><strong>Status:</strong> {voucher.isRedeemed ? 'Redeemed' : 'Not Redeemed'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Message */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Personal Message</h3>
          <p className="text-gray-600 italic">{order.message}</p>
        </div>

      </div>
    </div>
  );
};

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'redeemed':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'exparied':
        return 'bg-red-100 text-red-800';
      case 'notredeemed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

export default OrderDetails;