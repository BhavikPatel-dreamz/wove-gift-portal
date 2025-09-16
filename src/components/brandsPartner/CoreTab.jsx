import React from 'react';
import { AlertTriangle, Upload } from 'lucide-react';

const CoreTab = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-8">
      {/* Required Fields Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="text-red-500 mt-0.5" size={16} />
          <div>
            <h4 className="font-medium text-red-800">Required Fields Missing</h4>
            <p className="text-sm text-red-600 mt-1">Complete these sections before publishing</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Brand Name', 'Description', 'Logo', 'Website', 'Account Holder', 'Bank Name', 'Account Number', 'Brand Code'].map(field => (
                <span key={field} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">{field}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-generate From Website */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Auto-generate From Website</h4>
        <div className="flex items-center space-x-3">
          <input
            type="url"
            placeholder="https://brand-website.com"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={formData.autoGenUrl || ''}
            onChange={(e) => updateFormData('autoGenUrl', e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
            Auto-fill
          </button>
        </div>
        <p className="text-sm text-blue-600 mt-2">Fetch a brand website URL to automatically populate metadata, logo, and colors when possible.</p>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter brand name"
              value={formData.brandName}
              onChange={(e) => updateFormData('brandName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.category}
              onChange={(e) => updateFormData('category', e.target.value)}
            >
              <option value="">Select category</option>
              <option value="fashion">Fashion</option>
              <option value="electronics">Electronics</option>
              <option value="food">Food & Beverage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter tags separated by commas"
              value={formData.tags}
              onChange={(e) => updateFormData('tags', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website URL *</label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://brand-website.com"
              value={formData.website}
              onChange={(e) => updateFormData('website', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
            placeholder="Enter brand description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
          />
        </div>
      </div>

      {/* Visual Identity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Visual Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500">Upload Logo</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                className="w-12 h-10 border border-gray-300 rounded"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
              />
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status & Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Status & Display</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 mr-3"
              checked={formData.voucherSettings.active}
              onChange={(e) => updateFormData('voucherSettings', { ...formData.voucherSettings, active: e.target.checked })}
            />
            <div>
              <span className="font-medium">Active on Frontend</span>
              <p className="text-sm text-gray-500">Make this brand visible to customers</p>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 mr-3"
              checked={formData.voucherSettings.featured}
              onChange={(e) => updateFormData('voucherSettings', { ...formData.voucherSettings, featured: e.target.checked })}
            />
            <div>
              <span className="font-medium">Featured Brand</span>
              <p className="text-sm text-gray-500">Display on featured brand sections</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CoreTab;