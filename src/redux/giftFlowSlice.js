import { createSlice } from "@reduxjs/toolkit";

const giftFlowSlice = createSlice({
  name: "giftFlow",
  initialState: {
    currentStep: 1,
    selectedBrand: null,
    selectedAmount: null,
    selectedOccasion: null,
    selectedSubCategory: null,
    selectedTiming: null, // Stores timing selection
    personalMessage: "", // Stores user's message
    deliveryMethod: "email", // 'whatsapp', 'email', 'print'
    deliveryDetails: {
      // WhatsApp fields
      yourName: "",
      yourWhatsAppNumber: "",
      recipientName: "",
      recipientWhatsAppNumber: "",
      deliveryTips: [],
      previewMessage: false,
      
      // Email fields
      yourFullName: "",
      yourEmailAddress: "",
      recipientFullName: "",
      recipientEmailAddress: "",
      
      // Print fields
      printDetails: {}
    },
    searchTerm: "",
    selectedCategory: "All Categories",
    favorites: [],
    // Data states
    premiumBrands: [],
    occasions: [],
    subCategories: [],
    loading: false,
    error: null,
    // Pagination states
    occasionsPagination: null,
    subCategoriesPagination: null,
    currentOccasionPage: 1,
    currentSubCategoryPage: 1,
    selectedPaymentMethod: null,
  },
  reducers: {
    updateState: (state, action) => {
      return { ...state, ...action.payload };
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    goBack: (state) => {
      const currentStep = state.currentStep;
      if (currentStep > 1) {
        state.currentStep = currentStep - 1;

        // Clear relevant data when going back
        switch (currentStep) {
          case 2:
            state.selectedBrand = null;
            break;
          case 3:
            state.selectedAmount = null;
            break;
          case 4:
            state.selectedOccasion = null;
            state.subCategories = [];
            state.currentSubCategoryPage = 1;
            break;
          case 5:
            state.selectedSubCategory = null;
            break;
          case 6:
            state.personalMessage = "";
            break;
          case 7:
            state.selectedTiming = null;
            break;
          case 8:
            state.deliveryMethod = null;
            state.deliveryDetails = {
              yourName: "",
              yourWhatsAppNumber: "",
              recipientName: "",
              recipientWhatsAppNumber: "",
              deliveryTips: [],
              previewMessage: false,
              yourFullName: "",
              yourEmailAddress: "",
              recipientFullName: "",
              recipientEmailAddress: "",
              printDetails: {}
            };
            break;
        }
      }
    },
    goNext: (state) => {
      state.currentStep = Math.min(10, state.currentStep + 1);
    },
    resetFlow: (state) => {
      return {
        currentStep: 1,
        selectedBrand: null,
        selectedAmount: null,
        selectedOccasion: null,
        selectedSubCategory: null,
        selectedTiming: null,
        personalMessage: "",
        deliveryMethod: null,
        deliveryDetails: {
          yourName: "",
          yourWhatsAppNumber: "",
          recipientName: "",
          recipientWhatsAppNumber: "",
          deliveryTips: [],
          previewMessage: false,
          yourFullName: "",
          yourEmailAddress: "",
          recipientFullName: "",
          recipientEmailAddress: "",
          printDetails: {}
        },
        searchTerm: "",
        selectedCategory: "All Categories",
        favorites: [],
        premiumBrands: [],
        occasions: [],
        subCategories: [],
        loading: false,
        error: null,
        occasionsPagination: null,
        subCategoriesPagination: null,
        currentOccasionPage: 1,
        currentSubCategoryPage: 1,
      };
    },
    setSelectedBrand: (state, action) => {
      let brand = { ...action.payload };

      if (brand) {
        // Serialize dates on the brand object
        if (brand.createdAt) {
          brand.createdAt = new Date(brand.createdAt).toISOString();
        }
        if (brand.updatedAt) {
          brand.updatedAt = new Date(brand.updatedAt).toISOString();
        }

        // Serialize dates in the vouchers array
        if (brand.vouchers && Array.isArray(brand.vouchers)) {
          brand.vouchers = brand.vouchers.map((voucher) => {
            const newVoucher = { ...voucher };
            if (newVoucher.createdAt) {
              newVoucher.createdAt = new Date(
                newVoucher.createdAt
              ).toISOString();
            }
            if (newVoucher.updatedAt) {
              newVoucher.updatedAt = new Date(
                newVoucher.updatedAt
              ).toISOString();
            }
            return newVoucher;
          });
        }
      }

      state.selectedBrand = brand;
    },
    setSelectedTiming: (state, action) => {
      state.selectedTiming = action.payload;
    },
    setPersonalMessage: (state, action) => {
      state.personalMessage = action.payload;
    },
    setDeliveryMethod: (state, action) => {
      state.deliveryMethod = action.payload;
    },
    setDeliveryDetails: (state, action) => {
      state.deliveryDetails = { ...state.deliveryDetails, ...action.payload };
    },
    updateDeliveryDetail: (state, action) => {
      const { field, value } = action.payload;
      state.deliveryDetails[field] = value;
    },
    setSelectedAmount: (state, action) => {
      state.selectedAmount = action.payload;
    },
    setSelectedOccasion: (state, action) => {
      state.selectedOccasion = action.payload;
    },
    setSelectedSubCategory: (state, action) => {
      state.selectedSubCategory = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    toggleFavorite: (state, action) => {
      const brandId = action.payload;
      if (state.favorites.includes(brandId)) {
        state.favorites = state.favorites.filter((id) => id !== brandId);
      } else {
        state.favorites.push(brandId);
      }
    },
    setPremiumBrands: (state, action) => {
      const brands = action.payload.map((brand) => {
        const newBrand = { ...brand };
        if (newBrand.createdAt) {
          newBrand.createdAt = new Date(newBrand.createdAt).toISOString();
        }
        if (newBrand.updatedAt) {
          newBrand.updatedAt = new Date(newBrand.updatedAt).toISOString();
        }
        return newBrand;
      });
      state.premiumBrands = brands;
    },
    setOccasions: (state, action) => {
      const { data, page, pagination } = action.payload;
      const serializedData = data.map((occasion) => {
        const newOccasion = { ...occasion };
        if (newOccasion.createdAt) {
          newOccasion.createdAt = new Date(newOccasion.createdAt).toISOString();
        }
        if (newOccasion.updatedAt) {
          newOccasion.updatedAt = new Date(newOccasion.updatedAt).toISOString();
        }
        return newOccasion;
      });

      if (page === 1) {
        state.occasions = serializedData;
      } else {
        state.occasions = [...state.occasions, ...serializedData];
      }
      state.occasionsPagination = pagination;
      state.currentOccasionPage = page;
    },
    setSubCategories: (state, action) => {
      const { data, page, pagination } = action.payload;
      const serializedData = data.map((subCategory) => {
        const newSubCategory = { ...subCategory };
        if (newSubCategory.createdAt) {
          newSubCategory.createdAt = new Date(
            newSubCategory.createdAt
          ).toISOString();
        }
        if (newSubCategory.updatedAt) {
          newSubCategory.updatedAt = new Date(
            newSubCategory.updatedAt
          ).toISOString();
        }
        return newSubCategory;
      });

      if (page === 1) {
        state.subCategories = serializedData;
      } else {
        state.subCategories = [...state.subCategories, ...serializedData];
      }
      state.subCategoriesPagination = pagination;
      state.currentSubCategoryPage = page;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSelectedPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
  },
});

export const {
  updateState,
  setCurrentStep,
  goBack,
  goNext,
  resetFlow,
  setSelectedBrand,
  setSelectedAmount,
  setSelectedOccasion,
  setSelectedSubCategory,
  setSearchTerm,
  setSelectedCategory,
  setSelectedTiming,
  setPersonalMessage,
  setDeliveryMethod,
  setDeliveryDetails,
  updateDeliveryDetail,
  toggleFavorite,
  setPremiumBrands,
  setOccasions,
  setSubCategories,
  setLoading,
  setError,
  setSelectedPaymentMethod,
} = giftFlowSlice.actions;

export default giftFlowSlice.reducer;