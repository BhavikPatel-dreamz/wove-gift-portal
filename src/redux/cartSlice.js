import { createSlice } from '@reduxjs/toolkit';

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

const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

const getInitialBulkCart = () => {
  if (typeof window !== 'undefined') {
    const bulkCart = localStorage.getItem('bulkCart');
    return bulkCart ? JSON.parse(bulkCart) : [];
  }
  return [];
};

const getInitialNormalizedBulkCart = () => {
  const bulkCart = getInitialBulkCart();
  return bulkCart.map((item, index) => normalizeBulkItem(item, Date.now() + index));
};

const initialBulkCart = getInitialNormalizedBulkCart();

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    bulkItems: [...initialBulkCart],
    cartItems: [...initialBulkCart],
  },
  reducers: {
    // Regular single gift cart actions
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => JSON.stringify(item) === JSON.stringify(newItem));
      if (!existingItem) {
        state.items.push(newItem);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
      }
    },
    updateCartItem: (state, action) => {
      const { index, item } = action.payload;
      if (state.items[index]) {
        state.items[index] = item;
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
      }
    },
    removeFromCart: (state, action) => {
      const indexToRemove = action.payload;
      state.items.splice(indexToRemove, 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    initializeCart: (state) => {
      state.items = getInitialCart();
    },
    clearCart: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    },

    // Bulk order cart actions
    // Bulk order cart actions
addToBulk: (state, action) => {
  // ✅ Check if a bulk order already exists
  // if (state.bulkItems.length > 1) {
  //   // Don't add if bulk order already exists
  //   return;
  // }
  
  const newBulkItem = normalizeBulkItem({
    ...action.payload,
    addedAt: new Date().toISOString(),
  }, Date.now());
  
  state.bulkItems.push(newBulkItem);
},
    
    addToBulkInCart: (state, action) => {
      // Sync bulkItems to cartItems and save to localStorage
      state.cartItems = state.bulkItems.map((item, index) => normalizeBulkItem(item, Date.now() + index));
      if (typeof window !== 'undefined') {
        localStorage.setItem('bulkCart', JSON.stringify(state.cartItems));
      }
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('bulkCart', JSON.stringify(state.cartItems));
        }
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('bulkCart', JSON.stringify(state.cartItems));
        }
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
        // Also update cartItems
        // state.cartItems = [...state.bulkItems];
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('bulkCart', JSON.stringify(state.cartItems));
        }
      }
    },
    
    removeFromBulk: (state, action) => {
      const indexToRemove = action.payload;
      state.bulkItems.splice(indexToRemove, 1);
      // Also update cartItems
      state.cartItems = [...state.bulkItems];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bulkCart', JSON.stringify(state.cartItems));
      }
    },
    
    removeBulkItemById: (state, action) => {
      const idToRemove = action.payload;
      state.bulkItems = state.bulkItems.filter(item => item.id !== idToRemove);
      // Also update cartItems
      state.cartItems = [...state.bulkItems];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bulkCart', JSON.stringify(state.cartItems));
      }
    },
    
    initializeBulkCart: (state) => {
      const bulkCart = getInitialBulkCart();
      const normalizedBulkCart = bulkCart.map((item, index) => normalizeBulkItem(item, Date.now() + index));
      state.cartItems = normalizedBulkCart;
      state.bulkItems = normalizedBulkCart;

      if (typeof window !== 'undefined') {
        const needsRewrite = JSON.stringify(bulkCart) !== JSON.stringify(normalizedBulkCart);
        if (needsRewrite) {
          localStorage.setItem('bulkCart', JSON.stringify(normalizedBulkCart));
        }
      }
    },
    
    clearBulkCart: (state) => {
      state.bulkItems = [];
      state.cartItems = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bulkCart');
      }
    },
    
    // Clear both carts
    clearAllCarts: (state) => {
      state.items = [];
      state.bulkItems = [];
      state.cartItems = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        localStorage.removeItem('bulkCart');
      }
    },
  },
});

export const { 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  initializeCart, 
  clearCart,
  addToBulk,
  updateBulkItem,
  updateBulkItemById,
  updateBulkCompanyInfo,
  updateBulkCompanyInfoById,
  removeFromBulk,
  removeBulkItemById,
  initializeBulkCart,
  clearBulkCart,
  clearAllCarts,
  addToBulkInCart
} = cartSlice.actions;

export default cartSlice.reducer;
