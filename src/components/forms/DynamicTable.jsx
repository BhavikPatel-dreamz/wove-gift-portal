"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Calendar } from "lucide-react";
import SkeletonRow from "./SkeletonRow";
import CustomDropdown from "../ui/CustomDropdown";
import SearchIcon from "@/icons/SearchIcon";

const DynamicTable = ({
  data = [],
  columns,
  title,
  subtitle,
  searchPlaceholder = "Search...",
  filters = [],
  loading = false,
  pagination = {},
  onPageChange,
  onSearch,
  onFilter,
  actions,
  emptyMessage = "No data found",
  className = "",
  renderExpandedRow,
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (name, value) => {
    if (onFilter) {
      onFilter(name, value);
    }
  };

  const renderFilter = (filter, idx) => {
    // Date input filter
    if (filter.type === "date") {
      return (
        <div key={idx} className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={filter.value || ""}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            placeholder={filter.placeholder}
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-black min-w-45"
          />
        </div>
      );
    }

    // Dropdown filter
    return (
      <CustomDropdown
        key={idx}
        options={filter.options}
        placeholder={filter.placeholder}
        value={filter?.value || ""}
        onChange={(value) => handleFilterChange(filter.name, value)}
        className="min-w-50"
      />
    );
  };

  const renderPagination = () => {
    if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) return null;

    const { currentPage = 1, totalPages = 1, from = 1, to = data.length, total = data.length } = pagination;

    return (
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{" "}
            <span className="font-medium">{total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <div
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 text-black cursor-pointer rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </div>

            <div className="flex gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = idx + 1;
                } else if (currentPage <= 3) {
                  pageNumber = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + idx;
                } else {
                  pageNumber = currentPage - 2 + idx;
                }

                return (
                  <div
                    key={idx}
                    onClick={() => onPageChange && onPageChange(pageNumber)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                      currentPage === pageNumber
                        ? "bg-blue-700 text-white shadow-sm"
                        : "border border-gray-300 hover:bg-white text-gray-700"
                    }`}
                  >
                    {pageNumber}
                  </div>
                );
              })}
            </div>

            <div
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 text-black cursor-pointer rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white rounded-t-xl">
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-[#1A1A1A]">{title}</h1>
          <p className="text-[#64748B] text-[14px] font-normal">{subtitle}</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">

          <div className="flex flex-wrap gap-2 text-black">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full placeholder-[#A6A6A6] text-black text-[12px] pl-11 pr-4 py-2.75 border border-gray-300 rounded-lg transition-all"
            />
          </div>
            {filters.map((filter, idx) => renderFilter(filter, idx))}

            {actions &&
              actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-inter text-xs font-medium text-white"
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  {action.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs cursor-pointer font-semibold text-[#4A4A4A] uppercase tracking-wider hover:bg-gray-100 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3 text-gray-400" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              [...Array(10)].map((_, i) => <SkeletonRow key={i} columns={columns} />)
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <p className="text-xs text-[#1A1A1A]">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-xs text-[#1A1A1A]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {renderExpandedRow && renderExpandedRow(row.original)}
                  </React.Fragment>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default DynamicTable;