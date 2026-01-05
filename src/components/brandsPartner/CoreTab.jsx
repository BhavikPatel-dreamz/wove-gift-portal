import React, { useRef, useState, useEffect } from 'react';
import { AlertTriangle, Upload, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { currencyList } from './currency';

const CoreTab = ({ formData, updateFormData }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [currencies] = useState(currencyList);

  // Handle existing logo when component mounts or formData changes
  useEffect(() => {
    if (formData.logo) {
      if (typeof formData.logo === 'string') {
        // If logo is a string path, set it as preview
        setImagePreview(formData.logo);
      } else if (formData.logo instanceof File) {
        // If logo is a File object, create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(formData.logo);
      }
    } else {
      setImagePreview(null);
    }
  }, [formData.logo]);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, SVG, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Update form data
      updateFormData('logo', file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Remove uploaded file
  const removeFile = (e) => {
    e.stopPropagation(); // Prevent triggering the file input
    updateFormData('logo', null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get display name for the logo
  const getLogoDisplayName = () => {
    if (formData.logo) {
      if (typeof formData.logo === 'string') {
        // Extract filename from path
        return formData.logo.split('/').pop();
      } else if (formData.logo instanceof File) {
        return formData.logo.name;
      }
    }
    return 'Logo uploaded';
  };

  return (
    <div className="space-y-8">
      {/* Auto-generate From Website */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-inter text-sm font-semibold capitalize text-[#1F59EE] mb-2">Auto-generate From Website</h4>
        <div className="flex items-center space-x-3">
          <input
            type="url"
            placeholder="https://brand-website.com"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-xs font-semibold leading-5 text-[#4A4A4A]"
            value={formData.autoGenUrl || ''}
            onChange={(e) => updateFormData('autoGenUrl', e.target.value)}
          />
        </div>
        <p className="font-inter text-[10px] font-semibold capitalize text-[#1F59EE] mt-2">
          Fetch a brand website URL to automatically populate metadata, logo, and colors when possible.
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs font-medium leading-5 text-[#4A4A4A] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
              placeholder="Enter brand name"
              value={formData.brandName || ''}
              onChange={(e) => updateFormData('brandName', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
              Category *
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs font-medium leading-5 text-[#4A4A4A] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
              value={formData.categoryName || ''}
              onChange={(e) => updateFormData('categoryName', e.target.value)}
              required
            >
              <option value="">Select category</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Travel">Travel</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Services">Services</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
              Tagline
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs font-medium leading-5 text-[#4A4A4A] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
              placeholder="Enter brand tagline"
              value={formData.tagline || ''}
              onChange={(e) => updateFormData('tagline', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
              Website URL *
            </label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs font-medium leading-5 text-[#4A4A4A] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
              placeholder="https://brand-website.com"
              value={formData.website || ''}
              onChange={(e) => updateFormData('website', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Currency</label>
            <select
              value={formData?.currency || ''}
              onChange={(e) => updateFormData('currency', e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-white"
            >
              {currencies.map((cur) => (
                <option key={cur?.code} value={cur?.code}>
                  {cur?.symbol + " " + cur?.code}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
            Description *
          </label>
          <textarea
           className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs font-medium leading-5 text-[#4A4A4A] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
            placeholder="Enter brand description"
            value={formData.description || ''}
            onChange={(e) => updateFormData('description', e.target.value)}
            required
          />
        </div>


      </div>

      {/* Visual Identity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4">Visual Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
              Brand Logo *
            </label>

            {/* File Upload Area */}
            <div className="relative">
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Logo preview"
                      className="mx-auto mb-2 max-h-24 w-auto rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ display: 'none' }} className="text-red-500 text-sm">
                      Failed to load image
                    </div>
                    <p className="text-sm text-gray-600">
                      {getLogoDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Click to replace or drag new file
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                    <p className="text-sm text-gray-600 mb-1">Upload Logo</p>
                    <p className="text-xs text-gray-500">
                      Drag & drop or click to select
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, SVG, WebP (max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {imagePreview && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                value={formData.color || '#000000'}
                onChange={(e) => updateFormData('color', e.target.value)}
              />
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.color || '#000000'}
                onChange={(e) => updateFormData('color', e.target.value)}
                placeholder="#000000"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
            </div>
           <p className="font-inter text-xs font-normal leading-5 text-[#7E7E7E] mt-1">
              Used for brand theming and UI elements
            </p>
          </div>
        </div>
      </div>

      {/* Status & Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
       <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4">Status & Display</h3>
        <div className="space-y-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 mr-3 mt-1 focus:ring-2 focus:ring-blue-500"
              checked={formData.isActive || false}
              onChange={(e) => updateFormData('isActive', e.target.checked)}
            />
            <div>
              <span className="font-inter text-sm font-semibold capitalize text-[#4A4A4A]">Active on Frontend</span>
             <p className="font-inter text-xs font-medium leading-5 text-[#A5A5A5]">
                Make this brand visible to customers on the website
              </p>
            </div>
          </label>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 mr-3 mt-1 focus:ring-2 focus:ring-blue-500"
              checked={formData.isFeature || false}
              onChange={(e) => updateFormData('isFeature', e.target.checked)}
            />
            <div>
              <span className="font-inter text-sm font-semibold capitalize text-[#4A4A4A]">Featured Brand</span>
             <p className="font-inter text-xs font-medium leading-5 text-[#A5A5A5]">
                Display prominently in featured brand sections and homepage
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-inter text-base font-semibold capitalize text-[#4A4A4A] mb-4">Additional Information</h3>
        <div>
          <label className="block font-inter text-sm font-semibold capitalize text-[#4A4A4A] mb-2">
            Internal Notes
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Add any internal notes about this brand partner..."
            value={formData.notes || ''}
            onChange={(e) => updateFormData('notes', e.target.value)}
          />
         <p className="font-inter text-[10px] font-medium leading-5 text-[#4A4A4A]">
            These notes are only visible to admin users
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoreTab;