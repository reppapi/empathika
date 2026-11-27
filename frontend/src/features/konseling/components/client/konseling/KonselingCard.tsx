"use client"

import React from "react"
import Link from "next/link"

export interface CardTheme {
  bgColor: string
  titleColor: string
  shape: string
}

export const CARD_THEMES: CardTheme[] = [
  {
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    shape: "circles",
  },
  {
    bgColor: "bg-[#f0d164]",
    titleColor: "text-gray-900",
    shape: "circles-dark",
  },
  {
    bgColor: "bg-[#e31e3d]",
    titleColor: "text-white",
    shape: "heart",
  },
  {
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    shape: "circles",
  },
]

interface KonselingCardProps {
  item: {
    id: string
    nama: string
    deskripsi?: string
    metode?: string
  }
  theme: CardTheme
  withBiro: (path: string) => string
}

export function KonselingCard({ item, theme, withBiro }: KonselingCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <div className={`h-40 sm:h-48 w-full ${theme.bgColor} overflow-hidden relative shrink-0`}>
        <div className="absolute inset-0 flex items-start p-6">
          <div className="text-left w-full">
            <h3
              className={`${theme.titleColor} font-extrabold text-[22px] sm:text-[28px] leading-[1.1] mb-2 drop-shadow-sm uppercase`}
            >
              {item.nama}
            </h3>
            <p
              className={`${theme.titleColor} text-xs sm:text-sm font-medium drop-shadow-sm opacity-90`}
            >
              {item.metode || "Online / Offline"}
            </p>
          </div>
        </div>

        {/* Shapes */}
        {theme.shape === "circles" && (
          <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
            <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
              <circle cx="150" cy="100" r="80" fill="white" />
              <circle cx="50" cy="120" r="50" fill="white" />
            </svg>
          </div>
        )}
        {theme.shape === "circles-dark" && (
          <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
            <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
              <circle cx="150" cy="100" r="80" fill="black" />
              <circle cx="50" cy="120" r="50" fill="black" />
            </svg>
          </div>
        )}
        {theme.shape === "heart" && (
          <div className="absolute bottom-4 right-10">
            <svg className="w-16 h-16 text-pink-300 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 leading-tight line-clamp-2">
          {item.nama}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
          {item.deskripsi ||
            "Layanan konsultasi kesehatan mental profesional bersama tim ahli Empathika."}
        </p>

        <div className="mt-auto pt-2">
          <Link
            href={withBiro(`/booking?layanan=${encodeURIComponent(item.nama)}`) as any}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("empathika_last_selected_layanan", item.nama)
              }
            }}
            className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm"
          >
            Booking Sesi
          </Link>
        </div>
      </div>
    </div>
  )
}
