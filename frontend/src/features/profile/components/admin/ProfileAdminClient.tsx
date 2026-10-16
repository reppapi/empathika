"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { AdminProfileData, RoleType } from "../../types"
import { DEFAULT_ADMIN, DEFAULT_PSIKOLOG } from "../../data/profileData"

export { type AdminProfileData, type RoleType }

interface ProfileClientProps {
  role?: RoleType
}

export default function ProfileAdminClient({
  role = "admin",
}: ProfileClientProps) {
  const router = useRouter()
  const [adminData, setAdminData] = useState<AdminProfileData>(DEFAULT_ADMIN)
  const [psikologData, setPsikologData] = useState<AdminProfileData>(DEFAULT_PSIKOLOG)

  // Form input lokal berdasarkan role aktif
  const currentData = role === "admin" ? adminData : psikologData
  const [form, setForm] = useState<AdminProfileData>(currentData)

  // Tag keahlian baru
  const [newSkill, setNewSkill] = useState("")
  // Paragraf profil lengkap baru
  const [newParagraph, setNewParagraph] = useState("")

  // Status notifikasi simpan
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [isPlayingVideoPreview, setIsPlayingVideoPreview] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (role === "admin") {
      setForm(adminData)
    } else {
      // Ambil data dari shared storage tenaga ahli
      try {
        const saved = localStorage.getItem("empathika_tenaga_ahli_data")
        if (saved) {
          const list = JSON.parse(saved)
          const found = list.find((d: any) => d.id === "1" || d.email === "putriqoida@empathika.com") || list[0]
          if (found) {
            const mapped: AdminProfileData = {
              nama: found.nama,
              email: found.email,
              noTelepon: found.noTelepon,
              bio: found.bio,
              foto: found.foto,
              kategoriProfesi: found.kategori,
              spesialisasi: found.spesialisasi,
              noStr: found.noStr,
              noSipp: found.noSipp,
              pendidikanText: found.pendidikanText,
              quote: found.quote,
              instagram: found.instagram,
              keahlian: found.keahlian,
              profilLengkap: DEFAULT_PSIKOLOG.profilLengkap,
              videoIntroUrl: DEFAULT_PSIKOLOG.videoIntroUrl,
              videoThumbnail: DEFAULT_PSIKOLOG.videoThumbnail,
              videoDuration: DEFAULT_PSIKOLOG.videoDuration,
            }
            setPsikologData(mapped)
            setForm(mapped)
            return
          }
        }
      } catch {}
      setForm(psikologData)
    }
  }, [role, adminData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Upload Foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, foto: url }))
    }
  }

  // Hapus Foto
  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, foto: null }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Tambah & Hapus Keahlian (Psikolog)
  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    const currentSkills = form.keahlian || []
    if (!currentSkills.includes(newSkill.trim())) {
      setForm((prev) => ({
        ...prev,
        keahlian: [...currentSkills, newSkill.trim()],
      }))
    }
    setNewSkill("")
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      keahlian: (prev.keahlian || []).filter((s) => s !== skillToRemove),
    }))
  }

  // Tambah & Hapus Paragraf Profil Lengkap (Psikolog)
  const handleAddParagraph = () => {
    if (!newParagraph.trim()) return
    setForm((prev) => ({
      ...prev,
      profilLengkap: [...(prev.profilLengkap || []), newParagraph.trim()],
    }))
    setNewParagraph("")
  }

  const handleRemoveParagraph = (index: number) => {
    setForm((prev) => ({
      ...prev,
      profilLengkap: (prev.profilLengkap || []).filter((_, i) => i !== index),
    }))
  }

  // Submit / Simpan
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (role === "admin") {
      setAdminData(form)
    } else {
      setPsikologData(form)
      // Sinkronkan ke shared storage tenaga ahli agar Admin Utama dan POV Klien langsung terupdate
      try {
        const saved = localStorage.getItem("empathika_tenaga_ahli_data")
        if (saved) {
          const list = JSON.parse(saved)
          const updated = list.map((item: any) => {
            if (item.id === "1" || item.email === form.email) {
              return {
                ...item,
                nama: form.nama,
                email: form.email,
                noTelepon: form.noTelepon,
                bio: form.bio,
                foto: form.foto,
                kategori: form.kategoriProfesi || item.kategori,
                spesialisasi: form.spesialisasi || item.spesialisasi,
                noStr: form.noStr,
                noSipp: form.noSipp,
                pendidikanText: form.pendidikanText,
                quote: form.quote,
                instagram: form.instagram,
                keahlian: form.keahlian,
              }
            }
            return item
          })
          localStorage.setItem("empathika_tenaga_ahli_data", JSON.stringify(updated))
        }
      } catch {}
    }
    setToastMessage(`Profil ${role === "admin" ? "Admin" : "Psikolog"} berhasil diperbarui!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  const initials = form.nama
    ? form.nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EP"

  return (
    <div className="space-y-6 font-poppins pb-12">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-4 text-white shadow-2xl transition-all animate-bounce">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">Berhasil</p>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
          {role === "admin" ? "Pengaturan Profil Admin Utama" : "Pengaturan Profil Psikolog"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          {role === "admin"
            ? "Kelola identitas, foto profil, dan informasi kontak akun administrator Empathika."
            : "Kelola profil profesional, foto profil, kredensial STR/SIPP, dan informasi yang tampil di halaman klien."}
        </p>
      </div>

      {/* Form Utama */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* KARTU 1: FOTO PROFIL & IDENTITAS CEPAT */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Foto / Inisial Avatar */}
              <div className="relative group">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden bg-gradient-to-tr from-purple-100 to-purple-50 border-2 border-purple-200/80 shadow-md flex items-center justify-center">
                  {form.foto ? (
                    <Image
                      src={form.foto}
                      alt={form.nama}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-[#561269] select-none">
                      {initials}
                    </span>
                  )}
                </div>

                {/* Badge Status */}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Teks & Keterangan Foto */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                    Foto Profil
                  </h3>
                  <span className="inline-block rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-[#561269]">
                    {role === "admin" ? "Admin Utama" : form.spesialisasi || "Psikolog / Konselor"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 max-w-sm">
                  Format gambar JPG, PNG, atau WEBP. Ukuran maksimal 2MB dengan rasio 1:1 untuk tampilan optimal.
                </p>

                {/* Tombol Aksi Foto */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
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
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-4 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {form.foto ? "Ubah Foto" : "Unggah Foto"}
                  </button>

                  {form.foto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Preview Client POV Button (khusus Psikolog) */}
            {role === "psikolog" && (
              <div className="flex sm:flex-col items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Lihat Pratinjau (POV Klien)
                </button>
                <span className="text-[11px] text-gray-400 hidden sm:block text-center">
                  Live preview tampilan profil Anda
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KARTU 2: INFORMASI DASAR (Umum untuk Admin & Admin Psikolog) */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
              Informasi Umum & Kontak
            </h3>
            <p className="text-xs text-gray-400">
              Data dasar akun untuk kebutuhan identitas internal dan korespondensi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleInputChange}
                required
                placeholder="Contoh: dr. John Doe, M.Psi."
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                required
                placeholder="nama@empathika.com"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nomor WhatsApp / Telepon
              </label>
              <input
                type="text"
                name="noTelepon"
                value={form.noTelepon}
                onChange={handleInputChange}
                placeholder="0812xxxxxxxx"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
              />
            </div>

            {role === "psikolog" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Akun Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={form.instagram || ""}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                />
              </div>
            )}

            {role === "admin" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Alamat Fisik Klinik / Kantor
                  </label>
                  <input
                    type="text"
                    name="alamat"
                    value={form.alamat || ""}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler, Kota Bandung"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Tautan Google Maps (Petunjuk Arah)
                  </label>
                  <input
                    type="url"
                    name="linkMaps"
                    value={form.linkMaps || ""}
                    onChange={handleInputChange}
                    placeholder="Contoh: https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tautan ini akan digunakan pada tombol &quot;Dapatkan Petunjuk Arah&quot; di bagian Kunjungi Kami pada halaman depan klien.
                  </p>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Bio Singkat
              </label>
              <textarea
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleInputChange}
                placeholder="Tuliskan gambaran singkat mengenai peran dan fokus keahlian Anda..."
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 3: KHUSUS PSIKOLOG (DATA LENGKAP PERSIS POV CLIENT) */}
        {role === "psikolog" && (
          <div className="space-y-6">
            {/* 3A: Legalitas & Kategori Profesi */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
                  Kredensial & Spesialisasi Praktik
                </h3>
                <p className="text-xs text-gray-400">
                  Data legalitas resmi STR/SIPP serta kategori spesialisasi yang akan tampil di halaman detail klien.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Klasifikasi Profesi
                  </label>
                  <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm">
                    <span className="font-bold text-[#561269] capitalize">
                      {form.kategoriProfesi === "psikolog"
                        ? "Psikolog Resmi"
                        : form.kategoriProfesi === "peer-konselor"
                        ? "Peer Konselor"
                        : "Konselor"}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 bg-white border border-purple-100 rounded-lg px-2.5 py-0.5">
                      Ditetapkan Admin Utama
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Spesialisasi Utama
                  </label>
                  <input
                    type="text"
                    name="spesialisasi"
                    value={form.spesialisasi || ""}
                    onChange={handleInputChange}
                    placeholder="Contoh: Konselor Kesehatan Mental"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Ubah Kata Sandi Akun
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Masukkan kata sandi baru (opsional)"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                </div>

                {form.kategoriProfesi === "psikolog" ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Nomor STR (Surat Tanda Registrasi) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="noStr"
                        value={form.noStr || ""}
                        onChange={handleInputChange}
                        placeholder="Contoh: STR-8921-2023"
                        className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Nomor SIPP (Surat Izin Praktik) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="noSipp"
                        value={form.noSipp || ""}
                        onChange={handleInputChange}
                        placeholder="Contoh: SIPP-1049-2024"
                        className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-700 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Sebagai <strong>{form.kategoriProfesi === "peer-konselor" ? "Peer Konselor" : "Konselor"}</strong>, Anda tidak diwajibkan menyertakan nomor STR dan SIPP.
                    </span>
                  </div>
                )}

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Pendidikan & Institusi
                  </label>
                  <input
                    type="text"
                    name="pendidikanText"
                    value={form.pendidikanText || ""}
                    onChange={handleInputChange}
                    placeholder="Contoh: Sarjana Psikologi (S.Psi.) - Universitas Indonesia"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Quote / Prinsip Pribadi Diri
                  </label>
                  <input
                    type="text"
                    name="quote"
                    value={form.quote || ""}
                    onChange={handleInputChange}
                    placeholder="Prinsip konseling yang menginspirasi klien..."
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 italic focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                </div>
              </div>
            </div>

            {/* 3B: Media Video Intro (Video Greeting POV Klien) */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
                  Video Perkenalan (Greeting Video)
                </h3>
                <p className="text-xs text-gray-400">
                  Video singkat untuk menyapa calon klien di halaman profil Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    URL File Video (.mp4 / stream)
                  </label>
                  <input
                    type="text"
                    name="videoIntroUrl"
                    value={form.videoIntroUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://domain.com/video-greeting.mp4"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Durasi Video (Contoh: 01:30)
                  </label>
                  <input
                    type="text"
                    name="videoDuration"
                    value={form.videoDuration || ""}
                    onChange={handleInputChange}
                    placeholder="01:30"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition font-mono"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    URL Thumbnail Video (Opsional)
                  </label>
                  <input
                    type="text"
                    name="videoThumbnail"
                    value={form.videoThumbnail || ""}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                </div>
              </div>
            </div>

            {/* 3C: Fokus Keahlian & Profil Naratif Lengkap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tag Keahlian */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4 flex flex-col">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
                    Area Keahlian Konseling
                  </h3>
                  <p className="text-xs text-gray-400">
                    Fokus topik atau masalah yang Anda tangani.
                  </p>
                </div>

                {/* Input Tambah Tag */}
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
                    placeholder="Tambah keahlian (contoh: Burnout & Stres)"
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-4 py-2.5 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* List Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1 flex-1 items-start content-start">
                  {(form.keahlian || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50/90 border border-purple-200/70 px-2.5 py-1 text-[11px] font-medium text-[#561269] transition hover:bg-purple-100/80"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="rounded hover:bg-purple-200/80 p-0.5 text-purple-600 hover:text-purple-900 transition leading-none"
                        title={`Hapus ${skill}`}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {(form.keahlian || []).length === 0 && (
                    <p className="text-xs text-gray-400 italic">Belum ada keahlian yang ditambahkan.</p>
                  )}
                </div>
              </div>

              {/* Paragraf Profil Lengkap (Prakata Diri) */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4 flex flex-col">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
                    Profil Lengkap & Prakata Klien
                  </h3>
                  <p className="text-xs text-gray-400">
                    Naratif paragraf yang muncul pada bagian &ldquo;PROFIL PSIKOLOG&rdquo; di halaman klien.
                  </p>
                </div>

                <div className="space-y-3 flex-1">
                  {(form.profilLengkap || []).map((paragraf, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl bg-gray-50 border border-gray-100 p-3.5 text-xs text-gray-700 leading-relaxed pr-10"
                    >
                      <p>{paragraf}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(idx)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 opacity-70 group-hover:opacity-100 transition"
                        title="Hapus Paragraf"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Input Tambah Paragraf */}
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={newParagraph}
                    onChange={(e) => setNewParagraph(e.target.value)}
                    placeholder="Tulis paragraf naratif baru..."
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="w-full rounded-full border border-gray-300 bg-white py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
                  >
                    + Tambah Paragraf ke Profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-3xl bg-white/95 backdrop-blur-md border border-gray-200/80 p-4 sm:p-5 shadow-xl">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-800">
              Perubahan belum disimpan otomatis
            </p>
            <p className="text-[11px] text-gray-400">
              Pastikan Anda mengklik tombol Simpan setelah melakukan penyesuaian.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (role === "admin") {
                  router.push("/admin")
                } else {
                  router.push("/psikolog-web/beranda" as any)
                }
              }}
              className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-7 py-2.5 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </form>

      {/* MODAL POPUP: LIVE PREVIEW CLIENT POV (SEPERTI DI DETAIL PSIKOLOG POV KLIEN) */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Header Modal */}
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-bold text-[#561269]">
                  Pratinjau Tampilan Profil (POV Klien Empathika)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false)
                  setIsPlayingVideoPreview(false)
                }}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Isi Konten Replika DetailPsikologContent */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Header Profil & Video */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Kolom Kiri: Foto Profil & Info */}
                <div className="md:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shrink-0 bg-[#D4B2E8] flex items-center justify-center shadow-inner border-2 border-purple-100">
                    {form.foto ? (
                      <Image
                        src={form.foto}
                        alt={form.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[#561269] font-bold text-3xl select-none">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="inline-block px-3 py-1 text-[11px] font-semibold text-[#561269] bg-purple-100 rounded-full">
                        {form.spesialisasi || "Psikolog"}
                      </span>
                      {form.instagram && (
                        <span className="inline-block px-3 py-1 text-[11px] font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
                          {form.instagram}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
                      {form.nama}
                    </h2>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 text-xs text-gray-600">
                      {form.noStr && (
                        <p>
                          STR: <span className="font-semibold text-[#561269] font-mono">{form.noStr}</span>
                        </p>
                      )}
                      {form.noSipp && (
                        <p>
                          SIPP: <span className="font-semibold text-[#561269] font-mono">{form.noSipp}</span>
                        </p>
                      )}
                    </div>

                    {form.quote && (
                      <div className="mt-2 bg-[#FAF5FD] border-l-4 border-[#561269] p-3 rounded-r-2xl text-left">
                        <p className="text-gray-800 text-xs italic">
                          &ldquo;{form.quote}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom Kanan: Video Perkenalan */}
                <div className="md:col-span-5 w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-md border border-purple-100 bg-[#3B074B] aspect-video flex items-center justify-center">
                    {isPlayingVideoPreview ? (
                      <video
                        src={form.videoIntroUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {form.videoThumbnail || form.foto ? (
                          <Image
                            src={form.videoThumbnail || form.foto!}
                            alt="Thumbnail Video"
                            fill
                            className="object-cover opacity-60"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span>Video Perkenalan</span>
                        </div>
                        {form.videoDuration && (
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white text-[10px] font-mono">
                            {form.videoDuration}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsPlayingVideoPreview(true)}
                          className="relative z-10 flex items-center gap-2 bg-white/95 text-[#561269] px-4 py-2 rounded-full font-bold text-xs shadow-lg hover:scale-105 transition"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Putar Video
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Bagian Profil */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider">
                  PROFIL PSIKOLOG
                </h4>
                <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {(form.profilLengkap && form.profilLengkap.length > 0) ? (
                    form.profilLengkap.map((p, i) => <p key={i}>{p}</p>)
                  ) : (
                    <p>{form.bio}</p>
                  )}
                </div>
                {form.pendidikanText && (
                  <p className="text-xs text-gray-500 pt-1">
                    <span className="font-semibold text-gray-700">Pendidikan: </span>
                    {form.pendidikanText}
                  </p>
                )}
              </div>

              {/* Bagian Keahlian */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider">
                  KEAHLIAN PSIKOLOG
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(form.keahlian || []).map((k, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF5FD] border border-purple-200/80 text-[11px] font-medium text-[#561269]"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3.5 text-right">
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false)
                  setIsPlayingVideoPreview(false)
                }}
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
