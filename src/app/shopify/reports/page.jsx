'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react'

const page = () => {
      const searchParams = useSearchParams();
      const shop = searchParams.get('shop');
  return (
    <div>page {shop}</div>
  )
}

export default page