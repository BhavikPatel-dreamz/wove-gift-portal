import React, { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const PrintVoucherButton = ({ order, selectedBrand, selectedAmount }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrintVoucher = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating your printable gift card...');

    try {
      const response = await fetch('/api/voucher/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gift-card-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Gift card PDF downloaded!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // Only show if delivery method is print
  if (order?.deliveryMethod !== 'print') {
    return null;
  }

  return (
    <button
      onClick={handlePrintVoucher}
      disabled={isGenerating}
      className="w-full cursor-pointer rounded-[50px] flex gap-3 items-center justify-center text-white py-4 px-6 font-semibold transition-all duration-200 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          Generating PDF...
        </>
      ) : (
        <>
          <Printer className="w-5 h-5" />
          Download Printable Gift Card
          <Download className="w-5 h-5" />
        </>
      )}
    </button>
  );
};

export default PrintVoucherButton;