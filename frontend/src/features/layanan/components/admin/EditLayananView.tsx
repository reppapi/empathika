"use client"

import { CloudUpload, X, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CATEGORIES } from "../../data/layananData"
import { getLayananById, updateLayananById, AdminLayananItem } from "../../data/adminLayananData"
import { processAndUploadImage } from "@/lib/imageCompressor"

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
  const [isDragOver, setIsDragOver] = useState(false)
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

  const handleImageFile = async (file: File) => {
    try {
      const { url } = await processAndUploadImage(file)
      setImagePreview(url)
    } catch (err: any) {
      alert(err?.message || "Gagal memproses gambar")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageFile(file)
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
      }, 1000)
    } else {
      alert("Gagal memperbarui layanan.")
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"

  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5"
  const helperClass = "block text-[11px] text-gray-400 mt-1 font-normal"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm">
        Memuat data layanan...
      </div>
    )
  }

  if (!item) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-10 font-poppins text-center shadow-xs">
        <p className="text-gray-800 font-bold text-lg mb-2">Layanan tidak ditemukan</p>
        <p className="text-gray-500 text-sm mb-6">ID layanan tidak valid atau data sudah dihapus.</p>
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
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full max-w-5xl mx-auto">
      {/* ── Heading Form & Tombol Kembali (Desain Seragam dengan Edit Event) ── */}
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
          Edit Layanan
        </h2>
      </div>

      {/* ── Container Form (Desain Rapi & Elegan Seragam dengan Edit Event) ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Perubahan berhasil disimpan!</p>
              <p className="text-xs text-emerald-700">Mengalihkan kembali ke daftar layanan...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ── Baris 1: Banner / Poster Layanan ── */}
          <div>
            <label className={labelClass}>
              Banner / Poster Layanan
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                if (e.dataTransfer.files?.[0]) {
                  handleImageFile(e.dataTransfer.files[0])
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full min-h-[220px] rounded-2xl border-2 border-dashed transition-all cursor-pointer p-4 overflow-hidden ${
                isDragOver
                  ? "border-[#561269] bg-purple-50/60"
                  : "border-gray-300 bg-gray-50/60 hover:bg-purple-50/30 hover:border-[#561269]"
              }`}
            >
              <input
                id="layanan-file-upload"
                type="file"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/webp"
                className="sr-only"
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <div className="relative w-full h-56 rounded-xl overflow-hidden group">
                  <Image
                    src={imagePreview}
                    alt="Preview Poster Layanan"
                    fill
                    className="object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label
                      htmlFor="layanan-file-upload"
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-gray-100 transition"
                    >
                      Ganti Foto
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-red-600 transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-6">
                  <div className="p-3 bg-purple-100 text-[#561269] rounded-full mb-3">
                    <CloudUpload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 text-center">
                    Seret & lepas foto di sini, atau{" "}
                    <span className="text-[#561269] underline">pilih file</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG hingga 2MB</p>
                </div>
              )}
            </div>
            <span className={helperClass}>Upload gambar poster atau banner untuk layanan ini</span>
          </div>

          {/* ── Baris 2: Nama Layanan ── */}
          <div>
            <label htmlFor="namaLayanan" className={labelClass}>
              Nama Layanan <span className="text-red-500">*</span>
            </label>
            <input
              id="namaLayanan"
              type="text"
              required
              value={namaLayanan}
              onChange={(e) => setNamaLayanan(e.target.value)}
              placeholder="Masukkan nama layanan"
              className={inputClass}
            />
            <span className={helperClass}>Contoh: Psikolog, Peer Konselor, Asesmen Minat Bakat</span>
          </div>

          {/* ── Baris 3: Kategori Layanan & Status Layanan ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="kategori" className={labelClass}>
                Kategori Layanan <span className="text-red-500">*</span>
              </label>
              <select
                id="kategori"
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                {CATEGORIES.filter((cat) => ["02", "03", "05"].includes(cat.id)).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <span className={helperClass}>Pilih kategori grup layanan</span>
            </div>

            <div>
              <label htmlFor="status" className={labelClass}>
                Status Layanan <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as "Aktif" | "Nonaktif")}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <span className={helperClass}>Tentukan apakah layanan ditampilkan aktif di web</span>
            </div>
          </div>

          {/* ── Baris 4: Metode Pelaksanaan ── */}
          <div>
            <label htmlFor="metode" className={labelClass}>
              Metode Pelaksanaan <span className="text-red-500">*</span>
            </label>
            <select
              id="metode"
              required
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Online/Offline">Online/Offline (Fleksibel)</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
            <span className={helperClass}>Metode pelaksanaan sesi konseling / asesmen</span>
          </div>

          {/* ── Baris 5: Tarif Weekday & Weekend ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="hargaWeekday" className={labelClass}>
                Tarif Weekday (Senin - Jumat) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                  Rp
                </span>
                <input
                  id="hargaWeekday"
                  type="text"
                  required
                  value={hargaWeekday}
                  onChange={(e) => setHargaWeekday(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="350000"
                  className={`${inputClass} pl-12`}
                />
              </div>
              <span className={helperClass}>Tarif sesi pada hari kerja reguler (contoh: 350000)</span>
            </div>

            <div>
              <label htmlFor="hargaWeekend" className={labelClass}>
                Tarif Weekend (Sabtu - Minggu) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                  Rp
                </span>
                <input
                  id="hargaWeekend"
                  type="text"
                  required
                  value={hargaWeekend}
                  onChange={(e) => setHargaWeekend(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="450000"
                  className={`${inputClass} pl-12`}
                />
              </div>
              <span className={helperClass}>Tarif sesi pada akhir pekan (contoh: 450000)</span>
            </div>
          </div>

          {/* ── Baris 6: Deskripsi Layanan ── */}
          <div>
            <label htmlFor="deskripsi" className={labelClass}>
              Deskripsi Layanan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deskripsi"
              required
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Masukkan deskripsi lengkap mengenai layanan ini..."
              className={inputClass}
            />
            <span className={helperClass}>
              Jelaskan tujuan, cakupan penanganan, dan manfaat layanan ini
            </span>
          </div>

          {/* ── Baris 7: Tombol Aksi Form ── */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push("/admin/layanan")}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
