import React from "react";
import { notFound, redirect } from "next/navigation";
import OverviewTab from "@/components/settlements/OverviewTab";
import { getSettlementDetails } from "../../../../../../../lib/action/brandPartner";

// Server Component - Fetches data on the server
const SettlementDetailsPage = async ({ params }) => {
    // Await params to get the dynamic route parameter
    const { settlementId } = await params;

    // Fetch settlement details on the server
    let settlement = null;
    let error = null;

    console.log("Settlement ID:", settlementId);

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

    // Handle errors - redirect to settlements page
    if (error || !settlement) {
        redirect("/settlements");
    }

    // If settlement not found
    if (!settlement) {
        notFound();
    }


    return (
        <>
            <OverviewTab settlement={settlement} />
        </>
    );
};

export default SettlementDetailsPage;