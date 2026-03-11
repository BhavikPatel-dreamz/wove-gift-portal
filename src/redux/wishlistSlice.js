import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getWishlistByUserId,
  toggleWishlistItem,
  removeWishlistItem,
  clearWishlistByUserId,
} from '../lib/action/wishlistAction';

const toSafeKeyPart = (value) => String(value ?? '').trim().toLowerCase();

const getAmountValue = (selectedAmount) => {
  if (selectedAmount && typeof selectedAmount === 'object') {
    const parsed = Number(selectedAmount.value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(selectedAmount);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getAmountCurrency = (selectedAmount, fallbackCurrency = 'ZAR') => {
  if (selectedAmount && typeof selectedAmount === 'object') {
    return selectedAmount.currency || fallbackCurrency;
  }

  return fallbackCurrency;
};

export const buildWishlistKey = (item = {}, sourceType = 'regular') => {
  const brandId =
    item?.selectedBrand?.id ||
    item?.selectedBrand?.brandName ||
    item?.selectedBrand?.name ||
    'gift-card';
  const amountValue = getAmountValue(item?.selectedAmount);
  const amountCurrency = getAmountCurrency(item?.selectedAmount);
  const quantity = sourceType === 'bulk' ? Number(item?.quantity ?? 1) : 1;
  const personalMessage = item?.personalMessage || '';

  return [
    toSafeKeyPart(sourceType),
    toSafeKeyPart(brandId),
    toSafeKeyPart(amountValue),
    toSafeKeyPart(amountCurrency),
    toSafeKeyPart(quantity),
    toSafeKeyPart(personalMessage),
  ].join(':');
};

const normalizeWishlistItem = (payload = {}) => {
  const item = payload?.item || payload;
  const sourceType = payload?.sourceType || 'regular';
  const key = payload?.key || buildWishlistKey(item, sourceType);
  const amountValue = getAmountValue(item?.selectedAmount ?? payload?.amountValue);
  const amountCurrency = getAmountCurrency(
    item?.selectedAmount,
    payload?.amountCurrency || 'ZAR'
  );
  const quantity =
    sourceType === 'bulk'
      ? Math.max(1, Number(item?.quantity ?? payload?.quantity ?? 1))
      : 1;
  const resolvedBrand =
    item?.selectedBrand ||
    item?.brand ||
    item?.voucher?.brand ||
    payload?.selectedBrand ||
    payload?.brand ||
    payload?.voucher?.brand ||
    null;

  return {
    id: key,
    key,
    sourceType,
    brandId:
      payload?.brandId ||
      item?.brandId ||
      item?.selectedBrand?.id ||
      resolvedBrand?.id ||
      item?.id ||
      null,
    brandName:
      resolvedBrand?.brandName ||
      resolvedBrand?.name ||
      item?.brandName ||
      payload?.brandName ||
      item?.brand?.brandName ||
      item?.brand?.name ||
      payload?.brand?.brandName ||
      payload?.brand?.name ||
      item?.voucher?.brandName ||
      payload?.voucher?.brandName ||
      'Gift Card',
    logo:
      resolvedBrand?.logo ||
      item?.logo ||
      payload?.logo ||
      item?.brand?.logo ||
      payload?.brand?.logo ||
      null,
    amountValue,
    amountCurrency,
    quantity,
    addedAt: payload?.addedAt || new Date().toISOString(),
  };
};

const applyToggleWishlistState = (state, payload) => {
  const normalizedItem = normalizeWishlistItem(payload);
  const existingIndex = state.items.findIndex((item) => item.key === normalizedItem.key);

  if (existingIndex !== -1) {
    state.items.splice(existingIndex, 1);
  } else {
    state.items.push(normalizedItem);
  }
};

const applyServerWishlist = (state, items = []) => {
  const normalized = Array.isArray(items)
    ? items.map((item) => normalizeWishlistItem(item))
    : [];
  state.items = normalized;
};

export const fetchWishlistByUser = createAsyncThunk(
  'wishlist/fetchWishlistByUser',
  async (userId, { rejectWithValue }) => {
    if (!userId) {
      return [];
    }

    try {
      const result = await getWishlistByUserId(userId);
      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to load wishlist.');
      }
      return result.data || [];
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to load wishlist.');
    }
  }
);

export const toggleWishlistAsync = createAsyncThunk(
  'wishlist/toggleWishlistAsync',
  async ({ userId, item }, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue('User ID is required.');
    }

    const normalizedItem = normalizeWishlistItem(item);

    try {
      const result = await toggleWishlistItem({
        userId,
        item: normalizedItem,
      });
      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to update wishlist.');
      }
      return result.data || [];
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to update wishlist.');
    }
  }
);

export const removeWishlistAsync = createAsyncThunk(
  'wishlist/removeWishlistAsync',
  async ({ userId, key }, { rejectWithValue }) => {
    if (!userId || !key) {
      return rejectWithValue('User ID and key are required.');
    }

    try {
      const result = await removeWishlistItem({ userId, key });
      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to remove wishlist item.');
      }
      return result.data || [];
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to remove wishlist item.');
    }
  }
);

export const clearWishlistAsync = createAsyncThunk(
  'wishlist/clearWishlistAsync',
  async ({ userId }, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue('User ID is required.');
    }

    try {
      const result = await clearWishlistByUserId(userId);
      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to clear wishlist.');
      }
      return result.data || [];
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to clear wishlist.');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addToWishlist: (state, action) => {
      const normalizedItem = normalizeWishlistItem(action.payload);
      const alreadyExists = state.items.some((item) => item.key === normalizedItem.key);

      if (!alreadyExists) {
        state.items.push(normalizedItem);
      }
    },
    removeFromWishlist: (state, action) => {
      const keyToRemove =
        typeof action.payload === 'string' ? action.payload : action.payload?.key;

      if (!keyToRemove) {
        return;
      }

      state.items = state.items.filter((item) => item.key !== keyToRemove);
    },
    toggleWishlist: (state, action) => {
      applyToggleWishlistState(state, action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistByUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWishlistByUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerWishlist(state, action.payload);
      })
      .addCase(fetchWishlistByUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to load wishlist.';
      })
      .addCase(toggleWishlistAsync.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        applyToggleWishlistState(state, action.meta.arg.item);
      })
      .addCase(toggleWishlistAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerWishlist(state, action.payload);
      })
      .addCase(toggleWishlistAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to update wishlist.';
        applyToggleWishlistState(state, action.meta.arg.item);
      })
      .addCase(removeWishlistAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerWishlist(state, action.payload);
      })
      .addCase(removeWishlistAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to remove wishlist item.';
      })
      .addCase(clearWishlistAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        applyServerWishlist(state, action.payload);
      })
      .addCase(clearWishlistAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Failed to clear wishlist.';
      });
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
