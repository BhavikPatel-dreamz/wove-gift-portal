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

  // Replace the formData initialization in your main component
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
    denominationValue: '',
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
    }, // Changed from string to object
    partialRedemption: false,
    stackable: false,
    minPerUsePerDays: 1, // Changed from maxUserPerDay
    termsConditionsURL: '',

    // Banking
    settlementFrequency: 'monthly',
    dayOfMonth: 1,
    payoutMethod: 'EFT',
    invoiceRequired: false,
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
        console.log("brandbrandbrand",brand);
        

        // Map the brand data to form structure
        const mappedData = {
          // Core Information
          brandName: brand.brandName || '',
          description: brand.description || '',
          logo: null, // Don't load existing file
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

          // Vouchers
          denominationType: brand.vouchers?.[0]?.denominationype || 'staticDenominations',
          denominationValue: brand.vouchers?.[0]?.denominationValue || null,
          maxAmount: brand.vouchers?.[0]?.maxAmount || 0,
          minAmount: brand.vouchers?.[0]?.minAmount || 0,
          expiryPolicy: brand.vouchers?.[0]?.expiryPolicy || 'fixedDay',
          expiryValue: brand.vouchers?.[0]?.expiryValue || '365',
          graceDays: brand.vouchers?.[0]?.graceDays || 0,
          redemptionChannels: brand.vouchers?.[0]?.redemptionChannels || 'online,instore',
          partialRedemption: brand.vouchers?.[0]?.partialRedemption || false,
          stackable: brand.vouchers?.[0]?.Stackable || false,
          maxUserPerDay: brand.vouchers?.[0]?.maxUserPerDay || 1,
          termsConditionsURL: brand.vouchers?.[0]?.termsConditionsURL || '',

          // Banking
          settlementFrequency: brand.brandBankings?.[0]?.settlementFrequency || 'monthly',
          dayOfMonth: brand.brandBankings?.[0]?.dayOfMonth || 1,
          payoutMethod: brand.brandBankings?.[0]?.payoutMethod || 'EFT',
          invoiceRequired: brand.brandBankings?.[0]?.invoiceRequired || false,
          accountHolder: brand.brandBankings?.[0]?.accountHolder || '',
          accountNumber: brand.brandBankings?.[0]?.accountNumber || '',
          branchCode: brand.brandBankings?.[0]?.branchCode || '',
          bankName: brand.brandBankings?.[0]?.bankName || '',
          swiftCode: brand.brandBankings?.[0]?.SWIFTCode || '',
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
        router.push('/brands');
      }
    } catch (error) {
      console.error('Error loading brand:', error);
      toast.error('Error loading brand data');
      router.push('/brands');
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

  const validateRequiredFields = () => {
    const errors = [];

    // Core validations
    if (!formData.brandName?.trim()) errors.push('Brand Name');
    if (!formData.description?.trim()) errors.push('Description');
    if (!formData.website?.trim()) errors.push('Website');
    if (!formData.categorieName?.trim()) errors.push('Category');

    // Banking validations
    if (!formData.accountHolder?.trim()) errors.push('Account Holder');
    if (!formData.accountNumber?.trim()) errors.push('Account Number');
    if (!formData.branchCode?.trim()) errors.push('Branch Code');
    if (!formData.bankName?.trim()) errors.push('Bank Name');

    // Terms validations
    if (!formData.contractStart) errors.push('Contract Start Date');
    if (!formData.contractEnd) errors.push('Contract End Date');

    // Contact validations
    const primaryContact = formData.contacts.find(c => c.isPrimary);
    if (!primaryContact?.name?.trim()) errors.push('Primary Contact Name');
    if (!primaryContact?.email?.trim()) errors.push('Primary Contact Email');
    if (!primaryContact?.role?.trim()) errors.push('Primary Contact Role');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const prepareFormDataForSubmission = () => {
    // Create FormData for file upload
    const submitData = new FormData();

    // Add logo file if present
    if (formData.logo) {
      submitData.append('logo', formData.logo);
    }

    // Add the JSON data
    submitData.append('data', JSON.stringify(formData));

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
        router.push('/brands');
      }
    } else {
      router.push('/brands');
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
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
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
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>



      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
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
              className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap disabled:opacity-50 ${activeTab === tab.id
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

      {/* Required Fields Warning */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
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
        <div className={saving ? 'opacity-50 pointer-events-none' : ''}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default BrandEdit;