"use client"
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";

const SettlementTabs = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const brandId = params.id;

    // Detect if we're in the brandsPartner route or direct settlements route
    const isBrandPartnerRoute = pathname?.includes('/brandsPartner/');
    const settlementId = isBrandPartnerRoute ? params.settlementId : params.id;
    const basePath = isBrandPartnerRoute
        ? `/brandsPartner/${brandId}/settlements/${settlementId}`
        : `/settlements/${settlementId}`;

    const tabs = [
        { id: "overview", label: "Overview", path: `${basePath}/overview` },
        { id: "vouchers", label: "Vouchers", path: `${basePath}/vouchers` },
        { id: "contacts", label: "Contacts", path: `${basePath}/contacts` },
        { id: "banking", label: "Banking", path: `${basePath}/banking` },
        { id: "terms", label: "Terms", path: `${basePath}/terms` },
    ];

    const handleTabChange = (path) => {
        router.push(path);
    };

    return (
        <>
            {/* Tab Navigation */}
            <div className="border-b border-zinc-200 mb-6">
                <nav aria-label="Tabs" className="-mb-px flex space-x-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.path)}
                            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${pathname === tab.path
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