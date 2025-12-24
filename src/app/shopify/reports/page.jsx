'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react'
import ReportsPage from '../../../components/report/ReportsPage';

const page = () => {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');

  return (
    <div>
      <ReportsPage shop={shop} />
    </div>
  )
}

export default page