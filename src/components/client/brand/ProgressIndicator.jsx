import { ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

const STEPS = [
  { id: 1, name: 'Brand Selection', description: 'Choose your perfect brand', component: 'BrandSelection' },
  { id: 2, name: 'Gift Amount', description: 'Select gift card amount', component: 'GiftCardSelector' },
  { id: 3, name: 'Occasion', description: 'What\'s the occasion?', component: 'OccasionSelector' },
  { id: 4, name: 'Category', description: 'Choose a category', component: 'SubCategorySelector' },
  { id: 5, name: 'Your Message', description: 'Write from your heart', component: 'PersonalMessage' },
  { id: 6, name: 'Perfect Timing', description: 'Timing the magic', component: 'TimingSelector' },
  { id: 7, name: 'Delivery Method', description: 'How to send your gift', component: 'DeliveryMethod' },
  { id: 8, name: 'Review & Confirm', description: 'Final review before payment', component: 'ReviewConfirm' },
  { id: 9, name: 'Secure Payment', description: 'Complete your purchase', component: 'Payment' },
  // { id: 10, name: 'Complete', description: 'Gift delivered successfully', component: 'FinalSelection' }
];

// Progress indicator component
const ProgressIndicator = () => {
  const { currentStep } = useSelector((state) => state.giftFlowReducer);

  // Calculate progress percentage
  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="mb-8 px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full h-3 shadow-inner overflow-hidden">
          <div 
            className="absolute top-0 left-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundSize: '200% 100%',
              animation: progressPercentage > 0 ? 'shimmer 2s infinite' : 'none'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-6 overflow-x-auto">
        <div className="flex items-center space-x-3 min-w-max px-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-500 ease-out transform hover:scale-105 ${
                step.id < currentStep 
                  ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 text-white shadow-lg shadow-green-200 ring-2 ring-green-300 ring-opacity-50' 
                  : step.id === currentStep
                  ? 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white shadow-xl shadow-pink-300 ring-4 ring-orange-200'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 shadow-inner border border-gray-300'
              }`}>
                {step.id < currentStep ? (
                  <svg className="w-5 h-5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="drop-shadow-sm">{step.id}</span>
                )}
                {step.id === currentStep && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full opacity-20 animate-ping"></div>
                )}
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className={`w-5 h-5 mx-3 transition-all duration-300 transform ${
                  step.id < currentStep ? 'text-emerald-500 drop-shadow-sm scale-110' : 
                  step.id === currentStep ? 'text-orange-500 drop-shadow-sm animate-bounce' : 'text-gray-400'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-2 drop-shadow-sm">
          {STEPS.find(s => s.id === currentStep)?.name || 'Unknown Step'}
        </h2>
        <p className="text-base text-gray-600 font-medium leading-relaxed max-w-md mx-auto">
          Step {currentStep} of {STEPS.length} • {STEPS.find(s => s.id === currentStep)?.description || 'Processing...'}
        </p>
        
        {/* Additional progress info */}
        <div className="mt-4">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 text-orange-800 border border-orange-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full mr-2 animate-pulse"></div>
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ProgressIndicator;