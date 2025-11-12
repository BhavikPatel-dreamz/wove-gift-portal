import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
  },
  reducers: {
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
  },
});

export const { addToCart, updateCartItem, removeFromCart, initializeCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;