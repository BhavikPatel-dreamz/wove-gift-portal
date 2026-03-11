import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCartByUserId,
  addCartItem as addCartItemServer,
  updateCartItem as updateCartItemServer,
  removeCartItem as removeCartItemServer,
  clearCartByUserId,
} from '../lib/action/cartAction';

const defaultBulkCompanyInfo = {
  companyName: '',
  vatNumber: '',
  contactNumber: '',
  contactEmail: '',
};

const normalizeBulkDeliveryOption = (option, csvRecipients = []) => {
  const normalizedOption = typeof option === 'string' ? option.trim().toLowerCase() : '';

  // Legacy values are mapped to current UI values.
  if (
    normalizedOption === 'multiple' ||
    normalizedOption === 'csv' ||
    normalizedOption === 'emails' ||
    normalizedOption === 'individual' ||
    normalizedOption === 'individual_emails'
  ) {
    return 'multiple';
  }

  // Infer CSV mode from recipient payload for older saved cart items.
  if (!normalizedOption && Array.isArray(csvRecipients) && csvRecipients.length > 0) {
    return 'multiple';
  }

  return 'email';
};

const normalizeBulkItem = (item, fallbackId) => {
  const normalizedCompanyInfo = item?.companyInfo
    ? { ...defaultBulkCompanyInfo, ...item.companyInfo }
    : { ...defaultBulkCompanyInfo };

  return {
    ...item,
    id: item?.id ?? fallbackId ?? Date.now(),
    isBulkOrder: true,
    companyInfo: normalizedCompanyInfo,
    deliveryOption: normalizeBulkDeliveryOption(item?.deliveryOption, item?.csvRecipients),
    csvRecipients: Array.isArray(item?.csvRecipients) ? item.csvRecipients : [],
  };
};

const applyServerCartPayload = (state, payload = {}) => {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const bulkItems = Array.isArray(payload.bulkItems) ? payload.bulkItems : [];
  const normalizedBulkItems = bulkItems.map((item) => {
    const fallbackId = item?.cartItemId ?? item?.id;
    return normalizeBulkItem({ ...item, id: fallbackId }, fallbackId);
  });

  state.items = items;
  state.bulkItems = normalizedBulkItems;
  state.cartItems = normalizedBulkItems;
};

export const fetchCartByUser = createAsyncThunk(
  'cart/fetchCartByUser',
  async (userId, { rejectWithValue }) => {
    if (!userId) {
      return { items: [], bulkItems: [] };
    }

    try {
      const result = await getCartByUserId(userId);
      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to load cart.');
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to load cart.');
    }
  }
);

export const saveCartItemAsync = createAsyncThunk(
  'cart/saveCartItem',
  async ({ userId, type = 'regular', item, cartItemId }, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue('User ID is required.');
    }

    try {
      const safeCartItemId =
        typeof cartItemId === 'string' && cartItemId.trim().length > 0
          ? cartItemId
          : null;

      const result = safeCartItemId
        ? await updateCartItemServer({ userId, cartItemId: safeCartItemId, item })
        : await addCartItemServer({ userId, type, item });

      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to save cart item.');
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to save cart item.');
    }
  }
);

