'use client';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchCartByUser, clearAllCarts } from './cartSlice';
import { fetchWishlistByUser, clearWishlist } from './wishlistSlice';
import { useSession } from '@/contexts/SessionContext';

export default function StoreProvider({ children }) {
  const session = useSession();
  const storeRef = useRef(null);
  const initializedRef = useRef(false);

  if (!storeRef.current) {
    storeRef.current = store;
  }

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      storeRef.current.dispatch(clearAllCarts());
      storeRef.current.dispatch(clearWishlist());
      return;
    }

    storeRef.current.dispatch(fetchCartByUser(userId));
    storeRef.current.dispatch(fetchWishlistByUser(userId));
  }, [session?.user?.id]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
