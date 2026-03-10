'use client';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeCart, initializeBulkCart } from './cartSlice';
import { initializeWishlist } from './wishlistSlice';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  const initializedRef = useRef(false);

  if (!storeRef.current) {
    storeRef.current = store;
  }

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    storeRef.current.dispatch(initializeCart());
    storeRef.current.dispatch(initializeBulkCart());
    storeRef.current.dispatch(initializeWishlist());
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
