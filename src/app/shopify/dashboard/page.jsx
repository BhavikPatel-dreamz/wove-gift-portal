'use client';

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Dashboard from "../../../components/Dashboard/Dashboard";

const ShopifyMainContent = () => {
    const searchParams = useSearchParams();
    const shop = searchParams.get('shop');


  return (
    <div>
      <Dashboard shopParam={shop}/>
    </div>
  );
}


export default function ShopifyMainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopifyMainContent />
    </Suspense>
  );
}