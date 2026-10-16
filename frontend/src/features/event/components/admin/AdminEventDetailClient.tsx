"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminEventData, INITIAL_ADMIN_EVENTS } from "../../data/adminEventData"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"

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
      tanggalDaftar: "31 Sept 2026\n13:05",
      statusPembayaran: "Lunas",
    },
    {
      no: 2,
      nama: "Aurelia",
      noWa: "081313787509",
      email: "auurel5@gmail.com",
      tanggalDaftar: "31 Sept 2026\n13:50",
      statusPembayaran: "Lunas",
    },
  ],
  "2": [
    {
      no: 1,
      nama: "Rina Sari",
      noWa: "082211445566",
      email: "rinasari@gmail.com",
      tanggalDaftar: "10 Sept 2026\n09:00",
      statusPembayaran: "Lunas",
    },
    {
      no: 2,
      nama: "Dani Setiawan",
      noWa: "083322556677",
      email: "daniseti@gmail.com",
      tanggalDaftar: "10 Sept 2026\n10:30",
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
      tanggalDaftar: "14 Okt 2026\n08:45",
      statusPembayaran: "Lunas",
    },
  ],
}

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
    let currentEvents: AdminEventData[] = INITIAL_ADMIN_EVENTS
    const saved = localStorage.getItem("empathika_admin_events")
    if (saved) {
      try {
        currentEvents = JSON.parse(saved)
      } catch {
        // fallback
      }
    }

    const found = currentEvents.find((e) => e.id === eventId)
    setEvent(found || null)
    setLoading(false)
  }, [eventId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm">
        Memuat detail event...
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 font-poppins">
        <p className="text-lg font-bold">Event tidak ditemukan.</p>
        <button
          onClick={() => router.push("/admin/event")}
          className="mt-4 text-sm text-[#561269] font-semibold hover:underline"
        >
          ← Kembali ke Kelola Event
        </button>
      </div>
    )
  }

  // Tandai event selesai dan langsung pindah ke filter selesai
  const handleMarkAsCompleted = () => {
    if (!event) return
    const confirm = window.confirm(`Tandai event "${event.judul}" sebagai Selesai?`)
    if (!confirm) return

    let currentEvents: AdminEventData[] = INITIAL_ADMIN_EVENTS
    const saved = localStorage.getItem("empathika_admin_events")
    if (saved) {
      try {
        currentEvents = JSON.parse(saved)
      } catch {
        // fallback
      }
    }

    const updated = currentEvents.map((e) =>
      e.id === event.id ? { ...e, status: "Selesai" as const } : e
    )
    localStorage.setItem("empathika_admin_events", JSON.stringify(updated))
    setEvent((prev) => (prev ? { ...prev, status: "Selesai" } : null))
    router.push("/admin/event?tab=selesai")
  }

  const pesertaList = DUMMY_PESERTA[eventId] ?? []

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full">
      {/* ── Top Bar: Kembali, Tombol Selesai & Tombol Edit ── */}
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
          {/* Tombol Selesai (hanya jika belum selesai atau untuk mengubah status langsung) */}
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

          {/* Tombol Edit Event */}
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
        Detail & Daftar Peserta Event
      </h2>

      {/* ── Info Card Event (Full Width & Informatif) ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-6 items-start">
        {/* Banner / Poster Thumbnail */}
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

        {/* Info Detail */}
        <div className="flex flex-col gap-3 flex-1 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-block rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-[#561269]">
              {event.jenis}
            </span>
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
              <span className="font-semibold text-gray-900">{event.lokasi || "Jica FPMIPA UPI"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Kuota:</span>
              <span className="font-semibold text-gray-900">{event.totalTiket} peserta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Terdaftar:</span>
              <span className="font-semibold text-[#561269]">{pesertaList.length} peserta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Harga Tiket:</span>
              <span className="font-semibold text-gray-900">
                {event.harga && event.harga !== "0"
                  ? `Rp ${parseInt(event.harga, 10).toLocaleString("id-ID")}`
                  : "Gratis"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabel Peserta Event (Full Width) ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900">Daftar Peserta Terdaftar</h4>
          <span className="text-xs text-gray-500 font-medium">
            Total {pesertaList.length} peserta
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#D3C4D8] text-gray-800 font-bold">
                <th className="py-4 px-5 w-14">No</th>
                <th className="py-4 px-5">Nama</th>
                <th className="py-4 px-5">No WhatsApp</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Tanggal Daftar</th>
                <th className="py-4 px-5 text-center">Status Pembayaran</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {pesertaList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-14 text-center text-gray-400 font-medium"
                  >
                    Belum ada peserta terdaftar untuk event ini.
                  </td>
                </tr>
              ) : (
                pesertaList.map((peserta) => (
                  <tr
                    key={peserta.no}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <td className="py-4 px-5 text-gray-600 font-medium">
                      {peserta.no}
                    </td>
                    <td className="py-4 px-5 font-bold text-gray-900">
                      {peserta.nama}
                    </td>
                    <td className="py-4 px-5 text-gray-700">{peserta.noWa}</td>
                    <td className="py-4 px-5 text-gray-700">{peserta.email}</td>
                    <td className="py-4 px-5 text-gray-600 whitespace-pre-line leading-snug">
                      {peserta.tanggalDaftar}
                    </td>
                    <td className="py-4 px-5 text-center">
                      {getStatusBadge(peserta.statusPembayaran)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
