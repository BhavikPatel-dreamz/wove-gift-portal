"use client"
import React, { useState, useTransition } from 'react';
import { ChevronLeft, Plus, X, AlertTriangle, CheckCircle, Save, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrandPartner } from '../../../../lib/action/brandPartner';

// Import the new tab components
import CoreTab from '@/components/brandsPartner/CoreTab';
import TermsTab from '@/components/brandsPartner/TermsTab';
import VouchersTab from '@/components/brandsPartner/VouchersTab';
import IntegrationsTab from '@/components/brandsPartner/IntegrationsTab';
import BankingTab from '@/components/brandsPartner/BankingTab';
import ContactsTab from '@/components/brandsPartner/ContactsTab';
import ReviewTab from '@/components/brandsPartner/ReviewTab';
import toast from 'react-hot-toast';

const AddBrandPartner = () => {
  const [activeTab, setActiveTab] = useState('core');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Complete formData initialization with all fields
  const [formData, setFormData] = useState({
    // Core Information
    brandName: '',
    description: '',
    logo: null,
    website: '',
    contact: '',
    tagline: '',
    color: '#000000',
    categoryName: '',
    notes: '',
    isActive: false,
    isFeature: false,

    // Terms
    settlementTrigger: 'onRedemption',
    commissionType: 'Percentage',
    commissionValue: 0,
    maxDiscount: 0,
    minOrderValue: 0,
    currency: 'USD',
    brackingPolicy: 'Retain',
    brackingShare: 0,
    contractStart: new Date().toISOString().split('T')[0],
    contractEnd: '',
    goLiveDate: new Date().toISOString().split('T')[0],
    renewContract: false,
    vatRate: 15,
    internalNotes: '',

    // Vouchers - Fixed structure
    denominations: [],
    denominationType: 'fixed',
    maxAmount: 0,
    minAmount: 0,
    expiryPolicy: 'neverExpires',
    expiryValue: '365',
    fixedDays: 365,
    expiresAt: '',
    graceDays: 0,
    redemptionChannels: {
      online: false,
      inStore: false,
      phone: false
    },
    partialRedemption: false,
    stackable: false,
    minPerUsePerDays: 1,
    maxUserPerDay: 1,
    termsConditionsURL: '',

    // Banking & Settlement (Updated with new fields)
    settlementFrequency: 'monthly',
    dayOfMonth: 1,
    payoutMethod: 'EFT',
    invoiceRequired: false,
    remittanceEmail: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: '',
    bankName: '',
    swiftCode: '',
    country: 'South Africa',
    accountVerification: false,

    // Contacts
    contacts: [
      {
        id: 1,
        name: '',
        email: '',
        role: '',
        phone: '',
        notes: '',
        isPrimary: true
      }
    ],

    // Integrations
    integrations: []
  });

  const tabs = [
    { id: 'core', label: 'Core', completed: false },
    { id: 'terms', label: 'Terms', completed: false },
    { id: 'vouchers', label: 'Vouchers', completed: false },
    { id: 'integrations', label: 'Integrations', completed: false },
    { id: 'banking', label: 'Banking', completed: false },
    { id: 'contacts', label: 'Contacts', completed: false },
    { id: 'review', label: 'Review', completed: false }
  ];

  // Helper functions for validation
  const isValidUrl = (string) => {
    if (!string) return true; // Empty URL is valid (optional field)
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidEmail = (email) => {
    if (!email) return true; // Empty email is valid (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // State update functions
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

  const addIntegration = (integrationData) => {
    setFormData(prev => ({
      ...prev,
      integrations: [...prev.integrations, integrationData]
    }));
  };

  const removeIntegration = (id) => {
    setFormData(prev => ({
      ...prev,
      integrations: prev.integrations.filter(integration => integration.id !== id)
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
      notes: '',
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


  // Enhanced validation function
  const validateRequiredFields = () => {
    const errors = [];
    
    // Core validations
    if (!formData.brandName?.trim()) errors.push('Brand Name');
    if (!formData.description?.trim()) errors.push('Description');
    if (!formData.website?.trim()) errors.push('Website');
    if (!formData.categoryName?.trim()) errors.push('Category');
    
    // Banking validations (Enhanced)
    if (!formData.accountHolder?.trim()) errors.push('Account Holder');
    if (!formData.accountNumber?.trim()) errors.push('Account Number');
    if (!formData.branchCode?.trim()) errors.push('Branch Code');
    if (!formData.bankName?.trim()) errors.push('Bank Name');
    if (!formData.settlementFrequency?.trim()) errors.push('Settlement Frequency');
    if (formData.settlementFrequency === 'monthly' && !formData.dayOfMonth) {
      errors.push('Day of Month');
    }
    if (!formData.payoutMethod?.trim()) errors.push('Payout Method');
    
    // Contact validations
    const primaryContact = formData.contacts.find(c => c.isPrimary);
    if (!primaryContact?.name?.trim()) errors.push('Primary Contact Name');
    if (!primaryContact?.email?.trim()) errors.push('Primary Contact Email');
    if (!primaryContact?.role?.trim()) errors.push('Primary Contact Role');
    
    // Email validation for remittance email if provided
    if (formData.remittanceEmail && !isValidEmail(formData.remittanceEmail)) {
      errors.push('Valid Remittance Email');
    }
    
    // URL validations for integrations
    formData.integrations.forEach((integration, index) => {
      if (integration.storeUrl && !isValidUrl(integration.storeUrl)) {
        errors.push(`Integration ${index + 1} Store URL`);
      }
    });
    
    // Terms & Conditions URL validation
    if (formData.termsConditionsURL && !isValidUrl(formData.termsConditionsURL)) {
      errors.push('Terms & Conditions URL');
    }
    
    // // Website URL validation
    // if (formData.website && !isValidUrl(formData.website)) {
    //   errors.push('Valid Website URL');
    // }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Tab completion checking
  const checkTabCompletion = () => {
    const completedTabs = [];
     // Core tab completion
    if (formData.brandName && formData.description && formData.website && formData.categoryName) {
      completedTabs.push('core');
    }
    
    
     // Terms tab completion
    if (formData.commissionValue > 0 && formData.settlementTrigger) {
      completedTabs.push('terms');
    }
    
    // Banking tab completion
    if (formData.accountHolder && formData.accountNumber && formData.branchCode && formData.bankName) {
      completedTabs.push('banking');
    }

   // Vouchers tab completion
    if (formData.denominationType && formData.expiryPolicy && 
        (formData.redemptionChannels.online || formData.redemptionChannels.inStore || formData.redemptionChannels.phone)) {
      completedTabs.push('vouchers');
    }
    
    // Integrations tab completion
    const areIntegrationsValid = formData.integrations.every(
      integration => !integration.storeUrl || isValidUrl(integration.storeUrl)
    );
    if (areIntegrationsValid) {
      completedTabs.push('integrations');
    }
    
    // Contacts tab completion
    const primaryContact = formData.contacts.find(c => c.isPrimary);
    if (primaryContact?.name && primaryContact?.email && primaryContact?.role) {
      completedTabs.push('contacts');
    }
    
    return completedTabs;
  };

  const completedTabs = checkTabCompletion();

  const prepareFormDataForSubmission = (isDraft = false) => {
    // Create FormData for file upload
    const submitData = new FormData();
    
    // Clean up integrations data - ensure storeUrl is valid or empty
    const cleanedIntegrations = formData.integrations.map(integration => ({
      ...integration,
      storeUrl: integration.storeUrl && isValidUrl(integration.storeUrl) ? integration.storeUrl : '',
    }));
    
    // Prepare the data object
    const dataToSubmit = {
      ...formData,
      integrations: cleanedIntegrations,
      isActive: !isDraft, // Set isActive based on draft status
      termsConditionsURL: formData.termsConditionsURL && isValidUrl(formData.termsConditionsURL) ? formData.termsConditionsURL : '',
      // Ensure remittance email is valid or empty
      remittanceEmail: formData.remittanceEmail && isValidEmail(formData.remittanceEmail) ? formData.remittanceEmail : '',
      // Ensure website URL is valid
      website: formData.website && isValidUrl(formData.website) ? formData.website : '',
    };
    
    // Add logo file if present
    if (formData.logo) {
      submitData.append('logo', formData.logo);
    }
    
    // Add the JSON data
    submitData.append('data', JSON.stringify(dataToSubmit));
    
    return submitData;
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    
    try {
      const submitData = prepareFormDataForSubmission(true); // isDraft = true

      startTransition(async () => {
        const result = await createBrandPartner(submitData);
        
        if (result.success) {
           toast.success('Draft saved successfully!');
          router.push('/brandsPartner');
        } else {
          if (result.errors) {
            setValidationErrors(result.errors);
             toast.error('Validation failed. Please check the form.');
          } else {
             toast.error(result.message || 'Failed to save draft');
          }
        }
      });
    } catch (error) {
      console.error('Error saving draft:', error);
       toast.error('An error occurred while saving the draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    // Validate required fields before publishing
    if (!validateRequiredFields()) {
       toast.error('Please complete all required fields before publishing');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const submitData = prepareFormDataForSubmission(false); // isDraft = false
      
      startTransition(async () => {
        const result = await createBrandPartner(submitData);
        
        if (result.success) {
           toast.success('Brand partner published successfully!');
          router.push('/brandsPartner');
        } else {
          if (result.errors) {
            setValidationErrors(result.errors);
             toast.error('Validation failed. Please check the form.');
          } else {
             toast.error(result.message || 'Failed to publish brand partner');
          }
        }
      });
    } catch (error) {
      console.error('Error publishing brand partner:', error);
       toast.error('An error occurred while publishing the brand partner');
    } finally {
      setIsLoading(false);
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
        return <IntegrationsTab 
          formData={formData} 
          updateFormData={updateFormData} 
          updateIntegration={updateIntegration}
          addIntegration={addIntegration}
          removeIntegration={removeIntegration}
        />;
      case 'banking':
        return <BankingTab formData={formData} updateFormData={updateFormData} />;
      case 'contacts':
        return <ContactsTab 
          formData={formData} 
          updateFormData={updateFormData} 
          updateContact={updateContact} 
          addContact={addContact} 
          removeContact={removeContact} 
        />;
      case 'review':
        return <ReviewTab formData={formData} validationErrors={validationErrors} />;
      default:
        return <CoreTab formData={formData} updateFormData={updateFormData} />;
    }
  };

  const isFormDisabled = isLoading || isPending;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              disabled={isFormDisabled}
              onClick={() => router.back()}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Add Brand Partner</h1>
              <p className="text-sm text-gray-600">Complete brand setup with commercial terms and integrations</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                  Draft
                </span>
                <span className="text-xs text-gray-500">
                  {completedTabs.length}/{tabs.length-1} sections completed
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isFormDisabled}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Save size={16} />
              <span>{isLoading && !isPending ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={isFormDisabled}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Eye size={16} />
              <span>{isPending ? 'Publishing...' : 'Publish Brand'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing brand partner...</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !isFormDisabled && setActiveTab(tab.id)}
              disabled={isFormDisabled}
              className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap disabled:opacity-50 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {completedTabs.includes(tab.id) && (
                  <CheckCircle className="text-green-500" size={16} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Required Fields Warning */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 px-6 py-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={16} />
            <span className="text-sm font-medium text-red-800">Required Fields Missing</span>
            <span className="text-sm text-red-600">
              {validationErrors.length} field{validationErrors.length > 1 ? 's' : ''} need attention
            </span>
          </div>
          <div className="mt-2 text-xs text-red-600">
            Missing: {validationErrors.join(', ')}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-8">
        <div className={`transition-opacity duration-200 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AddBrandPartner;