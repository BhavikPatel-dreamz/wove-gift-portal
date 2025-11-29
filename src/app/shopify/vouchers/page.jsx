'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react'
import { useShopifyNavigation } from '@/hooks/useShopifyNavigation';

const page = () => {
    const searchParams = useSearchParams();
    const { navigate } = useShopifyNavigation();
    const shop = searchParams.get('shop');
    return (
        <div>page {shop}

            <button onClick={() => navigate(`/shopify/settlement`)}>
                Vouchers
            </button>
        </div>
    )
}

export default page