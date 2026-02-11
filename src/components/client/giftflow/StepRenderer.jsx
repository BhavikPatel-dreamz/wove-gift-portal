"use client"
import { useSelector } from "react-redux"
import { useSearchParams } from "next/navigation"
import BrandSelectionStep from "./BrandSelectionStep"
import FinalSelectionStep from "./FinalSelectionStep"
import GiftCardSelector from "./GiftCardSelector"
import OccasionSelector from "./OccasionSelector"
import SubCategorySelector from "./SubCategorySelector"
import PersonalMessageStep from "./PersonalMessageStep"
import TimingSelectorStep from "./TimingSelectorStep"
import DeliveryMethodStep from "./DeliveryMethodStep"
import ReviewConfirmStep from "./ReviewConfirmStep"
import PaymentStep from "./PaymentStep"
import BulkOrderSetup from "./BulkOrderSetup"
import BulkReviewStep from "./BulkReviewStep"

const StepRenderer = ({ 
  brands, 
  loading, 
  error, 
  pagination,
  searchTerm,
  selectedCategory,
  currentPage,
  sortBy,
  updateUrlParams,
  clearFilters
}) => {
  const { currentStep } = useSelector((state) => state.giftFlowReducer)
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')

  switch (currentStep) {
    case 1:
      return (
        <BrandSelectionStep 
          brands={brands}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          currentPage={currentPage}
          sortBy={sortBy}
          updateUrlParams={updateUrlParams}
          clearFilters={clearFilters}
        />
      )
    case 2:
      return <GiftCardSelector />
    case 3:
      return <OccasionSelector />
    case 4:
      return <SubCategorySelector />
    case 5:
      return <PersonalMessageStep />
    case 6:
      return mode === 'bulk' ? <BulkOrderSetup /> : <TimingSelectorStep />
    case 7:
      return mode === 'bulk' ? <BulkReviewStep /> : <DeliveryMethodStep />
    case 8:
      return <ReviewConfirmStep />
    case 9:
      return <PaymentStep />
    default:
      return (
        <BrandSelectionStep 
          brands={brands}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          currentPage={currentPage}
          sortBy={sortBy}
          updateUrlParams={updateUrlParams}
          clearFilters={clearFilters}
        />
      )
  }
}

export default StepRenderer