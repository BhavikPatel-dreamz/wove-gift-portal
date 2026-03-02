import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'wishlist';

const getInitialWishlist = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedWishlist = localStorage.getItem(STORAGE_KEY);
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  } catch (error) {
    console.error('Failed to parse wishlist from localStorage:', error);
    return [];
  }
};

const persistWishlist = (items) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

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

  return {
    id: key,
    key,
    sourceType,
    brandId:
      payload?.brandId ||
      item?.selectedBrand?.id ||
      item?.id ||
      null,
    brandName:
      item?.selectedBrand?.brandName ||
      item?.selectedBrand?.name ||
      payload?.brandName ||
      'Gift Card',
    logo: item?.selectedBrand?.logo || payload?.logo || null,
    amountValue,
    amountCurrency,
    quantity,
    addedAt: payload?.addedAt || new Date().toISOString(),
  };
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: getInitialWishlist(),
  },
  reducers: {
    addToWishlist: (state, action) => {
      const normalizedItem = normalizeWishlistItem(action.payload);
      const alreadyExists = state.items.some((item) => item.key === normalizedItem.key);

      if (!alreadyExists) {
        state.items.push(normalizedItem);
        persistWishlist(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const keyToRemove =
        typeof action.payload === 'string' ? action.payload : action.payload?.key;

      if (!keyToRemove) {
        return;
      }

      state.items = state.items.filter((item) => item.key !== keyToRemove);
      persistWishlist(state.items);
    },
    toggleWishlist: (state, action) => {
      const normalizedItem = normalizeWishlistItem(action.payload);
      const existingIndex = state.items.findIndex(
        (item) => item.key === normalizedItem.key
      );

      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push(normalizedItem);
      }

      persistWishlist(state.items);
    },
    initializeWishlist: (state) => {
      state.items = getInitialWishlist();
    },
    clearWishlist: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  initializeWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
