"use client"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { goBack, setCurrentStep } from "../../../redux/giftFlowSlice"
import BrandSelectionStep from "./BrandSelectionStep"
import GiftCardSelector from "./GiftCardSelector"
import OccasionSelector from "./OccasionSelector"
import SubCategorySelector from "./SubCategorySelector"
import PersonalMessageStep from "./PersonalMessageStep"
import TimingSelectorStep from "./TimingSelectorStep"
import DeliveryMethodStep from "./DeliveryMethodStep"
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
  const dispatch = useDispatch()
  const { currentStep, deliveryMethod } = useSelector((state) => state.giftFlowReducer)
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const isBulkMode = mode === 'bulk'

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [currentStep, mode])

  const handleMobilePrevious = () => {
    if (isBulkMode && currentStep === 3) {
      dispatch(setCurrentStep(1))
      return
    }

    if (isBulkMode && currentStep === 8) {
      dispatch(setCurrentStep(7))
      return
    }

    if (!isBulkMode && currentStep === 8 && deliveryMethod !== "email") {
      dispatch(setCurrentStep(6))
      return
    }

    dispatch(goBack())
  }

  const renderStep = () => {
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
        return mode === 'bulk' ? <BulkOrderSetup /> : <DeliveryMethodStep />
      case 7:
        return mode === 'bulk' ? <BulkReviewStep /> : <TimingSelectorStep />
      case 8:
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

  return (
    <>
      {currentStep > 1 && (
        <div className="border-b border-pink-100 bg-white px-4 py-3 shadow-sm md:hidden">
          <button
            type="button"
            onClick={handleMobilePrevious}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#F5C8D5] bg-white px-4 text-sm font-semibold text-[#4A4A4A] shadow-sm"
            aria-label="Go to previous step"
          >
            <ArrowLeft className="h-4 w-4 text-[#ED457D]" />
            Previous
          </button>
        </div>
      )}
      {renderStep()}
    </>
  )
}

export default StepRenderer
