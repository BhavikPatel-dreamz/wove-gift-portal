import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDeliveryFormEditReturn,
  goBack,
  goNext,
  setCurrentStep,
  setPersonalMessage,
} from "../../../redux/giftFlowSlice";
import { Smile, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import EmojiPicker from "emoji-picker-react";

const MESSAGE_EXAMPLES = [
  { occasion: "Birthday", text: "Wishing you a birthday filled with joy, laughter, and everything that makes you smile." },
  { occasion: "Birthday", text: "Happy birthday. Hope this little gift adds something special to your day." },
  { occasion: "Birthday", text: "Another year of you is something worth celebrating. Enjoy every moment." },
  { occasion: "Anniversary", text: "Wishing you both many more years of love, laughter, and beautiful memories." },
  { occasion: "Anniversary", text: "Happy anniversary. May your love keep growing stronger with every year." },
  { occasion: "Wedding", text: "Wishing you a lifetime of happiness, partnership, and unforgettable moments together." },
  { occasion: "Wedding", text: "Congratulations on your wedding. May this new chapter be full of love and joy." },
  { occasion: "Engagement", text: "Congratulations on your engagement. Wishing you both a beautiful journey ahead." },
  { occasion: "Graduation", text: "Congratulations on this amazing achievement. Your hard work truly deserves celebrating." },
  { occasion: "Graduation", text: "You did it. Wishing you confidence and excitement for everything that comes next." },
  { occasion: "New Job", text: "Congratulations on the new role. Wishing you success, growth, and fresh inspiration." },
  { occasion: "Promotion", text: "So proud of your promotion. You earned this moment, and I hope you enjoy it fully." },
  { occasion: "Retirement", text: "Congratulations on your retirement. Wishing you rest, joy, and wonderful new adventures." },
  { occasion: "Farewell", text: "Wishing you all the best in your next chapter. You will be missed more than you know." },
  { occasion: "Thank You", text: "Thank you for your kindness and support. It means more than words can say." },
  { occasion: "Thank You", text: "A small gift for someone who has made a big difference. Thank you." },
  { occasion: "Congratulations", text: "Congratulations. This is such a special moment, and I am so happy for you." },
  { occasion: "Get Well", text: "Thinking of you and wishing you a smooth, restful recovery. Hope this brightens your day." },
  { occasion: "Get Well", text: "Sending warm thoughts and a little something to lift your spirits while you heal." },
  { occasion: "Sympathy", text: "Thinking of you with care and sending comfort during this difficult time." },
  { occasion: "Sorry", text: "I am sorry, and I hope this small gesture helps express what words cannot fully say." },
  { occasion: "New Baby", text: "Congratulations on your beautiful new arrival. Wishing your family love, rest, and joy." },
  { occasion: "Baby Shower", text: "Wishing you so much joy as you get ready to welcome your little one." },
  { occasion: "Housewarming", text: "Wishing you happiness, comfort, and beautiful memories in your new home." },
  { occasion: "Mother's Day", text: "Happy Mother's Day. Thank you for your love, strength, and everything you do." },
  { occasion: "Father's Day", text: "Happy Father's Day. Thank you for your guidance, care, and steady support." },
  { occasion: "Valentine's Day", text: "You make life sweeter in so many ways. Happy Valentine's Day." },
  { occasion: "Christmas", text: "Wishing you a warm and joyful Christmas filled with peace, love, and happy moments." },
  { occasion: "Holiday", text: "Wishing you a peaceful holiday season and a bright start to the year ahead." },
  { occasion: "Eid", text: "Eid Mubarak. Wishing you and your loved ones peace, joy, and blessings." },
  { occasion: "Diwali", text: "Wishing you a Diwali filled with light, happiness, and beautiful new beginnings." },
  { occasion: "Friendship", text: "Grateful for your friendship and all the little ways you make life better." },
  { occasion: "Just Because", text: "No special reason, just a little something to remind you that you are appreciated." },
  { occasion: "Thinking of You", text: "Thinking of you today and sending a little brightness your way." },
  { occasion: "Good Luck", text: "Good luck. I believe in you and cannot wait to see what you do next." },
  { occasion: "Welcome", text: "Welcome. Wishing you a smooth start and many happy moments ahead." },
  { occasion: "Host", text: "Thank you for hosting with such warmth and care. This is a small token of appreciation." },
  { occasion: "Teacher", text: "Thank you for your patience, care, and the difference you make every day." },
  { occasion: "Team", text: "Thank you for your hard work and energy. Your contribution is truly appreciated." },
  { occasion: "General", text: "I hope this gift brings a smile to your face and a little joy to your day." },
];

const normalizeText = (value) => String(value || "").toLowerCase();

const getOccasionScore = (example, selectedOccasionName) => {
  const selected = normalizeText(selectedOccasionName);
  const occasion = normalizeText(example.occasion);

  if (!selected) return example.occasion === "General" ? 1 : 0;
  if (occasion !== "general" && (selected.includes(occasion) || occasion.includes(selected))) {
    return 3;
  }
  if (occasion === "general") return 1;
  return 0;
};

const formatExampleMessage = (exampleText) => `Hi Stefan,\n\n${exampleText}`;

const PersonalMessageStep = () => {
  const dispatch = useDispatch();
  const { personalMessage, deliveryFormEditReturn, selectedOccasionName } = useSelector((state) => state.giftFlowReducer);
  const [message, setMessage] = useState(personalMessage || '');
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMessageIdeas, setShowMessageIdeas] = useState(false);
  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const textareaRef = useRef(null);
  const maxChars = 300;
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  const updateMessage = (newMessage) => {
    if (newMessage.length <= maxChars) {
      setMessage(newMessage);
      dispatch(setPersonalMessage(newMessage));
      if (newMessage.trim().length > 0) {
        setError('');
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event) => {
      const clickedInsidePicker = pickerRef.current?.contains(event.target);
      const clickedEmojiButton = emojiButtonRef.current?.contains(event.target);

      if (!clickedInsidePicker && !clickedEmojiButton) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showEmojiPicker]);

  const handleMessageChange = (e) => {
    updateMessage(e.target.value);
  };

  const messageExamples = [...MESSAGE_EXAMPLES].sort((a, b) => {
    const scoreDifference =
      getOccasionScore(b, selectedOccasionName) - getOccasionScore(a, selectedOccasionName);

    if (scoreDifference !== 0) return scoreDifference;
    return a.occasion.localeCompare(b.occasion);
  });

  const handleExampleClick = (exampleText) => {
    updateMessage(formatExampleMessage(exampleText));
    setShowMessageIdeas(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData?.emoji || "";
    if (!emoji) return;

    const textareaEl = textareaRef.current;
    if (!textareaEl) {
      updateMessage(`${message}${emoji}`);
      setShowEmojiPicker(false);
      return;
    }

    const selectionStart = textareaEl.selectionStart ?? message.length;
    const selectionEnd = textareaEl.selectionEnd ?? message.length;

    const newMessage =
      message.slice(0, selectionStart) + emoji + message.slice(selectionEnd);

    const isUpdated = updateMessage(newMessage);
    if (!isUpdated) return;

    const cursorPosition = selectionStart + emoji.length;
    requestAnimationFrame(() => {
      textareaEl.focus();
      textareaEl.setSelectionRange(cursorPosition, cursorPosition);
    });
    setShowEmojiPicker(false);
  };

  const handleContinue = () => {
    // Validate message is not empty
    // if (!message.trim() || message.trim().length === 0) {
    //   setError('Please write a message before continuing');
    //   return;
    // }

    // Clear error and proceed
    setError('');
    if (deliveryFormEditReturn?.enabled) {
      const returnStep = deliveryFormEditReturn?.returnStep || 7;
      dispatch(setCurrentStep(returnStep));
      if (returnStep !== 7) {
        dispatch(clearDeliveryFormEditReturn());
      }
      return;
    }
    dispatch(goNext());
  };

  const isMessageEmpty = !message.trim() || message.trim().length === 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-5 pb-10 sm:py-24 md:px-8 md:py-30">
      <div className="max-w-7xl mx-auto sm:px-6">

        {/* Back Button and Bulk Mode Indicator */}
        <div className="relative hidden flex-col items-start gap-4 mb-6
                md:flex md:flex-row md:items-center md:justify-between md:gap-0">

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
              <div className="hidden md:block w-30 h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />

              <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    Bulk Gifting
                  </span>
                </div>
              </div>

              <div className="hidden md:block w-30 h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
            </div>
          )}

          {/* Desktop spacer only */}
          <div className="hidden md:block w-35" />
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 text-black">
            Write from Your Heart
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Add a heartfelt message to make this gift card special
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

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div className="w-full sm:w-auto px-3 py-2 rounded-[24px] bg-[rgba(250,143,66,0.1)] border border-pink-200 text-sm font-semibold leading-4.5 
                  text-[#4A4A4A] font-['Inter']">
                ❤️ Tip: Be genuine and speak from the heart
              </div>
              <button
                type="button"
                onClick={() => setShowMessageIdeas(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ED457D]/30 bg-white px-4 py-2 text-sm font-semibold text-[#ED457D] transition hover:bg-pink-50 sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                Message suggestions
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              rows={5}
              placeholder="Write something meaningful..."
              className={`w-full p-4 sm:p-6 resize-none bg-white 
    text-sm sm:text-base text-[#4A4A4A]
    rounded-[20px] 
    border border-[rgba(26,26,26,0.1)] 
    shadow-[0_4px_20px_rgba(128,128,128,0.1)]
    pr-20 pb-12
    ${error ? 'border-red-400' : ''}
    focus:outline-none focus:ring-0 focus:border-[rgba(26,26,26,0.2)]`}
            />

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-full bg-gray-100 text-xs sm:text-sm text-gray-600 font-medium">
                {message.length}/{maxChars}
              </div>
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="w-8 h-8 rounded-full border border-[#ED457D] bg-white text-gray-700 flex items-center justify-center hover:bg-pink-50 transition-colors"
                aria-label="Open emoji picker"
              >
                <Smile size={16} />
              </button>
            </div>

            {showEmojiPicker && (
              <div
                ref={pickerRef}
                className="absolute left-1/2 right-auto bottom-14 z-30 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.18)] bg-white"
                style={{ width: "min(320px, calc(100vw - 2rem))" }}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  lazyLoadEmojis
                  searchDisabled={false}
                  skinTonesDisabled
                  previewConfig={{
                    showPreview: false,
                  }}
                  width="100%"
                  height={360}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {showMessageIdeas && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-4 sm:items-center sm:px-6">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-pink-100 px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-[#ED457D]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Message suggestions</h3>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      {selectedOccasionName ? `${selectedOccasionName} examples first` : "Examples for every occasion"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMessageIdeas(false)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 sm:text-sm"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {messageExamples.map((example, index) => (
                    <button
                      key={`${example.occasion}-${index}`}
                      type="button"
                      onClick={() => handleExampleClick(example.text)}
                      className="rounded-2xl border border-gray-100 bg-[#FEF8F6] px-3 py-3 text-left transition hover:border-[#ED457D]/40 hover:bg-white hover:shadow-sm"
                    >
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#ED457D]">
                        {example.occasion}
                      </span>
                      <span className="block whitespace-pre-line text-xs leading-5 text-gray-700 sm:text-sm">
                        {formatExampleMessage(example.text)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
        <button
  onClick={handleContinue}
  // disabled={isMessageEmpty}
  className={`group w-full sm:w-auto sm:max-w-fit mx-auto
  flex items-center justify-center gap-2
  px-6 md:px-10 py-3 md:py-4
  rounded-full font-semibold text-sm md:text-base
  transition-all duration-300
  shadow-md bg-gradient-to-r from-pink-500 to-orange-400 hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:shadow-xl hover:scale-105
  text-white text-center`}
>
           Choose  Delivery Method

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="9"
                  viewBox="0 0 8 9"
                  fill="none"
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
  );
}

export default PersonalMessageStep;