export const removeCartItemAsync = createAsyncThunk(
  'cart/removeCartItem',
  async ({ userId, cartItemId }, { rejectWithValue }) => {
    if (!userId || !cartItemId) {
      return rejectWithValue('User ID and cart item ID are required.');
    }

    try {
      const result = await removeCartItemServer({ userId, cartItemId });
      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to remove cart item.');
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to remove cart item.');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async ({ userId, type } = {}, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue('User ID is required.');
    }

    try {
      const result = await clearCartByUserId({ userId, type });
      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to clear cart.');
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to clear cart.');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    bulkItems: [],
    cartItems: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    // Regular single gift cart actions (local-only for guests)
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => JSON.stringify(item) === JSON.stringify(newItem));
      if (!existingItem) {
        state.items.push(newItem);
      }
    },
    updateCartItem: (state, action) => {
      const { index, item } = action.payload;
      if (state.items[index]) {
        state.items[index] = item;
      }
    },
    removeFromCart: (state, action) => {
      const indexToRemove = action.payload;
      state.items.splice(indexToRemove, 1);
    },
    clearCart: (state) => {
      state.items = [];
    },

    // Bulk order cart actions (local-only/draft updates)
    addToBulk: (state, action) => {
      const newBulkItem = normalizeBulkItem({
        ...action.payload,
        addedAt: new Date().toISOString(),
      }, Date.now());

      state.bulkItems.push(newBulkItem);
    },

    addToBulkInCart: (state) => {
      // Sync bulkItems to cartItems for local usage
      state.cartItems = state.bulkItems.map((item, index) =>
        normalizeBulkItem(item, Date.now() + index)
      );
    },

    updateBulkItem: (state, action) => {
      const { index, item } = action.payload;
      if (state.bulkItems[index]) {
        state.bulkItems[index] = normalizeBulkItem({
          ...item,
          id: state.bulkItems[index].id,
          updatedAt: new Date().toISOString()
        }, state.bulkItems[index].id);
        // Also update cartItems
        state.cartItems = [...state.bulkItems];
      }
    },

    updateBulkItemById: (state, action) => {
      const { id, updates } = action.payload;
      const itemIndex = state.bulkItems.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.bulkItems[itemIndex] = normalizeBulkItem({
          ...state.bulkItems[itemIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }, state.bulkItems[itemIndex].id);
        // Also update cartItems
        state.cartItems = [...state.bulkItems];
      }
    },

    // Update company info for the most recent bulk order
    updateBulkCompanyInfo: (state, action) => {
      const { companyInfo, deliveryOption, quantity, csvRecipients } = action.payload;
      if (state.bulkItems.length > 0) {
        const lastIndex = state.bulkItems.length - 1;
        const currentItem = state.bulkItems[lastIndex];

        state.bulkItems[lastIndex] = normalizeBulkItem({
          ...state.bulkItems[lastIndex],
          companyInfo: companyInfo ?? currentItem.companyInfo,
          deliveryOption: deliveryOption !== undefined && deliveryOption !== null
            ? deliveryOption
            : currentItem.deliveryOption,
          quantity: quantity ?? currentItem.quantity,
          csvRecipients: csvRecipients ?? currentItem.csvRecipients,
          updatedAt: new Date().toISOString()
        }, currentItem.id);
      }
    },

    // Update company info for a specific bulk order by ID
    updateBulkCompanyInfoById: (state, action) => {
      const { id, companyInfo, deliveryOption } = action.payload;
      const itemIndex = state.bulkItems.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.bulkItems[itemIndex] = normalizeBulkItem({
          ...state.bulkItems[itemIndex],
          companyInfo: companyInfo ?? state.bulkItems[itemIndex].companyInfo,
          deliveryOption: deliveryOption !== undefined && deliveryOption !== null
            ? deliveryOption
            : state.bulkItems[itemIndex].deliveryOption,
          updatedAt: new Date().toISOString()
        }, state.bulkItems[itemIndex].id);
        // Also update cartItems
        state.cartItems = [...state.bulkItems];
      }
    },

    removeFromBulk: (state, action) => {
      const indexToRemove = action.payload;
      state.bulkItems.splice(indexToRemove, 1);
      // Also update cartItems
      state.cartItems = [...state.bulkItems];
    },

    removeBulkItemById: (state, action) => {
      const idToRemove = action.payload;
      state.bulkItems = state.bulkItems.filter(item => item.id !== idToRemove);
      // Also update cartItems
      state.cartItems = [...state.bulkItems];
    },

    clearBulkCart: (state) => {
      state.bulkItems = [];
      state.cartItems = [];
    },

    // Clear both carts (local only)
    clearAllCarts: (state) => {
      state.items = [];
      state.bulkItems = [];
      state.cartItems = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartByUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCartByUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerCartPayload(state, action.payload);
      })
      .addCase(fetchCartByUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to load cart.';
      })
      .addCase(saveCartItemAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerCartPayload(state, action.payload);
      })
      .addCase(saveCartItemAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to save cart item.';
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerCartPayload(state, action.payload);
      })
      .addCase(removeCartItemAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to remove cart item.';
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerCartPayload(state, action.payload);
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to clear cart.';
      });
  },
});

export const {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToBulk,
  updateBulkItem,
  updateBulkItemById,
  updateBulkCompanyInfo,
  updateBulkCompanyInfoById,
  removeFromBulk,
  removeBulkItemById,
  clearBulkCart,
  clearAllCarts,
  addToBulkInCart,
} = cartSlice.actions;

export default cartSlice.reducer;
