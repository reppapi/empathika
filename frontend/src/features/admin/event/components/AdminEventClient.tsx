"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminTambahEventModal from "./AdminTambahEventModal"

export interface EventItem {
  id: string
  judul: string
  subjudul?: string
  jenis: "Workshop" | "Seminar"
  pembicara: string
  tanggal: string
  waktu: string
  tiketTerjual: number
  totalTiket: number
  status: "Dipublikasi" | "Selesai" | "Draft"
}

export const DUMMY_EVENTS: EventItem[] = [
  {
    id: "1",
    judul: "AMTR : A Moment to Remember",
    subjudul: "Workshop SEFT Empathika",
    jenis: "Workshop",
    pembicara: "nama, M.Psi., Psikolog",
    tanggal: "10 Sept 2026",
    waktu: "10:30 WIB",
    tiketTerjual: 85,
    totalTiket: 100,
    status: "Dipublikasi",
  },
  {
    id: "2",
    judul: "AMTR : A Moment to Remember",
    subjudul: "Workshop Emosi & Self Love",
    jenis: "Workshop",
    pembicara: "nama, M.Psi., Psikolog",
    tanggal: "10 Sept 2026",
    waktu: "10:30 WIB",
    tiketTerjual: 85,
    totalTiket: 100,
    status: "Selesai",
  },
  {
    id: "3",
    judul: "AMTR : A Moment to Remember",
    subjudul: "Seminar Kesehatan Mental",
    jenis: "Seminar",
    pembicara: "nama, M.Psi., Psikolog",
    tanggal: "10 Sept 2026",
    waktu: "10:30 WIB",
    tiketTerjual: 85,
    totalTiket: 100,
    status: "Draft",
  },
  {
    id: "4",
    judul: "Empathika Goes To School",
    subjudul: "Psikoedukasi Remaja & Guru",
    jenis: "Workshop",
    pembicara: "Dr. Andi Pratama, M.Psi.",
    tanggal: "15 Okt 2026",
    waktu: "09:00 WIB",
    tiketTerjual: 120,
    totalTiket: 150,
    status: "Dipublikasi",
  },
]

type TabFilter = "semua" | "seminar" | "workshop" | "selesai"

