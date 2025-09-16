import React from 'react';
import { X } from 'lucide-react';

const ReviewTab = ({ formData, validationErrors }) => {
  return (
    <div className="space-y-8">
      {/* Validation Status */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <X className="text-red-500 mt-0.5" size={16} />
            <div>
              <h4 className="font-medium text-red-800">Please complete the following required fields:</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {validationErrors.map((error, index) => (
                  <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">{error}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Brand Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900">Brand Name</h4>
            <p className="text-gray-600">{formData.brandName || 'No tagline'}</p>
            <p className="text-gray-500 text-sm mt-1">Other</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Primary Color</h4>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: formData.primaryColor }}
              ></div>
              <span className="text-gray-600">{formData.primaryColor}</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Website</h4>
            <p className="text-gray-600">{formData.website || 'Not set'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Slug</h4>
            <p className="text-gray-600">{formData.brandName ? `brands/${formData.brandName.toLowerCase().replace(/\s+/g, '-')}-auto-generated` : 'brands/auto-generated'}</p>
          </div>
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Commercial Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900">Settlement</h4>
            <p className="text-gray-600">on purchase</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Commission</h4>
            <p className="text-gray-600">0%</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Contract Start</h4>
            <p className="text-gray-600">2022-08-16</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">VAT Rate</h4>
            <p className="text-gray-600">15%</p>
          </div>
        </div>
      </div>

      {/* Settlement & Banking */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Settlement & Banking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900">Frequency</h4>
            <p className="text-gray-600">{formData.settlementFrequency.toLowerCase()}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Method</h4>
            <p className="text-gray-600">EFT</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Bank</h4>
            <p className="text-gray-600">{formData.bankNameDetails || 'Not set'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Account</h4>
            <p className="text-gray-600">{formData.accountNumberDetails || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Contacts ({formData.contacts.length})</h3>
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