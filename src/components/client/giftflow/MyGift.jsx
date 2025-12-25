// import React, { useState } from 'react';
// import { Search, Download, ChevronDown, Eye, Gift, Calendar, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

// function MyGift() {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);

//   const tabs = [
//     { id: 'all', label: 'All Gifts' },
//     { id: 'sent', label: 'Sent Gifts' },
//     { id: 'received', label: 'Received Gifts' },
//     { id: 'expired', label: 'Expired Gifts' }
//   ];

//   const giftCards = [
//     {
//       id: 'ORD-2024-001',
//       code: '**** **** ****bcb5',
//       status: 'ACTIVE',
//       user: 'John Smith',
//       email: 'john.smith@email.com',
//       totalAmount: '$5000.00',
//       remaining: '$298.00',
//       spent: 94,
//       lastRedemption: '10/10/2025',
//       expires: '12/31/2025'
//     },
//     {
//       id: 'ORD-2024-001',
//       code: '**** **** ****bcb5',
//       status: 'CLAIMED',
//       user: 'John Smith',
//       email: 'john.smith@email.com',
//       totalAmount: '$5000.00',
//       remaining: '$298.00',
//       spent: 94,
//       lastRedemption: '10/10/2025',
//       expires: '12/31/2025'
//     },
//     {
//       id: 'ORD-2024-001',
//       code: '**** **** ****bcb5',
//       status: 'UNCLAIMED',
//       user: 'John Smith',
//       email: 'john.smith@email.com',
//       totalAmount: '$5000.00',
//       remaining: '$298.00',
//       spent: 94,
//       lastRedemption: 'N/A',
//       expires: '12/31/2025'
//     },
//     {
//       id: 'ORD-2024-001',
//       code: '**** **** ****bcb5',
//       status: 'ACTIVE',
//       user: 'John Smith',
//       email: 'john.smith@email.com',
//       totalAmount: '$5000.00',
//       remaining: '$298.00',
//       spent: 94,
//       lastRedemption: '10/10/2025',
//       expires: '12/31/2025'
//     },
//     {
//       id: 'ORD-2024-001',
//       code: '**** **** ****bcb5',
//       status: 'CLAIMED',
//       user: 'John Smith',
//       email: 'john.smith@email.com',
//       totalAmount: '$5000.00',
//       remaining: '$298.00',
//       spent: 94,
//       lastRedemption: '10/10/2025',
//       expires: '12/31/2025'
//     },
//     {
//       id: 'ORD-2024-001',
//       code: '**** **** ****bcb5',
//       status: 'UNCLAIMED',
//       user: 'John Smith',
//       email: 'john.smith@email.com',
//       totalAmount: '$5000.00',
//       remaining: '$298.00',
//       spent: 94,
//       lastRedemption: 'N/A',
//       expires: '12/31/2025'
//     }
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'ACTIVE':
//         return 'bg-blue-100 text-blue-600 border-[1px] border-[#0F64F633]';
//       case 'CLAIMED':
//         return 'bg-green-100 text-green-600 border-[1px] border-[#22C55E33]';
//       case 'UNCLAIMED':
//         return 'bg-gray-100 text-gray-600 border-[1px] border-[#D1D5DB]';
//       default:
//         return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const getGiftIconColor = (status) => {
//     switch (status) {
//       case 'ACTIVE':
//         return 'from-pink-400 to-orange-400';
//       case 'CLAIMED':
//         return 'from-orange-400 to-red-400';
//       case 'UNCLAIMED':
//         return 'from-orange-400 to-red-500';
//       default:
//         return 'from-pink-400 to-orange-400';
//     }
//   };

