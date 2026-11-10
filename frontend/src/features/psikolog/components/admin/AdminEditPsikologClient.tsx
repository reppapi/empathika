"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, KategoriTenaga, StatusAkses } from "../../types"
import { LOCAL_STORAGE_KEY_TENAGA } from "../../data/initialData"
import { psikologService } from "@/services/psikolog.service"
import { processAndUploadImage } from "@/lib/imageCompressor"
import GenerateActivationLinkButton from "./GenerateActivationLinkButton"
import {
  validateEmail,
  validateNoTelepon,
  validateNoStr,
  validateNoSipp,
  validateNoSilp,
  validateTenagaAhliForm,
  TouchedFields,
} from "../../utils/tenagaAhliValidation"

interface Props {
  psikologId: string
}

export default function AdminEditPsikologClient({ psikologId }: Props) {
  const router = useRouter()
  const params = useParams()
  const effectiveId = psikologId || (params?.id as string) || ""
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
  const [realAccountId, setRealAccountId] = useState<string>("")
  const [accountAktif, setAccountAktif] = useState(false)
  const [activationToken, setActivationToken] = useState<string | null>(null)
  const [tokenExpiredAt, setTokenExpiredAt] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [kategori, setKategori] = useState<KategoriTenaga>("psikolog")
  const [statusAkses, setStatusAkses] = useState<StatusAkses>("AKTIF")
  const [spesialisasi, setSpesialisasi] = useState("")
  const [noStr, setNoStr] = useState("")
  const [noSipp, setNoSipp] = useState("")
  const [noSilp, setNoSilp] = useState("")
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
  const noSippError = touched.noSipp ? validateNoSipp(noSipp, kategori, noSilp) : null
  const noSilpError = touched.noSilp ? validateNoSilp(noSilp, kategori, noSipp) : null

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

  // Load existing data (riwayat isian sebelumnya lengkap)
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const loadData = async () => {
      const cleanId = (effectiveId || "").trim()
      const decodedId = decodeURIComponent(cleanId)

      // 1. Cek dulu di localStorage
      let localData: any = null
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
        const list: any[] = saved ? JSON.parse(saved) : []
        localData = list.find(
          (d) =>
            String(d.id).trim() === cleanId ||
            String(d.id).trim() === decodedId ||
            (d.account?.id && String(d.account.id).trim() === cleanId)
        )
      } catch {}

      // 2. Coba fetch dari backend DB
      let backendData: any = null
      if (cleanId) {
        try {
          backendData = await psikologService.getBySlug(cleanId)
        } catch {
          try {
            const allDb: any[] = await psikologService.getList({ status: "ALL" })
            if (Array.isArray(allDb)) {
              backendData = allDb.find(
                (p) =>
                  String(p.id).trim() === cleanId ||
                  String(p.id).trim() === decodedId ||
                  (p.account?.id && String(p.account.id).trim() === cleanId) ||
                  (localData?.email && p.account?.email?.toLowerCase() === localData.email.toLowerCase())
              )
            }
          } catch {}
        }
      }

      if (!isMounted) return

      const candidate = backendData || localData

      if (!candidate) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const pick = (...vals: any[]) => {
        for (const v of vals) {
          if (v !== undefined && v !== null && String(v).trim() !== "") {
            return v
          }
        }
        return ""
      }

      const namaVal = pick(
        backendData?.nama_gelar,
        backendData?.account?.nama,
        localData?.nama,
        localData?.nama_gelar
      )

      const emailVal = pick(
        backendData?.account?.email,
        backendData?.email,
        localData?.email,
        localData?.account?.email
      )

      const teleponVal = pick(
        backendData?.account?.no_telepon,
        backendData?.no_telepon,
        localData?.noTelepon,
        localData?.account?.no_telepon
      )

      const spesialisasiVal = pick(
        backendData?.spesialisasi?.nama,
        backendData?.spesialisasi,
        localData?.spesialisasi
      )

      const noStrVal = pick(
        backendData?.no_str,
        backendData?.noStr,
        localData?.noStr,
        localData?.no_str
      )

      const noSippVal = pick(
        backendData?.no_sipp,
        backendData?.noSipp,
        localData?.noSipp,
        localData?.no_sipp
      )

      const noSilpVal = pick(
        backendData?.no_silp,
        backendData?.noSilp,
        localData?.noSilp,
        localData?.no_silp
      )

      const pendidikanVal = pick(
        backendData?.pendidikan,
        backendData?.pendidikanText,
        localData?.pendidikanText,
        localData?.pendidikan
      )

      const bioVal = pick(
        backendData?.bio,
        localData?.bio
      )

      const quoteVal = pick(
        backendData?.quote,
        localData?.quote
      )

      const instagramVal = pick(
        backendData?.instagram,
        localData?.instagram
      )

      const fotoVal = pick(
        backendData?.foto,
        backendData?.account?.foto,
        localData?.foto
      )

      const katRaw = pick(
        backendData?.kategori,
        localData?.kategori
      ).toLowerCase()

      const kategoriVal: KategoriTenaga = katRaw.includes("peer")
        ? "peer-konselor"
        : katRaw.includes("konselor")
        ? "konselor"
        : "psikolog"

      const statusRaw = pick(
        localData?.statusAkses,
        backendData?.status === "INACTIVE" ? "NONAKTIF" : "AKTIF",
        "AKTIF"
      )
      const statusAksesVal: StatusAkses = statusRaw === "NONAKTIF" ? "NONAKTIF" : "AKTIF"

      let keahlianArr: string[] = []
      const keahlianRaw = backendData?.keahlian || localData?.keahlian
      if (Array.isArray(keahlianRaw)) {
        keahlianArr = keahlianRaw
      } else if (typeof keahlianRaw === "string" && keahlianRaw.trim()) {
        keahlianArr = keahlianRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
      }

      const jumlahSesiVal =
        typeof backendData?.jumlah_sesi === "number"
          ? backendData.jumlah_sesi
          : typeof localData?.jumlahSesi === "number"
          ? localData.jumlahSesi
          : 0

      const tokenAktivasiVal = pick(
        backendData?.account?.token_aktivasi,
        backendData?.token_aktivasi,
        backendData?.tokenAktivasi,
        localData?.tokenAktivasi
      )

      const tokenExpiredVal = pick(
        backendData?.account?.token_aktivasi_exp,
        backendData?.token_expired_at,
        backendData?.tokenExpiredAt,
        localData?.tokenExpiredAt
      )

      const passwordVal = pick(
        localData?.password,
        "Psikolog123!"
      )

      const tanggalBergabungVal = pick(
        localData?.tanggalBergabung,
        "Terdaftar di DB"
      )

      setNama(namaVal)
      setEmail(emailVal)
      setNoTelepon(teleponVal)
      setPassword(passwordVal)
      setKategori(kategoriVal)
      setStatusAkses(statusAksesVal)
      setSpesialisasi(spesialisasiVal)
      setNoStr(noStrVal)
      setNoSipp(noSippVal)
      setNoSilp(noSilpVal)
      setPendidikanText(pendidikanVal)
      setBio(bioVal)
      setQuote(quoteVal)
      setInstagram(instagramVal)
      setFoto(fotoVal || null)
      setKeahlian(keahlianArr)
      setJumlahSesi(jumlahSesiVal)
      setTanggalBergabung(tanggalBergabungVal)
      const accId = backendData?.account?.id || backendData?.id_account || backendData?.accountId || localData?.accountId || ""
      if (accId) setRealAccountId(accId)
      const isAktif = Boolean(
        backendData?.accountAktif ||
        backendData?.account?.accountAktif ||
        backendData?.account?.password ||
        (backendData?.account?.aktif && backendData?.account?.password) ||
        (statusAksesVal === "AKTIF" && passwordVal && passwordVal !== "Psikolog123!")
      )
      setAccountAktif(isAktif)
      if (tokenAktivasiVal) setActivationToken(tokenAktivasiVal)
      if (tokenExpiredVal) setTokenExpiredAt(tokenExpiredVal)

      setLoading(false)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [effectiveId])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { url } = await processAndUploadImage(file, "psikolog")
        setFoto(url)
      } catch (err: any) {
        alert(err?.message || "Gagal memproses foto")
      }
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
      noSilp,
      kategori,
    })

    if (Object.keys(formErrors).length > 0) {
      setTouched({
        email: true,
        noTelepon: true,
        noStr: true,
        noSipp: true,
        noSilp: true,
      })
      const errorList = Object.values(formErrors).filter(Boolean)
      const detailMsg = errorList.length > 0 ? errorList.join(" • ") : "Format data belum sesuai."
      setFormErrorAlert(detailMsg)
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
      noSilp: isPsikolog && noSilp.trim() ? noSilp.trim() : undefined,
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
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : []
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
              Ubah Data Tenaga Ahli
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Perbarui profil, akun login, legalitas praktik, dan topik keahlian.
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

        {/* 1. KOLOM PROFIL */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Profil Tenaga Ahli
            </h3>
            <p className="text-xs text-gray-500">
              Foto profil, biodata diri, riwayat pendidikan, dan kontak yang tampil pada sistem layanan.
            </p>
          </div>

          {/* Foto Profil di Bagian Awal */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Foto Profil Tenaga Ahli
            </label>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-purple-50/40 border border-purple-100">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white shrink-0 border-2 border-purple-200 shadow-sm flex items-center justify-center">
                {foto ? (
                  <Image src={foto} alt="Preview Foto" fill className="object-cover" />
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
                  Ubah pas foto formal atau foto profil profesional tenaga ahli.
                </p>
                <p className="text-[11px] text-gray-600 font-medium">
                  Rekomendasi pas foto: <span className="font-bold text-[#561269]">600 × 600 px (rasio 1:1 / 4:3, wajah di tengah)</span>
                </p>
                <p className="text-[11px] text-gray-400">
                  Format JPG, PNG, atau WebP • Bebas ukuran berapa pun, otomatis dikompresi untuk kartu & profil klien
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
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
                  Wajib diawali dengan 08 (10-14 digit angka).
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Riwayat Pendidikan
              </label>
              <textarea
                rows={3}
                value={pendidikanText}
                onChange={(e) => setPendidikanText(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none resize-y min-h-[80px] whitespace-pre-wrap leading-relaxed transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tekan <strong>Enter</strong> untuk membuat baris baru jika memiliki lebih dari satu riwayat pendidikan.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Perkenalan Profil
              </label>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan perkenalan dan pendekatan konseling psikolog... Tekan Enter untuk membuat paragraf baru."
                className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none resize-y min-h-[120px] whitespace-pre-wrap leading-relaxed"
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm italic text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. KOLOM AKUN LOGIN DAN HAK AKSES WAJIB */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Akun Login & Hak Akses Web
            </h3>
            <p className="text-xs text-gray-500">
              Admin utama menentukan email login, pengaturan kata sandi, serta izin akses portal psikolog.
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
                placeholder="contoh: psikolog@empathika.id"
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
                  Gunakan alamat email aktif tenaga ahli untuk pengiriman kredensial login.
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
                  Tautan Aktivasi / Reset Akun (3 Hari)
                </label>
                <GenerateActivationLinkButton
                  accountId={realAccountId}
                  accountAktif={accountAktif}
                  tokenAktivasi={activationToken}
                  tokenExpiredAt={tokenExpiredAt}
                  compact={true}
                  onUpdated={(next) => {
                    if (next.tokenAktivasi !== undefined) setActivationToken(next.tokenAktivasi || null)
                    if (next.tokenExpiredAt !== undefined) setTokenExpiredAt(next.tokenExpiredAt || null)
                    if (next.accountAktif !== undefined) setAccountAktif(next.accountAktif)
                    setIsCopied(false)
                  }}
                  onRefreshFromServer={async () => {
                    if (effectiveId) {
                      try {
                        const res = await psikologService.getById(effectiveId)
                        const db = res?.data || res
                        if (db) {
                          const tok = db.account?.token_aktivasi || db.token_aktivasi || db.tokenAktivasi
                          const exp = db.account?.token_aktivasi_exp || db.token_expired_at || db.tokenExpiredAt
                          if (tok) setActivationToken(tok)
                          if (exp) setTokenExpiredAt(exp)
                        }
                      } catch {}
                    }
                  }}
                />
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

              {/* Baris Keterangan Masa Berlaku */}
              <div className="pt-0.5">
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
                    Tautan otomatis dibuat saat klik &quot;Generate Tautan&quot; atau saat perubahan disimpan.
                  </p>
                )}
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
                  <option value="psikolog">Psikolog (Perlu STR, SIPP & SILP)</option>
                  <option value="konselor">Konselor (Tanpa STR/SIPP/SILP)</option>
                  <option value="peer-konselor">Peer Konselor (Tanpa STR/SIPP/SILP)</option>
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
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-800 focus:border-[#561269] focus:outline-none cursor-pointer"
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

        {/* 3. KOLOM LEGALITAS PRAKTIK */}
        {kategori === "psikolog" && (
          <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 sm:p-8 space-y-4">
            <div className="border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-[#561269]">
                Legalitas Praktik Psikolog
              </h3>
              <p className="text-xs text-gray-600">
                Karena kategori yang dipilih adalah Psikolog, cantumkan nomor STR, SIPP resmi, serta SILP (Surat Izin Layanan Psikolog).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${
                    noStrError
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
                    Format resmi wajib diawali dengan &apos;STR&apos;.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor SIPP (Surat Izin Praktik Psikologi) {!noSilp && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={noSipp}
                  onChange={(e) => {
                    setNoSipp(e.target.value)
                    if (formErrorAlert) setFormErrorAlert(null)
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, noSipp: true }))}
                  className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${
                    noSippError
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
                    Format diawali &apos;SIPP&apos;. Wajib jika Nomor SILP tidak diisi.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor SILP (Surat Izin Layanan Psikolog) {!noSipp && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={noSilp}
                  onChange={(e) => {
                    setNoSilp(e.target.value)
                    if (formErrorAlert) setFormErrorAlert(null)
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, noSilp: true }))}
                  className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm font-mono text-gray-800 transition focus:outline-none ${
                    noSilpError
                      ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                      : "border-gray-300 focus:border-[#561269]"
                  }`}
                />
                {noSilpError ? (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium">
                    <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{noSilpError}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-purple-600/70 mt-1">
                    Format diawali &apos;SILP&apos;. Wajib jika Nomor SIPP tidak diisi.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. KOLOM TOPIK & KEAHLIAN */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">
              Topik & Keahlian Konseling
            </h3>
            <p className="text-xs text-gray-500">
              Tambahkan tag topik keahlian konseling.
            </p>
          </div>

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
              placeholder="Tambah topik keahlian..."
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
            {keahlian.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs text-gray-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(item)}
                  className="text-gray-400 hover:text-gray-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar Action Buttons */}
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
