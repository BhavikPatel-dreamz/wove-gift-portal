import { configureStore } from "@reduxjs/toolkit";
import giftFlowReducer from "./giftFlowSlice";

export const store = configureStore({
  reducer: {
    giftFlowReducer: giftFlowReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'giftFlow/setSelectedBrand',
          'giftFlow/setPremiumBrands',
          'giftFlow/setOccasions',
          'giftFlow/setSubCategories',
          'giftFlow/goNext',
          'giftFlow/goBack',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: [
          'giftFlowReducer.selectedBrand.vouchers',
          'giftFlowReducer.selectedBrand.createdAt',
          'giftFlowReducer.selectedBrand.updatedAt',
          'giftFlowReducer.premiumBrands',
          'giftFlowReducer.occasions',
          'giftFlowReducer.subCategories',
        ],
      },
    }),
});

export default store;
