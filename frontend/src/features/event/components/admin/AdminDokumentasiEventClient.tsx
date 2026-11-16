"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { eventService, EventDokumentasiApi } from "@/services/event.service"
import { ActionButtonDetail, ActionButtonEdit, ActionButtonDelete } from "@/components/shared/TableActionButtons"
import { Calendar, Image as ImageIcon, Search, Plus, Loader2 } from "lucide-react"
import AdminSummaryCard from "@/components/shared/AdminSummaryCard"
import AdminDokumentasiDetailModal from "./AdminDokumentasiDetailModal"
import { AdminDeleteModal } from "@/components/shared/AdminDeleteModal"

export default function AdminDokumentasiEventClient() {
  const router = useRouter()
  const [items, setItems] = useState<EventDokumentasiApi[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItemForModal, setSelectedItemForModal] = useState<EventDokumentasiApi | null>(null)
  const [itemToDelete, setItemToDelete] = useState<EventDokumentasiApi | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDokumentasi = useCallback(async () => {
    try {
      setLoading(true)
      const res = await eventService.getDokumentasiList({ limit: 100 })
      if (res?.data) {
        setItems(res.data)
      } else {
        setItems([])
      }
    } catch (err) {
      console.error("Gagal memuat daftar dokumentasi event:", err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDokumentasi()
  }, [fetchDokumentasi])

  const handleOpenDelete = (item: EventDokumentasiApi, e: React.MouseEvent) => {
    e.stopPropagation()
    setItemToDelete(item)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await eventService.deleteDokumentasi(itemToDelete.id)
      setItems((prev) => prev.filter((d) => d.id !== itemToDelete.id))
      setItemToDelete(null)
    } catch (err: any) {
      console.error("Gagal menghapus dokumentasi:", err)
      alert(err.response?.data?.message || "Gagal menghapus dokumentasi event.")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return item.judul.toLowerCase().includes(q) || item.deskripsi.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6 font-poppins">
      {/* Top Bar: Metric Card (Kiri) & Tombol Tambah Dokumentasi (Kanan) Sejajar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-72 md:w-80">
          <AdminSummaryCard
            label="Total Dokumentasi"
            value={items.length}
            icon={<Calendar className="w-6 h-6 text-purple-600" />}
            iconBgColor="bg-purple-50 text-purple-600"
          />
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/event/dokumentasi/tambah")}
          className="self-start sm:self-center flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Tambah Dokumentasi
        </button>
      </div>

      {/* Main Card Table Container */}
      <div className="w-full rounded-[1.5rem] border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-gray-900">
            Daftar Arsip &amp; Dokumentasi Event Selesai
          </h2>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokumentasi event..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] placeholder:text-gray-400 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Tabel / Content */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#561269] mb-3" />
            <p className="text-sm">Memuat dokumentasi event...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#561269] flex items-center justify-center mb-3">
              <ImageIcon className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {searchQuery ? "Tidak Ada Dokumentasi yang Cocok" : "Belum Ada Dokumentasi Event Selesai"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-4">
              {searchQuery
                ? `Tidak ditemukan hasil untuk "${searchQuery}". Coba kata kunci lain.`
                : "Dokumentasikan momen dan kegiatan event yang telah selesai dengan mengklik tombol Tambah Dokumentasi."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => router.push("/admin/event/dokumentasi/tambah")}
                className="px-5 py-2 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#430e52] transition-colors"
              >
                + Tambah Dokumentasi Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-[#561269]/10 text-gray-700 text-xs uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Event Selesai</th>
                  <th className="py-3 px-4">Tanggal Pelaksanaan</th>
                  <th className="py-3 px-4 rounded-r-xl text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {filteredItems.map((item) => {
                  const tglTeks = item.tanggal
                    ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemForModal(item)}
                      className="bg-white hover:bg-purple-50/30 transition-colors border border-gray-100 rounded-xl group cursor-pointer"
                    >
                      {/* Kolom 1: Thumbnail & Judul */}
                      <td className="py-3.5 px-4 rounded-l-xl">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {item.thumbnail ? (
                              <Image
                                src={item.thumbnail}
                                alt={item.judul}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#561269] transition-colors">
                              {item.judul}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {item.deskripsi}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Tanggal Pelaksanaan */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{tglTeks}</span>
                        </div>
                      </td>

                      {/* Kolom 3: Aksi */}
                      <td
                        className="py-3.5 px-4 rounded-r-xl text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <ActionButtonDetail
                            onClick={() => setSelectedItemForModal(item)}
                            title="Lihat Detail Dokumentasi"
                          />
                          <ActionButtonEdit
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/event/dokumentasi/edit/${item.id}`)
                            }}
                            title="Edit Dokumentasi"
                          />
                          <ActionButtonDelete
                            onClick={(e) => handleOpenDelete(item, e)}
                            title="Hapus Dokumentasi"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Dokumentasi Event Selesai */}
      <AdminDokumentasiDetailModal
        isOpen={Boolean(selectedItemForModal)}
        onClose={() => setSelectedItemForModal(null)}
        item={selectedItemForModal}
        onEdit={(id) => {
          setSelectedItemForModal(null)
          router.push(`/admin/event/dokumentasi/edit/${id}`)
        }}
      />

      {/* Modal Konfirmasi Hapus Dokumentasi */}
      <AdminDeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemType="dokumentasi event"
        itemName={itemToDelete?.judul}
        description={
          itemToDelete ? (
            <>
              Apakah Anda yakin ingin menghapus dokumentasi event{" "}
              <span className="font-extrabold text-gray-900">&ldquo;{itemToDelete.judul}&rdquo;</span>?
              Semua foto arsip terkait juga akan dihapus secara permanen.
            </>
          ) : undefined
        }
        isLoading={isDeleting}
      />
    </div>
  )
}
