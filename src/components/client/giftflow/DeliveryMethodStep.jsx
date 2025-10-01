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
          <div className=" rounded-2xl  border border-gray-200">
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
              <input
                type="text"
                value={formData.yourName}
                onChange={(e) => handleInputChange('yourName', e.target.value)}
                placeholder="Your Full Name*"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
              />
              <input
                type="tel"
                value={formData.yourWhatsAppNumber}
                onChange={(e) => handleInputChange('yourWhatsAppNumber', e.target.value)}
                placeholder="Your WhatsApp No.*"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
              />
            </div>
          </div>

          {/* Recipient Details Section */}
          <div className=" rounded-2xl  border border-gray-200">
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
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                placeholder="Recipient's Name*"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
              />
              <input
                type="tel"
                value={formData.recipientWhatsAppNumber}
                onChange={(e) => handleInputChange('recipientWhatsAppNumber', e.target.value)}
                placeholder="Recipient's WhatsApp No.*"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Side - WhatsApp Phone Preview */}
        <div className="flex items-center justify-center relative">
          {/* Decorative Circle Background */}
          <div className="absolute w-[420px] h-[420px] bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-60 -z-10"></div>

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
                      <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl p-5 mb-3 text-center">
                        <div className="text-white text-3xl font-bold leading-tight mb-1">HAPPY</div>
                        <div className="text-white text-3xl font-bold leading-tight">BIRTHDAY</div>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-900 mb-1">Friend Sent you a gift card</p>
                        <p className="text-lg font-bold text-red-500 mb-2">₹2000</p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          "Wishing you a fantastic birthday and a wonderful year ahead"
                        </p>
                      </div>
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-2.5 px-4 rounded-lg font-medium flex items-center justify-center transition-colors">
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
    <div className="space-y-8 ">
      {/* Header */}
      <div className="text-center pt-10 pb-8 px-6">
        <h2 className="text-2xl font-bold text-gray-900">Email Details</h2>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8 w-full">
        <div className="flex gap-5">
          {/* Your Information Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm w-full">
            <div className="flex items-center mb-6">
              <div className="relative w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                <User className="relative w-5 h-5 text-[#398FAE]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={formData.yourFullName}
                  onChange={(e) => handleInputChange('yourFullName', e.target.value)}
                  placeholder="Your Full Name*"
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={formData.yourEmailAddress}
                  onChange={(e) => handleInputChange('yourEmailAddress', e.target.value)}
                  placeholder="Your Email Address*"
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={formData.yourPhoneNumber}
                  onChange={(e) => handleInputChange('yourPhoneNumber', e.target.value)}
                  placeholder="Your Phone Number (Optional)"
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all text-sm placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Recipient Details Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm  w-full">
            <div className="flex items-center mb-6">
              <div className="relative w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                <Mail className="relative w-5 h-5 text-[#398FAE]"/>
              </div>
              <h3 className="text-base font-bold text-gray-900">Recipient Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={formData.recipientFullName}
                  onChange={(e) => handleInputChange('recipientFullName', e.target.value)}
                  placeholder="Recipient's Name*"
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={formData.recipientEmailAddress}
                  onChange={(e) => handleInputChange('recipientEmailAddress', e.target.value)}
                  placeholder="Email Address*"
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all text-sm placeholder:text-gray-400"
                />
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
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4  overflow-hidden">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

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