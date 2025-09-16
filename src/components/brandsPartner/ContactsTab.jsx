import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ContactsTab = ({ formData, updateFormData, updateContact, addContact, removeContact }) => {
  return (
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
};

export default ContactsTab;