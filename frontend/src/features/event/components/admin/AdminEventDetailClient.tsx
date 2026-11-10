"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminEventData, mapApiToAdminEvent } from "../../data/adminEventData"
import { eventService } from "@/services/event.service"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import { Loader2, Video, MessageCircle, ExternalLink } from "lucide-react"

const getStatusBadge = (status: "Lunas" | "Menunggu" | "Gagal") => {
  switch (status) {
    case "Lunas":
      return <AdminStatusBadge variant="success" className="w-28">Lunas</AdminStatusBadge>
    case "Menunggu":
      return <AdminStatusBadge variant="warning" className="w-28">Menunggu</AdminStatusBadge>
    case "Gagal":
      return <AdminStatusBadge variant="danger" className="w-28">Gagal</AdminStatusBadge>
  }
}

interface Props {
  eventId: string
}

export default function AdminEventDetailClient({ eventId }: Props) {
  const router = useRouter()
  const [event, setEvent] = useState<AdminEventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await eventService.getById(eventId)
        if (res?.data) {
          setEvent(mapApiToAdminEvent(res.data))
        }
      } catch (err) {
        console.error("Gagal memuat event:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [eventId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 font-poppins text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#561269]" />
        <span>Memuat detail event dari server...</span>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 font-poppins">
        <p className="text-lg font-bold">Event tidak ditemukan di database.</p>
        <button
          onClick={() => router.push("/admin/event")}
          className="mt-4 text-sm text-[#561269] font-semibold hover:underline"
        >
          ← Kembali ke Kelola Event
        </button>
      </div>
    )
  }

  const handleMarkAsCompleted = async () => {
    if (!event) return
    const confirm = window.confirm(`Tandai event "${event.judul}" sebagai Selesai?`)
    if (!confirm) return

    try {
      await eventService.update(event.id, { status: "COMPLETED" })
      setEvent((prev) => (prev ? { ...prev, status: "Selesai" } : null))
      router.push("/admin/event?tab=selesai")
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui status event")
    }
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full">
      {/* Top Bar: Kembali, Tombol Selesai & Tombol Edit */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/event")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#561269] font-semibold transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Event
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAsCompleted}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer ${
              event.status === "Selesai"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {event.status === "Selesai" ? "Event Telah Selesai" : "Selesai"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/admin/event/edit/${event.id}`)}
            className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
              />
            </svg>
            Edit Event
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-[#561269]">
        Detail & Informasi Event
      </h2>

      {/* Info Card Event */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-56 h-40 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
          {event.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.bannerUrl}
              alt={event.judul}
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 opacity-30"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-[#561269]">
                {event.jenis}
              </span>
              <span
                className={`inline-block rounded-xl px-3 py-1 text-xs font-bold ${
                  event.tipe === "Offline"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {event.tipe}
              </span>
            </div>
            <AdminStatusBadge
              className="w-32"
              variant={
                event.status === "Dipublikasi"
                  ? "success"
                  : event.status === "Draft"
                  ? "warning"
                  : "danger"
              }
            >
              {event.status}
            </AdminStatusBadge>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
            {event.judul}
          </h3>

          {event.deskripsi && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {event.deskripsi}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Pembicara:</span>
              <span className="font-semibold text-gray-900">{event.pembicara}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Jadwal:</span>
              <span className="font-semibold text-gray-900">{event.tanggal} ({event.waktu})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Lokasi:</span>
              <span className="font-semibold text-gray-900">{event.lokasi || (event.tipe === "Online" ? "Google Meet (Online)" : "Sesuai Pengumuman")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Kuota Total:</span>
              <span className="font-semibold text-gray-900">{event.totalTiket} peserta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Terdaftar:</span>
              <span className="font-semibold text-[#561269]">{event.tiketTerjual} peserta</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 font-medium shrink-0 pt-0.5">Harga Tiket:</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {event.hargaCoret && Number(event.hargaCoret) > Number(event.harga || 0) && (
                    <span className="text-xs text-gray-400 line-through">
                      Rp {parseInt(event.hargaCoret, 10).toLocaleString("id-ID")}
                    </span>
                  )}
                  <span className="font-semibold text-gray-900">
                    {event.harga && event.harga !== "0"
                      ? `Rp ${parseInt(event.harga, 10).toLocaleString("id-ID")}`
                      : "Gratis"}
                  </span>
                </div>
                {event.paketBundling && event.paketBundling.length > 0 ? (
                  event.paketBundling.map((pkg, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] shrink-0">
                        {pkg.nama_paket} ({pkg.kuota_tiket} Tiket)
                      </span>
                      <span className="font-extrabold text-[#561269] text-xs">
                        Rp {Number(pkg.harga_paket).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))
                ) : event.hargaBundling && Number(event.hargaBundling) > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] shrink-0">
                      {event.namaBundling || `Paket ${event.kuotaTiketBundling || 2} Tiket`}
                    </span>
                    <span className="font-extrabold text-[#561269] text-xs">
                      Rp {parseInt(event.hargaBundling, 10).toLocaleString("id-ID")}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Link Google Meet & WhatsApp */}
          {(event.linkMeet || event.linkWa) && (
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
              {event.tipe === "Online" && event.linkMeet && (
                <a
                  href={event.linkMeet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Google Meet</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </a>
              )}
              {event.linkWa && (
                <a
                  href={event.linkWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Grup WhatsApp</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
