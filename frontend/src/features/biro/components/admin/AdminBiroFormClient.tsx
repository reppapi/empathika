"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { BiroKomunitas, StatusAktivasiBiro } from "../../types"
import { INITIAL_BIRO_LIST, LOCAL_STORAGE_KEY_BIRO } from "../../data/initialData"
import { biroAdminService, BiroAccountData } from "@/services/biro.service"
import { processAndUploadImage } from "@/lib/imageCompressor"
import { getBiroWebsiteUrl } from "@/lib/utils"
import GenerateActivationLinkButton from "@/features/psikolog/components/admin/GenerateActivationLinkButton"
import ActivationWarningModal from "@/components/common/ActivationWarningModal"
import {
  formatExpiryDisplay,
  formatRemainingTime,
  isLinkStillValid,
  toIsoExpiry,
} from "@/lib/activation"

interface AdminBiroFormClientProps {
  biroId?: string
}

export default function AdminBiroFormClient({ biroId }: AdminBiroFormClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = Boolean(biroId)
  const [loading, setLoading] = useState(isEditMode)
  const [notFound, setNotFound] = useState(false)

  const [nama, setNama] = useState("")
  const [slug, setSlug] = useState("")
  const [logo, setLogo] = useState<string>("")
  const [deskripsi, setDeskripsi] = useState("")
  const [warnaIdentitas, setWarnaIdentitas] = useState("#561269")
  const [emailAdmin, setEmailAdmin] = useState("")
  const [telepon, setTelepon] = useState("")
  const [alamat, setAlamat] = useState("")
  const [statusAktivasi, setStatusAktivasi] = useState<StatusAktivasiBiro>("Menunggu Aktivasi")

  // State Aktivasi & Token BE
  const [realAccountId, setRealAccountId] = useState<string>("")
  const [accountAktif, setAccountAktif] = useState(false)
  const [aktivasiToken, setAktivasiToken] = useState<string>("")
  const [tokenExpiredAt, setTokenExpiredAt] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [submittedBiro, setSubmittedBiro] = useState<BiroKomunitas | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const getActivationUrl = (tok: string) => {
    if (!tok) return ""
    return typeof window !== "undefined"
      ? `${window.location.origin}/set-password?token=${tok}`
      : `https://empathika.id/set-password?token=${tok}`
  }

  const currentActivationUrl = aktivasiToken ? getActivationUrl(aktivasiToken) : ""

  // State Pop-up Peringatan Link Masih Berlaku
  const [warningOpen, setWarningOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [warningExpiry, setWarningExpiry] = useState<string | undefined>()
  const [warningRemaining, setWarningRemaining] = useState<string | undefined>()
  const [nowTick, setNowTick] = useState(() => Date.now())

  const expiryIso = toIsoExpiry(tokenExpiredAt)
  const linkActive = Boolean(aktivasiToken && isLinkStillValid(expiryIso))
  const remainingMs = expiryIso ? new Date(expiryIso).getTime() - nowTick : 0
  const remainingText = linkActive ? formatRemainingTime(remainingMs) : ""

  useEffect(() => {
    if (!linkActive) return
    const timer = setInterval(() => {
      setNowTick(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [linkActive, expiryIso])

  const handleGenerateToken = () => {
    const newToken = `act_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`
    const newExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    setAktivasiToken(newToken)
    setTokenExpiredAt(newExpiry)
    setIsCopied(false)
    return newToken
  }

  const handleRegenerateToken = () => {
    if (linkActive) {
      const expFormatted = expiryIso ? formatExpiryDisplay(expiryIso) : undefined
      setWarningMessage(
        `Link aktivasi saat ini masih aktif dan berlaku hingga ${expFormatted || "3 hari"}. ` +
        `Generate ulang baru diizinkan setelah masa berlaku habis.`
      )
      setWarningExpiry(expFormatted)
      setWarningRemaining(remainingText)
      setWarningOpen(true)
      return
    }
    handleGenerateToken()
  }

  const handleCopyLink = () => {
    if (!currentActivationUrl) return
    navigator.clipboard.writeText(currentActivationUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleKirimWA = (targetBiro?: BiroKomunitas | null) => {
    const targetNama = targetBiro?.nama || nama || "Biro Mitra"
    const targetTelepon = targetBiro?.telepon || telepon || ""
    const activeToken = targetBiro?.aktivasiToken || aktivasiToken
    const finalActivationUrl = activeToken ? getActivationUrl(activeToken) : ""

    const rawPhone = targetTelepon.trim().replace(/[^0-9]/g, "")
    const waNumber = rawPhone
      ? rawPhone.startsWith("0")
        ? "62" + rawPhone.slice(1)
        : rawPhone.startsWith("62")
        ? rawPhone
        : "62" + rawPhone
      : ""

    const namaText = targetNama.trim() || "Biro Mitra"
    const pesan =
      `Halo *${namaText}*, selamat bergabung di ekosistem Empathika! 🌿\n\n` +
      `Biro/Komunitas Anda telah berhasil didaftarkan di platform kami. ` +
      `Silakan klik tautan resmi di bawah ini untuk mengaktifkan akun dan mengatur kata sandi admin biro Anda:\n\n` +
      `🔗 ${finalActivationUrl}\n\n` +
      `Catatan: Tautan aktivasi ini berlaku selama 3 hari demi keamanan akun Anda. Jangan bagikan tautan ini ke siapa pun.\n\n` +
      `Salam hangat,\n*Tim Empathika*`

    const waUrl = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(pesan)}`

    window.open(waUrl, "_blank")
  }

  // Load existing data jika dalam mode edit (dari BE, fallback localStorage)
  useEffect(() => {
    if (!biroId) return

    let isMounted = true
    setLoading(true)

    const loadData = async () => {
      let beAccount: BiroAccountData | null = null

      // 1. Coba ambil dari BE
      try {
        const res = await biroAdminService.getById(biroId)
        if (res?.data) {
          beAccount = res.data
        }
      } catch (err) {
        console.warn("Gagal mengambil detail biro dari BE, coba fallback:", err)
      }

      // 2. Jika tidak dapat dari getById, coba cari dari getAllBiroAccounts
      if (!beAccount) {
        try {
          const listRes = await biroAdminService.getList()
          if (listRes?.data && Array.isArray(listRes.data)) {
            const found = listRes.data.find(
              (acc) =>
                acc.id === biroId ||
                acc.owned_biro?.some((b) => b.id === biroId || b.slug === biroId)
            )
            if (found) beAccount = found
          }
        } catch {}
      }

      if (!isMounted) return

      if (beAccount) {
        const biroProfile = beAccount.owned_biro?.[0]
        setRealAccountId(beAccount.id)
        setNama(biroProfile?.nama_biro || beAccount.nama || "")
        setSlug(biroProfile?.slug || "")
        setLogo(biroProfile?.logoURI || "")
        setDeskripsi(biroProfile?.deskripsi || "")
        setWarnaIdentitas(biroProfile?.warna_tema || "#561269")
        setEmailAdmin(beAccount.email || "")
        setTelepon(biroProfile?.no_telepon || beAccount.no_telepon || "")
        setAlamat(biroProfile?.alamat || "")

        const isAktif = Boolean(beAccount.accountAktif || beAccount.aktif)
        setAccountAktif(isAktif)
        setStatusAktivasi(isAktif ? "Aktif" : "Menunggu Aktivasi")

        if (beAccount.tokenAktivasi) setAktivasiToken(beAccount.tokenAktivasi)
        if (beAccount.tokenExpiredAt) setTokenExpiredAt(toIsoExpiry(beAccount.tokenExpiredAt) || "")
        setIsSlugManuallyEdited(true)
        setLoading(false)
        return
      }

      // 3. Fallback localStorage jika BE belum mengembalikan
      let currentList: BiroKomunitas[] = INITIAL_BIRO_LIST
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BIRO)
        if (saved) currentList = JSON.parse(saved)
      } catch {}

      const found = currentList.find((b) => b.id === biroId || b.accountId === biroId)
      if (found) {
        setRealAccountId(found.accountId || found.id)
        setNama(found.nama || "")
        setSlug(found.slug || "")
        setLogo(found.logo || "")
        setDeskripsi(found.deskripsi || "")
        setWarnaIdentitas(found.warnaIdentitas || "#561269")
        setEmailAdmin(found.emailAdmin || "")
        setTelepon(found.telepon || "")
        setAlamat(found.alamat || "")
        setStatusAktivasi(found.statusAktivasi || "Menunggu Aktivasi")
        setAccountAktif(found.accountAktif || found.statusAktivasi === "Aktif")
        setAktivasiToken(found.aktivasiToken || "")
        setTokenExpiredAt(found.tokenExpiredAt || "")
        setIsSlugManuallyEdited(true)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [biroId])

  const handleNamaChange = (val: string) => {
    setNama(val)
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(val))
    }
    if (errors.nama) setErrors((prev) => ({ ...prev, nama: "" }))
  }

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true)
    setSlug(generateSlug(val))
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        logo: "Format logo harus berupa file gambar (JPG, PNG, WEBP, atau SVG)",
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "Ukuran file logo maksimal 5 MB",
      }))
      return
    }

    setErrors((prev) => {
      const next = { ...prev }
      delete next.logo
      return next
    })

    try {
      const { url } = await processAndUploadImage(file)
      setLogo(url)
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        logo: err?.message || "Gagal memproses gambar logo",
      }))
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}

    if (!nama.trim()) {
      errs.nama = "Nama biro atau komunitas wajib diisi"
    } else if (nama.trim().length < 3) {
      errs.nama = "Nama biro minimal 3 karakter"
    }

    const cleanedSlug = slug.trim()
    if (!cleanedSlug) {
      errs.slug = "Slug/URL subdomain wajib diisi"
    } else if (!/^[a-z0-9-]+$/.test(cleanedSlug)) {
      errs.slug = "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"
    }

    if (!deskripsi.trim()) {
      errs.deskripsi = "Deskripsi biro wajib diisi"
    }

    if (!warnaIdentitas.trim()) {
      errs.warnaIdentitas = "Kode warna identitas wajib dipilih"
    } else if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(warnaIdentitas.trim())) {
      errs.warnaIdentitas = "Format kode warna tidak valid (contoh: #561269)"
    }

    if (!emailAdmin.trim()) {
      errs.emailAdmin = "Email admin biro wajib diisi"
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(emailAdmin.trim())) {
        errs.emailAdmin = "Format email tidak valid (contoh: admin@biro.org)"
      }
    }

    if (!telepon.trim()) {
      errs.telepon = "Nomor telepon / hotline wajib diisi"
    }

    if (!alamat.trim()) {
      errs.alamat = "Alamat kantor / komunitas wajib diisi"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const finalSlug = slug.trim() || generateSlug(nama)
      const targetAccountId = realAccountId || biroId || ""

      if (isEditMode && targetAccountId) {
        // Mode Edit: Panggil PUT ke backend
        await biroAdminService.updateBiro(targetAccountId, {
          nama: nama.trim(),
          slug: finalSlug,
          email: emailAdmin.trim(),
          noTelepon: telepon.trim() || null,
          alamat: alamat.trim() || null,
          deskripsi: deskripsi.trim() || null,
          warnaIdentitas: warnaIdentitas.trim().toUpperCase() || null,
          logoURI: logo || null,
          status: statusAktivasi === "Aktif" ? "ACTIVE" : statusAktivasi === "Nonaktif" ? "INACTIVE" : "PENDING",
        })

        const resultBiro: BiroKomunitas = {
          id: targetAccountId,
          accountId: targetAccountId,
          nama: nama.trim(),
          slug: finalSlug,
          logo: logo || undefined,
          deskripsi: deskripsi.trim(),
          warnaIdentitas: warnaIdentitas.trim().toUpperCase(),
          emailAdmin: emailAdmin.trim(),
          telepon: telepon.trim(),
          alamat: alamat.trim(),
          tanggalDibuat: new Date().toISOString().split("T")[0],
          statusAktivasi,
          accountAktif,
          websiteUrl: getBiroWebsiteUrl(finalSlug),
          dashboardUrl: `/admin-biro`,
          aktivasiToken: aktivasiToken || undefined,
          tokenExpiredAt: tokenExpiredAt || undefined,
        }

        setSubmittedBiro(resultBiro)
        setIsSuccessModalOpen(true)
      } else {
        // Mode Tambah: Panggil POST ke backend
        const res = await biroAdminService.createBiro({
          nama: nama.trim(),
          slug: finalSlug,
          email: emailAdmin.trim(),
          noTelepon: telepon.trim() || undefined,
          alamat: alamat.trim() || undefined,
          deskripsi: deskripsi.trim() || undefined,
          warnaIdentitas: warnaIdentitas.trim().toUpperCase() || undefined,
          logoURI: logo || undefined,
          tokenAktivasi: aktivasiToken || undefined,
          tokenExpiredAt: tokenExpiredAt || undefined,
        })

        const createdAccount = res?.data
        const createdToken = createdAccount?.tokenAktivasi || ""
        const createdExp = createdAccount?.tokenExpiredAt ? toIsoExpiry(createdAccount.tokenExpiredAt) || "" : ""
        const createdAccId = createdAccount?.id || ""

        if (createdToken) setAktivasiToken(createdToken)
        if (createdExp) setTokenExpiredAt(createdExp)
        if (createdAccId) setRealAccountId(createdAccId)

        const newBiro: BiroKomunitas = {
          id: createdAccId || `biro-${Date.now().toString().slice(-4)}`,
          accountId: createdAccId,
          nama: nama.trim(),
          slug: finalSlug,
          logo: logo || undefined,
          deskripsi: deskripsi.trim(),
          warnaIdentitas: warnaIdentitas.trim().toUpperCase(),
          emailAdmin: emailAdmin.trim(),
          telepon: telepon.trim(),
          alamat: alamat.trim(),
          tanggalDibuat: new Date().toISOString().split("T")[0],
          statusAktivasi: "Menunggu Aktivasi",
          accountAktif: false,
          websiteUrl: getBiroWebsiteUrl(finalSlug),
          dashboardUrl: `/admin-biro`,
          aktivasiToken: createdToken || undefined,
          tokenExpiredAt: createdExp || undefined,
        }

        setSubmittedBiro(newBiro)
        setIsSuccessModalOpen(true)
      }
    } catch (err: any) {
      console.error("Gagal menyimpan biro:", err)
      const errorMsg =
        err?.response?.data?.message || err?.message || "Terjadi kesalahan saat menyimpan data biro."
      setErrors((prev) => ({ ...prev, submit: errorMsg }))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-400 font-poppins text-sm">
        Memuat data biro...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-center font-poppins gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Data Biro Tidak Ditemukan</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Biro dengan ID tersebut tidak ditemukan atau mungkin sudah dihapus dari sistem.
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/biro")}
          className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 transition active:scale-95 cursor-pointer"
        >
          Kembali ke Pengaturan Biro
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16 w-full max-w-5xl mx-auto">
      {/* ── Heading Form & Tombol Kembali (Pola Event) ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
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
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {isEditMode ? "Edit Konfigurasi Biro & Komunitas" : "Tambah Biro / Komunitas Baru"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isEditMode
              ? "Perbarui informasi profil, alamat, kontak, dan identitas tenant"
              : "Daftarkan tenant biro baru ke ekosistem multi-tenant Empathika"}
          </p>
        </div>
      </div>

      {/* ── Container Form Utama ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Alert Error Submit */}
          {errors.submit && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-700 shadow-xs animate-fadeIn">
              <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-red-800">Gagal Menyimpan</p>
                <p className="text-xs text-red-600 mt-0.5">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Logo Biro Upload / Preview */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Logo Biro atau Komunitas
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 bg-slate-50 flex items-center justify-center shrink-0 shadow-xs"
                style={{ borderColor: warnaIdentitas }}
              >
                {logo ? (
                  <Image src={logo} alt="Preview Logo" fill className="object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-xs font-extrabold"
                    style={{ color: warnaIdentitas, backgroundColor: `${warnaIdentitas}12` }}
                  >
                    <span>LOGO</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-xs active:scale-95 cursor-pointer"
                    style={{ backgroundColor: warnaIdentitas || "#561269" }}
                  >
                    Pilih File Gambar
                  </button>
                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition active:scale-95 cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  Format JPG, PNG, WEBP, atau SVG (maks. 3MB).
                </p>
                {errors.logo && (
                  <p className="text-xs text-red-500 font-semibold">{errors.logo}</p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Grid: Nama Biro & Slug/URL Subdomain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Nama Biro */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nama Biro atau Komunitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="Contoh: Biro Konseling Cendekia"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                  errors.nama
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
                }`}
              />
              {errors.nama && <p className="text-xs text-red-500 mt-1 font-medium">{errors.nama}</p>}
            </div>

            {/* Slug / Subdomain URL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Slug / Subdomain URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="cendekia-muda"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none transition shadow-xs ${
                  errors.slug
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
                }`}
              />
              <p className="text-[11px] text-gray-500 font-mono mt-1">
                Akses Website (Subdomain): {slug ? `${slug}.localhost:3000` : "slug-biro.localhost:3000"}
              </p>
              {errors.slug && <p className="text-xs text-red-500 mt-0.5 font-medium">{errors.slug}</p>}
            </div>
          </div>

          {/* Grid: Email Admin & No Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Email Admin */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Admin Biro <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={emailAdmin}
                onChange={(e) => {
                  setEmailAdmin(e.target.value)
                  if (errors.emailAdmin) setErrors((prev) => ({ ...prev, emailAdmin: "" }))
                }}
                placeholder="admin@cendekiamuda.org"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                  errors.emailAdmin
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
                }`}
              />
              {errors.emailAdmin && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.emailAdmin}</p>
              )}
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                No. Telepon / Hotline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => {
                  setTelepon(e.target.value)
                  if (errors.telepon) setErrors((prev) => ({ ...prev, telepon: "" }))
                }}
                placeholder="+62 812-3456-7890"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                  errors.telepon
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
                }`}
              />
              {errors.telepon && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.telepon}</p>
              )}
            </div>
          </div>

          {/* Tautan Aktivasi Akun Biro (3 Hari) */}
          <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-[#561269] flex items-center gap-1.5 uppercase tracking-wider">
                <svg className="w-4 h-4 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Tautan Aktivasi Akun Biro (3 Hari)
              </label>

              {isEditMode && realAccountId ? (
                <GenerateActivationLinkButton
                  accountId={realAccountId}
                  accountAktif={accountAktif}
                  tokenAktivasi={aktivasiToken}
                  tokenExpiredAt={tokenExpiredAt}
                  compact={true}
                  onUpdated={(next) => {
                    if (next.tokenAktivasi !== undefined) setAktivasiToken(next.tokenAktivasi || "")
                    if (next.tokenExpiredAt !== undefined) setTokenExpiredAt(toIsoExpiry(next.tokenExpiredAt) || "")
                    if (next.accountAktif !== undefined) {
                      setAccountAktif(next.accountAktif)
                      if (next.accountAktif) setStatusAktivasi("Aktif")
                    }
                    setIsCopied(false)
                  }}
                  onRefreshFromServer={async () => {
                    if (realAccountId) {
                      try {
                        const res = await biroAdminService.getById(realAccountId)
                        if (res?.data) {
                          if (res.data.tokenAktivasi) setAktivasiToken(res.data.tokenAktivasi)
                          if (res.data.tokenExpiredAt) setTokenExpiredAt(toIsoExpiry(res.data.tokenExpiredAt) || "")
                          if (res.data.accountAktif !== undefined) setAccountAktif(res.data.accountAktif)
                        }
                      } catch {}
                    }
                  }}
                />
              ) : !isEditMode ? (
                aktivasiToken ? (
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
                )
              ) : null}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={currentActivationUrl}
                placeholder={
                  isEditMode
                    ? "Belum ada link aktivasi (klik 'Generate Link' di samping)"
                    : "Belum di-generate (klik 'Generate Tautan' atau otomatis dibuat saat submit)"
                }
                className="flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-mono text-purple-950 placeholder:text-gray-400 placeholder:font-sans focus:outline-none select-all shadow-2xs"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!aktivasiToken}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold border border-purple-200 bg-white text-[#561269] hover:bg-purple-100/60 active:scale-95 transition shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isCopied ? "✓ Tersalin!" : "Salin"}
              </button>
            </div>

            {/* Keterangan Status Kedaluwarsa & Sisa Waktu */}
            {aktivasiToken && (
              <div className="rounded-xl bg-purple-100/70 border border-purple-200/90 px-3 py-2 text-[11px] space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-gray-600 font-medium">Batas Masa Berlaku Link:</span>
                  <span className="font-bold text-[#561269]">
                    {formatExpiryDisplay(expiryIso)}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-gray-600 font-medium">Status Link:</span>
                  {linkActive ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif (sisa {remainingText})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Sudah Kedaluwarsa
                    </span>
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-500">
              Admin biro mengatur kata sandi secara mandiri dan mengaktifkan tenant melalui tautan ini.
            </p>
          </div>

          {/* Kode Warna Identitas */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kode Warna Identitas <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
              <input
                type="color"
                value={warnaIdentitas}
                onChange={(e) => {
                  setWarnaIdentitas(e.target.value.toUpperCase())
                  if (errors.warnaIdentitas) setErrors((prev) => ({ ...prev, warnaIdentitas: "" }))
                }}
                className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer p-0.5 bg-white shrink-0"
                title="Pilih warna"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={warnaIdentitas}
                  onChange={(e) => {
                    setWarnaIdentitas(e.target.value.toUpperCase())
                    if (errors.warnaIdentitas) setErrors((prev) => ({ ...prev, warnaIdentitas: "" }))
                  }}
                  placeholder="#561269"
                  maxLength={7}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-gray-800 uppercase focus:outline-none focus:border-[#561269]"
                />
              </div>
              <span
                className="w-8 h-8 rounded-lg border border-gray-200 shadow-xs shrink-0"
                style={{ backgroundColor: warnaIdentitas }}
                title={`Pratinjau: ${warnaIdentitas}`}
              />
            </div>
            {errors.warnaIdentitas && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.warnaIdentitas}</p>
            )}
          </div>

          {/* Alamat Kantor / Komunitas */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Alamat Kantor / Komunitas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => {
                setAlamat(e.target.value)
                if (errors.alamat) setErrors((prev) => ({ ...prev, alamat: "" }))
              }}
              placeholder="Contoh: Jl. Kaliurang KM 5, Sleman, D.I. Yogyakarta"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                errors.alamat
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
              }`}
            />
            {errors.alamat && <p className="text-xs text-red-500 mt-1 font-medium">{errors.alamat}</p>}
          </div>

          {/* Deskripsi Profil */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Deskripsi Profil Biro <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={deskripsi}
              onChange={(e) => {
                setDeskripsi(e.target.value)
                if (errors.deskripsi) setErrors((prev) => ({ ...prev, deskripsi: "" }))
              }}
              placeholder="Tuliskan gambaran layanan, komunitas sasaran, atau visi biro..."
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs leading-relaxed ${
                errors.deskripsi
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
              }`}
            />
            {errors.deskripsi && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.deskripsi}</p>
            )}
          </div>

          {/* Status Aktivasi (Saat Edit) */}
          {isEditMode && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Status Aktivasi Tenant
              </label>
              <select
                value={statusAktivasi}
                onChange={(e) => setStatusAktivasi(e.target.value as StatusAktivasiBiro)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition shadow-xs"
              >
                <option value="Menunggu Aktivasi">Menunggu Aktivasi</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          )}

          {/* Footer Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-8 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isEditMode ? "Simpan Perubahan" : "Tambah Biro"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL POPUP SETELAH SUBMIT: TAMPILKAN LINK AKTIVASI & TOMBOL WHATSAPP */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                    {isEditMode ? "Perubahan Berhasil Disimpan!" : "Biro Berhasil Didaftarkan!"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tautan aktivasi akun admin biro siap dikirimkan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false)
                  router.push("/admin/biro")
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama Biro:</span>
                <span className="font-bold text-gray-900">{submittedBiro?.nama || nama || "Biro Baru"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email Admin:</span>
                <span className="font-semibold text-gray-900">{submittedBiro?.emailAdmin || emailAdmin || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">No. WhatsApp Tujuan:</span>
                <span className="font-mono font-bold text-gray-900">{submittedBiro?.telepon || telepon || "-"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Tautan Aktivasi (Berlaku 3 Hari):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={
                    submittedBiro?.aktivasiToken
                      ? getActivationUrl(submittedBiro.aktivasiToken)
                      : currentActivationUrl
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-purple-950 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = submittedBiro?.aktivasiToken
                      ? getActivationUrl(submittedBiro.aktivasiToken)
                      : currentActivationUrl
                    if (url) {
                      navigator.clipboard.writeText(url)
                      setIsCopied(true)
                      setTimeout(() => setIsCopied(false), 2000)
                    }
                  }}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  {isCopied ? "✓ Tersalin!" : "Salin"}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleKirimWA(submittedBiro)}
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
                  router.push("/admin/biro")
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
              >
                Selesai & Lihat Daftar Biro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Peringatan Link Masih Berlaku (3 Hari) */}
      <ActivationWarningModal
        isOpen={warningOpen}
        onClose={() => setWarningOpen(false)}
        message={warningMessage}
        expiryDateText={warningExpiry}
        remainingText={warningRemaining}
      />
    </div>
  )
}
