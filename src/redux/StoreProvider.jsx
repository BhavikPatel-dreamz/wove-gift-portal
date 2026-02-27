'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeCart } from './cartSlice';
import { initializeWishlist } from './wishlistSlice';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = store;
    storeRef.current.dispatch(initializeCart());
    storeRef.current.dispatch(initializeWishlist());
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
