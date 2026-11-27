"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { AdminEventData } from "../../data/adminEventData"
import { eventService, EventBookingClientApi } from "@/services/event.service"
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
  ChevronDown,
  ChevronUp,
  Loader2,
  Copy,
  Check,
  Phone,
} from "lucide-react"
import { formatIndoPhoneWithPrefix } from "@/lib/utils"

function CopyableTicket({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 font-mono text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded transition"
      title="Salin kode tiket"
    >
      <span>{code}</span>
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
    </button>
  )
}

function formatDisplayPhone(phone: string | null | undefined): string {
  return formatIndoPhoneWithPrefix(phone)
}

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

  // State untuk daftar peserta di dalam modal
  const [showPeserta, setShowPeserta] = useState(false)
  const [bookings, setBookings] = useState<EventBookingClientApi[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [hasLoadedBookings, setHasLoadedBookings] = useState(false)

  useEffect(() => {
    setCurrentEvent(event)
    setShowPeserta(false)
    setBookings([])
    setHasLoadedBookings(false)
  }, [event])

  // Fetch daftar peserta saat tombol daftar peserta dibuka (hanya yang sudah bayar lunas PAID / CONFIRMED)
  const handleTogglePeserta = async () => {
    if (!currentEvent) return
    const nextState = !showPeserta
    setShowPeserta(nextState)

    if (nextState && !hasLoadedBookings) {
      setLoadingBookings(true)
      try {
        const res = await eventService.getEventBookings(currentEvent.id)
        // Backend sudah memfilter hanya peserta yang lunas (CONFIRMED/PAID)
        setBookings(res?.data ?? [])
        setHasLoadedBookings(true)
      } catch (err) {
        console.error("Gagal memuat peserta event:", err)
      } finally {
        setLoadingBookings(false)
      }
    }
  }

  // SSR-safe: hanya render portal setelah mounted di client
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !currentEvent || !mounted) return null

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

  const totalPesertaLunas = bookings.reduce((acc, b) => acc + (b.jumlah_peserta || 1), 0)

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm"
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
                    className={`inline-block rounded-xl px-3 py-1 text-xs font-bold ${currentEvent.tipe === "Offline"
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
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Harga Tiket</p>
                <div className="flex flex-col gap-1 mt-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentEvent.hargaCoret && Number(currentEvent.hargaCoret) > Number(currentEvent.harga || 0) && (
                      <span className="text-[10px] text-gray-400 line-through">
                        Rp {parseInt(currentEvent.hargaCoret, 10).toLocaleString("id-ID")}
                      </span>
                    )}
                    <span className="text-xs font-bold text-gray-900">
                      {currentEvent.harga && currentEvent.harga !== "0"
                        ? `Rp ${parseInt(currentEvent.harga, 10).toLocaleString("id-ID")}`
                        : "Gratis"}
                    </span>
                  </div>
                  {currentEvent.paketBundling && currentEvent.paketBundling.length > 0 ? (
                    currentEvent.paketBundling.map((pkg, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] shrink-0">
                          {pkg.nama_paket} ({pkg.kuota_tiket} Tiket)
                        </span>
                        <span className="font-extrabold text-[#561269] text-xs">
                          Rp {Number(pkg.harga_paket).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))
                  ) : currentEvent.hargaBundling && Number(currentEvent.hargaBundling) > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] shrink-0">
                        {currentEvent.namaBundling || `Paket ${currentEvent.kuotaTiketBundling || 2} Tiket`}
                      </span>
                      <span className="font-extrabold text-[#561269] text-xs">
                        Rp {parseInt(currentEvent.hargaBundling, 10).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ) : null}
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

          {/* 3. Akses Link Acara (Google Meet & WhatsApp) + Toggle Daftar Peserta Langsung */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex flex-col gap-3">
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

            {/* Tombol Tampilkan Peserta Terdaftar di bawah WhatsApp */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleTogglePeserta}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 text-[#561269] text-xs font-bold transition border border-purple-200/70 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#561269]" />
                  <span>Daftar Peserta Terdaftar ({hasLoadedBookings ? totalPesertaLunas : currentEvent.tiketTerjual} Peserta)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#561269]/80">
                  <span>{showPeserta ? "Sembunyikan" : "Tampilkan"}</span>
                  {showPeserta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion / Content Peserta Langsung di Modal */}
              {showPeserta && (
                <div className="mt-3 p-3.5 rounded-xl bg-gray-50/90 border border-gray-200 space-y-3">
                  {loadingBookings ? (
                    <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#561269]" />
                      <span className="text-xs">Memuat daftar peserta...</span>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="py-6 text-center text-gray-400">
                      <p className="text-xs font-bold">Belum ada peserta lunas yang mendaftar event ini.</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary ringkas */}
                      <div className="flex items-center justify-between gap-2 text-[11px] pb-2 border-b border-gray-200/70">
                        <span className="font-bold text-gray-700">Total: {totalPesertaLunas} Peserta Lunas</span>
                      </div>

                      {/* Tabel Peserta Ringkas: Hanya Nama & Tiket, Kontak, Aksi */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                              <th className="py-2 px-2">Nama & Tiket</th>
                              <th className="py-2 px-2">Kontak</th>
                              <th className="py-2 px-2 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200/60">
                            {bookings.map((b) => (
                              <tr key={b.id} className="hover:bg-white/60 transition">
                                <td className="py-2.5 px-2">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-gray-800">{b.client.nama}</span>
                                    <CopyableTicket code={b.kode_tiket} />
                                  </div>
                                </td>
                                <td className="py-2.5 px-2">
                                  {b.client.no_telepon ? (
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-700">
                                      <Phone className="w-3 h-3 text-gray-400" />
                                      {formatDisplayPhone(b.client.no_telepon)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-[11px]">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  {b.client.wa_link ? (
                                    <a
                                      href={b.client.wa_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition shadow-xs cursor-pointer"
                                      title="Hubungi Client via WhatsApp"
                                    >
                                      <MessageCircle className="w-3 h-3" />
                                      <span>WA</span>
                                    </a>
                                  ) : (
                                    <span className="text-gray-300 text-xs">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-full border border-gray-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition active:scale-95 cursor-pointer text-center"
          >
            Tutup
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={updating}
              onClick={handleMarkAsCompleted}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-50 ${
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit Data Event
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
