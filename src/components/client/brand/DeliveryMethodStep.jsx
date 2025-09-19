
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MessageCircle, Mail, Download, Info, Check } from "lucide-react";
import { goBack, goNext, setDeliveryMethod, setDeliveryDetails, updateDeliveryDetail } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";

const DeliveryMethodStep = () => {
  const dispatch = useDispatch();
  
  const { 
    deliveryMethod,
    deliveryDetails 
  } = useSelector((state) => state.giftFlowReducer);

  const [selectedMethod, setSelectedMethod] = useState(deliveryMethod || 'email');
  const [formData, setFormData] = useState({
    // WhatsApp fields
    yourName: deliveryDetails.yourName || '',
    yourWhatsAppNumber: deliveryDetails.yourWhatsAppNumber || '',
    recipientName: deliveryDetails.recipientName || '',
    recipientWhatsAppNumber: deliveryDetails.recipientWhatsAppNumber || '',
    deliveryTips: deliveryDetails.deliveryTips || [],
    previewMessage: deliveryDetails.previewMessage || false,
    
    // Email fields
    yourFullName: deliveryDetails.yourFullName || '',
    yourEmailAddress: deliveryDetails.yourEmailAddress || '',
    recipientFullName: deliveryDetails.recipientFullName || '',
    recipientEmailAddress: deliveryDetails.recipientEmailAddress || '',
    
    // Print fields (for future implementation)
    printDetails: deliveryDetails.printDetails || {}
  });

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
      color: 'bg-blue-500'
    },
    {
      id: 'print',
      name: 'Print it Yourself',
      icon: Download,
      description: 'Download beautiful PDF to print',
      color: 'bg-purple-500'
    }
  ];

  const whatsappTips = [
    'Double-check the number to ensure your gift reaches the right recipient',
    'Include the country code in your numbers (like +91 for India)',
    'You will receive a preview message before sending',
    "The gift code will be sent directly to the recipient's WhatsApp"
  ];

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    dispatch(setDeliveryMethod(method));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    dispatch(updateDeliveryDetail({ field, value }));
  };

  const handleTipToggle = (tip) => {
    const newTips = formData.deliveryTips.includes(tip)
      ? formData.deliveryTips.filter(t => t !== tip)
      : [...formData.deliveryTips, tip];
    
    setFormData(prev => ({
      ...prev,
      deliveryTips: newTips
    }));
    dispatch(updateDeliveryDetail({ field: 'deliveryTips', value: newTips }));
  };

  const handleContinue = () => {
    dispatch(setDeliveryDetails(formData));
    dispatch(goNext());
  };

  const handleBack = () => {
    dispatch(goBack());
  };

  const renderMethodCard = (method) => (
    <div
      key={method.id}
      onClick={() => handleMethodChange(method.id)}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedMethod === method.id
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {selectedMethod === method.id && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center mb-3`}>
          <method.icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{method.name}</h3>
        <p className="text-sm text-gray-600">{method.description}</p>
      </div>
    </div>
  );

  const renderWhatsAppForm = () => (
    <div className="space-y-6">
      {/* WhatsApp Gift Delivery Header */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center mb-2">
          <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-green-800">WhatsApp Gift Delivery</h3>
        </div>
        <p className="text-sm text-green-700">
          We'll send this gift card directly to their WhatsApp with your personal message!
        </p>
      </div>

      {/* Your Details */}
      <div className="bg-green-500 text-white p-4 rounded-lg">
        <h4 className="font-semibold mb-1">Your Details</h4>
        <p className="text-sm text-green-100">
          Please enter the information you'd like to send the gift!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Full Name <Info className="w-4 h-4 inline ml-1 text-gray-400" />
          </label>
          <input
            type="text"
            value={formData.yourName}
            onChange={(e) => handleInputChange('yourName', e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your WhatsApp Number <Info className="w-4 h-4 inline ml-1 text-gray-400" />
          </label>
          <input
            type="tel"
            value={formData.yourWhatsAppNumber}
            onChange={(e) => handleInputChange('yourWhatsAppNumber', e.target.value)}
            placeholder="+91 98765 43210 9789"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Recipient Details */}
      <div className="bg-green-500 text-white p-4 rounded-lg">
        <h4 className="font-semibold mb-1">Recipient Details</h4>
        <p className="text-sm text-green-100">
          Who are you sending this gift to?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient's Name <Info className="w-4 h-4 inline ml-1 text-gray-400" />
          </label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => handleInputChange('recipientName', e.target.value)}
            placeholder="e.g. Sarah Johnson"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient's WhatsApp Number <Info className="w-4 h-4 inline ml-1 text-gray-400" />
          </label>
          <input
            type="tel"
            value={formData.recipientWhatsAppNumber}
            onChange={(e) => handleInputChange('recipientWhatsAppNumber', e.target.value)}
            placeholder="+91 98765 43210 9789"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* WhatsApp Delivery Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
          WhatsApp Delivery Tips
        </h4>
        <div className="space-y-2">
          {whatsappTips.map((tip, index) => (
            <label key={index} className="flex items-start">
              <input
                type="checkbox"
                checked={formData.deliveryTips.includes(tip)}
                onChange={() => handleTipToggle(tip)}
                className="mt-0.5 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{tip}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preview WhatsApp Message */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-blue-800">Preview WhatsApp Message</span>
          </div>
          <button
            onClick={() => handleInputChange('previewMessage', !formData.previewMessage)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${formData.previewMessage 
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {formData.previewMessage ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Secure & Instant Delivery */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <h4 className="font-semibold text-green-800">Secure & Instant Delivery</h4>
            <p className="text-sm text-green-700">
              🔐 The gift code will sent directly to the recipient's WhatsApp. Make sure all details are correct before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailForm = () => (
    <div className="space-y-6">
      {/* Email Details Header */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center mb-2">
          <Mail className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-800">Email Details</h3>
        </div>
        <p className="text-sm text-blue-700">How should you like to send this gift?</p>
      </div>

      {/* Your Information */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Your Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Full Name *
            </label>
            <input
              type="text"
              value={formData.yourFullName}
              onChange={(e) => handleInputChange('yourFullName', e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+1-555-000-0000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Recipient Details */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Recipient Details</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient's Name *
            </label>
            <input
              type="text"
              value={formData.recipientFullName}
              onChange={(e) => handleInputChange('recipientFullName', e.target.value)}
              placeholder="Enter recipient's full name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.recipientEmailAddress}
              onChange={(e) => handleInputChange('recipientEmailAddress', e.target.value)}
              placeholder="recipient@example.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator />
        <button
          onClick={handleBack}
          className="flex items-center text-pink-500 hover:text-pink-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            How Should We Send It?
          </h1>
          <p className="text-gray-600">Choose the perfect delivery method for your gift</p>
        </div>

        {/* Delivery Method Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-center mb-2 text-blue-600">
            Choose Delivery Method
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            How would you like to send this gift?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryMethods.map(renderMethodCard)}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {selectedMethod === 'whatsapp' && renderWhatsAppForm()}
          {selectedMethod === 'email' && renderEmailForm()}
          {selectedMethod === 'print' && (
            <div className="text-center py-12">
              <Download className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Print It Yourself
              </h3>
              <p className="text-gray-600">
                Download a beautiful PDF gift card that you can print at home
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end">
          <div className="text-sm text-gray-500 mr-8">
            Step your time - we're here to make this gift perfect
          </div>
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMethodStep;
