import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { goBack, goNext, setSelectedTiming } from "../../../redux/giftFlowSlice";
import { ArrowLeft, Calendar, Clock, Check, X, SendIcon } from "lucide-react";
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

  // Generate time slots with 5-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 2) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time24);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Convert 24-hour format to 12-hour format
  const formatTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

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
      return `${date.toLocaleDateString('en-US', options)} at ${formatTo12Hour(selectedTime)}`;
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
    <div className="min-h-screen bg-white px-8 py-30">
      <div className="max-w-7xl mx-auto">
        {/* Previous Button */}
        <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
          <button
            onClick={() => dispatch(goBack())}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 
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
            <span className="text-base font-semibold text-gray-800">
              Previous
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 pt-10">
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-gray-900 mb-2 sm:mb-3">
            Send Now or Later?
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Choose the perfect timing for your gift delivery
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
          {/* Send Immediately */}
          <div
            onClick={() => handleTimingSelect('immediate')}
            className={`relative p-8 border cursor-pointer transition-all duration-300 hover:shadow-lg text-center ${selectedOption === 'immediate'
              ? 'border-blue-400 bg-blue-50 shadow-lg rounded-[20px] '
              : 'border-[#1A1A1A33] rounded-[20px] bg-[#E9F3FF] hover:border-blue-300'
              }`}
          >
            <div className="p-[12.5px] w-16 h-16 bg-[#206CC2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46.4197 6.73139C46.4906 6.25618 46.4286 5.77061 46.2406 5.32845C46.0526 4.88629 45.7459 4.5048 45.3544 4.22621C44.963 3.94762 44.502 3.78281 44.0227 3.75002C43.5433 3.71724 43.0642 3.81777 42.6385 4.04047L3.94483 24.3551C3.49339 24.59 3.12094 24.9525 2.87376 25.3973C2.62658 25.8422 2.51555 26.3499 2.55449 26.8574C2.59342 27.3648 2.78059 27.8496 3.09275 28.2516C3.40491 28.6535 3.82829 28.9549 4.31029 29.1183L16.3337 33.2404L38.792 12.25L20.6171 34.7083L38.1672 40.7251C38.5277 40.848 38.9106 40.8904 39.2892 40.8493C39.6677 40.8082 40.0327 40.6846 40.3583 40.4873C40.6839 40.2899 40.9624 40.0235 41.1739 39.707C41.3855 39.3904 41.5251 39.0313 41.583 38.6549L46.4197 6.73139Z" fill="white" />
                <path d="M18.0323 35.9803V42.6566C18.0325 43.1578 18.1776 43.6483 18.45 44.0691C18.7224 44.4898 19.1106 44.8229 19.5679 45.0282C20.0251 45.2336 20.532 45.3024 21.0275 45.2265C21.5229 45.1506 21.9859 44.9331 22.3607 44.6002L28.1549 39.4511L18.0323 35.9803Z" fill="white" fillOpacity="0.5" />
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
              : 'border-[#1A1A1A33] rounded-[20px] bg-[#FAF6FF] hover:border-purple-300'
              }`}
          >
            <div className="w-16 h-16 p-3 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.64754 36.3999H37.7497C38.0466 36.3999 38.3335 36.2961 38.5611 36.1067C38.879 35.8405 46.1317 29.6013 46.5739 16.1333H11.0229C10.5824 28.3586 3.90299 34.1049 3.83358 34.1622C3.42664 34.5061 3.27692 35.0677 3.46 35.5675C3.64181 36.066 4.11562 36.3999 4.64754 36.3999ZM45.3496 8.53333H39.0163V7.26666C39.0163 6.55733 38.4589 6 37.7496 6C37.0403 6 36.4829 6.55733 36.4829 7.26666V8.53333H30.0652V7.26666C30.0652 6.55733 29.5078 6 28.7985 6C28.0892 6 27.5318 6.55733 27.5318 7.26666V8.53333H21.1985V7.26666C21.1985 6.55733 20.6412 6 19.9319 6C19.2225 6 18.6652 6.55733 18.6652 7.26666V8.53333H12.3319C11.6225 8.53333 11.0652 9.09066 11.0652 9.79999V13.6H46.6162V9.79999C46.6162 9.09066 46.0589 8.53333 45.3496 8.53333Z" fill="white" />
                <path d="M40.1879 38.0489C39.5001 38.6216 38.6367 38.9333 37.7498 38.9333H11.0654V42.7333C11.0654 43.4335 11.632 44 12.3321 44H45.3498C46.0499 44 46.6165 43.4335 46.6165 42.7333V28.5344C44.1743 34.5258 40.7665 37.5646 40.1879 38.0489Z" fill="white" fillOpacity="0.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Schedule for Later</h3>
            <p className="text-sm text-gray-600">
              Perfect timing for birthdays, anniversaries, or special moments
            </p>
          </div>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[95vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setShowScheduleModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-center text-gray-900">
                  Select Date & Time
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 text-center mt-1">
                  Choose when you want your gift to arrive
                </p>
              </div>

              <div className="p-4 sm:p-6">
                {/* Responsive Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Calendar Section */}
                  <div className="rounded-[20px] border border-[rgba(26,26,26,0.1)] bg-white p-4 sm:p-5">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Date
                    </label>

                    {/* Month / Year Selectors */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <select
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                        className="px-2 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white"
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>{month}</option>
                        ))}
                      </select>

                      <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                        className="px-2 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white"
                      >
                        {[2025, 2026, 2027].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Calendar Grid */}
                    <div className="border border-gray-200 rounded-lg p-2 sm:p-3">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                          <div key={day} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots Section */}
                  <div className="rounded-[20px] border border-[rgba(26,26,26,0.1)] bg-white p-4 sm:p-5">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Time
                    </label>

                    {/* Custom Scrollbar Styles */}
                    <style>{`
                      .time-slots-container::-webkit-scrollbar {
                        width: 8px;
                      }
                      .time-slots-container::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 10px;
                      }
                      .time-slots-container::-webkit-scrollbar-thumb {
                        background: linear-gradient(114deg, #ED457D 11.36%, #FA8F42 90.28%);
                        border-radius: 10px;
                      }
                      .time-slots-container::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(114deg, #d63d6f 11.36%, #e8813a 90.28%);
                      }
                    `}</style>

                    <div
                      className="time-slots-container grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-70 sm:max-h-80 overflow-y-auto pr-2"
                    >
                      {timeSlots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className="py-2 px-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-all hover:scale-105"
                            style={
                              isSelected
                                ? {
                                  border: "2px solid transparent",
                                  backgroundImage:
                                    "linear-gradient(#FFF,#FFF),linear-gradient(114deg,#ED457D,#FA8F42)",
                                  backgroundOrigin: "border-box",
                                  backgroundClip: "padding-box,border-box",
                                  color: "#ED457D",
                                  fontWeight: "600"
                                }
                                : {
                                  border: "1px solid rgba(26,26,26,0.1)",
                                  background: "#FFF",
                                  color: "#1A1A1A",
                                }
                            }
                          >
                            {formatTo12Hour(time)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Confirmation Message */}
                {selectedDate && selectedTime && (
                  <div className="mt-6 p-4 bg-linear-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-200">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        Your gift will be delivered on
                      </p>
                      <p className="text-sm sm:text-base font-bold text-gray-900">
                        {formatSelectedDateTime()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    handleContinue();
                  }}
                  disabled={!selectedDate || !selectedTime}
                  className="mt-6 mx-auto flex items-center justify-center gap-2 py-3 sm:py-4 px-8 sm:px-10 rounded-full text-white text-sm sm:text-base font-medium shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: "linear-gradient(114deg, #ED457D 11.36%, #FA8F42 90.28%)",
                  }}
                >
                  Continue to Delivery Method
                  <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                  </svg>

                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button (for immediate option) */}
        {selectedOption === 'immediate' && (
          <div className="text-center mt-12">
            <button
              className="text-white py-4 px-10 rounded-[50px] font-medium text-base shadow-lg inline-flex items-center transition-transform duration-200 transform hover:scale-105 gap-2 "
              style={{
                background: "linear-gradient(114deg, #ED457D 11.36%, #FA8F42 90.28%)",
              }}
              onClick={() => {
                setShowScheduleModal(false);
                handleContinue();
              }}
            >
              Continue to Delivery Method
              <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
              </svg>

            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimingSelectorStep;