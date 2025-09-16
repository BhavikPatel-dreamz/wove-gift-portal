"use client"
import React, { useState } from 'react';
import { ChevronLeft, Plus, X, AlertTriangle, CheckCircle, Upload, Trash2 } from 'lucide-react';

const AddBrandPartner = () => {
  const [activeTab, setActiveTab] = useState('core');
  const [formData, setFormData] = useState({
    // Core Information
    brandName: '',
    description: '',
    logo: null,
    website: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    primaryColor: '#000000',
    autoGenUrl: '',
    category: '',
    tags: '',

    // Terms
    settlementTrigger: 'redemption',
    settlementFrequency: 'Monthly',
    dayOfMonth: 1,
    payoutMethod: 'Electronic Funds Transfer (EFT)',
    invoiceRequired: false,
    remittanceEmail: '',
    commissionType: 'Percentage',
    commissionValue: 0,
    currency: 'USD',
    minimumOrderValue: 0,
    maxDiscount: 0,
    breakagePolicy: 'none',
    contractStart: '2024-01-01',
    contractEnd: '',
    endDateType: '',
    autoRenew: 'Automatically renewal contract (default)',
    vatRate: 15,
    noticePeriod: 30,
    specialNotes: '',

    // Vouchers
    voucherSettings: {
      active: false,
      featured: false
    },
    denominationType: 'fixed',
    denominationValue: '',
    denominations: [],
    expiryPolicy: 'Never',
    fixedDays: 365,
    expiryValue: 'Never',
    graceDays: 0,
    redemptionChannels: {
      online: true,
      inStore: true,
      phone: false
    },
    partialRedemption: true,
    minPerUsePerDays: 1,

    // Integrations
    integrations: [
      {
        id: 1,
        name: 'Shopify',
        type: 'ecommerce',
        status: 'inactive',
        shopUrl: '',
        accessToken: '',
        testConnection: false
      },
      {
        id: 2,
        name: 'WooCommerce',
        type: 'ecommerce',
        status: 'inactive',
        shopUrl: '',
        consumerKey: '',
        consumerSecret: '',
        testConnection: false
      }
    ],

    // Banking Details
    accountHolderName: '',
    bankNameDetails: '',
    accountNumberDetails: '',
    branchCodeDetails: '',
    swiftCode: '',
    country: 'South Africa (ZA)',

    // Contacts
    contacts: [
      {
        id: 1,
        name: '',
        email: '',
        role: '',
        phone: '',
        isPrimary: true
      }
    ],

    // Internal Notes
    internalNotes: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);

  const tabs = [
    { id: 'core', label: 'Core', completed: false },
    { id: 'terms', label: 'Terms', completed: false },
    { id: 'vouchers', label: 'Vouchers', completed: false },
    { id: 'integrations', label: 'Integrations', completed: false },
    { id: 'banking', label: 'Banking', completed: false },
    { id: 'contacts', label: 'Contacts', completed: false },
    { id: 'review', label: 'Review', completed: false }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateIntegration = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      integrations: prev.integrations.map(integration =>
        integration.id === id ? { ...integration, [field]: value } : integration
      )
    }));
  };

  const updateContact = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addContact = () => {
    const newContact = {
      id: Date.now(),
      name: '',
      email: '',
      role: '',
      phone: '',
      isPrimary: false
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const removeContact = (id) => {
    if (formData.contacts.length > 1) {
      setFormData(prev => ({
        ...prev,
        contacts: prev.contacts.filter(contact => contact.id !== id)
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    const requiredFields = [
      { field: 'brandName', label: 'Brand Name' },
      { field: 'description', label: 'Description' },
      { field: 'website', label: 'Website' },
      { field: 'accountHolder', label: 'Account Holder' },
      { field: 'bankName', label: 'Bank Name' },
      { field: 'accountNumber', label: 'Account Number' },
      { field: 'branchCode', label: 'Branch Code' }
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!formData[field]) {
        errors.push(label);
      }
    });

    // Validate contacts
    formData.contacts.forEach((contact, index) => {
      if (!contact.name) errors.push(`Contact ${index + 1} Name`);
      if (!contact.email) errors.push(`Contact ${index + 1} Email`);
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    alert('Draft saved successfully!');
  };

  const handlePublish = () => {
    if (validateForm()) {
      console.log('Publishing brand partner:', formData);
      alert('Brand partner published successfully!');
    }
  };

  const renderCore = () => (
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
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
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

  const renderTerms = () => (
    <div className="space-y-8">
      {/* Settlement Trigger */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Settlement Trigger
        </h3>
        <p className="text-sm text-gray-600 mb-4">When do we settle with this brand?</p>

        <div className="space-y-4">
          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="settlementTrigger"
              value="redemption"
              className="mt-1"
              checked={formData.settlementTrigger === 'redemption'}
              onChange={(e) => updateFormData('settlementTrigger', e.target.value)}
            />
            <div>
              <div className="font-medium">On Redemption</div>
              <div className="text-sm text-gray-500">Settle when customers redeem their vouchers</div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="settlementTrigger"
              value="purchase"
              checked={formData.settlementTrigger === 'purchase'}
              onChange={(e) => updateFormData('settlementTrigger', e.target.value)}
            />
            <div>
              <div className="font-medium">Amount Range</div>
              <div className="text-sm text-gray-500">If a customer is over a certain amount within a range</div>
            </div>
          </label>
        </div>
      </div>

      {/* Commission Model */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Commission Model</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.commissionType}
              onChange={(e) => updateFormData('commissionType', e.target.value)}
            >
              <option value="Percentage">Percentage</option>
              <option value="Fixed Amount">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Value</label>
            <div className="flex">
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                placeholder="0.00"
                value={formData.commissionValue}
                onChange={(e) => updateFormData('commissionValue', parseFloat(e.target.value) || 0)}
              />
              <span className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-gray-500">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.currency}
              onChange={(e) => updateFormData('currency', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="ZAR">ZAR</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (Optional)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="0"
              value={formData.minimumOrderValue || 0} // Fallback to 0 if undefined
              onChange={(e) => updateFormData('minimumOrderValue', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount % (Optional)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="0"
            value={formData.maxDiscount}
            onChange={(e) => updateFormData('maxDiscount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Breakage Policy */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Breakage Policy</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Breakage Policy</label>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="breakagePolicy"
                value="none"
                className="mt-1"
                checked={formData.breakagePolicy === 'none'}
                onChange={(e) => updateFormData('breakagePolicy', e.target.value)}
              />
              <div>
                <div className="font-medium">None</div>
                <div className="text-sm text-gray-500">No base commission breakage rules or policy.</div>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="breakagePolicy"
                value="percentage"
                checked={formData.breakagePolicy === 'percentage'}
                onChange={(e) => updateFormData('breakagePolicy', e.target.value)}
              />
              <div>
                <div className="font-medium">Share</div>
                <div className="text-sm text-gray-500">Split commissioning share with the brand.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Contract Terms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start *</label>
            <div className="flex">
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                value={formData.contractStart}
                onChange={(e) => updateFormData('contractStart', e.target.value)}
              />
              <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2">
                📅
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract End</label>
            <div className="flex">
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                value={formData.contractEnd}
                onChange={(e) => updateFormData('contractEnd', e.target.value)}
              />
              <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2">
                📅
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date Type (Optional)</label>
            <div className="flex">
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                value={formData.endDateType}
                onChange={(e) => updateFormData('endDateType', e.target.value)}
              />
              <button className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2">
                📅
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Renew Contract</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.autoRenew}
              onChange={(e) => updateFormData('autoRenew', e.target.value)}
            >
              <option value="Automatically renewal contract (default)">Automatically renewal contract (default)</option>
              <option value="Manual renewal required">Manual renewal required</option>
            </select>
          </div>
        </div>
      </div>

      {/* VAT & Notice */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">VAT & Notice</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="15"
              step="0.01"
              value={formData.vatRate}
              onChange={(e) => updateFormData('vatRate', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period (Days)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="30"
              value={formData.noticePeriod}
              onChange={(e) => updateFormData('noticePeriod', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
            placeholder="Any special terms about commercial terms..."
            value={formData.specialNotes}
            onChange={(e) => updateFormData('specialNotes', e.target.value)}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 mt-1">ℹ️</div>
            <p className="text-sm text-blue-800">
              When adding a brand commercial terms, a new contract will be created which existing the references for both payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-8">
      {/* Add Integration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Add Integration</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">Select platform</option>
            <option value="shopify">Shopify</option>
            <option value="woocommerce">WooCommerce</option>
            <option value="magento">Magento</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          Add Integration
        </button>
      </div>

      {/* Configured Integrations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Configured Integrations</h3>

        {formData.integrations.map((integration) => (
          <div key={integration.id} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={16} />
                </div>
                <div>
                  <h4 className="font-medium">{integration.name}</h4>
                  <p className="text-sm text-gray-500">
                    {integration.name === 'Shopify' ? 'Shopify stores for gift card products' : 'WooCommerce Integration'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-orange-500 text-white px-3 py-1 rounded text-sm">
                  Configure
                </button>
                <button className="text-orange-500 text-sm">Remove</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop URL</label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="https://shop.brand.com"
                  value={integration.shopUrl}
                  onChange={(e) => updateIntegration(integration.id, 'shopUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter access token"
                  value={integration.accessToken}
                  onChange={(e) => updateIntegration(integration.id, 'accessToken', e.target.value)}
                />
              </div>
              {integration.name === 'WooCommerce' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Key</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="ck_..."
                      value={integration.consumerKey}
                      onChange={(e) => updateIntegration(integration.id, 'consumerKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Secret</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="cs_..."
                      value={integration.consumerSecret}
                      onChange={(e) => updateIntegration(integration.id, 'consumerSecret', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <button className="mt-4 text-blue-600 text-sm hover:text-blue-800">
              Test Connection
            </button>
          </div>
        ))}
      </div>

      {/* Integration Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Integration Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>Shopify:</strong> Requires private app or custom app credentials with gift card API access.</p>
          <p><strong>WooCommerce:</strong> Needs REST API consumer key/secret pair with read/write access to products.</p>
          <p><strong>Testing:</strong> Use test/staging credentials during setup. Switch to production after verification.</p>
          <p><strong>Custom API:</strong> Must implement standard gift card endpoints for product sync.</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-yellow-800">
            <strong>Security Note:</strong> All credentials are encrypted and secured. They are only displayed while being added.
          </p>
        </div>
      </div>
    </div>
  );

  const renderBanking = () => (
    <div className="space-y-8">
      {/* Banking Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Banking Details</h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-yellow-500 mt-0.5" size={16} />
            <p className="text-sm text-yellow-800">
              <strong>Security Notice:</strong> Account numbers are encrypted and tokenised. Only masked values are displayed after saving.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Account holder name"
              value={formData.accountHolderName}
              onChange={(e) => updateFormData('accountHolderName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Bank name"
              value={formData.bankNameDetails}
              onChange={(e) => updateFormData('bankNameDetails', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Account number"
              value={formData.accountNumberDetails}
              onChange={(e) => updateFormData('accountNumberDetails', e.target.value)}
            />
            <button className="text-blue-600 text-sm mt-1 hover:text-blue-800">Show</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Branch code"
              value={formData.branchCodeDetails}
              onChange={(e) => updateFormData('branchCodeDetails', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT/BIC Code</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="SWIFT/BIC (for international transfers)"
              value={formData.swiftCode}
              onChange={(e) => updateFormData('swiftCode', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Required for international transfers</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.country}
              onChange={(e) => updateFormData('country', e.target.value)}
            >
              <option value="South Africa (ZA)">South Africa (ZA)</option>
              <option value="United States (US)">United States (US)</option>
              <option value="United Kingdom (GB)">United Kingdom (GB)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Verify Account
          </button>
        </div>
      </div>

      {/* Settlement Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Settlement Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-gray-600">Frequency:</span>
            <span className="ml-2 font-medium">Monthly</span>
          </div>
          <div>
            <span className="text-gray-600">Method:</span>
            <span className="ml-2 font-medium">EFT</span>
          </div>
          <div>
            <span className="text-gray-600">Invoice Required:</span>
            <span className="ml-2 font-medium">Yes</span>
          </div>
          <div>
            <span className="text-gray-600">Bank Verified:</span>
            <span className="ml-2 font-medium text-red-600">No</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-8">
      {/* Brand Contacts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Brand Contacts</h3>
          <button
            onClick={addContact}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>

        {formData.contacts.map((contact, index) => (
          <div key={contact.id} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium">Contact {index + 1}</h4>
                {contact.isPrimary && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Primary</span>
                )}
              </div>
              {formData.contacts.length > 1 && (
                <button
                  onClick={() => removeContact(contact.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Contact name"
                  value={contact.name}
                  onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Job title/role"
                  value={contact.role}
                  onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="contact@brand.com"
                  value={contact.email}
                  onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="+1 555 000 0000"
                  value={contact.phone}
                  onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Internal Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Internal Notes</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
            placeholder="Internal notes about this brand partner (not visible to partners)"
            value={formData.internalNotes}
            onChange={(e) => updateFormData('internalNotes', e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-2">These notes are for internal use only and will not be shared with the brand partner.</p>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'core':
        return renderCore();
      case 'terms':
        return renderTerms();
      case 'vouchers':
        return (
          <div className="space-y-8">
            {/* Denomination Setup */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="mr-2">🎫</span>
                Denomination Setup
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Denomination Type</label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="denominationType"
                      value="fixed"
                      className="mt-1"
                      defaultChecked
                    />
                    <div>
                      <div className="font-medium">Fixed Denominations</div>
                      <div className="text-sm text-gray-500">Offer standard pre-determined voucher fixed</div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="denominationType"
                      value="amount"
                    />
                    <div>
                      <div className="font-medium">Amount Range</div>
                      <div className="text-sm text-gray-500">Let customers set the amount within a range</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Denomination</label>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="number"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    placeholder="100"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500">Set denomination values for vouchers ($)</p>
              </div>
            </div>

            {/* Expiry & Grace Period */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Expiry & Grace Period</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Policy</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Never</option>
                    <option>Fixed Date</option>
                    <option>Period After Purchase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Days</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="365"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Value</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Never"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grace Days</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Grace days allow a few extra days beyond the official expiry.
              </p>
            </div>

            {/* Redemption Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Redemption Settings</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Redemption Channels</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-3" defaultChecked />
                    <span>Online</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-3" defaultChecked />
                    <span>In-Store</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-3" />
                    <span>Phone</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Partial Redemption</label>
                  <p className="text-sm text-gray-500">Allow customers to spend voucher in multiple purchases</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Enabled</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Per Use Per Days</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Voucher Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="mr-2">👁️</span>
                Voucher Preview
              </h3>

              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <h4 className="font-medium text-lg mb-2">Brand Name</h4>
                <p className="text-gray-600 text-sm mb-4">Gift Card • $100.00</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  This is a preview of how vouchers will appear to customers.
                </p>
              </div>
            </div>
          </div>
        );
      case 'integrations':
        return renderIntegrations();
      case 'banking':
        return renderBanking();
      case 'contacts':
        return renderContacts();
      case 'review':
        return renderReview();
      default:
        return renderCore();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Add Brand Partner</h1>
              <p className="text-sm text-gray-600">Complete brand setup with commercial terms and integrations</p>
              <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mt-1">
                Draft
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Publish Brand
            </button>
          </div>
        </div>
      </div>

      {/* Required Fields Warning */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={16} />
            <span className="text-sm font-medium text-red-800">Required Fields Missing</span>
            <span className="text-sm text-red-600">Complete these sections before publishing</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {tab.completed && <CheckCircle className="text-green-500" size={16} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AddBrandPartner;