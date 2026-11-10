"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarClock,
  X,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Calendar,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react"
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

function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return "-"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "-"
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export default function AdminLayananView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Kategori yang diizinkan di admin
  const allowedCategories = ["01", "03", "04", "05"]
  const adminCategories = CATEGORIES.filter((cat) => allowedCategories.includes(cat.id))

  const categoryParam = searchParams ? (searchParams.get("category") || searchParams.get("kategori")) : null
  const qParam = searchParams ? (searchParams.get("q") || searchParams.get("search")) : null

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (categoryParam && allowedCategories.includes(categoryParam)) {
      return categoryParam
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("empathika_admin_layanan_category")
      if (saved && allowedCategories.includes(saved)) {
        return saved
      }
    }
    return adminCategories[0]?.id || "01"
  })

  useEffect(() => {
    if (categoryParam && allowedCategories.includes(categoryParam)) {
      setActiveCategory(categoryParam)
      if (typeof window !== "undefined") {
        localStorage.setItem("empathika_admin_layanan_category", categoryParam)
      }
    } else if (!categoryParam && typeof window !== "undefined") {
      const saved = localStorage.getItem("empathika_admin_layanan_category")
      if (saved && allowedCategories.includes(saved) && saved !== activeCategory) {
        setActiveCategory(saved)
        const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
        params.set("category", saved)
        const qs = params.toString()
        router.replace((qs ? `/admin/layanan?${qs}` : "/admin/layanan") as any, { scroll: false })
      }
    }
  }, [categoryParam])
  const [searchQuery, setSearchQuery] = useState(qParam || "")
  const [layananList, setLayananList] = useState<AdminLayananItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Modal & Expand States
  const [selectedDetail, setSelectedDetail] = useState<AdminLayananItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<AdminLayananItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
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

    const rawFotos = item.foto_kegiatan || (item.tarif_tenaga_ahli as any)?.foto_kegiatan
    const fotosList =
      Array.isArray(rawFotos) && rawFotos.length > 0
        ? rawFotos.filter(Boolean)
        : item.banner_url
        ? [item.banner_url]
        : undefined

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
      foto_kegiatan: fotosList,
      tarif_tenaga_ahli: item.tarif_tenaga_ahli || null,
      createdAt: item.createdAt || undefined,
      updatedAt: item.updatedAt || undefined,
    }
  }

  // Ganti tab kategori sekaligus update URL query param tanpa reload halaman
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId)
    if (typeof window !== "undefined") {
      localStorage.setItem("empathika_admin_layanan_category", catId)
    }
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

  // Ambil data layanan murni dari database backend
  const fetchLayanan = async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const res: any = await layananService.getAll()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setLayananList(list.map(mapBackendLayananToAdmin))
    } catch (err) {
      console.warn("Gagal memuat layanan dari server database:", err)
      setIsError(true)
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
    const nowIso = new Date().toISOString()

    // 1. Optimistic UI update di tabel admin (layanan tetap ditampilkan, tidak dihilangkan)
    setLayananList((prev) =>
      prev.map((l) => (String(l.id) === String(item.id) ? { ...l, status: newStatus, updatedAt: nowIso } : l))
    )

    // 2. Simpan ke local storage
    updateLayananById(item.id, { status: newStatus, updatedAt: nowIso })

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

  // Handle Hapus Layanan langsung ke database backend via modal konfirmasi kustom
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await layananService.delete(String(itemToDelete.id))
      deleteLayananById(itemToDelete.id)
      setLayananList((prev) => prev.filter((l) => l.id !== itemToDelete.id))
      setToastMsg(`Layanan "${itemToDelete.layanan}" telah dihapus.`)
      setTimeout(() => setToastMsg(null), 3000)
      setItemToDelete(null)
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus layanan dari server.")
    } finally {
      setIsDeleting(false)
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
  const isPartnership = activeCategory === "03" || activeCategory === "04"

  const columns: ColumnDef<AdminLayananItem>[] = useMemo(() => {
    const baseCols: ColumnDef<AdminLayananItem>[] = [
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
    ]

    // Kolom Metode Pelaksanaan & Tarif Weekday/Weekend hanya untuk Konsultasi (01) & Asesmen (05)
    // Untuk Workshop & Seminar, kolom ini disembunyikan sepenuhnya karena tidak berlaku
    if (!isPartnership) {
      baseCols.push(
        {
          key: "metode",
          header: "Metode Pelaksanaan",
          width: "180px",
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
            if (isKonsultasi) {
              const activeExperts: { label: string; weekday: any; weekend: any }[] = []
              if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
                activeExperts.push({ label: "Psikolog", weekday: t.psikolog.weekday, weekend: t.psikolog.weekend })
              }
              if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
                activeExperts.push({ label: "Konselor", weekday: t.konselor.weekday, weekend: t.konselor.weekend })
              }
              if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
                activeExperts.push({ label: "Peer", weekday: t.peer.weekday, weekend: t.peer.weekend })
              }

              if (activeExperts.length === 0) {
                return (
                  <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums whitespace-nowrap">
                    {formatPrice(item.weekday)}
                  </span>
                )
              }

              const first = activeExperts[0]
              return (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums">
                    {formatPrice(first.weekday, item.weekday)}
                  </span>
                  <span className="text-[10px] font-bold text-[#561269] bg-purple-100 px-1.5 py-0.5 rounded">
                    {first.label}
                  </span>
                  {activeExperts.length > 1 && (
                    <span className="text-[10px] text-gray-500 font-semibold" title={`${activeExperts.length} tenaga ahli tersedia`}>
                      +{activeExperts.length - 1}
                    </span>
                  )}
                </div>
              )
            }

            if (item.kategoriId === "05") {
              const isOnlyOnline = (item.metode || "").toLowerCase().includes("online") && !(item.metode || "").toLowerCase().includes("offline")
              const onlineVal = (t as any)?.asesmen?.online ?? (t as any)?.online
              const offlineWk = (t as any)?.asesmen?.offline?.weekday ?? (t as any)?.offline?.weekday ?? item.weekday

              if (isOnlyOnline) {
                return (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums">
                      {formatPrice(onlineVal, item.weekday)}
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      Online
                    </span>
                  </div>
                )
              }

              return (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums">
                    {formatPrice(offlineWk, item.weekday)}
                  </span>
                  {(item.metode || "").toLowerCase().includes("offline") && (
                    <span className="text-[10px] font-bold text-[#561269] bg-purple-100 px-1.5 py-0.5 rounded">
                      Offline
                    </span>
                  )}
                </div>
              )
            }

            return (
              <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums whitespace-nowrap">
                {formatRupiahStandard(item.weekday)}
              </span>
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
            if (isKonsultasi) {
              const activeExperts: { label: string; weekday: any; weekend: any }[] = []
              if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
                activeExperts.push({ label: "Psikolog", weekday: t.psikolog.weekday, weekend: t.psikolog.weekend })
              }
              if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
                activeExperts.push({ label: "Konselor", weekday: t.konselor.weekday, weekend: t.konselor.weekend })
              }
              if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
                activeExperts.push({ label: "Peer", weekday: t.peer.weekday, weekend: t.peer.weekend })
              }

              if (activeExperts.length === 0) {
                return (
                  <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums whitespace-nowrap">
                    {formatPrice(item.weekend)}
                  </span>
                )
              }

              const first = activeExperts[0]
              return (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums">
                    {formatPrice(first.weekend, item.weekend)}
                  </span>
                  <span className="text-[10px] font-bold text-[#561269] bg-purple-100 px-1.5 py-0.5 rounded">
                    {first.label}
                  </span>
                  {activeExperts.length > 1 && (
                    <span className="text-[10px] text-gray-500 font-semibold" title={`${activeExperts.length} tenaga ahli tersedia`}>
                      +{activeExperts.length - 1}
                    </span>
                  )}
                </div>
              )
            }

            if (item.kategoriId === "05") {
              const isOnlyOnline = (item.metode || "").toLowerCase().includes("online") && !(item.metode || "").toLowerCase().includes("offline")
              const offlineWknd = (t as any)?.asesmen?.offline?.weekend ?? (t as any)?.offline?.weekend ?? item.weekend

              if (isOnlyOnline) {
                return (
                  <span className="text-gray-400 font-medium text-xs italic whitespace-nowrap">
                    - (Sama)
                  </span>
                )
              }

              return (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums">
                    {formatPrice(offlineWknd, item.weekend)}
                  </span>
                  {(item.metode || "").toLowerCase().includes("offline") && (
                    <span className="text-[10px] font-bold text-[#561269] bg-purple-100 px-1.5 py-0.5 rounded">
                      Offline
                    </span>
                  )}
                </div>
              )
            }

            return (
              <span className="text-gray-900 font-bold text-xs sm:text-sm tabular-nums whitespace-nowrap">
                {formatRupiahStandard(item.weekend)}
              </span>
            )
          },
        }
      )
    }

    baseCols.push(
      {
        key: "status",
        header: "Status",
        align: "center",
        width: isPartnership ? "180px" : "140px",
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
        width: isPartnership ? "180px" : "150px",
        render: (item: AdminLayananItem) => {
          return (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <ActionButtonDetail
                onClick={() => setSelectedDetail(item)}
                title="Lihat Detail"
              />
              <ActionButtonEdit
                onClick={() => router.push(`/admin/layanan/edit/${item.id}?category=${item.kategoriId || activeCategory}`)}
                title="Edit Layanan"
              />
              <ActionButtonDelete
                onClick={() => setItemToDelete(item)}
                title="Hapus Layanan"
              />
            </div>
          )
        },
      }
    )

    return baseCols
  }, [isKonsultasi, isPartnership, router, expandedRowId])

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
              const cards: React.ReactNode[] = []

              // 1. Psikolog
              if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
                cards.push(
                  <div key="psikolog" className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#561269] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#561269]" />
                        Psikolog
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md uppercase">
                        Tersedia
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-1 border-t border-purple-100 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekday:</span>
                        <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatPrice(t.psikolog.weekday, item.weekday)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekend:</span>
                        <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatPrice(t.psikolog.weekend, item.weekend)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }

              // 2. Konselor
              if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
                cards.push(
                  <div key="konselor" className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        Konselor
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md uppercase">
                        Tersedia
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-1 border-t border-blue-100 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekday:</span>
                        <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatPrice(t.konselor.weekday, item.weekday)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekend:</span>
                        <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatPrice(t.konselor.weekend, item.weekend)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }

              // 3. Peer Helper
              if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
                cards.push(
                  <div key="peer" className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Peer Helper
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                        Tersedia
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-1 border-t border-emerald-100 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekday:</span>
                        <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatPrice(t.peer.weekday, item.weekday)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px] shrink-0">Tarif Weekend:</span>
                        <span className="font-extrabold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatPrice(t.peer.weekend, item.weekend)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }

              if (cards.length === 0) {
                cards.push(
                  <div key="default" className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-2">
                    <span className="text-xs font-extrabold text-[#561269]">Tarif Konsultasi</span>
                    <div className="space-y-1.5 pt-1 border-t border-purple-100 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px]">Tarif Weekday:</span>
                        <span className="font-extrabold text-gray-900">{formatPrice(item.weekday)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-500 text-[11px]">Tarif Weekend:</span>
                        <span className="font-extrabold text-gray-900">{formatPrice(item.weekend)}</span>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div className="py-2.5 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-white border border-purple-200/80 rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#561269]" />
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                          Rincian Tarif Tenaga Ahli yang Tersedia &bull; {item.layanan} ({cards.length} Tenaga Ahli)
                        </span>
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 ${cards.length === 1 ? "sm:grid-cols-1 max-w-sm" : cards.length === 2 ? "sm:grid-cols-2 max-w-2xl" : "sm:grid-cols-3"} gap-3`}>
                      {cards}
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

              {(() => {
                const isDetailPartnership = selectedDetail.kategoriId === "03" || selectedDetail.kategoriId === "04"
                return (
                  <div className={`grid ${!isDetailPartnership ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                    {!isDetailPartnership && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs text-gray-500 font-medium block">Metode Pelaksanaan</span>
                        <span className="font-bold text-gray-900 mt-1 block">{selectedDetail.metode}</span>
                      </div>
                    )}
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
                            prev
                              ? {
                                  ...prev,
                                  status: prev.status === "Aktif" ? "Nonaktif" : "Aktif",
                                  updatedAt: new Date().toISOString(),
                                }
                              : null
                          )
                        }}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                      >
                        Ubah ke {selectedDetail.status === "Aktif" ? "Nonaktif" : "Aktif"}
                      </button>
                    </div>
                  </div>
                )
              })()}

              {/* Detail Tarif Layanan */}
              {selectedDetail.kategoriId === "01" ? (
                /* Khusus Konsultasi: Hanya Tampilkan Tenaga Ahli yang Diisi Tarifnya */
                (() => {
                  const t = selectedDetail.tarif_tenaga_ahli
                  const detailCards: React.ReactNode[] = []

                  if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
                    detailCards.push(
                      <div key="psikolog" className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold text-xs text-[#561269]">
                            <span className="w-2 h-2 rounded-full bg-[#561269]" />
                            Psikolog
                          </span>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100/90 px-1.5 py-0.5 rounded uppercase">
                            Tersedia
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1 border-t border-purple-100/80 text-xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px] shrink-0">Weekday:</span>
                            <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                              {formatPrice(t.psikolog.weekday, selectedDetail.weekday)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px] shrink-0">Weekend:</span>
                            <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                              {formatPrice(t.psikolog.weekend, selectedDetail.weekend)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
                    detailCards.push(
                      <div key="konselor" className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold text-xs text-blue-700">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            Konselor
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                            Tersedia
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1 border-t border-blue-100/80 text-xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px] shrink-0">Weekday:</span>
                            <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                              {formatPrice(t.konselor.weekday, selectedDetail.weekday)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px] shrink-0">Weekend:</span>
                            <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                              {formatPrice(t.konselor.weekend, selectedDetail.weekend)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
                    detailCards.push(
                      <div key="peer" className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            Peer Konselor
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                            Tersedia
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1 border-t border-emerald-100/80 text-xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px] shrink-0">Weekday:</span>
                            <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                              {formatPrice(t.peer.weekday, selectedDetail.weekday)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px] shrink-0">Weekend:</span>
                            <span className="font-bold text-gray-900 whitespace-nowrap tabular-nums text-right text-xs">
                              {formatPrice(t.peer.weekend, selectedDetail.weekend)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (detailCards.length === 0) {
                    detailCards.push(
                      <div key="default" className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2">
                        <span className="font-bold text-xs text-[#561269]">Tarif Layanan</span>
                        <div className="space-y-1.5 pt-1 border-t border-purple-100/80 text-xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px]">Weekday:</span>
                            <span className="font-bold text-gray-900">{formatPrice(selectedDetail.weekday)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-gray-500 text-[11px]">Weekend:</span>
                            <span className="font-bold text-gray-900">{formatPrice(selectedDetail.weekend)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#561269] block">
                        Tarif Konsultasi per Tenaga Ahli ({detailCards.length} Tenaga Ahli Tersedia)
                      </span>
                      <div className={`grid grid-cols-1 ${detailCards.length === 1 ? "sm:grid-cols-1 max-w-sm" : detailCards.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3`}>
                        {detailCards}
                      </div>
                    </div>
                  )
                })()
              ) : selectedDetail.kategoriId === "03" || selectedDetail.kategoriId === "04" ? null : (
                /* Asesmen (05): Kartu Online & Offline */
                (() => {
                  const t = selectedDetail.tarif_tenaga_ahli
                  const hasOnline = (selectedDetail.metode || "").toLowerCase().includes("online")
                  const hasOffline = (selectedDetail.metode || "").toLowerCase().includes("offline")
                  const onlineVal = (t as any)?.asesmen?.online ?? (t as any)?.online ?? (hasOnline && !hasOffline ? selectedDetail.weekday : null)
                  const offlineWk = (t as any)?.asesmen?.offline?.weekday ?? (t as any)?.offline?.weekday ?? selectedDetail.weekday
                  const offlineWknd = (t as any)?.asesmen?.offline?.weekend ?? (t as any)?.offline?.weekend ?? selectedDetail.weekend

                  return (
                    <div className="space-y-3">
                      {hasOnline && (
                        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              <span className="text-xs text-blue-900 font-bold">Tarif Online (Psikotes)</span>
                            </div>
                            <span className="text-[11px] text-gray-500 block mt-0.5">
                              Berlaku setiap hari (tanpa perbedaan weekday/weekend)
                            </span>
                          </div>
                          <span className="font-extrabold text-blue-800 text-sm whitespace-nowrap tabular-nums">
                            {formatPrice(onlineVal, selectedDetail.weekday)}
                          </span>
                        </div>
                      )}

                      {hasOffline && (
                        <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 border-b border-purple-100 pb-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#561269]"></span>
                            <span className="text-xs text-[#561269] font-bold">Tarif Offline (Tatap Muka di Klinik)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-[11px] text-gray-500 font-medium block">Weekday (Senin - Jumat)</span>
                              <span className="font-bold text-[#561269] text-sm block whitespace-nowrap tabular-nums">
                                {formatPrice(offlineWk, selectedDetail.weekday)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[11px] text-gray-500 font-medium block">Weekend (Sabtu - Minggu)</span>
                              <span className="font-bold text-[#561269] text-sm block whitespace-nowrap tabular-nums">
                                {formatPrice(offlineWknd, selectedDetail.weekend)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()
              )}

              {/* ── Galeri Foto Kegiatan (Workshop & Seminar) atau Banner (Konsultasi & Asesmen) ── */}
              {(() => {
                const isDetailPartnership = selectedDetail.kategoriId === "03" || selectedDetail.kategoriId === "04"
                const rawFotos = selectedDetail.foto_kegiatan || (selectedDetail.tarif_tenaga_ahli as any)?.foto_kegiatan
                const fotos: string[] =
                  Array.isArray(rawFotos) && rawFotos.length > 0
                    ? rawFotos.filter(Boolean)
                    : selectedDetail.bannerUrl
                    ? [selectedDetail.bannerUrl]
                    : []

                if (isDetailPartnership) {
                  return (
                    <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#561269]" />
                          Pratinjau Foto Kegiatan (Maksimal 3 Foto)
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {fotos.length} dari 3 foto terisi
                        </span>
                      </div>

                      {fotos.length === 0 ? (
                        <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white">
                          <ImageIcon className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
                          <p className="text-xs text-gray-500 font-medium">Belum ada foto kegiatan yang diunggah.</p>
                          <p className="text-[10px] text-gray-400">Unggah foto kegiatan melalui tombol Edit Layanan.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {[0, 1, 2].map((idx) => {
                            const url = fotos[idx]
                            return (
                              <div
                                key={idx}
                                className={`relative rounded-xl overflow-hidden border ${
                                  url ? "border-purple-200 bg-white" : "border-dashed border-gray-200 bg-gray-100/60"
                                } flex flex-col justify-between min-h-[125px]`}
                              >
                                {url ? (
                                  <>
                                    <div className="w-full h-24 relative bg-gray-100 overflow-hidden">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={url}
                                        alt={`Foto Kegiatan ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                      />
                                    </div>
                                    <div className="w-full px-2.5 py-1.5 bg-white flex items-center justify-between border-t border-purple-100 text-[10px]">
                                      <span className="font-bold text-gray-700">
                                        {idx === 0 ? "⭐ Foto 1 (Utama)" : `Foto ${idx + 1}`}
                                      </span>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#561269] hover:underline font-semibold"
                                      >
                                        Buka
                                      </a>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center p-4 text-gray-400 my-auto">
                                    <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-40" />
                                    <span className="text-[10px] font-medium block">Foto {idx + 1} Kosong</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }

                if (selectedDetail.bannerUrl) {
                  return (
                    <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#561269]" />
                        Poster / Banner Layanan
                      </span>
                      <div className="relative rounded-xl overflow-hidden border border-purple-200 bg-white max-w-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedDetail.bannerUrl}
                          alt={selectedDetail.layanan}
                          className="w-full h-32 object-cover"
                        />
                        <div className="px-2.5 py-1.5 bg-white flex items-center justify-between border-t border-purple-100 text-[10px]">
                          <span className="font-bold text-gray-700">Banner Tampilan</span>
                          <a
                            href={selectedDetail.bannerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#561269] hover:underline font-semibold"
                          >
                            Buka Penuh
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                }

                return null
              })()}

              {/* ── Audit Log: Waktu Pembuatan & Pembaruan Terakhir ── */}
              <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Informasi Aktivitas Data (Audit Log)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-gray-500">Dibuat:</span>
                    <span className="font-semibold text-gray-800 ml-auto tabular-nums">
                      {formatDateIndo(selectedDetail.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                    <Clock className="w-3.5 h-3.5 text-[#561269] shrink-0" />
                    <span className="text-gray-500">Terakhir Diperbarui:</span>
                    <span className="font-semibold text-gray-800 ml-auto tabular-nums">
                      {formatDateIndo(selectedDetail.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedDetail.id
                  const targetCat = selectedDetail.kategoriId || activeCategory
                  setSelectedDetail(null)
                  router.push(`/admin/layanan/edit/${targetId}?category=${targetCat}`)
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

      {/* ── MODAL KONFIRMASI HAPUS KUSTOM ── */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => !isDeleting && setItemToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 ring-8 ring-red-50/50">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Layanan?</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mb-6">
                Apakah Anda yakin ingin menghapus layanan{" "}
                <span className="font-extrabold text-gray-900">&ldquo;{itemToDelete.layanan}&rdquo;</span>?
                Tindakan ini akan menonaktifkan atau menghapus data layanan dari sistem.
              </p>

              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-full border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Ya, Hapus</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
