"use client"

import { ClientSessionToday } from "@/features/konseling/types"
import { AlertTriangle } from "lucide-react"

interface ModalBatalSesiProps {
  session: ClientSessionToday | null
  onClose: () => void
  onConfirmCancel: (id: string, namaKlien: string) => void
}

export default function ModalBatalSesi({
  session,
  onClose,
  onConfirmCancel,
}: ModalBatalSesiProps) {
  if (!session) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Batalkan Sesi Klien?
        </h3>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          Apakah Anda yakin ingin membatalkan sesi untuk{" "}
          <strong className="text-gray-800">{session.namaKlien}</strong>{" "}
          {session.date ? `pada tanggal ${session.date} (${session.waktu})` : `(${session.waktu})`}?
          Tindakan ini akan membatalkan jadwal konseling sebelum hari H dan mengubah statusnya di seluruh sistem.
        </p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmCancel(session.id, session.namaKlien)
              onClose()
            }}
            className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Ya, Batalkan
          </button>
        </div>
      </div>
    </div>
  )
}
