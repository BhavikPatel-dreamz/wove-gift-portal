"use client"
import React, { useRef } from 'react';
import { Upload, Globe, Loader, X } from 'lucide-react';
import { categories } from '../../lib/resourses';

const BrandForm = ({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  autoPopulateFromWebsite, 
  setShowAddForm, 
  setFormData,
  actionLoading = false,
  isEditing = false,
  editingBrand = null
}) => {
  const fileInputRef = useRef(null);



  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      handleInputChange({
        target: {
          name: 'logo',
          type: 'file',
          files: [file]
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      brandName: '',
      tagline: '',
      categorieName: '',
      website: '',
      description: '',
      contact: '',
      notes: '',
      logo: null,
      color: '#000000',
      isFeature: false,
      isActive: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditing 
                ? 'Update your brand information' 
                : 'Fill in the details to add a new brand to your portfolio'
              }
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={actionLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Brand Name - Required */}
          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              id="brandName"
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter brand name"
              required
              disabled={actionLoading}
            />
          </div>

          {/* Website with Auto-populate */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="https://example.com"
                disabled={actionLoading}
              />
              <button
                type="button"
                onClick={autoPopulateFromWebsite}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={actionLoading || !formData.website}
              >
                <Globe size={16} />
                Auto-fill
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add website URL and click "Auto-fill" to automatically populate brand information
            </p>
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
              Tagline / Slogan
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter brand tagline or slogan"
              disabled={actionLoading}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categorieName" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="categorieName"
              name="categorieName"
              value={formData.categorieName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={actionLoading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Description - Required */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Describe the brand, its mission, and what makes it unique"
              required
              disabled={actionLoading}
            />
          </div>

          {/* Contact Information */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Email, phone, or contact person"
              disabled={actionLoading}
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={actionLoading}
              />
              <div className="flex flex-col items-center">
                <Upload className="text-gray-400 mb-2" size={24} />
                {formData.logo ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Selected: {formData.logo.name}</p>
                    <button
                      type="button"
                      onClick={handleFileClick}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      disabled={actionLoading}
                    >
                      Change Logo
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <button
                      type="button"
                      onClick={handleFileClick}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      disabled={actionLoading}
                    >
                      Choose File
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Brand Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                disabled={actionLoading}
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange({
                  target: { name: 'color', value: e.target.value }
                })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="#000000"
                disabled={actionLoading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Any additional notes or comments about this brand"
              disabled={actionLoading}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={actionLoading}
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Brand is active
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeature"
                name="isFeature"
                checked={formData.isFeature}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={actionLoading}
              />
              <label htmlFor="isFeature" className="ml-2 text-sm text-gray-700">
                Feature this brand
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !formData.brandName || !formData.description}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Update Brand' : 'Add Brand'
              )}
            </button>
          </div>

          {/* Required Fields Note */}
          <p className="text-xs text-gray-500 text-center">
            Fields marked with * are required
          </p>
        </form>
      </div>
    </div>
  );
};

export default BrandForm;