import React from "react";
import { notFound, redirect } from "next/navigation";
import OverviewTab from "@/components/settlements/OverviewTab";
import { getSettlementDetails } from "../../../../../../../lib/action/brandPartner";

// Server Component - Fetches data on the server
const SettlementDetailsPage = async ({ params, searchParams }) => {
    // Await params to get the dynamic route parameter
    const { settlementId, id: brandId } = await params;
    
    // Await searchParams to get query parameters
    const resolvedSearchParams = await searchParams;
    const shop = resolvedSearchParams?.shop;
    const host = resolvedSearchParams?.host;

    console.log("Settlement ID:", settlementId);
    console.log("Brand ID:", brandId);
    console.log("Shop:", shop);
    console.log("Host:", host);

    // Fetch settlement details on the server
    let settlement = null;
    let error = null;

    try {
        const res = await getSettlementDetails(settlementId);
        console.log("res data:", res);
        
        if (res.success) {
            settlement = res.data;
        } else {
            error = res.message;
        }
    } catch (err) {
        console.error("Failed to fetch settlement details:", err);
        error = "Failed to fetch settlement details";
    }

    // Handle errors - redirect to settlements page with preserved params
    if (error || !settlement) {
        const params = new URLSearchParams();
        if (shop) params.set('shop', shop);
        if (host) params.set('host', host);
        
        const redirectUrl = params.toString() 
            ? `/brandsPartner/${brandId}/settlements?${params.toString()}`
            : `/brandsPartner/${brandId}/settlements`;
        
        redirect(redirectUrl);
    }

    // If settlement not found
    if (!settlement) {
        notFound();
    }

    console.log("Settlement data:", settlement);

    return (
        <>
            <OverviewTab settlement={settlement} shop={shop} host={host} />
        </>
    );
};

export default SettlementDetailsPage;