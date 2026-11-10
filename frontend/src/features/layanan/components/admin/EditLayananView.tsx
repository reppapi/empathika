"use client"

import { CloudUpload, X, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
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

function cleanInputRaw(val: string | number | undefined | null): string {
  if (val === "" || val === undefined || val === null) return ""
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

export default function EditLayananView({ layananId }: EditLayananViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams ? (searchParams.get("category") || searchParams.get("kategori")) : null
  const [item, setItem] = useState<AdminLayananItem | null>(null)
  const [loading, setLoading] = useState(true)

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (categoryParam) return categoryParam
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("empathika_admin_layanan_category")
      if (saved) return saved
    }
    return "01"
  })
  const [namaLayanan, setNamaLayanan] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [isOffline, setIsOffline] = useState(true)
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif")
  const [deskripsi, setDeskripsi] = useState("")
  const [hargaWeekday, setHargaWeekday] = useState("")
  const [hargaWeekend, setHargaWeekend] = useState("")

  // Tarif khusus kategori Asesmen (05): Online (Psikotes)
  const [hargaAsesmenOnline, setHargaAsesmenOnline] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState(false)

  // Foto Kegiatan khusus Workshop ("03") & Seminar ("04") (maksimal 3 foto)
  const [fotoKegiatan, setFotoKegiatan] = useState<(string | null)[]>([null, null, null])
  const slotFileInputRef0 = useRef<HTMLInputElement>(null)
  const slotFileInputRef1 = useRef<HTMLInputElement>(null)
  const slotFileInputRef2 = useRef<HTMLInputElement>(null)
  const slotFileInputRefs = [slotFileInputRef0, slotFileInputRef1, slotFileInputRef2]

  const handleSlotFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { url } = await processAndUploadImage(file, "layanan")
        setFotoKegiatan((prev) => {
          const next = [...prev]
          next[index] = url
          return next
        })
        if (index === 0) {
          setImagePreview(url)
        }
      } catch (err: any) {
        alert(err?.message || "Gagal memproses gambar")
      }
    }
  }

  const handleSlotRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setFotoKegiatan((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
    if (slotFileInputRefs[index].current) {
      slotFileInputRefs[index].current!.value = ""
    }
    if (index === 0) {
      setImagePreview(null)
    }
  }

  // Tarif spesifik per Tenaga Ahli (khusus kategori Konsultasi: 01)
  const [tarifPsikologWeekday, setTarifPsikologWeekday] = useState("")
  const [tarifPsikologWeekend, setTarifPsikologWeekend] = useState("")
  const [tarifKonselorWeekday, setTarifKonselorWeekday] = useState("")
  const [tarifKonselorWeekend, setTarifKonselorWeekend] = useState("")
  const [tarifPeerWeekday, setTarifPeerWeekday] = useState("")
  const [tarifPeerWeekend, setTarifPeerWeekend] = useState("")

  const isPartnership = selectedCategory === "03" || selectedCategory === "04"

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageFile = async (file: File) => {
    try {
      const { url } = await processAndUploadImage(file, "layanan")
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

  // Helper untuk mengisi seluruh isian form dari data layanan
  const populateFields = (target: any) => {
    if (!target) return
    setItem(target)
    if (target.layanan || target.nama) {
      setNamaLayanan(target.layanan || target.nama)
    }
    const targetCat = target.kategoriId || mapCategoryToId(target.kategori) || categoryParam || "01"
    setSelectedCategory(targetCat)
    if (typeof window !== "undefined") {
      localStorage.setItem("empathika_admin_layanan_category", targetCat)
    }
    const m = target.metode || "Online/Offline"
    setIsOnline(m.toLowerCase().includes("online"))
    setIsOffline(m.toLowerCase().includes("offline"))
    setStatus(target.status || (target.aktif === false ? "Nonaktif" : "Aktif"))
    setDeskripsi(target.deskripsi || "")

    const cleanWk = cleanInputRaw(target.harga_weekday ?? target.weekday)
    const cleanWknd = cleanInputRaw(target.harga_weekend ?? target.weekend)
    setHargaWeekday(cleanWk)
    setHargaWeekend(cleanWknd)

    const banner = target.bannerUrl || target.banner_url || null
    setImagePreview(banner)

    const rawFoto = target.foto_kegiatan || (target.tarif_tenaga_ahli as any)?.foto_kegiatan
    if (Array.isArray(rawFoto) && rawFoto.length > 0) {
      setFotoKegiatan([rawFoto[0] || null, rawFoto[1] || null, rawFoto[2] || null])
      if (!banner && rawFoto[0]) setImagePreview(rawFoto[0])
    } else if (banner) {
      setFotoKegiatan([banner, null, null])
    }

    const t = target.tarif_tenaga_ahli
    if (t) {
      setTarifPsikologWeekday(t.psikolog && (t.psikolog.weekday || t.psikolog.weekend) ? cleanInputRaw(t.psikolog.weekday) : "")
      setTarifPsikologWeekend(t.psikolog && (t.psikolog.weekday || t.psikolog.weekend) ? cleanInputRaw(t.psikolog.weekend) : "")
      setTarifKonselorWeekday(t.konselor && (t.konselor.weekday || t.konselor.weekend) ? cleanInputRaw(t.konselor.weekday) : "")
      setTarifKonselorWeekend(t.konselor && (t.konselor.weekend || t.konselor.weekend) ? cleanInputRaw(t.konselor.weekend) : "")
      setTarifPeerWeekday(t.peer && (t.peer.weekday || t.peer.weekend) ? cleanInputRaw(t.peer.weekday) : "")
      setTarifPeerWeekend(t.peer && (t.peer.weekend || t.peer.weekend) ? cleanInputRaw(t.peer.weekend) : "")

      // Asesmen Online & Offline
      const rawOnline = (t as any)?.asesmen?.online ?? (t as any)?.online
      const rawOfflineWk = (t as any)?.asesmen?.offline?.weekday ?? (t as any)?.offline?.weekday
      const rawOfflineWknd = (t as any)?.asesmen?.offline?.weekend ?? (t as any)?.offline?.weekend

      if (rawOnline) {
        setHargaAsesmenOnline(cleanInputRaw(rawOnline))
      } else if ((target.metode || "").toLowerCase().includes("online") && !(target.metode || "").toLowerCase().includes("offline")) {
        setHargaAsesmenOnline(cleanWk)
      }

      if (rawOfflineWk) {
        setHargaWeekday(cleanInputRaw(rawOfflineWk))
      }
      if (rawOfflineWknd) {
        setHargaWeekend(cleanInputRaw(rawOfflineWknd))
      }
    } else {
      setTarifPsikologWeekday(cleanWk)
      setTarifPsikologWeekend(cleanWknd)
      if ((target.metode || "").toLowerCase().includes("online") && !(target.metode || "").toLowerCase().includes("offline")) {
        setHargaAsesmenOnline(cleanWk)
      }
    }
  }

  // Load existing data (Multi-layer prefill: sessionStorage -> localStorage -> API getById -> API getAll fallback)
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      let foundData = false

      // 1. Coba baca dari sessionStorage (instan saat klik Edit dari tabel atau modal)
      if (typeof window !== "undefined") {
        try {
          const cachedRaw = sessionStorage.getItem("empathika_edit_item")
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw)
            if (String(cached.id) === String(layananId)) {
              populateFields(cached)
              foundData = true
              setLoading(false)
            }
          }
        } catch {}
      }

      // 2. Coba baca dari localStorage
      if (!foundData) {
        const existing = getLayananById(layananId)
        if (existing && isMounted) {
          populateFields(existing)
          foundData = true
          setLoading(false)
        }
      }

      // 3. Ambil data terverifikasi dari backend database
      try {
        const res: any = await layananService.getById(layananId)
        const beData = res?.data || res
        if (beData && isMounted && (beData.id || beData.nama)) {
          populateFields(beData)
          foundData = true
        }
      } catch {
        // 4. Fallback jika getById gagal: cari di getAll()
        try {
          const allRes: any = await layananService.getAll()
          const allList = Array.isArray(allRes?.data) ? allRes.data : Array.isArray(allRes) ? allRes : []
          const found = allList.find((x: any) => String(x.id) === String(layananId))
          if (found && isMounted) {
            populateFields(found)
            foundData = true
          }
        } catch {}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!namaLayanan.trim()) {
      alert("Nama layanan wajib diisi.")
      return
    }

    const isKonsultasi = selectedCategory === "01"
    const isPartnershipMode = selectedCategory === "03" || selectedCategory === "04"

    if (!isPartnershipMode && !isOnline && !isOffline) {
      alert("Pilih minimal satu metode pelaksanaan (Online atau Offline).")
      return
    }

    const computedMetode = isPartnershipMode
      ? "-"
      : isOnline && isOffline
      ? "Online/Offline"
      : isOnline
      ? "Online"
      : "Offline"

    if (selectedCategory === "05") {
      const onlineVal = parseRupiahNumber(hargaAsesmenOnline)
      const offlineWk = parseRupiahNumber(hargaWeekday)
      const offlineWknd = parseRupiahNumber(hargaWeekend)

      if (isOnline && onlineVal === 0) {
        alert("Metode Online dipilih, silakan masukkan Tarif Online (Pengerjaan Psikotes).")
        return
      }
      if (isOffline && offlineWk === 0 && offlineWknd === 0) {
        alert("Metode Offline dipilih, silakan masukkan minimal salah satu Tarif Offline (Weekday atau Weekend).")
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
    } else if (selectedCategory === "05") {
      const onlineVal = parseRupiahNumber(hargaAsesmenOnline)
      const offlineWk = parseRupiahNumber(hargaWeekday)
      const offlineWknd = parseRupiahNumber(hargaWeekend)

      tarifTenagaAhli = {
        asesmen: {
          online: isOnline ? onlineVal : null,
          offline: isOffline ? {
            weekday: offlineWk,
            weekend: offlineWknd || offlineWk,
          } : null,
        },
        online: isOnline ? onlineVal : null,
        offline: isOffline ? {
          weekday: offlineWk,
          weekend: offlineWknd || offlineWk,
        } : null,
      }
    }

    const finalWeekday = isKonsultasi
      ? String(activeExpert?.weekday || "0")
      : isPartnershipMode
      ? "0"
      : selectedCategory === "05"
      ? isOffline
        ? String(parseRupiahNumber(hargaWeekday) || (isOnline ? parseRupiahNumber(hargaAsesmenOnline) : 0))
        : String(parseRupiahNumber(hargaAsesmenOnline) || 0)
      : hargaWeekday

    const finalWeekend = isKonsultasi
      ? String(activeExpert?.weekend || "0")
      : isPartnershipMode
      ? "0"
      : selectedCategory === "05"
      ? isOffline
        ? String(parseRupiahNumber(hargaWeekend) || parseRupiahNumber(hargaWeekday) || (isOnline ? parseRupiahNumber(hargaAsesmenOnline) : 0))
        : String(parseRupiahNumber(hargaAsesmenOnline) || 0)
      : hargaWeekend

    const validFotos = fotoKegiatan.filter((f): f is string => typeof f === "string" && f.trim().length > 0)
    const finalBanner = isPartnershipMode
      ? (fotoKegiatan[0] || validFotos[0] || imagePreview || "")
      : (imagePreview || "")

    const updatedData: Partial<AdminLayananItem> = {
      layanan: namaLayanan.trim(),
      kategoriId: selectedCategory,
      metode: computedMetode,
      status: status,
      deskripsi: deskripsi.trim(),
      weekday: isPartnershipMode ? "Kemitraan" : formatRupiahDisplay(finalWeekday),
      weekend: isPartnershipMode ? "Kemitraan" : formatRupiahDisplay(finalWeekend),
      tarif_tenaga_ahli: tarifTenagaAhli,
      bannerUrl: finalBanner,
      foto_kegiatan: isPartnershipMode && validFotos.length > 0 ? validFotos : undefined,
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
        banner_url: finalBanner || null,
        foto_kegiatan: isPartnershipMode && validFotos.length > 0 ? validFotos : undefined,
        aktif: status === "Aktif",
      })
      beSuccess = true
    } catch (err) {
      console.warn("Sync update layanan backend:", err)
    }

    if (ok || beSuccess) {
      setSuccessMsg(true)
      setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("empathika_admin_layanan_category", selectedCategory)
          sessionStorage.removeItem("empathika_edit_item")
        }
        router.push(`/admin/layanan?category=${selectedCategory}`)
      }, 1000)
    } else {
      alert("Gagal memperbarui layanan.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm animate-pulse">
        Memuat data layanan...
      </div>
    )
  }

  if (!item && !namaLayanan) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-10 font-poppins text-center shadow-xs">
        <p className="text-gray-800 font-bold text-lg mb-2">Layanan tidak ditemukan</p>
        <p className="text-gray-500 text-sm mb-6">ID layanan tidak valid atau data sudah dihapus.</p>
        <Link
          href={`/admin/layanan?category=${selectedCategory}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#561269] text-white rounded-full text-sm font-bold shadow-sm hover:bg-[#430d52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Layanan
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-poppins pb-16">
      {/* ── Top Bar: Back Button & Judul Halaman ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.setItem("empathika_admin_layanan_category", selectedCategory)
            }
            router.push(`/admin/layanan?category=${selectedCategory}`)
          }}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition cursor-pointer"
          title="Kembali ke Daftar Layanan"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
          Edit Layanan
        </h2>
      </div>

      {/* ── Container Form (Desain Rapi & Elegan Serasi dengan Tambah Layanan) ── */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Perubahan berhasil disimpan!</p>
              <p className="text-xs text-emerald-700">Mengalihkan kembali ke daftar layanan...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* ── Baris 1: Kategori Layanan & Status Layanan ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Layanan <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedCategory(val)
                  if (typeof window !== "undefined") {
                    localStorage.setItem("empathika_admin_layanan_category", val)
                  }
                }}
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

          {/* ── Baris 2: Nama Layanan & (Metode Pelaksanaan jika Konsultasi/Asesmen) ── */}
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

          {/* ── Baris 3: Deskripsi Layanan ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Layanan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Masukkan deskripsi mengenai layanan ini"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] resize-y whitespace-pre-wrap"
            />
          </div>

          {/* ── Baris 4: Percabangan Sesuai Kategori ── */}
          {selectedCategory === "01" ? (
            /* 1. Kategori Konsultasi: Tarif 3 Tenaga Ahli + Poster */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#561269]">
                    Tarif Konsultasi per Tenaga Ahli <span className="text-red-500">*</span>
                  </label>
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
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium pointer-events-none">
                        1200 × 675 px (16:9)
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
                    <div className="space-y-1.5 text-center my-auto p-2">
                      <CloudUpload className="mx-auto h-8 w-8 text-[#561269]" />
                      <div className="text-sm font-semibold text-gray-700">Klik untuk upload gambar poster / banner layanan</div>
                      <p className="text-xs font-medium text-gray-600">
                        Rekomendasi ukuran: <span className="font-bold text-[#561269]">1200 × 675 piksel (Landscape / Memanjang, Rasio 16:9)</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Format: JPG, PNG, WebP (Maks. 2MB) • Otomatis disesuaikan untuk kartu layanan klien
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : selectedCategory === "05" ? (
            /* 2. Kategori Asesmen: Tarif Online (Psikotes) & Tarif Offline (Weekday/Weekend) + Foto Banner */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Harga Asesmen */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800">
                    Tarif Layanan Asesmen <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pengisian tarif otomatis menyesuaikan metode pelaksanaan yang dipilih di atas.
                  </p>
                </div>

                {!isOnline && !isOffline ? (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                    ⚠️ Silakan centang minimal satu <strong>Metode Pelaksanaan</strong> (Online atau Offline) pada pilihan di atas.
                  </div>
                ) : null}

                {/* Box 1: Tarif Online (Pengerjaan Psikotes Daring) */}
                {isOnline && (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <h4 className="text-xs font-bold text-blue-900">Tarif Online (Pengerjaan Psikotes)</h4>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Tarif Asesmen Online <span className="text-red-500">*</span>
                      </label>
                      <PriceInputField
                        value={hargaAsesmenOnline}
                        onChange={setHargaAsesmenOnline}
                        placeholder="350.000"
                        required={false}
                      />
                    </div>
                  </div>
                )}

                {/* Box 2: Tarif Offline (Sesi Tatap Muka di Klinik) */}
                {isOffline && (
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-purple-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#561269]"></span>
                      <h4 className="text-xs font-bold text-[#561269]">Tarif Offline (Tatap Muka di Klinik)</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Weekday (Senin - Jumat)
                        </label>
                        <PriceInputField
                          value={hargaWeekday}
                          onChange={setHargaWeekday}
                          placeholder="400.000"
                          required={false}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Weekend (Sabtu - Minggu)
                        </label>
                        <PriceInputField
                          value={hargaWeekend}
                          onChange={setHargaWeekend}
                          placeholder="500.000"
                          required={false}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Poster Upload saat Kategori Asesmen */}
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
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium pointer-events-none">
                        1200 × 675 px (16:9)
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
                    <div className="space-y-1.5 text-center my-auto p-2">
                      <CloudUpload className="mx-auto h-8 w-8 text-[#561269]" />
                      <div className="text-sm font-semibold text-gray-700">Klik untuk upload gambar poster / banner layanan</div>
                      <p className="text-xs font-medium text-gray-600">
                        Rekomendasi ukuran: <span className="font-bold text-[#561269]">1200 × 675 piksel (Landscape / Memanjang, Rasio 16:9)</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Format: JPG, PNG, WebP (Maks. 2MB) • Otomatis disesuaikan untuk kartu layanan klien
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 3. Kategori Workshop & Seminar: Program Kemitraan (Tanpa Pengisian Tarif) */
            <div className="space-y-6">
              {/* Foto Kegiatan (Maksimal 3 Foto) */}
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-bold text-gray-800">
                    Foto Kegiatan (Maksimal 3 Foto)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Foto pertama (Slot 1) otomatis menjadi <span className="font-semibold text-[#561269]">banner kartu layanan</span> dan <span className="font-semibold text-[#561269]">foto hero paling atas</span> pada halaman detail {selectedCategory === "03" ? "workshop" : "seminar"}.
                    <br />
                    <span className="font-semibold text-gray-700">Rekomendasi ukuran: </span>
                    <span className="font-bold text-[#561269]">1200 × 675 piksel (Landscape / Memanjang, Rasio 16:9)</span> agar foto pas dan tajam di halaman klien.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[0, 1, 2].map((slotIdx) => {
                    const isSlot0 = slotIdx === 0
                    const currentPhoto = fotoKegiatan[slotIdx]

                    return (
                      <div
                        key={slotIdx}
                        className={`relative rounded-2xl border-2 transition-all p-3.5 flex flex-col justify-between ${
                          isSlot0
                            ? "border-[#561269]/40 bg-purple-50/20 shadow-xs ring-1 ring-[#561269]/10"
                            : "border-gray-200 bg-gray-50/40 hover:border-gray-300"
                        }`}
                      >
                        {/* Header Slot */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              isSlot0
                                ? "bg-[#561269] text-white shadow-xs"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {isSlot0 ? "⭐ Foto 1 (Sampul & Hero)" : `Foto Kegiatan ${slotIdx + 1}`}
                          </span>
                          {isSlot0 && (
                            <span className="text-[10px] text-[#561269] font-bold">
                              Utama
                            </span>
                          )}
                        </div>

                        {/* Area Upload atau Preview */}
                        {currentPhoto ? (
                          <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center group">
                            <Image
                              src={currentPhoto}
                              alt={`Foto Kegiatan ${slotIdx + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              unoptimized
                            />
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium pointer-events-none">
                              1200 × 675 px
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => slotFileInputRefs[slotIdx].current?.click()}
                                className="px-3 py-1.5 rounded-full bg-white text-gray-800 text-[11px] font-bold shadow hover:bg-gray-100 transition cursor-pointer"
                              >
                                Ganti Foto
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleSlotRemove(slotIdx, e)}
                                className="px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold shadow hover:bg-red-700 transition cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => slotFileInputRefs[slotIdx].current?.click()}
                            className="h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#561269] hover:bg-purple-50/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group"
                          >
                            <input
                              type="file"
                              ref={slotFileInputRefs[slotIdx]}
                              onChange={(e) => handleSlotFileChange(slotIdx, e)}
                              accept="image/jpeg, image/png, image/webp"
                              className="hidden"
                            />
                            <div className="p-2.5 rounded-full bg-white group-hover:bg-purple-100 text-gray-400 group-hover:text-[#561269] shadow-xs mb-2 transition-colors">
                              <CloudUpload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-gray-700 group-hover:text-[#561269] transition-colors">
                              {isSlot0 ? "Unggah Foto Sampul" : `Unggah Foto Kegiatan ${slotIdx + 1}`}
                            </p>
                            <p className="text-[11px] font-semibold text-[#561269] mt-0.5">
                              1200 × 675 px (16:9)
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Format JPG, PNG, atau WebP
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Tombol Aksi Form ── */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("empathika_admin_layanan_category", selectedCategory)
                  sessionStorage.removeItem("empathika_edit_item")
                }
                router.push(`/admin/layanan?category=${selectedCategory}`)
              }}
              className="px-6 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 rounded-full text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
