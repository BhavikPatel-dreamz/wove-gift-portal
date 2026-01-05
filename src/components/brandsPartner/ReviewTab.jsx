import React from 'react';
import { X } from 'lucide-react';

const ReviewTab = ({ formData, validationErrors }) => {
  return (
    <div className="space-y-8">
      {/* Brand Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Brand Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Brand Name</h4>
            <p className="text-gray-600">{formData.brandName || 'No tagline'}</p>
            <p className="text-gray-500 text-sm mt-1">Other</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Primary Color</h4>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: formData.primaryColor }}
              ></div>
              <span className="text-gray-600">{formData.primaryColor}</span>
            </div>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Website</h4>
            <p className="text-gray-600">{formData.website || 'Not set'}</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Slug</h4>
            <p className="text-gray-600">{formData.brandName ? `brands/${formData.brandName.toLowerCase().replace(/\s+/g, '-')}-auto-generated` : 'brands/auto-generated'}</p>
          </div>
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Commercial Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Settlement</h4>
            <p className="text-gray-600">on purchase</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Commission</h4>
            <p className="text-gray-600">0%</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Contract Start</h4>
            <p className="text-gray-600">2022-08-16</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">VAT Rate</h4>
            <p className="text-gray-600">15%</p>
          </div>
        </div>
      </div>

      {/* Settlement & Banking */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Settlement & Banking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Frequency</h4>
            <p className="text-gray-600">{formData.settlementFrequency.toLowerCase()}</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Method</h4>
            <p className="text-gray-600">EFT</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Bank</h4>
            <p className="text-gray-600">{formData.bankNameDetails || 'Not set'}</p>
          </div>
          <div>
           <h4 className="font-inter text-[14px] font-medium leading-[18px] text-[#64748B]">Account</h4>
            <p className="text-gray-600">{formData.accountNumberDetails || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">Contacts ({formData.contacts.length})</h3>
        {formData.contacts.map((contact, index) => (
          <div key={contact.id} className="border-b border-gray-200 last:border-b-0 pb-4 mb-4 last:mb-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{contact.name || `Contact ${index + 1}`}</h4>
                <p className="text-sm text-gray-600">{contact.email}</p>
                {contact.role && <p className="text-sm text-gray-500">{contact.role}</p>}
              </div>
              {contact.isPrimary && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Primary</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewTab;