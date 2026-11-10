"use client"

import { CloudUpload, X, CheckCircle2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { CATEGORIES } from "../../data/layananData"
import { addLayanan } from "../../data/adminLayananData"
import { processAndUploadImage } from "@/lib/imageCompressor"
import { layananService } from "@/services/layanan.service"
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
  required = false,
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

export default function TambahLayananView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "01"

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageInputMode, setImageInputMode] = useState<"file" | "url">("file")
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif")
  const [namaLayanan, setNamaLayanan] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [isOffline, setIsOffline] = useState(true)
  const [deskripsi, setDeskripsi] = useState("")
  const [hargaWeekday, setHargaWeekday] = useState("")
  const [hargaWeekend, setHargaWeekend] = useState("")

  // Tarif spesifik per Tenaga Ahli (khusus kategori Konsultasi: 01)
  const [tarifPsikologWeekday, setTarifPsikologWeekday] = useState("")
  const [tarifPsikologWeekend, setTarifPsikologWeekend] = useState("")
  const [tarifKonselorWeekday, setTarifKonselorWeekday] = useState("")
  const [tarifKonselorWeekend, setTarifKonselorWeekend] = useState("")
  const [tarifPeerWeekday, setTarifPeerWeekday] = useState("")
  const [tarifPeerWeekend, setTarifPeerWeekend] = useState("")

  const isPartnership = selectedCategory === "03" || selectedCategory === "04"
  const isKonsultasi = selectedCategory === "01"

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
        const { url } = await processAndUploadImage(file, "layanan")
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

    if (!isPartnership && !isOnline && !isOffline) {
      alert("Pilih minimal satu metode pelaksanaan (Online atau Offline).")
      return
    }

    const computedMetode = isPartnership
      ? "-"
      : isOnline && isOffline
      ? "Online/Offline"
      : isOnline
      ? "Online"
      : "Offline"

    if (selectedCategory === "05") {
      const wd = parseRupiahNumber(hargaWeekday)
      const wk = parseRupiahNumber(hargaWeekend)
      if (wd === 0 && wk === 0) {
        alert("Layanan asesmen wajib diisi tarifnya minimal salah satu (Weekday atau Weekend).")
        return
      }
    }

    let tarifTenagaAhli: any = null
    let activeExpert: { weekday: number; weekend: number } | null = null

    if (isKonsultasi) {
      const psiWd = parseRupiahNumber(tarifPsikologWeekday)
      const psiWk = parseRupiahNumber(tarifPsikologWeekend)
      const konWd = parseRupiahNumber(tarifKonselorWeekday)
      const konWk = parseRupiahNumber(tarifKonselorWeekend)
      const peerWd = parseRupiahNumber(tarifPeerWeekday)
      const peerWk = parseRupiahNumber(tarifPeerWeekend)

      const hasPsikolog = psiWd > 0 || psiWk > 0
      const hasKonselor = konWd > 0 || konWk > 0
      const hasPeer = peerWd > 0 || peerWk > 0

      // Validasi: Wajib isi minimal satu tenaga ahli untuk layanan konsultasi
      if (!hasPsikolog && !hasKonselor && !hasPeer) {
        alert("Layanan konsultasi wajib diisi tarifnya minimal untuk satu kualifikasi tenaga ahli (Psikolog, Konselor, atau Peer Konselor).")
        return
      }

      tarifTenagaAhli = {}
      if (hasPsikolog) {
        tarifTenagaAhli.psikolog = { weekday: psiWd, weekend: psiWk }
        if (!activeExpert) activeExpert = tarifTenagaAhli.psikolog
      }
      if (hasKonselor) {
        tarifTenagaAhli.konselor = { weekday: konWd, weekend: konWk }
        if (!activeExpert) activeExpert = tarifTenagaAhli.konselor
      }
      if (hasPeer) {
        tarifTenagaAhli.peer = { weekday: peerWd, weekend: peerWk }
        if (!activeExpert) activeExpert = tarifTenagaAhli.peer
      }
    }

    const finalWeekday = isKonsultasi
      ? String(activeExpert?.weekday || "0")
      : isPartnership
      ? "0"
      : hargaWeekday

    const finalWeekend = isKonsultasi
      ? String(activeExpert?.weekend || "0")
      : isPartnership
      ? "0"
      : hargaWeekend

    addLayanan({
      layanan: namaLayanan.trim(),
      kategoriId: selectedCategory,
      metode: computedMetode,
      weekday: isPartnership ? "Kemitraan" : formatRupiahDisplay(finalWeekday),
      weekend: isPartnership ? "Kemitraan" : formatRupiahDisplay(finalWeekend),
      tarif_tenaga_ahli: tarifTenagaAhli,
      status: status,
      deskripsi: deskripsi.trim(),
      bannerUrl: imagePreview || "",
    })

    // Sinkronkan ke database backend
    layananService
      .create({
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
      .catch((err: any) => {
        console.warn("Gagal sinkronisasi layanan ke backend:", err?.message)
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

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Kategori Layanan & Status Layanan */}
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
              {CATEGORIES.filter((cat) => ["01", "03", "04", "05"].includes(cat.id)).map((cat) => (
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
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "Aktif" | "Nonaktif")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white cursor-pointer"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${!isPartnership ? "md:grid-cols-2" : ""} gap-6`}>
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

          {/* Metode Pelaksanaan (Hanya untuk Konsultasi 01 dan Asesmen 05) */}
          {!isPartnership && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            </div>
          )}
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

        {/* ── Percabangan Input Tarif & Banner Sesuai Kategori ── */}
        {selectedCategory === "01" ? (
          /* 1. Kategori Konsultasi: Tarif 3 Tenaga Ahli + Poster */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#561269]">
                  Tarif Konsultasi per Tenaga Ahli <span className="text-red-500">*</span>
                </label>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Isi tarif minimal untuk 1 tenaga ahli yang tersedia untuk layanan ini. Kosongkan tenaga ahli jika layanan ini tidak dilayani oleh kualifikasi tersebut.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* 1. Psikolog */}
                {(() => {
                  const isPsiActive = Boolean(tarifPsikologWeekday.trim() || tarifPsikologWeekend.trim())
                  return (
                    <div className={`p-4 rounded-xl border transition-all bg-white shadow-xs space-y-3 ${
                      isPsiActive ? "border-purple-300 ring-1 ring-purple-200" : "border-gray-200 opacity-85"
                    }`}>
                      <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#561269]"></span>
                          <h4 className="text-xs font-bold text-gray-800">Psikolog</h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPsiActive ? "bg-purple-100 text-[#561269]" : "bg-gray-100 text-gray-400"
                        }`}>
                          {isPsiActive ? "Tersedia" : "Kosong"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Weekday (Senin - Jumat)
                        </label>
                        <PriceInputField
                          value={tarifPsikologWeekday}
                          onChange={setTarifPsikologWeekday}
                          placeholder="350.000"
                          required={false}
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
                          required={false}
                        />
                      </div>
                    </div>
                  )
                })()}

                {/* 2. Konselor */}
                {(() => {
                  const isKonActive = Boolean(tarifKonselorWeekday.trim() || tarifKonselorWeekend.trim())
                  return (
                    <div className={`p-4 rounded-xl border transition-all bg-white shadow-xs space-y-3 ${
                      isKonActive ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-200 opacity-85"
                    }`}>
                      <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          <h4 className="text-xs font-bold text-gray-800">Konselor</h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isKonActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                        }`}>
                          {isKonActive ? "Tersedia" : "Kosong"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Weekday (Senin - Jumat)
                        </label>
                        <PriceInputField
                          value={tarifKonselorWeekday}
                          onChange={setTarifKonselorWeekday}
                          placeholder="250.000"
                          required={false}
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
                          required={false}
                        />
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Peer Konselor */}
                {(() => {
                  const isPeerActive = Boolean(tarifPeerWeekday.trim() || tarifPeerWeekend.trim())
                  return (
                    <div className={`p-4 rounded-xl border transition-all bg-white shadow-xs space-y-3 ${
                      isPeerActive ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200 opacity-85"
                    }`}>
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          <h4 className="text-xs font-bold text-gray-800">Peer Konselor</h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPeerActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                        }`}>
                          {isPeerActive ? "Tersedia" : "Kosong"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Weekday (Senin - Jumat)
                        </label>
                        <PriceInputField
                          value={tarifPeerWeekday}
                          onChange={setTarifPeerWeekday}
                          placeholder="150.000"
                          required={false}
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
                          required={false}
                        />
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Poster Upload saat Kategori Konsultasi */}
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
        ) : selectedCategory === "05" ? (
          /* 2. Kategori Asesmen: Tarif Reguler + Foto Banner */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Harga Asesmen */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Tarif Asesmen <span className="text-red-500">*</span>
              </label>

              {/* Weekday */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Weekday (Senin - Jumat)</label>
                <PriceInputField
                  value={hargaWeekday}
                  onChange={setHargaWeekday}
                  placeholder="350.000"
                  required={false}
                />
              </div>

              {/* Weekend */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Weekend (Sabtu - Minggu)</label>
                <PriceInputField
                  value={hargaWeekend}
                  onChange={setHargaWeekend}
                  placeholder="450.000"
                  required={false}
                />
              </div>
            </div>

            {/* Foto Banner / Hero Asesmen */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-800">
                  Foto Banner Awal / Gambar Hero Layanan
                </label>
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("file")}
                    className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                      imageInputMode === "file" ? "bg-white text-[#561269] shadow-xs" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                      imageInputMode === "url" ? "bg-white text-[#561269] shadow-xs" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Tautan URL
                  </button>
                </div>
              </div>

              {imageInputMode === "url" ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/foto-banner-layanan.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setImagePreview(imageUrlInput.trim())
                        }
                      }}
                      className="px-4 py-2 bg-[#561269] text-white rounded-lg text-xs font-bold hover:bg-[#7B1FA2] transition cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                  {imagePreview && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                      <Image
                        src={imagePreview}
                        alt="Preview Foto Hero"
                        width={400}
                        height={160}
                        className="max-h-40 w-auto object-contain"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setImageUrlInput("")
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-sm cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
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
                        alt="Preview Foto Hero"
                        width={300}
                        height={160}
                        className="max-h-[160px] w-auto object-contain"
                        unoptimized
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium pointer-events-none">
                        📐 1200 × 675 px (16:9)
                      </div>
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
                      <div className="text-sm text-gray-600">Klik untuk upload foto banner / gambar hero</div>
                      <p className="text-xs font-medium text-gray-600">
                        Rekomendasi ukuran: <span className="font-bold text-[#561269]">1200 × 675 px (rasio 16:9)</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Format JPG, PNG, atau WebP • Bebas ukuran berapa pun, otomatis dikompresi
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 3. Kategori Workshop & Seminar: Program Kemitraan (Tanpa Pengisian Tarif) */
          <div className="space-y-6">
            {/* Foto Banner / Hero Layanan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-800">
                  Foto Banner Awal / Gambar Hero Program
                </label>
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("file")}
                    className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                      imageInputMode === "file" ? "bg-white text-[#561269] shadow-xs" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                      imageInputMode === "url" ? "bg-white text-[#561269] shadow-xs" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Tautan URL
                  </button>
                </div>
              </div>

              {imageInputMode === "url" ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/foto-banner-layanan.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setImagePreview(imageUrlInput.trim())
                        }
                      }}
                      className="px-4 py-2 bg-[#561269] text-white rounded-lg text-xs font-bold hover:bg-[#7B1FA2] transition cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                  {imagePreview && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                      <Image
                        src={imagePreview}
                        alt="Preview Foto Hero"
                        width={400}
                        height={160}
                        className="max-h-40 w-auto object-contain"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setImageUrlInput("")
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-sm cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
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
                        alt="Preview Foto Hero"
                        width={300}
                        height={160}
                        className="max-h-[160px] w-auto object-contain"
                        unoptimized
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium pointer-events-none">
                        📐 1200 × 675 px (16:9)
                      </div>
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
                      <div className="text-sm text-gray-600">Klik untuk upload foto banner / gambar hero</div>
                      <p className="text-xs font-medium text-gray-600">
                        Rekomendasi ukuran: <span className="font-bold text-[#561269]">1200 × 675 px (rasio 16:9)</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Format JPG, PNG, atau WebP • Bebas ukuran berapa pun, otomatis dikompresi
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