export default function AdminEventClient() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabFilter>("semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Hitung total event aktif
  const totalEventAktif = DUMMY_EVENTS.filter(
    (e) => e.status === "Dipublikasi"
  ).length

  // Filter Data
  const filteredEvents = DUMMY_EVENTS.filter((event) => {
    // Filter tab
    if (activeTab === "seminar" && event.jenis !== "Seminar") return false
    if (activeTab === "workshop" && event.jenis !== "Workshop") return false
    if (activeTab === "selesai" && event.status !== "Selesai") return false

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchJudul = event.judul.toLowerCase().includes(q)
      const matchPembicara = event.pembicara.toLowerCase().includes(q)
      const matchJenis = event.jenis.toLowerCase().includes(q)
      if (!matchJudul && !matchPembicara && !matchJenis) return false
    }

    return true
  })

  const getStatusBadge = (status: EventItem["status"]) => {
    switch (status) {
      case "Dipublikasi":
        return (
          <span className="inline-flex items-center justify-center rounded-xl bg-[#A2DCA4] px-4 py-1.5 text-xs font-semibold text-[#1C5E24] shadow-sm">
            Dipublikasi
          </span>
        )
      case "Selesai":
        return (
          <span className="inline-flex items-center justify-center rounded-xl bg-[#E85656] px-5 py-1.5 text-xs font-semibold text-white shadow-sm">
            Selesai
          </span>
        )
      case "Draft":
        return (
          <span className="inline-flex items-center justify-center rounded-xl bg-[#F0C94D] px-6 py-1.5 text-xs font-semibold text-[#5C4505] shadow-sm">
            Draft
          </span>
        )
    }
  }

  return (
    <>
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar Action: Tombol Tambah Event ── */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#561269] hover:bg-[#6f1b87] px-6 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Event
        </button>
      </div>

      {/* ── Metric Card: Total Event Aktif ── */}
      <div className="w-full max-w-sm rounded-[1.25rem] border border-gray-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#6589B9] text-white shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-7 w-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500">Total Event Aktif</span>
          <span className="text-2xl font-extrabold text-gray-900 leading-tight">
            {totalEventAktif}
          </span>
        </div>
      </div>

      {/* ── Main Card Table Container ── */}
      <div className="w-full rounded-[1.5rem] border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        {/* Header Bar: Filter Tabs & Search / Filter Button */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-transparent overflow-x-auto pb-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("semua")}
              className={`relative pb-2 font-bold whitespace-nowrap transition-colors ${
                activeTab === "semua"
                  ? "text-[#561269]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua Event
              {activeTab === "semua" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#561269]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("seminar")}
              className={`relative pb-2 font-bold whitespace-nowrap transition-colors ${
                activeTab === "seminar"
                  ? "text-[#561269]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Seminar
              {activeTab === "seminar" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#561269]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("workshop")}
              className={`relative pb-2 font-bold whitespace-nowrap transition-colors ${
                activeTab === "workshop"
                  ? "text-[#561269]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Workshop
              {activeTab === "workshop" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#561269]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("selesai")}
              className={`relative pb-2 font-bold whitespace-nowrap transition-colors ${
                activeTab === "selesai"
                  ? "text-[#561269]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Selesai
              {activeTab === "selesai" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#561269]" />
              )}
            </button>
          </div>

          {/* Right Controls: Search Input & Filter Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <input
                type="text"
                placeholder="Cari event"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>

            {/* Filter Button */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-4 w-4 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* ── Table Event ── */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
          <table className="w-full min-w-[760px] text-left border-collapse">
            {/* Table Head (Latar ungu muda halus khas referensi) */}
            <thead>
              <tr className="bg-[#D3C4D8] text-gray-800 text-xs sm:text-sm font-bold">
                <th className="py-4 px-5">Event</th>
                <th className="py-4 px-4">Jenis</th>
                <th className="py-4 px-4">Pembicara</th>
                <th className="py-4 px-4">Tanggal</th>
                <th className="py-4 px-4">Tiket Terjual</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Tidak ada event ditemukan.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    {/* Event (Thumbnail + Title) */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200/90 shadow-inner flex items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 opacity-40"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                        </div>
                        <span className="font-extrabold text-gray-900 max-w-[200px] leading-tight line-clamp-2">
                          {item.judul}
                        </span>
                      </div>
                    </td>

                    {/* Jenis */}
                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {item.jenis}
                    </td>

                    {/* Pembicara */}
                    <td className="py-4 px-4 text-gray-700">
                      {item.pembicara}
                    </td>

                    {/* Tanggal & Jam */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-3.5 w-3.5 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                            />
                          </svg>
                          <span>{item.tanggal}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-3.5 w-3.5 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <span>{item.waktu}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tiket Terjual */}
                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {item.tiketTerjual}/{item.totalTiket}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Aksi (Tiga Titik + Popover Menu) */}
                    <td className="py-4 px-5 text-center relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenActionId(openActionId === item.id ? null : item.id)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-800"
                        aria-label="Aksi"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>

                      {/* Floating Action Menu Popover */}
                      {openActionId === item.id && (
                        <>
                          <div
                            onClick={() => setOpenActionId(null)}
                            className="fixed inset-0 z-30"
                          />
                          <div className="absolute right-6 top-12 z-40 w-36 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl ring-1 ring-black/5 text-left text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null)
                                router.push(`/admin/event/${item.id}`)
                              }}
                              className="block w-full px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-[#561269] transition-colors"
                            >
                              Lihat detail
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null)
                                router.push(`/admin/event/${item.id}`)
                              }}
                              className="block w-full px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-[#561269] transition-colors border-t border-gray-100"
                            >
                              Lihat Peserta
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null)
                                alert(`Edit event: ${item.judul}`)
                              }}
                              className="block w-full px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-[#561269] transition-colors border-t border-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null)
                                alert(`Hapus event: ${item.judul}`)
                              }}
                              className="block w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                            >
                              Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Modal Tambah Event */}
      {showModal && (
        <AdminTambahEventModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            console.log("Event baru:", data)
            setShowModal(false)
          }}
        />
      )}
    </>
  )
}
