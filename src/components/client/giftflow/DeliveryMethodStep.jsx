import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MessageCircle, Mail, Download, User, X, Phone } from "lucide-react";
import { goBack, goNext, setDeliveryMethod, setDeliveryDetails, updateDeliveryDetail } from "../../../redux/giftFlowSlice";
// import ProgressIndicator from "./ProgressIndicator";
import Image from "next/image";
import MailIcons from "../../../icons/MailIcon";
import WhatsupIcon from '../../../icons/WhatsupIcon';
import PrinterIcon from '../../../icons/PrinterIcon';
import EditIcon from '../../../icons/EditIcon'
import PrinterColorIcon from '../../../icons/PrinterColorIcon'

const DeliveryMethodStep = () => {
  const dispatch = useDispatch();

  const {
    deliveryMethod,
    deliveryDetails,
    selectedAmount,
    personalMessage,
    selectedSubCategory,
    selectedBrand
  } = useSelector((state) => state.giftFlowReducer);

  const [selectedMethod, setSelectedMethod] = useState(deliveryMethod || null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // WhatsApp fields
    yourName: deliveryDetails.yourName || '',
    yourCountryCode: deliveryDetails.yourCountryCode || '+91',
    yourWhatsAppNumber: deliveryDetails.yourWhatsAppNumber || '',
    recipientName: deliveryDetails.recipientName || '',
    recipientCountryCode: deliveryDetails.recipientCountryCode || '+91',
    recipientWhatsAppNumber: deliveryDetails.recipientWhatsAppNumber || '',

    // Email fields
    yourFullName: deliveryDetails.yourFullName || '',
    yourEmailAddress: deliveryDetails.yourEmailAddress || '',
    recipientFullName: deliveryDetails.recipientFullName || '',
    recipientEmailAddress: deliveryDetails.recipientEmailAddress || '',
    yourPhoneNumber: deliveryDetails.yourPhoneNumber || '',
    yourPhoneCountryCode: deliveryDetails.yourPhoneCountryCode || '+91',

    // Print fields
    printDetails: deliveryDetails.printDetails || {}
  });

  const countryCodes = [
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+61', country: 'Australia' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+27', country: 'South Africa' },
    { code: '+55', country: 'Brazil' },
  ];

  const deliveryMethods = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: WhatsupIcon,
      description: 'Send directly to their WhatsApp',
      color: 'bg-[#39AE41]',
      bgColor: 'bg-[#F4FFF5]'
    },
    {
      id: 'email',
      name: 'Email',
      icon: MailIcons,
      description: 'Classic email delivery',
      color: 'bg-[#F57A38]',
      bgColor: 'bg-[#FFF5EF]'
    },
    {
      id: 'print',
      name: 'Print It Yourself',
      icon: PrinterIcon,
      description: 'Download beautiful PDF to print',
      color: 'bg-[#3874F5]',
      bgColor: 'bg-[#F8FAFF]'
    }
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10,}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateWhatsAppForm = () => {
    const newErrors = {};

    if (!formData.yourName.trim()) {
      newErrors.yourName = 'Your name is required';
    }
    if (!formData.yourWhatsAppNumber.trim()) {
      newErrors.yourWhatsAppNumber = 'Your WhatsApp number is required';
    } else if (!validatePhoneNumber(formData.yourWhatsAppNumber)) {
      newErrors.yourWhatsAppNumber = 'Please enter a valid phone number (minimum 10 digits)';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    if (!formData.recipientWhatsAppNumber.trim()) {
      newErrors.recipientWhatsAppNumber = 'Recipient WhatsApp number is required';
    } else if (!validatePhoneNumber(formData.recipientWhatsAppNumber)) {
      newErrors.recipientWhatsAppNumber = 'Please enter a valid phone number (minimum 10 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailForm = () => {
    const newErrors = {};

    if (!formData.yourFullName.trim()) {
      newErrors.yourFullName = 'Your full name is required';
    }
    if (!formData.yourEmailAddress.trim()) {
      newErrors.yourEmailAddress = 'Your email is required';
    } else if (!validateEmail(formData.yourEmailAddress)) {
      newErrors.yourEmailAddress = 'Please enter a valid email address';
    }

    if (formData.yourPhoneNumber.trim() && !validatePhoneNumber(formData.yourPhoneNumber)) {
      newErrors.yourPhoneNumber = 'Please enter a valid phone number (minimum 10 digits)';
    }

    if (!formData.recipientFullName.trim()) {
      newErrors.recipientFullName = 'Recipient name is required';
    }
    if (!formData.recipientEmailAddress.trim()) {
      newErrors.recipientEmailAddress = 'Recipient email is required';
    } else if (!validateEmail(formData.recipientEmailAddress)) {
      newErrors.recipientEmailAddress = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setShowModal(true);
    setErrors({});
    dispatch(setDeliveryMethod(method));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    dispatch(updateDeliveryDetail({ field, value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleContinue = () => {
    let isValid = false;

    if (selectedMethod === 'whatsapp') {
      isValid = validateWhatsAppForm();
    } else if (selectedMethod === 'email') {
      isValid = validateEmailForm();
    } else if (selectedMethod === 'print') {
      isValid = true;
    }

    if (isValid) {
      dispatch(setDeliveryDetails(formData));
      dispatch(goNext());
    }
  };

  const handleBack = () => {
    dispatch(goBack());
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const renderMethodCard = (method) => (
    <div
      key={method.id}
      onClick={() => handleMethodChange(method.id)}
      className={`relative p-8 rounded-2xl border-2 border-[#1A1A1A1A] cursor-pointer transition-all duration-200 ${selectedMethod === method.id
        ? `${method.bgColor}`
        : `${method.bgColor} hover:border-gray-300 hover:shadow-md`
        }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-[74px] h-[74px] ${method.color} rounded-2xl flex items-center justify-center mb-4`}>
          <method.icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">{method.name}</h3>
        <p className="text-[16px] text-[#4A4A4A]">{method.description}</p>
      </div>
    </div>
  );

  const renderInputError = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.364 5.364l-12.728 12.728a1 1 0 01-1.414 0l-5.656-5.656a1 1 0 011.414-1.414L5.5 16.086 16.95 4.636a1 1 0 011.414 1.414z" clipRule="evenodd" />
          </svg>
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  const renderWhatsAppForm = () => (
    <div className="text-black">
      <div className="text-center pt-8 pb-4 px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Details</h2>
        <p className="text-gray-600 text-sm">
          We'll send the gift card directly to their WhatsApp<br />
          with your personal message.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 pb-8">
        {/* Left Side - Form */}
        <div className="space-y-6">
          {/* Your Details Section */}
          <div className="rounded-2xl border border-gray-200">
            <div className="bg-green-50 flex items-start mb-4 border-b border-[#39AE41] p-4">
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-xl"></div>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.0003 4.66669C15.238 4.66669 16.425 5.15835 17.3002 6.03352C18.1753 6.90869 18.667 8.09568 18.667 9.33335C18.667 10.571 18.1753 11.758 17.3002 12.6332C16.425 13.5084 15.238 14 14.0003 14C12.7626 14 11.5757 13.5084 10.7005 12.6332C9.82532 11.758 9.33366 10.571 9.33366 9.33335C9.33366 8.09568 9.82532 6.90869 10.7005 6.03352C11.5757 5.15835 12.7626 4.66669 14.0003 4.66669ZM14.0003 16.3334C19.157 16.3334 23.3337 18.4217 23.3337 21V23.3334H4.66699V21C4.66699 18.4217 8.84366 16.3334 14.0003 16.3334Z" fill="#39AE41" />
                </svg>

              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Details</h3>
                <p className="text-sm text-gray-600">Enter your information for the gift receipt</p>
              </div>
            </div>

            <div className="space-y-4 m-6">
              <div>
                <input
                  type="text"
                  value={formData.yourName}
                  onChange={(e) => handleInputChange('yourName', e.target.value)}
                  placeholder="Your Full Name*"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                    }`}
                />
                {renderInputError('yourName')}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Your WhatsApp Number*</label>
                <div className="flex gap-2">
                  {/* <select
                    value={formData.yourCountryCode}
                    onChange={(e) => handleInputChange('yourCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select> */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.yourWhatsAppNumber}
                      onChange={(e) => handleInputChange('yourWhatsAppNumber', e.target.value)}
                      placeholder="Your WhatsApp No*"
                      className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourWhatsAppNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                        }`}
                    />
                  </div>
                </div>
                {renderInputError('yourWhatsAppNumber')}
              </div>
            </div>
          </div>

          {/* Recipient Details Section */}
          <div className="rounded-2xl border border-gray-200">
            <div className="bg-green-50 flex items-start mb-4 border-b border-[#39AE41] p-4">
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-xl"></div>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 6.83619C4 6.08399 4.29716 5.36259 4.82611 4.8307C5.35506 4.29881 6.07247 4 6.82051 4H21.1795C21.9275 4 22.6449 4.29881 23.1739 4.8307C23.7028 5.36259 24 6.08399 24 6.83619V17.1496C24 17.9018 23.7028 18.6232 23.1739 19.1551C22.6449 19.687 21.9275 19.9858 21.1795 19.9858H9.85744C9.46769 19.9858 9.09949 20.1642 8.85641 20.4706L6.46667 23.4749C5.64821 24.5021 4 23.9214 4 22.6054V6.83619Z" fill="#39AE41" />
                </svg>

              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
                <p className="text-sm text-gray-600">Who are you sending this gift to?</p>
              </div>
            </div>

            <div className="space-y-4 m-6">
              <div>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="Recipient's Name*"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                    }`}
                />
                {renderInputError('recipientName')}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Recipient's WhatsApp Number*</label>
                <div className="flex gap-2">
                  {/* <select
                    value={formData.recipientCountryCode}
                    onChange={(e) => handleInputChange('recipientCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select> */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.recipientWhatsAppNumber}
                      onChange={(e) => handleInputChange('recipientWhatsAppNumber', e.target.value)}
                      placeholder="Your WhatsApp No.*"
                      className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientWhatsAppNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                        }`}
                    />
                  </div>
                </div>
                {renderInputError('recipientWhatsAppNumber')}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - WhatsApp Phone Preview */}
        <div className="flex items-center justify-center relative">
          {/* Decorative Circle Background */}
          <div className="absolute w-[500px] h-[420px] bg-linear-to-br from-green-100 to-green-200 rounded-full opacity-60 -z-10"></div>

          <div className="relative z-10">
            <div className="w-[280px] h-[560px] bg-black rounded-[3rem] p-2.5 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                {/* Phone Status Bar */}
                <div className="bg-white px-3 py-2.5 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center flex-1">
                    <ArrowLeft className="w-5 h-5 text-gray-700 mr-2" />
                    <div className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Friend</div>
                      <div className="text-xs text-gray-500 truncate">Tap here for contact info</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 bg-linear-to-b from-green-50 to-green-100 p-3 overflow-y-auto">
                  <div className="flex justify-start mb-3">
                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-md p-3.5 max-w-[90%]">
                      <div className="rounded-xl mb-3 text-center">
                        <Image
                          src={selectedSubCategory?.image}
                          width={500}
                          height={500}
                          alt="Occation category"
                        />
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-900">Friend Sent you a gift card</p>
                        <p className="text-sm font-bold text-red-500">{selectedAmount.currency + " " + selectedAmount.value}</p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          "{personalMessage}"
                        </p>
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-900">Gift Code</p>
                          <p className="text-xs text-gray-700 leading-relaxed">XXXX XXXX XXXX</p>
                        </div>
                      </div>

                      <div className="w-[95%] mx-auto h-px bg-[#1A1A1A33] my-1"></div>

                      <button
                        className="w-full text-[#39AE41] text-xs py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                        onClick={() => {
                          const url =
                            selectedBrand?.website ||
                            selectedBrand?.domain ||
                            `https://${selectedBrand?.slug}.myshopify.com`;

                          // Ensure it has https:// prefix
                          const fullUrl = url.startsWith("http") ? url : `https://${url}`;
                          window.open(fullUrl, "_blank");
                        }}
                      >
                        Claim Gift →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="bg-white border-t border-gray-200 px-2.5 py-2 flex items-center gap-2">
                  <button className="text-gray-400 w-7 h-7 flex items-center justify-center">
                    <span className="text-xl leading-none">+</span>
                  </button>
                  <div className="flex-1 bg-gray-100 rounded-full px-3 py-2">
                    <span className="text-xs text-gray-400">Message</span>
                  </div>
                  <button className="text-gray-400 w-7 h-7 flex items-center justify-center text-base">📷</button>
                  <button className="text-gray-400 w-7 h-7 flex items-center justify-center text-base">🎤</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailForm = () => (
    <div className="text-black">

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-2 pb-8">
        <div>
          <div className="text-left pt-8 pb-4 px-2">
            <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">Email Details</h2>
          </div>
          {/* Left Side - Form */}
          <div className="space-y-6">
            {/* Your Information Section */}
            <div className="rounded-2xl border border-gray-200">
              <div className="flex items-center mb-4  border-b border-gray-200 p-4">
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                  <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.0003 4.66669C15.238 4.66669 16.425 5.15835 17.3002 6.03352C18.1753 6.90869 18.667 8.09568 18.667 9.33335C18.667 10.571 18.1753 11.758 17.3002 12.6332C16.425 13.5084 15.238 14 14.0003 14C12.7626 14 11.5757 13.5084 10.7005 12.6332C9.82532 11.758 9.33366 10.571 9.33366 9.33335C9.33366 8.09568 9.82532 6.90869 10.7005 6.03352C11.5757 5.15835 12.7626 4.66669 14.0003 4.66669ZM14.0003 16.3334C19.157 16.3334 23.3337 18.4217 23.3337 21V23.3334H4.66699V21C4.66699 18.4217 8.84366 16.3334 14.0003 16.3334Z" fill="#398FAE" />
                  </svg>

                </div>

                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-gray-900 ">Your Information</h3>
                </div>
              </div>

              <div className="space-y-4 m-6">
                <div>
                  <input
                    type="text"
                    value={formData.yourFullName}
                    onChange={(e) => handleInputChange('yourFullName', e.target.value)}
                    placeholder="Your Full Name*"
                    className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourFullName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                      }`}
                  />
                  {renderInputError('yourFullName')}
                </div>

                <div>
                  <input
                    type="email"
                    value={formData.yourEmailAddress}
                    onChange={(e) => handleInputChange('yourEmailAddress', e.target.value)}
                    placeholder="Your Email Address*"
                    className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourEmailAddress ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                      }`}
                  />
                  {renderInputError('yourEmailAddress')}
                </div>

                <div>
                  {/* <label className="text-xs font-semibold text-gray-600 block mb-2">Your Phone Number (Optional)</label> */}
                  <div className="flex gap-2">
                    {/* <select
                    value={formData.yourPhoneCountryCode}
                    onChange={(e) => handleInputChange('yourPhoneCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select> */}
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={formData.yourPhoneNumber}
                        onChange={(e) => handleInputChange('yourPhoneNumber', e.target.value)}
                        placeholder="Your Phone Number"
                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourPhoneNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                          }`}
                      />
                    </div>
                  </div>
                  {renderInputError('yourPhoneNumber')}
                </div>
              </div>
            </div>

            {/* Recipient Details Section */}
            <div className="rounded-2xl border border-gray-200">
              <div className="flex items-center border-b border-gray-200 mb-4 p-4">
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                  <Mail className="relative w-6 h-6 text-[#398FAE]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
                </div>
              </div>

              <div className="space-y-4 m-6">
                <div>
                  <input
                    type="text"
                    value={formData.recipientFullName}
                    onChange={(e) => handleInputChange('recipientFullName', e.target.value)}
                    placeholder="Recipient's Name*"
                    className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientFullName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                      }`}
                  />
                  {renderInputError('recipientFullName')}
                </div>

                <div>
                  <input
                    type="email"
                    value={formData.recipientEmailAddress}
                    onChange={(e) => handleInputChange('recipientEmailAddress', e.target.value)}
                    placeholder="Email Address*"
                    className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientEmailAddress ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                      }`}
                  />
                  {renderInputError('recipientEmailAddress')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Email Preview */}
        <div className="">
          {/* Decorative Circle Background */}
          <div className="absolute w-[420px] h-[420px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-60 -z-10"></div>

          <div className="relative z-10 w-full">
            {/* Email Preview Card */}
            <div className="flex items-center justify-between text-left pt-8 pb-4 px-2">
              <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">Preview</h2>

            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 ">

              {/* Email Subject */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  <p className="text-sm font-semibold text-gray-900">Wishing you Happy Birthday!!!</p>
                </div>
              </div>

              {/* Email From Section */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">D</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">Friend</p>
                    <p className="text-xs text-gray-600">&lt;hello@friend.com&gt;</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">12:30 PM (40 minutes ago)</span>
                </div>
              </div>
              {/* Email Content */}
              <div className="px-12 bg-[#F8F8F8]">
                {/* Header */}
                <div className=" rounded-xl text-center ">
                  <div className="bg-[linear-gradient(114.06deg,rgba(237,69,125,0.1)_11.36%,rgba(250,143,66,0.1)_90.28%)] p-4 ">
                    <p className="text-base font-semibold text-gray-900 ">You have received a Gift card!</p>
                  </div>

                  {/* Greeting */}
                  <div className="px-16 bg-white pb-3.5">
                    <div className="text-left p-4">
                      <p className="text-[10px] text-gray-700 mb-1">
                        hi {formData.recipientFullName || 'jane'},
                      </p>
                      <p className="text-[10px] text-gray-700">
                        Congratulations, you've received gift card from {formData.yourFullName || 'friend'}.
                      </p>
                    </div>

                    {/* Personal Message */}
                    {personalMessage && (
                      <div className="p-3 mb-6 text-left border-l-2 border-[#DEDEDE] relative">
                        <div className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer">
                          <EditIcon />
                        </div>
                        <p className="text-[11.18px] text-[#1A1A1A] font-medium">
                          "{personalMessage}"
                        </p>
                      </div>
                    )}

                    {/* Gift Card Display */}
                    <div className="flex items-stretch gap-3 mb-6">
                      {/* Gift Card Image */}
                      <div className="w-36 h-36 rounded-xl overflow-hidden bg-cyan-400 flex-shrink-0 relative shadow-md">
                        <div className="absolute top-1 -right-4 z-10 cursor-pointer">
                          <EditIcon />
                        </div>
                        <Image
                          src={selectedSubCategory?.image}
                          width={144}
                          height={144}
                          alt="Gift card"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Gift Card Details */}
                      <div className="flex-1 text-left bg-white rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-bold text-gray-900">
                                <svg width="41" height="27" viewBox="0 0 41 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M38.1332 0.687125C37.4618 1.00076 36.9248 0.687125 36.0744 2.38971C33.4786 7.7663 31.4646 12.1124 29.0478 18.3403C29.1373 13.1877 30.0324 9.11045 30.5695 4.0923C30.659 3.15139 30.7933 1.89686 30.7933 0.955954C30.7933 0.239075 30.0324 0.104661 28.5555 0.866344C27.7499 1.26959 26.7653 1.22478 26.3625 2.21049C24.7513 6.37735 21.0365 17.937 19.3358 24.4785C18.933 26.0467 20.4547 26.3155 20.947 24.7025C22.0659 20.8045 24.6617 12.1572 26.2282 7.72149C26.0939 11.7987 24.975 18.2058 25.4673 21.611C25.6464 22.6863 26.631 23.1344 27.1233 24.0305C27.4813 24.6577 28.0632 24.7474 28.3765 23.8513C29.8981 19.7292 32.8073 12.4708 35.6269 6.69098C35.0898 9.24486 32.9415 20.0876 32.3597 24.4337C32.2254 25.285 33.2996 25.3298 34.2394 26.6292C34.4632 26.9428 35.2688 27.2564 35.4031 26.4947C35.8954 23.8961 39.2073 7.04942 40.4605 1.71764C40.8633 0.194271 40.7738 -0.522608 38.1332 0.687125ZM16.6057 12.9189C17.7246 11.2163 18.0827 11.5747 18.3512 11.0371C18.7092 10.4098 18.4855 9.78252 17.2323 9.91693C17.2323 9.91693 16.7848 9.96174 15.9344 10.0513C17.2771 6.60137 18.4407 3.64425 19.2911 1.44881C19.6044 0.687124 19.6491 0.149466 19.1568 0.0150511C18.6645 -0.119364 17.2323 0.687124 16.3372 0.821539C16.0687 0.911149 15.7554 1.17998 15.6659 1.404C14.3232 4.45074 13.07 7.54227 11.8616 10.6786C10.4295 10.9026 8.7735 11.2163 6.93852 11.6643C8.28119 8.25915 9.62386 4.89878 10.9218 1.67283C11.5483 0.104661 9.89239 -0.0745586 9.22106 1.53842C7.78888 5.0332 6.3567 8.57279 5.01403 12.1124C3.71612 12.426 2.32869 12.7844 0.896515 13.2325C-0.132864 13.5461 -0.17762 13.815 0.269936 14.4422C0.53847 14.8007 1.03078 14.7559 1.25456 15.0247C1.88114 15.652 2.23918 16.4584 3.31332 16.5481C2.32869 19.1467 1.38883 21.7902 0.493714 24.4337C-0.043353 26.0467 1.52309 26.4051 2.14967 24.6577C3.13429 21.8798 4.16367 19.0571 5.23781 16.2792C6.13292 16.0552 8.23643 15.6072 10.2504 15.2039C8.68399 19.5052 7.65461 22.7759 7.25181 24.3441C7.1623 24.6577 7.29657 24.837 7.38608 24.9266C7.92314 25.6883 8.41546 25.7331 9.08679 26.674C9.26581 26.9428 9.62386 26.9876 9.89239 26.7636C9.9819 26.674 10.0714 26.5395 10.1162 26.4499C11.4588 22.3727 12.9358 18.2954 14.4575 14.263C14.9498 14.1286 15.9792 13.8598 16.6057 12.9189Z" fill="#CD2026" />
                                  <path fillRule="evenodd" clipRule="evenodd" d="M17.6804 19.5948C17.5909 19.6844 17.4567 19.774 17.3672 19.9084C17.2329 19.55 17.1434 19.1468 17.0091 18.7883C17.3672 18.3851 17.6804 17.937 17.949 17.5338C19.1126 15.6968 16.8301 14.6663 15.8007 15.8312C15.2636 16.4585 15.3979 17.0857 15.5322 17.6234L15.7112 18.2955C15.4427 18.5643 15.0846 18.9675 14.6371 19.4604C13.5182 20.7597 13.8315 22.4623 15.0399 22.8656C15.756 23.0896 16.472 22.7759 17.0539 22.2383C17.0986 22.3279 17.0986 22.4175 17.1434 22.4623C17.4567 23.2688 18.4413 23 18.0385 22.0591C17.9937 21.8799 17.9042 21.6558 17.8147 21.387C17.9937 21.163 18.1728 20.9389 18.3518 20.6701C19.1126 19.5948 18.4413 18.9675 17.6804 19.5948ZM16.9196 17.0857C16.8301 17.2201 16.6958 17.3098 16.6063 17.4442C16.5616 17.3546 16.5616 17.2649 16.5168 17.1753C16.2035 15.9208 17.6804 16.2792 16.9196 17.0857ZM16.1588 20.9838C15.7112 21.2526 15.3532 20.9838 15.9797 20.1325C16.0692 19.998 16.2035 19.8636 16.293 19.7292C16.3825 20.0428 16.472 20.3565 16.6063 20.6701C16.4273 20.7597 16.293 20.8941 16.1588 20.9838Z" fill="#CD2026" />
                                </svg>

                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs font-semibold text-[#1A1A1A] mb-1">Gift Code</p>
                            <p className="text-xs  font-medium text-[#1A1A1A]">XXX-XXX-XXX</p>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute top-1 -right-1 rounded-full cursor-pointer bg-white flex items-center justify-center">
                            <EditIcon />
                          </div>

                          <p className="text-xs text-[#1A1A1A] mb-0.5">Amount:</p>
                          <p className="text-xs font-medium text-[#DC3415]">
                            {selectedAmount.currency}
                            {selectedAmount.value}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                      onClick={() => {
                        const url =
                          selectedBrand?.website ||
                          selectedBrand?.domain ||
                          `https://${selectedBrand?.slug}.myshopify.com`;

                        const fullUrl = url.startsWith("http") ? url : `https://${url}`;
                        window.open(fullUrl, "_blank");
                      }}
                    >
                      Redeem Now
                      <span className="text-base">↗</span>
                    </button>
                  </div>

                  {/* Redeem Button */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrintForm = () => (
    <div className="grid grid-cols-2 pl-8 pr-[50px] py-4">
      <div className="flex flex-col items-start gap-8 py-8">

        <div className="shrink-0">
          <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center relative">
            {/* Gift box icon */}
            <div className="relative">
              <PrinterColorIcon/>
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Print-at-Home Gift Card
        </h3>
        <p className="text-gray-600 mb-6">
          We'll generate a beautiful PDF with your gift card design, personal message, and voucher code. Perfect for hand delivery or surprise presentations!
        </p>
        <button className="bg-linear-to-r from-pink-500 to-orange-400 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-shadow flex items-center gap-2">
          Review Your Gift ▸
        </button>
      </div>
      <div className="h-full w-full bg-[#F3F3F3] rounded-[20px]">

      </div>
    </div>

  );

  return (
    <div className="min-h-screen bg-white px-8  py-30">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => dispatch(goBack())} className="flex items-center gap-3 px-4 py-3.5 rounded-full border-2 border-rose-400 bg-white hover:bg-rose-50 transition-all duration-200 shadow-sm hover:shadow-md group">
          <ArrowLeft className="w-5 h-5 text-rose-500 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="text-base font-semibold text-gray-800">Previous</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[40px] font-bold text-gray-900 mb-3">
            Choose Delivery Method
          </h1>
          <p className="text-base text-gray-600">How would you like to send this gift?</p>
        </div>

        {/* Delivery Method Selection */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deliveryMethods.map(renderMethodCard)}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-99"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Modal Content */}
              <div className="p-4">
                {selectedMethod === 'whatsapp' && renderWhatsAppForm()}
                {selectedMethod === 'email' && renderEmailForm()}
                {selectedMethod === 'print' && renderPrintForm()}

                {/* Continue Button */}
                <div className="flex items-center justify-center mt-8">
                  <button
                    onClick={handleContinue}
                    className="bg-linear-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-4 px-12 rounded-full font-semibold text-base transition-all duration-200 transform hover:scale-105 shadow-lg flex gap-3 items-center"
                  >
                    Continue to Payment <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                    </svg>

                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMethodStep;
