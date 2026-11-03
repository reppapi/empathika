"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { eventService, CreateEventDto, UpdateEventDto } from "@/services/event.service"
import { uploadService } from "@/services/upload.service"

export type EventFormData = {
  judul: string
  jenis: "Workshop" | "Seminar" | "Webinar"
  tipe: "Online" | "Offline"
  linkMeet: string
  linkWa: string
  tanggal: string
  waktuMulai: string
  waktuSelesai: string
  lokasi: string
  pembicara: string
  kuota: string
  harga: string
  hargaCoret: string
  deskripsi: string
  status: "Draft" | "Dipublikasi" | "Selesai"
}

const INITIAL_FORM: EventFormData = {
  judul: "",
  jenis: "Workshop",
  tipe: "Online",
  linkMeet: "",
  linkWa: "",
  tanggal: new Date().toISOString().split("T")[0],
  waktuMulai: "09:00",
  waktuSelesai: "12:00",
  lokasi: "",
  pembicara: "",
  kuota: "100",
  harga: "0",
  hargaCoret: "",
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

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

          // Format waktu mulai & hitung waktu selesai berdasarkan durasi_menit
          let waktuMulai = "09:00"
          let waktuSelesai = "12:00"
          try {
            const t = new Date(item.jam_mulai)
            if (!isNaN(t.getTime())) {
              const hh = String(t.getUTCHours()).padStart(2, "0")
              const mm = String(t.getUTCMinutes()).padStart(2, "0")
              waktuMulai = `${hh}:${mm}`

              const durasi = item.durasi_menit || 120
              const totalMins = t.getUTCHours() * 60 + t.getUTCMinutes() + durasi
              const endH = String(Math.floor(totalMins / 60) % 24).padStart(2, "0")
              const endM = String(totalMins % 60).padStart(2, "0")
              waktuSelesai = `${endH}:${endM}`
            }
          } catch {}

          let jenis: "Workshop" | "Seminar" | "Webinar" = "Workshop"
          if (item.jenis_event === "SEMINAR") jenis = "Seminar"
          if (item.jenis_event === "WEBINAR") jenis = "Webinar"

          let status: "Draft" | "Dipublikasi" | "Selesai" = "Dipublikasi"
          if (item.status === "COMPLETED" || item.status === "CANCELLED") status = "Selesai"
          if (item.status === "DRAFT") status = "Draft"

          const tipe: "Online" | "Offline" = item.tipe_event === "OFFLINE" ? "Offline" : "Online"

          setForm({
            judul: item.judul,
            jenis,
            tipe,
            linkMeet: tipe === "Online" ? (item.link_meet || "") : "",
            linkWa: item.link_wa || "",
            tanggal: dateStr,
            waktuMulai,
            waktuSelesai,
            lokasi: item.lokasi || "",
            pembicara: item.nama_pembicara,
            kuota: String(item.kuota),
            harga: String(item.harga),
            hargaCoret: item.harga_coret ? String(item.harga_coret) : "",
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

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target

    if (name === "tipe") {
      setForm((prev) => ({
        ...prev,
        tipe: value as "Online" | "Offline",
        // Mengubah tipe dari Online ke Offline harus membersihkan link gmeet
        linkMeet: value === "Offline" ? "" : prev.linkMeet,
      }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleImageUpload = async (file: File) => {
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        alert("Ukuran file gambar maksimal 30MB.")
        return
      }
      try {
        const { compressImage, IMAGE_PRESETS } = await import("@/lib/imageCompressor")
        const compressed = await compressImage(file, IMAGE_PRESETS.event)
        setImageFile(compressed.file)
        setBannerUrl(compressed.dataUrl)
      } catch {
        setImageFile(file)
        const url = URL.createObjectURL(file)
        setBannerUrl(url)
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Link WhatsApp wajib diisi & valid URL untuk online maupun offline
    if (!form.linkWa || !form.linkWa.trim()) {
      newErrors.linkWa = "Link grup WhatsApp wajib diisi."
    } else if (!isValidUrl(form.linkWa.trim())) {
      newErrors.linkWa = "Format link grup WhatsApp harus URL valid (misal: https://chat.whatsapp.com/...)"
    }

    // Jika Online, link Google Meet wajib diisi dan format URL valid
    if (form.tipe === "Online") {
      if (!form.linkMeet || !form.linkMeet.trim()) {
        newErrors.linkMeet = "Link Google Meet wajib diisi untuk event online."
      } else if (!isValidUrl(form.linkMeet.trim())) {
        newErrors.linkMeet = "Format link Google Meet harus URL valid (misal: https://meet.google.com/...)"
      }
    }

    // Validasi harga coret: jika diisi harus lebih besar dari harga asli
    if (form.hargaCoret && form.hargaCoret.trim() !== "") {
      const hargaNum = parseFloat(form.harga) || 0
      const coretNum = parseFloat(form.hargaCoret) || 0
      if (coretNum <= hargaNum) {
        newErrors.hargaCoret = `Harga coret (Rp ${coretNum.toLocaleString("id-ID")}) harus lebih besar dari harga asli (Rp ${hargaNum.toLocaleString("id-ID")}).`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setSubmitting(true)

    // Map jenis form ke backend enum
    let jenisEvent: "WEBINAR" | "WORKSHOP" | "SEMINAR" = "WORKSHOP"
    if (form.jenis === "Seminar") jenisEvent = "SEMINAR"
    if (form.jenis === "Webinar") jenisEvent = "WEBINAR"

    // Map status form ke backend enum
    let statusEvent: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT" = "UPCOMING"
    if (form.status === "Draft") statusEvent = "DRAFT"
    if (form.status === "Selesai") statusEvent = "COMPLETED"

    const tipeEvent: "ONLINE" | "OFFLINE" = form.tipe === "Offline" ? "OFFLINE" : "ONLINE"
    const hargaNum = parseFloat(form.harga) || 0
    const hargaCoretNum = form.hargaCoret && form.hargaCoret.trim() !== "" ? parseFloat(form.hargaCoret) : null
    const finalMeetUrl = tipeEvent === "ONLINE" ? (form.linkMeet.trim() || null) : null
    const finalWaUrl = form.linkWa.trim()

    // Hitung durasi menit otomatis dari waktuMulai ke waktuSelesai
    let durasiMenit = 120
    if (form.waktuMulai && form.waktuSelesai) {
      try {
        const [h1, m1] = form.waktuMulai.split(":").map(Number)
        const [h2, m2] = form.waktuSelesai.split(":").map(Number)
        const startMinutes = h1 * 60 + m1
        const endMinutes = h2 * 60 + m2
        if (endMinutes > startMinutes) {
          durasiMenit = endMinutes - startMinutes
        }
      } catch {}
    }

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
          tipe_event: tipeEvent,
          link_meet: finalMeetUrl,
          link_wa: finalWaUrl,
          deskripsi: form.deskripsi || "Deskripsi event Empathika",
          tanggal: form.tanggal,
          jam_mulai: form.waktuMulai,
          durasi_menit: durasiMenit,
          lokasi: form.lokasi || null,
          kuota: parseInt(form.kuota, 10) || 100,
          harga: hargaNum,
          harga_coret: hargaCoretNum,
          banner_url: finalBannerUrl,
          nama_pembicara: form.pembicara,
          status: statusEvent,
        }
        await eventService.update(eventId, payload)
      } else {
        const payload: CreateEventDto = {
          judul: form.judul,
          jenis_event: jenisEvent,
          tipe_event: tipeEvent,
          link_meet: finalMeetUrl,
          link_wa: finalWaUrl,
          deskripsi: form.deskripsi || "Deskripsi event Empathika",
          tanggal: form.tanggal,
          jam_mulai: form.waktuMulai,
          durasi_menit: durasiMenit,
          lokasi: form.lokasi || null,
          kuota: parseInt(form.kuota, 10) || 100,
          harga: hargaNum,
          harga_coret: hargaCoretNum,
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
      {/* Top Bar: Navigasi Kembali & Judul Halaman */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#561269] font-semibold transition-colors mb-4 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Event
        </button>

        <h2 className="text-2xl font-extrabold text-[#561269]">
          {isEditMode ? "Edit Informasi Event" : "Tambah Event Baru"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isEditMode
            ? "Perbarui detail informasi, jadwal, tipe pelaksanaan, harga coret, atau status penayangan event."
            : "Lengkapi formulir di bawah ini untuk menambahkan event atau workshop baru ke sistem."}
        </p>
      </div>

      {/* Main Container Card */}
      <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Banner Section */}
          <div>
            <label className={labelClass}>Banner / Poster Event</label>
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
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all p-6 text-center cursor-pointer overflow-hidden ${
                isDragOver
                  ? "border-[#561269] bg-purple-50/50"
                  : bannerUrl
                  ? "border-purple-200 bg-gray-50"
                  : "border-gray-200 bg-[#FCFAFD] hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageUpload(e.target.files[0])
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {bannerUrl ? (
                <div className="relative w-full max-w-md h-48 rounded-xl overflow-hidden shadow-sm group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerUrl}
                    alt="Preview Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                      />
                    </svg>
                    Klik atau drop untuk ganti gambar
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[#561269]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    <span className="text-[#561269] font-bold">Pilih foto</span> atau tarik file ke sini
                  </div>
                  <p className="text-[11px] text-gray-400">PNG, JPG, JPEG hingga 10MB</p>
                </div>
              )}
            </div>
            <span className={helperClass}>
              Banner akan ditampilkan di kartu list event dan halaman rincian
            </span>
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
              placeholder="Contoh: Workshop SEFT Batch 4: Bebas Stres & Trauma"
              value={form.judul}
              onChange={handleChange}
              className={inputClass}
            />
            <span className={helperClass}>Gunakan judul yang jelas dan menarik peserta</span>
          </div>

          {/* Jenis Event & Status Publikasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="jenis" className={labelClass}>
                Kategori Event <span className="text-red-500">*</span>
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

          {/* TIPE EVENT (Online / Offline) & LINK KOMUNIKASI */}
          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
            <div>
              <label htmlFor="tipe" className={labelClass}>
                Tipe Event <span className="text-red-500">*</span>
              </label>
              <select
                id="tipe"
                name="tipe"
                required
                value={form.tipe}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
              <span className={helperClass}>
                Pilih apakah event diselenggarakan secara online (virtual) atau offline (tatap muka)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Kolom Link Google Meet: Tampil jika tipe Online */}
              {form.tipe === "Online" && (
                <div>
                  <label htmlFor="linkMeet" className={labelClass}>
                    Link Google Meet <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="linkMeet"
                    name="linkMeet"
                    type="url"
                    required={form.tipe === "Online"}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={form.linkMeet}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.linkMeet ? "border-red-400 bg-red-50/20" : ""}`}
                  />
                  {errors.linkMeet ? (
                    <span className="block text-[11px] text-red-600 font-semibold mt-1">
                      {errors.linkMeet}
                    </span>
                  ) : (
                    <span className={helperClass}>
                      Generate link secara manual dan tempelkan di sini (hanya untuk peserta yang telah lunas)
                    </span>
                  )}
                </div>
              )}

              {/* Kolom Link Grup WhatsApp: Wajib untuk Online maupun Offline */}
              <div className={form.tipe === "Offline" ? "md:col-span-2" : ""}>
                <label htmlFor="linkWa" className={labelClass}>
                  Link Grup WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="linkWa"
                  name="linkWa"
                  type="url"
                  required
                  placeholder="https://chat.whatsapp.com/invite/xxxx"
                  value={form.linkWa}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.linkWa ? "border-red-400 bg-red-50/20" : ""}`}
                />
                {errors.linkWa ? (
                  <span className="block text-[11px] text-red-600 font-semibold mt-1">
                    {errors.linkWa}
                  </span>
                ) : (
                  <span className={helperClass}>
                    Link grup WhatsApp koordinasi peserta (generate manual dan tempelkan di sini)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tanggal & Waktu Event */}
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
                placeholder={form.tipe === "Online" ? "Google Meet / Online" : "Nama gedung, alamat venue"}
                value={form.lokasi}
                onChange={handleChange}
                className={inputClass}
              />
              <span className={helperClass}>
                {form.tipe === "Online"
                  ? "Contoh: Google Meet (Online)"
                  : "Contoh: Auditorium Empathika Bandung"}
              </span>
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
              <span className={helperClass}>Contoh: Sarah Melani, M.Psi., Psikolog</span>
            </div>
          </div>

          {/* Kuota, Harga Asli, dan Harga Coret (Efek Psikologis) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
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
                Harga Asli / Bayar (Rp) <span className="text-red-500">*</span>
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
              <span className={helperClass}>Harga riil yang dibayar peserta (invoice)</span>
            </div>

            <div>
              <label htmlFor="hargaCoret" className={labelClass}>
                Harga Coret (Rp) <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <input
                id="hargaCoret"
                name="hargaCoret"
                type="number"
                min={0}
                placeholder="Misal: 150000"
                value={form.hargaCoret}
                onChange={handleChange}
                className={`${inputClass} ${errors.hargaCoret ? "border-red-400 bg-red-50/20" : ""}`}
              />
              {errors.hargaCoret ? (
                <span className="block text-[11px] text-red-600 font-semibold mt-1">
                  {errors.hargaCoret}
                </span>
              ) : (
                <span className={helperClass}>
                  Harga pura-pura lebih tinggi untuk efek diskon psikologis
                </span>
              )}
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
