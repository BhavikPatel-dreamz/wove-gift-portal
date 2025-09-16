"use client"
import React, { useState } from 'react';
import { ChevronLeft, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';

// Import the new tab components
import CoreTab from '@/components/brandsPartner/CoreTab';
import TermsTab from '@/components/brandsPartner/TermsTab';
import VouchersTab from '@/components/brandsPartner/VouchersTab';
import IntegrationsTab from '@/components/brandsPartner/IntegrationsTab';
import BankingTab from '@/components/brandsPartner/BankingTab';
import ContactsTab from '@/components/brandsPartner/ContactsTab';
import ReviewTab from '@/components/brandsPartner/ReviewTab';

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
      { field: 'accountHolderName', label: 'Account Holder' }, // Changed from accountHolder
      { field: 'bankNameDetails', label: 'Bank Name' }, // Changed from bankName
      { field: 'accountNumberDetails', label: 'Account Number' }, // Changed from accountNumber
      { field: 'branchCodeDetails', label: 'Branch Code' } // Changed from branchCode
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'core':
        return <CoreTab formData={formData} updateFormData={updateFormData} />;
      case 'terms':
        return <TermsTab formData={formData} updateFormData={updateFormData} />;
      case 'vouchers':
        return <VouchersTab formData={formData} updateFormData={updateFormData} />;
      case 'integrations':
        return <IntegrationsTab formData={formData} updateFormData={updateFormData} updateIntegration={updateIntegration} />;
      case 'banking':
        return <BankingTab formData={formData} updateFormData={updateFormData} />;
      case 'contacts':
        return <ContactsTab formData={formData} updateFormData={updateFormData} updateContact={updateContact} addContact={addContact} removeContact={removeContact} />;
      case 'review':
        return <ReviewTab formData={formData} validationErrors={validationErrors} />;
      default:
        return <CoreTab formData={formData} updateFormData={updateFormData} />;
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