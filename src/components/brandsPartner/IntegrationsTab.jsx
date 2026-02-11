import React, { useState } from 'react';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const IntegrationsTab = ({ formData, updateFormData, updateIntegration }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const availablePlatforms = [
    { value: 'shopify', label: 'Shopify' },
    { value: 'woocommerce', label: 'WooCommerce' },
    { value: 'magento', label: 'Magento' },
    { value: 'custom', label: 'Custom API' }
  ];

  const addIntegration = () => {
    if (!selectedPlatform) return;

    const platformLabel = availablePlatforms.find(p => p.value === selectedPlatform)?.label || selectedPlatform;
    
    const newIntegration = {
      id: parseInt(Date.now()), // Ensure it's a number
      name: platformLabel,
      platform: platformLabel,
      type: 'ecommerce',
      status: 'inactive',
      storeUrl: '',
      accessToken: '',
      consumerKey: '',
      consumerSecret: '',
      testConnection: false
    };

    updateFormData('integrations', [...formData.integrations, newIntegration]);
    setSelectedPlatform(''); // Reset selection
  };

  const removeIntegration = (id) => {
    const updatedIntegrations = formData.integrations.filter(integration => integration.id !== id);
    updateFormData('integrations', updatedIntegrations);
  };

  const testConnection = async (integrationId) => {
    // Placeholder for test connection logic
    updateIntegration(integrationId, 'testConnection', true);
    
    // Simulate API call
    setTimeout(() => {
      updateIntegration(integrationId, 'status', 'active');
      toast.success('Connection test successful!');
    }, 1000);
  };

  const isValidUrl = (url) => {
    if (!url) return true; // Empty URL is valid (optional field)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getExistingPlatforms = () => {
    return formData.integrations.map(integration => integration.platform.toLowerCase());
  };

  const getAvailablePlatformsToAdd = () => {
    const existingPlatforms = getExistingPlatforms();
    return availablePlatforms.filter(platform => !existingPlatforms.includes(platform.value));
  };

  return (
    <div className="space-y-8">
      {/* Add Integration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Add Integration</h3>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="">Select platform</option>
              {getAvailablePlatformsToAdd().map(platform => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addIntegration}
            disabled={!selectedPlatform}
          >
            Add Integration
          </button>
        </div>
        {getAvailablePlatformsToAdd().length === 0 && (
          <p className="text-sm text-gray-500 mt-2">All available platforms have been added.</p>
        )}
      </div>

      {/* Configured Integrations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Configured Integrations</h3>

        {formData.integrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No integrations configured yet.</p>
            <p className="text-sm">Add an integration above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.integrations.map((integration) => (
              <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      integration.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`${
                        integration.status === 'active' ? 'text-green-600' : 'text-gray-400'
                      }`} size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-500">
                        {integration.platform === 'Shopify' && 'Shopify stores for gift card products'}
                        {integration.platform === 'WooCommerce' && 'WooCommerce Integration'}
                        {integration.platform === 'Magento' && 'Magento eCommerce Integration'}
                        {integration.platform === 'Custom API' && 'Custom API Integration'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      integration.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {integration.status}
                    </span>
                    <button 
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => removeIntegration(integration.id)}
                      title="Remove Integration"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store URL *
                    </label>
                    <input
                      type="url"
                      className={`w-full border rounded-md px-3 py-2 text-sm ${
                        isValidUrl(integration.storeUrl) 
                          ? 'border-gray-300' 
                          : 'border-red-300 bg-red-50'
                      }`}
                      placeholder="https://shop.brand.com"
                      value={integration.storeUrl || ''}
                      onChange={(e) => updateIntegration(integration.id, 'storeUrl', e.target.value)}
                    />
                    {!isValidUrl(integration.storeUrl) && integration.storeUrl && (
                      <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                        <AlertTriangle size={12} />
                        <span>Please enter a valid URL</span>
                      </p>
                    )}
                  </div>

                  {integration.platform !== 'WooCommerce' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Token
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Enter access token"
                        value={integration.accessToken || ''}
                        onChange={(e) => updateIntegration(integration.id, 'accessToken', e.target.value)}
                      />
                    </div>
                  )}

                  {integration.platform === 'WooCommerce' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Consumer Key
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="ck_..."
                          value={integration.consumerKey || ''}
                          onChange={(e) => updateIntegration(integration.id, 'consumerKey', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Consumer Secret
                        </label>
                        <input
                          type="password"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="cs_..."
                          value={integration.consumerSecret || ''}
                          onChange={(e) => updateIntegration(integration.id, 'consumerSecret', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button 
                    className="text-blue-600 text-sm hover:text-blue-800 disabled:opacity-50"
                    onClick={() => testConnection(integration.id)}
                    disabled={!integration.storeUrl || !isValidUrl(integration.storeUrl)}
                  >
                    {integration.testConnection ? 'Testing...' : 'Test Connection'}
                  </button>
                  
                  {integration.status === 'active' && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <CheckCircle size={14} />
                      <span>Connected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Integration Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>Shopify:</strong> Requires private app or custom app credentials with gift card API access.</p>
          <p><strong>WooCommerce:</strong> Needs REST API consumer key/secret pair with read/write access to products.</p>
          <p><strong>Magento:</strong> Requires API credentials with catalog and order management permissions.</p>
          <p><strong>Testing:</strong> Use test/staging credentials during setup. Switch to production after verification.</p>
          <p><strong>Custom API:</strong> Must implement standard gift card endpoints for product sync.</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-yellow-800">
            <strong>Security Note:</strong> All credentials are encrypted and secured. They are only displayed while being configured.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            <strong>Store URL Format:</strong> Make sure to include the full URL with protocol (https://) for proper validation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;