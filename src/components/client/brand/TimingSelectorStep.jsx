import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { goBack, goNext, setSelectedTiming } from "../../../redux/giftFlowSlice";
import { ArrowLeft, Calendar, Clock, Check, X } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";

const TimingSelectorStep = () => {
  const dispatch = useDispatch();
  const { selectedTiming } = useSelector((state) => state.giftFlowReducer);

  const [selectedOption, setSelectedOption] = useState(selectedTiming?.type || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleTimingSelect = (timing) => {
    setSelectedOption(timing);
    if (timing === 'schedule') {
      setShowScheduleModal(true);
    }
  };

  const formatSelectedDateTime = () => {
    if (selectedDate && selectedTime) {
      const date = new Date(currentYear, currentMonth, selectedDate);
      const options = {
        weekday: 'long',
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
        month: currentMonth,
        year: currentYear
      }));
    } else {
      dispatch(setSelectedTiming({ type: 'immediate' }));
    }
    dispatch(goNext());
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isPast = isCurrentMonth && day < today.getDate();
      const isSelected = selectedDate === day;

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(day)}
          disabled={isPast}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
            ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Previous Button */}
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-[#ED457D] mb-16 transition-colors border border-[#ED457D] rounded-full px-5 py-2.5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Previous</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-black">
            Send Now or Later?
          </h1>
          <p className="text-gray-500 text-base">
            Choose the perfect timing for your gift delivery
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
          {/* Send Immediately */}
          <div
            onClick={() => handleTimingSelect('immediate')}
            className={`relative p-8 rounded-3xl border cursor-pointer transition-all duration-300 hover:shadow-lg text-center ${selectedOption === 'immediate'
              ? 'border-blue-400 bg-blue-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
          >
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Send Immediately</h3>

            <p className="text-sm text-gray-600">
              Gift will be delivered right after payment confirmation
            </p>
          </div>

          {/* Schedule for Later */}
          <div
            onClick={() => handleTimingSelect('schedule')}
            className={`relative p-8 rounded-3xl border cursor-pointer transition-all duration-300 hover:shadow-lg text-center ${selectedOption === 'schedule'
              ? 'border-purple-400 bg-purple-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
          >
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Schedule for Later</h3>

            <p className="text-sm text-gray-600">
              Perfect timing for birthdays, anniversaries, or special moments
            </p>
          </div>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative">
              {/* Close Button */}
              <button
                onClick={() => setShowScheduleModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-center text-gray-900">Select Date & Time</h2>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Choose when you want your gift to arrive
                </p>
              </div>

              <div className="p-6">
                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-10">
                  {/* Left Column - Calendar */}
                  <div className="rounded-[20px] border border-[rgba(26,26,26,0.1)] bg-white p-5">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Date
                    </label>

                    {/* Month/Year Selector */}
                    <div className="flex justify-between gap-2 mb-4">
                      <select
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                        className="flex-1 px-2 py-1.5 max-w-fit border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>{month}</option>
                        ))}
                      </select>

                      <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                        className="px-2 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[2025, 2026, 2027].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Calendar */}
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                          <div key={day} className="text-center text-[10px] font-bold text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Time Selection */}
                  <div
                    className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {timeSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className="py-3 px-2 text-sm font-medium transition-colors rounded-[15px]"
                          style={
                            isSelected
                              ? {
                                border: "2px solid transparent",
                                backgroundImage:
                                  "linear-gradient(#FFF, #FFF), linear-gradient(114deg, #ED457D 11.36%, #FA8F42 90.28%)",
                                backgroundOrigin: "border-box",
                                backgroundClip: "padding-box, border-box",
                                color: "#ED457D", // optional: highlight text
                              }
                              : {
                                border: "1px solid rgba(26, 26, 26, 0.10)",
                                background: "#FFF",
                                color: "#1A1A1A", // dark text
                              }
                          }
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirmation Text */}
                {selectedDate && selectedTime && (
                  <div className="mt-6 text-center text-xs text-gray-600">
                    Scheduled for: <span className="font-semibold text-gray-900">{formatSelectedDateTime()}</span>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    handleContinue();
                  }}
                  disabled={!selectedDate || !selectedTime}
                  className="text-white  mt-6  mx-auto py-4 px-10 flex items-center justify-center rounded-[50px] font-medium text-base shadow-lg  transition-transform duration-200 transform hover:scale-105"
                  style={{
                    background: "linear-gradient(114deg, #ED457D 11.36%, #FA8F42 90.28%)",
                  }}
                >
                  Continue to Delivery Method
                  <span className="ml-2">▶</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button (for immediate option) */}
        {selectedOption === 'immediate' && (
          <div className="text-center mt-12">
            <button
              className="text-white py-4 px-10 rounded-[50px] font-medium text-base shadow-lg inline-flex items-center transition-transform duration-200 transform hover:scale-105"
              style={{
                background: "linear-gradient(114deg, #ED457D 11.36%, #FA8F42 90.28%)",
              }}
            >
              Continue to Delivery Method
              <span className="ml-3 text-lg">▶</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimingSelectorStep;