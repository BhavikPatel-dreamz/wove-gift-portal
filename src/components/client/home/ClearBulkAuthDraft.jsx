'use client';

import { useEffect } from 'react';

const BULK_AUTH_RETURN_DRAFT_KEY = 'wove:bulk-auth-return-draft';

export default function ClearBulkAuthDraft() {
  useEffect(() => {
    window.localStorage.removeItem(BULK_AUTH_RETURN_DRAFT_KEY);
  }, []);

  return null;
}
