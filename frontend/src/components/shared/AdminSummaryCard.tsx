"use client"

import React from "react"

export interface AdminSummaryCardProps {
  label?: string
  title?: string
  value: string | number
  icon?: React.ReactNode
  iconBgColor?: string
  valueClassName?: string
  className?: string
  onClick?: () => void
  isActive?: boolean
  description?: string
}

export function AdminSummaryCard({
  label,
  title,
  value,
  icon,
  iconBgColor = "bg-purple-50 text-[#561269]",
  valueClassName = "text-gray-900",
  className = "",
  onClick,
  isActive,
  description,
}: AdminSummaryCardProps) {
  const displayLabel = label ?? title ?? ""
  return (
    <div
      onClick={onClick}
      className={`w-full bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4 transition-all ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-[#561269]/40 active:scale-[0.99]" : ""
      } ${
        isActive
          ? "border-[#561269] ring-2 ring-[#561269]/20"
          : "border-gray-100"
      } ${className}`}
    >
      {icon && (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform ${
            onClick ? "group-hover:scale-105" : ""
          } ${iconBgColor}`}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 truncate">{displayLabel}</p>
        <p className={`text-xl font-bold truncate ${valueClassName}`}>
          {value}
        </p>
        {description && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{description}</p>
        )}
      </div>
    </div>
  )
}

export default AdminSummaryCard
