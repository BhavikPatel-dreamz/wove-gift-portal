"use client"
import { useSelector } from "react-redux";
import BrandSelectionStep from "./BrandSelectionStep";
import FinalSelectionStep from "./FinalSelectionStep";
import GiftCardSelector from "./GiftCardSelector";
import OccasionSelector from "./OccasionSelector";
import SubCategorySelector from "./SubCategorySelector";


const StepRenderer = () => {
    const state = useSelector((state) => state);
    console.log("state",state);
  const {currentStep} = useSelector((state) => state.giftFlowReducer);

  switch (currentStep) {
    case 1:
      return <BrandSelectionStep />;
    case 2:
      return <GiftCardSelector />;
    case 3:
      return <OccasionSelector />;
    case 4:
      return <SubCategorySelector />;
    case 5:
      return <FinalSelectionStep />;
    default:
      return <BrandSelectionStep />;
  }
};

export default StepRenderer;