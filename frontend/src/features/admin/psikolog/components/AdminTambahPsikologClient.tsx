"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { TenagaAhli, KategoriTenaga, StatusAkses } from "../types"
import { INITIAL_TENAGA_AHLI, LOCAL_STORAGE_KEY_TENAGA } from "../initialData"

export default function AdminTambahPsikologClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("Psikolog123!") // Password awal diset oleh admin
  const [noTelepon, setNoTelepon] = useState("")
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFoto(url)
    }
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    if (!keahlian.includes(newSkill.trim())) {
      setKeahlian([...keahlian, newSkill.trim()])
    }
    setNewSkill("")
  }

  const handleRemoveSkill = (skill: string) => {
    setKeahlian(keahlian.filter((s) => s !== skill))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isPsikolog = kategori === "psikolog"
    const newTenaga: TenagaAhli = {
      id: Date.now().toString(),
      nama,
      email,
      password,
      noTelepon,
      kategori,
      statusAkses,
      spesialisasi: spesialisasi || (isPsikolog ? "Psikolog Klinis" : kategori === "konselor" ? "Konselor Kesehatan Mental" : "Peer Konselor"),
      noStr: isPsikolog ? noStr : undefined,
      noSipp: isPsikolog ? noSipp : undefined,
      pendidikanText,
      jumlahSesi: 0,
      bio,
      quote,
      instagram,
      foto,
      keahlian,
      tanggalBergabung: "Baru terdaftar",
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const updated = [newTenaga, ...list]
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify(updated))
    } catch {
      localStorage.setItem(LOCAL_STORAGE_KEY_TENAGA, JSON.stringify([newTenaga]))
    }

    router.push("/admin/psikolog")
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@empathika.com"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password Awal Login <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat password login awal"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-mono text-gray-800 focus:border-[#561269] focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tenaga ahli dapat mengubah email atau password ini secara mandiri di halaman profil mereka.
              </p>
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
                  onChange={(e) => setNoStr(e.target.value)}
                  placeholder="Contoh: STR-8921-2023"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 focus:border-[#561269] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nomor SIPP (Surat Izin Praktik Psikologi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={kategori === "psikolog"}
                  value={noSipp}
                  onChange={(e) => setNoSipp(e.target.value)}
                  placeholder="Contoh: SIPP-1049-2024"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono text-gray-800 focus:border-[#561269] focus:outline-none"
                />
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
                onChange={(e) => setNoTelepon(e.target.value)}
                placeholder="081234567890"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
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
                      className="rounded-xl bg-[#561269] hover:bg-[#6f1b87] px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95"
                    >
                      {foto ? "Ganti Foto" : "Pilih & Unggah Foto"}
                    </button>
                    {foto && (
                      <button
                        type="button"
                        onClick={() => setFoto(null)}
                        className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-red-600 transition"
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
              placeholder="Tambah topik (contoh: Kecemasan, Manajemen Stres)"
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="rounded-2xl bg-[#561269] px-5 py-2 text-xs font-semibold text-white hover:bg-[#6f1b87] transition"
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
            className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="rounded-2xl bg-[#561269] hover:bg-[#6f1b87] px-8 py-3 text-xs font-semibold text-white shadow-md transition active:scale-95"
          >
            Simpan Tenaga Ahli
          </button>
        </div>
      </form>
    </div>
  )
}
