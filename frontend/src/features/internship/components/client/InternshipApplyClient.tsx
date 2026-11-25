"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Coins,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  Sparkles,
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  Globe,
  HelpCircle,
  Upload,
  Loader2,
  Check,
} from "lucide-react"
import {
  internshipService,
  InternshipPosition,
  InternshipQuestion,
} from "@/services/internship.service"
import PhoneInputField from "@/components/shared/PhoneInputField"

const DEFAULT_QUESTIONS: InternshipQuestion[] = [
  {
    id: "q-default-1",
    label: "Mengapa Anda tertarik untuk mengikuti program magang pada posisi ini di Empathika?",
    type: "textarea",
    required: true,
  },
  {
    id: "q-default-2",
    label: "Ceritakan pengalaman, keterampilan, atau proyek terbaik yang relevan dengan posisi yang Anda lamar!",
    type: "textarea",
    required: true,
  },
]

interface Props {
  positionId: string
}

export default function InternshipApplyClient({ positionId }: Props) {
  const router = useRouter()
  const [position, setPosition] = useState<InternshipPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    universitas: "",
    jurusan: "",
    semester: "",
    cvUrl: "",
    portfolioUrl: "",
  })

  // Dynamic answers to questions
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // File Upload State
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvFileName, setCvFileName] = useState<string>("")
  const [cvFileSize, setCvFileSize] = useState<string>("")
  const [uploadingCv, setUploadingCv] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [cvUploadMode, setCvUploadMode] = useState<"file" | "link">("file")

  const handleCvFileChange = async (file: File) => {
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Ukuran berkas CV terlalu besar. Maksimal 15 MB.")
      return
    }

    setCvFile(file)
    setCvFileName(file.name)
    setCvFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB")
    setUploadingCv(true)
    setErrorMessage(null)

    try {
      const res = await internshipService.uploadFile(file)
      setFormData((prev) => ({ ...prev, cvUrl: res.url }))
    } catch (err: any) {
      console.error("Gagal upload berkas:", err)
      setErrorMessage("Gagal mengunggah berkas CV: " + (err.message || "Kesalahan server"))
      setCvFile(null)
      setCvFileName("")
    } finally {
      setUploadingCv(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadPosition = async () => {
      setLoading(true)
      try {
        const data = await internshipService.getPositionById(positionId)
        if (data && isMounted) {
          setPosition(data)
        } else {
          // Fallback to public positions
          const all = await internshipService.getPublicPositions()
          const found = all.find((p) => p.id === positionId)
          if (found && isMounted) {
            setPosition(found)
          }
        }
      } catch (err) {
        console.warn("Gagal memuat posisi:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadPosition()
    return () => {
      isMounted = false
    }
  }, [positionId])

  // Get active questions for this position
  const activeQuestions: InternshipQuestion[] =
    position?.questions && position.questions.length > 0
      ? position.questions
      : DEFAULT_QUESTIONS

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!position) return

    // Validasi form dasar
    if (!formData.nama.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Alamat email yang valid wajib diisi.")
      return
    }
    if (!formData.telepon.trim()) {
      setErrorMessage("Nomor WhatsApp/telepon wajib diisi.")
      return
    }
    if (!formData.universitas.trim()) {
      setErrorMessage("Asal universitas / institusi wajib diisi.")
      return
    }
    if (uploadingCv) {
      setErrorMessage("Harap tunggu hingga proses unggah berkas CV selesai.")
      return
    }
    if (!formData.cvUrl.trim()) {
      setErrorMessage(
        cvUploadMode === "file"
          ? "Silakan unggah berkas CV / Resume Anda terlebih dahulu."
          : "Tautan Link CV / Resume wajib dicantumkan."
      )
      return
    }

    // Validasi pertanyaan wajib
    for (const q of activeQuestions) {
      if (q.required && !answers[q.id]?.trim()) {
        setErrorMessage(`Harap jawab pertanyaan: "${q.label}"`)
        return
      }
    }

    setSubmitting(true)
    try {
      const formattedJawaban = activeQuestions.map((q) => ({
        questionId: q.id,
        question: q.label,
        answer: answers[q.id]?.trim() || "-",
      }))

      await internshipService.applyInternship({
        positionId: position.id,
        positionTitle: position.judul,
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        telepon: formData.telepon.trim(),
        universitas: formData.universitas.trim(),
        jurusan: formData.jurusan.trim() || undefined,
        semester: formData.semester.trim() || undefined,
        cvUrl: formData.cvUrl.trim(),
        portfolioUrl: formData.portfolioUrl.trim() || undefined,
        jawaban: formattedJawaban,
      })

      setIsSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Terjadi kesalahan saat mengirim lamaran. Silakan coba lagi."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7FB] pt-36 pb-20 px-4 flex flex-col items-center justify-center font-poppins">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-[#561269] rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-medium text-sm">Memuat formulir pendaftaran...</p>
      </div>
    )
  }

  if (!position) {
    return (
      <div className="min-h-screen bg-[#FAF7FB] py-20 px-4 font-poppins flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-lg">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Posisi Tidak Ditemukan</h2>
          <p className="text-gray-600 text-sm mb-6">
            Lowongan magang yang Anda cari mungkin sudah ditutup atau tautan tidak valid.
          </p>
          <Link
            href="/internship"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#561269] text-white font-bold text-sm hover:bg-[#6e1885] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Lowongan Tersedia</span>
          </Link>
        </div>
      </div>
    )
  }

  // Tampilan Sukses Setelah Submit
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF7FB] py-16 sm:py-24 px-4 font-poppins flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-4 py-1 rounded-full bg-purple-50 text-[#561269] text-xs font-bold uppercase tracking-wider mb-3">
            Pendaftaran Diterima
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            Lamaran Anda Berhasil Terkirim!
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            Terima kasih telah melamar untuk posisi{" "}
            <span className="font-bold text-[#561269]">{position.judul}</span> di Empathika.
            Tim People & Culture kami akan meninjau profil dan jawaban Anda. Kami akan menghubungi
            Anda melalui WhatsApp atau Email terkait proses seleksi berikutnya.
          </p>

          <div className="bg-[#FAF7FB] border border-purple-100 rounded-2xl p-5 text-left mb-8 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Nama Pelamar:</span>
              <span className="font-bold text-gray-900">{formData.nama}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Posisi Dilamar:</span>
              <span className="font-bold text-gray-900">{position.judul}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Email:</span>
              <span className="font-bold text-gray-900">{formData.email}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>WhatsApp:</span>
              <span className="font-bold text-gray-900">{formData.telepon}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/internship"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#561269] hover:bg-[#6e1885] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Magang</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB] font-poppins pb-24">
      {/* ── HEADER NAVIGATION ── */}
      <div className="bg-gradient-to-r from-[#561269] via-[#6f1886] to-[#8B3A9C] text-white pt-32 sm:pt-36 md:pt-40 pb-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Formulir Pendaftaran
            </span>
            {position.divisi && (
              <span className="px-3 py-1 rounded-full bg-[#EAB308] text-[#0f172a] text-xs font-bold">
                {position.divisi}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            {position.judul}
          </h1>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Laptop className="w-4 h-4 text-[#EAB308]" />
              <span>{position.workMode}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Clock className="w-4 h-4 text-[#EAB308]" />
              <span>{position.durasi}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <MapPin className="w-4 h-4 text-[#EAB308]" />
              <span>{position.lokasi}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Coins className="w-4 h-4 text-[#EAB308]" />
              <span>{position.kompensasi}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Calendar className="w-4 h-4 text-[#EAB308]" />
              <span>Deadline: {position.deadline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORM CONTAINER ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-purple-100 shadow-xl p-6 sm:p-10 space-y-10"
        >
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── SECTION 1: DATA DIRI ── */}
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Data Diri Pelamar</h2>
                <p className="text-xs text-gray-500">
                  Pastikan informasi kontak Anda aktif dan dapat dihubungi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  NAMA LENGKAP <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Muhammad Kevin Pradana"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  EMAIL AKTIF <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                  />
                </div>
              </div>

              {/* Nomor Telepon / WA */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  NO. WHATSAPP / TELEPON <span className="text-rose-500">*</span>
                </label>
                <PhoneInputField
                  value={formData.telepon}
                  onChange={(val) => setFormData({ ...formData, telepon: val })}
                  placeholder="81234567890"
                />
              </div>

              {/* Universitas */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ASAL UNIVERSITAS / INSTITUSI <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.universitas}
                    onChange={(e) => setFormData({ ...formData, universitas: e.target.value })}
                    placeholder="Contoh: Universitas Indonesia"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                  />
                </div>
              </div>

              {/* Jurusan & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    JURUSAN
                  </label>
                  <input
                    type="text"
                    value={formData.jurusan}
                    onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                    placeholder="Contoh: Psikologi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    SEMESTER
                  </label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="Contoh: 6 / Freshgrad"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: BERKAS & LINK ── */}
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Berkas & Tautan Portofolio</h2>
                <p className="text-xs text-gray-500">
                  Unggah berkas CV dan cantumkan tautan portofolio pendukung Anda.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* CV / Resume Upload & Switch */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700">
                    BERKAS CV / RESUME <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCvUploadMode(cvUploadMode === "file" ? "link" : "file")
                    }}
                    className="text-xs text-[#561269] hover:underline font-semibold transition-colors"
                  >
                    {cvUploadMode === "file" ? "Gunakan tautan Google Drive / Cloud" : "Unggah Berkas Langsung"}
                  </button>
                </div>

                {cvUploadMode === "file" ? (
                  <div>
                    {uploadingCv ? (
                      <div className="border border-purple-200 bg-purple-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 text-[#561269] animate-spin mb-2" />
                        <p className="text-sm font-bold text-gray-900">
                          Mengunggah berkas...
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {cvFileName} ({cvFileSize})
                        </p>
                      </div>
                    ) : formData.cvUrl && cvFileName ? (
                      <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {cvFileName}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                                <Check className="w-3 h-3" /> Terunggah
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {cvFileSize && <span>{cvFileSize} • </span>}
                              <a
                                href={formData.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#561269] hover:underline font-medium inline-flex items-center gap-0.5"
                              >
                                Lihat Berkas <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            </p>
                          </div>
                        </div>
                        <label className="text-xs font-semibold text-[#561269] bg-purple-100 hover:bg-purple-200 px-3.5 py-2 rounded-xl cursor-pointer transition-colors shrink-0">
                          Ganti
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleCvFileChange(file)
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsDragging(false)
                          const file = e.dataTransfer.files?.[0]
                          if (file) handleCvFileChange(file)
                        }}
                        className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-[#561269] bg-purple-100/50 scale-[1.01]"
                            : "border-gray-300 hover:border-[#561269] bg-purple-50/20 hover:bg-purple-50/50"
                        } group`}
                      >
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          Pilih berkas CV atau seret ke sini
                        </p>
                        <p className="text-xs text-gray-500">
                          Format PDF, DOC, atau DOCX (Maksimal 15 MB)
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleCvFileChange(file)
                          }}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        value={formData.cvUrl}
                        onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      *Pastikan pengaturan akses tautan Google Drive disetel ke &ldquo;Siapa saja yang memiliki link dapat melihat&rdquo;.
                    </p>
                  </div>
                )}
              </div>

              {/* Portfolio Link */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  LINK PORTOFOLIO / LINKEDIN (OPSIONAL)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://behance.net/... atau https://linkedin.com/in/..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: PERTANYAAN POSISI / ESSAY ── */}
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pertanyaan Seleksi & Minat</h2>
                <p className="text-xs text-gray-500">
                  Jawab pertanyaan berikut secara jelas dan deskriptif untuk membantu kami mengenal Anda.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {activeQuestions.map((q, idx) => (
                <div key={q.id || `q-${idx}`} className="bg-[#FAF7FB] rounded-2xl p-5 border border-purple-100/70">
                  <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">
                    {idx + 1}. {q.label}{" "}
                    {q.required && <span className="text-rose-500">*</span>}
                  </label>

                  {q.type === "url" ? (
                    <input
                      type="url"
                      required={q.required}
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] bg-white"
                    />
                  ) : (
                    <textarea
                      required={q.required}
                      rows={3}
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Tuliskan jawaban Anda di sini..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] bg-white leading-relaxed resize-y"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── SUBMIT BUTTON ── */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Dengan mengirimkan formulir ini, Anda menyetujui data Anda digunakan untuk keperluan proses seleksi magang di Empathika.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirimkan Lamaran...</span>
                </>
              ) : (
                <>
                  <span>Kirim Lamaran Sekarang</span>
                  <Send className="w-4 h-4 text-[#0f172a]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
