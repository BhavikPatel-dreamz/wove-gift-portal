import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { clearDeliveryFormEditReturn, goBack, goNext, setDeliveryMethod, setDeliveryDetails, updateDeliveryDetail } from "../../../redux/giftFlowSlice";
import MailIcons from "../../../icons/MailIcon";
import WhatsupIcon from '../../../icons/WhatsupIcon';
import PrinterIcon from '../../../icons/PrinterIcon';
import EmailForm from "./EmailForm";
import WhatsAppForm from "./WhatsAppForm";
import PrintForm from "./PrintForm";
import { useSession } from "@/contexts/SessionContext";
import {
  DEFAULT_COUNTRY_CODE,
  isValidEmail,
  isValidName,
  normalizeCountryCode,
  normalizeEmailInput,
  normalizeNameInput,
  normalizePhoneInput,
  validatePhoneWithCountryCode,
} from "./deliveryValidation";


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

const PHONE_FIELDS = new Set([
  "yourWhatsAppNumber",
  "recipientWhatsAppNumber",
  "yourPhoneNumber",
]);

const COUNTRY_CODE_FIELDS = new Set([
  "yourCountryCode",
  "recipientCountryCode",
  "yourPhoneCountryCode",
]);

const EMAIL_FIELDS = new Set(["yourEmailAddress", "recipientEmailAddress"]);

const NAME_FIELDS = new Set([
  "yourName",
  "recipientName",
  "yourFullName",
  "recipientFullName",
]);

const DeliveryMethodStep = () => {
  const dispatch = useDispatch();
  const session = useSession();


  const {
    deliveryMethod,
    deliveryFormEditReturn,
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
    yourCountryCode: DEFAULT_COUNTRY_CODE,
    yourWhatsAppNumber: '',
    recipientName: '',
    recipientCountryCode: DEFAULT_COUNTRY_CODE,
    recipientWhatsAppNumber: '',
    yourFullName: '',
    yourEmailAddress: '',
    recipientFullName: '',
    recipientEmailAddress: '',
    yourPhoneNumber: '',
    yourPhoneCountryCode: DEFAULT_COUNTRY_CODE,
    printDetails: {}
  });

  // Initialize form data with session user data on mount
  useEffect(() => {
    if (session?.user) {
      const fullName = normalizeNameInput(
        `${session.user.firstName || ''} ${session.user.lastName || ''}`
      ).trim();
      setFormData(prev => ({
        ...prev,
        yourName: fullName || prev.yourName,
        yourFullName: fullName || prev.yourFullName,
        yourEmailAddress: normalizeEmailInput(session.user.email) || prev.yourEmailAddress,
      }));
    }
  }, [session?.user]);

  // Load existing delivery details when component mounts or delivery method changes
  useEffect(() => {
    if (deliveryMethod && deliveryDetails && Object.keys(deliveryDetails).length > 0) {
      setFormData(prev => ({
        ...prev,
        yourName: normalizeNameInput(deliveryDetails.yourName || prev.yourName),
        yourCountryCode: normalizeCountryCode(deliveryDetails.yourCountryCode || prev.yourCountryCode),
        yourWhatsAppNumber: normalizePhoneInput(
          deliveryDetails.yourWhatsAppNumber || prev.yourWhatsAppNumber,
          deliveryDetails.yourCountryCode || prev.yourCountryCode
        ),
        recipientName: normalizeNameInput(deliveryDetails.recipientName || prev.recipientName),
        recipientCountryCode: normalizeCountryCode(deliveryDetails.recipientCountryCode || prev.recipientCountryCode),
        recipientWhatsAppNumber: normalizePhoneInput(
          deliveryDetails.recipientWhatsAppNumber || prev.recipientWhatsAppNumber,
          deliveryDetails.recipientCountryCode || prev.recipientCountryCode
        ),
        yourFullName: normalizeNameInput(deliveryDetails.yourFullName || prev.yourFullName),
        yourEmailAddress: normalizeEmailInput(deliveryDetails.yourEmailAddress || prev.yourEmailAddress),
        recipientFullName: normalizeNameInput(deliveryDetails.recipientFullName || prev.recipientFullName),
        recipientEmailAddress: normalizeEmailInput(deliveryDetails.recipientEmailAddress || prev.recipientEmailAddress),
        yourPhoneNumber: normalizePhoneInput(
          deliveryDetails.yourPhoneNumber || prev.yourPhoneNumber,
          deliveryDetails.yourPhoneCountryCode || prev.yourPhoneCountryCode
        ),
        yourPhoneCountryCode: normalizeCountryCode(deliveryDetails.yourPhoneCountryCode || prev.yourPhoneCountryCode),
        printDetails: deliveryDetails.printDetails || prev.printDetails
      }));
    }
  }, [deliveryMethod, deliveryDetails]);

  // If user came from delivery preview edit flow, reopen the same method modal automatically.
  useEffect(() => {
    if (!deliveryFormEditReturn?.enabled) return;

    const methodToOpen = deliveryFormEditReturn.method || deliveryMethod || selectedMethod;
    if (!methodToOpen) return;

    setSelectedMethod(methodToOpen);
    setShowModal(true);
    setErrors({});

    if (deliveryMethod !== methodToOpen) {
      dispatch(setDeliveryMethod(methodToOpen));
    }

    dispatch(clearDeliveryFormEditReturn());
  }, [deliveryFormEditReturn, deliveryMethod, selectedMethod, dispatch]);

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
  const validateWhatsAppForm = useCallback(() => {
    const newErrors = {};

    if (!formData.yourName?.trim()) {
      newErrors.yourName = "Your name is required";
    } else if (!isValidName(formData.yourName)) {
      newErrors.yourName = "Please enter a valid name";
    }

    const yourWhatsAppError = validatePhoneWithCountryCode(
      formData.yourWhatsAppNumber,
      formData.yourCountryCode,
      { required: true, label: "your WhatsApp number" }
    );
    if (yourWhatsAppError) {
      newErrors.yourWhatsAppNumber = yourWhatsAppError;
    }

    if (!formData.recipientName?.trim()) {
      newErrors.recipientName = "Recipient name is required";
    } else if (!isValidName(formData.recipientName)) {
      newErrors.recipientName = "Please enter a valid recipient name";
    }

    const recipientWhatsAppError = validatePhoneWithCountryCode(
      formData.recipientWhatsAppNumber,
      formData.recipientCountryCode,
      { required: true, label: "recipient WhatsApp number" }
    );
    if (recipientWhatsAppError) {
      newErrors.recipientWhatsAppNumber = recipientWhatsAppError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateEmailForm = useCallback(() => {
    const newErrors = {};

    if (!formData.yourFullName?.trim()) {
      newErrors.yourFullName = "Your full name is required";
    } else if (!isValidName(formData.yourFullName)) {
      newErrors.yourFullName = "Please enter a valid full name";
    }

    if (!formData.yourEmailAddress?.trim()) {
      newErrors.yourEmailAddress = "Your email is required";
    } else if (!isValidEmail(formData.yourEmailAddress)) {
      newErrors.yourEmailAddress = "Please enter a valid email address";
    }

    const yourPhoneError = validatePhoneWithCountryCode(
      formData.yourPhoneNumber,
      formData.yourPhoneCountryCode,
      { required: false, label: "phone number" }
    );
    if (yourPhoneError) {
      newErrors.yourPhoneNumber = yourPhoneError;
    }

    if (!formData.recipientFullName?.trim()) {
      newErrors.recipientFullName = "Recipient name is required";
    } else if (!isValidName(formData.recipientFullName)) {
      newErrors.recipientFullName = "Please enter a valid recipient name";
    }

    if (!formData.recipientEmailAddress?.trim()) {
      newErrors.recipientEmailAddress = "Recipient email is required";
    } else if (!isValidEmail(formData.recipientEmailAddress)) {
      newErrors.recipientEmailAddress = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleMethodChange = useCallback((method) => {
    setSelectedMethod(method);
    setShowModal(true);
    setErrors({});
    dispatch(setDeliveryMethod(method));

    // If editing existing method, load saved data
    if (deliveryMethod === method && deliveryDetails && Object.keys(deliveryDetails).length > 0) {
      setFormData(prev => ({
        ...prev,
        yourName: normalizeNameInput(deliveryDetails.yourName || prev.yourName),
        yourCountryCode: normalizeCountryCode(deliveryDetails.yourCountryCode || prev.yourCountryCode),
        yourWhatsAppNumber: normalizePhoneInput(
          deliveryDetails.yourWhatsAppNumber || prev.yourWhatsAppNumber,
          deliveryDetails.yourCountryCode || prev.yourCountryCode
        ),
        recipientName: normalizeNameInput(deliveryDetails.recipientName || prev.recipientName),
        recipientCountryCode: normalizeCountryCode(deliveryDetails.recipientCountryCode || prev.recipientCountryCode),
        recipientWhatsAppNumber: normalizePhoneInput(
          deliveryDetails.recipientWhatsAppNumber || prev.recipientWhatsAppNumber,
          deliveryDetails.recipientCountryCode || prev.recipientCountryCode
        ),
        yourFullName: normalizeNameInput(deliveryDetails.yourFullName || prev.yourFullName),
        yourEmailAddress: normalizeEmailInput(deliveryDetails.yourEmailAddress || prev.yourEmailAddress),
        recipientFullName: normalizeNameInput(deliveryDetails.recipientFullName || prev.recipientFullName),
        recipientEmailAddress: normalizeEmailInput(deliveryDetails.recipientEmailAddress || prev.recipientEmailAddress),
        yourPhoneNumber: normalizePhoneInput(
          deliveryDetails.yourPhoneNumber || prev.yourPhoneNumber,
          deliveryDetails.yourPhoneCountryCode || prev.yourPhoneCountryCode
        ),
        yourPhoneCountryCode: normalizeCountryCode(deliveryDetails.yourPhoneCountryCode || prev.yourPhoneCountryCode),
        printDetails: deliveryDetails.printDetails || prev.printDetails
      }));
    } else {
      // New method selection - reset recipient fields but keep user fields from session
      const fullName = session?.user
        ? normalizeNameInput(`${session.user.firstName || ''} ${session.user.lastName || ''}`).trim()
        : '';
      setFormData(prev => ({
        yourName: fullName || prev.yourName,
        yourCountryCode: DEFAULT_COUNTRY_CODE,
        yourWhatsAppNumber: normalizePhoneInput(prev.yourWhatsAppNumber, prev.yourCountryCode),
        recipientName: '',
        recipientCountryCode: DEFAULT_COUNTRY_CODE,
        recipientWhatsAppNumber: '',
        yourFullName: fullName || prev.yourFullName,
        yourEmailAddress: normalizeEmailInput(session?.user?.email) || prev.yourEmailAddress,
        recipientFullName: '',
        recipientEmailAddress: '',
        yourPhoneNumber: normalizePhoneInput(prev.yourPhoneNumber, prev.yourPhoneCountryCode),
        yourPhoneCountryCode: DEFAULT_COUNTRY_CODE,
        printDetails: {}
      }));
    }
  }, [dispatch, session, deliveryMethod, deliveryDetails]);

  const normalizeFieldValue = useCallback((field, value, currentValues) => {
    if (PHONE_FIELDS.has(field)) {
      const countryField =
        field === "yourWhatsAppNumber"
          ? "yourCountryCode"
          : field === "recipientWhatsAppNumber"
            ? "recipientCountryCode"
            : "yourPhoneCountryCode";

      return normalizePhoneInput(value, currentValues[countryField]);
    }

    if (COUNTRY_CODE_FIELDS.has(field)) {
      return normalizeCountryCode(value);
    }

    if (EMAIL_FIELDS.has(field)) {
      return normalizeEmailInput(value);
    }

    if (NAME_FIELDS.has(field)) {
      return normalizeNameInput(value);
    }

    return value;
  }, []);

  const handleInputChange = useCallback((field, value) => {
    const nextFormData = { ...formData };
    const normalizedValue = normalizeFieldValue(field, value, nextFormData);
    nextFormData[field] = normalizedValue;

    // Re-normalize related phone fields when country code changes.
    if (field === "yourCountryCode") {
      nextFormData.yourWhatsAppNumber = normalizePhoneInput(
        nextFormData.yourWhatsAppNumber,
        normalizedValue
      );
    }
    if (field === "recipientCountryCode") {
      nextFormData.recipientWhatsAppNumber = normalizePhoneInput(
        nextFormData.recipientWhatsAppNumber,
        normalizedValue
      );
    }
    if (field === "yourPhoneCountryCode") {
      nextFormData.yourPhoneNumber = normalizePhoneInput(
        nextFormData.yourPhoneNumber,
        normalizedValue
      );
    }

    setFormData(nextFormData);

    dispatch(updateDeliveryDetail({ field, value: normalizedValue }));
    if (field === "yourCountryCode") {
      dispatch(
        updateDeliveryDetail({
          field: "yourWhatsAppNumber",
          value: nextFormData.yourWhatsAppNumber,
        })
      );
    }
    if (field === "recipientCountryCode") {
      dispatch(
        updateDeliveryDetail({
          field: "recipientWhatsAppNumber",
          value: nextFormData.recipientWhatsAppNumber,
        })
      );
    }
    if (field === "yourPhoneCountryCode") {
      dispatch(
        updateDeliveryDetail({
          field: "yourPhoneNumber",
          value: nextFormData.yourPhoneNumber,
        })
      );
    }

    const fieldsToClear = [field];
    if (field === "yourCountryCode") fieldsToClear.push("yourWhatsAppNumber");
    if (field === "recipientCountryCode") fieldsToClear.push("recipientWhatsAppNumber");
    if (field === "yourPhoneCountryCode") fieldsToClear.push("yourPhoneNumber");

    if (fieldsToClear.some((fieldName) => errors[fieldName])) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        fieldsToClear.forEach((fieldName) => {
          delete newErrors[fieldName];
        });
        return newErrors;
      });
    }
  }, [dispatch, errors, formData, normalizeFieldValue]);

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
    const isActive = isSelected || isDeliveryActive;

    const methodHoverBorderClass =
      method.id === "whatsapp"
        ? "hover:border-[#39AE41]"
        : method.id === "email"
          ? "hover:border-[#F57A38]"
          : "hover:border-[#3874F5]";

    const methodActiveBorderClass =
      method.id === "whatsapp"
        ? "border-[#39AE41] shadow-[0_0_0_2px_rgba(57,174,65,0.25)]"
        : method.id === "email"
          ? "border-[#F57A38] shadow-[0_0_0_2px_rgba(245,122,56,0.25)]"
          : "border-[#3874F5] shadow-[0_0_0_2px_rgba(56,116,245,0.25)]";

    return (
      <div
        key={method.id}
        onClick={() => handleMethodChange(method.id)}
        className={`
          relative p-8 rounded-2xl cursor-pointer border-2 transition-all duration-200
          ${method.bgColor}
          ${isActive
            ? methodActiveBorderClass
            : `border-[#1A1A1A1A] ${methodHoverBorderClass} hover:shadow-md`
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
        <div className="p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 inline-block mb-6">
          <button
            onClick={() => dispatch(goBack())}
            className="group cursor-pointer flex items-center gap-2 
               px-4 py-2.5 sm:px-5 sm:py-3 
               rounded-full bg-white 
               text-gray-800 hover:text-white
               hover:bg-gradient-to-r 
               hover:from-pink-500 hover:to-orange-400
               transition-all duration-300 
               shadow-sm hover:shadow-md"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              <svg
                width="8"
                height="9"
                viewBox="0 0 8 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-300 group-hover:[&>path]:fill-white"
              >
                <path
                  d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z"
                  fill="url(#paint0_linear_584_1923)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_584_1923"
                    x1="7.5"
                    y1="3.01721"
                    x2="-9.17006"
                    y2="13.1895"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#ED457D" />
                    <stop offset="1" stopColor="#FA8F42" />
                  </linearGradient>
                </defs>
              </svg>
            </span>

            <span className="text-sm sm:text-base font-semibold">
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4 overflow-hidden">
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
                    className="group cursor-pointer w-full sm:w-auto max-w-fit
  bg-gradient-to-r from-pink-500 to-orange-500
  hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500
  text-white
  px-6 sm:px-12 py-3 sm:py-4
  rounded-full font-semibold text-sm sm:text-base
  transition-all duration-300
  shadow-md hover:shadow-xl hover:scale-105
  flex items-center justify-center gap-2 sm:gap-3
  whitespace-nowrap"
                  >
                    Continue to Payment

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      <svg
                        width="8"
                        height="9"
                        viewBox="0 0 8 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                          fill="white"
                        />
                      </svg>
                    </span>
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
