"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const VoucherFilters = ({ filterOptions }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            // Reset page to 1 when filters change
            if (name !== 'page') {
                params.set('page', '1');
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSearch = (e) => {
        // Basic debounce
        const searchInput = e.target.value;
        setTimeout(() => {
            router.push(pathname + '?' + createQueryString('search', searchInput));
        }, 500);
    };

    const handleStatusChange = (e) => {
        router.push(pathname + '?' + createQueryString('status', e.target.value));
    };

    return (
        <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                defaultValue={searchParams.get('search') || ''}
                onChange={handleSearch}
                className="border border-gray-300 p-2 rounded-md w-full sm:w-64 text-sm"
            />
            <select
                onChange={handleStatusChange}
                defaultValue={searchParams.get('status') || ''}
                className="border border-gray-300 p-2 rounded-md text-sm"
            >
                <option value="">All Statuses</option>
                {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export default VoucherFilters;