//   return (
//     <div className="min-h-screen  py-30 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Tabs */}
//         <div className="flex gap-4 mb-8 bg-[#FEF8F7] p-3 rounded-lg">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`w-[150px]  sm:w-[300px] sm:h-[50px] px-8 py-3 rounded-lg font-medium transition-all ${
//                 activeTab === tab.id
//                   ? 'bg-gradient-to-r from-pink-400 to-orange-400 text-[#FFFFFF] shadow-lg'
//                   : 'bg-white border border-[1px] border-[#1A1A1A1A] rounded-[10px] text-[#000000] hover:bg-gray-100'
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-2">
//             Vouchers & Gift Cards
//           </h1>
//           <p className="text-[#4A4A4A]">
//             Track and purchase all user-purchased vouchers and gift cards.
//           </p>
//         </div>

//         {/* Search and Actions */}
//   <div className="w-full flex items-center mb-8">
//   {/* Search Bar */}
//   <div className="relative w-[619px] h-[40px] border border-[#E5E7EB] rounded-lg flex items-center px-4">
//     <Search className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
//     <input
//       type="text"
//       placeholder="Search by code, user email or status"
//       value={searchQuery}
//       onChange={(e) => setSearchQuery(e.target.value)}
//       className="w-full h-full pl-3 text-sm text-gray-900 placeholder:text-[#9CA3AF] bg-transparent border-none focus:outline-none"
//     />
//   </div>

//   {/* Spacer - બધા elements વચ્ચે auto space માટે */}
//   <div className="flex-1"></div>

//   {/* Select Date Button */}
//   <button className="w-[170px] h-[40px] px-4 bg-white border border-[#4A4A4A] rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors">
//     <span className="text-[#4A4A4A] text-sm font-medium">Select Date</span>
//     <ChevronDown className="w-5 h-5 text-[#4A4A4A] flex-shrink-0" />
//   </button>

//   {/* Export Button */}
//   <button className="ml-4 h-[40px] px-4 bg-white border border-[1px] border-[#FF6B00] rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
//     <Download className="w-4 h-4 text-[#000000]" />
//     <span className="text-[#000000]  text-sm font-medium">Export</span>
//   </button>
// </div>

