"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string | number; [key: string]: any }>({
  columns,
  data,
  onRowClick,
  pageSize = 10,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="card-neumorph flex flex-col w-full h-full overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1A3F6C]/15">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/70"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-black/5 last:border-0 table-row-hover transition-colors duration-150 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm font-medium text-[#11181c] ${
                        col.key === "artwork" ? "whitespace-normal min-w-[220px]" : "whitespace-nowrap"
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center text-[#1A3F6C]/60 gap-3">
                    <Inbox className="w-8 h-8 opacity-70" />
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {emptyMessage}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between flex-wrap gap-4 mt-auto">
          <span className="text-xs font-bold text-[#1A3F6C]/70 uppercase tracking-widest">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, data.length)} of {data.length}{" "}
            entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="btn-neumorph px-2.5 py-1 text-xs disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-[#1A3F6C] uppercase tracking-widest px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="btn-neumorph px-2.5 py-1 text-xs disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
