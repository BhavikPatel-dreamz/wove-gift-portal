import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { goBack, goNext, setSelectedTiming } from "../../../redux/giftFlowSlice";
import { ArrowLeft, Calendar, Clock, Check } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";

const TimingSelectorStep = () => {
  const dispatch = useDispatch();
  const { selectedTiming } = useSelector((state) => state.giftFlowReducer);
  
  const [selectedOption, setSelectedOption] = useState(selectedTiming?.type || 'immediate');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('15:00');
  const [showScheduleDetails, setShowScheduleDetails] = useState(selectedTiming?.type === 'schedule');

  // Generate time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const handleTimingSelect = (timing) => {
    setSelectedOption(timing);
    if (timing === 'schedule') {
      setShowScheduleDetails(true);
      if (!selectedDate) {
        // Set default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
      }
    } else {
      setShowScheduleDetails(false);
    }
  };

  const formatSelectedDateTime = () => {
    if (selectedDate && selectedTime) {
      const date = new Date(selectedDate);
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return `${date.toLocaleDateString('en-US', options)} at ${selectedTime}`;
    }
    return '';
  };

  const handleContinue = () => {
    if (selectedOption === 'schedule') {
      dispatch(setSelectedTiming({ 
        type: 'schedule', 
        date: selectedDate,
        time: selectedTime,
        scheduledDateTime: `${selectedDate}T${selectedTime}`
      }));
    } else {
      dispatch(setSelectedTiming({ type: 'immediate' }));
    }
    dispatch(goNext());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator />
        
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-purple-500 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Perfect Timing
            </span>
          </h1>
          <p className="text-gray-600">Choose when your gift should arrive</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-600 text-center mb-2">
            Send Now or Later?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Choose the perfect timing for your gift delivery
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {/* Send Immediately */}
            <div
              onClick={() => handleTimingSelect('immediate')}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOption === 'immediate'
                  ? 'border-green-400 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedOption === 'immediate' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {selectedOption === 'immediate' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Send Immediately</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Gift will be delivered right after payment confirmation
                </p>
                
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center">
                  <span className="mr-1">⚡</span>
                  Instant delivery
                </div>
              </div>
            </div>

            {/* Schedule for Later */}
            <div
              onClick={() => handleTimingSelect('schedule')}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOption === 'schedule'
                  ? 'border-purple-400 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedOption === 'schedule' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {selectedOption === 'schedule' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Schedule for Later</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Perfect timing for birthdays, anniversaries, or special moments
                </p>
                
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center">
                  <span className="mr-1">📅</span>
                  Perfect timing
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          {showScheduleDetails && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-blue-200">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-blue-800">Select Date & Time</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Choose when you want your gift to arrive</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDate}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Time
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          selectedTime === time
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              {selectedDate && selectedTime && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="font-medium">Scheduled for: {formatSelectedDateTime()}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Your gift will be delivered exactly when you want it!
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={selectedOption === 'schedule' && (!selectedDate || !selectedTime)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-12 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Continue to Delivery Method
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center text-sm text-gray-500 mt-8">
          <div className="text-center">
            <span className="mr-2">💡</span>
            Take your time - we're here to make this perfect
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimingSelectorStep;