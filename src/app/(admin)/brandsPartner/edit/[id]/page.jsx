"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Save, X, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import { getBrandPartner, updateBrandPartner } from '../../../../../lib/action/brandPartner';
import { toast } from 'react-hot-toast';

// Import the tab components from your brand partner structure
import CoreTab from '@/components/brandsPartner/CoreTab';
import TermsTab from '@/components/brandsPartner/TermsTab';
import VouchersTab from '@/components/brandsPartner/VouchersTab';
import IntegrationsTab from '@/components/brandsPartner/IntegrationsTab';
import BankingTab from '@/components/brandsPartner/BankingTab';
import ContactsTab from '@/components/brandsPartner/ContactsTab';
import ReviewTab from '@/components/brandsPartner/ReviewTab';

const BrandEdit = () => {
  const router = useRouter();
  const params = useParams();
  const brandId = params?.id;

  const [activeTab, setActiveTab] = useState('core');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Enhanced formData initialization with all banking fields
  const [formData, setFormData] = useState({
    // Core Information
    brandName: '',
    description: '',
    logo: null,
    website: '',
    contact: '',
    tagline: '',
    color: '#000000',
    categorieName: '',
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
    denominationType: 'fixed',
    denominations: [],
    maxAmount: 0,
    minAmount: 0,
    expiryPolicy: 'neverExpires',
    expiryValue: '365',
    fixedDays: 365,
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

    // Banking & Settlement (Enhanced with new fields)
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

  const [originalData, setOriginalData] = useState({});

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

  // Load brand data
  useEffect(() => {
    if (brandId) {
      loadBrandData();
    }
  }, [brandId]);

  // Check for changes
  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasChanged);
  }, [formData, originalData]);

  const loadBrandData = async () => {
    try {
      setLoading(true);
      const result = await getBrandPartner(brandId);

      if (result.success) {
        const brand = result.data;
        console.log("brandData", brand);

        // Enhanced mapping with proper handling of redemption channels
        const parseRedemptionChannels = (channels) => {
          if (typeof channels === 'object' && channels !== null) {
            return channels;
          }
          if (typeof channels === 'string') {
            const channelArray = channels.split(',').map(c => c.trim());
            return {
              online: channelArray.includes('online'),
              inStore: channelArray.includes('instore') || channelArray.includes('inStore'),
              phone: channelArray.includes('phone')
            };
          }
          return { online: false, inStore: false, phone: false };
        };

        // Map the brand data to form structure with enhanced banking fields
        const mappedData = {
          // Core Information
          brandName: brand.brandName || '',
          description: brand.description || '',
          logo: brand.logo || '',
          website: brand.website || '',
          autoGenUrl: brand.website || '',
          contact: brand.contact || '',
          tagline: brand.tagline || '',
          color: brand.color || '#000000',
          categorieName: brand.categorieName || '',
          notes: brand.notes || '',
          isActive: brand.isActive || false,
          isFeature: brand.isFeature || false,

          // Terms (from brandTerms relation)
          settlementTrigger: brand.brandTerms?.[0]?.settelementTrigger || 'onRedemption',
          commissionType: brand.brandTerms?.[0]?.commissionType || 'Percentage',
          commissionValue: brand.brandTerms?.[0]?.commissionValue || 0,
          maxDiscount: brand.brandTerms?.[0]?.maxDiscount || 0,
          minOrderValue: brand.brandTerms?.[0]?.minOrderValue || 0,
          currency: brand.brandTerms?.[0]?.currency || 'USD',
          brackingPolicy: brand.brandTerms?.[0]?.brackingPolicy || 'Retain',
          brackingShare: brand.brandTerms?.[0]?.brackingShare || 0,
          contractStart: brand.brandTerms?.[0]?.contractStart ?
            new Date(brand.brandTerms[0].contractStart).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0],
          contractEnd: brand.brandTerms?.[0]?.contractEnd ?
            new Date(brand.brandTerms[0].contractEnd).toISOString().split('T')[0] : '',
          goLiveDate: brand.brandTerms?.[0]?.goLiveDate ?
            new Date(brand.brandTerms[0].goLiveDate).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0],
          renewContract: brand.brandTerms?.[0]?.renewContract || false,
          vatRate: brand.brandTerms?.[0]?.vatRate || 15,
          internalNotes: brand.brandTerms?.[0]?.internalNotes || '',

          // Vouchers (Enhanced handling)
          denominationType: brand.vouchers?.[0]?.denominationtype || 'fixed',
          denominations: brand.vouchers?.[0]?.denominations || [],
          maxAmount: brand.vouchers?.[0]?.maxAmount || 0,
          minAmount: brand.vouchers?.[0]?.minAmount || 0,
          expiryPolicy: brand.vouchers?.[0]?.expiryPolicy || 'neverExpires',
          expiryValue: brand.vouchers?.[0]?.expiryValue || '365',
          expiresAt: brand.vouchers?.[0]?.expiresAt || '',
          fixedDays: brand.vouchers?.[0]?.fixedDays || 365,
          graceDays: brand.vouchers?.[0]?.graceDays || 0,
          minPerUsePerDays: brand.vouchers?.[0]?.minPerUsePerDays || 1,
          maxUserPerDay: brand.vouchers?.[0]?.maxUserPerDay || 1,
          redemptionChannels: parseRedemptionChannels(brand.vouchers?.[0]?.redemptionChannels),
          partialRedemption: brand.vouchers?.[0]?.partialRedemption || false,
          stackable: brand.vouchers?.[0]?.Stackable || false,
          termsConditionsURL: brand.vouchers?.[0]?.termsConditionsURL || '',

          // Banking & Settlement (Enhanced with new fields)
          settlementFrequency: brand.brandBankings?.[0]?.settlementFrequency || 'monthly',
          dayOfMonth: brand.brandBankings?.[0]?.dayOfMonth || 1,
          payoutMethod: brand.brandBankings?.[0]?.payoutMethod || 'EFT',
          invoiceRequired: brand.brandBankings?.[0]?.invoiceRequired || false,
          remittanceEmail: brand.brandBankings?.[0]?.remittanceEmail || '',
          accountHolder: brand.brandBankings?.[0]?.accountHolder || '',
          accountNumber: brand.brandBankings?.[0]?.accountNumber || '',
          branchCode: brand.brandBankings?.[0]?.branchCode || '',
          bankName: brand.brandBankings?.[0]?.bankName || '',
          swiftCode: brand.brandBankings?.[0]?.SWIFTCode || brand.brandBankings?.[0]?.swiftCode || '',
          country: brand.brandBankings?.[0]?.country || 'South Africa',
          accountVerification: brand.brandBankings?.[0]?.accountVerification || false,

          // Contacts
          contacts: brand.brandcontacts?.map(contact => ({
            id: contact.id,
            name: contact.name || '',
            email: contact.email || '',
            role: contact.role || '',
            phone: contact.phone || '',
            notes: contact.notes || '',
            isPrimary: contact.isPrimary || false
          })) || [{
            id: 1,
            name: '',
            email: '',
            role: '',
            phone: '',
            notes: '',
            isPrimary: true
          }],

          // Integrations  
          integrations: brand.integrations?.map(integration => ({
            id: integration.id,
            name: integration.platform,
            platform: integration.platform,
            type: 'ecommerce',
            status: integration.isActive ? 'active' : 'inactive',
            storeUrl: integration.storeUrl || '',
            accessToken: '', // Don't load sensitive data
            consumerKey: '',
            consumerSecret: '',
            testConnection: false
          })) || []
        };

        setFormData(mappedData);
        setOriginalData(JSON.parse(JSON.stringify(mappedData)));

      } else {
        toast.error('Failed to load brand data');
        router.push('/brandsPartner');
      }
    } catch (error) {
      console.error('Error loading brand:', error);
      toast.error('Error loading brand data');
      router.push('/brandsPartner');
    } finally {
      setLoading(false);
    }
  };

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

  console.log("formData", formData);

  // Enhanced validation with new banking fields
  const validateRequiredFields = () => {
    const errors = [];

    // Core validations
    if (!formData.brandName?.trim()) errors.push('Brand Name');
    if (!formData.description?.trim()) errors.push('Description');
    if (!formData.website?.trim()) errors.push('Website');
    if (!formData.categorieName?.trim()) errors.push('Category');

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

    // Website URL validation
    if (formData.website && !isValidUrl(formData.website)) {
      errors.push('Valid Website URL');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const prepareFormDataForSubmission = () => {
    // Create FormData for file upload
    const submitData = new FormData();

    // Clean up integrations data - ensure storeUrl is valid or empty
    const cleanedIntegrations = formData.integrations.map(integration => ({
      ...integration,
      storeUrl: integration.storeUrl && isValidUrl(integration.storeUrl) ? integration.storeUrl : '',
    }));

    // Prepare the data object with cleaned data
    const dataToSubmit = {
      ...formData,
      integrations: cleanedIntegrations,
      termsConditionsURL: formData.termsConditionsURL && isValidUrl(formData.termsConditionsURL) ? formData.termsConditionsURL : '',
      // Ensure remittance email is valid or empty
      remittanceEmail: formData.remittanceEmail && isValidEmail(formData.remittanceEmail) ? formData.remittanceEmail : '',
      // Ensure website URL is valid
      website: formData.website && isValidUrl(formData.website) ? formData.website : '',
    };

    // Add logo file if present
    if (formData.logo && typeof formData.logo !== 'string') {
      submitData.append('logo', formData.logo);
    }

    // Add the JSON data
    submitData.append('data', JSON.stringify(dataToSubmit));

    return submitData;
  };

  const handleSave = async () => {
    // Validate required fields
    if (!validateRequiredFields()) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);

    try {
      const submitData = prepareFormDataForSubmission();
      const result = await updateBrandPartner(brandId, submitData);

      console.log("result", result);

      if (result.success) {
        toast.success('Brand updated successfully');
        setOriginalData(JSON.parse(JSON.stringify(formData)));
        setHasChanges(false);
        // Optionally redirect back to brands list
        router.push('/brandsPartner');
      } else {
        if (result.errors) {
          setValidationErrors(result.errors);
          toast.error('Validation failed. Please check the form.');
        } else {
          toast.error(result.message || 'Failed to update brand');
        }
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('An error occurred while updating the brand');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/brandsPartner');
      }
    } else {
      router.push('/brandsPartner');
    }
  };

  // Tab completion checking
  const checkTabCompletion = () => {
    const completedTabs = [];
    
    // Core tab completion
    if (formData.brandName && formData.description && formData.website && formData.categorieName) {
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
    if (formData.integrations && formData.integrations.length > 0) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600">
          <Loader className="animate-spin" size={24} />
          <span>Loading brand data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors duration-200"
              disabled={saving}
              onClick={handleCancel}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Edit Brand Partner</h1>
              <p className="text-sm text-gray-600">Update brand information and settings</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  {formData.brandName || 'Brand'}
                </span>
                {hasChanges && (
                  <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                    Unsaved Changes
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {completedTabs.length}/{tabs.length-1} sections completed
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Updating brand partner...</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !saving && setActiveTab(tab.id)}
              disabled={saving}
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
        <div className={`transition-opacity duration-200 ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default BrandEdit;