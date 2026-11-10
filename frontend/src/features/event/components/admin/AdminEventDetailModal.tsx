"use client"

import { useState, useEffect } from "react"
import { AdminEventData } from "../../data/adminEventData"
import { eventService } from "@/services/event.service"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import {
  X,
  Calendar,
  MapPin,
  Users,
  Tag,
  User,
  Edit,
  CheckCircle2,
  Ticket,
  Video,
  MessageCircle,
  ExternalLink,
} from "lucide-react"

interface AdminEventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  event: AdminEventData | null
  onEdit: (id: string) => void
  onStatusChange?: (updated: AdminEventData) => void
}

export default function AdminEventDetailModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onStatusChange,
}: AdminEventDetailModalProps) {
  const [currentEvent, setCurrentEvent] = useState<AdminEventData | null>(event)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setCurrentEvent(event)
  }, [event])

  if (!isOpen || !currentEvent) return null

  const handleMarkAsCompleted = async () => {
    const isCompleted = currentEvent.status === "Selesai"
    const targetStatus = isCompleted ? "UPCOMING" : "COMPLETED"
    const nextLocalStatus = isCompleted ? "Dipublikasi" : "Selesai"

    setUpdating(true)
    try {
      await eventService.update(currentEvent.id, { status: targetStatus })
      const updated: AdminEventData = { ...currentEvent, status: nextLocalStatus }
      setCurrentEvent(updated)
      if (onStatusChange) {
        onStatusChange(updated)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengubah status event di server.")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[28px] bg-white shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-8 rounded-full bg-[#561269]" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Detail Informasi Event
              </h3>
              <p className="text-xs text-gray-500">
                Informasi jadwal, kuota, pembicara, dan pelaksanaan acara
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 bg-[#FBFBFC]">
          {/* 1. Baris Utama Event Card */}
          <div className="flex flex-col md:flex-row gap-5 p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs items-start">
            {/* Banner Thumbnail */}
            <div className="w-full md:w-48 h-36 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
              {currentEvent.bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentEvent.bannerUrl}
                  alt={currentEvent.judul}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Ticket className="w-10 h-10 opacity-30 text-[#561269]" />
              )}
            </div>

            {/* Info Teks Event */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-[#561269]">
                    {currentEvent.jenis}
                  </span>
                  <span
                    className={`inline-block rounded-xl px-3 py-1 text-xs font-bold ${
                      currentEvent.tipe === "Offline"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {currentEvent.tipe}
                  </span>
                </div>
                <AdminStatusBadge
                  className="w-28"
                  variant={
                    currentEvent.status === "Dipublikasi"
                      ? "success"
                      : currentEvent.status === "Draft"
                      ? "warning"
                      : "danger"
                  }
                >
                  {currentEvent.status}
                </AdminStatusBadge>
              </div>

              <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
                {currentEvent.judul}
              </h4>

              {currentEvent.subjudul && (
                <p className="text-xs text-[#561269] font-semibold -mt-1">
                  {currentEvent.subjudul}
                </p>
              )}

              {currentEvent.deskripsi && (
                <p className="text-xs text-gray-600 leading-relaxed mt-1 whitespace-pre-wrap">
                  {currentEvent.deskripsi}
                </p>
              )}
            </div>
          </div>

          {/* 2. Grid Parameter & Detail Pelaksanaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pembicara</p>
                <p className="text-xs font-bold text-gray-900 truncate">{currentEvent.pembicara}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tanggal & Waktu</p>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {currentEvent.tanggal} • {currentEvent.waktu}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lokasi Acara</p>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {currentEvent.lokasi || "Online / Sesuai Pengumuman"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Kuota Peserta</p>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {currentEvent.tiketTerjual} / {currentEvent.totalTiket} Terdaftar
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Harga Tiket</p>
                <div className="flex flex-col">
                  {currentEvent.hargaCoret && Number(currentEvent.hargaCoret) > Number(currentEvent.harga || 0) && (
                    <span className="text-[10px] text-gray-400 line-through">
                      Rp {parseInt(currentEvent.hargaCoret, 10).toLocaleString("id-ID")}
                    </span>
                  )}
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {currentEvent.harga && currentEvent.harga !== "0"
                      ? `Rp ${parseInt(currentEvent.harga, 10).toLocaleString("id-ID")}`
                      : "Gratis"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status Kegiatan</p>
                <p className="text-xs font-bold text-gray-900 truncate">{currentEvent.status}</p>
              </div>
            </div>
          </div>

          {/* Akses & Link Komunikasi (Google Meet & WhatsApp) */}
          {(currentEvent.linkMeet || currentEvent.linkWa) && (
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex flex-col gap-2.5">
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                Akses Link Acara & Koordinasi
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                {currentEvent.tipe === "Online" && currentEvent.linkMeet && (
                  <a
                    href={currentEvent.linkMeet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Video className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">Google Meet</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                )}
                {currentEvent.linkWa && (
                  <a
                    href={currentEvent.linkWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">Grup WhatsApp</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition active:scale-95 cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={updating}
              onClick={handleMarkAsCompleted}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-50 ${
                currentEvent.status === "Selesai"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {currentEvent.status === "Selesai" ? "Event Telah Selesai" : "Tandai Selesai"}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(currentEvent.id)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit Data Event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
