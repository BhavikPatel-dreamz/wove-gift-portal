"use client"
import React, { useState } from "react";

const SettlementContacts = ({ contacts }) => {

  console.log(contacts);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.role && contact.role.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header with Search and Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-4">
        <div className="flex grow items-center gap-4">
          <label className="flex w-full max-w-sm flex-col">
            <div className="flex h-10 w-full flex-1 items-stretch rounded-lg">
              <div className="flex items-center justify-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 pl-3 pr-2 text-gray-500">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border border-l-0 border-gray-200 bg-gray-50 p-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-0"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
        </div>
        <button className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#197fe6] px-4 text-sm font-bold text-white hover:bg-[#197fe6]/90">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="truncate">Add New Contact</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3" scope="col">
                <div className="flex items-center gap-1">
                  Contact
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-3" scope="col">
                Role
              </th>
              <th className="px-6 py-3" scope="col">
                Phone
              </th>
              <th className="px-6 py-3" scope="col">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  {searchQuery
                    ? "No contacts found matching your search"
                    : "No contacts available"}
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {contact.name}
                    </div>
                    <div className="text-xs text-gray-500">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {contact.role || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {contact.phone || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {contact.isPrimary && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Primary
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with total count */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredContacts.length}
          </span>{" "}
          {filteredContacts.length === 1 ? "contact" : "contacts"}
          {searchQuery && " (filtered)"}
        </div>
      </div>
    </div>
  );
};

export default SettlementContacts;