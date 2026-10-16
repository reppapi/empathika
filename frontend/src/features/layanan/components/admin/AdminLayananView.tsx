"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CalendarClock, X, Eye, Edit, Trash2, CloudUpload, CheckCircle2 } from "lucide-react"
import { CATEGORIES } from "../../data/layananData"
import {
  getStoredLayanan,
  saveStoredLayanan,
  updateLayananById,
  deleteLayananById,
  AdminLayananItem,
} from "../../data/adminLayananData"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [layananList, setLayananList] = useState<AdminLayananItem[]>([])

  // Modal States
  const [selectedDetail, setSelectedDetail] = useState<AdminLayananItem | null>(null)
  const [editingItem, setEditingItem] = useState<AdminLayananItem | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Edit Form Fields State
  const [editKategori, setEditKategori] = useState("02")
  const [editNama, setEditNama] = useState("")
  const [editMetode, setEditMetode] = useState("Online/Offline")
  const [editStatus, setEditStatus] = useState<"Aktif" | "Nonaktif">("Aktif")
  const [editDeskripsi, setEditDeskripsi] = useState("")
  const [editWeekday, setEditWeekday] = useState("")
  const [editWeekend, setEditWeekend] = useState("")
  const [editBanner, setEditBanner] = useState<string | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Kategori yang diizinkan di admin
  const allowedCategories = ["02", "03", "05"]
  const adminCategories = CATEGORIES.filter((cat) => allowedCategories.includes(cat.id))
  const [activeCategory, setActiveCategory] = useState(adminCategories[0]?.id || "02")

  // Load data from persistent storage
  useEffect(() => {
    setLayananList(getStoredLayanan())
  }, [])

  // Buka Modal Edit & Isi Data Form
  const handleOpenEdit = (item: AdminLayananItem) => {
    setEditingItem(item)
    setEditKategori(item.kategoriId || "02")
    setEditNama(item.layanan)
    setEditMetode(item.metode || "Online/Offline")
    setEditStatus(item.status)
    setEditDeskripsi(item.deskripsi || "")
    setEditWeekday(item.weekday.replace(/[^0-9]/g, ""))
    setEditWeekend(item.weekend.replace(/[^0-9]/g, ""))
    setEditBanner(item.bannerUrl || null)
  }

  // Handle Simpan Perubahan Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    if (!editNama.trim()) {
      alert("Nama layanan tidak boleh kosong.")
      return
    }

    const formatRp = (val: string) => {
      const num = parseInt(val.replace(/[^0-9]/g, "") || "0", 10)
      return `Rp ${num.toLocaleString("id-ID")}`
    }

    const updatedData: Partial<AdminLayananItem> = {
      layanan: editNama.trim(),
      kategoriId: editKategori,
      metode: editMetode,
      status: editStatus,
      deskripsi: editDeskripsi.trim(),
      weekday: formatRp(editWeekday),
      weekend: formatRp(editWeekend),
      bannerUrl: editBanner || "",
    }

    updateLayananById(editingItem.id, updatedData)
    const freshList = getStoredLayanan()
    setLayananList(freshList)
    setEditingItem(null)

    setToastMsg(`Layanan "${editNama.trim()}" berhasil diperbarui!`)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Handle Upload Image Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file banner maksimal 2MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditBanner(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Hapus Layanan
  const handleDelete = (item: AdminLayananItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus layanan "${item.layanan}"?`)) {
      deleteLayananById(item.id)
      setLayananList(getStoredLayanan())
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
            onClick={() => handleOpenEdit(item)}
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

      {/* ── Top Bar Action: Tombol Tambah Layanan ── */}
      <div className="flex justify-end">
        <Link
          href={`/admin/layanan/tambah?category=${activeCategory}`}
          className="flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
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

      {/* ── Metric Card: Total Layanan ── */}
      <div className="w-full max-w-sm">
        <AdminSummaryCard
          label="Total Layanan"
          value={filteredLayanan.length}
          icon={<CalendarClock className="w-6 h-6 text-[#561269]" />}
          iconBgColor="bg-purple-50 text-[#561269]"
        />
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
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>

          {/* Search Input */}
          <AdminSearchInput
            placeholder="Cari Layanan..."
            value={searchQuery}
            onChange={setSearchQuery}
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

      {/* ── MODAL POP-UP EDIT LAYANAN (MUNCUL SAAT KLIK TOMBOL EDIT) ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 my-8 max-h-[90vh] overflow-y-auto admin-table-scrollbar">
            {/* Tombol Close */}
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div className="mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-[#CA8A04] flex items-center justify-center font-bold">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Layanan</h2>
                <p className="text-xs text-gray-500">Perbarui data layanan &quot;{editingItem.layanan}&quot;</p>
              </div>
            </div>

            <div className="w-full h-px bg-gray-200 mb-6" />

            {/* Form Edit */}
            <form onSubmit={handleSaveEdit} className="space-y-5 text-sm">
              {/* Kategori & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kategori Layanan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editKategori}
                    onChange={(e) => setEditKategori(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => ["02", "03", "05"].includes(c.id)).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Status Layanan <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-5 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editStatus"
                        value="Aktif"
                        checked={editStatus === "Aktif"}
                        onChange={() => setEditStatus("Aktif")}
                        className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                      />
                      <span className="text-sm text-gray-700 font-medium">Aktif</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editStatus"
                        value="Nonaktif"
                        checked={editStatus === "Nonaktif"}
                        onChange={() => setEditStatus("Nonaktif")}
                        className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                      />
                      <span className="text-sm text-gray-700 font-medium">Nonaktif</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Nama Layanan & Metode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nama Layanan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    placeholder="Contoh: Psikolog Klinis"
                    required
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Metode Pelaksanaan <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editMetode"
                        value="Online"
                        checked={editMetode === "Online"}
                        onChange={() => setEditMetode("Online")}
                        className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                      />
                      <span className="text-xs text-gray-700">Online</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editMetode"
                        value="Offline"
                        checked={editMetode === "Offline"}
                        onChange={() => setEditMetode("Offline")}
                        className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                      />
                      <span className="text-xs text-gray-700">Offline</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editMetode"
                        value="Online/Offline"
                        checked={editMetode === "Online/Offline"}
                        onChange={() => setEditMetode("Online/Offline")}
                        className="w-4 h-4 text-[#561269] focus:ring-[#561269]"
                      />
                      <span className="text-xs text-gray-700">Online/Offline</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Deskripsi Layanan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  placeholder="Jelaskan mengenai layanan ini..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] resize-y"
                />
              </div>

              {/* Tarif Weekday & Weekend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tarif Weekday (Senin - Jumat) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-lg shadow-2xs">
                    <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-bold">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={editWeekday}
                      onChange={(e) => setEditWeekday(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="350000"
                      required
                      className="flex-1 block w-full px-3.5 py-2 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tarif Weekend (Sabtu - Minggu) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-lg shadow-2xs">
                    <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-bold">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={editWeekend}
                      onChange={(e) => setEditWeekend(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="450000"
                      required
                      className="flex-1 block w-full px-3.5 py-2 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Banner */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Poster / Banner Layanan
                </label>
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    editBanner
                      ? "border-solid border-gray-200 bg-gray-50"
                      : "border-dashed border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{ minHeight: "110px" }}
                >
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {editBanner ? (
                    <div className="relative w-full h-24 flex items-center justify-center">
                      <Image
                        src={editBanner}
                        alt="Banner"
                        width={200}
                        height={96}
                        className="max-h-24 w-auto object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditBanner(null)
                        }}
                        className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <CloudUpload className="mx-auto w-6 h-6 text-gray-400" />
                      <p className="text-xs text-gray-600">Klik untuk upload gambar banner</p>
                      <p className="text-[10px] text-gray-400">JPG, PNG, WebP (Maks. 2MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Modal */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  const targetItem = selectedDetail
                  setSelectedDetail(null)
                  handleOpenEdit(targetItem)
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
