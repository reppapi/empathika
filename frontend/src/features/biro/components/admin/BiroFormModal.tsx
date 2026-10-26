"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { BiroKomunitas, StatusAktivasiBiro } from "../../types"
import { processAndUploadImage } from "@/lib/imageCompressor"

interface BiroFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<BiroKomunitas>) => void
  initialData?: BiroKomunitas | null
}

const PRESET_COLORS = [
  { hex: "#561269", label: "Empathika Purple" },
  { hex: "#0D9488", label: "Teal Modern" },
  { hex: "#2563EB", label: "Ocean Blue" },
  { hex: "#EA580C", label: "Warm Orange" },
  { hex: "#7C3AED", label: "Vibrant Violet" },
  { hex: "#059669", label: "Emerald Green" },
  { hex: "#E11D48", label: "Rose Crimson" },
  { hex: "#D97706", label: "Amber Gold" },
]

export default function BiroFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: BiroFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nama, setNama] = useState("")
  const [slug, setSlug] = useState("")
  const [logo, setLogo] = useState<string>("")
  const [deskripsi, setDeskripsi] = useState("")
  const [warnaIdentitas, setWarnaIdentitas] = useState("#561269")
  const [emailAdmin, setEmailAdmin] = useState("")
  const [telepon, setTelepon] = useState("")
  const [alamat, setAlamat] = useState("")
  const [statusAktivasi, setStatusAktivasi] = useState<StatusAktivasiBiro>("Menunggu Aktivasi")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  const isEdit = Boolean(initialData)

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama || "")
      setSlug(initialData.slug || "")
      setLogo(initialData.logo || "")
      setDeskripsi(initialData.deskripsi || "")
      setWarnaIdentitas(initialData.warnaIdentitas || "#561269")
      setEmailAdmin(initialData.emailAdmin || "")
      setTelepon(initialData.telepon || "")
      setAlamat(initialData.alamat || "")
      setStatusAktivasi(initialData.statusAktivasi || "Menunggu Aktivasi")
      setIsSlugManuallyEdited(true)
    } else {
      setNama("")
      setSlug("")
      setLogo("")
      setDeskripsi("")
      setWarnaIdentitas("#561269")
      setEmailAdmin("")
      setTelepon("")
      setAlamat("")
      setStatusAktivasi("Menunggu Aktivasi")
      setIsSlugManuallyEdited(false)
    }
    setErrors({})
  }, [initialData, isOpen])

  if (!isOpen) return null

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setTimeout(() => {
      const finalSlug = slug.trim() || generateSlug(nama)
      onSave({
        nama: nama.trim(),
        slug: finalSlug,
        logo: logo || undefined,
        deskripsi: deskripsi.trim(),
        warnaIdentitas: warnaIdentitas.trim().toUpperCase(),
        emailAdmin: emailAdmin.trim(),
        telepon: telepon.trim(),
        alamat: alamat.trim(),
        websiteUrl: `/biro/${finalSlug}`,
        dashboardUrl: `/admin-biro`,
        statusAktivasi,
      })
      setIsSubmitting(false)
      onClose()
    }, 200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[32px] bg-white shadow-2xl border border-white/60 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 sm:px-8 py-5 bg-white">
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-8 rounded-full"
              style={{ backgroundColor: warnaIdentitas || "#561269" }}
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {isEdit ? "Edit Konfigurasi Biro / Komunitas" : "Tambah Biro / Komunitas Baru"}
              </h3>
              <p className="text-xs text-gray-500">
                {isEdit
                  ? "Perbarui informasi profil, alamat, kontak, dan identitas tenant"
                  : "Daftarkan tenant biro baru ke ekosistem multi-tenant Empathika"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition active:scale-95"
            aria-label="Tutup form"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5 bg-[#FBFBFC]">
          {/* Logo Biro Upload / Preview */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              Logo Biro atau Komunitas
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-slate-50 flex items-center justify-center shrink-0 shadow-xs"
                style={{ borderColor: warnaIdentitas }}
              >
                {logo ? (
                  <Image src={logo} alt="Preview Logo" fill className="object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-[11px] font-extrabold"
                    style={{ color: warnaIdentitas, backgroundColor: `${warnaIdentitas}12` }}
                  >
                    <span>LOGO</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition shadow-xs active:scale-95"
                    style={{ backgroundColor: warnaIdentitas || "#561269" }}
                  >
                    Pilih File Gambar
                  </button>
                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition active:scale-95"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Biro */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nama Biro atau Komunitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="Contoh: Biro Konseling Cendekia"
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                  errors.nama
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/10"
                }`}
              />
              {errors.nama && <p className="text-xs text-red-500 mt-1 font-medium">{errors.nama}</p>}
            </div>

            {/* Slug / Subdomain URL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Slug / Subdomain URL <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="cendekia-muda"
                  className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 font-mono focus:outline-none transition shadow-xs ${
                    errors.slug
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-gray-200 bg-white focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/10"
                  }`}
                />
              </div>
              <p className="text-[11px] text-gray-500 font-mono mt-1">
                Akses Website: /biro/{slug || "slug-biro"}
              </p>
              {errors.slug && <p className="text-xs text-red-500 mt-0.5 font-medium">{errors.slug}</p>}
            </div>
          </div>

          {/* Grid: Email Admin & No Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Admin */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
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
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                  errors.emailAdmin
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/10"
                }`}
              />
              {errors.emailAdmin && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.emailAdmin}</p>
              )}
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                No. Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => {
                  setTelepon(e.target.value)
                  if (errors.telepon) setErrors((prev) => ({ ...prev, telepon: "" }))
                }}
                placeholder="+62 812-3456-7890"
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                  errors.telepon
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/10"
                }`}
              />
              {errors.telepon && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.telepon}</p>
              )}
            </div>
          </div>

          {/* Kode Warna Identitas */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
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
                className="w-7 h-7 rounded-lg border border-gray-200 shadow-xs shrink-0"
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
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
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
              className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                errors.alamat
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/10"
              }`}
            />
            {errors.alamat && <p className="text-xs text-red-500 mt-1 font-medium">{errors.alamat}</p>}
          </div>

          {/* Deskripsi Profil */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Deskripsi Profil Biro <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => {
                setDeskripsi(e.target.value)
                if (errors.deskripsi) setErrors((prev) => ({ ...prev, deskripsi: "" }))
              }}
              placeholder="Tuliskan gambaran layanan, komunitas sasaran, atau visi biro..."
              className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
                errors.deskripsi
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 bg-white focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/10"
              }`}
            />
            {errors.deskripsi && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.deskripsi}</p>
            )}
          </div>

          {/* Status Aktivasi (Saat Edit) */}
          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Status Aktivasi Tenant
              </label>
              <select
                value={statusAktivasi}
                onChange={(e) => setStatusAktivasi(e.target.value as StatusAktivasiBiro)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:border-[#561269] focus:outline-none transition shadow-xs"
              >
                <option value="Menunggu Aktivasi">Menunggu Aktivasi</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          )}

          {/* Footer Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] transition shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
