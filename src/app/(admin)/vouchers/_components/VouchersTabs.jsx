"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VouchersTabs({ user }) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  let activeTab = pathSegments[2] || "vouchers";

  if (activeTab === "orders") {
    activeTab = "vouchers";
  }

  const tabs = [
    { name: "Order Management", href: "/vouchers", id: "vouchers" },
    { name: "Analytics & Tracking", href: "/vouchers/analytics", id: "analytics" },
    { name: "Brand Settlements", href: "/vouchers/settlements", id: "settlements" },
  ];

  return (
    <div className="w-full">
      <div className="flex bg-[#F1F4F9] rounded-2xl p-1">
        {tabs.map((tab) => {
          if (
            user?.role === "CUSTOMER" &&
            (tab.id === "analytics" || tab.id === "settlements")
          ) {
            return null;
          }

          const isActive = activeTab === tab.id;

          return (
            <Link
              href={tab.href}
              key={tab.id}
              className="flex-1"
            >
              <button
                className={`
                  w-full h-12
                  rounded-xl
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-600 hover:bg-white/60"
                  }
                `}
              >
                {tab.name}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
