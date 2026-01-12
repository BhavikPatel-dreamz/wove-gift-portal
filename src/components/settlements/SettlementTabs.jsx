"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const SettlementTabs = () => {
  const pathname = usePathname();
  const params = useParams();

  // Detect if we're in the brandsPartner route or direct settlements route
  const isBrandPartnerRoute = pathname?.includes("/brandsPartner/");
  
  const basePath = useMemo(() => {
    if (isBrandPartnerRoute) {
      const brandId = params.id;
      const settlementId = params.settlementId;
      return `/brandsPartner/${brandId}/settlements/${settlementId}`;
    }
    const settlementId = params.id;
    return `/settlements/${settlementId}`;
  }, [isBrandPartnerRoute, params]);

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", path: `${basePath}/overview` },
      { id: "vouchers", label: "Vouchers", path: `${basePath}/vouchers` },
      { id: "contacts", label: "Contacts", path: `${basePath}/contacts` },
      { id: "banking", label: "Banking", path: `${basePath}/banking` },
      { id: "terms", label: "Terms", path: `${basePath}/terms` },
    ],
    [basePath]
  );

  return (
    <div className="border-b border-[#E2E8F0] pt-4 sm:pt-6 pl-3 sm:pl-6">
      <nav aria-label="Tabs" className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                isActive
                  ? "border-[#1F59EE] text-[#1F59EE] font-semibold"
                  : "border-transparent text-[#9FA8C3] hover:border-[#9FA8C3] hover:text-[#9FA8C3]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SettlementTabs;