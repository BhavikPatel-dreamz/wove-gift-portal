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
         <div className="border-b border-[#E2E8F0] pt-4 sm:pt-6 pl-3 sm:pl-6">
       <nav aria-label="Tabs" className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => handleTabChange(tab.path)}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                    pathname === tab.path
                        ? "border-[#1F59EE] text-[#1F59EE] font-semibold"
                        : "border-transparent text-[#9FA8C3] hover:border-[#9FA8C3] hover:text-[#9FA8C3]"
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