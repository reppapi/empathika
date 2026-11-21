"use client"

import React, { useEffect, useState } from "react"

interface BiroLoadingStateProps {
  message?: string
  minHeight?: string
  className?: string
}

export function BiroLoadingState({
  message = "Memuat data...",
  minHeight = "min-h-[35vh]",
  className = "",
}: BiroLoadingStateProps) {
  const [color, setColor] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("biro_theme_color") ||
        sessionStorage.getItem("biro_theme_color") ||
        "#561269"
      )
    }
    return "#561269"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("biro_theme_color")
      if (cached) setColor(cached)
    }
  }, [])

  return (
    <div className={`flex flex-col items-center justify-center p-8 font-poppins ${minHeight} ${className}`}>
      <div className="relative h-11 w-11">
        <div
          className="absolute inset-0 rounded-full border-4 opacity-20"
          style={{ borderColor: color }}
        />
        <div
          className="absolute inset-0 animate-spin rounded-full border-4 border-transparent"
          style={{ borderTopColor: color }}
        />
      </div>
      <p
        className="mt-3.5 text-xs font-semibold tracking-wide animate-pulse"
        style={{ color }}
      >
        {message}
      </p>
    </div>
  )
}

export default BiroLoadingState
