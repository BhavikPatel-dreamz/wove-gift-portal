"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const Pagination = ({ currentPage, totalPages }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <div className="flex justify-center items-center gap-2 py-8">
            <Link
                href={isFirstPage ? '#' : createPageURL(currentPage - 1)}
                className={`px-3 py-2 rounded-lg border border-gray-200 ${isFirstPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} transition-colors`}
                aria-disabled={isFirstPage}
                tabIndex={isFirstPage ? -1 : undefined}
            >
                <ChevronLeft className="w-5 h-5" />
            </Link>

            {getPageNumbers().map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                ) : (
                    <Link
                        key={page}
                        href={createPageURL(page)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </Link>
                )
            )}

            <Link
                href={isLastPage ? '#' : createPageURL(currentPage + 1)}
                className={`px-3 py-2 rounded-lg border border-gray-200 ${isLastPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} transition-colors`}
                aria-disabled={isLastPage}
                tabIndex={isLastPage ? -1 : undefined}
            >
                <ChevronRight className="w-5 h-5" />
            </Link>
        </div>
    );
};

export default Pagination;