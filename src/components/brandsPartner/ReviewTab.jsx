import React from 'react';
import { Check, X } from 'lucide-react';

const DetailItem = ({ label, value, isHtml = false }) => (
  <div>
    <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">{label}</h4>
    {isHtml ? (
      <div
        className="font-inter text-sm font-semibold capitalize text-[#4A4A4A] leading-normal"
        dangerouslySetInnerHTML={{ __html: value || 'Not set' }}
      />
    ) : (
      <p className="font-inter text-sm font-semibold capitalize text-[#4A4A4A] leading-normal">
        {value || 'Not set'}
      </p>
    )}

  </div>
);

const ReviewTab = ({ formData, validationErrors }) => {
  const renderDenominations = () => {
    const parts = [];
    if (formData.minAmount || formData.maxAmount) {
      parts.push(`Range: R${formData.minAmount || 0} - R${formData.maxAmount || 0}`);
    }
    if (formData.denominations && formData.denominations.length > 0) {
      parts.push(`Fixed: ${formData.denominations.map(d => `R${d.value}`).join(', ')}`);
    }

    if (parts.length > 0) {
      return parts.join('<br />'); // join with <br> instead of ;
    }

    return 'Not set';
  };

  const getValidityPeriod = (validity) => {
    if (!validity) return 'Not set';
    const parts = validity.split('_');
    return `${parts[0]} ${parts[1]}`;
  };

  return (
    <div className="space-y-8">
      {/* Brand Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Brand Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Brand Name" value={formData.brandName} />
          <DetailItem label="Category" value={formData.categoryName} />
          <DetailItem label="Website" value={formData.website} />
          <div>
            <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Primary Color</h4>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: formData.color }}
              ></div>
              <span className="text-gray-600">{formData.color}</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <DetailItem label="Description" value={formData.description} />
          </div>
          <div>
            <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Logo</h4>
            {formData.logo && (
              <img
                src={typeof formData.logo === 'string' ? formData.logo : URL.createObjectURL(formData.logo)}
                alt="logo"
                className="mt-2 max-h-20 rounded"
              />
            )}
            {!formData.logo && <p className="text-gray-600">Not set</p>}
          </div>
          <div>
            <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Status</h4>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-2">
                {formData.isActive ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className="font-inter text-sm font-medium leading-[18px] text-[#4A4A4A]">
                  Active on Frontend
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {formData.isFeature ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className="font-inter text-sm font-medium leading-[18px] text-[#4A4A4A]">
                  Featured Brand
                </span>
              </div>
            </div>

          </div>
          <div className="md:col-span-2">
            <DetailItem label="Internal Notes" value={formData.notes} />
          </div>
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Commercial Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Settlement" value={formData.settlementTrigger?.replace('_', ' ')} />
          <DetailItem
            label="Commission"
            value={formData.commissionType === 'percentage' ? `${formData.commissionValue}%` : `R${formData.commissionValue}`}
          />
          <DetailItem label="Contract Start" value={formData.contractStartDate} />
          <DetailItem label="VAT Rate" value={`${formData.vatRate}%`} />
        </div>
      </div>

      {/* Settlement & Banking */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Settlement & Banking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Frequency" value={formData.settlementFrequency} />
          {formData.settlementFrequency === 'monthly' && <DetailItem label="Day of Month" value={formData.dayOfMonth} />}
          {formData.settlementFrequency === 'weekly' && <DetailItem label="Day of Week" value={formData.dayOfWeek} />}
          <DetailItem label="Bank" value={formData.bankName} />
          <DetailItem label="Account Holder" value={formData.accountHolder} />
          <DetailItem label="Account Number" value={formData.accountNumber} />
          <DetailItem label="Branch Code" value={formData.branchCode} />
        </div>
      </div>

      {/* Vouchers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Vouchers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-inter text-sm font-semibold capitalize text-[#4A4A4A]">
          <DetailItem
            label="Denominations"
            value={renderDenominations()}
            isHtml={true}
          />
          {/* <div>
            <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Redemption Channels</h4>
            <div className="flex space-x-4 mt-1">
              {formData.redemptionChannels?.online && <span className="text-gray-600">Online</span>}
              {formData.redemptionChannels?.inStore && <span className="text-gray-600">In-Store</span>}
              {formData.redemptionChannels?.phone && <span className="text-gray-600">Phone</span>}
            </div>
          </div> */}
          {/* <DetailItem label="Validity Period" value={getValidityPeriod(formData.voucherValidity)} /> */}
          {/* <div className="md:col-span-2">
            <DetailItem label="Voucher Instructions" value={formData.voucherInstructions} isHtml={true} />
          </div> */}
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Contacts ({formData.contacts?.length || 0})</h3>
        {formData.contacts?.map((contact, index) => (
          <div key={contact.id || index} className="border-b border-gray-200 last:border-b-0 pb-4 mb-4 last:mb-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-inter text-sm font-semibold capitalize text-[#4A4A4A]">
                  {contact.name || `Contact ${index + 1}`}
                </h4>
                <p className="font-inter text-sm font-medium leading-[18px] text-[#64748B]">
                  {contact.email}
                </p>
                <p className="font-inter text-sm font-medium leading-[18px] text-[#64748B]">
                  {contact.phone}
                </p>
                {contact.role && (
                  <p className="font-inter text-sm font-medium leading-[18px] text-[#A6A6A6]">
                    {contact.role}
                  </p>
                )}
                {contact.notes && (
                  <p className="font-inter text-xs font-medium leading-[20px] text-[#A5A5A5] mt-1">
                    {contact.notes}
                  </p>
                )}
              </div>

              {contact.isPrimary && (
                <span className="font-inter text-[10px] font-bold leading-[20px] text-[#E27800] bg-orange-100 px-2 py-1 rounded inline-block">
                  Primary
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Integrations */}
      {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Integrations ({formData.integrations?.length || 0})</h3>
        {formData.integrations?.length > 0 ? (
          formData.integrations.map((integration, index) => (
            <div key={integration.id || index} className="border-b border-gray-200 last:border-b-0 pb-4 mb-4 last:mb-0">
              <p className="text-gray-600">{integration.type}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No integrations set up.</p>
        )}
      </div> */}
    </div>
  );
};

export default ReviewTab;