//         {/* Gift Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           {giftCards.map((card, index) => (
//             <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               {/* Card Header */}
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getGiftIconColor(card.status)} flex items-center justify-center`}>
//                     <Gift className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900">{card.id}</h3>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <img src="/Icon.svg" alt="code icon" className="w-4 h-4" />
//                       <span>{card.code}</span>
//                       <button className="hover:text-gray-700">
//                         <Copy className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
//                   {card.status}
//                 </span>
//               </div>

//               {/* User Info */}
//               <div className="flex items-center gap-2 mb-4 text-sm bg-[#FEF8F7] p-2 rounded-lg">
//                 <div className="w-5 h-5 flex items-center justify-center mb-3">
//                   <img src="/Vector.svg" alt="user" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900 text-[12px]">{card.user}</p>
//                   <p className="text-gray-500 text-[10px]">{card.email}</p>
//                 </div>
//               </div>

//               {/* Amount Info */}
//               <div className="flex justify-between items-center mb-3">
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">TOTAL AMOUNT</p>
//                   <p className="text-lg font-bold text-gray-900">{card.totalAmount}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-xs text-gray-500 mb-1">REMAINING</p>
//                   <p className="text-lg font-bold text-red-500">{card.remaining}</p>
//                 </div>
//               </div>

//               {/* Progress Bar */}
//               <div className="mb-4">
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full"
//                     style={{ width: `${card.spent}%` }}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">{card.spent}% spent</p>
//               </div>

//               {/* Dates */}
//               <div className="flex justify-between text-xs text-gray-500 mb-4">
//                 <div className="flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   <span>LAST REDEMPTION</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   <span>EXPIRES</span>
//                 </div>
//               </div>
//               <div className="flex justify-between text-sm mb-4">
//                 <span className="text-gray-900">{card.lastRedemption}</span>
//                 <span className="text-[#FF6B00] font-medium">{card.expires}</span>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button className="flex-1 py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
//                   <Eye className="w-4 h-4 text-[#4A5565]" />
//                   <span className="text-sm font-medium text-[#4A5565]">View Details</span>
//                 </button>
//                 <button className="flex-1 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all">
//                   <Gift className="w-4 h-4" />
//                   <span className="text-sm font-medium">Redeem</span>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center justify-between border-t border-b border-gray-300 px-4 py-3">
//           <p className="text-sm text-gray-600">Showing 1 of 1 Result</p>
//           <div className="flex items-center gap-2">
//             <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <ChevronLeft className="w-5 h-5 text-gray-600" />
//             </button>
//             <button className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg font-medium">
//               01
//             </button>
//             <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium">
//               02
//             </button>
//             <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium">
//               03
//             </button>
//             <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium">
//               04
//             </button>
//             <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <ChevronRight className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MyGift;

import React, { useState } from 'react';
import { Search, Download, ChevronDown, Eye, Gift, Calendar, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

function MyGift() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { id: 'all', label: 'All Gifts' },
    { id: 'sent', label: 'Sent Gifts' },
    { id: 'received', label: 'Received Gifts' },
    { id: 'expired', label: 'Expired Gifts' }
  ];

  const giftCards = [
    {
      id: 'ORD-2024-001',
      code: '**** **** ****bcb5',
      status: 'ACTIVE',
      user: 'John Smith',
      email: 'john.smith@email.com',
      totalAmount: '$5000.00',
      remaining: '$298.00',
      spent: 94,
      lastRedemption: '10/10/2025',
      expires: '12/31/2025'
    },
    {
      id: 'ORD-2024-001',
      code: '**** **** ****bcb5',
      status: 'CLAIMED',
      user: 'John Smith',
      email: 'john.smith@email.com',
      totalAmount: '$5000.00',
      remaining: '$298.00',
      spent: 94,
      lastRedemption: '10/10/2025',
      expires: '12/31/2025'
    },
    {
      id: 'ORD-2024-001',
      code: '**** **** ****bcb5',
      status: 'UNCLAIMED',
      user: 'John Smith',
      email: 'john.smith@email.com',
      totalAmount: '$5000.00',
      remaining: '$298.00',
      spent: 94,
      lastRedemption: 'N/A',
      expires: '12/31/2025'
    },
    {
      id: 'ORD-2024-001',
      code: '**** **** ****bcb5',
      status: 'ACTIVE',
      user: 'John Smith',
      email: 'john.smith@email.com',
      totalAmount: '$5000.00',
      remaining: '$298.00',
      spent: 94,
      lastRedemption: '10/10/2025',
      expires: '12/31/2025'
    },
    {
      id: 'ORD-2024-001',
      code: '**** **** ****bcb5',
      status: 'CLAIMED',
      user: 'John Smith',
      email: 'john.smith@email.com',
      totalAmount: '$5000.00',
      remaining: '$298.00',
      spent: 94,
      lastRedemption: '10/10/2025',
      expires: '12/31/2025'
    },
    {
      id: 'ORD-2024-001',
      code: '**** **** ****bcb5',
      status: 'UNCLAIMED',
      user: 'John Smith',
      email: 'john.smith@email.com',
      totalAmount: '$5000.00',
      remaining: '$298.00',
      spent: 94,
      lastRedemption: 'N/A',
      expires: '12/31/2025'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-600 border-[1px] border-[#0F64F633]';
      case 'CLAIMED':
        return 'bg-green-100 text-green-600 border-[1px] border-[#22C55E33]';
      case 'UNCLAIMED':
        return 'bg-gray-100 text-gray-600 border-[1px] border-[#D1D5DB]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getGiftIconColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'from-pink-400 to-orange-400';
      case 'CLAIMED':
        return 'from-orange-400 to-red-400';
      case 'UNCLAIMED':
        return 'from-orange-400 to-red-500';
      default:
        return 'from-pink-400 to-orange-400';
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-30 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 mb-8 bg-[#FEF8F7] p-2 mt-5 sm:mt:0 sm:p-3 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[calc(50%-4px)] sm:min-w-0 sm:w-[150px] lg:w-[300px] h-[40px] sm:h-[50px] px-3 sm:px-8 py-2 sm:py-3 rounded-lg text-xs sm:text-base font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-400 to-orange-400 text-[#FFFFFF] shadow-lg'
                  : 'bg-white border border-[1px] border-[#1A1A1A1A] rounded-[10px] text-[#000000] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] mb-2">
            Vouchers & Gift Cards
          </h1>
          <p className="text-sm sm:text-base text-[#4A4A4A]">
            Track and purchase all user-purchased vouchers and gift cards.
          </p>
        </div>

        {/* Search and Actions */}
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 mb-8">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[619px] h-[40px] border border-[#E5E7EB] rounded-lg flex items-center px-4">
            <Search className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by code, user email or status"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-3 text-sm text-gray-900 placeholder:text-[#9CA3AF] bg-transparent border-none focus:outline-none"
            />
          </div>

          {/* Spacer */}
          <div className="hidden sm:block flex-1"></div>

          {/* Buttons Container */}
          <div className="flex gap-3 sm:gap-4">
            {/* Select Date Button */}
            <button className="flex-1 sm:flex-none sm:w-[170px] h-[40px] px-4 bg-white border border-[#4A4A4A] rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="text-[#4A4A4A] text-sm font-medium">Select Date</span>
              <ChevronDown className="w-5 h-5 text-[#4A4A4A] flex-shrink-0" />
            </button>

            {/* Export Button */}
            <button className="flex-1 sm:flex-none h-[40px] px-4 bg-white border border-[1px] border-[#FF6B00] rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 text-[#000000]" />
              <span className="text-[#000000] text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {giftCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${getGiftIconColor(card.status)} flex items-center justify-center`}>
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">{card.id}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6zM2 4v2h6V4H2zm0 4v2h6V8H2zm0 4v2h6v-2H2z"/>
                      </svg>
                      <span className="truncate">{card.code}</span>
                      <button className="hover:text-gray-700 flex-shrink-0">
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(card.status)} whitespace-nowrap`}>
                  {card.status}
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-2 mb-4 text-sm bg-[#FEF8F7] p-2 rounded-lg">
                <div className="w-5 h-5 flex items-center justify-center mb-3 flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 14a6 6 0 0 1 12 0v2H4v-2z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-[11px] sm:text-[12px] truncate">{card.user}</p>
                  <p className="text-gray-500 text-[9px] sm:text-[10px] truncate">{card.email}</p>
                </div>
              </div>

              {/* Amount Info */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">TOTAL AMOUNT</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{card.totalAmount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">REMAINING</p>
                  <p className="text-base sm:text-lg font-bold text-red-500">{card.remaining}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full"
                    style={{ width: `${card.spent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{card.spent}% spent</p>
              </div>

              {/* Dates */}
              <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>LAST REDEMPTION</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>EXPIRES</span>
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm mb-4">
                <span className="text-gray-900">{card.lastRedemption}</span>
                <span className="text-[#FF6B00] font-medium">{card.expires}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button className="flex-1 py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:bg-gray-50 transition-colors">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-[#4A5565]" />
                  <span className="text-xs sm:text-sm font-medium text-[#4A5565]">View Details</span>
                </button>
                <button className="flex-1 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:shadow-lg transition-all">
                  <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Redeem</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-b border-gray-300 px-4 py-3">
          <p className="text-xs sm:text-sm text-gray-600">Showing 1 of 1 Result</p>
          <div className="flex items-center gap-2 overflow-x-auto">
            <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg text-xs sm:text-base font-medium flex-shrink-0">
              01
            </button>
            <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 text-xs sm:text-base font-medium flex-shrink-0">
              02
            </button>
            <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 text-xs sm:text-base font-medium flex-shrink-0">
              03
            </button>
            <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 text-xs sm:text-base font-medium flex-shrink-0">
              04
            </button>
            <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyGift;