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

export default function AdminEditPsikologClient({ psikologId }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("Psikolog123!")
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
  const [jumlahSesi, setJumlahSesi] = useState(0)
  const [tanggalBergabung, setTanggalBergabung] = useState("")

  // Load existing data
  useEffect(() => {
    let foundItem: TenagaAhli | null = null

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENAGA)
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      foundItem = list.find((d) => d.id === psikologId) || null
    } catch {}

    const applyData = (found: any) => {
      setNama(found.nama || found.nama_gelar || "")
      setEmail(found.email || found.account?.email || "")
      setPassword(found.password || "Psikolog123!")
      setNoTelepon(found.noTelepon || found.account?.no_telepon || "")
      const kat = (found.kategori || "").toLowerCase()
      setKategori(
        kat.includes("peer")
          ? "peer-konselor"
          : kat.includes("konselor")
          ? "konselor"
          : "psikolog"
      )
      setStatusAkses(found.statusAkses || (found.status === "INACTIVE" ? "NONAKTIF" : "AKTIF"))
      setSpesialisasi(found.spesialisasi?.nama || found.spesialisasi || "")
      setNoStr(found.noStr || found.no_str || "")
      setNoSipp(found.noSipp || found.no_sipp || "")
      setPendidikanText(found.pendidikanText || found.pendidikan || "")
      setBio(found.bio || "")
      setQuote(found.quote || "")
      setInstagram(found.instagram || "")
      setFoto(found.foto || null)
      setKeahlian(
        Array.isArray(found.keahlian)
          ? found.keahlian
          : typeof found.keahlian === "string"
          ? found.keahlian.split(",").map((s: string) => s.trim())
          : []
      )
      setJumlahSesi(found.jumlahSesi || found.jumlah_sesi || 0)
      setTanggalBergabung(found.tanggalBergabung || "Terdaftar di DB")
    }

    if (foundItem) {
      applyData(foundItem)
      setLoading(false)
    } else {
      // Fallback: Fetch directly from backend DB by ID
      psikologService
        .getBySlug(psikologId)
        .then((dbData: any) => {
          if (dbData && (dbData.id || dbData.nama_gelar)) {
            applyData(dbData)
          } else {
            setNotFound(true)
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false))
    }
  }, [psikologId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      pendidikanText: pendidikanText.trim(),
      jumlahSesi,
      bio: bio.trim(),
      quote: quote.trim(),
      instagram: instagram.trim(),
      foto,
      keahlian,
      tanggalBergabung,
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
      const list: TenagaAhli[] = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
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
      {/* Header Halaman (Sesuai Pola Tambah Psikolog & Event) */}
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
              Edit Data Tenaga Ahli
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Perbarui akun login, data profil profesional, legalitas, dan izin akses web.
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
              Admin utama menentukan email dan kata sandi login serta izin akses portal psikolog.
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
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="contoh: psikolog@empathika.com"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kata Sandi Login <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-mono text-gray-800 focus:border-[#561269] focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Dapat diubah oleh admin kapan saja.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Izin Hak Akses Web
              </label>
              <div className="relative">
                <select
                  value={statusAkses}
                  onChange={(e) => setStatusAkses(e.target.value as StatusAkses)}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-800 focus:border-[#561269] focus:outline-none cursor-pointer"
                >
                  <option value="AKTIF">Beri Akses (Aktif)</option>
                  <option value="NONAKTIF">Hapus Akses (Nonaktif)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 2: PROFIL UTAMA & IDENTITAS */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Profil Utama & Identitas
            </h3>
            <p className="text-xs text-gray-500">
              Informasi identitas profesional yang tampil pada sistem dan layanan konsultasi.
            </p>
          </div>

          {/* Upload Foto Profil */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Foto Profil
            </label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                {foto ? (
                  <Image src={foto} alt="Preview" fill className="object-cover" />
                ) : (
                  <span className="text-xs text-[#561269] font-bold">Foto</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold text-[#561269] hover:bg-purple-100 transition cursor-pointer"
                >
                  {foto ? "Ganti Foto" : "Unggah Foto"}
                </button>
                {foto && (
                  <button
                    type="button"
                    onClick={() => setFoto(null)}
                    className="rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
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
                placeholder="contoh: Dr. Jane Doe, M.Psi., Psikolog"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                No. Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
                required
                placeholder="contoh: 081234567890"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kategori Profesi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriTenaga)}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-800 focus:border-[#561269] focus:outline-none cursor-pointer"
                >
                  <option value="psikolog">Psikolog</option>
                  <option value="konselor">Konselor</option>
                  <option value="peer-konselor">Peer Konselor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Spesialisasi Fokus
              </label>
              <input
                type="text"
                value={spesialisasi}
                onChange={(e) => setSpesialisasi(e.target.value)}
                placeholder="contoh: Psikolog Klinis Dewasa / Hubungan & Pasangan"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 3: LEGALITAS (STR & SIPP) & PENDIDIKAN */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Legalitas Profesi & Pendidikan
            </h3>
            <p className="text-xs text-gray-500">
              Kredensial hukum wajib diisi bagi tenaga dengan profesi Psikolog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor STR (Surat Tanda Registrasi)
              </label>
              <input
                type="text"
                value={noStr}
                onChange={(e) => setNoStr(e.target.value)}
                disabled={kategori !== "psikolog"}
                placeholder={kategori === "psikolog" ? "contoh: STR-1234-5678" : "Hanya untuk psikolog"}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nomor SIPP (Surat Izin Praktik Psikologi)
              </label>
              <input
                type="text"
                value={noSipp}
                onChange={(e) => setNoSipp(e.target.value)}
                disabled={kategori !== "psikolog"}
                placeholder={kategori === "psikolog" ? "contoh: SIPP-9876-5432" : "Hanya untuk psikolog"}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Riwayat Pendidikan Terakhir
              </label>
              <input
                type="text"
                value={pendidikanText}
                onChange={(e) => setPendidikanText(e.target.value)}
                placeholder="contoh: Magister Psikologi Profesi Klinis - Universitas Indonesia"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 4: BIO, KUTIPAN, & MEDIA SOSIAL */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Bio, Kutipan & Media Sosial
            </h3>
            <p className="text-xs text-gray-500">
              Teks pengenalan diri serta kutipan motivasi yang tampil di laman konseling klien.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kutipan / Quote Inspiratif
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="contoh: Setiap cerita layak didengar dan dipahami dengan penuh empati."
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Bio Lengkap
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan latar belakang singkat dan pendekatan terapi..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
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
                placeholder="contoh: @dr.janedoe"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KARTU 5: KEAHLIAN & TOPIK KONSELING */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#561269]">
              Keahlian & Topik Konseling
            </h3>
            <p className="text-xs text-gray-500">
              Tambahkan tag topik keahlian (contoh: Trauma Healing, Relasi, Depresi).
            </p>
          </div>

          <div className="space-y-3">
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
                placeholder="Ketik topik keahlian baru lalu tekan Tambah..."
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-xs font-bold text-gray-950 shadow-xs transition active:scale-95 cursor-pointer"
              >
                Tambah
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {keahlian.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#561269]"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(item)}
                    className="text-gray-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
