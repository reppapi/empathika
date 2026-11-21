"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BiroKomunitas } from "@/features/biro/types"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Camera,
  Trash2,
  AlertCircle,
  RefreshCw,
  Save,
  Undo,
  CheckCircle2,
} from "lucide-react"
import { getBiroWebsiteUrl } from "@/lib/utils"
import { FormGantiEmail } from "@/features/profile/components/psikolog/FormGantiEmail"
import { FormGantiPassword } from "@/features/profile/components/psikolog/FormGantiPassword"
import { useAuthStore } from "@/store/authStore"
import { biroAdminService, UpdateBiroPayload } from "@/services/biro.service"
import { processAndUploadImage } from "@/lib/imageCompressor"

const PRESET_COLORS = [
  { name: "Ungu Empathika", hex: "#561269" },
  { name: "Teal Modern", hex: "#0D9488" },
  { name: "Biru Profesional", hex: "#2563EB" },
  { name: "Oranye Hangat", hex: "#EA580C" },
  { name: "Violet Kreatif", hex: "#7C3AED" },
  { name: "Merah Tegas", hex: "#DC2626" },
  { name: "Emerald Alami", hex: "#059669" },
  { name: "Pink Elegan", hex: "#DB2777" },
]

export default function ProfilBiroClient() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // State toast notifikasi
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: "success" | "error"
  }>({
    show: false,
    message: "",
    type: "success",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Data master asli yang tersimpan di server
  const [biro, setBiro] = useState<BiroKomunitas>(() => {
    const cachedColor = typeof window !== "undefined" ? localStorage.getItem("biro_theme_color") : null
    return {
      id: user?.id || "",
      accountId: user?.id || "",
      nama: user?.name || "",
      slug: "",
      warnaIdentitas: cachedColor || "#561269",
      emailAdmin: user?.email || "",
      telepon: "",
      alamat: "",
      deskripsi: "",
      statusAktivasi: "Aktif",
      accountAktif: true,
      tanggalDibuat: new Date().toISOString().split("T")[0],
      dashboardUrl: "/admin-biro",
    }
  })

  // State form edit interaktif
  const [form, setForm] = useState({
    nama: "",
    slug: "",
    logo: "",
    deskripsi: "",
    warnaIdentitas: "#561269",
    telepon: "",
    alamat: "",
  })

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 4500)
  }

  const fetchBiroProfile = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await biroAdminService.getMyAccount()
      if (res?.data) {
        const beBiro = (res.data as any).owned_biro?.[0] || res.data.biro
        if (beBiro) {
          const customColor =
            beBiro.warna_tema ||
            (typeof window !== "undefined" ? localStorage.getItem("biro_theme_color") : null) ||
            "#561269"

          if (beBiro.warna_tema && typeof window !== "undefined") {
            localStorage.setItem("biro_theme_color", beBiro.warna_tema)
            document.documentElement.style.setProperty("--biro-theme-color", beBiro.warna_tema)
            document.documentElement.setAttribute("data-biro-theme", "true")
          }

          const loadedBiro: BiroKomunitas = {
            id: beBiro.id || res.data.id,
            accountId: res.data.id,
            nama: beBiro.nama_biro || res.data.nama || "",
            slug: beBiro.slug || "",
            logo: beBiro.logoURI || undefined,
            deskripsi: beBiro.deskripsi || "",
            warnaIdentitas: customColor,
            emailAdmin: res.data.email || "",
            telepon: beBiro.no_telepon || res.data.no_telepon || "",
            alamat: beBiro.alamat || "",
            statusAktivasi: res.data.aktif ? "Aktif" : "Menunggu Aktivasi",
            accountAktif: Boolean(res.data.aktif),
            tanggalDibuat: res.data.createdAt ? res.data.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            websiteUrl: beBiro.slug ? getBiroWebsiteUrl(beBiro.slug) : undefined,
            dashboardUrl: "/admin-biro",
          }

          setBiro(loadedBiro)
          setForm({
            nama: loadedBiro.nama || "",
            slug: loadedBiro.slug || "",
            logo: loadedBiro.logo || "",
            deskripsi: loadedBiro.deskripsi || "",
            warnaIdentitas: loadedBiro.warnaIdentitas || "#561269",
            telepon: loadedBiro.telepon || "",
            alamat: loadedBiro.alamat || "",
          })
        } else {
          setBiro((prev) => ({
            ...prev,
            id: res.data.id,
            accountId: res.data.id,
            nama: res.data.nama || prev.nama,
            emailAdmin: res.data.email || prev.emailAdmin,
            telepon: res.data.no_telepon || prev.telepon,
            statusAktivasi: res.data.aktif ? "Aktif" : "Menunggu Aktivasi",
            accountAktif: Boolean(res.data.aktif),
          }))
          setForm((prev) => ({
            ...prev,
            nama: res.data.nama || "",
            telepon: res.data.no_telepon || "",
          }))
        }
      }
    } catch (err: any) {
      console.error("Gagal memuat profil biro:", err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat data profil biro dari server backend."
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBiroProfile()
  }, [fetchBiroProfile])

  // Handle upload logo biro
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      showNotification("File harus berupa gambar (JPG, PNG, atau WebP)", "error")
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotification("Ukuran file logo maksimal 15 MB", "error")
      return
    }

    setIsUploadingLogo(true)
    try {
      const { url } = await processAndUploadImage(file, "biro")
      setForm((prev) => ({ ...prev, logo: url }))
      showNotification("Logo berhasil diunggah. Klik 'Simpan Perubahan' untuk menerapkan.")
    } catch (err: any) {
      console.error("Gagal upload logo:", err)
      showNotification(err?.message || "Gagal memproses gambar logo", "error")
    } finally {
      setIsUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logo: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Reset form ke data asli yang tersimpan di server
  const handleResetForm = () => {
    setForm({
      nama: biro.nama || "",
      slug: biro.slug || "",
      logo: biro.logo || "",
      deskripsi: biro.deskripsi || "",
      warnaIdentitas: biro.warnaIdentitas || "#561269",
      telepon: biro.telepon || "",
      alamat: biro.alamat || "",
    })
    showNotification("Perubahan form telah dibatalkan.")
  }

  // Simpan perubahan profil ke backend
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nama.trim()) {
      showNotification("Nama Lembaga Biro tidak boleh kosong", "error")
      return
    }

    if (form.slug.trim()) {
      const cleanSlug = form.slug.trim().toLowerCase()
      if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
        showNotification("Subdomain/Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)", "error")
        return
      }
    }

    setIsSaving(true)

    try {
      const payload: UpdateBiroPayload = {
        nama: form.nama.trim(),
        slug: form.slug.trim().toLowerCase() || undefined,
        noTelepon: form.telepon.trim() || null,
        alamat: form.alamat.trim() || null,
        deskripsi: form.deskripsi.trim() || null,
        warnaIdentitas: form.warnaIdentitas.trim().toUpperCase() || null,
        logoURI: form.logo || null,
      }

      const res = await biroAdminService.updateMyProfile(payload)

      if (res?.data) {
        const beBiro = (res.data as any).owned_biro?.[0] || res.data.biro
        const updatedColor = payload.warnaIdentitas || form.warnaIdentitas
        const updatedSlug = payload.slug || form.slug

        if (typeof window !== "undefined") {
          localStorage.setItem("biro_theme_color", updatedColor)
          if (updatedSlug) {
            localStorage.setItem(`biro_theme_${updatedSlug}`, updatedColor)
            document.cookie = `biro_theme_${updatedSlug}=${encodeURIComponent(updatedColor)}; path=/; max-age=2592000; SameSite=Lax`

            const updatedProfileData = {
              id: beBiro?.id || biro.id,
              nama_biro: payload.nama || form.nama,
              slug: updatedSlug,
              warna_tema: updatedColor,
              logo: payload.logoURI || form.logo || null,
              deskripsi: payload.deskripsi || form.deskripsi || null,
              telepon: payload.noTelepon || form.telepon || null,
              alamat: payload.alamat || form.alamat || null,
            }
            localStorage.setItem(`biro_profile_${updatedSlug}`, JSON.stringify(updatedProfileData))
          }

          document.documentElement.style.setProperty("--biro-theme-color", updatedColor)
          document.documentElement.setAttribute("data-biro-theme", "true")
          window.dispatchEvent(new Event("storage"))
          window.dispatchEvent(new Event("biro_profile_updated"))
        }

        setBiro((prev) => ({
          ...prev,
          nama: payload.nama || prev.nama,
          slug: payload.slug || prev.slug,
          logo: payload.logoURI || undefined,
          deskripsi: payload.deskripsi || "",
          warnaIdentitas: updatedColor,
          telepon: payload.noTelepon || "",
          alamat: payload.alamat || "",
          websiteUrl: payload.slug ? getBiroWebsiteUrl(payload.slug) : prev.websiteUrl,
        }))

        showNotification("Profil lembaga biro berhasil diperbarui dan disinkronkan!")
      } else {
        showNotification("Profil berhasil disimpan!")
      }
    } catch (err: any) {
      console.error("Gagal menyimpan profil biro:", err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menyimpan perubahan profil ke server."
      showNotification(`Gagal menyimpan: ${msg}`, "error")
    } finally {
      setIsSaving(false)
    }
  }

  const activeThemeColor = form.warnaIdentitas || "#561269"

  return (
    <div className="flex flex-col gap-8 font-poppins pb-16 w-full max-w-6xl">
      {/* ── TOAST NOTIFIKASI MELAYANG ── */}
      {toast.show && (
        <div
          className={`fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-2xl transition-all animate-bounce ${
            toast.type === "error" ? "bg-rose-600" : "bg-[#561269]"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-white" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {toast.type === "error" ? "Terjadi Kesalahan" : "Berhasil"}
            </p>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ── NOTIFIKASI ERROR BACKEND ── */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Gagal Memuat Data Backend</p>
              <p className="text-xs text-rose-700">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchBiroProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── LOADING SKELETON ── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-200/90 p-12 shadow-sm flex flex-col items-center justify-center gap-3">
          <div 
            className="w-9 h-9 border-4 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: "rgba(0,0,0,0.08)",
              borderTopColor: "var(--biro-theme-color, #561269)",
            }}
          />
          <p 
            className="text-xs font-semibold animate-pulse"
            style={{ color: "var(--biro-theme-color, #561269)" }}
          >
            Memuat profil lembaga biro dari server...
          </p>
        </div>
      ) : (
        <>
          {/* ── 1. Header Profil & Preview Branding ── */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Foto Logo Biro dengan Aksi Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-md overflow-hidden relative"
                  style={{ backgroundColor: activeThemeColor }}
                >
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logo}
                      alt={form.nama || "Logo Biro"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (form.nama || "BR").slice(0, 2).toUpperCase()
                  )}

                  {/* Overlay Upload saat Hover */}
                  <label
                    htmlFor="logo-upload-input"
                    className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1"
                    title="Klik untuk mengganti logo"
                  >
                    <Camera className="w-6 h-6 mb-1 text-white" />
                    <span className="text-[10px] font-semibold">Ganti Logo</span>
                  </label>
                </div>

                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                  {biro.statusAktivasi || "Aktif"}
                </span>
              </div>

              {/* Input File Tersembunyi */}
              <input
                ref={fileInputRef}
                id="logo-upload-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploadingLogo || isSaving}
              />

              {/* Tombol aksi cepat untuk logo */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo || isSaving}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#561269] hover:underline cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isUploadingLogo ? "Mengunggah..." : form.logo ? "Ganti" : "Unggah Logo"}
                </button>
                {form.logo && (
                  <>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Informasi Preview Biro */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  {form.nama || "Nama Biro Belum Diatur"}
                </h2>
                <span className="rounded-full bg-purple-100 text-[#561269] text-xs font-semibold px-3 py-1">
                  Mitra Resmi Empathika
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed max-w-2xl">
                {form.deskripsi || "Belum ada deskripsi profil lembaga. Tuliskan deskripsi biro Anda pada form di bawah."}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-gray-600">
                {biro.emailAdmin && (
                  <span className="flex items-center gap-1.5 font-medium" title="Email akun admin biro">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {biro.emailAdmin}
                  </span>
                )}
                {form.telepon && (
                  <span className="flex items-center gap-1.5 font-medium" title="Nomor WhatsApp layanan">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {form.telepon}
                  </span>
                )}
                {form.slug && (
                  <a
                    href={getBiroWebsiteUrl(form.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-medium text-[#561269] hover:underline transition-colors"
                    title="Buka Website Biro (Front)"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    {form.slug}.localhost:3000
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── 2. Form Pengaturan Identitas Biro (Bisa Diedit) ── */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col gap-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Pengaturan Identitas & Branding Biro</h3>
                  <p className="text-xs text-gray-400">
                    Perubahan pada data ini akan langsung tampil di website tenant biro Anda
                  </p>
                </div>
              </div>
              <span
                className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: activeThemeColor }}
              >
                Dapat Diedit
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Nama Lembaga Biro */}
              <div>
                <label className="text-gray-700 font-semibold block mb-1.5">
                  Nama Lembaga Biro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Biro Konseling Cendekia Muda"
                  className="w-full p-3 bg-gray-50/70 rounded-xl border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-[#561269] focus:outline-none transition"
                  required
                />
              </div>

              {/* Subdomain / Slug */}
              <div>
                <label className="text-gray-700 font-semibold block mb-1.5">
                  Subdomain Website (Slug)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      setForm((prev) => ({ ...prev, slug: clean }))
                    }}
                    placeholder="nama-biro"
                    className="w-full p-3 bg-gray-50/70 rounded-l-xl border border-r-0 border-gray-200 text-gray-900 font-mono font-medium focus:bg-white focus:border-[#561269] focus:outline-none transition"
                  />
                  <span className="p-3 bg-gray-100 rounded-r-xl border border-gray-200 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                    .localhost:3000
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Hanya gunakan huruf kecil, angka, dan tanda strip (-)
                </p>
              </div>

              {/* Email Resmi (Informasi) */}
              <div>
                <label className="text-gray-700 font-semibold block mb-1.5">
                  Email Akun Admin Biro
                </label>
                <input
                  type="email"
                  value={biro.emailAdmin}
                  disabled
                  className="w-full p-3 bg-gray-100/80 rounded-xl border border-gray-200 text-gray-500 font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Ganti email melalui menu Keamanan Akun di bagian bawah halaman
                </p>
              </div>

              {/* Nomor WhatsApp Layanan */}
              <div>
                <label className="text-gray-700 font-semibold block mb-1.5">
                  Nomor WhatsApp Layanan Klien
                </label>
                <input
                  type="text"
                  value={form.telepon}
                  onChange={(e) => setForm((prev) => ({ ...prev, telepon: e.target.value }))}
                  placeholder="Contoh: 081234567890"
                  className="w-full p-3 bg-gray-50/70 rounded-xl border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-[#561269] focus:outline-none transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Nomor ini akan tampil pada tombol konsultasi & kontak di website biro Anda
                </p>
              </div>

              {/* Warna Identitas Template (Theme Color) */}
              <div className="md:col-span-2">
                <label className="text-gray-700 font-semibold block mb-1.5 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#561269]" />
                  <span>Warna Identitas Lembaga (Template Website & Portal)</span>
                </label>

                <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50/70 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.warnaIdentitas || "#561269"}
                      onChange={(e) => setForm((prev) => ({ ...prev, warnaIdentitas: e.target.value.toUpperCase() }))}
                      className="w-9 h-9 rounded-xl border-0 p-0 cursor-pointer overflow-hidden shadow-inner"
                      title="Pilih warna custom"
                    />
                    <input
                      type="text"
                      value={form.warnaIdentitas}
                      onChange={(e) => setForm((prev) => ({ ...prev, warnaIdentitas: e.target.value.toUpperCase() }))}
                      placeholder="#561269"
                      maxLength={7}
                      className="w-24 p-2 bg-white rounded-lg border border-gray-200 text-gray-800 font-mono text-xs uppercase font-bold focus:outline-none focus:border-[#561269]"
                    />
                  </div>

                  <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

                  {/* Preset Palet Warna */}
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = form.warnaIdentitas.toUpperCase() === c.hex.toUpperCase()
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, warnaIdentitas: c.hex }))}
                          className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center cursor-pointer shadow-sm ${
                            isSelected ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={`${c.name} (${c.hex})`}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Alamat Kantor */}
              <div className="md:col-span-2">
                <label className="text-gray-700 font-semibold block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Alamat Kantor / Operasional</span>
                </label>
                <textarea
                  rows={2}
                  value={form.alamat}
                  onChange={(e) => setForm((prev) => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Contoh: Jl. Diponegoro No. 45, Coblong, Kota Bandung, Jawa Barat"
                  className="w-full p-3 bg-gray-50/70 rounded-xl border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-[#561269] focus:outline-none transition leading-relaxed"
                />
              </div>

              {/* Deskripsi Profil Lembaga */}
              <div className="md:col-span-2">
                <label className="text-gray-700 font-semibold block mb-1.5">
                  Deskripsi Profil Lembaga Biro
                </label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm((prev) => ({ ...prev, deskripsi: e.target.value }))}
                  placeholder="Jelaskan mengenai visi, ruang lingkup layanan psikologi, dan dedikasi lembaga biro Anda..."
                  className="w-full p-3 bg-gray-50/70 rounded-xl border border-gray-200 text-gray-900 font-medium focus:bg-white focus:border-[#561269] focus:outline-none transition leading-relaxed"
                />
              </div>
            </div>

            {/* Tombol Aksi Simpan & Reset */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Undo className="w-3.5 h-3.5" />
                Batal / Reset
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-gray-950" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── 3. Bagian Keamanan Akun & Kredensial Login ── */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-bold text-[#561269]">
                Keamanan Akun & Kredensial Login
              </h3>
              <p className="text-xs text-gray-500">
                Perubahan email login dan kata sandi akun Admin Biro diproteksi dengan verifikasi keamanan ketat (OWASP ASVS).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <FormGantiEmail initialEmail={biro.emailAdmin} />
              <FormGantiPassword />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
