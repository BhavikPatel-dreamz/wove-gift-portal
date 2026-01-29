import React from "react";
import { Trash2 } from 'lucide-react';
import GiftSmallIcon from "../../../../icons/GiftSmallIcon";

const GiftDetailsCard = ({
  // Single item mode props
  selectedBrand,
  selectedAmount,
  selectedSubCategory,
  selectedOccasionName,
  personalMessage,
  deliveryMethod,
  deliveryDetails,
  formatAmount,
  isBulkMode,
  quantity,
  companyInfo,
  
  // Cart mode props
  cartItems = null,
  onRemoveItem = null,
  isProcessing = false
}) => {
  const getDeliveryIcon = (method) => {
    return method === 'email' ? '📧' : method === 'whatsapp' ? '💬' : '🖨️';
  };

  const getDeliveryText = (method) => {
    return method === 'email' ? 'Email' : method === 'whatsapp' ? 'WhatsApp' : 'Print';
  };

  const getDeliveryDescription = (method, details) => {
    if (method === 'email') {
      return `to ${details?.recipientEmailAddress || 'Friend'}`;
    } else if (method === 'whatsapp') {
      return 'to Friend';
    } else {
      return 'Print at home';
    }
  };

  // Single Item Card
  const renderSingleItem = (item = null, index = null) => {
    const brand = item?.selectedBrand || selectedBrand;
    const amount = item?.selectedAmount || selectedAmount;
    const subCategory = item?.selectedSubCategory || selectedSubCategory;
    const occasionName = item?.selectedOccasionName || selectedOccasionName;
    const message = item?.personalMessage || personalMessage;
    const delivery = item?.deliveryMethod || deliveryMethod;
    const details = item?.deliveryDetails || deliveryDetails;
    
    return (
      <div className={cartItems ? "mb-4" : ""}>
        {/* Brand Display */}
        <div className="flex flex-col md:flex-row items-center gap-4 rounded-xl mb-4">
          <div className="flex gap-4 items-center flex-1">
            <div className="w-16 h-16 shrink-0">
              {brand?.logo ? (
                <img src={brand.logo} alt={brand.brandName} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{(brand?.brandName || 'B').substring(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="flex items-center gap-2 font-['Poppins'] text-[16px] font-semibold leading-[22px] text-[#1A1A1A]">
                <span className=" text-wrap">
                  {brand?.brandName || 'Gift Card'}
                </span>
              </h3>
              <div className="flex w-fit p-2 items-center justify-center gap-1 rounded-[50px] bg-[#F4F4F4]">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M10.9994 11.9834V20.4874L7.42409 18.8483L6.94887 18.6308L5.09936 17.7832L4.99592 17.7356L1.95801 16.3425V7.82666L5.09936 9.27065L7.42409 10.3398L10.9994 11.9834Z" fill="#ED457D" />
                  <path d="M20.0414 7.82666V16.3425L17.3652 17.5729L16.691 17.883L15.4122 18.4708L14.3663 18.9521L11 20.4999V11.9834L14.3663 10.4356L16.691 9.36718L20.0414 7.82666Z" fill="#FF81AB" />
                  <path d="M7.42434 10.3399V18.8484L6.94912 18.6309L5.09961 17.7833V9.27075L7.42434 10.3399Z" fill="#FFF380" />
                  <path d="M16.6929 9.36731V17.8832L15.4141 18.4709L14.3682 18.9523V10.4358L16.6929 9.36731Z" fill="#FFF380" />
                  <path d="M20.5 5.88745V8.45675L17.1091 10.0158L14.7837 11.0849L11 12.8244L7.00731 10.989L4.68186 9.91992L1.5 8.45675V5.88745L4.68186 7.34996L7.00731 8.41907L11 10.2545L14.7837 8.51494L17.1091 7.44649L20.5 5.88745Z" fill="#FF8A0E" />
                  <path d="M20.5 5.88685L11 10.2545L1.5 5.88685L11 1.5L20.5 5.88685Z" fill="#FFB465" />
                  <path d="M7.00807 8.41921V10.9892L4.68262 9.92006V7.3501L7.00807 8.41921Z" fill="#FFEA26" />
                  <path d="M17.1087 7.44653V10.0158L14.7832 11.0849V8.51498L17.1087 7.44653Z" fill="#FFEA26" />
                  <path d="M4.68262 7.35008L10.9287 4.85217L13.2303 5.91467L7.00807 8.41919L4.68262 7.35008Z" fill="#FFF8B5" />
                  <path d="M17.3143 7.34996L11.5682 4.60205L9.2666 5.66455L14.9888 8.41907L17.3143 7.34996Z" fill="#FFF8B5" />
                  <path d="M11.0001 5.36987C11.0001 5.36987 9.85292 6.38741 9.19687 8.68828L8.61316 7.88231L7.67285 8.67572C7.67285 8.67572 7.67285 6.62609 9.91512 5.36987H11.0001Z" fill="#B3610A" />
                  <path d="M11.0723 5.36987C11.0723 5.36987 12.2194 6.38741 12.8755 8.68828L13.4592 7.88231L14.3995 8.67572C14.3995 8.67572 14.3995 6.62609 12.1572 5.36987H11.0723Z" fill="#B3610A" />
                  <path d="M10.6383 4.7086V5.43588C8.46833 6.09705 6.94938 5.83258 6.37073 5.1053C6.21955 4.9162 6.08429 4.66827 5.9946 4.40314C5.74072 3.65007 5.86368 2.75683 7.09404 2.65897C8.75766 2.52674 10.6383 4.7086 10.6383 4.7086Z" fill="#B3610A" />
                  <path d="M10.6407 5.43393V5.43591C8.4708 6.09708 6.95184 5.83261 6.37319 5.10533C6.22202 4.91623 6.08676 4.66829 5.99707 4.40317C6.17501 4.14399 6.49833 3.95688 7.02418 3.91522C8.1945 3.822 9.79519 4.82896 10.6407 5.43393Z" fill="#7B4001" />
                  <path d="M11.3623 4.7086V5.43588C13.5322 6.09705 15.0512 5.83258 15.6299 5.1053C15.781 4.9162 15.9163 4.66827 16.006 4.40314C16.2599 3.65007 16.1369 2.75683 14.9065 2.65897C13.2429 2.52674 11.3623 4.7086 11.3623 4.7086Z" fill="#B3610A" />
                  <path d="M11.3623 5.43393V5.43591C13.5322 6.09708 15.0512 5.83261 15.6299 5.10533C15.781 4.91623 15.9163 4.66829 16.006 4.40317C15.828 4.14399 15.5047 3.95688 14.9789 3.91522C13.8086 3.822 12.2079 4.82896 11.3623 5.43393Z" fill="#7B4001" />
                  <path d="M10.5659 5.43589C10.5659 5.43589 10.2766 4.51025 10.9999 4.51025C11.7232 4.51025 11.4339 5.43589 11.4339 5.43589C11.4339 5.43589 11.0723 5.76647 10.5659 5.43589Z" fill="#FF8A0E" />
                </svg>
                <p className="my-1 font-['Poppins'] text-[14px] font-semibold leading-[18px] text-[#1A1A1A]">
                  {formatAmount(amount)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 items-center flex-1">
            <div className="w-16 h-16 ">
              {subCategory?.image ? (
                <img src={subCategory?.image} alt={subCategory?.name} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{(subCategory?.name || 'B').substring(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{subCategory?.name || 'Gift Card'}</h3>
              <p className="text-sm text-gray-600">{occasionName || 'Gift'}</p>
            </div>
          </div>

          {/* Delete button for cart mode */}
          {cartItems && onRemoveItem && index !== null && (
            <button
              onClick={() => onRemoveItem(index)}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
              disabled={isProcessing}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Personal Message */}
        <div className="border-b border-[#1A1A1A1A] mb-5">
          {message && (
            <div className="p-4 mb-4 rounded-[10px] border border-dashed border-[#A4A4A4] bg-[#F6F6F6]">
              <p className="text-sm font-medium italic leading-[24px] text-[#4A4A4A] font-['Inter']">
                "{message}"</p>
            </div>
          )}
        </div>

        {/* Delivery Info */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#39AE41] rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <g clipPath="url(#clip0_748_2009)">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.0484 9.96167C10.7108 10.0996 10.4952 10.6281 10.2764 10.8982C10.1642 11.0365 10.0304 11.0581 9.85794 10.9887C8.59083 10.4839 7.6195 9.63836 6.92027 8.47228C6.80182 8.29146 6.82307 8.14862 6.96591 7.98069C7.17704 7.73194 7.44252 7.44939 7.49965 7.11423C7.62647 6.37285 6.65724 4.07309 5.37723 5.11514C1.694 8.11657 11.5215 16.077 13.2952 11.7716C13.7969 10.5512 11.6079 9.73242 11.0484 9.96167ZM8.91902 16.2798C7.61637 16.2798 6.33462 15.9335 5.21244 15.2778C5.03232 15.1723 4.81457 15.1444 4.6132 15.1991L2.17478 15.8684L3.02417 13.9971C3.08098 13.8722 3.10375 13.7345 3.09016 13.5979C3.07658 13.4613 3.02713 13.3308 2.94683 13.2195C2.03821 11.9601 1.55777 10.4731 1.55777 8.91892C1.55777 4.85977 4.85986 1.55768 8.91902 1.55768C12.9782 1.55768 16.2799 4.85977 16.2799 8.91892C16.2799 12.9777 12.9778 16.2798 8.91902 16.2798ZM8.91902 0C4.00107 0 9.77229e-05 4.00097 9.77229e-05 8.91892C9.77229e-05 10.6491 0.491335 12.3105 1.42469 13.7526L0.0697768 16.7366C0.0085519 16.8713 -0.0130189 17.0208 0.00758848 17.1674C0.0281959 17.314 0.0901292 17.4517 0.186141 17.5643C0.259367 17.6501 0.350288 17.7189 0.452649 17.7661C0.555011 17.8133 0.666385 17.8378 0.77911 17.8378C1.2815 17.8378 4.02093 16.977 4.71807 16.7857C6.00678 17.4752 7.45227 17.8378 8.91902 17.8378C13.8366 17.8378 17.8379 13.8365 17.8379 8.91892C17.8379 4.00097 13.8366 0 8.91902 0Z" fill="white" />
              </g>
              <defs>
                <clipPath id="clip0_748_2009">
                  <rect width="17.8378" height="17.8378" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div>
            <p className="text-[#1A1A1A] font-['Poppins'] text-sm font-medium leading-[16px]">
              Delivering via
              <span className="text-[#39AE41] font-['Poppins'] mx-1 text-sm font-medium leading-[16px]">
                {getDeliveryText(delivery)}
              </span>
              {getDeliveryDescription(delivery, details)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
<div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
  {/* Header */}
  <div className="flex items-start sm:items-center gap-3 sm:gap-4 pb-4 mb-4 border-b border-[#1A1A1A1A]">
    {/* Icon */}
    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[linear-gradient(180deg,#FEF8F6_0%,#FDF7F8_100%)] rounded-lg flex items-center justify-center shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 35 35"
        fill="none"
        className="sm:w-[35px] sm:h-[35px]"
      >
        <path
          d="M5.62 29.9565C5.62 30.5337 6.10263 31 6.7 31H16.3525V18.7391H5.62V29.9565ZM18.6475 31H28.3C28.8974 31 29.38 30.5337 29.38 29.9565V18.7391H18.6475V31ZM29.92 10.913H24.9385C25.3975 10.2152 25.6675 9.38696 25.6675 8.5C25.6675 6.01848 23.5784 4 21.01 4C19.6128 4 18.3539 4.6 17.5 5.54565C16.6461 4.6 15.3873 4 13.99 4C11.4216 4 9.3325 6.01848 9.3325 8.5C9.3325 9.38696 9.59913 10.2152 10.0615 10.913H5.08C4.48263 10.913 4 11.3793 4 11.9565V16.5217H16.3525V10.913H18.6475V16.5217H31V11.9565C31 11.3793 30.5174 10.913 29.92 10.913Z"
          fill="url(#paint0_linear)"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="4"
            y1="13.934"
            x2="29.7008"
            y2="25.4087"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ED457D" />
            <stop offset="1" stopColor="#FA8F42" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    {/* Text */}
    <div className="flex-1">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
        {cartItems
          ? `Your Gift Cards (${cartItems.length})`
          : 'Your Beautiful Gift'}
      </h2>
      <p className="text-xs sm:text-sm text-gray-600">
        Ready to make someone smile
      </p>
    </div>
  </div>

  {/* Items */}
  {cartItems ? (
    <div className="space-y-4 sm:space-y-6">
      {cartItems.map((item, index) => (
        <div key={index}>
          {renderSingleItem(item, index)}

          {/* Divider */}
          {index < cartItems.length - 1 && (
            <div className="border-t border-gray-200 mt-4 sm:mt-6" />
          )}
        </div>
      ))}
    </div>
  ) : (
    renderSingleItem()
  )}
</div>

  );
};

export default GiftDetailsCard;