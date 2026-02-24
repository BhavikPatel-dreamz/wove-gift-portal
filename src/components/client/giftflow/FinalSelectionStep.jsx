import { useDispatch, useSelector } from "react-redux";
import ProgressIndicator from "./ProgressIndicator";
import { goBack, resetFlow, clearCsvFileData } from "../../../redux/giftFlowSlice";
import { ArrowLeft } from "lucide-react";

const FinalSelectionStep = () => {
  const dispatch = useDispatch();
  const {
    selectedBrand,
    selectedAmount,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
    personalMessage
  } = useSelector((state) => state.giftFlowReducer);

  const handleComplete = () => {
    // Here you can add your completion logic
    alert("Selection completed! Check console for details.");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator />

        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-purple-500 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
            Review Your Selection
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Perfect! Here's a summary of your gift selection
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            {/* Brand Selection */}
            <div className="flex items-center p-4 bg-linear-to-r from-purple-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Selected Brand</h3>
                <p className="text-gray-600">{selectedBrand?.brandName || 'Not selected'}</p>
                {selectedBrand?.description && (
                  <p className="text-sm text-gray-500">{selectedBrand.description}</p>
                )}
              </div>
            </div>

            {/* Amount Selection */}
            <div className="flex items-center p-4 bg-linear-to-r from-pink-50 to-orange-50 rounded-lg">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Gift Amount</h3>
                <p className="text-gray-600">
                  {selectedAmount ?
                    `${selectedAmount.currency || 'USD'} ${selectedAmount.value}` :
                    'Not selected'
                  }
                </p>
              </div>
            </div>

            {/* Occasion Selection */}
            <div className="flex items-center p-4 bg-linear-to-r from-orange-50 to-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Occasion</h3>
                <p className="text-gray-600">
                  {selectedOccasion ? `Occasion ID: ${selectedOccasion}` : 'Not selected'}
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div className="flex items-center p-4 bg-linear-to-r from-teal-50 to-cyan-50 rounded-lg">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Category</h3>
                <p className="text-gray-600">
                  {selectedSubCategory ? `Category ID: ${selectedSubCategory}` : 'Not selected'}
                </p>
              </div>
            </div>

            {/* Timing Selection */}
            <div className="flex items-center p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Delivery Timing</h3>
                <p className="text-gray-600">
                  {selectedTiming
                    ? (typeof selectedTiming === "object"
                      ? JSON.stringify(selectedTiming)
                      : selectedTiming)
                    : "Not selected"}
                </p>

              </div>
            </div>

            {/* Personal Message */}
            <div className="flex items-center p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                6
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Personal Message</h3>
                <p className="text-gray-600">
                  {personalMessage ? personalMessage : "No message added"}
                </p>
              </div>
            </div>

          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleComplete}
              className="flex-1 bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🎉 Complete Selection
            </button>
            <button
              onClick={() => {
                dispatch(resetFlow());
                dispatch(clearCsvFileData());
              }}
              className="px-8 py-4 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalSelectionStep;