import React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral"

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-gray-50 border border-gray-300 text-gray-700",
    neutral: "bg-gray-50 border border-gray-300 text-gray-600",
    success: "bg-emerald-50 border border-[#1C5E24] text-[#1C5E24]",
    warning: "bg-amber-50 border border-[#D97706] text-[#B45309]",
    danger: "bg-red-50 border border-[#DC2626] text-[#DC2626]",
    info: "bg-purple-50 border border-[#561269] text-[#561269]",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center text-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-semibold shadow-2xs",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge
