"use client"

import { CloudUpload, X, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CATEGORIES } from "../../data/layananData"
import { getLayananById, updateLayananById, AdminLayananItem } from "../../data/adminLayananData"

interface EditLayananViewProps {
  layananId: string
}

export default function EditLayananView({ layananId }: EditLayananViewProps) {
  const router = useRouter()
  const [item, setItem] = useState<AdminLayananItem | null>(null)
  const [loading, setLoading] = useState(true)

  // Form State
  const [selectedCategory, setSelectedCategory] = useState("02")
  const [namaLayanan, setNamaLayanan] = useState("")
  const [metode, setMetode] = useState("Online/Offline")
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif")
  const [deskripsi, setDeskripsi] = useState("")
  const [hargaWeekday, setHargaWeekday] = useState("")
  const [hargaWeekend, setHargaWeekend] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing data
  useEffect(() => {
    const existing = getLayananById(layananId)
    if (existing) {
      setItem(existing)
      setSelectedCategory(existing.kategoriId || "02")
      setNamaLayanan(existing.layanan)
      setMetode(existing.metode)
      setStatus(existing.status)
      setDeskripsi(existing.deskripsi || "")
      // Bersihkan string harga dari prefix "Rp " dan titik pemisah jika ada untuk input angka murni
      const cleanWeekday = existing.weekday.replace(/[^0-9]/g, "")
      const cleanWeekend = existing.weekend.replace(/[^0-9]/g, "")
      setHargaWeekday(cleanWeekday)
      setHargaWeekend(cleanWeekend)
      setImagePreview(existing.bannerUrl || null)
    }
    setLoading(false)
  }, [layananId])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!namaLayanan.trim()) {
      alert("Nama layanan wajib diisi.")
      return
    }

    const formatRupiah = (val: string) => {
      const num = parseInt(val.replace(/[^0-9]/g, "") || "0", 10)
      return `Rp ${num.toLocaleString("id-ID")}`
    }

    const updatedData: Partial<AdminLayananItem> = {
      layanan: namaLayanan.trim(),
      kategoriId: selectedCategory,
      metode: metode,
      status: status,
      deskripsi: deskripsi.trim(),
      weekday: formatRupiah(hargaWeekday),
      weekend: formatRupiah(hargaWeekend),
      bannerUrl: imagePreview || "",
    }

    const ok = updateLayananById(layananId, updatedData)
    if (ok) {
      setSuccessMsg(true)
      setTimeout(() => {
        router.push("/admin/layanan")
      }, 1200)
    } else {
      alert("Gagal memperbarui layanan.")
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-100 font-poppins text-gray-500 text-sm">
        Memuat data layanan...
      </div>
    )
  }

  if (!item) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-100 font-poppins text-center">
        <p className="text-gray-700 font-bold mb-2">Layanan tidak ditemukan</p>
        <p className="text-gray-500 text-sm mb-6">ID layanan tidak valid atau sudah dihapus.</p>
        <Link
          href="/admin/layanan"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#561269] text-white rounded-full text-sm font-bold shadow-sm hover:bg-[#430d52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Layanan
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 font-poppins">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Form Edit Layanan</h1>
          <p className="text-sm text-gray-500 mt-1">Perbarui data layanan di bawah ini dengan lengkap</p>
        </div>
        <Link
          href="/admin/layanan"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Tabel
        </Link>
      </div>

      <div className="w-full h-px bg-gray-200 mb-6" />

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Perubahan berhasil disimpan!</p>
            <p className="text-xs text-emerald-700">Mengalihkan kembali ke daftar layanan...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kategori Layanan & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Layanan <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white cursor-pointer"
            >
              {CATEGORIES.filter((cat) => ["02", "03", "05"].includes(cat.id)).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Layanan <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 mt-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Aktif"
                  checked={status === "Aktif"}
                  onChange={() => setStatus("Aktif")}
                  className="w-4 h-4 text-[#561269] border-gray-300 focus:ring-[#561269]"
                />
                <span className="text-sm text-gray-700 font-medium">Aktif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Nonaktif"
                  checked={status === "Nonaktif"}
                  onChange={() => setStatus("Nonaktif")}
                  className="w-4 h-4 text-[#561269] border-gray-300 focus:ring-[#561269]"
                />
                <span className="text-sm text-gray-700 font-medium">Nonaktif</span>
              </label>
            </div>
          </div>
        </div>

        {/* Nama Layanan & Metode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Layanan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaLayanan}
              onChange={(e) => setNamaLayanan(e.target.value)}
              placeholder="Masukkan nama layanan"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pelaksanaan <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-5 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="metode"
                  value="Online"
                  checked={metode === "Online"}
                  onChange={() => setMetode("Online")}
                  className="w-4 h-4 text-[#561269] border-gray-300 focus:ring-[#561269]"
                />
                <span className="text-sm text-gray-700">Online</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="metode"
                  value="Offline"
                  checked={metode === "Offline"}
                  onChange={() => setMetode("Offline")}
                  className="w-4 h-4 text-[#561269] border-gray-300 focus:ring-[#561269]"
                />
                <span className="text-sm text-gray-700">Offline</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="metode"
                  value="Online/Offline"
                  checked={metode === "Online/Offline"}
                  onChange={() => setMetode("Online/Offline")}
                  className="w-4 h-4 text-[#561269] border-gray-300 focus:ring-[#561269]"
                />
                <span className="text-sm text-gray-700">Online/Offline</span>
              </label>
            </div>
          </div>
        </div>

        {/* Deskripsi Layanan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Layanan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Masukkan deskripsi mengenai layanan ini"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] resize-y"
          />
        </div>

        {/* Harga & Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Harga Layanan */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Harga Layanan <span className="text-red-500">*</span>
            </label>

            {/* Weekday */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weekday (Senin - Jumat)</label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  value={hargaWeekday}
                  onChange={(e) => setHargaWeekday(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="350000"
                  required
                  className="flex-1 block w-full px-4 py-2 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                />
              </div>
            </div>

            {/* Weekend */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weekend (Sabtu - Minggu)</label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  value={hargaWeekend}
                  onChange={(e) => setHargaWeekend(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="450000"
                  required
                  className="flex-1 block w-full px-4 py-2 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                />
              </div>
            </div>
          </div>

          {/* Poster / Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poster / Banner Layanan
            </label>
            <div
              className={`mt-1 flex justify-center border-2 ${
                imagePreview
                  ? "border-solid border-gray-200 p-2"
                  : "border-dashed border-gray-300 px-6 pt-10 pb-10 hover:bg-gray-100"
              } rounded-lg bg-gray-50 transition-colors cursor-pointer relative overflow-hidden`}
              onClick={handleImageClick}
              style={{ minHeight: "160px" }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full h-full min-h-[160px] flex items-center justify-center bg-gray-100 rounded-md">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={300}
                    height={160}
                    className="max-h-[160px] w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-center my-auto">
                  <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">Klik untuk upload gambar poster / banner baru</div>
                  <p className="text-xs text-gray-500">Format: JPG, PNG, WebP (Maks. 2MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Link href="/admin/layanan">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Batal
            </button>
          </Link>
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}
