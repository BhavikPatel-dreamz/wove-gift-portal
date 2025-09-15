"use client";

import { Upload, Globe, Plus } from 'lucide-react';

const BrandForm = ({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  autoPopulateFromWebsite, 
  setShowAddForm, 
  setFormData 
}) => {
  return (
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Plus className="text-white" size={16} />
          </div>
          <h2 className="text-lg font-semibold">Create New Brand</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Brand
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Auto-populate section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Globe className="text-green-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800 mb-2">Auto-Populate from Website</h3>
              <p className="text-sm text-green-700 mb-3">Enter a brand's website URL to automatically extract basic information like name, tagline, and description.</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://brandwebsite.com"
                  className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <button
                  type="button"
                  onClick={autoPopulateFromWebsite}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Populate Fields
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., SuperShoes"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select a category</option>
                <option value="Fashion & Footwear">Fashion & Footwear</option>
                <option value="Clothing">Clothing</option>
                <option value="Fashion">Fashion</option>
                <option value="Footwear">Footwear</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              placeholder="e.g., Fashion Forward"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what makes this brand special..."
              rows="3"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none"
            />
          </div>
        </div>

        {/* Visual Identity */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            Visual Identity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-600 mb-2">Upload Brand Logo</p>
                <p className="text-xs text-gray-400">PNG, JPG, SVG • Max 2MB • Automatically optimized</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    // Handle file upload here
                    console.log('File selected:', e.target.files[0]);
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm outline-none"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            Brand Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">Active Status</label>
                <p className="text-xs text-gray-500">Show brand to customers</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.active ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">Featured Brand</label>
                <p className="text-xs text-gray-500">Highlight on homepage</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.featured ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.featured ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandForm;
