import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, X } from "lucide-react";
import { goBack, goNext, setDeliveryMethod, setDeliveryDetails, updateDeliveryDetail } from "../../../redux/giftFlowSlice";
import MailIcons from "../../../icons/MailIcon";
import WhatsupIcon from '../../../icons/WhatsupIcon';
import PrinterIcon from '../../../icons/PrinterIcon';
import EmailForm from "./EmailForm";
import WhatsAppForm from "./WhatsAppForm";
import PrintForm from "./PrintForm";
import { useSession } from "@/contexts/SessionContext";


const DELIVERY_METHODS = [
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

const DeliveryMethodStep = () => {
  const dispatch = useDispatch();
  const session = useSession();


  const {
    deliveryMethod,
    deliveryDetails,
    selectedAmount,
    personalMessage,
    selectedSubCategory,
    selectedBrand,
    selectedTiming
  } = useSelector((state) => state.giftFlowReducer);

  const [selectedMethod, setSelectedMethod] = useState(deliveryMethod || null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    yourName: '',
    yourCountryCode: '+91',
    yourWhatsAppNumber: '',
    recipientName: '',
    recipientCountryCode: '+91',
    recipientWhatsAppNumber: '',
    yourFullName: '',
    yourEmailAddress: '',
    recipientFullName: '',
    recipientEmailAddress: '',
    yourPhoneNumber: '',
    yourPhoneCountryCode: '+91',
    printDetails: {}
  });

  // Initialize form data with session user data on mount
  useEffect(() => {
    if (session?.user) {
      const fullName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        yourName: fullName || prev.yourName,
        yourFullName: fullName || prev.yourFullName,
        yourEmailAddress: session.user.email || prev.yourEmailAddress,
      }));
    }
  }, [session?.user]);

  // Load existing delivery details when component mounts or delivery method changes
  useEffect(() => {
    if (deliveryMethod && deliveryDetails && Object.keys(deliveryDetails).length > 0) {
      setFormData(prev => ({
        ...prev,
        yourName: deliveryDetails.yourName || prev.yourName,
        yourCountryCode: deliveryDetails.yourCountryCode || prev.yourCountryCode,
        yourWhatsAppNumber: deliveryDetails.yourWhatsAppNumber || prev.yourWhatsAppNumber,
        recipientName: deliveryDetails.recipientName || prev.recipientName,
        recipientCountryCode: deliveryDetails.recipientCountryCode || prev.recipientCountryCode,
        recipientWhatsAppNumber: deliveryDetails.recipientWhatsAppNumber || prev.recipientWhatsAppNumber,
        yourFullName: deliveryDetails.yourFullName || prev.yourFullName,
        yourEmailAddress: deliveryDetails.yourEmailAddress || prev.yourEmailAddress,
        recipientFullName: deliveryDetails.recipientFullName || prev.recipientFullName,
        recipientEmailAddress: deliveryDetails.recipientEmailAddress || prev.recipientEmailAddress,
        yourPhoneNumber: deliveryDetails.yourPhoneNumber || prev.yourPhoneNumber,
        yourPhoneCountryCode: deliveryDetails.yourPhoneCountryCode || prev.yourPhoneCountryCode,
        printDetails: deliveryDetails.printDetails || prev.printDetails
      }));
    }
  }, [deliveryMethod, deliveryDetails]);

  // Check if method has been completed
  const isMethodCompleted = useMemo(() => {
    if (!deliveryMethod) return false;

    if (deliveryMethod === 'whatsapp') {
      return !!(
        deliveryDetails.yourName &&
        deliveryDetails.yourWhatsAppNumber &&
        deliveryDetails.recipientName &&
        deliveryDetails.recipientWhatsAppNumber
      );
    }

    if (deliveryMethod === 'email') {
      return !!(
        deliveryDetails.yourFullName &&
        deliveryDetails.yourEmailAddress &&
        deliveryDetails.recipientFullName &&
        deliveryDetails.recipientEmailAddress
      );
    }

    if (deliveryMethod === 'print') {
      return true;
    }

    return false;
  }, [deliveryMethod, deliveryDetails]);

  // Validation functions
  const validateEmail = useCallback((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), []);
  const validatePhoneNumber = useCallback((phone) => /^\+?[0-9]{10,}$/.test(phone.replace(/[\s()-]+/g, '')), []);

  const validateWhatsAppForm = useCallback(() => {
    const newErrors = {};

    if (!formData.yourName?.trim()) {
      newErrors.yourName = 'Your name is required';
    }
    if (!formData.yourWhatsAppNumber?.trim()) {
      newErrors.yourWhatsAppNumber = 'Your WhatsApp number is required';
    } else if (!validatePhoneNumber(formData.yourWhatsAppNumber)) {
      newErrors.yourWhatsAppNumber = 'Please enter a valid phone number (minimum 10 digits)';
    }
    if (!formData.recipientName?.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    if (!formData.recipientWhatsAppNumber?.trim()) {
      newErrors.recipientWhatsAppNumber = 'Recipient WhatsApp number is required';
    } else if (!validatePhoneNumber(formData.recipientWhatsAppNumber)) {
      newErrors.recipientWhatsAppNumber = 'Please enter a valid phone number (minimum 10 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validatePhoneNumber]);

  const validateEmailForm = useCallback(() => {
    const newErrors = {};

    if (!formData.yourFullName?.trim()) {
      newErrors.yourFullName = 'Your full name is required';
    }
    if (!formData.yourEmailAddress?.trim()) {
      newErrors.yourEmailAddress = 'Your email is required';
    } else if (!validateEmail(formData.yourEmailAddress)) {
      newErrors.yourEmailAddress = 'Please enter a valid email address';
    }
    if (formData.yourPhoneNumber?.trim() && !validatePhoneNumber(formData.yourPhoneNumber)) {
      newErrors.yourPhoneNumber = 'Please enter a valid phone number (minimum 10 digits)';
    }
    if (!formData.recipientFullName?.trim()) {
      newErrors.recipientFullName = 'Recipient name is required';
    }
    if (!formData.recipientEmailAddress?.trim()) {
      newErrors.recipientEmailAddress = 'Recipient email is required';
    } else if (!validateEmail(formData.recipientEmailAddress)) {
      newErrors.recipientEmailAddress = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail, validatePhoneNumber]);

  const handleMethodChange = useCallback((method) => {
    setSelectedMethod(method);
    setShowModal(true);
    setErrors({});
    dispatch(setDeliveryMethod(method));

    // If editing existing method, load saved data
    if (deliveryMethod === method && deliveryDetails && Object.keys(deliveryDetails).length > 0) {
      setFormData(prev => ({
        ...prev,
        yourName: deliveryDetails.yourName || prev.yourName,
        yourCountryCode: deliveryDetails.yourCountryCode || prev.yourCountryCode,
        yourWhatsAppNumber: deliveryDetails.yourWhatsAppNumber || prev.yourWhatsAppNumber,
        recipientName: deliveryDetails.recipientName || prev.recipientName,
        recipientCountryCode: deliveryDetails.recipientCountryCode || prev.recipientCountryCode,
        recipientWhatsAppNumber: deliveryDetails.recipientWhatsAppNumber || prev.recipientWhatsAppNumber,
        yourFullName: deliveryDetails.yourFullName || prev.yourFullName,
        yourEmailAddress: deliveryDetails.yourEmailAddress || prev.yourEmailAddress,
        recipientFullName: deliveryDetails.recipientFullName || prev.recipientFullName,
        recipientEmailAddress: deliveryDetails.recipientEmailAddress || prev.recipientEmailAddress,
        yourPhoneNumber: deliveryDetails.yourPhoneNumber || prev.yourPhoneNumber,
        yourPhoneCountryCode: deliveryDetails.yourPhoneCountryCode || prev.yourPhoneCountryCode,
        printDetails: deliveryDetails.printDetails || prev.printDetails
      }));
    } else {
      // New method selection - reset recipient fields but keep user fields from session
      const fullName = session?.user ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() : '';
      setFormData(prev => ({
        yourName: fullName || prev.yourName,
        yourCountryCode: '+91',
        yourWhatsAppNumber: prev.yourWhatsAppNumber || '',
        recipientName: '',
        recipientCountryCode: '+91',
        recipientWhatsAppNumber: '',
        yourFullName: fullName || prev.yourFullName,
        yourEmailAddress: session?.user?.email || prev.yourEmailAddress,
        recipientFullName: '',
        recipientEmailAddress: '',
        yourPhoneNumber: prev.yourPhoneNumber || '',
        yourPhoneCountryCode: '+91',
        printDetails: {}
      }));
    }
  }, [dispatch, session, deliveryMethod, deliveryDetails]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    dispatch(updateDeliveryDetail({ field, value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [dispatch, errors]);

  const handleContinue = useCallback(() => {
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
      setShowModal(false);
      dispatch(goNext());
    }
  }, [selectedMethod, validateWhatsAppForm, validateEmailForm, dispatch, formData]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setErrors({});
  }, []);

  const renderInputError = useCallback((fieldName) => {
    if (!errors[fieldName]) return null;

    return (
      <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {errors[fieldName]}
      </div>
    );
  }, [errors]);

  const renderContent = useCallback(() => {
    switch (selectedMethod) {
      case 'whatsapp':
        return (
          <WhatsAppForm
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            renderInputError={renderInputError}
            selectedSubCategory={selectedSubCategory}
            selectedAmount={selectedAmount}
            personalMessage={personalMessage}
            selectedBrand={selectedBrand}
          />
        );
      case 'email':
        return (
          <EmailForm
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            renderInputError={renderInputError}
            selectedSubCategory={selectedSubCategory}
            selectedAmount={selectedAmount}
            personalMessage={personalMessage}
            selectedBrand={selectedBrand}
          />
        );
      case 'print':
        return <PrintForm />;
      default:
        return null;
    }
  }, [selectedMethod, formData, handleInputChange, errors, renderInputError, selectedSubCategory, selectedAmount, personalMessage, selectedBrand]);

const renderMethodCard = useCallback((method) => {
  const isCompleted = deliveryMethod === method.id && isMethodCompleted;
  const isSelected = selectedMethod === method.id;
  const isDeliveryActive = deliveryMethod === method.id;

  return (
    <div
      key={method.id}
      onClick={() => handleMethodChange(method.id)}
      className={`
        relative p-8 rounded-2xl cursor-pointer transition-all duration-200
        ${method.bgColor}

        ${isDeliveryActive
          ? "border-2 border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
          : "border-2 border-[#1A1A1A1A] hover:border-gray-300 hover:shadow-md"
        }
      `}
    >
      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Completed
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div className={`w-18.5 h-18.5 ${method.color} rounded-2xl flex items-center justify-center mb-4`}>
          <method.icon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">
          {method.name}
        </h3>

        <p className="text-[16px] text-[#4A4A4A]">
          {method.description}
        </p>

        {isCompleted && (
          <button
            className="mt-4 text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              handleMethodChange(method.id);
            }}
          >
            Edit Details
          </button>
        )}
      </div>
    </div>
  );
}, [deliveryMethod, isMethodCompleted, selectedMethod, handleMethodChange]);


  return (
    <div className="min-h-screen bg-white px-8 py-30">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block mb-6">
          <button
            onClick={() => dispatch(goBack())}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white hover:bg-rose-50 
                       transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 group-hover:[&>path]:fill-white">
              <path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)"></path>
              <defs>
                <linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ED457D"></stop>
                  <stop offset="1" stopColor="#FA8F42"></stop>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-sm sm:text-base font-semibold text-gray-800">
              Previous
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-gray-900 mb-2 sm:mb-3">
            Choose Delivery Method
          </h1>
          <p className="text-sm sm:text-base text-gray-600">How would you like to send this gift?</p>
        </div>

        {/* Delivery Method Selection */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className={`grid grid-cols-1 ${selectedTiming?.type !== "schedule" ? "md:grid-cols-3" : "grid-cols-2"} gap-4 sm:gap-6`}>
            {DELIVERY_METHODS
              .filter(method => !(selectedTiming?.type === "schedule" && method.id === 'print'))
              .map(renderMethodCard)
            }
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="cursor-pointer absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-50"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>

              {/* Modal Content */}
              <div className="p-4">
                {renderContent()}

                {/* Continue Button */}
                <div className="flex items-center justify-center mt-6 sm:mt-8 pb-4">
                  <button
                    onClick={handleContinue}
                    className="cursor-pointer bg-linear-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-3 px-8 sm:py-4 sm:px-12 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg flex gap-2 sm:gap-3 items-center"
                  >
                    Continue to Payment
                    <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
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