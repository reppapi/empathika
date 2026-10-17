"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { BiroKomunitas, StatusAktivasiBiro } from "../../types"
import { INITIAL_BIRO_LIST, LOCAL_STORAGE_KEY_BIRO } from "../../data/initialData"

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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  // Load existing data jika dalam mode edit
  useEffect(() => {
    if (!biroId) return

    let currentList: BiroKomunitas[] = INITIAL_BIRO_LIST
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BIRO)
      if (saved) {
        currentList = JSON.parse(saved)
      }
    } catch {
      // fallback
    }

    const found = currentList.find((b) => b.id === biroId)
    if (found) {
      setNama(found.nama || "")
      setSlug(found.slug || "")
      setLogo(found.logo || "")
      setDeskripsi(found.deskripsi || "")
      setWarnaIdentitas(found.warnaIdentitas || "#561269")
      setEmailAdmin(found.emailAdmin || "")
      setTelepon(found.telepon || "")
      setAlamat(found.alamat || "")
      setStatusAktivasi(found.statusAktivasi || "Menunggu Aktivasi")
      setIsSlugManuallyEdited(true)
    } else {
      setNotFound(true)
    }
    setLoading(false)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "Ukuran file logo maksimal 3 MB",
      }))
      return
    }

    setErrors((prev) => {
      const next = { ...prev }
      delete next.logo
      return next
    })

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result)
      }
    }
    reader.readAsDataURL(file)
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

    try {
      let currentList: BiroKomunitas[] = INITIAL_BIRO_LIST
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BIRO)
      if (saved) {
        currentList = JSON.parse(saved)
      }

      const finalSlug = slug.trim() || generateSlug(nama)

      if (isEditMode && biroId) {
        const updatedList = currentList.map((item) => {
          if (item.id === biroId) {
            return {
              ...item,
              nama: nama.trim(),
              slug: finalSlug,
              logo: logo || undefined,
              deskripsi: deskripsi.trim(),
              warnaIdentitas: warnaIdentitas.trim().toUpperCase(),
              emailAdmin: emailAdmin.trim(),
              telepon: telepon.trim(),
              alamat: alamat.trim(),
              websiteUrl: `https://${finalSlug}.empathika.id`,
              dashboardUrl: `https://${finalSlug}.empathika.id/admin`,
              statusAktivasi,
            }
          }
          return item
        })
        localStorage.setItem(LOCAL_STORAGE_KEY_BIRO, JSON.stringify(updatedList))
      } else {
        const newId = `biro-${Date.now().toString().slice(-4)}`
        const today = new Date().toISOString().split("T")[0]
        const randomToken = `act_${Math.random().toString(36).substring(2, 8)}`
        const newBiro: BiroKomunitas = {
          id: newId,
          nama: nama.trim(),
          slug: finalSlug,
          logo: logo || undefined,
          deskripsi: deskripsi.trim(),
          warnaIdentitas: warnaIdentitas.trim().toUpperCase(),
          emailAdmin: emailAdmin.trim(),
          telepon: telepon.trim(),
          alamat: alamat.trim(),
          tanggalDibuat: today,
          statusAktivasi: "Menunggu Aktivasi",
          websiteUrl: `https://${finalSlug}.empathika.id`,
          dashboardUrl: `https://${finalSlug}.empathika.id/admin`,
          aktivasiToken: randomToken,
        }
        const updatedList = [newBiro, ...currentList]
        localStorage.setItem(LOCAL_STORAGE_KEY_BIRO, JSON.stringify(updatedList))
      }

      router.push("/admin/biro")
    } catch (err) {
      console.error(err)
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
              <p className="text-[11px] text-gray-400 font-mono mt-1">
                Akses: https://{slug || "slug-biro"}.empathika.id
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
    </div>
  )
}
