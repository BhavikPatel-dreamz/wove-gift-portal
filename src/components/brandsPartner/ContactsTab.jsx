import React, { useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ContactsTab = ({ formData, updateFormData, updateContact, addContact, removeContact }) => {
  const lastContactRef = useRef(null);
  const prevContactsLength = useRef(formData.contacts.length);

  useEffect(() => {
    if (formData.contacts.length > prevContactsLength.current) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        lastContactRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' // Changed to 'center' for better visibility
        });
        // Optional: Flash effect to draw attention
        if (lastContactRef.current) {
          lastContactRef.current.style.animation = 'highlight 1s ease-in-out';
        }
      }, 100);
    }
    prevContactsLength.current = formData.contacts.length;
  }, [formData.contacts.length]);

  const handleAddContact = () => {
    addContact();
  };

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes highlight {
          0%, 100% { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
          50% { box-shadow: 0 0 0 3px rgba(23, 94, 253, 0.3); }
        }
      `}</style>

      {/* Brand Contacts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-inter text-[16px] font-semibold leading-normal capitalize text-[#4A4A4A]">Brand Contacts</h3>
          <button
            onClick={handleAddContact}
            className="bg-[#175EFD] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.contacts.map((contact, index) => (
            <div
              key={contact.id}
              ref={index === formData.contacts.length - 1 ? lastContactRef : null}
              className="border border-gray-200 rounded-lg p-4 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h4 className="font-inter text-[14px] font-semibold capitalize text-[#4A4A4A]">Contact {index + 1}</h4>
                  {contact.isPrimary && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Primary</span>
                  )}
                </div>
                {formData.contacts.length > 1 && (
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-inter text-[14px] font-semibold capitalize text-[#4A4A4A] mb-1">Name *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:border-[#175EFD] focus:ring-1 focus:ring-[#175EFD] outline-none transition-colors"
                    placeholder="Contact name"
                    value={contact.name}
                    onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-inter text-[14px] font-semibold capitalize text-[#4A4A4A] mb-1">Role</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:border-[#175EFD] focus:ring-1 focus:ring-[#175EFD] outline-none transition-colors"
                    placeholder="Job title/role"
                    value={contact.role}
                    onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-inter text-[14px] font-semibold capitalize text-[#4A4A4A] mb-1">Email *</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:border-[#175EFD] focus:ring-1 focus:ring-[#175EFD] outline-none transition-colors"
                    placeholder="contact@brand.com"
                    value={contact.email}
                    onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-inter text-[14px] font-semibold capitalize text-[#4A4A4A] mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-inter text-xs font-semibold leading-5 text-[#4A4A4A] focus:border-[#175EFD] focus:ring-1 focus:ring-[#175EFD] outline-none transition-colors"
                    placeholder="+1 555 000 0000"
                    value={contact.phone}
                    onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="mb-4 font-inter text-[16px] font-semibold capitalize text-[#4A4A4A] leading-normal">
          Internal Notes</h3>
        <div>
          <label className="block font-inter text-[12px] font-semibold capitalize text-[#A5A5A5] mb-2">Internal Notes</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 font-inter text-xs font-medium leading-5 text-[#4A4A4A] focus:border-[#175EFD] focus:ring-1 focus:ring-[#175EFD] outline-none transition-colors"
            placeholder="Internal notes about this brand partner (not visible to partners)"
            value={formData.internalNotes}
            onChange={(e) => updateFormData('internalNotes', e.target.value)}
          />
         <p className="mt-2 font-inter text-[12px] font-semibold capitalize leading-normal text-[#A5A5A5]">These notes are for internal use only and will not be shared with the brand partner.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactsTab;