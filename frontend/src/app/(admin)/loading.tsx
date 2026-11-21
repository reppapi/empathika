"use client"

import { useEffect, useState } from "react"

export default function AdminLoading() {
  const [color, setColor] = useState<string>("#561269")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isBiro = window.location.pathname.startsWith("/admin-biro")
      if (isBiro) {
        const cached = localStorage.getItem("biro_theme_color") || sessionStorage.getItem("biro_theme_color")
        if (cached) setColor(cached)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div
            className="absolute inset-0 rounded-full border-4 opacity-20"
            style={{ borderColor: color }}
          />
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent"
            style={{ borderTopColor: color }}
          />
        </div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Memuat data...
        </p>
      </div>
    </div>
  );
}
