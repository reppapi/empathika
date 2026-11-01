"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarClock, X, Eye, Edit, Trash2, CheckCircle2 } from "lucide-react"
import { CATEGORIES } from "../../data/layananData"
import {
  getStoredLayanan,
  saveStoredLayanan,
  deleteLayananById,
  AdminLayananItem,
} from "../../data/adminLayananData"
import { layananService } from "@/services/layanan.service"
import {
  ActionButtonDetail,
  ActionButtonEdit,
  ActionButtonDelete,
} from "@/components/shared/TableActionButtons"
import { AdminSummaryCard } from "@/components/shared/AdminSummaryCard"
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminFilterTabItem,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable"

export default function AdminLayananView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Kategori yang diizinkan di admin
  const allowedCategories = ["01", "03", "04", "05"]
  const adminCategories = CATEGORIES.filter((cat) => allowedCategories.includes(cat.id))

  const categoryParam = searchParams ? (searchParams.get("category") || searchParams.get("kategori")) : null
  const qParam = searchParams ? (searchParams.get("q") || searchParams.get("search")) : null

  const [activeCategory, setActiveCategory] = useState(
    categoryParam && allowedCategories.includes(categoryParam) ? categoryParam : adminCategories[0]?.id || "01"
  )
  const [searchQuery, setSearchQuery] = useState(qParam || "")
  const [layananList, setLayananList] = useState<AdminLayananItem[]>([])

  // Modal States
  const [selectedDetail, setSelectedDetail] = useState<AdminLayananItem | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Sinkronkan state saat URL query param berubah (misal tombol Back / Forward browser)
  useEffect(() => {
    const cp = searchParams ? (searchParams.get("category") || searchParams.get("kategori")) : null
    if (cp && allowedCategories.includes(cp)) {
      setActiveCategory(cp)
    }
    const qp = searchParams ? (searchParams.get("q") || searchParams.get("search")) : null
    if (qp !== null && qp !== undefined) {
      setSearchQuery(qp)
    }
  }, [searchParams])

  // Ganti tab kategori sekaligus update URL query param tanpa reload halaman
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    params.set("category", catId)
    const qs = params.toString()
    const targetUrl = qs ? `/admin/layanan?${qs}` : "/admin/layanan"
    router.replace(targetUrl as any, { scroll: false })
  }

  // Update pencarian sekaligus sinkronkan param URL
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    if (!query.trim()) {
      params.delete("q")
    } else {
      params.set("q", query)
    }
    const qs = params.toString()
    const targetUrl = qs ? `/admin/layanan?${qs}` : "/admin/layanan"
    router.replace(targetUrl as any, { scroll: false })
  }

  // Load data from persistent storage & sync with backend API
  useEffect(() => {
    // 1. Initial cached / default
    setLayananList(getStoredLayanan())

    // 2. Fetch fresh from backend DB
    layananService
      .getAll()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const catMap: Record<string, string> = {
            KONSULTASI: "01",
            PSIKOTES: "02",
            WORKSHOP: "03",
            SEMINAR: "04",
            ASESMEN: "05",
          }
          const mapped: AdminLayananItem[] = res.data.map((item) => ({
            id: item.id,
            layanan: item.nama,
            kategoriId: catMap[item.kategori] || "01",
            metode: item.metode || "Online/Offline",
            weekday: `Rp ${Number(item.harga_weekday || 0).toLocaleString("id-ID")}`,
            weekend: `Rp ${Number(item.harga_weekend || 0).toLocaleString("id-ID")}`,
            status: item.aktif ? "Aktif" : "Nonaktif",
            deskripsi: item.deskripsi || "",
            bannerUrl: item.banner_url || "",
          }))
          setLayananList(mapped)
          saveStoredLayanan(mapped)
        }
      })
      .catch(() => {})
  }, [])

  // Handle Hapus Layanan
  const handleDelete = (item: AdminLayananItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus layanan "${item.layanan}"?`)) {
      deleteLayananById(item.id)
      setLayananList(getStoredLayanan())
      if (typeof item.id === "string") {
        layananService.delete(item.id).catch(() => {})
      }
      setToastMsg(`Layanan "${item.layanan}" telah dihapus.`)
      setTimeout(() => setToastMsg(null), 3000)
    }
  }

  // Filter berdasarkan kategori tab & pencarian
  const filteredLayanan = useMemo(() => {
    return layananList.filter((item) => {
      const matchCategory = item.kategoriId === activeCategory
      if (!matchCategory) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        item.layanan.toLowerCase().includes(q) ||
        item.metode.toLowerCase().includes(q) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(q))
      )
    })
  }, [layananList, activeCategory, searchQuery])

  const columns: ColumnDef<AdminLayananItem>[] = [
    {
      key: "no",
      header: "No",
      align: "center",
      width: "70px",
      render: (_: AdminLayananItem, index: number) => (
        <span className="font-semibold text-gray-500">{index + 1}</span>
      ),
    },
    {
      key: "layanan",
      header: "Layanan",
      render: (item: AdminLayananItem) => (
        <span className="font-extrabold text-gray-900 leading-tight">
          {item.layanan}
        </span>
      ),
    },
    {
      key: "metode",
      header: "Metode Pelaksanaan",
      render: (item: AdminLayananItem) => (
        <span className="text-gray-700 font-medium">{item.metode}</span>
      ),
    },
    {
      key: "weekday",
      header: "Weekday",
      render: (item: AdminLayananItem) => (
        <span className="text-gray-700 font-semibold">{item.weekday}</span>
      ),
    },
    {
      key: "weekend",
      header: "Weekend",
      render: (item: AdminLayananItem) => (
        <span className="text-gray-700 font-semibold">{item.weekend}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (item: AdminLayananItem) => (
        <AdminStatusBadge
          variant={item.status === "Aktif" ? "success" : "neutral"}
          className="w-28"
        >
          {item.status}
        </AdminStatusBadge>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (item: AdminLayananItem) => (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <ActionButtonDetail
            onClick={() => setSelectedDetail(item)}
            title="Lihat Detail"
          />
          <ActionButtonEdit
            onClick={() => router.push(`/admin/layanan/edit/${item.id}`)}
            title="Edit Layanan"
          />
          <ActionButtonDelete
            onClick={() => handleDelete(item)}
            title="Hapus Layanan"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 relative">
      {/* ── Toast Notifikasi Sukses ── */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* ── Top Bar: Metric Card (Kiri) & Tombol Tambah Layanan (Kanan) Sejajar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-72 md:w-80">
          <AdminSummaryCard
            label="Total Layanan"
            value={filteredLayanan.length}
            icon={<CalendarClock className="w-6 h-6 text-[#561269]" />}
            iconBgColor="bg-purple-50 text-[#561269]"
          />
        </div>
        <Link
          href={`/admin/layanan/tambah?category=${activeCategory}`}
          className="self-start sm:self-center flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
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
          Tambah Layanan
        </Link>
      </div>

      {/* ── Main Card Table Container ── */}
      <AdminTableContainer>
        {/* Header Bar: Filter Tabs & Search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          {/* Tabs Kategori */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-transparent overflow-x-auto pb-1 text-sm">
            {adminCategories.map((cat) => (
              <AdminFilterTabItem
                key={cat.id}
                label={cat.title}
                isActive={activeCategory === cat.id}
                onClick={() => handleCategoryChange(cat.id)}
              />
            ))}
          </div>

          {/* Search Input */}
          <AdminSearchInput
            placeholder="Cari Layanan..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Tabel Layanan */}
        <AdminDataTable
          columns={columns}
          data={filteredLayanan}
          keyExtractor={(item: AdminLayananItem) => item.id}
          emptyMessage="Tidak ada layanan yang ditemukan dalam kategori ini."
        />
      </AdminTableContainer>

      {/* ── DETAIL MODAL ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative border border-gray-100">
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedDetail.layanan}</h3>
                <p className="text-xs text-gray-500">Detail Informasi Layanan</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-medium block mb-1">Deskripsi</span>
                <p className="text-gray-800 leading-relaxed text-xs">
                  {selectedDetail.deskripsi || "Tidak ada deskripsi rinci untuk layanan ini."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500 font-medium block">Metode Pelaksanaan</span>
                  <span className="font-bold text-gray-900 mt-1 block">{selectedDetail.metode}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500 font-medium block">Status Layanan</span>
                  <span className="font-bold text-emerald-600 mt-1 block">{selectedDetail.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
                  <span className="text-xs text-purple-800 font-medium block">Tarif Weekday</span>
                  <span className="font-bold text-[#561269] text-sm mt-1 block">
                    {selectedDetail.weekday}
                  </span>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
                  <span className="text-xs text-purple-800 font-medium block">Tarif Weekend</span>
                  <span className="font-bold text-[#561269] text-sm mt-1 block">
                    {selectedDetail.weekend}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedDetail.id
                  setSelectedDetail(null)
                  router.push(`/admin/layanan/edit/${targetId}`)
                }}
                className="px-5 py-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Layanan
              </button>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
