import React from "react";
import { Mail, MessageSquare, Printer } from 'lucide-react';
import PrintVoucherButton from "../../checkout/PrintVoucherButton";
import Link from "next/link";

const SuccessScreen = ({
  order,
  selectedBrand,
  quantity,
  selectedAmount,
  isBulkMode,
  onNext,
  deliveryDetails
}) => {


  // Check if this is a print delivery order
  const isPrintDelivery = order?.deliveryMethod === 'print';

  const getDeliveryMethodIcon = () => {
    switch (order?.deliveryMethod) {
      case 'email':
        return <Mail className="w-6 h-6 text-purple-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-6 h-6 text-green-600" />;
      case 'print':
        return <Printer className="w-6 h-6 text-blue-600" />;
      default:
        return <Mail className="w-6 h-6 text-purple-600" />;
    }
  };

  const getDeliveryMethodText = () => {
    switch (order?.deliveryMethod) {
      case 'email':
        return deliveryDetails?.email || order.receiverDetail?.email || 'the recipient';
      case 'whatsapp':
        return deliveryDetails?.phone || order.receiverDetail?.phone || 'the recipient';
      case 'print':
        return 'Download your printable gift card below';
      default:
        return 'the recipient';
    }
  };

  function calculateTotals(orders) {
    let totalVouchers = 0;
    let totalAmount = 0;

    orders.forEach((order) => {
      const orderList = Array.isArray(order.allOrders)
        ? order.allOrders
        : [order]; // direct purchase fallback

      orderList.forEach((o) => {
        totalVouchers += o.quantity || 0;
        totalAmount += o.amount || 0;
      });
    });

    return {
      totalVouchers,
      totalAmount,
    };
  }

  return (
    <div className="min-h-screen px-4 py-30 md:px-6 md:py-40">
      <div className="max-w-[1440px] flex items-center justify-center m-auto mb-6">
        <div className="max-w-[800px] m-auto rounded-2xl p-8 text-center">
          {isBulkMode ? (
            <div>
              <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">
                Your bulk order is complete!
              </h1>
              <p className="font-normal text-[16px] text-[#4A4A4A] mb-6">
                We've emailed you a CSV file with all voucher codes to your email address.You can share these codes directly with your team or clients.
              </p>
            </div>
          ) : (
            <div className="mt-25">
              <img
                src={isPrintDelivery ? "/Success.gif" : "/Success.gif"}
                alt={"Success"}
                className="w-26 h-26 m-auto mb-4"
              />
              <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">
                {isPrintDelivery ? 'Order Complete!' : 'Gift Sent Successfully'}
              </h1>
              <p className="font-normal text-[16px] text-[#4A4A4A] mb-4">
                {isPrintDelivery
                  ? `Your ${selectedBrand?.brandName || order?.brand?.brandName} gift card is ready to print!`
                  : `Your beautiful ${selectedBrand?.brandName || order?.brand?.brandName} gift card is on its way to Friend!`
                }
              </p>

              <p
                className="
    text-[#4A4A4A]
    text-center
    font-inter
    text-[16px]
    font-normal
    leading-[24px]
    mb-6
  "
              >
                <strong className="font-bold">Need help?</strong> Have questions or want to cancel or modify your gift? <Link href="/support">Contact Support</Link>
              </p>

            </div>
          )}

          {/* Bulk Mode Order Details */}
          {isBulkMode && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Order details</h2>
              <div className="h-px bg-gray-200 mb-6"></div>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Order ID:</span>
                  <span className="font-semibold text-gray-900">{order.bulkOrderNumber || order.orderNumber}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Brand:</span>
                  <span className="font-semibold text-gray-900">{selectedBrand?.brandName || order?.brand?.brandName}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Vouchers Generated:</span>
                  <span className="font-semibold text-gray-900">{calculateTotals([order]).totalVouchers}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Total Value:</span>
                  <span className="font-semibold text-gray-900">{calculateTotals([order]).totalAmount * calculateTotals([order]).totalVouchers}</span>
                </div>
              </div>
            </div>
          )}

          {/* Print Delivery - Voucher Codes Display */}
          {!isBulkMode && isPrintDelivery && order?.voucherCodes && order.voucherCodes.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <Printer className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-left flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    Print-at-Home Gift Card
                  </h2>
                  <p className="text-sm text-gray-600">
                    Your gift card is ready! Download the PDF below and print it on any printer.
                    Perfect for hand delivery or surprise presentations.
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-4"></div>

              {/* Order Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Order ID:</span>
                  <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Brand:</span>
                  <span className="font-semibold text-gray-900">{selectedBrand?.brandName || order?.brand?.brandName}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Vouchers Generated:</span>
                  <span className="font-semibold text-gray-900">{calculateTotals([order]).totalVouchers}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Total Value:</span>
                  <span className="font-semibold text-gray-900">{calculateTotals([order]).totalAmount * calculateTotals([order]).totalVouchers}</span>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-4"></div>

              {/* Voucher Codes */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 text-left">
                  Your Voucher Code{order.voucherCodes.length > 1 ? 's' : ''}:
                </p>
                {order.voucherCodes.map((voucherCode, index) => {
                  // Get the actual code from giftCard or fallback to voucherCode.code
                  const actualCode = voucherCode.giftCard?.code || voucherCode.code;

                  return (
                    <div key={voucherCode.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <p className="text-xs text-gray-500 uppercase mb-1">
                            Voucher Code {order.voucherCodes.length > 1 ? `#${index + 1}` : ''}
                          </p>
                          <p className="font-mono text-lg font-bold text-gray-900">
                            {actualCode}
                          </p>
                          {voucherCode.pin && (
                            <p className="text-sm text-gray-600 mt-1">
                              PIN: <span className="font-mono font-semibold">{voucherCode.pin}</span>
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Value</p>
                          <p className="font-bold text-gray-900">
                            R{voucherCode.originalValue}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message preview if exists */}
              {order.message && (
                <>
                  <div className="h-px bg-gray-200 my-4"></div>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Personal Message
                    </p>
                    <p className="text-sm text-gray-700 italic">
                      "{order.message}"
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Non-Print Delivery Info */}
          {!isBulkMode && !isPrintDelivery && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-gray-200 mb-6">
              <div className="flex items-start gap-3">
                {getDeliveryMethodIcon()}
                <div className="text-left">
                  <p className="font-semibold text-gray-900 mb-1">
                    Delivery Method
                  </p>
                  <p className="text-sm text-gray-600">
                    Your gift card will be sent to <span className="font-medium">{getDeliveryMethodText()}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Print Download Button */}
          {!isBulkMode && isPrintDelivery && (
            <div className="mb-6">
              <PrintVoucherButton
                order={order}
                selectedBrand={selectedBrand}
                selectedAmount={selectedAmount}
              />
            </div>
          )}

          {/* Continue Button */}
          <div className="w-full flex justify-center">
            <button
              onClick={onNext}
              className="w-fit cursor-pointer rounded-[50px] flex gap-3 items-center justify-center text-white py-3 px-6 font-semibold transition-all duration-200 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;