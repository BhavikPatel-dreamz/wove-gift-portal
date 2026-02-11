'use client';
import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeCart } from './cartSlice';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = store;
    storeRef.current.dispatch(initializeCart());
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
