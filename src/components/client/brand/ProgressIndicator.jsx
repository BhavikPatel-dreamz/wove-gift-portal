import { ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";


const STEPS = [
  { id: 1, name: 'Brand Selection', description: 'Choose your perfect brand', component: 'BrandSelection' },
  { id: 2, name: 'Occasion', description: 'What\'s the occasion?', component: 'OccasionSelector' },
  { id: 3, name: 'Category', description: 'Choose a category', component: 'SubCategorySelector' },
  { id: 4, name: 'Gift Amount', description: 'Select gift card amount', component: 'GiftCardSelector' },
  { id: 5, name: 'Final Selection', description: 'Complete your selection', component: 'FinalSelection' }
];

// Progress indicator component
const ProgressIndicator = () => {
  const { currentStep } = useSelector((state) => state.giftFlowReducer);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-4 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max px-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                step.id <= currentStep 
                  ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.id}
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 mx-2 transition-colors ${
                  step.id < currentStep ? 'text-orange-500' : 'text-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {STEPS.find(s => s.id === currentStep)?.name}
        </h2>
        <p className="text-sm text-gray-600">
          Step {currentStep} of {STEPS.length} • {STEPS.find(s => s.id === currentStep)?.description}
        </p>
      </div>
    </div>
  );
};

// Brand selection component

export default ProgressIndicator;