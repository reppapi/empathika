"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, KategoriTenaga, StatusAkses } from "../../types"
import { INITIAL_TENAGA_AHLI, LOCAL_STORAGE_KEY_TENAGA } from "../../data/initialData"
import { psikologService } from "@/services/psikolog.service"
import {
  validateEmail,
  validateNoTelepon,
  validateNoStr,
  validateNoSipp,
  validateTenagaAhliForm,
  TouchedFields,
} from "../../utils/tenagaAhliValidation"

interface Props {
  psikologId: string
}

export default function AdminEditPsikologClient({ psikologId }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [noTelepon, setNoTelepon] = useState("")

  // State Tautan Aktivasi & Token WhatsApp (bisa di-generate atau reset di halaman edit)
  const [activationToken, setActivationToken] = useState<string | null>(null)
  const [tokenExpiredAt, setTokenExpiredAt] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [kategori, setKategori] = useState<KategoriTenaga>("psikolog")
  const [statusAkses, setStatusAkses] = useState<StatusAkses>("AKTIF")
  const [spesialisasi, setSpesialisasi] = useState("")
  const [noStr, setNoStr] = useState("")
  const [noSipp, setNoSipp] = useState("")
  const [pendidikanText, setPendidikanText] = useState("")
  const [bio, setBio] = useState("")
  const [quote, setQuote] = useState("")
  const [instagram, setInstagram] = useState("")
  const [foto, setFoto] = useState<string | null>(null)
  const [keahlian, setKeahlian] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [jumlahSesi, setJumlahSesi] = useState(0)
  const [tanggalBergabung, setTanggalBergabung] = useState("")

  // Validation States
  const [touched, setTouched] = useState<TouchedFields>({})
  const [formErrorAlert, setFormErrorAlert] = useState<string | null>(null)

  // Derived error messages
  const emailError = touched.email ? validateEmail(email) : null
  const noTeleponError = touched.noTelepon ? validateNoTelepon(noTelepon) : null
  const noStrError = touched.noStr ? validateNoStr(noStr, kategori) : null
  const noSippError = touched.noSipp ? validateNoSipp(noSipp, kategori) : null

  // Cek apakah token aktivasi sudah kedaluwarsa (7 hari)
  const isTokenExpired = Boolean(
    tokenExpiredAt && new Date(tokenExpiredAt).getTime() < Date.now()
  )

  const formatExpiryDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return null
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return null
    }
  }

  // Load existing data
  useEffect(() => {
    let foundItem: TenagaAhli | null = null

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      foundItem = list.find((d) => d.id === psikologId) || null
    } catch {}

    const applyData = (found: any) => {
      setNama(found.nama || found.nama_gelar || "")
      setEmail(found.email || found.account?.email || "")
      setPassword(found.password || "")
      setNoTelepon(found.noTelepon || found.account?.no_telepon || "")
      if (found.tokenAktivasi || found.token_aktivasi) {
        setActivationToken(found.tokenAktivasi || found.token_aktivasi)
      }
      if (found.tokenExpiredAt || found.token_expired_at) {
        setTokenExpiredAt(found.tokenExpiredAt || found.token_expired_at)
      }
      const kat = (found.kategori || "").toLowerCase()
      setKategori(
        kat.includes("peer")
          ? "peer-konselor"
          : kat.includes("konselor")
          ? "konselor"
          : "psikolog"
      )
      setStatusAkses(found.statusAkses || (found.status === "INACTIVE" ? "NONAKTIF" : "AKTIF"))
      setSpesialisasi(found.spesialisasi?.nama || found.spesialisasi || "")
      setNoStr(found.noStr || found.no_str || "")
      setNoSipp(found.noSipp || found.no_sipp || "")
      setPendidikanText(found.pendidikanText || found.pendidikan || "")
      setBio(found.bio || "")
      setQuote(found.quote || "")
      setInstagram(found.instagram || "")
      setFoto(found.foto || null)
      setKeahlian(
        Array.isArray(found.keahlian)
          ? found.keahlian
          : typeof found.keahlian === "string"
          ? found.keahlian.split(",").map((s: string) => s.trim())
          : []
      )
      setJumlahSesi(found.jumlahSesi || found.jumlah_sesi || 0)
      setTanggalBergabung(found.tanggalBergabung || "Terdaftar di DB")
    }

    if (foundItem) {
      applyData(foundItem)
      setLoading(false)
    } else {
      // Fallback: Fetch directly from backend DB by ID
      psikologService
        .getBySlug(psikologId)
        .then((dbData: any) => {
          if (dbData && (dbData.id || dbData.nama_gelar)) {
            applyData(dbData)
          } else {
            setNotFound(true)
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false))
    }
  }, [psikologId])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFoto(url)
    }
  }

  const getActivationUrl = (tok: string) => {
    return typeof window !== "undefined"
      ? `${window.location.origin}/set-password?token=${tok}`
      : `https://empathika.id/set-password?token=${tok}`
  }

  const currentActivationUrl = activationToken ? getActivationUrl(activationToken) : ""

  const handleGenerateToken = () => {
    const newToken = `act_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    setActivationToken(newToken)
    setTokenExpiredAt(newExpiry)
    setIsCopied(false)
    return { token: newToken, expiry: newExpiry }
  }

  const handleRegenerateToken = () => {
    handleGenerateToken()
  }

  const handleCopyLink = () => {
    if (!currentActivationUrl) return
    navigator.clipboard.writeText(currentActivationUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleKirimWA = () => {
    // 1. Pertahankan token yang sudah ada jika belum kedaluwarsa.
    // Hanya buat token baru jika belum pernah dibuat sama sekali atau sudah kedaluwarsa (> 7 hari).
    let activeToken = activationToken
    if (!activeToken || isTokenExpired) {
      const generated = handleGenerateToken()
      activeToken = generated.token
    }
    const finalActivationUrl = getActivationUrl(activeToken)

    const rawPhone = noTelepon.trim().replace(/[^0-9]/g, "")
    const waNumber = rawPhone
      ? rawPhone.startsWith("0")
        ? "62" + rawPhone.slice(1)
        : rawPhone.startsWith("62")
        ? rawPhone
        : "62" + rawPhone
      : ""

    const namaText = nama.trim() || "Tenaga Ahli"
    const katText =
      kategori === "psikolog"
        ? "Psikolog Klinis"
        : kategori === "konselor"
        ? "Konselor Kesehatan Mental"
        : "Peer Konselor"

    const pesan =
      `Halo *${namaText}*, berikut adalah tautan resmi dari Tim Empathika untuk mengatur kata sandi atau mengaktifkan akun Tenaga Ahli (${katText}) Anda: 🌿\n\n` +
      `🔗 ${finalActivationUrl}\n\n` +
      `Catatan: Tautan ini berlaku selama 7 hari demi keamanan akun Anda. Jangan bagikan tautan ini ke siapa pun.\n\n` +
      `Salam hangat,\n*Tim Empathika*`

    const waUrl = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(pesan)}`

    window.open(waUrl, "_blank")
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    const parts = newSkill
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !keahlian.includes(s))

    if (parts.length > 0) {
      setKeahlian([...keahlian, ...parts])
    }
    setNewSkill("")
  }

  const handleRemoveSkill = (skill: string) => {
    setKeahlian(keahlian.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi form tenaga ahli
    const formErrors = validateTenagaAhliForm({
      email,
      noTelepon,
      noStr,
      noSipp,
      kategori,
    })

    if (Object.keys(formErrors).length > 0) {
      setTouched({
        email: true,
        noTelepon: true,
        noStr: true,
        noSipp: true,
      })
      setFormErrorAlert("Format data belum sesuai. Silakan periksa kolom yang bertanda merah di bawah.")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setFormErrorAlert(null)
    setIsSubmitting(true)

    const isPsikolog = kategori === "psikolog"
    const updatedTenaga: TenagaAhli = {
      id: psikologId,
      nama: nama.trim(),
      email: email.trim(),
      password: password.trim(),
      noTelepon: noTelepon.trim(),
      kategori,
      statusAkses,
      spesialisasi:
        spesialisasi.trim() ||
        (isPsikolog
          ? "Psikolog Klinis"
          : kategori === "konselor"
          ? "Konselor Kesehatan Mental"
          : "Peer Konselor"),
      noStr: isPsikolog ? noStr.trim() : undefined,
      noSipp: isPsikolog ? noSipp.trim() : undefined,
      pendidikanText: pendidikanText.trim(),
      jumlahSesi,
      bio: bio.trim(),
      quote: quote.trim(),
      instagram: instagram.trim(),
      foto,
      keahlian,
      tanggalBergabung,
      tokenAktivasi: activationToken || undefined,
      tokenExpiredAt: tokenExpiredAt || undefined,
    }

    try {
      // 1. Simpan perubahan ke backend database
      await psikologService.createPsikologBaru(updatedTenaga)
    } catch (err) {
      console.warn("Gagal update ke backend database:", err)
    }

    try {
      // 2. Simpan juga ke cache lokal
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const updatedList = list.map((item) => (item.id === psikologId ? updatedTenaga : item))
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(updatedList))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"))
      }
    } catch {
      // fallback
    } finally {
      setIsSubmitting(false)
    }

    router.push("/admin/psikolog")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm">
        Memuat data tenaga ahli...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-center font-poppins gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Data Tidak Ditemukan</h3>
          <p className="text-sm text-gray-500">Tenaga ahli dengan ID tersebut tidak ditemukan.</p>
        </div>
        <Link
          href="/admin/psikolog"
          className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 transition active:scale-95 cursor-pointer"
        >
          Kembali ke Data Psikolog
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6 font-poppins pb-16">
      {/* Header Halaman (Sesuai Pola Tambah Psikolog & Event) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/psikolog"
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Edit Data Tenaga Ahli
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Perbarui akun login, data profil profesional, legalitas, dan izin akses web.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Alert jika ada error validasi */}
        {formErrorAlert && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-700 shadow-sm animate-fadeIn">
            <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-red-800">Periksa Kembali Data Anda</p>
              <p className="text-xs text-red-600 mt-0.5">{formErrorAlert}</p>
            </div>
          </div>
        )}

        {/* KARTU 1: PENGATURAN AKUN LOGIN & HAK AKSES */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Akun Login & Hak Akses Web
            </h3>
            <p className="text-xs text-gray-500">
              Admin utama menentukan email dan kata sandi login serta izin akses portal psikolog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Login <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (formErrorAlert) setFormErrorAlert(null)
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                required
                placeholder="contoh: psikolog@gmail.com"
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-gray-800 transition focus:outline-none ${
                  emailError
                    ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                    : "border-gray-200 focus:border-[#561269]"
                }`}
              />
              {emailError ? (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{emailError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Wajib menggunakan email akun Gmail (harus mengandung @gmail.com).
                </p>
              )}
            </div>

            {/* Tautan Aktivasi / Reset Kata Sandi Langsung di Halaman Edit */}
            <div
              className={`rounded-2xl border p-4 space-y-2.5 transition-colors ${
                activationToken && isTokenExpired
                  ? "border-amber-300 bg-amber-50/70"
                  : "border-purple-200/80 bg-purple-50/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs font-bold text-[#561269] flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tautan Aktivasi / Reset Akun (7 Hari)
                </label>
                {activationToken ? (
                  <button
                    type="button"
                    onClick={handleRegenerateToken}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#561269] hover:text-purple-950 bg-white border border-purple-200 hover:bg-purple-100/60 px-2.5 py-1 rounded-xl transition active:scale-95 cursor-pointer shadow-2xs"
                    title="Buat ulang token aktivasi baru"
                  >
                    <svg className="w-3.5 h-3.5 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generate Ulang Link
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateToken}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#561269] hover:text-purple-950 bg-white border border-purple-200 hover:bg-purple-100/60 px-2.5 py-1 rounded-xl transition active:scale-95 cursor-pointer shadow-2xs"
                    title="Buat tautan aktivasi sekarang"
                  >
                    <svg className="w-3.5 h-3.5 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Generate Tautan
                  </button>
                )}
              </div>

              {/* Input Link Display & Tombol Salin */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={currentActivationUrl}
                  placeholder="Belum di-generate (klik 'Generate Tautan' atau 'Kirim WA')"
                  className="flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-mono text-purple-950 placeholder:text-gray-400 placeholder:font-sans focus:outline-none select-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={!activationToken}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition shadow-2xs ${
                    activationToken
                      ? "bg-white border-purple-200 text-[#561269] hover:bg-purple-50 active:scale-95 cursor-pointer"
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isCopied ? "✓ Tersalin!" : "Salin"}
                </button>
              </div>

              {/* Baris Keterangan Masa Berlaku & Tombol WhatsApp */}
              <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                <div>
                  {activationToken ? (
                    isTokenExpired ? (
                      <p className="text-[11px] font-medium text-amber-800 flex items-center gap-1">
                        <span>⚠️</span> Tautan telah kedaluwarsa{tokenExpiredAt ? ` (${formatExpiryDate(tokenExpiredAt)})` : ""}. Klik &quot;Generate Ulang Link&quot;.
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                        <span>✓</span> Tautan aktif &bull; Berlaku hingga {formatExpiryDate(tokenExpiredAt) || "7 hari ke depan"}.
                      </p>
                    )
                  ) : (
                    <p className="text-[10px] text-gray-500">
                      Tautan otomatis dibuat saat klik &quot;Kirim WA&quot; atau &quot;Generate Tautan&quot;.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleKirimWA}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Kirim WA
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Izin Hak Akses Web
              </label>
              <div className="relative">
                <select
                  value={statusAkses}
                  onChange={(e) => setStatusAkses(e.target.value as StatusAkses)}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-800 focus:border-[#561269] focus:outline-none cursor-pointer"
                >
                  <option value="AKTIF">Beri Akses (Aktif)</option>
                  <option value="NONAKTIF">Hapus Akses (Nonaktif)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 2: PROFIL UTAMA & IDENTITAS */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Profil Utama & Identitas
            </h3>
            <p className="text-xs text-gray-500">
              Informasi identitas profesional yang tampil pada sistem dan layanan konsultasi.
            </p>
          </div>

          {/* Upload Foto Profil */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Foto Profil
            </label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                {foto ? (
                  <Image src={foto} alt="Preview" fill className="object-cover" />
                ) : (
                  <span className="text-xs text-[#561269] font-bold">Foto</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold text-[#561269] hover:bg-purple-100 transition cursor-pointer"
                >
                  {foto ? "Ganti Foto" : "Unggah Foto"}
                </button>
                {foto && (
                  <button
                    type="button"
                    onClick={() => setFoto(null)}
                    className="rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                placeholder="contoh: Dr. Jane Doe, M.Psi., Psikolog"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                No. Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={noTelepon}
                onChange={(e) => {
                  setNoTelepon(e.target.value)
                  if (formErrorAlert) setFormErrorAlert(null)
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, noTelepon: true }))}
                required
                placeholder="contoh: 081234567890"
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-gray-800 transition focus:outline-none ${
                  noTeleponError
                    ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                    : "border-gray-200 focus:border-[#561269]"
                }`}
              />
              {noTeleponError ? (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{noTeleponError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Wajib diawali dengan 08 (contoh: 081234567890, 10-14 digit angka).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kategori Profesi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriTenaga)}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-800 focus:border-[#561269] focus:outline-none cursor-pointer"
                >
                  <option value="psikolog">Psikolog</option>
                  <option value="konselor">Konselor</option>
                  <option value="peer-konselor">Peer Konselor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Spesialisasi Fokus
              </label>
              <input
                type="text"
                value={spesialisasi}
                onChange={(e) => setSpesialisasi(e.target.value)}
                placeholder="contoh: Psikolog Klinis Dewasa / Hubungan & Pasangan"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 3: LEGALITAS (STR & SIPP) & PENDIDIKAN */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Legalitas Profesi & Pendidikan
            </h3>
            <p className="text-xs text-gray-500">
              Kredensial hukum wajib diisi bagi tenaga dengan profesi Psikolog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor STR (Surat Tanda Registrasi) {kategori === "psikolog" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={noStr}
                onChange={(e) => {
                  setNoStr(e.target.value)
                  if (formErrorAlert) setFormErrorAlert(null)
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, noStr: true }))}
                disabled={kategori !== "psikolog"}
                placeholder={kategori === "psikolog" ? "contoh: STR-8921-2023" : "Hanya untuk psikolog"}
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 ${
                  noStrError
                    ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                    : "border-gray-200 focus:border-[#561269]"
                }`}
              />
              {noStrError ? (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{noStrError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Format resmi wajib diawali dengan &apos;STR&apos; (contoh: STR-8921-2023).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor SIPP (Surat Izin Praktik Psikologi) {kategori === "psikolog" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={noSipp}
                onChange={(e) => {
                  setNoSipp(e.target.value)
                  if (formErrorAlert) setFormErrorAlert(null)
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, noSipp: true }))}
                disabled={kategori !== "psikolog"}
                placeholder={kategori === "psikolog" ? "contoh: SIPP-1049-2024" : "Hanya untuk psikolog"}
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 ${
                  noSippError
                    ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                    : "border-gray-200 focus:border-[#561269]"
                }`}
              />
              {noSippError ? (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{noSippError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Format resmi wajib diawali dengan &apos;SIPP&apos; (contoh: SIPP-1049-2024).
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Riwayat Pendidikan Terakhir
              </label>
              <input
                type="text"
                value={pendidikanText}
                onChange={(e) => setPendidikanText(e.target.value)}
                placeholder="contoh: Magister Psikologi Profesi Klinis - Universitas Indonesia"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 4: BIO, KUTIPAN, & MEDIA SOSIAL */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Bio, Kutipan & Media Sosial
            </h3>
            <p className="text-xs text-gray-500">
              Teks pengenalan diri serta kutipan motivasi yang tampil di laman konseling klien.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kutipan / Quote Inspiratif
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="contoh: Setiap cerita layak didengar dan dipahami dengan penuh empati."
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Bio Lengkap
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan latar belakang singkat dan pendekatan terapi..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="contoh: @dr.janedoe"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 5: KEAHLIAN & TOPIK KONSELING */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Keahlian & Topik Konseling
            </h3>
            <p className="text-xs text-gray-500">
              Tambahkan tag topik keahlian (contoh: Trauma Healing, Relasi, Depresi).
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 max-w-lg">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                placeholder="Tambah topik (contoh: Kecemasan, Manajemen Stres)"
                className="flex-1 min-w-0 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-[#561269] focus:outline-none shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
              >
                Tambah
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {keahlian.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#561269]"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(item)}
                    className="text-gray-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/psikolog"
            className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isSubmitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  )
}
