"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, KategoriTenaga, StatusAkses } from "../../types"
import { INITIAL_TENAGA_AHLI, LOCAL_STORAGE_KEY_TENAGA } from "../../data/initialData"
import { psikologService } from "@/services/psikolog.service"

interface Props {
  psikologId: string
}

export default function AdminDetailPsikologClient({ psikologId }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [item, setItem] = useState<TenagaAhli | null>(null)
  const [form, setForm] = useState<TenagaAhli | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [activationToken, setActivationToken] = useState<string | null>(null)
  const [tokenExpiredAt, setTokenExpiredAt] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  // Cek apakah token aktivasi sudah kedaluwarsa (3 hari)
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

  useEffect(() => {
    let found: TenagaAhli | null = null
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      found = list.find((d) => d.id === psikologId) || null
    } catch {}

    if (found) {
      setItem(found)
      setForm(found)
      if (found.tokenAktivasi) {
        setActivationToken(found.tokenAktivasi)
      }
      if (found.tokenExpiredAt || (found as any).token_expired_at) {
        setTokenExpiredAt(found.tokenExpiredAt || (found as any).token_expired_at)
      }
    } else {
      psikologService
        .getBySlug(psikologId)
        .then((dbData: any) => {
          if (dbData && (dbData.id || dbData.nama_gelar)) {
            const kat = (dbData.kategori || "").toLowerCase()
            const mapped: TenagaAhli = {
              id: dbData.id,
              nama: dbData.nama_gelar || dbData.account?.nama || "Tenaga Ahli",
              email: dbData.account?.email || "",
              noTelepon: dbData.account?.no_telepon || "",
              kategori: kat.includes("peer")
                ? "peer-konselor"
                : kat.includes("konselor")
                ? "konselor"
                : "psikolog",
              statusAkses: dbData.status === "INACTIVE" ? "NONAKTIF" : "AKTIF",
              spesialisasi: dbData.spesialisasi?.nama || "Psikologi Klinis",
              noStr: dbData.no_str || undefined,
              noSipp: dbData.no_sipp || undefined,
              pendidikanText: dbData.pendidikan || "",
              jumlahSesi: dbData.jumlah_sesi || 0,
              bio: dbData.bio || "",
              quote: dbData.quote || "",
              instagram: dbData.instagram || "",
              foto: dbData.foto || null,
              keahlian: Array.isArray(dbData.keahlian)
                ? dbData.keahlian
                : typeof dbData.keahlian === "string"
                ? dbData.keahlian.split(",").map((s: string) => s.trim())
                : [],
              tanggalBergabung: "Terdaftar di DB",
              tokenAktivasi: dbData.tokenAktivasi || dbData.token_aktivasi || undefined,
              tokenExpiredAt: dbData.tokenExpiredAt || dbData.token_expired_at || undefined,
            }
            setItem(mapped)
            setForm(mapped)
            if (mapped.tokenAktivasi) {
              setActivationToken(mapped.tokenAktivasi)
            }
            if (mapped.tokenExpiredAt) {
              setTokenExpiredAt(mapped.tokenExpiredAt)
            }
          } else {
            setNotFound(true)
          }
        })
        .catch(() => {
          setNotFound(true)
        })
    }
  }, [psikologId])

  if (notFound) {
    return (
      <div className="p-12 text-center text-sm text-gray-500 font-poppins bg-white rounded-3xl border border-gray-100">
        <p className="text-base font-bold text-gray-800 mb-2">Data Tenaga Ahli Tidak Ditemukan</p>
        <p className="text-xs text-gray-500 mb-4">Tenaga ahli dengan ID tersebut belum terdaftar di database.</p>
        <Link
          href="/admin/psikolog"
          className="inline-block px-5 py-2 rounded-full bg-[#561269] text-white text-xs font-semibold"
        >
          Kembali ke Daftar Tenaga Ahli
        </Link>
      </div>
    )
  }

  if (!form || !item) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 font-poppins">
        Memuat data tenaga ahli...
      </div>
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setForm((prev) => (prev ? { ...prev, foto: url } : prev))
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
    const newExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
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
    // Hanya buat token baru jika belum pernah dibuat sama sekali atau sudah kedaluwarsa (> 3 hari).
    let activeToken = activationToken
    if (!activeToken || isTokenExpired) {
      const generated = handleGenerateToken()
      activeToken = generated.token
    }
    const finalActivationUrl = getActivationUrl(activeToken)

    const rawPhone = (form?.noTelepon || "").trim().replace(/[^0-9]/g, "")
    const waNumber = rawPhone
      ? rawPhone.startsWith("0")
        ? "62" + rawPhone.slice(1)
        : rawPhone.startsWith("62")
        ? rawPhone
        : "62" + rawPhone
      : ""

    const namaText = form?.nama.trim() || "Tenaga Ahli"
    const katText =
      form?.kategori === "psikolog"
        ? "Psikolog Klinis"
        : form?.kategori === "konselor"
        ? "Konselor Kesehatan Mental"
        : "Peer Konselor"

    const pesan =
      `Halo *${namaText}*, berikut adalah tautan resmi dari Tim Empathika untuk mengatur kata sandi atau mengaktifkan akun Tenaga Ahli (${katText}) Anda: 🌿\n\n` +
      `🔗 ${finalActivationUrl}\n\n` +
      `Catatan: Tautan ini berlaku selama 3 hari demi keamanan akun Anda. Jangan bagikan tautan ini ke siapa pun.\n\n` +
      `Salam hangat,\n*Tim Empathika*`

    const waUrl = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(pesan)}`

    window.open(waUrl, "_blank")
  }

  const handleAddSkill = () => {
    if (!newSkill.trim() || !form) return
    const current = form.keahlian || []
    const parts = newSkill
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !current.includes(s))

    if (parts.length > 0) {
      setForm({ ...form, keahlian: [...current, ...parts] })
    }
    setNewSkill("")
  }

  const handleRemoveSkill = (skill: string) => {
    if (!form) return
    setForm({
      ...form,
      keahlian: (form.keahlian || []).filter((s) => s !== skill),
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    const dataToSave = {
      ...form,
      tokenAktivasi: activationToken || undefined,
      tokenExpiredAt: tokenExpiredAt || undefined,
    }

    // 1. Simpan pembaruan ke Database PostgreSQL backend
    try {
      await psikologService.createPsikologBaru(dataToSave)
    } catch (err: any) {
      console.warn("Gagal update ke backend database:", err?.message || err)
    }

    // 2. Simpan juga ke cache lokal & picu event sinkronisasi
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const updated = list.map((d) => (d.id === form.id ? dataToSave : d))
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(updated))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"))
      }
      setItem(dataToSave)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    } catch {
      // fallback
    }
  }

  const initials = form.nama
    ? form.nama
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "PS"

  return (
    <div className="w-full space-y-6 font-poppins pb-16">
      {/* Toast Alert */}
      {showNotification && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl">
          <p className="text-sm font-medium">Data profil berhasil diperbarui oleh Admin Utama.</p>
        </div>
      )}

      {/* Header Halaman */}
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
              Detail & Kelola Profil Tenaga Ahli
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Pantau dan sesuaikan data profil serta izin akses akun {form.nama}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${form.statusAkses === "AKTIF"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600"
              }`}
          >
            {form.statusAkses === "AKTIF" ? "Akses Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* KARTU 1: FOTO & IDENTITAS UTAMA (MIRIP PENGATURAN PROFIL PSIKOLOG) */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-28 w-28 rounded-3xl overflow-hidden bg-purple-100 border border-purple-200 shrink-0 flex items-center justify-center">
              {form.foto ? (
                <Image src={form.foto} alt={form.nama} fill className="object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#561269]">{initials}</span>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-gray-900">{form.nama}</h3>
                <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-[#561269] capitalize">
                  {form.kategori.replace("-", " ")}
                </span>
              </div>
              <p className="text-xs text-gray-500">{form.spesialisasi}</p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-[#561269] hover:bg-purple-100 transition cursor-pointer"
                >
                  {form.foto ? "Ubah Foto" : "Unggah Foto"}
                </button>
                {form.foto && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => (prev ? { ...prev, foto: null } : prev))}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 2: AKUN LOGIN & STATUS HAK AKSES */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Akun Login & Hak Akses Web
            </h3>
            <p className="text-xs text-gray-500">
              Admin utama dapat memantau email, mengatur password login, serta memberi atau menghapus izin akses web.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Login
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            {/* Tautan Aktivasi / Reset Kata Sandi */}
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
                  Tautan Aktivasi Akun (3 Hari)
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
                        <span>✓</span> Tautan aktif &bull; Berlaku hingga {formatExpiryDate(tokenExpiredAt) || "3 hari ke depan"}.
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
                Hak Akses Web
              </label>
              <div className="relative">
                <select
                  name="statusAkses"
                  value={form.statusAkses}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-800 focus:border-[#561269] focus:outline-none cursor-pointer"
                >
                  <option value="AKTIF">Beri Akses (Aktif)</option>
                  <option value="NONAKTIF">Hapus Akses (Nonaktif)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 3: KREDENSIAL PROFESI & STR/SIPP */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Kredensial & Spesialisasi
            </h3>
            <p className="text-xs text-gray-500">
              Klasifikasi profesi serta nomor legalitas STR & SIPP (khusus psikolog).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Klasifikasi Profesi
              </label>
              <div className="relative">
                <select
                  name="kategori"
                  value={form.kategori}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-2xl border border-purple-200 bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-[#561269] focus:border-[#561269] focus:outline-none cursor-pointer"
                >
                  <option value="psikolog">Psikolog (Perlu STR & SIPP)</option>
                  <option value="konselor">Konselor (Tanpa STR/SIPP)</option>
                  <option value="peer-konselor">Peer Konselor (Tanpa STR/SIPP)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Spesialisasi Utama
              </label>
              <input
                type="text"
                name="spesialisasi"
                value={form.spesialisasi || ""}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor Telepon
              </label>
              <input
                type="text"
                name="noTelepon"
                value={form.noTelepon}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            {form.kategori === "psikolog" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nomor STR <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="noStr"
                    value={form.noStr || ""}
                    onChange={handleInputChange}
                    placeholder="STR-xxxx"
                    className="w-full rounded-2xl border border-purple-200 px-4 py-2.5 text-sm font-mono text-gray-800 focus:border-[#561269] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nomor SIPP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="noSipp"
                    value={form.noSipp || ""}
                    onChange={handleInputChange}
                    placeholder="SIPP-xxxx"
                    className="w-full rounded-2xl border border-purple-200 px-4 py-2.5 text-sm font-mono text-gray-800 focus:border-[#561269] focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 rounded-2xl border border-gray-200 bg-gray-50/70 p-3 text-xs text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Kategori {form.kategori === "konselor" ? "Konselor" : "Peer Konselor"} tidak memerlukan nomor STR dan SIPP.</span>
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Pendidikan & Institusi
              </label>
              <input
                type="text"
                name="pendidikanText"
                value={form.pendidikanText || ""}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 4: BIODATA, QUOTE & KEAHLIAN */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">
              Bio Profil & Keahlian
            </h3>
            <p className="text-xs text-gray-500">
              Informasi yang ditampilkan kepada klien di halaman web.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 focus:border-[#561269] focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Quote
                </label>
                <input
                  type="text"
                  name="quote"
                  value={form.quote || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm italic text-gray-800 focus:border-[#561269] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={form.instagram || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
                />
              </div>
            </div>

            {/* Keahlian Tags */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-gray-700">
                Topik Keahlian Konseling
              </label>
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

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(form.keahlian || []).map((k, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs text-gray-700"
                  >
                    {k}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(k)}
                      className="text-gray-400 hover:text-gray-700 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/psikolog"
            className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            Kembali
          </Link>
          <button
            type="submit"
            className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-8 py-2.5 text-xs sm:text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}
