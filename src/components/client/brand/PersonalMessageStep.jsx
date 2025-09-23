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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator />
        
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-pink-500 hover:text-pink-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Write from Your Heart
            </span>
            <span className="ml-3 text-4xl">❤️</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Add a heartfelt message to make this gift special
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Your Personal Message</h3>
              <p className="text-gray-600">Let your feelings flow naturally</p>
            </div>
            <div className="ml-auto">
              <button className="flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium">
                <span className="mr-1">✨</span>
                AI Help
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Write something meaningful... e.g., 'Wishing you joy on your special day!' ✨"
              className="w-full p-6 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none resize-none text-lg leading-relaxed"
              rows={6}
            />
            <div className="absolute bottom-4 right-4 flex items-center">
              <span className="text-2xl mr-2">😊</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-purple-600">
              <span className="mr-2">✨</span>
              <span className="text-sm">💡 Tip: Be genuine and speak from the heart</span>
            </div>
            <div className={`text-sm font-medium ${message.length > maxChars * 0.9 ? 'text-red-500' : 'text-wave-brown'}`}>
              {message.length}/{maxChars}
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-4 px-12 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center mx-auto"
            >
              <span className="mr-2">📅</span>
              Schedule Delivery Date
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PersonalMessageStep;