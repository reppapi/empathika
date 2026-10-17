"use client"

import { useState, useEffect } from "react"
import { AdminEventData, INITIAL_ADMIN_EVENTS } from "../../data/adminEventData"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  User,
  Edit,
  CheckCircle2,
  FileText,
  Ticket,
} from "lucide-react"

// Dummy data peserta per event
const DUMMY_PESERTA: Record<
  string,
  {
    no: number
    nama: string
    noWa: string
    email: string
    tanggalDaftar: string
    statusPembayaran: "Lunas" | "Menunggu" | "Gagal"
  }[]
> = {
  "1": [
    {
      no: 1,
      nama: "Budi Yono",
      noWa: "081313787509",
      email: "budiyono15@gmail.com",
      tanggalDaftar: "31 Sept 2026, 13:05",
      statusPembayaran: "Lunas",
    },
    {
      no: 2,
      nama: "Aurelia",
      noWa: "081313787509",
      email: "auurel5@gmail.com",
      tanggalDaftar: "31 Sept 2026, 13:50",
      statusPembayaran: "Lunas",
    },
  ],
  "2": [
    {
      no: 1,
      nama: "Rina Sari",
      noWa: "082211445566",
      email: "rinasari@gmail.com",
      tanggalDaftar: "10 Sept 2026, 09:00",
      statusPembayaran: "Lunas",
    },
    {
      no: 2,
      nama: "Dani Setiawan",
      noWa: "083322556677",
      email: "daniseti@gmail.com",
      tanggalDaftar: "10 Sept 2026, 10:30",
      statusPembayaran: "Menunggu",
    },
  ],
  "3": [],
  "4": [
    {
      no: 1,
      nama: "Mega Putri",
      noWa: "087700112233",
      email: "megaputri@gmail.com",
      tanggalDaftar: "14 Okt 2026, 08:45",
      statusPembayaran: "Lunas",
    },
  ],
}

const getPaymentStatusBadge = (status: "Lunas" | "Menunggu" | "Gagal") => {
  switch (status) {
    case "Lunas":
      return <AdminStatusBadge variant="success" className="w-24">Lunas</AdminStatusBadge>
    case "Menunggu":
      return <AdminStatusBadge variant="warning" className="w-24">Menunggu</AdminStatusBadge>
    case "Gagal":
      return <AdminStatusBadge variant="danger" className="w-24">Gagal</AdminStatusBadge>
  }
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

  useEffect(() => {
    setCurrentEvent(event)
  }, [event])

  if (!isOpen || !currentEvent) return null

  const pesertaList = DUMMY_PESERTA[currentEvent.id] || []

  const handleMarkAsCompleted = () => {
    const updatedStatus = currentEvent.status === "Selesai" ? "Dipublikasi" : "Selesai"
    const updated: AdminEventData = { ...currentEvent, status: updatedStatus }
    setCurrentEvent(updated)

    // Update localStorage
    const saved = localStorage.getItem("empathika_admin_events")
    if (saved) {
      try {
        const list: AdminEventData[] = JSON.parse(saved)
        const updatedList = list.map((e) => (e.id === updated.id ? updated : e))
        localStorage.setItem("empathika_admin_events", JSON.stringify(updatedList))
      } catch {}
    }

    if (onStatusChange) {
      onStatusChange(updated)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-[28px] bg-white shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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
                Informasi jadwal, kuota, pembicara, dan daftar peserta terdaftar
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
                <span className="inline-block rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-[#561269]">
                  {currentEvent.jenis}
                </span>
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
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mt-1">
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
                  {currentEvent.lokasi || "Jica FPMIPA UPI"}
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
                  {currentEvent.tiketTerjual} / {currentEvent.totalTiket} Terjual
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Harga Tiket</p>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {currentEvent.harga && currentEvent.harga !== "0"
                    ? `Rp ${parseInt(currentEvent.harga, 10).toLocaleString("id-ID")}`
                    : "Gratis"}
                </p>
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

          {/* 3. Daftar Peserta Terdaftar */}
          <div className="rounded-3xl bg-white border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#561269]" />
                <h5 className="text-sm font-bold text-gray-900">
                  Daftar Peserta Terdaftar
                </h5>
              </div>
              <span className="text-xs font-semibold text-[#561269] bg-purple-50 px-3 py-1 rounded-full">
                Total {pesertaList.length} Peserta
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#D3C4D8] text-gray-800 font-bold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">No WhatsApp</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Tanggal Daftar</th>
                    <th className="py-3 px-4 text-center">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pesertaList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                        Belum ada peserta yang mendaftar pada event ini.
                      </td>
                    </tr>
                  ) : (
                    pesertaList.map((p) => (
                      <tr key={p.no} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.no}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{p.nama}</td>
                        <td className="py-3 px-4 text-gray-700">{p.noWa}</td>
                        <td className="py-3 px-4 text-gray-700">{p.email}</td>
                        <td className="py-3 px-4 text-gray-600">{p.tanggalDaftar}</td>
                        <td className="py-3 px-4 text-center">
                          {getPaymentStatusBadge(p.statusPembayaran)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
              onClick={handleMarkAsCompleted}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer ${
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
