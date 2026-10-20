"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { mapApiToAdminEvent } from "../../data/adminEventData"
import { eventService, CreateEventDto, UpdateEventDto } from "@/services/event.service"
import { uploadService } from "@/services/upload.service"

export type EventFormData = {
  judul: string
  jenis: "Workshop" | "Seminar" | "Webinar"
  tanggal: string
  waktuMulai: string
  waktuSelesai: string
  lokasi: string
  pembicara: string
  kuota: string
  harga: string
  deskripsi: string
  status: "Draft" | "Dipublikasi" | "Selesai"
}

const INITIAL_FORM: EventFormData = {
  judul: "",
  jenis: "Workshop",
  tanggal: new Date().toISOString().split("T")[0],
  waktuMulai: "09:00",
  waktuSelesai: "12:00",
  lokasi: "",
  pembicara: "",
  kuota: "100",
  harga: "0",
  deskripsi: "",
  status: "Dipublikasi",
}

interface Props {
  eventId?: string // Jika ada, maka mode edit
}

export default function AdminEventFormClient({ eventId }: Props) {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = Boolean(eventId)
  const [form, setForm] = useState<EventFormData>(INITIAL_FORM)
  const [bannerUrl, setBannerUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!eventId) return

    const loadEvent = async () => {
      try {
        const res = await eventService.getById(eventId)
        if (res?.data) {
          const item = res.data
          // Format tanggal YYYY-MM-DD
          let dateStr = new Date().toISOString().split("T")[0]
          try {
            const d = new Date(item.tanggal)
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split("T")[0]
            }
          } catch {}

          // Format waktu
          let waktuMulai = "09:00"
          try {
            const t = new Date(item.jam_mulai)
            if (!isNaN(t.getTime())) {
              const hh = String(t.getUTCHours()).padStart(2, "0")
              const mm = String(t.getUTCMinutes()).padStart(2, "0")
              waktuMulai = `${hh}:${mm}`
            }
          } catch {}

          let jenis: "Workshop" | "Seminar" | "Webinar" = "Workshop"
          if (item.jenis_event === "SEMINAR") jenis = "Seminar"
          if (item.jenis_event === "WEBINAR") jenis = "Webinar"

          let status: "Draft" | "Dipublikasi" | "Selesai" = "Dipublikasi"
          if (item.status === "COMPLETED" || item.status === "CANCELLED") status = "Selesai"
          if (item.status === "DRAFT") status = "Draft"

          setForm({
            judul: item.judul,
            jenis,
            tanggal: dateStr,
            waktuMulai,
            waktuSelesai: "12:00",
            lokasi: item.lokasi || "",
            pembicara: item.nama_pembicara,
            kuota: String(item.kuota),
            harga: String(item.harga),
            deskripsi: item.deskripsi,
            status,
          })
          if (item.banner_url) {
            setBannerUrl(item.banner_url)
          }
        }
      } catch (err) {
        console.error("Gagal mengambil event:", err)
        alert("Event tidak ditemukan atau gagal dimuat.")
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (file: File) => {
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setBannerUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Map jenis form ke backend enum
    let jenisEvent: "WEBINAR" | "WORKSHOP" | "SEMINAR" = "WORKSHOP"
    if (form.jenis === "Seminar") jenisEvent = "SEMINAR"
    if (form.jenis === "Webinar") jenisEvent = "WEBINAR"

    // Map status form ke backend enum
    let statusEvent: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT" = "UPCOMING"
    if (form.status === "Draft") statusEvent = "DRAFT"
    if (form.status === "Selesai") statusEvent = "COMPLETED"

    try {
      // 1. Upload file gambar jika user memilih file lokal baru
      let finalBannerUrl: string | null = bannerUrl.startsWith("http") && !bannerUrl.startsWith("blob:") ? bannerUrl : null
      if (imageFile) {
        try {
          finalBannerUrl = await uploadService.uploadImage(imageFile)
        } catch (uploadErr) {
          console.warn("Upload gambar gagal, melanjutkan tanpa gambar baru:", uploadErr)
        }
      }

      if (isEditMode && eventId) {
        const payload: UpdateEventDto = {
          judul: form.judul,
          jenis_event: jenisEvent,
          deskripsi: form.deskripsi || "Deskripsi event Empathika",
          tanggal: form.tanggal,
          jam_mulai: form.waktuMulai,
          durasi_menit: 120,
          lokasi: form.lokasi || null,
          kuota: parseInt(form.kuota, 10) || 100,
          harga: parseFloat(form.harga) || 0,
          banner_url: finalBannerUrl,
          nama_pembicara: form.pembicara,
          status: statusEvent,
        }
        await eventService.update(eventId, payload)
      } else {
        const payload: CreateEventDto = {
          judul: form.judul,
          jenis_event: jenisEvent,
          deskripsi: form.deskripsi || "Deskripsi event Empathika",
          tanggal: form.tanggal,
          jam_mulai: form.waktuMulai,
          durasi_menit: 120,
          lokasi: form.lokasi || null,
          kuota: parseInt(form.kuota, 10) || 100,
          harga: parseFloat(form.harga) || 0,
          banner_url: finalBannerUrl,
          nama_pembicara: form.pembicara,
          status: statusEvent,
        }
        await eventService.create(payload)
      }

      router.push("/admin/event")
      router.refresh()
    } catch (err: any) {
      console.error("Gagal menyimpan event:", err)
      const data = err.response?.data
      let msg = data?.message || "Gagal menyimpan event. Silakan periksa kembali isian form."
      if (data?.details) {
        const fields = Object.entries(data.details).map(([k, v]) => `${k}: ${(v as any).join(", ")}`).join("\n")
        msg += `\n\nDetail:\n${fields}`
      }
      alert(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"

  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5"
  const helperClass = "block text-[11px] text-gray-400 mt-1 font-normal"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm">
        Memuat data event...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full max-w-5xl mx-auto">
      {/* Heading Form & Tombol Kembali */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#561269] transition-colors"
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
          {isEditMode ? "Edit Event" : "Tambah Event Baru"}
        </h2>
      </div>

      {/* Container Form */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Banner / Poster Event */}
          <div>
            <label className={labelClass}>
              Banner / Poster Event
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
                  handleImageUpload(e.dataTransfer.files[0])
                }
              }}
              className={`relative flex flex-col items-center justify-center w-full min-h-[220px] rounded-2xl border-2 border-dashed transition-all cursor-pointer p-4 overflow-hidden ${
                isDragOver
                  ? "border-[#561269] bg-purple-50/60"
                  : "border-gray-300 bg-gray-50/60 hover:bg-purple-50/30 hover:border-[#561269]"
              }`}
            >
              <input
                id="banner-file-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageUpload(e.target.files[0])
                  }
                }}
              />

              {bannerUrl ? (
                <div className="relative w-full h-56 rounded-xl overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerUrl}
                    alt="Preview Poster Event"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label
                      htmlFor="banner-file-upload"
                      className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-gray-100 transition"
                    >
                      Ganti Foto
                    </label>
                    <button
                      type="button"
                      onClick={() => setBannerUrl("")}
                      className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow hover:bg-red-600 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="banner-file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-6"
                >
                  <div className="p-3 bg-purple-100 text-[#561269] rounded-full mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 text-center">
                    Seret & lepas foto di sini, atau{" "}
                    <span className="text-[#561269] underline">pilih file</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG hingga 5MB</p>
                </label>
              )}
            </div>
            <span className={helperClass}>Upload gambar poster atau banner untuk event ini</span>
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
              value={form.judul}
              onChange={handleChange}
              placeholder="Masukkan judul event"
              className={inputClass}
            />
            <span className={helperClass}>Contoh: AMTR : A Moment to Remember</span>
          </div>

          {/* Jenis Event & Status Publikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
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
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Webinar">Webinar</option>
              </select>
              <span className={helperClass}>Pilih kategori jenis event</span>
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
                <option value="Dipublikasi">Dipublikasi</option>
                <option value="Draft">Draft</option>
              </select>
              <span className={helperClass}>Tentukan status penayangan event</span>
            </div>
          </div>

          {/* Tanggal Event */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div>
              <label htmlFor="tanggal" className={labelClass}>
                Tanggal Event <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  id="tanggal"
                  name="tanggal"
                  type="date"
                  required
                  value={form.tanggal}
                  onChange={handleChange}
                  className={`${inputClass} pr-11 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`}
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker?.()
                    } catch {
                      dateInputRef.current?.focus()
                    }
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#561269] transition-colors p-1"
                  title="Pilih tanggal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                </button>
              </div>
              <span className={helperClass}>Tanggal penyelenggaraan event</span>
            </div>

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
              <span className={helperClass}>Jam mulai event (WIB)</span>
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
              <span className={helperClass}>Jam berakhir event (WIB)</span>
            </div>
          </div>

          {/* Lokasi & Pembicara */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="lokasi" className={labelClass}>
                Lokasi / Venue <span className="text-red-500">*</span>
              </label>
              <input
                id="lokasi"
                name="lokasi"
                type="text"
                required
                placeholder="Nama tempat / Link Zoom"
                value={form.lokasi}
                onChange={handleChange}
                className={inputClass}
              />
              <span className={helperClass}>Contoh: Jica FPMIPA UPI atau Zoom Meeting</span>
            </div>

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
              <span className={helperClass}>Contoh: nama, M.Psi., Psikolog</span>
            </div>
          </div>

          {/* Kuota & Harga */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="kuota" className={labelClass}>
                Kuota Peserta <span className="text-red-500">*</span>
              </label>
              <input
                id="kuota"
                name="kuota"
                type="number"
                min={1}
                required
                placeholder="Jumlah peserta maksimal"
                value={form.kuota}
                onChange={handleChange}
                className={inputClass}
              />
              <span className={helperClass}>Kapasitas maksimal pendaftaran tiket</span>
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
              <span className={helperClass}>Isi 0 untuk event gratis</span>
            </div>
          </div>

          {/* Deskripsi Event */}
          <div>
            <label htmlFor="deskripsi" className={labelClass}>
              Deskripsi Event
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={6}
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Jelaskan topik materi, manfaat, fasilitas, dan informasi penting lainnya..."
              className={`${inputClass} resize-y leading-relaxed font-normal`}
            />
            <span className={helperClass}>Deskripsi detail yang akan dibaca oleh calon peserta</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-8 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Terbitkan Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
