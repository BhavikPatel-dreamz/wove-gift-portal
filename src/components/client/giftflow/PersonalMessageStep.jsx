import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { goBack, goNext, setPersonalMessage } from "../../../redux/giftFlowSlice";
import ProgressIndicator from "./ProgressIndicator";
import { ArrowLeft } from "lucide-react";


const PersonalMessageStep = () => {
  const dispatch = useDispatch();
  const { personalMessage } = useSelector((state) => state.giftFlowReducer);
  const [message, setMessage] = useState(personalMessage || '');
  const maxChars = 300;

  const handleMessageChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setMessage(e.target.value);
      dispatch(setPersonalMessage(e.target.value));
    }
  };

  const handleContinue = () => {
    dispatch(goNext());
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Previous Button */}
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-[#ED457D]  mb-16 transition-colors border border-[#ED457D] rounded-full px-5 py-2.5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Previous</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-black">
            Write from Your Heart
          </h1>
          <p className="text-gray-500 text-base">
            Add a heartfelt message to make this gift special
          </p>
        </div>

        {/* Message Card */}
        <div className="rounded-3xl border border-pink-400 p-10 mb-8 max-w-4xl mx-auto" style={{
          borderRadius: '30px',
          border: '1px solid #ED457D',
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
          <div className="relative mb-6">
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Write something meaningful...e.g., 'Wishing you many many happy returns of the day' 🎂🎉👏"
              className="w-full p-6 border border-gray-300 text-black rounded-2xl focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none text-base leading-relaxed bg-white placeholder-gray-400"
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
        </div>

        {/* Continue Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleContinue}
            className="text-white py-4 px-10 rounded-[50px] font-medium text-base transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center 
               bg-[linear-gradient(114deg,#ED457D_11.36%,#FA8F42_90.28%)]"
          >
            Schedule Delivery Date
            <span className="ml-3 text-lg">▶</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default PersonalMessageStep;