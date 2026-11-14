"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminEventData, mapApiToAdminEvent } from "../../data/adminEventData"
import { eventService } from "@/services/event.service"
import { ActionButtonDetail, ActionButtonEdit, ActionButtonDelete } from "@/components/shared/TableActionButtons"
import { Calendar, Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import AdminSummaryCard from "@/components/shared/AdminSummaryCard"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import AdminEventDetailModal from "./AdminEventDetailModal"
import AdminDokumentasiEventClient from "./AdminDokumentasiEventClient"
import { AdminDeleteModal } from "@/components/shared/AdminDeleteModal"

export type EventItem = AdminEventData

export default function AdminEventClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. Pilihan Halaman Utama: "Event Baru" vs "Event Selesai" (tersimpan di URL query param ?section=...)
  const sectionParam = searchParams.get("section")
  const activeSection: "baru" | "selesai" = sectionParam === "selesai" ? "selesai" : "baru"

  const handleSectionChange = (section: "baru" | "selesai") => {
    const params = new URLSearchParams(searchParams.toString())
    if (section === "selesai") {
      params.set("section", "selesai")
    } else {
      params.delete("section")
    }
    router.push(`/admin/event?${params.toString()}`)
  }

  // 2. Tab Filter internal Event Baru
  const tabParam = searchParams.get("tab") as "semua" | "seminar" | "workshop" | "selesai" | null

  const [events, setEvents] = useState<AdminEventData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"semua" | "seminar" | "workshop" | "selesai">(
    tabParam === "selesai" || tabParam === "seminar" || tabParam === "workshop" ? tabParam : "semua"
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventForModal, setSelectedEventForModal] = useState<AdminEventData | null>(null)

  useEffect(() => {
    if (tabParam && ["semua", "seminar", "workshop", "selesai"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Fetch data live dari Backend API
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await eventService.getList({ limit: 100 })
      if (res && res.data) {
        const mapped = res.data.map(mapApiToAdminEvent)
        setEvents(mapped)
      } else {
        setEvents([])
      }
    } catch (err) {
      console.error("Gagal mengambil data event dari server:", err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeSection === "baru") {
      fetchEvents()
    }
  }, [fetchEvents, activeSection])

  const [eventToDelete, setEventToDelete] = useState<AdminEventData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Buka modal konfirmasi hapus event
  const handleOpenDeleteEvent = (target: AdminEventData, e: React.MouseEvent) => {
    e.stopPropagation()
    setEventToDelete(target)
  }

  // Konfirmasi Hapus event via API Backend
  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return
    setIsDeleting(true)
    try {
      await eventService.delete(eventToDelete.id)
      setEvents((prev) => prev.filter((ev) => ev.id !== eventToDelete.id))
      setEventToDelete(null)
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus event."
      alert(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Navigate to edit
  const handleEditEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/admin/event/edit/${id}`)
  }

  // Hitung total event aktif
  const totalEventAktif = events.filter((e) => e.status === "Dipublikasi").length

  // Filter Data
  const filteredEvents = events.filter((event) => {
    if (activeTab === "seminar" && event.jenis !== "Seminar") return false
    if (activeTab === "workshop" && event.jenis !== "Workshop") return false
    // Tab "selesai" = event yang sudah diarsipkan (status Selesai)
    if (activeTab === "selesai" && event.status !== "Selesai") return false
    // Tab "semua" = semua event (termasuk arsip) — tidak perlu filter

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchJudul = event.judul.toLowerCase().includes(q)
      const matchPembicara = event.pembicara.toLowerCase().includes(q)
      const matchJenis = event.jenis.toLowerCase().includes(q)
      if (!matchJudul && !matchPembicara && !matchJenis) return false
    }

    return true
  })

  const getStatusBadge = (status: AdminEventData["status"]) => {
    switch (status) {
      case "Dipublikasi":
        return <AdminStatusBadge variant="success" className="w-32">Dipublikasi</AdminStatusBadge>
      case "Selesai":
        return <AdminStatusBadge variant="danger" className="w-32">Selesai</AdminStatusBadge>
      case "Draft":
        return <AdminStatusBadge variant="warning" className="w-32">Draft</AdminStatusBadge>
    }
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. PILIHAN HALAMAN DI BAGIAN ATAS (Event Baru vs Event Selesai)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/90 rounded-2xl w-fit border border-gray-200/80 shadow-inner">
        <button
          type="button"
          onClick={() => handleSectionChange("baru")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === "baru"
              ? "bg-[#561269] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
          }`}
        >
          Event Baru
        </button>

        <button
          type="button"
          onClick={() => handleSectionChange("selesai")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === "selesai"
              ? "bg-[#561269] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
          }`}
        >
          Event / Kolaborasi Sebelumnya
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KONTEN BERDASARKAN PILIHAN HALAMAN
          ───────────────────────────────────────────────────────────── */}
      {activeSection === "selesai" ? (
        /* ================= TAMPILAN EVENT SELESAI ================= */
        <AdminDokumentasiEventClient />
      ) : (
        /* ================= TAMPILAN EVENT BARU (ASLI) ================= */
        <>
          {/* Top Bar: Metric Card (Kiri) & Tombol Tambah Event (Kanan) Sejajar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:w-72 md:w-80">
              <AdminSummaryCard
                label="Total Event Aktif"
                value={totalEventAktif}
                icon={<Calendar className="w-6 h-6 text-blue-500" />}
                iconBgColor="bg-blue-50 text-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/event/tambah")}
              className="self-start sm:self-center flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer shrink-0"
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

          {/* Main Card Table Container */}
          <div className="w-full rounded-[1.5rem] border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
            {/* Header Bar: Filter Tabs & Search */}
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

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <input
                  type="text"
                  placeholder="Cari event"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 pl-4 pr-10 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#561269]/15 text-xs text-gray-800 uppercase font-extrabold tracking-wider">
                    <th className="py-4 px-6 rounded-l-2xl">Event</th>
                    <th className="py-4 px-4 text-center">Jenis</th>
                    <th className="py-4 px-4">Pembicara</th>
                    <th className="py-4 px-4">Tanggal</th>
                    <th className="py-4 px-4 text-center">Tiket Terjual</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-center rounded-r-2xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#561269]" />
                          <span className="text-xs">Memuat data event...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                        Tidak ada data event yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-purple-50/20 transition-colors group cursor-pointer"
                        onClick={() => setSelectedEventForModal(item)}
                      >
                        {/* Event Title + Banner */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.bannerUrl}
                                alt={item.judul}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-gray-900 group-hover:text-[#561269] transition-colors line-clamp-1 max-w-[200px]">
                              {item.judul}
                            </span>
                          </div>
                        </td>

                        {/* Jenis Event + Badge Online/Offline */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-gray-800 text-xs">{item.jenis}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                item.tipe === "Offline"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.tipe || "Online"}
                            </span>
                          </div>
                        </td>

                        {/* Pembicara */}
                        <td className="py-4 px-4 text-gray-600 text-xs font-medium">
                          {item.pembicara}
                        </td>

                        {/* Tanggal & Waktu */}
                        <td className="py-4 px-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-3.5 h-3.5 text-gray-400 shrink-0"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                />
                              </svg>
                              <span>{item.tanggal}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-3.5 h-3.5 text-gray-400 shrink-0"
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
                        <td className="py-4 px-4 text-center text-xs font-bold text-gray-800">
                          {item.tiketTerjual}
                          <span className="font-normal text-gray-400"> / {item.totalTiket}</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <ActionButtonDetail
                              onClick={() => setSelectedEventForModal(item)}
                              title="Lihat Detail Event"
                            />
                            <ActionButtonEdit
                              onClick={(e) => handleEditEvent(item.id, e)}
                              title="Edit Event"
                            />
                            <ActionButtonDelete
                              onClick={(e) => handleOpenDeleteEvent(item, e)}
                              title="Hapus Event"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Detail Event (Khusus Event Baru) */}
      <AdminEventDetailModal
        isOpen={Boolean(selectedEventForModal)}
        event={selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        onEdit={(id: string) => {
          setSelectedEventForModal(null)
          router.push(`/admin/event/edit/${id}`)
        }}
        onStatusChange={() => {
          fetchEvents()
        }}
      />

      {/* Modal Konfirmasi Hapus Event */}
      <AdminDeleteModal
        isOpen={Boolean(eventToDelete)}
        onClose={() => !isDeleting && setEventToDelete(null)}
        onConfirm={handleConfirmDeleteEvent}
        itemType="event"
        itemName={eventToDelete?.judul}
        isLoading={isDeleting}
      />
    </div>
  )
}
