'use client'
import { useSearchParams } from "next/navigation";
import { ShopAdminLayout } from "../../../components/shopAdmin/ShopAdminLayout";


const ShopifyDashboardPage = () => {
    const params = useSearchParams();
    const shopParam = params.get('shop');


    return (
          <ShopAdminLayout>
            <h1>Shopify Dashboard {shopParam}</h1>
        </ShopAdminLayout>
    );
};

export default ShopifyDashboardPage;