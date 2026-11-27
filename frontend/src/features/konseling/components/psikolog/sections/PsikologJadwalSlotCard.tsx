"use client"

import React from "react"
import { User, X } from "lucide-react"
import { BookedSession } from "../types"
import { isSessionPastOrCompleted, isSlotPassed } from "../utils/psikologDateUtils"
import {
  canCancelSession,
  findOriginalRescheduledRecord,
} from "@/features/konseling/utils/cancellationSync"

interface PsikologJadwalSlotCardProps {
  item: BookedSession
  dateKey: string
  onSelectDetailSession: (session: BookedSession) => void
  onCancelClientBooking: (session: BookedSession) => void
  onRemoveSlot: (time: string, dateKey: string) => void
}

export function PsikologJadwalSlotCard({
  item,
  dateKey,
  onSelectDetailSession,
  onCancelClientBooking,
  onRemoveSlot,
}: PsikologJadwalSlotCardProps) {
  const isClientBooking =
    !item.isAvailableSlot && Boolean(item.namaKlien) && item.namaKlien !== "Tersedia"
  const isCancelled = isClientBooking && (item.isCancelled || item.status === "Dibatalkan")
  const reschedRecord = findOriginalRescheduledRecord({
    date: item.date,
    waktu: item.waktu,
    id: item.id,
  })
  const isRescheduled =
    isClientBooking &&
    (item.status === "Reschedule" || Boolean(item.isRescheduled) || Boolean(reschedRecord)) &&
    !isCancelled

  // 1. Sesi Dibatalkan
  if (isCancelled) {
    return null
  }

  // 2. Reschedule
  if (isRescheduled) {
    return (
      <div
        onClick={() => onSelectDetailSession(item)}
        className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] bg-amber-50/85 border border-amber-300 text-gray-700 overflow-hidden"
      >
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-amber-800 line-through whitespace-nowrap">
              {item.waktu}
            </span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            Reschedule
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-700 line-through line-clamp-1">
          {item.layanan}
        </span>
        <div className="flex items-center justify-between gap-1 text-[11px] text-gray-600">
          <span className="truncate line-through">{item.namaKlien || "Klien"}</span>
          <span className="font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded text-[9px] shrink-0">
            {item.metode}
          </span>
        </div>
      </div>
    )
  }

  // 3. Sesi Klien (Sudah Dibooking)
  if (isClientBooking) {
    const isCompleted = isSessionPastOrCompleted(dateKey || item.date, item.waktu, item.status)

    if (isCompleted) {
      return (
        <div
          onClick={() => onSelectDetailSession(item)}
          className="rounded-xl p-2.5 flex flex-col gap-1 shadow-2xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] bg-gray-100/85 border border-gray-200/90 text-gray-500 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0 bg-gray-400" />
              <span className="text-[11px] sm:text-xs font-extrabold text-gray-600 whitespace-nowrap">
                {item.waktu}
              </span>
            </div>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 shrink-0">
              Selesai
            </span>
          </div>
          <p className="text-xs font-bold leading-tight mt-0.5 text-gray-700 line-clamp-2">
            {item.layanan}
          </p>
          <div className="text-[10px] flex flex-col mt-0.5 leading-tight text-gray-500 gap-0.5">
            {item.namaKlien && (
              <span className="truncate">
                Klien: <strong className="text-gray-700">{item.namaKlien}</strong>
              </span>
            )}
            {item.metode && (
              <span className="text-[9px] text-gray-400 italic">[{item.metode}]</span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        onClick={() => onSelectDetailSession(item)}
        className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs hover:shadow-md transition-all bg-[#E8F3ED] border border-[#b4d6be] overflow-hidden cursor-pointer hover:scale-[1.01]"
      >
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-[#185e26] shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-[#185e26] whitespace-nowrap">
              {item.waktu}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-[#185e26] border border-[#b4d6be] shadow-2xs shrink-0">
              {item.metode}
            </span>
            {canCancelSession(dateKey || item.date) ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCancelClientBooking(item)
                }}
                title="Batalkan sesi klien ini (Maksimal H-3 Jam)"
                className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span
                title="Sesi tidak dapat dibatalkan karena sudah melewati batas maksimal H-3 jam"
                className="text-gray-300 p-0.5 cursor-not-allowed shrink-0"
              >
                <X className="w-3.5 h-3.5 opacity-40" />
              </span>
            )}
          </div>
        </div>
        <span className="text-xs font-bold text-gray-900 line-clamp-1">{item.layanan}</span>
        <div className="flex items-center gap-1 text-[11px] text-gray-700 font-medium">
          <User className="w-3 h-3 text-[#185e26] shrink-0" />
          <span className="truncate">{item.namaKlien}</span>
        </div>
      </div>
    )
  }

  // 4. Slot Terbuka (Tersedia untuk Klien)
  const isPastOpenSlot =
    isSessionPastOrCompleted(dateKey || item.date, item.waktu) ||
    isSlotPassed(dateKey || item.date, item.waktu)

  if (isPastOpenSlot) {
    return (
      <div className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs transition-all bg-gray-100/85 border border-gray-200/90 text-gray-500 overflow-hidden w-full min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0 bg-gray-400" />
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 line-through whitespace-nowrap">
            {item.waktu}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 w-full min-w-0">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
            Lewat
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemoveSlot(item.waktu, dateKey)
            }}
            title="Tutup / Hapus slot riwayat ini"
            className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs font-semibold leading-tight text-gray-700 line-clamp-2">
          Slot Tersedia (Tidak Terpakai)
        </p>

        <div className="flex items-center justify-between gap-1 min-w-0 text-[10px] text-gray-500">
          {item.metode && (
            <span className="font-medium text-gray-600 bg-gray-200/80 px-1.5 py-0.5 rounded text-[9px] shrink-0">
              {item.metode}
            </span>
          )}
          <span className="italic truncate text-[9px] text-gray-400 min-w-0">
            Tidak terpakai
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs hover:shadow-sm transition-all bg-[#FAF5FD] border border-[#D8C3E8] overflow-hidden w-full min-w-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0 bg-[#561269]" />
        <span className="text-[11px] sm:text-xs font-bold text-[#561269] whitespace-nowrap">
          {item.waktu}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 w-full min-w-0">
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-[#561269]">
          Tersedia
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemoveSlot(item.waktu, dateKey)
          }}
          title="Tutup / Hapus slot jam ini"
          className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs font-bold leading-tight mt-0.5 text-purple-950 line-clamp-1">
        Slot Tersedia
      </p>

      <div className="flex items-center justify-between gap-1 min-w-0 text-[10px]">
        {item.metode && (
          <span className="text-[9px] font-medium text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded shrink-0">
            {item.metode}
          </span>
        )}
        <span className="italic text-purple-600/80 font-medium truncate text-[9px] min-w-0">
          Tersedia
        </span>
      </div>
    </div>
  )
}
