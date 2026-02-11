"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const SettlementActions = ({ settlementId }) => {
    const router = useRouter();

    const downloadReport = async (id) => {
        try {
            toast.success("Downloading report...");
            // Add your download logic here
        } catch (error) {
            toast.error("Failed to download report");
        }
    };

    return (
        <div className="flex justify-end gap-3">
            <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
                Close
            </button>
            <button
                type="button"
                onClick={() => downloadReport(settlementId)}
                className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
                Download Report
            </button>
        </div>
    );
};

export default SettlementActions;