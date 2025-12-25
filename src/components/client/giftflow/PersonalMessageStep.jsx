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
  const data  = useSelector((state) => state.giftFlowReducer);

  
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
    <div className="min-h-screen bg-white  py-30">
      <div className="max-w-4xl mx-auto">
        {/* Previous Button */}
        {/* <button onClick={() => dispatch(goBack())} className="flex items-center gap-3 px-4 py-3.5 rounded-full border-2 border-rose-400 bg-white hover:bg-rose-50 transition-all duration-200 shadow-sm hover:shadow-md group">
          <ArrowLeft className="w-5 h-5 text-rose-500 group-hover:translate-x-[-2px] transition-transform duration-200" />
          <span className="text-base font-semibold text-gray-800">Previous</span>
        </button> */}

        <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
          <button
            onClick={() => dispatch(goBack())}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 
                       transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 group-hover:[&amp;&gt;path]:fill-white"><path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)"></path><defs><linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse"><stop stopColor="#ED457D"></stop><stop offset="1" stopColor="#FA8F42"></stop></linearGradient></defs></svg>
            <span className="text-base font-semibold text-gray-800">
              Previous
            </span>
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-16">
          {
            isBulkMode &&
            <div className="w-full flex items-center justify-center mb-4">
              {/* Left line */}
              <div className="max-w-[214px] w-full h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]"></div>

              {/* Center pill */}
              <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 py-1.5 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    Bulk Gifting
                  </span>
                </div>
              </div>

              {/* Right line */}
              <div className="max-w-[214px] w-full h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]"></div>
            </div>
          }
          <h1 className="text-5xl font-bold mb-4 text-black">
            Write from Your Heart
          </h1>
          <p className="text-gray-500 text-base">
            Add a heartfelt message to make this gift special
          </p>
        </div>

        {/* Message Card */}
        <div className="rounded-3xl border border-pink-400 py-6 px-4 mb-8 max-w-4xl mx-auto" style={{
          borderRadius: '30px',
          border: isMessageEmpty && error ? '2px solid #ef4444' : '1px solid #ED457D',
          background: 'linear-gradient(180deg, #FEF8F6 0%, #FDF7F8 100%)'
        }}>
          {/* Card Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start">
              <div className="w-11 h-11 rounded-[57px] flex items-center justify-center mr-4 flex-shrink-0 bg-[linear-gradient(114deg,rgba(237,69,125,0.1)_11.36%,rgba(250,143,66,0.1)_90.28%)]">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Personal Message</h3>
                <p className="text-sm text-gray-600">Let your feelings flow naturally</p>
              </div>
            </div>
            <div className="text-sm text-gray-700 flex items-center bg-white px-4 py-2 rounded-lg border border-pink-200">
              <span className="mr-2">⚡</span>
              <span className="font-medium">Tip: Be genuine and speak from the heart</span>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Write something meaningful...e.g., 'Wishing you many many happy returns of the day' 🎂🎉👏"
              className={`w-full p-6 border rounded-2xl focus:outline-none focus:ring-2 resize-none text-base leading-relaxed bg-white placeholder-gray-400 text-black ${error ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:border-red-400 focus:ring-red-100'
                }`}
              rows={6}
            />
            <div className="absolute bottom-5 right-5 flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">
                {message.length}/{maxChars}
              </span>
              <button className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors bg-white">
                <span className="text-xl">😊</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleContinue}
            disabled={isMessageEmpty}
            className={`text-white py-4 px-10 rounded-[50px] font-medium text-base transition-all duration-200 transform shadow-lg inline-flex items-center 
               ${isMessageEmpty
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-[linear-gradient(114deg,#ED457D_11.36%,#FA8F42_90.28%)] hover:scale-105'
              }`}
          >
            Schedule Delivery Date
            <span className="ml-3 text-lg">
              <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
              </svg>
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default PersonalMessageStep;