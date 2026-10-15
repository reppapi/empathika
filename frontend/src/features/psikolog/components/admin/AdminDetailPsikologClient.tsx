"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, KategoriTenaga, StatusAkses } from "../../types"
import { INITIAL_TENAGA_AHLI, LOCAL_STORAGE_KEY_TENAGA } from "../../data/initialData"

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const found = list.find((d) => d.id === psikologId) || list[0]
      if (found) {
        setItem(found)
        setForm(found)
      }
    } catch {
      setItem(INITIAL_TENAGA_AHLI[0])
      setForm(INITIAL_TENAGA_AHLI[0])
    }
  }, [psikologId])

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

  const handleAddSkill = () => {
    if (!newSkill.trim() || !form) return
    const current = form.keahlian || []
    if (!current.includes(newSkill.trim())) {
      setForm({ ...form, keahlian: [...current, newSkill.trim()] })
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const updated = list.map((d) => (d.id === form.id ? form : d))
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(updated))
      setItem(form)
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kata Sandi Login
              </label>
              <input
                type="text"
                name="password"
                value={form.password || "Psikolog123!"}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-mono text-gray-800 focus:border-[#561269] focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Dapat diubah oleh admin atau psikolog.</p>
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
              <div className="flex gap-2">
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
                  placeholder="Tambah keahlian..."
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
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
