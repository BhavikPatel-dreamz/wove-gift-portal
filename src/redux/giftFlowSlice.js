import { createSlice } from "@reduxjs/toolkit";

const giftFlowSlice = createSlice({
  name: "giftFlow",
  initialState: {
    currentStep: 1,
    selectedBrand: null,
    selectedAmount: null,
    selectedOccasion: null,
    selectedSubCategory: null,
    selectedTiming: null,
    personalMessage: "",
    deliveryMethod: "email",
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
      printDetails: {},
    },

    // Brand filtering & pagination
    searchTerm: "",
    selectedCategory: "All Categories",
    currentPage: 1,
    sortBy: "featured",
    favorites: [],
    categories: ["All Categories"],

    // Data states
    premiumBrands: [],
    occasions: [],
    subCategories: [],

    // Loading & Error states
    loading: false,
    error: null,

    // Pagination states
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 12,
      hasMore: false,
    },
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
              printDetails: {},
            };
            break;
        }
      }
    },

    goNext: (state, action) => {
      const increment = action.payload || 1; // Default to 1 if no payload
      state.currentStep = Math.min(10, state.currentStep + increment);
    },
    
    resetFlow: () => {
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
          printDetails: {},
        },
        searchTerm: "",
        selectedCategory: "All Categories",
        currentPage: 1,
        sortBy: "featured",
        favorites: [],
        categories: ["All Categories"],
        premiumBrands: [],
        occasions: [],
        subCategories: [],
        loading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 12,
          hasMore: false,
        },
        occasionsPagination: null,
        subCategoriesPagination: null,
        currentOccasionPage: 1,
        currentSubCategoryPage: 1,
        selectedPaymentMethod: null,
      };
    },

    // Brand Selection
    setSelectedBrand: (state, action) => {
      let brand = { ...action.payload };

      if (brand) {
        if (brand.createdAt) {
          brand.createdAt = new Date(brand.createdAt).toISOString();
        }
        if (brand.updatedAt) {
          brand.updatedAt = new Date(brand.updatedAt).toISOString();
        }

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
            if (newVoucher.expiresAt) {
              newVoucher.expiresAt = new Date(
                newVoucher.expiresAt
              ).toISOString();
            }

            // Serialize denominations
            if (
              newVoucher.denominations &&
              Array.isArray(newVoucher.denominations)
            ) {
              newVoucher.denominations = newVoucher.denominations.map(
                (denom) => {
                  const newDenom = { ...denom };
                  if (newDenom.createdAt) {
                    newDenom.createdAt = new Date(
                      newDenom.createdAt
                    ).toISOString();
                  }
                  if (newDenom.updatedAt) {
                    newDenom.updatedAt = new Date(
                      newDenom.updatedAt
                    ).toISOString();
                  }
                  if (newDenom.expiresAt) {
                    newDenom.expiresAt = new Date(
                      newDenom.expiresAt
                    ).toISOString();
                  }
                  return newDenom;
                }
              );
            }
            return newVoucher;
          });
        }
      }

      state.selectedBrand = brand;
    },

    // Filtering & Search
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to page 1 on search
    },

    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1; // Reset to page 1 on category change
    },

    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1; // Reset to page 1 on sort change
    },

    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    setCategories: (state, action) => {
      state.categories = action.payload;
    },

    resetFilters: (state) => {
      state.searchTerm = "";
      state.selectedCategory = "All Categories";
      state.sortBy = "featured";
      state.currentPage = 1;
    },

    // Brands Data
    setPremiumBrands: (state, action) => {
      const brands = action.payload.map((brand) => {
        const newBrand = { ...brand };
        if (newBrand.createdAt) {
          newBrand.createdAt = new Date(newBrand.createdAt).toISOString();
        }
        if (newBrand.updatedAt) {
          newBrand.updatedAt = new Date(newBrand.updatedAt).toISOString();
        }

        // Serialize vouchers and denominations
        if (newBrand.vouchers && Array.isArray(newBrand.vouchers)) {
          newBrand.vouchers = newBrand.vouchers.map((voucher) => {
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
            if (newVoucher.expiresAt) {
              newVoucher.expiresAt = new Date(
                newVoucher.expiresAt
              ).toISOString();
            }

            if (
              newVoucher.denominations &&
              Array.isArray(newVoucher.denominations)
            ) {
              newVoucher.denominations = newVoucher.denominations.map(
                (denom) => {
                  const newDenom = { ...denom };
                  if (newDenom.createdAt) {
                    newDenom.createdAt = new Date(
                      newDenom.createdAt
                    ).toISOString();
                  }
                  if (newDenom.updatedAt) {
                    newDenom.updatedAt = new Date(
                      newDenom.updatedAt
                    ).toISOString();
                  }
                  if (newDenom.expiresAt) {
                    newDenom.expiresAt = new Date(
                      newDenom.expiresAt
                    ).toISOString();
                  }
                  return newDenom;
                }
              );
            }
            return newVoucher;
          });
        }
        return newBrand;
      });
      state.premiumBrands = brands;
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },

    // Favorites
    toggleFavorite: (state, action) => {
      const brandId = action.payload;
      if (state.favorites.includes(brandId)) {
        state.favorites = state.favorites.filter((id) => id !== brandId);
      } else {
        state.favorites.push(brandId);
      }
    },

    // Timing & Delivery
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

    // Amount & Occasions
    setSelectedAmount: (state, action) => {
      state.selectedAmount = action.payload;
    },

    setSelectedOccasion: (state, action) => {
      state.selectedOccasion = action.payload;
    },

    setSelectedSubCategory: (state, action) => {
      state.selectedSubCategory = action.payload;
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

    // Loading & Error
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    // Payment
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
  setSortBy,
  setCurrentPage,
  setCategories,
  resetFilters,
  setPremiumBrands,
  setPagination,
  toggleFavorite,
  setSelectedTiming,
  setPersonalMessage,
  setDeliveryMethod,
  setDeliveryDetails,
  updateDeliveryDetail,
  setOccasions,
  setSubCategories,
  setLoading,
  setError,
  setSelectedPaymentMethod,
} = giftFlowSlice.actions;

export default giftFlowSlice.reducer;
