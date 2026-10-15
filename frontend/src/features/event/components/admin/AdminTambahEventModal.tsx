"use client"

import { useEffect, useRef, useState } from "react"

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

interface Props {
  onClose: () => void
  onSubmit?: (data: EventFormData) => void
}

export default function AdminTambahEventModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<EventFormData>(INITIAL_FORM)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Trap focus & keyboard escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(form)
    onClose()
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"

  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5"

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl">
            <h2
              id="modal-title"
              className="text-xl font-extrabold text-[#561269] font-poppins"
            >
              Tambah Event
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
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
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
            {/* Upload Banner */}
            <div>
              <label className={labelClass}>Banner / Foto Event</label>
              <div className="flex items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-gray-400">
                <div className="flex flex-col items-center gap-1.5">
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
                  <span className="text-[10px] text-gray-400">
                    PNG, JPG maks 2MB
                  </span>
                </div>
              </div>
            </div>

            {/* Judul Event */}
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

            {/* Jenis & Status (2 kolom) */}
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

            {/* Waktu Mulai & Selesai */}
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
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Simpan Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
