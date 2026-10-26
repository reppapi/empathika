"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export type EventFormData = {
  judul: string
  jenis: "Workshop" | "Seminar" | ""
  tanggal: string
  waktuMulai: string
  waktuSelesai: string
  lokasi: string
  pembicara: string
  kuota: string
  harga: string
  deskripsi: string
  status: "Draft" | "Dipublikasi" | ""
}

const INITIAL_FORM: EventFormData = {
  judul: "",
  jenis: "",
  tanggal: "",
  waktuMulai: "",
  waktuSelesai: "",
  lokasi: "",
  pembicara: "",
  kuota: "",
  harga: "",
  deskripsi: "",
  status: "",
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"

const labelClass = "block text-xs font-bold text-gray-700 mb-1.5"

export default function AdminTambahEventClient() {
  const router = useRouter()
  const [form, setForm] = useState<EventFormData>(INITIAL_FORM)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { compressImage } = await import("@/lib/imageCompressor")
        const res = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.82 })
        setPreviewUrl(res.dataUrl)
      } catch {
        setPreviewUrl(URL.createObjectURL(file))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Event baru:", form)
    // TODO: kirim ke API
    router.push("/admin/event")
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#561269] transition-colors"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-extrabold text-[#561269]">Tambah Event</h2>
      </div>

      {/* Form Card */}
      <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Upload Banner */}
          <div>
            <label className={labelClass}>Banner / Foto Event</label>
            <label
              htmlFor="banner-upload"
              className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-purple-50/40 hover:border-[#561269] transition cursor-pointer overflow-hidden"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview banner"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-7 w-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-xs font-medium">
                    Klik untuk upload gambar
                  </span>
                  <span className="text-[10px]">PNG, JPG, WebP maks 5MB (otomatis dioptimalkan)</span>
                </div>
              )}
            </label>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Judul */}
          <div>
            <label htmlFor="judul" className={labelClass}>
              Judul Event <span className="text-red-500">*</span>
            </label>
            <input
              id="judul"
              name="judul"
              type="text"
              required
              placeholder="Masukkan judul event"
              value={form.judul}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Jenis & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jenis" className={labelClass}>
                Jenis Event <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis"
                name="jenis"
                required
                value={form.jenis}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Pilih jenis</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>
                Status Publikasi <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Pilih status</option>
                <option value="Draft">Draft</option>
                <option value="Dipublikasi">Dipublikasi</option>
              </select>
            </div>
          </div>

          {/* Tanggal */}
          <div>
            <label htmlFor="tanggal" className={labelClass}>
              Tanggal Event <span className="text-red-500">*</span>
            </label>
            <input
              id="tanggal"
              name="tanggal"
              type="date"
              required
              value={form.tanggal}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="waktuMulai" className={labelClass}>
                Waktu Mulai <span className="text-red-500">*</span>
              </label>
              <input
                id="waktuMulai"
                name="waktuMulai"
                type="time"
                required
                value={form.waktuMulai}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="waktuSelesai" className={labelClass}>
                Waktu Selesai <span className="text-red-500">*</span>
              </label>
              <input
                id="waktuSelesai"
                name="waktuSelesai"
                type="time"
                required
                value={form.waktuSelesai}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label htmlFor="lokasi" className={labelClass}>
              Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              id="lokasi"
              name="lokasi"
              type="text"
              required
              placeholder="Nama tempat atau link Zoom/Meet"
              value={form.lokasi}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Pembicara */}
          <div>
            <label htmlFor="pembicara" className={labelClass}>
              Pembicara / Narasumber <span className="text-red-500">*</span>
            </label>
            <input
              id="pembicara"
              name="pembicara"
              type="text"
              required
              placeholder="Nama pembicara beserta gelar"
              value={form.pembicara}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Kuota & Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kuota" className={labelClass}>
                Kuota Peserta <span className="text-red-500">*</span>
              </label>
              <input
                id="kuota"
                name="kuota"
                type="number"
                required
                min={1}
                placeholder="Jumlah peserta"
                value={form.kuota}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="harga" className={labelClass}>
                Harga Tiket (Rp)
              </label>
              <input
                id="harga"
                name="harga"
                type="number"
                min={0}
                placeholder="0 jika gratis"
                value={form.harga}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="deskripsi" className={labelClass}>
              Deskripsi Event
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={4}
              placeholder="Jelaskan topik, manfaat, dan informasi lainnya..."
              value={form.deskripsi}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#561269] hover:bg-[#6f1b87] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all active:scale-95"
            >
              Simpan Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
