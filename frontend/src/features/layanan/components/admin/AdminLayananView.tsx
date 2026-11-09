"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarClock, X, Eye, Edit, Trash2, CheckCircle2, ChevronDown } from "lucide-react"
import { CATEGORIES } from "../../data/layananData"
import {
  AdminLayananItem,
  getStoredLayanan,
  updateLayananById,
  deleteLayananById,
  saveStoredLayanan,
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

function parseRupiahNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val
  if (!val) return 0
  const str = String(val).trim()
  const withoutDecimals = str.replace(/[,.]00$/, "")
  const cleaned = withoutDecimals.replace(/[^0-9]/g, "")
  return parseInt(cleaned || "0", 10)
}

function formatRupiahStandard(val: any, fallbackStr: string = "Rp 0"): string {
  if (val === undefined || val === null || val === "") return fallbackStr
  const num = parseRupiahNumber(val)
  return `Rp\u00A0${num.toLocaleString("id-ID")}`
}

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
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Modal & Expand States
  const [selectedDetail, setSelectedDetail] = useState<AdminLayananItem | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null)

  const toggleExpand = (id: string | number) => {
    setExpandedRowId((prev) => (prev === id ? null : id))
  }

  // Map backend response ke interface tampilan admin
  const mapBackendLayananToAdmin = (item: any): AdminLayananItem => {
    let catId = "01"
    const cat = (item.kategori || "").toUpperCase()
    if (cat === "KONSULTASI") catId = "01"
    else if (cat === "WORKSHOP") catId = "03"
    else if (cat === "SEMINAR") catId = "04"
    else if (cat === "ASESMEN") catId = "05"

    return {
      id: item.id,
      layanan: item.nama,
      kategoriId: catId,
      metode: item.metode || "Online/Offline",
      weekday: formatRupiahStandard(item.harga_weekday),
      weekend: formatRupiahStandard(item.harga_weekend),
      status: item.aktif ? "Aktif" : "Nonaktif",
      deskripsi: item.deskripsi || "",
      bannerUrl: item.banner_url || "",
      tarif_tenaga_ahli: item.tarif_tenaga_ahli || null,
    }
  }

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

  // Ambil data layanan dari backend database, atau fallback data tersimpan
  const fetchLayanan = async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const res: any = await layananService.getAll()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      if (list.length > 0) {
        setLayananList(list.map(mapBackendLayananToAdmin))
      } else {
        setLayananList(getStoredLayanan())
      }
    } catch (err) {
      console.warn("Backend offline, menggunakan data layanan terdaftar:", err)
      const local = getStoredLayanan()
      if (local.length > 0) {
        setLayananList(local)
      } else {
        setIsError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLayanan()
  }, [])

  // Toggle status layanan (Aktif <-> Nonaktif) - Layanan tetap ada di admin, hanya statusnya yang berganti
  const handleToggleStatus = async (item: AdminLayananItem) => {
    const newStatus: "Aktif" | "Nonaktif" = item.status === "Aktif" ? "Nonaktif" : "Aktif"
    const newAktif = newStatus === "Aktif"

    // 1. Optimistic UI update di tabel admin (layanan tetap ditampilkan, tidak dihilangkan)
    setLayananList((prev) =>
      prev.map((l) => (String(l.id) === String(item.id) ? { ...l, status: newStatus } : l))
    )

    // 2. Simpan ke local storage
    updateLayananById(item.id, { status: newStatus })

    // 3. Simpan ke database backend
    try {
      await layananService.update(String(item.id), {
        status: newStatus,
        aktif: newAktif,
      })
      setToastMsg(`Status layanan "${item.layanan}" diubah menjadi ${newStatus}.`)
      setTimeout(() => setToastMsg(null), 3000)
    } catch (err: any) {
      console.warn("Gagal update status layanan ke server:", err)
      setToastMsg(`Status layanan "${item.layanan}" diubah menjadi ${newStatus}.`)
      setTimeout(() => setToastMsg(null), 3000)
    }
  }

  // Handle Hapus Layanan langsung ke database backend
  const handleDelete = async (item: AdminLayananItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus layanan "${item.layanan}"?`)) {
      try {
        await layananService.delete(String(item.id))
        deleteLayananById(item.id)
        setLayananList((prev) => prev.filter((l) => l.id !== item.id))
        setToastMsg(`Layanan "${item.layanan}" telah dihapus.`)
        setTimeout(() => setToastMsg(null), 3000)
      } catch (err: any) {
        alert(err?.message || "Gagal menghapus layanan dari server.")
      }
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

  const formatPrice = (val: any, fallbackStr: string = "Rp 0") => {
    return formatRupiahStandard(val, fallbackStr)
  }

  const isKonsultasi = activeCategory === "01"

  const columns: ColumnDef<AdminLayananItem>[] = useMemo(() => {
    return [
      {
        key: "no",
        header: "No",
        align: "center",
        width: "60px",
        render: (_: AdminLayananItem, index: number) => (
          <span className="font-semibold text-gray-500">{index + 1}</span>
        ),
      },
      {
        key: "layanan",
        header: "Layanan",
        render: (item: AdminLayananItem) => {
          const isExpanded = expandedRowId === item.id
          return (
            <div className="flex items-center gap-2.5">
              {isKonsultasi && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(item.id)
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 border ${
                    isExpanded
                      ? "bg-[#561269] text-white border-[#561269] shadow-xs"
                      : "bg-purple-50 text-[#561269] hover:bg-purple-100 hover:border-purple-300 border-purple-200/80 shadow-2xs"
                  }`}
                  title={isExpanded ? "Tutup rincian tarif tenaga ahli" : "Buka rincian tarif 3 tenaga ahli"}
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
              <span
                onClick={() => isKonsultasi && toggleExpand(item.id)}
                className={`font-extrabold text-gray-900 leading-tight ${
                  isKonsultasi ? "cursor-pointer hover:text-[#561269] transition-colors" : ""
                }`}
                title={isKonsultasi ? (isExpanded ? "Tutup rincian tarif" : "Klik untuk buka rincian tarif") : undefined}
              >
                {item.layanan}
              </span>
            </div>
          )
        },
      },
      {
        key: "metode",
        header: "Metode Pelaksanaan",
        render: (item: AdminLayananItem) => (
          <span className="text-gray-700 font-medium text-xs sm:text-sm">{item.metode}</span>
        ),
      },
      {
        key: "weekday",
        header: "Weekday",
        width: "180px",
        className: "whitespace-nowrap",
        render: (item: AdminLayananItem) => {
          const t = item.tarif_tenaga_ahli
          const psiWd = formatPrice(t?.psikolog?.weekday, item.weekday)

          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums whitespace-nowrap">
                {isKonsultasi ? psiWd : formatRupiahStandard(item.weekday)}
              </span>
              {isKonsultasi && (
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/70 whitespace-nowrap shrink-0">
                  Psikolog
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: "weekend",
        header: "Weekend",
        width: "180px",
        className: "whitespace-nowrap",
        render: (item: AdminLayananItem) => {
          const t = item.tarif_tenaga_ahli
          const psiWk = formatPrice(t?.psikolog?.weekend, item.weekend)

          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums whitespace-nowrap">
                {isKonsultasi ? psiWk : formatRupiahStandard(item.weekend)}
              </span>
              {isKonsultasi && (
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/70 whitespace-nowrap shrink-0">
                  Psikolog
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (item: AdminLayananItem) => (
          <button
            type="button"
            onClick={() => handleToggleStatus(item)}
            className="cursor-pointer transition-transform active:scale-95 group flex items-center justify-center mx-auto"
            title="Klik untuk ubah status Aktif / Nonaktif"
          >
            <AdminStatusBadge
              variant={item.status === "Aktif" ? "success" : "neutral"}
              className="w-28 cursor-pointer group-hover:opacity-80 transition-opacity"
            >
              {item.status}
            </AdminStatusBadge>
          </button>
        ),
      },
      {
        key: "aksi",
        header: "Aksi",
        align: "center",
        render: (item: AdminLayananItem) => {
          return (
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
          )
        },
      },
    ]
  }, [isKonsultasi, router, expandedRowId])

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

        {/* Tampilan Error & Muat Ulang */}
        {isError && (
          <div className="my-6 p-8 text-center bg-amber-50 border border-amber-200 rounded-3xl">
            <p className="text-sm sm:text-base font-bold text-amber-900 mb-1">
              ⚠️ Gagal memuat daftar layanan. Silakan periksa koneksi Anda dan coba lagi.
            </p>
            <p className="text-xs text-amber-700 mb-4">
              Server database tidak dapat dijangkau saat ini.
            </p>
            <button
              type="button"
              onClick={fetchLayanan}
              className="px-6 py-2 bg-[#561269] hover:bg-[#430e52] text-white text-xs sm:text-sm font-bold rounded-full transition shadow-xs active:scale-95 cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isError && (
          <div className="py-16 text-center text-gray-400 text-sm font-medium animate-pulse">
            Memuat data layanan dari server...
          </div>
        )}

        {/* Tabel Layanan */}
        {!isLoading && !isError && (
          <AdminDataTable
            columns={columns}
            data={filteredLayanan}
            minWidth={isKonsultasi ? "920px" : "760px"}
            keyExtractor={(item: AdminLayananItem) => item.id}
            emptyMessage="Tidak ada layanan yang ditemukan dalam kategori ini."
            renderSubRow={(item: AdminLayananItem) => {
              if (!isKonsultasi || expandedRowId !== item.id) return null

              const t = item.tarif_tenaga_ahli
              const psiWd = formatPrice(t?.psikolog?.weekday, item.weekday)
              const psiWk = formatPrice(t?.psikolog?.weekend, item.weekend)
              const konWd = formatPrice(t?.konselor?.weekday, item.weekday)
              const konWk = formatPrice(t?.konselor?.weekend, item.weekend)
              const peerWd = formatPrice(t?.peer?.weekday, item.weekday)
              const peerWk = formatPrice(t?.peer?.weekend, item.weekend)

              return (
                <div className="py-2.5 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-white border border-purple-200/80 rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#561269]" />
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                          Rincian Tarif Lengkap per Tenaga Ahli &bull; {item.layanan}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        Weekday (Senin - Jumat) &bull; Weekend (Sabtu - Minggu)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Psikolog */}
                      <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#561269] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#561269]" />
                            Psikolog
                          </span>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md uppercase">
                            Utama
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1 border-t border-purple-100 text-xs">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekday:</span>
                            <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">{psiWd}</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekend:</span>
                            <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">{psiWk}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Konselor */}
                      <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            Konselor
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1 border-t border-blue-100 text-xs">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekday:</span>
                            <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">{konWd}</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekend:</span>
                            <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">{konWk}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Peer Helper */}
                      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            Peer Helper
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1 border-t border-emerald-100 text-xs">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekday:</span>
                            <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">{peerWd}</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekend:</span>
                            <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">{peerWk}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }}
          />
        )}
      </AdminTableContainer>

      {/* ── DETAIL MODAL ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
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
                <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Status Layanan</span>
                    <span className={`font-bold mt-1 block ${selectedDetail.status === "Aktif" ? "text-emerald-600" : "text-gray-500"}`}>
                      {selectedDetail.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleStatus(selectedDetail)
                      setSelectedDetail((prev) =>
                        prev ? { ...prev, status: prev.status === "Aktif" ? "Nonaktif" : "Aktif" } : null
                      )
                    }}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  >
                    Ubah ke {selectedDetail.status === "Aktif" ? "Nonaktif" : "Aktif"}
                  </button>
                </div>
              </div>

              {/* Detail Tarif Layanan */}
              {selectedDetail.kategoriId === "01" ? (
                /* Khusus Konsultasi: 3 Kartu Terpisah Tenaga Ahli */
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#561269] block">
                    Tarif Konsultasi per Tenaga Ahli
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Psikolog */}
                    <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-xs text-[#561269]">
                          <span className="w-2 h-2 rounded-full bg-[#561269]" />
                          Psikolog
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100/90 px-1.5 py-0.5 rounded uppercase">
                          Utama
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1 border-t border-purple-100/80 text-xs">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-gray-500 text-[11px] shrink-0">Weekday:</span>
                          <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                            {formatPrice(selectedDetail.tarif_tenaga_ahli?.psikolog?.weekday, selectedDetail.weekday)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-gray-500 text-[11px] shrink-0">Weekend:</span>
                          <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                            {formatPrice(selectedDetail.tarif_tenaga_ahli?.psikolog?.weekend, selectedDetail.weekend)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Konselor */}
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-xs text-blue-700">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          Konselor
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1 border-t border-blue-100/80 text-xs">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-gray-500 text-[11px] shrink-0">Weekday:</span>
                          <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                            {formatPrice(selectedDetail.tarif_tenaga_ahli?.konselor?.weekday, selectedDetail.weekday)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-gray-500 text-[11px] shrink-0">Weekend:</span>
                          <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                            {formatPrice(selectedDetail.tarif_tenaga_ahli?.konselor?.weekend, selectedDetail.weekend)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Peer Konselor */}
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Peer Konselor
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1 border-t border-emerald-100/80 text-xs">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-gray-500 text-[11px] shrink-0">Weekday:</span>
                          <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                            {formatPrice(selectedDetail.tarif_tenaga_ahli?.peer?.weekday, selectedDetail.weekday)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-gray-500 text-[11px] shrink-0">Weekend:</span>
                          <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                            {formatPrice(selectedDetail.tarif_tenaga_ahli?.peer?.weekend, selectedDetail.weekend)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-Konsultasi: 2 Kartu Reguler */
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 sm:p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
                    <span className="text-xs text-purple-800 font-medium block">Tarif Weekday</span>
                    <span className="font-bold text-[#561269] text-sm mt-1 block whitespace-nowrap tabular-nums">
                      {selectedDetail.weekday}
                    </span>
                  </div>
                  <div className="p-3 sm:p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
                    <span className="text-xs text-purple-800 font-medium block">Tarif Weekend</span>
                    <span className="font-bold text-[#561269] text-sm mt-1 block whitespace-nowrap tabular-nums">
                      {selectedDetail.weekend}
                    </span>
                  </div>
                </div>
              )}
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
