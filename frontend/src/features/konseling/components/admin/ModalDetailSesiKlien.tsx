"use client"

import { ClientSessionToday } from "@/features/konseling/types"
import { getWhatsAppUrl, getWhatsAppPsikologUrl } from "@/features/konseling/data/jadwalAdminData"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import { canCancelSession } from "@/features/konseling/utils/cancellationSync"
import {
  FileText,
  X,
  Phone,
  MessageCircle,
  ExternalLink,
  Copy,
  Calendar,
  AlertCircle,
  Info,
} from "lucide-react"

interface ModalDetailSesiKlienProps {
  session: ClientSessionToday | null
  onClose: () => void
  onCancelClick: (session: ClientSessionToday) => void
  onMarkCompleted: (id: string, namaKlien: string) => void
  onCopyWhatsApp: (session: ClientSessionToday) => void
  onCopyWhatsAppPsikolog?: (session: ClientSessionToday) => void
}

export default function ModalDetailSesiKlien({
  session,
  onClose,
  onCancelClick,
  onMarkCompleted,
  onCopyWhatsApp,
  onCopyWhatsAppPsikolog,
}: ModalDetailSesiKlienProps) {
  if (!session) return null

  // Sesi HANYA BISA dibatalkan jika tanggal jadwal adalah sebelum hari H (maksimal H-1, date > today)
  const isCancellable = session.status !== "Selesai" && session.status !== "Dibatalkan" && canCancelSession(session.date)
  const isHariH = !canCancelSession(session.date)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 flex flex-col justify-between">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                Detail Sesi Klien
              </h3>
              <p className="text-xs text-gray-500">
                Informasi jadwal dan sesi konseling
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

        {/* Body */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Card Klien */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Klien</p>
                <p className="text-base font-extrabold text-gray-900 mt-0.5">
                  {session.namaKlien}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-[#561269] text-xs font-bold">
                ID: {session.klienId}
              </span>
            </div>

            {session.kontak && (
              <div className="pt-3 border-t border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1C5E24] flex items-center justify-center shrink-0 border border-emerald-200">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-gray-400 leading-none">
                      No. WhatsApp / Kontak
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1 whitespace-nowrap tracking-wide">
                      {session.kontak}
                    </span>
                  </div>
                </div>

                {session.status !== "Selesai" && session.status !== "Dibatalkan" ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={getWhatsAppUrl(session)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                      title="Buka WhatsApp Klien dengan rincian jadwal otomatis"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Chat WA</span>
                      <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onCopyWhatsApp(session)}
                      className="px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 bg-white text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
                      title="Salin Rincian Pesan WA ke Clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>Salin</span>
                    </button>
                  </div>
                ) : session.status === "Selesai" ? (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
                    Sesi telah selesai
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full whitespace-nowrap">
                    Sesi dibatalkan
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tanggal Sesi (jika tersedia) */}
          {session.date && (
            <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="font-semibold text-gray-700 text-xs flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#561269]" />
                Tanggal Pelaksanaan:
              </span>
              <span className="font-bold text-[#561269] text-xs">
                {session.date}
              </span>
            </div>
          )}

          {/* Grid Info Sesi */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <p className="text-[11px] font-semibold text-gray-500">Layanan</p>
              <p className="font-bold text-gray-900 mt-1">{session.layanan}</p>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-500">Psikolog Bertugas</p>
                <p className="font-bold text-gray-900 mt-1">{session.psikolog}</p>
              </div>
              {session.status !== "Selesai" && session.status !== "Dibatalkan" && (
                <div className="mt-2 pt-1.5 border-t border-purple-200/50 flex items-center gap-1.5 flex-wrap">
                  <a
                    href={getWhatsAppPsikologUrl(session)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full bg-[#561269] hover:bg-[#430c52] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs active:scale-95 transition cursor-pointer"
                    title={`Kirim pesan pengingat jadwal ke ${session.psikolog} via WhatsApp`}
                  >
                    <MessageCircle className="w-3 h-3 text-[#25D366] shrink-0" />
                    <span>Ingatkan (WA)</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-80 shrink-0" />
                  </a>
                  {onCopyWhatsAppPsikolog && (
                    <button
                      type="button"
                      onClick={() => onCopyWhatsAppPsikolog(session)}
                      className="p-1 rounded-full border border-purple-200 hover:bg-purple-100 text-gray-600 transition cursor-pointer"
                      title="Salin Pesan Pengingat Psikolog"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500">Waktu Sesi</p>
              <p className="font-bold text-gray-900 mt-1">{session.waktu} WIB</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500">Metode</p>
              <p className="font-bold text-[#561269] mt-1">{session.tipe}</p>
            </div>
          </div>

          {/* Catatan / Keluhan */}
          {session.catatan && (
            <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60">
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                Catatan / Keluhan Awal
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {session.catatan}
              </p>
            </div>
          )}

          {/* Status Sesi */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="font-semibold text-gray-700">Status Saat Ini:</span>
            <AdminStatusBadge
              variant={
                session.status === "Selesai"
                  ? "success"
                  : session.status === "Segera Dimulai"
                  ? "info"
                  : session.status === "Sedang Berlangsung"
                  ? "danger"
                  : session.status === "Dibatalkan"
                  ? "neutral"
                  : "warning"
              }
              className="w-40"
            >
              {session.status}
            </AdminStatusBadge>
          </div>

          {/* Informasi Kebijakan Pembatalan */}
          {session.status !== "Dibatalkan" && session.status !== "Selesai" && (
            isCancellable ? (
              <div className="flex items-start gap-2.5 text-[11px] text-blue-900 bg-blue-50/90 border border-blue-200/80 rounded-xl p-3 leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sesi Sebelum Hari H:</strong> Sesi ini dapat dibatalkan oleh Admin bila ada permohonan pembatalan dari klien atau psikolog sebelum hari konseling.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-[11px] text-amber-950 bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sesi Hari H:</strong> Sesi pada hari pelaksanaan tidak dapat dibatalkan (kebijakan pembatalan jadwal hanya berlaku maksimal H-1 sebelum konseling).
                </span>
              </div>
            )
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-gray-100">
          {/* Tombol Batalkan Sesi: HANYA untuk jadwal sebelum hari H */}
          {isCancellable && (
            <button
              type="button"
              onClick={() => onCancelClick(session)}
              className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
            >
              Batalkan Sesi (H-1)
            </button>
          )}

          {/* Tombol Tandai Selesai: HANYA untuk hari H / setelah sesi berlangsung */}
          {isHariH && session.status !== "Selesai" && session.status !== "Dibatalkan" && (
            <button
              type="button"
              onClick={() => onMarkCompleted(session.id, session.namaKlien)}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Tandai Selesai
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
