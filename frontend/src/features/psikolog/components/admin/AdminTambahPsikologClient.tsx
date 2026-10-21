"use client"

import { useState, useRef } from "react"
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

export default function AdminTambahPsikologClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [noTelepon, setNoTelepon] = useState("")

  // State Tautan Aktivasi & Token WhatsApp (null di awal, di-generate nanti)
  const [activationToken, setActivationToken] = useState<string | null>(null)
  const [tokenExpiredAt, setTokenExpiredAt] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
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

  const isPsikolog = kategori === "psikolog"

  // Validation States
  const [touched, setTouched] = useState<TouchedFields>({})
  const [formErrorAlert, setFormErrorAlert] = useState<string | null>(null)

  // Derived error messages
  const emailError = touched.email ? validateEmail(email) : null
  const noTeleponError = touched.noTelepon ? validateNoTelepon(noTelepon) : null
  const noStrError = touched.noStr ? validateNoStr(noStr, kategori) : null
  const noSippError = touched.noSipp ? validateNoSipp(noSipp, kategori) : null

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
    return newToken
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
    let activeToken = activationToken
    if (!activeToken) {
      activeToken = handleGenerateToken()
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
      `Halo *${namaText}*, selamat bergabung di Empathika! 🌿\n\n` +
      `Akun Anda telah didaftarkan sebagai Tenaga Ahli (${katText}). ` +
      `Silakan klik tautan resmi di bawah ini untuk membuat kata sandi Anda dan mengaktifkan akun:\n\n` +
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

    // Pastikan token aktivasi sudah ter-generate saat form disubmit
    const effectiveToken = activationToken || handleGenerateToken()
    const effectiveExpiry = tokenExpiredAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const newTenaga: TenagaAhli = {
      id: Date.now().toString(),
      nama: nama.trim(),
      email: email.trim(),
      password: "", // Kata sandi dibuat mandiri oleh tenaga ahli via WhatsApp
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
      jumlahSesi: 0,
      bio: bio.trim(),
      quote: quote.trim(),
      instagram: instagram.trim(),
      foto,
      keahlian,
      tanggalBergabung: "Baru terdaftar",
      tokenAktivasi: effectiveToken,
      tokenExpiredAt: effectiveExpiry,
    }

    try {
      // 1. Simpan langsung ke database PostgreSQL melalui backend
      const result = await psikologService.createPsikologBaru(newTenaga)
      if (result && result.id) {
        newTenaga.id = result.id
      }
    } catch (err) {
      console.warn("Gagal menyimpan ke DB backend, data tetap disimpan lokal:", err)
    }

    try {
      // 2. Simpan juga ke cache lokal
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const updated = [newTenaga, ...list]
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(updated))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"))
      }
    } catch {
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify([newTenaga]))
    } finally {
      setIsSubmitting(false)
    }

    setIsSuccessModalOpen(true)
  }

  return (
    <div className="w-full flex flex-col gap-6 font-poppins pb-16">
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
              Tambah Tenaga Ahli Baru
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Daftarkan akun baru, atur email & password awal login, dan tentukan izin akses web.
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
              Admin utama menentukan email dan kata sandi awal agar tenaga ahli dapat masuk ke web psikolog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Login <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (formErrorAlert) setFormErrorAlert(null)
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="contoh: psikolog@gmail.com"
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-gray-800 transition focus:outline-none ${emailError
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

            {/* Tautan Aktivasi & Generate Ulang Link Langsung di Halaman */}
            <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs font-bold text-[#561269] flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tautan Aktivasi Akun (7 Hari)
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

              {/* Baris Keterangan */}
              <div className="pt-0.5">
                <p className="text-[10px] text-gray-500">
                  {activationToken
                    ? "Tautan siap digunakan. Tenaga ahli membuat kata sandi mandiri via tautan ini."
                    : "Tautan otomatis dibuat saat data tenaga ahli disimpan."}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Klasifikasi Profesi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriTenaga)}
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
                Hak Akses Web <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={statusAkses}
                  onChange={(e) => setStatusAkses(e.target.value as StatusAkses)}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none font-medium cursor-pointer"
                >
                  <option value="AKTIF">Beri Akses (Langsung Aktif)</option>
                  <option value="NONAKTIF">Hapus Akses (Belum Aktif)</option>
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

        {/* KARTU 2: KREDENSIAL STR & SIPP (KONDISIONAL HANYA JIKA PSIKOLOG) */}
        {kategori === "psikolog" && (
          <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 sm:p-8 space-y-4">
            <div className="border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-[#561269]">
                Legalitas Praktik Psikolog
              </h3>
              <p className="text-xs text-gray-600">
                Karena kategori yang dipilih adalah Psikolog, cantumkan nomor STR dan SIPP resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor STR (Surat Tanda Registrasi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={kategori === "psikolog"}
                  value={noStr}
                  onChange={(e) => {
                    setNoStr(e.target.value)
                    if (formErrorAlert) setFormErrorAlert(null)
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, noStr: true }))}
                  placeholder="Contoh: STR-8921-2023"
                  className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${noStrError
                      ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                      : "border-gray-300 focus:border-[#561269]"
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
                  <p className="text-[11px] text-purple-600/70 mt-1">
                    Format resmi wajib diawali dengan &apos;STR&apos; (contoh: STR-8921-2023).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor SIPP (Surat Izin Praktik Psikologi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={kategori === "psikolog"}
                  value={noSipp}
                  onChange={(e) => {
                    setNoSipp(e.target.value)
                    if (formErrorAlert) setFormErrorAlert(null)
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, noSipp: true }))}
                  placeholder="Contoh: SIPP-1049-2024"
                  className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${noSippError
                      ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                      : "border-gray-300 focus:border-[#561269]"
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
                  <p className="text-[11px] text-purple-600/70 mt-1">
                    Format resmi wajib diawali dengan &apos;SIPP&apos; (contoh: SIPP-1049-2024).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KARTU 3: INFORMASI PROFIL & BIODATA */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">
              Data Profil & Kontak
            </h3>
            <p className="text-xs text-gray-500">
              Data biodata yang dapat dipantau admin utama dan diedit juga oleh psikolog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Anindita Sari, M.Psi., Psikolog"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noTelepon}
                onChange={(e) => {
                  setNoTelepon(e.target.value)
                  if (formErrorAlert) setFormErrorAlert(null)
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, noTelepon: true }))}
                placeholder="081234567890"
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-gray-800 transition focus:outline-none ${noTeleponError
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
                Spesialisasi Bidang
              </label>
              <input
                type="text"
                value={spesialisasi}
                onChange={(e) => setSpesialisasi(e.target.value)}
                placeholder="Contoh: Hubungan Keluarga, Kecemasan, Remaja"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Riwayat Pendidikan
              </label>
              <input
                type="text"
                value={pendidikanText}
                onChange={(e) => setPendidikanText(e.target.value)}
                placeholder="Contoh: S2 Psikologi - Universitas Indonesia"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Bio Profil
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Deskripsi singkat mengenai pendekatan konseling..."
                className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 focus:border-[#561269] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Quote Diri
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Prinsip konseling..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm italic text-gray-800 focus:border-[#561269] focus:outline-none"
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
                placeholder="@username"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            {/* Foto Profil Unggah yang Lebih Besar & Jelas */}
            <div className="sm:col-span-2 pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Foto Profil Tenaga Ahli
              </label>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-purple-50/40 border border-purple-100">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white shrink-0 border-2 border-purple-200 shadow-sm flex items-center justify-center">
                  {foto ? (
                    <Image src={foto} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                      <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[11px] font-semibold text-[#561269]">Pratinjau Foto</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-xs font-medium text-gray-700">
                    Unggah pas foto formal atau foto profil profesional tenaga ahli.
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Format gambar JPG, PNG, atau WEBP rasio 1:1. Maksimal ukuran file 2MB.
                  </p>
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
                      className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      {foto ? "Ganti Foto" : "Pilih & Unggah Foto"}
                    </button>
                    {foto && (
                      <button
                        type="button"
                        onClick={() => setFoto(null)}
                        className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 4: KEAHLIAN */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900">
            Topik & Keahlian Konseling
          </h3>
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

          <div className="flex flex-wrap gap-1.5">
            {keahlian.map((k, idx) => (
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

        {/* Bottom Bar */}
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
            {isSubmitting ? "Menyimpan ke Database..." : "Simpan Tenaga Ahli"}
          </button>
        </div>
      </form>

      {/* POP-UP SUKSES SETELAH SIMPAN */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Tenaga Ahli Berhasil Didaftarkan!
                  </h3>
                  <p className="text-xs text-gray-500">
                    Kirimkan tautan aktivasi akun ke kontak WhatsApp tenaga ahli.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false)
                  router.push("/admin/psikolog")
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama Tenaga Ahli:</span>
                <span className="font-bold text-gray-900">{nama || "Tenaga Ahli Baru"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">No. WhatsApp Tujuan:</span>
                <span className="font-mono font-bold text-gray-900">{noTelepon || "-"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Tautan Aktivasi (Berlaku 7 Hari):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={currentActivationUrl}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-purple-950 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  {isCopied ? "✓ Tersalin!" : "Salin"}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleKirimWA}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Kirim Tautan ke WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false)
                  router.push("/admin/psikolog")
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
              >
                Selesai & Lihat Daftar Tenaga Ahli
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
