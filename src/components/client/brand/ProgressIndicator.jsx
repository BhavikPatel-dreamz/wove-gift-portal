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
  { id: 10, name: 'Complete', description: 'Gift delivered successfully', component: 'FinalSelection' }
];

// Progress indicator component
const ProgressIndicator = () => {
  const { currentStep } = useSelector((state) => state.giftFlowReducer);

  // Calculate progress percentage
  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-4 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max px-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                step.id < currentStep 
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg' 
                  : step.id === currentStep
                  ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg ring-4 ring-orange-200'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.id < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 mx-2 transition-colors ${
                  step.id < currentStep ? 'text-green-500' : 
                  step.id === currentStep ? 'text-orange-500' : 'text-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {STEPS.find(s => s.id === currentStep)?.name || 'Unknown Step'}
        </h2>
        <p className="text-sm text-gray-600">
          Step {currentStep} of {STEPS.length} • {STEPS.find(s => s.id === currentStep)?.description || 'Processing...'}
        </p>
        
        {/* Additional progress info */}
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;