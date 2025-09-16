import React from 'react';
import { CheckCircle } from 'lucide-react';

const IntegrationsTab = ({ formData, updateFormData, updateIntegration }) => {
  return (
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
};

export default IntegrationsTab;