"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { eventService, CreateEventDto, UpdateEventDto, PaketBundlingItem } from "@/services/event.service"
import { uploadService } from "@/services/upload.service"
import { EVENT_JENIS, EVENT_TIPE, EVENT_STATUS, EventJenis, EventTipe, EventStatus } from "../../constants/eventConstants"
import { inputClass, labelClass, helperClass } from "./form/formStyles"
import { EventBannerUpload } from "./form/EventBannerUpload"
import { EventTypeLinksSection } from "./form/EventTypeLinksSection"
import { EventScheduleLocationSection } from "./form/EventScheduleLocationSection"
import { EventPricingQuotaSection } from "./form/EventPricingQuotaSection"

export type EventFormData = {
  judul: string
  jenis: EventJenis
  tipe: EventTipe
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
  hargaBundling: string
  kuotaTiketBundling: string
  namaBundling: string
  paketBundlingList: PaketBundlingItem[]
  isBundlingActive: boolean
  deskripsi: string
  status: EventStatus
}

const INITIAL_FORM: EventFormData = {
  judul: "",
  jenis: EVENT_JENIS.WORKSHOP,
  tipe: EVENT_TIPE.ONLINE,
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
  hargaBundling: "",
  kuotaTiketBundling: "2",
  namaBundling: "Paket Duo Hemat",
  paketBundlingList: [
    { nama_paket: "Paket Duo Hemat", kuota_tiket: 2, harga_paket: 0 },
  ],
  isBundlingActive: false,
  deskripsi: "",
  status: EVENT_STATUS.DIPUBLIKASI,
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
          } catch {
            // fallback tanggal saat ini jika parsing gagal
          }

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
          } catch {
            // fallback waktu default jika parsing jam_mulai gagal
          }

          let jenis: EventJenis = EVENT_JENIS.WORKSHOP
          if (item.jenis_event === "SEMINAR") jenis = EVENT_JENIS.SEMINAR
          if (item.jenis_event === "WEBINAR") jenis = EVENT_JENIS.WEBINAR

          let status: EventStatus = EVENT_STATUS.DIPUBLIKASI
          if (item.status === "COMPLETED" || item.status === "CANCELLED") status = EVENT_STATUS.SELESAI
          if (item.status === "DRAFT") status = EVENT_STATUS.DRAFT

          const tipe: EventTipe = item.tipe_event === "OFFLINE" ? EVENT_TIPE.OFFLINE : EVENT_TIPE.ONLINE

          const rawBundlingList = item.paket_bundling && Array.isArray(item.paket_bundling) && item.paket_bundling.length > 0
            ? item.paket_bundling
            : item.harga_bundling && parseFloat(String(item.harga_bundling)) > 0
            ? [
                {
                  nama_paket: item.nama_bundling || "Paket Duo Hemat",
                  kuota_tiket: item.kuota_tiket_bundling || 2,
                  harga_paket: parseFloat(String(item.harga_bundling)),
                },
              ]
            : [{ nama_paket: "Paket Duo Hemat", kuota_tiket: 2, harga_paket: 0 }]

          const hasBundlingActive = Boolean(
            (item.paket_bundling && Array.isArray(item.paket_bundling) && item.paket_bundling.length > 0) ||
            (item.harga_bundling && parseFloat(String(item.harga_bundling)) > 0)
          )

          setForm({
            judul: item.judul,
            jenis,
            tipe,
            linkMeet: tipe === EVENT_TIPE.ONLINE ? (item.link_meet || "") : "",
            linkWa: item.link_wa || "",
            tanggal: dateStr,
            waktuMulai,
            waktuSelesai,
            lokasi: item.lokasi || "",
            pembicara: item.nama_pembicara,
            kuota: String(item.kuota),
            harga: String(item.harga),
            hargaCoret: item.harga_coret ? String(item.harga_coret) : "",
            hargaBundling: item.harga_bundling ? String(item.harga_bundling) : "",
            kuotaTiketBundling: item.kuota_tiket_bundling ? String(item.kuota_tiket_bundling) : "2",
            namaBundling: item.nama_bundling || "Paket Duo Hemat",
            paketBundlingList: rawBundlingList,
            isBundlingActive: hasBundlingActive,
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
        tipe: value as EventTipe,
        linkMeet: value === EVENT_TIPE.OFFLINE ? "" : prev.linkMeet,
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
    if (form.tipe === EVENT_TIPE.ONLINE) {
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

    let jenisEvent: "WEBINAR" | "WORKSHOP" | "SEMINAR" = "WORKSHOP"
    if (form.jenis === EVENT_JENIS.SEMINAR) jenisEvent = "SEMINAR"
    if (form.jenis === EVENT_JENIS.WEBINAR) jenisEvent = "WEBINAR"

    let statusEvent: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT" = "UPCOMING"
    if (form.status === EVENT_STATUS.DRAFT) statusEvent = "DRAFT"
    if (form.status === EVENT_STATUS.SELESAI) statusEvent = "COMPLETED"

    const tipeEvent: "ONLINE" | "OFFLINE" = form.tipe === EVENT_TIPE.OFFLINE ? "OFFLINE" : "ONLINE"
    const hargaNum = parseFloat(form.harga) || 0
    const hargaCoretNum = form.hargaCoret && form.hargaCoret.trim() !== "" ? parseFloat(form.hargaCoret) : null
    const validBundlingList = form.isBundlingActive
      ? form.paketBundlingList
          .filter((p) => p.nama_paket && p.nama_paket.trim() !== "" && p.harga_paket > 0)
          .map((p) => ({
            nama_paket: p.nama_paket.trim(),
            kuota_tiket: Number(p.kuota_tiket) || 2,
            harga_paket: Number(p.harga_paket) || 0,
          }))
      : []

    const firstBundle = validBundlingList.length > 0 ? validBundlingList[0] : null
    const hargaBundlingNum = firstBundle ? firstBundle.harga_paket : null
    const kuotaTiketBundlingNum = firstBundle ? firstBundle.kuota_tiket : null
    const namaBundlingStr = firstBundle ? firstBundle.nama_paket : null
    const paketBundlingPayload = validBundlingList.length > 0 ? validBundlingList : null
    const finalMeetUrl = tipeEvent === "ONLINE" ? (form.linkMeet.trim() || null) : null
    const finalWaUrl = form.linkWa.trim()

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
      } catch {
        // fallback durasi default 120 menit
      }
    }

    try {
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
          harga_bundling: hargaBundlingNum,
          kuota_tiket_bundling: kuotaTiketBundlingNum,
          nama_bundling: namaBundlingStr,
          paket_bundling: paketBundlingPayload,
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
          harga_bundling: hargaBundlingNum,
          kuota_tiket_bundling: kuotaTiketBundlingNum,
          nama_bundling: namaBundlingStr,
          paket_bundling: paketBundlingPayload,
          banner_url: finalBannerUrl,
          nama_pembicara: form.pembicara,
          status: statusEvent,
        }
        await eventService.create(payload)
      }

      router.push("/admin/event?tab=baru")
    } catch (err: unknown) {
      console.error("Gagal menyimpan event:", err)
      const errorObj = err as { response?: { data?: { message?: string } } }
      const backendMessage = errorObj?.response?.data?.message
      alert(backendMessage || "Gagal menyimpan event. Periksa kembali form isian Anda.")
    } finally {
      setSubmitting(false)
    }
  }

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
          <EventBannerUpload
            bannerUrl={bannerUrl}
            isDragOver={isDragOver}
            setIsDragOver={setIsDragOver}
            onImageUpload={handleImageUpload}
          />

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
                <option value={EVENT_JENIS.WORKSHOP}>Workshop</option>
                <option value={EVENT_JENIS.SEMINAR}>Seminar</option>
                <option value={EVENT_JENIS.WEBINAR}>Webinar</option>
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
                <option value={EVENT_STATUS.DIPUBLIKASI}>Dipublikasi</option>
                <option value={EVENT_STATUS.DRAFT}>Draft</option>
              </select>
              <span className={helperClass}>Tentukan status penayangan event</span>
            </div>
          </div>

          {/* TIPE EVENT (Online / Offline) & LINK KOMUNIKASI */}
          <EventTypeLinksSection
            form={form}
            handleChange={handleChange}
            errors={errors}
          />

          {/* Tanggal, Waktu, Lokasi & Pembicara */}
          <EventScheduleLocationSection
            form={form}
            handleChange={handleChange}
            dateInputRef={dateInputRef}
          />

          {/* Kuota, Harga Asli, dan Harga Coret (Efek Diskon) + Bundling */}
          <EventPricingQuotaSection
            form={form}
            handleChange={handleChange}
            setForm={setForm}
            errors={errors}
          />

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
              className={`${inputClass} resize-y leading-relaxed font-normal whitespace-pre-wrap`}
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
