"use client"

import React, { useState } from "react"
import { ClientSessionToday } from "@/features/konseling/types"
import { CalendarClock, AlertCircle, X, Calendar, Clock, User } from "lucide-react"

interface ModalRescheduleSesiProps {
  session: ClientSessionToday | null
  onClose: () => void
  onConfirmReschedule: (id: string, newDate: string, newWaktu: string, alasan?: string) => Promise<void> | void
}

const DEFAULT_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:30 - 15:30",
  "15:30 - 16:30",
  "16:30 - 17:30",
  "19:00 - 20:00",
  "20:00 - 21:00",
]

export default function ModalRescheduleSesi({
  session,
  onClose,
  onConfirmReschedule,
}: ModalRescheduleSesiProps) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = tomorrow.toISOString().split("T")[0]

  const [newDate, setNewDate] = useState<string>(session?.date || tomorrowKey)
  const [newWaktu, setNewWaktu] = useState<string>(session?.waktu || "10:00 - 11:00")
  const [alasan, setAlasan] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!session) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate) {
      setErrorMsg("Silakan pilih tanggal jadwal baru.")
      return
    }
    if (!newWaktu) {
      setErrorMsg("Silakan pilih jam jadwal baru.")
      return
    }
    if (newDate === session.date && newWaktu === session.waktu) {
      setErrorMsg("Jadwal baru tidak boleh sama persis dengan jadwal sebelumnya.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      await onConfirmReschedule(session.id, newDate, newWaktu, alasan.trim())
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal melakukan reschedule sesi. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                Reschedule Sesi Konseling
              </h3>
              <p className="text-xs text-gray-500">
                Pindahkan jadwal sesi ke tanggal & jam baru
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ringkasan Sesi Lama */}
        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Klien:
            </span>
            <span className="font-bold text-gray-900">{session.namaKlien}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Jadwal Saat Ini:
            </span>
            <span className="font-bold text-gray-800">
              {session.date || session.tanggal || "Hari Ini"} ({session.waktu} WIB)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-500">Tenaga Ahli:</span>
            <span className="font-bold text-[#561269]">{session.psikolog}</span>
          </div>
        </div>

        {/* Form Reschedule */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Tanggal Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Pilih Jam Baru <span className="text-rose-500">*</span>
            </label>
            <select
              value={newWaktu}
              onChange={(e) => setNewWaktu(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-medium bg-white"
              required
            >
              {DEFAULT_TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot} WIB
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Alasan Reschedule (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Permohonan klien / Penyesuaian jadwal"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Info Banner Kebijakan H-3 Jam */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Ketentuan Reschedule (Maksimal H-3 Jam):</strong> Pengajuan reschedule sesi hanya dapat dilakukan maksimal 3 jam sebelum jadwal sesi saat ini dimulai.
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
