"use client"

import { CloudUpload, X, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CATEGORIES } from "../../data/layananData"
import { getLayananById, updateLayananById, AdminLayananItem } from "../../data/adminLayananData"
import { processAndUploadImage } from "@/lib/imageCompressor"
import { layananService } from "@/services/layanan.service"

interface EditLayananViewProps {
  layananId: string
}

function mapCategoryToId(cat?: string): string {
  const c = (cat || "").toUpperCase()
  if (c === "KONSULTASI") return "01"
  if (c === "PSIKOTES") return "02"
  if (c === "WORKSHOP") return "03"
  if (c === "SEMINAR") return "04"
  if (c === "ASESMEN") return "05"
  return cat || "01"
}

function parseRupiahNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val
  if (!val) return 0
  const str = String(val).trim()
  const withoutDecimals = str.replace(/[,.]00$/, "")
  const cleaned = withoutDecimals.replace(/[^0-9]/g, "")
  return parseInt(cleaned || "0", 10)
}

function formatRupiahDisplay(val: any): string {
  const num = parseRupiahNumber(val)
  return `Rp ${num.toLocaleString("id-ID")},00`
}

function formatInputNumber(val: any): string {
  if (val === "" || val === null || val === undefined) return ""
  const num = parseRupiahNumber(val)
  return num.toLocaleString("id-ID")
}

function cleanInputRaw(val: string): string {
  if (val === "") return ""
  const withoutDecimals = String(val).replace(/[,.]00$/, "")
  const cleaned = withoutDecimals.replace(/[^0-9]/g, "")
  if (!cleaned) return ""
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? "" : String(num)
}

interface PriceInputFieldProps {
  value: string | number
  onChange: (val: string) => void
  placeholder?: string
  required?: boolean
}

function PriceInputField({
  value,
  onChange,
  placeholder = "350.000",
  required = true,
}: PriceInputFieldProps) {
  return (
    <div className="flex rounded-lg shadow-2xs overflow-hidden border border-gray-300 focus-within:border-[#561269] focus-within:ring-1 focus-within:ring-[#561269] transition-all bg-white">
      <span className="inline-flex items-center px-3 bg-purple-50/70 border-r border-gray-200 text-[#561269] text-xs font-bold select-none">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={formatInputNumber(value)}
        onChange={(e) => onChange(cleanInputRaw(e.target.value))}
        placeholder={placeholder}
        required={required}
        className="flex-1 block w-full px-3 py-2 text-xs font-semibold text-gray-800 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
      />
      <span className="inline-flex items-center px-2.5 bg-gray-50 border-l border-gray-200 text-gray-400 text-xs font-medium select-none">
        ,00
      </span>
    </div>
  )
}

