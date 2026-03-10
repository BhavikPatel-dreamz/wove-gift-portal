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

  const isPrintDelivery = order?.deliveryMethod === 'print';

  const getDeliveryMethodIcon = () => {
    switch (order?.deliveryMethod) {
      case 'email':
        return <Mail className="ss-delivery-icon ss-delivery-icon--email" />;
      case 'whatsapp':
        return <MessageSquare className="ss-delivery-icon ss-delivery-icon--whatsapp" />;
      case 'print':
        return <Printer className="ss-delivery-icon ss-delivery-icon--print" />;
      default:
        return <Mail className="ss-delivery-icon ss-delivery-icon--email" />;
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
      const orderList = Array.isArray(order.allOrders) && order.allOrders.length > 0
        ? order.allOrders
        : [order];

      orderList.forEach((o) => {
        const quantity = o.quantity || 0;
        const amount = o.amount || 0;
        totalVouchers += quantity;
        totalAmount += amount * quantity;
      });
    });

    return { totalVouchers, totalAmount };
  }

  return (
    <>
      <style>{`
        /* ── Page wrapper ── */
        .ss-page {
          min-height: 100vh;
          padding: 7.5rem 1rem 2.5rem;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .ss-page {
            padding: 10rem 1.5rem 3rem;
          }
        }

        /* ── Outer centering shell ── */
        .ss-outer {
          max-width: 1440px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Card ── */
        .ss-card {
          width: 100%;
          max-width: 800px;
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          box-sizing: border-box;
        }

        @media (min-width: 640px) {
          .ss-card {
            padding: 2rem;
          }
        }

        /* ── Success GIF ── */
        .ss-gif {
          width: 6.5rem;
          height: 6.5rem;
          margin: 0 auto 1rem;
          display: block;
        }

        /* ── Headings ── */
        .ss-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          color: #1A1A1A;
          margin: 0 0 1rem;
          font-family: 'Poppins', sans-serif;
          line-height: 1.2;
        }

        .ss-subtitle {
          font-size: 1rem;
          font-weight: 400;
          color: #4A4A4A;
          margin: 0 0 1rem;
          line-height: 1.6;
        }

        /* ── Support text ── */
        .ss-support-text {
          color: #4A4A4A;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          margin: 0 0 1.5rem;
        }

        .ss-support-link {
          color: #2563EB;
          font-weight: 600;
          text-decoration: underline;
        }

        .ss-support-link:hover {
          color: #1D4ED8;
        }

        /* ── Shared panel base ── */
        .ss-panel {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #E5E7EB;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        /* ── Bulk / Order Details panel ── */
        .ss-panel--order {
          padding: 1.25rem;
          width: fit-content;
          max-width: 100%;
          margin-left: auto;
          margin-right: auto;
          text-align: left;
        }

        @media (min-width: 640px) {
          .ss-panel--order {
            padding: 1.5rem 5rem;
          }
        }

        .ss-panel-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1rem;
        }

        .ss-divider {
          height: 1px;
          background: #E5E7EB;
          margin-bottom: 1.5rem;
        }

        .ss-divider--sm {
          height: 1px;
          background: #E5E7EB;
          margin: 1rem 0;
        }

        /* ── Order detail grid ── */
        .ss-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem 0;
        }

        @media (min-width: 480px) {
          .ss-detail-grid {
            grid-template-columns: 180px 1fr;
            gap: 1rem 0;
          }
        }

        .ss-detail-label {
          color: #374151;
          font-size: 0.9rem;
        }

        .ss-detail-value {
          font-weight: 600;
          color: #111827;
          font-size: 0.9rem;
          word-break: break-all;
        }

        @media (min-width: 480px) {
          .ss-detail-value::before {
            content: ': ';
          }
        }

        /* ── Print delivery panel ── */
        .ss-panel--print {
          padding: 1.25rem;
          text-align: left;
        }

        @media (min-width: 640px) {
          .ss-panel--print {
            padding: 1.5rem;
          }
        }

        /* ── Print header row ── */
        .ss-print-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .ss-print-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #2563EB;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .ss-print-header-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.5rem;
        }

        .ss-print-header-desc {
          font-size: 0.875rem;
          color: #4B5563;
          margin: 0;
          line-height: 1.5;
        }

        /* ── Print dl rows ── */
        .ss-dl {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .ss-dl-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .ss-dl-label {
          font-size: 0.875rem;
          color: #6B7280;
          flex-shrink: 0;
        }

        .ss-dl-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          text-align: right;
          word-break: break-all;
        }

        /* ── Voucher codes section ── */
        .ss-voucher-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.75rem;
        }

        .ss-voucher-codes {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ss-voucher-item {
          background: linear-gradient(to right, #F5F3FF, #FDF2F8);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .ss-voucher-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .ss-voucher-label {
          font-size: 0.75rem;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.25rem;
        }

        .ss-voucher-code {
          font-family: monospace;
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          word-break: break-all;
        }

        .ss-voucher-pin {
          font-size: 0.875rem;
          color: #4B5563;
          margin: 0.25rem 0 0;
        }

        .ss-voucher-value-label {
          font-size: 0.75rem;
          color: #6B7280;
          margin: 0 0 0.25rem;
          text-align: right;
        }

        .ss-voucher-value {
          font-weight: 700;
          color: #111827;
          text-align: right;
          margin: 0;
        }

        /* ── Personal message ── */
        .ss-message-box {
          background: #F9FAFB;
          border-radius: 0.5rem;
          padding: 1rem;
          text-align: left;
        }

        .ss-message-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.5rem;
        }

        .ss-message-text {
          font-size: 0.875rem;
          color: #374151;
          font-style: italic;
          margin: 0;
          line-height: 1.5;
        }

        /* ── Delivery info banner ── */
        .ss-panel--delivery {
          background: linear-gradient(to right, #F5F3FF, #FDF2F8);
          border-radius: 1rem;
          padding: 1.25rem;
          border: 1px solid #E5E7EB;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .ss-panel--delivery {
            padding: 1.5rem;
          }
        }

        .ss-delivery-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          text-align: left;
        }

        .ss-delivery-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        .ss-delivery-icon--email  { color: #9333EA; }
        .ss-delivery-icon--whatsapp { color: #16A34A; }
        .ss-delivery-icon--print  { color: #2563EB; }

        .ss-delivery-title {
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem;
        }

        .ss-delivery-desc {
          font-size: 0.875rem;
          color: #4B5563;
          margin: 0;
        }

        /* ── Print download button wrapper ── */
        .ss-print-btn-wrap {
          margin-bottom: 1.5rem;
        }

        /* ── CTA button ── */
        .ss-cta-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .ss-cta-btn {
          min-width: 7rem;
          cursor: pointer;
          border: none;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #ffffff;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          transition: opacity 0.2s ease, transform 0.15s ease;
          background: linear-gradient(114.06deg, #ED457D 11.36%, #FA8F42 90.28%);
        }

        .ss-cta-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .ss-cta-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="ss-page">
        <div className="ss-outer">
          <div className="ss-card">

            {/* ── Bulk Header ── */}
            {isBulkMode ? (
              <div>
                <h1 className="ss-title">Your bulk order is complete!</h1>
                <p className="ss-subtitle">
                  We've emailed you a CSV file with all voucher codes to your email address.
                  You can share these codes directly with your team or clients.
                </p>
              </div>
            ) : (
              <div>
                <img
                  src="/Success.gif"
                  alt="Success"
                  className="ss-gif"
                />
                <h1 className="ss-title">
                  {isPrintDelivery ? 'Order Complete!' : 'Gift Sent Successfully'}
                </h1>
                <p className="ss-subtitle">
                  {isPrintDelivery
                    ? `Your ${selectedBrand?.brandName || order?.brand?.brandName} gift card is ready to print!`
                    : `Your beautiful ${selectedBrand?.brandName || order?.brand?.brandName} gift card is on its way to Friend!`
                  }
                </p>
                <p className="ss-support-text">
                  <strong>Need help? </strong>
                  Have questions or want to cancel or modify your gift?{" "}
                  <Link href="/support" className="ss-support-link">
                    Contact Support
                  </Link>
                </p>
              </div>
            )}

            {/* ── Bulk / Multi-order Details Panel ── */}
            {(isBulkMode || (order?.allOrders && order?.allOrders.length > 1)) && (
              <div className="ss-panel ss-panel--order">
                <h2 className="ss-panel-title">Order Details</h2>
                <div className="ss-divider" />
                <div className="ss-detail-grid">
                  <span className="ss-detail-label">Order ID</span>
                  <span className="ss-detail-value">{order.bulkOrderNumber || order.orderNumber}</span>

                  <span className="ss-detail-label">Brand</span>
                  <span className="ss-detail-value">{selectedBrand?.brandName || order?.brand?.brandName}</span>

                  <span className="ss-detail-label">Vouchers Generated</span>
                  <span className="ss-detail-value">{calculateTotals([order]).totalVouchers}</span>

                  <span className="ss-detail-label">Total Value</span>
                  <span className="ss-detail-value">{calculateTotals([order]).totalAmount}</span>
                </div>
              </div>
            )}

            {/* ── Print Delivery Panel ── */}
            {!isBulkMode && isPrintDelivery && order?.voucherCodes && order.voucherCodes.length > 0 && (
              <div className="ss-panel ss-panel--print">
                {/* Header */}
                <div className="ss-print-header">
                  <Printer className="ss-print-icon" />
                  <div>
                    <h2 className="ss-print-header-title">Print-at-Home Gift Card</h2>
                    <p className="ss-print-header-desc">
                      Your gift card is ready! Download the PDF below and print it on any printer.
                      Perfect for hand delivery or surprise presentations.
                    </p>
                  </div>
                </div>

                {/* Order summary */}
                <div className="ss-divider--sm" />
                <dl className="ss-dl">
                  {[
                    { label: "Order ID",           value: order?.bulkOrderNumber || order?.orderNumber },
                    { label: "Brand",              value: selectedBrand?.brandName || order?.brand?.brandName },
                    { label: "Vouchers Generated", value: calculateTotals([order]).totalVouchers },
                    { label: "Total Value",        value: `R${calculateTotals([order]).totalAmount}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="ss-dl-row">
                      <dt className="ss-dl-label">{label}</dt>
                      <dd className="ss-dl-value">{value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Voucher codes */}
                <div className="ss-divider--sm" />
                <div className="ss-voucher-codes">
                  <p className="ss-voucher-section-title">
                    Your Voucher Code{order.voucherCodes.length > 1 ? 's' : ''}:
                  </p>
                  {order.voucherCodes.map((voucherCode, index) => {
                    const actualCode = voucherCode.giftCard?.code || voucherCode.code;
                    return (
                      <div key={voucherCode.id} className="ss-voucher-item">
                        <div className="ss-voucher-row">
                          <div>
                            <p className="ss-voucher-label">
                              Voucher Code {order.voucherCodes.length > 1 ? `#${index + 1}` : ''}
                            </p>
                            <p className="ss-voucher-code">{actualCode}</p>
                            {voucherCode.pin && (
                              <p className="ss-voucher-pin">
                                PIN: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{voucherCode.pin}</span>
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="ss-voucher-value-label">Value</p>
                            <p className="ss-voucher-value">R{voucherCode.originalValue}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Personal message */}
                {order.message && (
                  <>
                    <div className="ss-divider--sm" />
                    <div className="ss-message-box">
                      <p className="ss-message-label">Personal Message</p>
                      <p className="ss-message-text">"{order.message}"</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Non-Print Delivery Banner ── */}
            {!isBulkMode && !isPrintDelivery && !order?.allOrders && (
              <div className="ss-panel--delivery">
                <div className="ss-delivery-row">
                  {getDeliveryMethodIcon()}
                  <div>
                    <p className="ss-delivery-title">Delivery Method</p>
                    <p className="ss-delivery-desc">
                      Your gift card will be sent to{" "}
                      <strong>{getDeliveryMethodText()}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Print Download Button ── */}
            {!isBulkMode && isPrintDelivery && (
              <div className="ss-print-btn-wrap">
                <PrintVoucherButton
                  order={order}
                  selectedBrand={selectedBrand}
                  selectedAmount={selectedAmount}
                />
              </div>
            )}

            {/* ── CTA ── */}
            <div className="ss-cta-wrap">
              <button onClick={onNext} className="ss-cta-btn">
                Next
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessScreen;