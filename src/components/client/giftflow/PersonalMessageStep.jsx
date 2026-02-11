import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { goBack, goNext, setPersonalMessage } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";


const PersonalMessageStep = () => {
  const dispatch = useDispatch();
  const { personalMessage } = useSelector((state) => state.giftFlowReducer);
  const [message, setMessage] = useState(personalMessage || '');
  const [error, setError] = useState('');
  const maxChars = 300;
  const minChars = 1;
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';
  const data = useSelector((state) => state.giftFlowReducer);


  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    if (newMessage.length <= maxChars) {
      setMessage(newMessage);
      dispatch(setPersonalMessage(newMessage));
      // Clear error when user starts typing
      if (newMessage.trim().length > 0) {
        setError('');
      }
    }
  };

  const handleContinue = () => {
    // Validate message is not empty
    if (!message.trim() || message.trim().length === 0) {
      setError('Please write a message before continuing');
      return;
    }

    // Clear error and proceed
    setError('');
    dispatch(goNext());
  };

  const isMessageEmpty = !message.trim() || message.trim().length === 0;

  return (
   <div className="min-h-screen bg-gray-50 px-4  py-30 md:px-8 md:py-30">
      <div className="max-w-7xl mx-auto sm:px-6">

          {/* Back Button and Bulk Mode Indicator */}
        <div className="relative flex flex-col items-start gap-4 mb-6
                md:flex-row md:items-center md:justify-between md:gap-0">

          {/* Previous Button */}
          <button
            className="
              relative inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-full font-semibold text-base
              text-[#4A4A4A] bg-white border border-transparent
              transition-all duration-300 overflow-hidden group cursor-pointer
            "
            onClick={() => dispatch(goBack())}
          >
            {/* Outer gradient border */}
            <span
              className="
                absolute inset-0 rounded-full p-[1.5px]
                bg-linear-to-r from-[#ED457D] to-[#FA8F42]
              "
            ></span>
            <span
              className="
                absolute inset-0.5 rounded-full bg-white
                transition-all duration-300
                group-hover:bg-linear-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]
              "
            ></span>

            {/* Button content */}
            <div className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
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
              Previous
            </div>
          </button>

          {/* Bulk Gifting Indicator */}
          {isBulkMode && (
            <div
              className="
        flex items-center gap-3 justify-center w-full
        md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto p-2
      "
            >
              <div className="md:block w-30 h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />

              <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
                 <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    Bulk Gifting
                  </span>
                </div>
              </div>

              <div className="md:block w-30 h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
            </div>
          )}

          {/* Desktop spacer only */}
          <div className="md:block w-35" />
        </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-black">
              Write from Your Heart
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Add a heartfelt message to make this gift special
            </p>
          </div>

          {/* Message Card */}
          <div
            className="rounded-3xl border py-6 px-4 sm:px-6 mb-8 max-w-4xl mx-auto"
            style={{
              border: isMessageEmpty && error ? '2px solid #ef4444' : '1px solid #ED457D',
              background: 'linear-gradient(180deg, #FEF8F6 0%, #FDF7F8 100%)'
            }}
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-pink-100">
                  ❤️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Your Personal Message
                  </h3>
                  <p className="text-sm text-gray-600">
                    Let your feelings flow naturally
                  </p>
                </div>
              </div>

              <div className="px-3 py-2 rounded-[50px] bg-[rgba(250,143,66,0.1)] border border-pink-200 text-sm font-semibold leading-4.5 
                text-[#4A4A4A] font-['Inter']">
                ❤️ Tip: Be genuine and speak from the heart
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={message}
                onChange={handleMessageChange}
                rows={5}
                placeholder="Write something meaningful..."
                className={`w-full p-4 sm:p-6 resize-none bg-white 
    text-sm sm:text-base text-[#4A4A4A]
    rounded-[20px] 
    border border-[rgba(26,26,26,0.1)] 
    shadow-[0_4px_20px_rgba(128,128,128,0.1)]
    ${error ? 'border-red-400' : ''}
    focus:outline-none focus:ring-0 focus:border-[rgba(26,26,26,0.2)]`}
              />

              <div className="absolute bottom-3 right-4 text-xs sm:text-sm text-gray-500">
                {message.length}/{maxChars}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={isMessageEmpty}
              className={`w-full  items-center mx-auto justify-center flex  gap-2 sm:w-auto px-10 py-4 rounded-full font-semibold text-base transition-all shadow-lg
          ${isMessageEmpty
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-linear-to-r from-pink-500 to-orange-400 hover:scale-105'
                } text-white`}
            >
              Schedule Delivery Date <svg xmlns="http://www.w3.org/2000/svg" width="8" height="9" viewBox="0 0 8 9" fill="none">
                <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
              </svg>
            </button>
          </div>
        </div>
    </div>
  );
}

export default PersonalMessageStep;