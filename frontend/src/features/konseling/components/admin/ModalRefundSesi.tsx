"use client"

import { useState } from "react"
import { ClientSessionToday } from "@/features/konseling/types"
import { AlertCircle, RotateCcw, X, Clock, Calendar, User, DollarSign } from "lucide-react"

interface ModalRefundSesiProps {
  session: ClientSessionToday | null
  onClose: () => void
  onConfirmRefund: (id: string, alasan: string) => Promise<void> | void
}

export default function ModalRefundSesi({
  session,
  onClose,
  onConfirmRefund,
}: ModalRefundSesiProps) {
  const [alasan, setAlasan] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!session) return null

  // Format nominal refund
  const nominalStr = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(session.nominalRefund || 200000)

  // Format batas refund
  let batasRefundDisplay = "-"
  if (session.refundDeadline) {
    try {
      const d = new Date(session.refundDeadline)
      batasRefundDisplay = d.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }) + " WIB"
    } catch {
      batasRefundDisplay = session.refundDeadline
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alasan.trim()) {
      setErrorMsg("Alasan refund wajib diisi oleh Admin")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      await onConfirmRefund(session.id, alasan.trim())
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memproses refund. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-7 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Konfirmasi Refund Sesi
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pengembalian dana penuh 100% (Maksimal H-1)
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

        {/* Ringkasan Sesi */}
        <div className="space-y-3 mb-5 text-xs">
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-gray-400" /> Klien
              </span>
              <span className="font-bold text-gray-900">{session.namaKlien}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-gray-400" /> Psikolog
              </span>
              <span className="font-bold text-gray-900">{session.psikolog}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> Jadwal Sesi
              </span>
              <span className="font-bold text-gray-900">{session.waktu} WIB</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Nominal Refund (100%)
              </span>
              <span className="font-extrabold text-emerald-700 text-sm">{nominalStr}</span>
            </div>
          </div>

          {/* Info Batas Waktu Refund H-1 */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <p className="font-semibold text-[11px]">Batas Pengajuan Refund (H-1):</p>
              <p className="font-bold text-xs mt-0.5 text-amber-950">{batasRefundDisplay}</p>
            </div>
          </div>
        </div>

        {/* Form Alasan Refund */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Alasan Refund <span className="text-red-500">*</span>
            </label>
            <textarea
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value)
                if (errorMsg) setErrorMsg(null)
              }}
              rows={3}
              placeholder="Contoh: Klien berhalangan karena urusan mendadak dan mengajukan sebelum batas H-1"
              className="w-full text-xs rounded-xl border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] transition"
              required
            />
            {errorMsg && (
              <p className="text-[11px] font-semibold text-red-600 mt-1">{errorMsg}</p>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                "Konfirmasi Refund"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
