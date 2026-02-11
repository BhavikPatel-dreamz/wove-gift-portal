import { createSlice } from '@reduxjs/toolkit';

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

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    bulkItems: [],
    cartItems: getInitialBulkCart(),
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
  if (state.bulkItems.length > 1) {
    // Don't add if bulk order already exists
    return;
  }
  
  const newBulkItem = {
    ...action.payload,
    id: Date.now(),
    addedAt: new Date().toISOString(),
    isBulkOrder: true,
    companyInfo: action.payload.companyInfo || {
      companyName: '',
      vatNumber: '',
      contactNumber: '',
      contactEmail: '',
    },
    deliveryOption: action.payload.deliveryOption || 'csv'
  };
  
  state.bulkItems.push(newBulkItem);
},
    
    addToBulkInCart: (state, action) => {
      // Sync bulkItems to cartItems and save to localStorage
      state.cartItems = [...state.bulkItems];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bulkCart', JSON.stringify(state.cartItems));
      }
    },
    
    updateBulkItem: (state, action) => {
      const { index, item } = action.payload;
      if (state.bulkItems[index]) {
        state.bulkItems[index] = {
          ...item,
          id: state.bulkItems[index].id, // Keep original ID
          updatedAt: new Date().toISOString()
        };
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
        state.bulkItems[itemIndex] = {
          ...state.bulkItems[itemIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
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
        state.bulkItems[lastIndex] = {
          ...state.bulkItems[lastIndex],
          companyInfo: companyInfo || state.bulkItems[lastIndex].companyInfo,
          deliveryOption: deliveryOption || state.bulkItems[lastIndex].deliveryOption,
          quantity: quantity || state.bulkItems[lastIndex].quantity,
          csvRecipients: csvRecipients || state.bulkItems[lastIndex].csvRecipients,
          updatedAt: new Date().toISOString()
        };
        // Also update cartItems
        // state.cartItems = [...state.bulkItems];
      }
    },
    
    // Update company info for a specific bulk order by ID
    updateBulkCompanyInfoById: (state, action) => {
      const { id, companyInfo, deliveryOption } = action.payload;
      const itemIndex = state.bulkItems.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.bulkItems[itemIndex] = {
          ...state.bulkItems[itemIndex],
          companyInfo: companyInfo || state.bulkItems[itemIndex].companyInfo,
          deliveryOption: deliveryOption || state.bulkItems[itemIndex].deliveryOption,
          updatedAt: new Date().toISOString()
        };
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
      state.cartItems = bulkCart;
      state.bulkItems = bulkCart;
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