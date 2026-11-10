"use client"

import React from "react"

export interface ColumnDef<T> {
  key?: string
  header: React.ReactNode
  accessor?: keyof T | string
  render?: (row: T, index: number) => React.ReactNode
  align?: "left" | "center" | "right"
  className?: string
  headerClassName?: string
  width?: string
}

export interface AdminDataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (row: T, index: number) => string | number
  onRowClick?: (row: T, index: number) => void
  renderSubRow?: (row: T, index: number) => React.ReactNode
  isLoading?: boolean
  loadingMessage?: string
  emptyMessage?: React.ReactNode
  minWidth?: string
  tableClassName?: string
  containerClassName?: string
  maxRows?: number
  // Optional pagination
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems?: number
    itemsPerPage?: number
    onPageChange: (page: number) => void
    itemName?: string
  }
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  renderSubRow,
  isLoading = false,
  loadingMessage = "Memuat data...",
  emptyMessage = "Tidak ada data ditemukan.",
  minWidth = "760px",
  tableClassName = "",
  containerClassName = "",
  maxRows = 7,
  pagination,
}: AdminDataTableProps<T>) {
  const isScrollable = data.length > maxRows

  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-gray-200/80 bg-white admin-table-scrollbar ${
        isScrollable ? "max-h-[480px] overflow-y-auto" : ""
      } ${containerClassName}`}
    >
      <table className={`w-full text-left border-collapse ${tableClassName}`} style={{ minWidth }}>
        <thead className="sticky top-0 z-10 bg-[#D3C4D8]">
          <tr className="bg-[#D3C4D8] text-gray-800 text-xs sm:text-sm font-bold">
            {columns.map((col, idx) => {
              const alignClass =
                col.align === "center"
                  ? "text-center"
                  : col.align === "right"
                    ? "text-right"
                    : "text-left"

              return (
                <th
                  key={col.key || `col-${idx}`}
                  style={col.width ? { width: col.width } : undefined}
                  className={`py-4 px-4 sm:px-5 sticky top-0 bg-[#D3C4D8] z-10 ${alignClass} ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-gray-400 font-poppins">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#561269] border-t-transparent" />
                  <span>{loadingMessage}</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-gray-400 font-poppins">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const rowKey = keyExtractor(item, rowIndex)
              const subRow = renderSubRow ? renderSubRow(item, rowIndex) : null
              return (
                <React.Fragment key={rowKey}>
                  <tr
                    onClick={() => onRowClick && onRowClick(item, rowIndex)}
                    className={`transition-colors hover:bg-purple-50/40 ${onRowClick ? "cursor-pointer" : ""
                      }`}
                  >
                    {columns.map((col, colIndex) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                            ? "text-right"
                            : "text-left"

                      let cellContent: React.ReactNode = null
                      if (col.render) {
                        cellContent = col.render(item, rowIndex)
                      } else if (col.accessor) {
                        cellContent = (item as any)[col.accessor]
                      }

                      return (
                        <td
                          key={col.key || `cell-${colIndex}`}
                          style={col.width ? { width: col.width } : undefined}
                          className={`py-4 px-4 sm:px-5 ${alignClass} ${col.className || ""}`}
                        >
                          {cellContent}
                        </td>
                      )
                    })}
                  </tr>
                  {subRow && (
                    <tr className="bg-purple-50/20 border-b border-gray-200/80">
                      <td colSpan={columns.length} className="px-4 py-3 sm:px-6">
                        {subRow}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })
          )}
        </tbody>
      </table>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200/80 bg-white">
          <p className="text-xs text-gray-500 font-medium">
            Menampilkan{" "}
            {pagination.totalItems !== undefined && pagination.itemsPerPage !== undefined
              ? `${(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - ${Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )} dari ${pagination.totalItems} ${pagination.itemName || "data"}`
              : `Halaman ${pagination.currentPage} dari ${pagination.totalPages}`}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => pagination.onPageChange(Math.max(pagination.currentPage - 1, 1))}
              disabled={pagination.currentPage === 1}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              Sebelumnya
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => pagination.onPageChange(pageNumber)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  pagination.currentPage === pageNumber
                    ? "bg-[#EAB308] text-gray-950 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => pagination.onPageChange(Math.min(pagination.currentPage + 1, pagination.totalPages))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Shared Container Card for Table and Header Controls
 * Matches Daftar Event: rounded-[1.5rem] border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.03)]
 */
export function AdminTableContainer({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`w-full rounded-[1.5rem] border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.03)] ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Shared Search Input Box
 * Matches Daftar Event search style
 */
export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Cari...",
  className = "",
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`relative w-full lg:w-72 ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </div>
  )
}

/**
 * Shared Tab Item
 * Matches Daftar Event active underline style
 */
export function AdminFilterTabItem({
  label,
  isActive,
  onClick,
}: {
  label: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-2 font-bold whitespace-nowrap transition-colors cursor-pointer ${isActive ? "text-[#561269]" : "text-gray-600 hover:text-gray-900"
        }`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#561269]" />
      )}
    </button>
  )
}

/**
 * Shared Status Badge
 * Re-exported from ./AdminStatusBadge
 */
export { AdminStatusBadge } from "./AdminStatusBadge"
export type { AdminStatusVariant, AdminStatusBadgeProps } from "./AdminStatusBadge"
