import React from 'react';
import EditIcon from '../../../icons/EditIcon'
import PrinterColorIcon from '../../../icons/PrinterColorIcon'

const PrintForm = () => {
  return (
    <div className="grid grid-cols-2 pl-8 pr-[50px] py-4">
      <div className="flex flex-col items-start gap-8 py-8">

        <div className="shrink-0">
          <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center relative">
            {/* Gift box icon */}
            <div className="relative">
              <PrinterColorIcon />
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Print-at-Home Gift Card
        </h3>
        <p className="text-gray-600 mb-6">
          We'll generate a beautiful PDF with your gift card design, personal message, and voucher code. Perfect for hand delivery or surprise presentations!
        </p>
        <button className="bg-linear-to-r from-pink-500 to-orange-400 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-shadow flex items-center gap-2">
          Review Your Gift ▸
        </button>
      </div>
      <div className="h-full w-full bg-[#F3F3F3] rounded-[20px]">

      </div>
    </div>
  );
};

export default PrintForm;