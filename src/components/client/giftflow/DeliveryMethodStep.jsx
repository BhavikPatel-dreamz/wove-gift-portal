import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MessageCircle, Mail, Download, User, X, Phone } from "lucide-react";
import { goBack, goNext, setDeliveryMethod, setDeliveryDetails, updateDeliveryDetail } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";
import Image from "next/image";

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
      icon: MessageCircle,
      description: 'Send directly to their WhatsApp',
      color: 'bg-green-500'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Classic email delivery',
      color: 'bg-orange-500'
    },
    {
      id: 'print',
      name: 'Print It Yourself',
      icon: Download,
      description: 'Download beautiful PDF to print',
      color: 'bg-blue-500'
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
      className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedMethod === method.id
        ? 'border-pink-400 bg-white shadow-lg'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center mb-4`}>
          <method.icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{method.name}</h3>
        <p className="text-sm text-gray-500">{method.description}</p>
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
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-xl"></div>
                <User className="relative w-6 h-6 text-[#39AE41]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Details</h3>
                <p className="text-sm text-gray-600">We need your information for the gift receipt</p>
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
                  <select
                    value={formData.yourCountryCode}
                    onChange={(e) => handleInputChange('yourCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.yourWhatsAppNumber}
                      onChange={(e) => handleInputChange('yourWhatsAppNumber', e.target.value)}
                      placeholder="10 digit number"
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
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-xl"></div>
                <MessageCircle className="relative w-6 h-6 text-[#39AE41]" />
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
                  <select
                    value={formData.recipientCountryCode}
                    onChange={(e) => handleInputChange('recipientCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.recipientWhatsAppNumber}
                      onChange={(e) => handleInputChange('recipientWhatsAppNumber', e.target.value)}
                      placeholder="10 digit number"
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
          <div className="absolute w-[500px] h-[420px] bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-60 -z-10"></div>

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
                <div className="flex-1 bg-gradient-to-b from-green-50 to-green-100 p-3 overflow-y-auto">
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

                      <div className="w-[95%] mx-auto h-[1px] bg-[#1A1A1A33] my-1"></div>

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
      <div className="text-center pt-8 pb-4 px-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Details</h2>
        <p className="text-gray-600 text-sm">
          Send the gift card via email with your personal message.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-2 pb-8">
        {/* Left Side - Form */}
        <div className="space-y-6">
          {/* Your Information Section */}
          <div className="rounded-2xl border border-gray-200">
            <div className="bg-blue-50 flex items-start mb-4 border-b border-[#398FAE] p-4">
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                <User className="relative w-6 h-6 text-[#398FAE]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Information</h3>
                <p className="text-sm text-gray-600">We need your details to send the email</p>
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
                <label className="text-xs font-semibold text-gray-600 block mb-2">Your Phone Number (Optional)</label>
                <div className="flex gap-2">
                  <select
                    value={formData.yourPhoneCountryCode}
                    onChange={(e) => handleInputChange('yourPhoneCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.yourPhoneNumber}
                      onChange={(e) => handleInputChange('yourPhoneNumber', e.target.value)}
                      placeholder="10 digit number"
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
            <div className="bg-blue-50 flex items-start mb-4 border-b border-[#398FAE] p-4">
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                <Mail className="relative w-6 h-6 text-[#398FAE]" />
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

        {/* Right Side - Email Preview */}
        <div className="flex items-center justify-center relative">
          {/* Decorative Circle Background */}
          <div className="absolute w-[420px] h-[420px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-60 -z-10"></div>

          <div className="relative z-10 w-full">
            {/* Email Preview Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-w-md">
              {/* Preview Label */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Preview</p>
                <X className="w-5 h-5 text-gray-400" />
              </div>

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
              <div className="px-4 py-4 bg-gray-50">
                <div className="bg-white rounded-lg p-4">
                  {/* Header */}
                  <div className="bg-pink-50 rounded-lg p-4 mb-4 text-center border border-pink-100">
                    <p className="text-sm font-semibold text-gray-900 mb-3">You have received a Gift card!</p>

                    {/* Gift Card Content */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-700 mb-3">
                        hi {formData.recipientFullName || 'jane'},
                      </p>
                      <p className="text-xs text-gray-700 mb-4">
                        Congratulations, you've received gift card from {formData.yourFullName || 'friend'}.
                      </p>

                      {/* Personal Message */}
                      {personalMessage && (
                        <div className="bg-white rounded p-2 mb-3 border-l-4 border-pink-400">
                          <p className="text-xs text-gray-700 italic">
                            "{personalMessage}"
                          </p>
                        </div>
                      )}

                      {/* Gift Card Image and Details */}
                      <div className="flex items-center gap-2 w-fit mx-auto">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-cyan-500 flex items-center justify-center">
                          <Image
                            src={selectedSubCategory?.image}
                            width={80}
                            height={80}
                            alt="Gift card"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-center">
                          <p className="text-xs font-semibold text-gray-900 mb-1">
                            {selectedBrand?.name || 'Brand'}
                          </p>
                          <p className="text-sm font-bold text-red-500 mb-2">
                            {selectedAmount.currency}
                            {selectedAmount.value}
                          </p>
                          <p className="text-xs text-gray-700 mb-1">Gift Code</p>
                          <p className="text-xs font-mono text-gray-700 font-semibold">XXX-XXX-XXX</p>
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="w-full h-px bg-gray-300 my-3"></div>

                    {/* Redeem Button */}
                    <button
                      className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-2 rounded-full font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-1"
                      onClick={() => {
                        const url =
                          selectedBrand?.website ||
                          selectedBrand?.domain ||
                          `https://${selectedBrand?.slug}.myshopify.com`;

                        const fullUrl = url.startsWith("http") ? url : `https://${url}`;
                        window.open(fullUrl, "_blank");
                      }}
                    >
                      Redeem Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrintForm = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Download className="w-12 h-12 text-purple-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Print-at-Home Gift Card
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        We'll generate a beautifully designed, print-ready gift card with voucher code. Perfect for hand-printed gifts or surprise presentations!
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-6 py-2 mb-12 text-sm font-medium text-pink-500 bg-white border border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
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
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
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
                    className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-4 px-12 rounded-full font-semibold text-base transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Continue to Payment ▶
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