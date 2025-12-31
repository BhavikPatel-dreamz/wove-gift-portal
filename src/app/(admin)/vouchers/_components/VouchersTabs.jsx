"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VouchersTabs({ user }) {
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    let activeTab = pathSegments[2] || 'vouchers';
    if (activeTab === 'orders') {
        activeTab = 'vouchers';
    }

    const tabs = [
        { name: 'Order Management', href: '/vouchers', id: 'vouchers' },
        { name: 'Analytics & Tracking', href: '/vouchers/analytics', id: 'analytics' },
        { name: 'Brand Settlements', href: '/vouchers/settlements', id: 'settlements' }
    ]

    return (
        <div className="flex gap-4">
            {tabs.map((tab) => {
                if (user?.role === "CUSTOMER" && (tab.id === 'analytics' || tab.id === 'settlements')) {
                    return null;
                }
                const isActive = activeTab === tab.id;
                return (
                    <Link href={tab.href} key={tab.id}>
                        <button
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${isActive
                                ? 'bg-white text-gray-900 shadow-md'
                                : 'bg-white/50 text-gray-600 hover:bg-white/80'
                                }`}
                        >
                            {tab.name}
                        </button>
                    </Link>
                )
            })}
        </div>
    )
}