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
    <div className="min-h-screen bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Previous Button */}
        <div className="mb-8">
          <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
            <button
              onClick={() => dispatch(goBack())}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white hover:bg-rose-50 transition-all duration-200 shadow-sm"
            >
              <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
                <path
                  d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z"
                  fill="url(#grad)"
                />
              </svg>
              <span className="text-sm sm:text-base font-semibold text-gray-800">
                Previous
              </span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          {isBulkMode && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="hidden sm:block w-24 h-px bg-gradient-to-r from-transparent to-pink-400" />
              <div className="rounded-full p-px bg-gradient-to-r from-pink-500 to-orange-400">
                <div className="px-4 py-1.5 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm">
                    Bulk Gifting
                  </span>
                </div>
              </div>
              <div className="hidden sm:block w-24 h-px bg-gradient-to-l from-transparent to-orange-400" />
            </div>
          )}

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

            <div className="px-3 py-2 rounded-[50px] bg-[rgba(250,143,66,0.1)] border border-pink-200 text-sm font-semibold leading-[18px] 
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
                : 'bg-gradient-to-r from-pink-500 to-orange-400 hover:scale-105'
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