export default function EditLayananView({ layananId }: EditLayananViewProps) {
  const router = useRouter()
  const [item, setItem] = useState<AdminLayananItem | null>(null)
  const [loading, setLoading] = useState(true)

  // Form State
  const [selectedCategory, setSelectedCategory] = useState("01")
  const [namaLayanan, setNamaLayanan] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [isOffline, setIsOffline] = useState(true)
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif")
  const [deskripsi, setDeskripsi] = useState("")
  const [hargaWeekday, setHargaWeekday] = useState("")
  const [hargaWeekend, setHargaWeekend] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  // Tarif spesifik per Tenaga Ahli (khusus kategori Konsultasi: 01)
  const [tarifPsikologWeekday, setTarifPsikologWeekday] = useState("")
  const [tarifPsikologWeekend, setTarifPsikologWeekend] = useState("")
  const [tarifKonselorWeekday, setTarifKonselorWeekday] = useState("")
  const [tarifKonselorWeekend, setTarifKonselorWeekend] = useState("")
  const [tarifPeerWeekday, setTarifPeerWeekday] = useState("")
  const [tarifPeerWeekend, setTarifPeerWeekend] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing data
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoading(true)

      // 1. Coba ambil dari local storage terlebih dahulu sebagai instant pre-fill
      const existing = getLayananById(layananId)
      if (existing && isMounted) {
        setItem(existing)
        setSelectedCategory(existing.kategoriId || "01")
        setNamaLayanan(existing.layanan)
        const m = existing.metode || "Online/Offline"
        setIsOnline(m.toLowerCase().includes("online"))
        setIsOffline(m.toLowerCase().includes("offline"))
        setStatus(existing.status)
        setDeskripsi(existing.deskripsi || "")
        const cleanWeekday = parseRupiahNumber(existing.weekday) ? String(parseRupiahNumber(existing.weekday)) : ""
        const cleanWeekend = parseRupiahNumber(existing.weekend) ? String(parseRupiahNumber(existing.weekend)) : ""
        setHargaWeekday(cleanWeekday)
        setHargaWeekend(cleanWeekend)
        setImagePreview(existing.bannerUrl || null)

        if (existing.tarif_tenaga_ahli) {
          const t = existing.tarif_tenaga_ahli
          if (t.psikolog) {
            setTarifPsikologWeekday(String(parseRupiahNumber(t.psikolog.weekday) || cleanWeekday || ""))
            setTarifPsikologWeekend(String(parseRupiahNumber(t.psikolog.weekend) || cleanWeekend || ""))
          }
          if (t.konselor) {
            setTarifKonselorWeekday(String(parseRupiahNumber(t.konselor.weekday) || cleanWeekday || ""))
            setTarifKonselorWeekend(String(parseRupiahNumber(t.konselor.weekend) || cleanWeekend || ""))
          }
          if (t.peer) {
            setTarifPeerWeekday(String(parseRupiahNumber(t.peer.weekday) || cleanWeekday || ""))
            setTarifPeerWeekend(String(parseRupiahNumber(t.peer.weekend) || cleanWeekend || ""))
          }
        }
      }

      // 2. Ambil data terverifikasi dari backend database
      try {
        const res: any = await layananService.getById(layananId)
        const beData = res?.data || res
        if (beData && isMounted && (beData.id || beData.nama)) {
          const catId = mapCategoryToId(beData.kategori)
          const cleanWk = parseRupiahNumber(beData.harga_weekday) ? String(parseRupiahNumber(beData.harga_weekday)) : ""
          const cleanWknd = parseRupiahNumber(beData.harga_weekend) ? String(parseRupiahNumber(beData.harga_weekend)) : ""

          const mapped: AdminLayananItem = {
            id: beData.id,
            layanan: beData.nama,
            kategoriId: catId,
            metode: beData.metode || "Online/Offline",
            weekday: formatRupiahDisplay(cleanWk),
            weekend: formatRupiahDisplay(cleanWknd),
            status: beData.aktif ? "Aktif" : "Nonaktif",
            deskripsi: beData.deskripsi || "",
            bannerUrl: beData.banner_url || "",
            tarif_tenaga_ahli: beData.tarif_tenaga_ahli || null,
          }

          setItem(mapped)
          setNamaLayanan(mapped.layanan)
          setSelectedCategory(mapped.kategoriId)
          setIsOnline((mapped.metode || "").toLowerCase().includes("online"))
          setIsOffline((mapped.metode || "").toLowerCase().includes("offline"))
          setStatus(mapped.status)
          setDeskripsi(mapped.deskripsi)
          setHargaWeekday(cleanWk)
          setHargaWeekend(cleanWknd)
          setImagePreview(mapped.bannerUrl || null)

          if (beData.tarif_tenaga_ahli) {
            const t = beData.tarif_tenaga_ahli
            setTarifPsikologWeekday(String(t.psikolog?.weekday || cleanWk || ""))
            setTarifPsikologWeekend(String(t.psikolog?.weekend || cleanWknd || ""))
            setTarifKonselorWeekday(String(t.konselor?.weekday || cleanWk || ""))
            setTarifKonselorWeekend(String(t.konselor?.weekend || cleanWknd || ""))
            setTarifPeerWeekday(String(t.peer?.weekday || cleanWk || ""))
            setTarifPeerWeekend(String(t.peer?.weekend || cleanWknd || ""))
          } else {
            setTarifPsikologWeekday(cleanWk)
            setTarifPsikologWeekend(cleanWknd)
            setTarifKonselorWeekday(cleanWk)
            setTarifKonselorWeekend(cleanWknd)
            setTarifPeerWeekday(cleanWk)
            setTarifPeerWeekend(cleanWknd)
          }
        }
      } catch (err) {
        console.warn("Gagal memuat detail layanan dari backend:", err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!namaLayanan.trim()) {
      alert("Nama layanan wajib diisi.")
      return
    }

    if (!isOnline && !isOffline) {
      alert("Pilih minimal satu metode pelaksanaan (Online atau Offline).")
      return
    }

    const computedMetode = isOnline && isOffline ? "Online/Offline" : isOnline ? "Online" : "Offline"

    const isKonsultasi = selectedCategory === "01"

    const tarifTenagaAhli = isKonsultasi
      ? {
          psikolog: {
            weekday: parseRupiahNumber(tarifPsikologWeekday),
            weekend: parseRupiahNumber(tarifPsikologWeekend),
          },
          konselor: {
            weekday: parseRupiahNumber(tarifKonselorWeekday),
            weekend: parseRupiahNumber(tarifKonselorWeekend),
          },
          peer: {
            weekday: parseRupiahNumber(tarifPeerWeekday),
            weekend: parseRupiahNumber(tarifPeerWeekend),
          },
        }
      : null

    const finalWeekday = isKonsultasi ? tarifPsikologWeekday : hargaWeekday
    const finalWeekend = isKonsultasi ? tarifPsikologWeekend : hargaWeekend

    const updatedData: Partial<AdminLayananItem> = {
      layanan: namaLayanan.trim(),
      kategoriId: selectedCategory,
      metode: computedMetode,
      status: status,
      deskripsi: deskripsi.trim(),
      weekday: formatRupiahDisplay(finalWeekday),
      weekend: formatRupiahDisplay(finalWeekend),
      tarif_tenaga_ahli: tarifTenagaAhli,
      bannerUrl: imagePreview || "",
    }

    const ok = updateLayananById(layananId, updatedData)

    // Sinkronkan update ke backend database
    let beSuccess = false
    try {
      await layananService.update(layananId, {
        nama: namaLayanan.trim(),
        kategori: selectedCategory,
        metode: computedMetode,
        harga_weekday: parseRupiahNumber(finalWeekday),
        harga_weekend: parseRupiahNumber(finalWeekend),
        tarif_tenaga_ahli: tarifTenagaAhli,
        deskripsi: deskripsi.trim(),
        banner_url: imagePreview || null,
        aktif: status === "Aktif",
      })
      beSuccess = true
    } catch (err) {
      console.warn("Sync update layanan backend:", err)
    }

    if (ok || beSuccess) {
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
                {CATEGORIES.filter((cat) => ["01", "03", "04", "05"].includes(cat.id)).map((cat) => (
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
            <label className={labelClass}>
              Metode Pelaksanaan <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-6 mt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="w-4 h-4 rounded text-[#561269] border-gray-300 focus:ring-[#561269] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Online (Sesi Daring)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOffline}
                  onChange={(e) => setIsOffline(e.target.checked)}
                  className="w-4 h-4 rounded text-[#561269] border-gray-300 focus:ring-[#561269] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Offline (Tatap Muka)</span>
              </label>
            </div>
            {isOnline && isOffline && (
              <p className="text-xs text-purple-700 font-medium mt-2">
                ✓ Layanan fleksibel: Tersedia daring (Online) dan tatap muka (Offline).
              </p>
            )}
            {isOnline && !isOffline && (
              <p className="text-xs text-emerald-700 font-medium mt-2">
                ✓ Layanan hanya tersedia secara daring (Online).
              </p>
            )}
            {!isOnline && isOffline && (
              <p className="text-xs text-amber-700 font-medium mt-2">
                ✓ Layanan hanya tersedia secara tatap muka (Offline).
              </p>
            )}
            {!isOnline && !isOffline && (
              <p className="text-xs text-red-500 font-medium mt-2">
                ⚠️ Mohon pilih minimal satu metode pelaksanaan!
              </p>
            )}
            <span className={helperClass}>Metode pelaksanaan sesi konseling / asesmen</span>
          </div>

          {/* ── Baris 5: Tarif Weekday & Weekend ── */}
          {selectedCategory === "01" ? (
            /* Khusus Konsultasi: 3 Box Tarif Tenaga Ahli (Psikolog, Konselor, Peer) */
            <div className="p-5 rounded-2xl bg-[#FAF5FC] border border-[#E9D7F0] space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#561269]">
                  Tarif Konsultasi per Tenaga Ahli <span className="text-red-500">*</span>
                </label>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  Atur tarif sesi konsultasi untuk masing-masing kualifikasi tenaga ahli (Weekday &amp; Weekend)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Psikolog */}
                <div className="p-4 rounded-xl border border-purple-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-purple-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#561269]"></span>
                    <h4 className="text-xs font-bold text-gray-800">Psikolog</h4>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Weekday (Senin - Jumat)
                    </label>
                    <PriceInputField
                      value={tarifPsikologWeekday}
                      onChange={setTarifPsikologWeekday}
                      placeholder="350.000"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Weekend (Sabtu - Minggu)
                    </label>
                    <PriceInputField
                      value={tarifPsikologWeekend}
                      onChange={setTarifPsikologWeekend}
                      placeholder="450.000"
                    />
                  </div>
                </div>

                {/* 2. Konselor */}
                <div className="p-4 rounded-xl border border-blue-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-blue-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h4 className="text-xs font-bold text-gray-800">Konselor</h4>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Weekday (Senin - Jumat)
                    </label>
                    <PriceInputField
                      value={tarifKonselorWeekday}
                      onChange={setTarifKonselorWeekday}
                      placeholder="250.000"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Weekend (Sabtu - Minggu)
                    </label>
                    <PriceInputField
                      value={tarifKonselorWeekend}
                      onChange={setTarifKonselorWeekend}
                      placeholder="350.000"
                    />
                  </div>
                </div>

                {/* 3. Peer Konselor */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-emerald-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h4 className="text-xs font-bold text-gray-800">Peer Konselor</h4>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Weekday (Senin - Jumat)
                    </label>
                    <PriceInputField
                      value={tarifPeerWeekday}
                      onChange={setTarifPeerWeekday}
                      placeholder="150.000"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Weekend (Sabtu - Minggu)
                    </label>
                    <PriceInputField
                      value={tarifPeerWeekend}
                      onChange={setTarifPeerWeekend}
                      placeholder="200.000"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Non-Konsultasi: Tarif Reguler */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label htmlFor="hargaWeekday" className={labelClass}>
                  Tarif Weekday (Senin - Jumat) <span className="text-red-500">*</span>
                </label>
                <PriceInputField
                  value={hargaWeekday}
                  onChange={setHargaWeekday}
                  placeholder="350.000"
                />
                <span className={helperClass}>Tarif sesi pada hari kerja reguler (contoh: 350.000)</span>
              </div>

              <div>
                <label htmlFor="hargaWeekend" className={labelClass}>
                  Tarif Weekend (Sabtu - Minggu) <span className="text-red-500">*</span>
                </label>
                <PriceInputField
                  value={hargaWeekend}
                  onChange={setHargaWeekend}
                  placeholder="450.000"
                />
                <span className={helperClass}>Tarif sesi pada akhir pekan (contoh: 450.000)</span>
              </div>
            </div>
          )}

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
