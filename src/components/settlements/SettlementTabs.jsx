"use client"
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

const SettlementTabs = ({ brandId }) => {
    const router = useRouter();
    const currentPath = router.pathname;
     const params = useParams();
      const settlementId = params?.id;

    const tabs = [
        { id: "overview", label: "Overview", path: `/settlements/${settlementId}/overview` },
        { id: "vouchers", label: "Vouchers", path: `/settlements/${settlementId}/vouchers` },
        { id: "contacts", label: "Contacts", path: `/settlements/${settlementId}/contacts` },
        { id: "banking", label: "Banking", path: `/settlements/${settlementId}/banking` },
        { id: "terms", label: "Terms", path: `/settlements/${settlementId}/terms` },
    ];

    const handleTabChange = (path) => {
        router.push(path);
    };

    return (
        <>
            {/* Tab Navigation */}
            <div className="border-b border-zinc-200">
                <nav aria-label="Tabs" className="-mb-px flex space-x-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.path)}
                            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                                currentPath === tab.path
                                    ? "border-[#197fe6] text-[#197fe6]"
                                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default SettlementTabs;