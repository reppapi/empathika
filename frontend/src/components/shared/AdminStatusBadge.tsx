import React from "react"

export type AdminStatusVariant = "success" | "warning" | "danger" | "neutral" | "info"

export interface AdminStatusBadgeProps {
  children: React.ReactNode
  variant?: AdminStatusVariant
  className?: string
}

export function AdminStatusBadge({
  children,
  variant = "neutral",
  className = "",
}: AdminStatusBadgeProps) {
  const variantStyles: Record<AdminStatusVariant, string> = {
    success: "bg-emerald-50 border border-[#1C5E24] text-[#1C5E24]",
    warning: "bg-amber-50 border border-[#D97706] text-[#B45309]",
    danger: "bg-red-50 border border-[#DC2626] text-[#DC2626]",
    neutral: "bg-gray-50 border border-gray-300 text-gray-600",
    info: "bg-purple-50 border border-[#561269] text-[#561269]",
  }

  return (
    <span
      className={`inline-flex items-center justify-center text-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-semibold shadow-2xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default AdminStatusBadge
