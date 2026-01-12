"use client";

import React, { useMemo } from "react";

const SettlementContacts = ({ contacts, error }) => {
  const ContactIcon = useMemo(() => ({ type, className }) => {
    if (type === "email") {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          className={className}
        >
          <path 
            d="M14.6666 4.00033C14.6666 3.26699 14.0666 2.66699 13.3333 2.66699H2.66659C1.93325 2.66699 1.33325 3.26699 1.33325 4.00033V12.0003C1.33325 12.7337 1.93325 13.3337 2.66659 13.3337H13.3333C14.0666 13.3337 14.6666 12.7337 14.6666 12.0003V4.00033ZM13.3333 4.00033L7.99992 7.33366L2.66659 4.00033H13.3333ZM13.3333 12.0003H2.66659V5.33366L7.99992 8.66699L13.3333 5.33366V12.0003Z" 
            fill="currentColor" 
          />
        </svg>
      );
    }
    
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        className={className}
      >
        <path 
          d="M13.3 14C11.9111 14 10.5389 13.6973 9.18333 13.092C7.82778 12.4867 6.59444 11.6282 5.48333 10.5167C4.37222 9.40511 3.514 8.17178 2.90867 6.81667C2.30333 5.46156 2.00044 4.08933 2 2.7C2 2.5 2.06667 2.33333 2.2 2.2C2.33333 2.06667 2.5 2 2.7 2H5.4C5.55556 2 5.69444 2.05289 5.81667 2.15867C5.93889 2.26444 6.01111 2.38933 6.03333 2.53333L6.46667 4.86667C6.48889 5.04444 6.48333 5.19444 6.45 5.31667C6.41667 5.43889 6.35556 5.54444 6.26667 5.63333L4.65 7.26667C4.87222 7.67778 5.136 8.07489 5.44133 8.458C5.74667 8.84111 6.08289 9.21067 6.45 9.56667C6.79444 9.91111 7.15556 10.2307 7.53333 10.5253C7.91111 10.82 8.31111 11.0893 8.73333 11.3333L10.3 9.76667C10.4 9.66667 10.5307 9.59178 10.692 9.542C10.8533 9.49222 11.0116 9.47822 11.1667 9.5L13.4667 9.96667C13.6222 10.0111 13.75 10.0918 13.85 10.2087C13.95 10.3256 14 10.456 14 10.6V13.3C14 13.5 13.9333 13.6667 13.8 13.8C13.6667 13.9333 13.5 14 13.3 14ZM4.01667 6L5.11667 4.9L4.83333 3.33333H3.35C3.40556 3.78889 3.48333 4.23889 3.58333 4.68333C3.68333 5.12778 3.82778 5.56667 4.01667 6ZM9.98333 11.9667C10.4167 12.1556 10.8584 12.3056 11.3087 12.4167C11.7589 12.5278 12.2116 12.6 12.6667 12.6333V11.1667L11.1 10.85L9.98333 11.9667Z" 
          fill="currentColor" 
        />
      </svg>
    );
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-1">Failed to load contacts</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No contacts found</p>
          <p className="text-sm text-gray-500">There are no contacts associated with this settlement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => {
        const initial = contact.name?.charAt(0)?.toUpperCase() || "?";
        
        return (
          <div
            key={contact.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-base font-medium text-white">
                    {initial}
                  </span>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-0.5">
                  {contact.name}
                </h3>
                {contact.role && (
                  <p className="text-sm text-gray-600 mb-3">
                    {contact.role}
                  </p>
                )}
                
                {/* Contact Details */}
                <div className="space-y-1.5">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <ContactIcon type="email" className="flex-shrink-0" />
                      <span className="text-sm truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <ContactIcon type="phone" className="flex-shrink-0" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SettlementContacts;