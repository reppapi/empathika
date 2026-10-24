"use client"

import { CloudUpload, X, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { CATEGORIES } from "../../data/layananData"
import { addLayanan } from "../../data/adminLayananData"
import { processAndUploadImage } from "@/lib/imageCompressor"

export default function TambahLayananView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "02"

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [namaLayanan, setNamaLayanan] = useState("")
  const [metode, setMetode] = useState("Online/Offline")
  const [deskripsi, setDeskripsi] = useState("")
  const [hargaWeekday, setHargaWeekday] = useState("")
  const [hargaWeekend, setHargaWeekend] = useState("")
  const [successMsg, setSuccessMsg] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialCategory && !selectedCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory, selectedCategory])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { url } = await processAndUploadImage(file)
        setImagePreview(url)
      } catch (err: any) {
        alert(err?.message || "Gagal memproses gambar")
      }
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

    addLayanan({
      layanan: namaLayanan.trim(),
      kategoriId: selectedCategory,
      metode: metode,
      weekday: formatRupiah(hargaWeekday),
      weekend: formatRupiah(hargaWeekend),
      status: "Aktif",
      deskripsi: deskripsi.trim(),
      bannerUrl: imagePreview || "",
    })

    setSuccessMsg(true)
    setTimeout(() => {
      router.push("/admin/layanan")
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full max-w-5xl mx-auto">
      {/* ── Heading Form & Tombol Kembali (Desain Seragam dengan Edit Layanan) ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/layanan")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#561269] transition-colors cursor-pointer"
          aria-label="Kembali"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
          Tambah Layanan Baru
        </h2>
      </div>

      {/* ── Container Form ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Form Input Layanan</h1>
          <p className="text-sm text-gray-500 mt-1">Isi data layanan di bawah ini dengan lengkap</p>
        </div>

        <div className="w-full h-px bg-gray-200 mb-6" />

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Layanan baru berhasil ditambahkan!</p>
            <p className="text-xs text-emerald-700">Mengalihkan kembali ke daftar layanan...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kategori Layanan */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Layanan */}
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

          {/* Metode Pelaksanaan */}
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
                  <div className="text-sm text-gray-600">Klik untuk upload gambar poster / banner</div>
                  <p className="text-xs text-gray-500">Format: JPG, PNG, WebP (Maks. 2MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push("/admin/layanan")}
            className="px-6 py-2.5 border border-gray-300 rounded-full text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Simpan Layanan
          </button>
        </div>
      </form>
    </div>
  </div>
)
}
