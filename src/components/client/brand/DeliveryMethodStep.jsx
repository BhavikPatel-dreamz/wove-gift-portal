import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MessageCircle, Mail, Download, User, X, Phone } from "lucide-react";
import { goBack, goNext, setDeliveryMethod, setDeliveryDetails, updateDeliveryDetail } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";

const DeliveryMethodStep = () => {
  const dispatch = useDispatch();
  
  const { 
    deliveryMethod,
    deliveryDetails 
  } = useSelector((state) => state.giftFlowReducer);

  const [selectedMethod, setSelectedMethod] = useState(deliveryMethod || null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    // WhatsApp fields
    yourName: deliveryDetails.yourName || '',
    yourWhatsAppNumber: deliveryDetails.yourWhatsAppNumber || '',
    recipientName: deliveryDetails.recipientName || '',
    recipientWhatsAppNumber: deliveryDetails.recipientWhatsAppNumber || '',
    
    // Email fields
    yourFullName: deliveryDetails.yourFullName || '',
    yourEmailAddress: deliveryDetails.yourEmailAddress || '',
    recipientFullName: deliveryDetails.recipientFullName || '',
    recipientEmailAddress: deliveryDetails.recipientEmailAddress || '',
    yourPhoneNumber: deliveryDetails.yourPhoneNumber || '',
    
    // Print fields
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

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setShowModal(true);
    dispatch(setDeliveryMethod(method));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    dispatch(updateDeliveryDetail({ field, value }));
  };

  const handleContinue = () => {
    dispatch(setDeliveryDetails(formData));
    dispatch(goNext());
  };

  const handleBack = () => {
    dispatch(goBack());
  };

  const handleCloseModal = () => {
    setShowModal(false);
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

  const renderWhatsAppForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
      {/* Left Side - Form */}
      <div className="space-y-6">
        {/* Your Details Section */}
        <div className="bg-green-50 rounded-2xl p-6">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Your Details</h3>
              <p className="text-sm text-gray-600">We need your information for the gift receipt</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={formData.yourName}
              onChange={(e) => handleInputChange('yourName', e.target.value)}
              placeholder="Your Full Name*"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
            />
            <input
              type="tel"
              value={formData.yourWhatsAppNumber}
              onChange={(e) => handleInputChange('yourWhatsAppNumber', e.target.value)}
              placeholder="Your WhatsApp No.*"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
            />
          </div>
        </div>

        {/* Recipient Details Section */}
        <div className="bg-green-50 rounded-2xl p-6">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Recipient Details</h3>
              <p className="text-sm text-gray-600">Who are you sending this gift to?</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              placeholder="Recipient's Name*"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
            />
            <input
              type="tel"
              value={formData.recipientWhatsAppNumber}
              onChange={(e) => handleInputChange('recipientWhatsAppNumber', e.target.value)}
              placeholder="Recipient's WhatsApp No.*"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Right Side - WhatsApp Phone Preview */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-72 h-[580px] bg-black rounded-[3rem] p-3 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
              {/* Phone Status Bar */}
              <div className="bg-white px-4 py-2 flex items-center justify-between border-b">
                <div className="flex items-center">
                  <ArrowLeft className="w-5 h-5 text-gray-700 mr-3" />
                  <div className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Friend</div>
                    <div className="text-xs text-gray-500">Tap here for contact info</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              
              {/* Message Content */}
              <div className="flex-1 bg-gradient-to-b from-green-50 to-green-100 p-4 overflow-y-auto">
                <div className="flex justify-start mb-3">
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-md p-4 max-w-[85%]">
                    <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl p-6 mb-3 text-center">
                      <div className="text-white text-4xl font-bold mb-2">HAPPY</div>
                      <div className="text-white text-4xl font-bold">BIRTHDAY</div>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Friend Sent you a gift card</p>
                      <p className="text-base font-bold text-red-500 mb-2">₹2000</p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        "Wishing you a fantastic birthday and a wonderful year ahead"
                      </p>
                    </div>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2.5 px-4 rounded-lg font-medium flex items-center justify-center">
                      Claim Gift →
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Bar */}
              <div className="bg-white border-t px-3 py-2 flex items-center gap-2">
                <button className="text-gray-400">
                  <span className="text-xl">+</span>
                </button>
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                  <span className="text-sm text-gray-400">Message</span>
                </div>
                <button className="text-gray-400">📷</button>
                <button className="text-gray-400">🎤</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailForm = () => (
    <div className="space-y-8 flex gap-2">
      {/* Your Information Section */}
      <div className="p-2 border border-gray-100 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Full Name*
            </label>
            <input
              type="text"
              value={formData.yourFullName}
              onChange={(e) => handleInputChange('yourFullName', e.target.value)}
              placeholder="Your Full Name*"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email Address*
            </label>
            <input
              type="email"
              value={formData.yourEmailAddress}
              onChange={(e) => handleInputChange('yourEmailAddress', e.target.value)}
              placeholder="Your Email Address*"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={formData.yourPhoneNumber}
            onChange={(e) => handleInputChange('yourPhoneNumber', e.target.value)}
            placeholder="Your Phone Number (Optional)"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Recipient Details Section */}
      <div className="p-2 border border-gray-100 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient's Name*
            </label>
            <input
              type="text"
              value={formData.recipientFullName}
              onChange={(e) => handleInputChange('recipientFullName', e.target.value)}
              placeholder="Recipient's Name*"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address*
            </label>
            <input
              type="email"
              value={formData.recipientEmailAddress}
              onChange={(e) => handleInputChange('recipientEmailAddress', e.target.value)}
              placeholder="Email Address*"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
            />
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
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4  overflow-hidden">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Modal Header */}
              <div className="text-center pt-10 pb-6 px-10 border-b">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedMethod === 'whatsapp' && 'WhatsApp Details'}
                  {selectedMethod === 'email' && 'Email Details'}
                  {selectedMethod === 'print' && 'Print It Yourself'}
                </h2>
                <p className="text-gray-600">
                  {selectedMethod === 'whatsapp' && "We'll send the gift card directly to their WhatsApp with your personal message."}
                  {selectedMethod === 'email' && 'How should you like to send this gift?'}
                  {selectedMethod === 'print' && 'Download and print your beautiful gift card'}
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-5">
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