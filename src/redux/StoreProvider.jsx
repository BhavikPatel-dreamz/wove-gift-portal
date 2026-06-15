'use client';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchCartByUser, clearAllCarts, addToBulk } from './cartSlice';
import { setCompanyInfo, setCsvFileData, setIsConfirmed } from './giftFlowSlice';
import { fetchWishlistByUser, clearWishlist } from './wishlistSlice';
import { useSession } from '@/contexts/SessionContext';

const BULK_AUTH_RETURN_DRAFT_KEY = 'wove:bulk-auth-return-draft';

function getBulkAuthReturnStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function readBulkAuthReturnDraft() {
  const storage = getBulkAuthReturnStorage();
  if (!storage) return null;

  const storedDraft = storage.getItem(BULK_AUTH_RETURN_DRAFT_KEY);
  if (!storedDraft) return null;

  try {
    return JSON.parse(storedDraft);
  } catch (error) {
    console.error('Failed to read bulk order draft after auth:', error);
    storage.removeItem(BULK_AUTH_RETURN_DRAFT_KEY);
    return null;
  }
}

function restoreBulkAuthReturnDraft(targetStore) {
  const parsedDraft = readBulkAuthReturnDraft();
  if (!parsedDraft?.bulkOrder) return false;

  const existingBulkItems = targetStore.getState()?.cart?.bulkItems || [];
  const draftId = parsedDraft.bulkOrder.id;
  const alreadyRestored = existingBulkItems.some((item) => (
    draftId !== undefined &&
    draftId !== null &&
    String(item?.id) === String(draftId)
  ));

  if (!alreadyRestored) {
    targetStore.dispatch(addToBulk(parsedDraft.bulkOrder));
  }

  if (parsedDraft.companyInfo || parsedDraft.bulkOrder.companyInfo) {
    targetStore.dispatch(setCompanyInfo(parsedDraft.companyInfo || parsedDraft.bulkOrder.companyInfo));
  }

  if (parsedDraft.csvFileData) {
    targetStore.dispatch(setCsvFileData(parsedDraft.csvFileData));
  }

  if (typeof parsedDraft.isConfirmed === 'boolean') {
    targetStore.dispatch(setIsConfirmed(parsedDraft.isConfirmed));
  }

  return true;
}

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

    restoreBulkAuthReturnDraft(storeRef.current);

    storeRef.current.dispatch(fetchCartByUser(userId)).then(() => {
      const hasReturnDraft = Boolean(readBulkAuthReturnDraft()?.bulkOrder);

      if (hasReturnDraft) {
        restoreBulkAuthReturnDraft(storeRef.current);
      }
    });
    storeRef.current.dispatch(fetchWishlistByUser(userId));
  }, [session?.user?.id]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
