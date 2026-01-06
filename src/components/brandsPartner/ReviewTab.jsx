import React from 'react';
import { Check, X } from 'lucide-react';

const DetailItem = ({ label, value, isHtml = false }) => (
  <div className="w-full">
    <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">
      {label}
    </h4>

    {isHtml ? (
      <div
        className="
          font-inter text-sm font-semibold capitalize text-[#4A4A4A]
          leading-relaxed
          break-words
          whitespace-normal
          w-full
        "
        dangerouslySetInnerHTML={{ __html: value || 'Not set' }}
      />
    ) : (
      <p
        className="
          font-inter text-sm font-semibold capitalize text-[#4A4A4A]
          leading-relaxed
          break-words
          whitespace-normal
          w-full
        "
      >
        {value || 'Not set'}
      </p>
    )}
  </div>
);

const ReviewTab = ({ formData, validationErrors }) => {
  const renderDenominations = () => {
    const parts = [];

    if (formData.minAmount || formData.maxAmount) {
      parts.push(
        `Range: R${formData.minAmount || 0} - R${formData.maxAmount || 0}`
      );
    }

    if (formData.denominations?.length > 0) {
      parts.push(
        `Fixed: ${formData.denominations
          .map(d => `R${d.value}`)
          .join(', ')}`
      );
    }

    return parts.length > 0 ? parts.join('<br />') : 'Not set';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Brand Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold text-[#4A4A4A]">
          Brand Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <DetailItem label="Brand Name" value={formData.brandName} />
          <DetailItem label="Category" value={formData.categoryName} />
          <DetailItem label="Website" value={formData.website} />

          <div>
            <h4 className="font-inter text-[14px] font-medium text-[#64748B]">
              Primary Color
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-sm text-gray-600">
                {formData.color || 'Not set'}
              </span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <DetailItem label="Description" value={formData.description} />
          </div>

          <div>
            <h4 className="font-inter text-[14px] font-medium text-[#64748B]">
              Logo
            </h4>
            {formData.logo ? (
              <img
                src={
                  typeof formData.logo === 'string'
                    ? formData.logo
                    : URL.createObjectURL(formData.logo)
                }
                alt="logo"
                className="mt-2 max-h-16 sm:max-h-20 w-auto object-contain rounded"
              />
            ) : (
              <p className="text-sm text-gray-600">Not set</p>
            )}
          </div>

          <div>
            <h4 className="font-inter text-[14px] font-medium text-[#64748B]">
              Status
            </h4>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
              <div className="flex items-center gap-2">
                {formData.isActive ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium text-[#4A4A4A]">
                  Active on Frontend
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.isFeature ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium text-[#4A4A4A]">
                  Featured Brand
                </span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <DetailItem label="Internal Notes" value={formData.notes} />
          </div>
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold text-[#4A4A4A]">
          Commercial Terms
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <DetailItem
            label="Settlement"
            value={formData.settlementTrigger?.replace('_', ' ')}
          />
          <DetailItem
            label="Commission"
            value={
              formData.commissionType === 'percentage'
                ? `${formData.commissionValue}%`
                : `R${formData.commissionValue}`
            }
          />
          <DetailItem
            label="Contract Start"
            value={formData.contractStartDate}
          />
          <DetailItem label="VAT Rate" value={`${formData.vatRate}%`} />
        </div>
      </div>

      {/* Settlement & Banking */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold text-[#4A4A4A]">
          Settlement & Banking
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <DetailItem
            label="Frequency"
            value={formData.settlementFrequency}
          />
          {formData.settlementFrequency === 'monthly' && (
            <DetailItem label="Day of Month" value={formData.dayOfMonth} />
          )}
          {formData.settlementFrequency === 'weekly' && (
            <DetailItem label="Day of Week" value={formData.dayOfWeek} />
          )}
          <DetailItem label="Bank" value={formData.bankName} />
          <DetailItem label="Account Holder" value={formData.accountHolder} />
          <DetailItem label="Account Number" value={formData.accountNumber} />
          <DetailItem label="Branch Code" value={formData.branchCode} />
        </div>
      </div>

      {/* Vouchers */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold text-[#4A4A4A]">
          Vouchers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <DetailItem
            label="Denominations"
            value={renderDenominations()}
            isHtml
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold text-[#4A4A4A]">
          Contacts ({formData.contacts?.length || 0})
        </h3>

        {formData.contacts?.map((contact, index) => (
          <div
            key={contact.id || index}
            className="border-b border-gray-200 last:border-b-0 pb-4 mb-4 last:mb-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-[#4A4A4A]">
                  {contact.name || `Contact ${index + 1}`}
                </h4>
                <p className="text-sm text-[#64748B]">{contact.email}</p>
                <p className="text-sm text-[#64748B]">{contact.phone}</p>
                {contact.role && (
                  <p className="text-sm text-[#A6A6A6]">{contact.role}</p>
                )}
                {contact.notes && (
                  <p className="text-xs text-[#A5A5A5] mt-1">
                    {contact.notes}
                  </p>
                )}
              </div>

              {contact.isPrimary && (
                <span className="self-start sm:self-auto text-[10px] font-bold text-[#E27800] bg-orange-100 px-2 py-1 rounded">
                  Primary
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewTab;
