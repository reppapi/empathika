"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Coins,
  Eye,
  EyeOff,
  Laptop,
  MapPin,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react"
import {
  internshipService,
  InternshipPosition,
  InternshipQuestion,
} from "@/services/internship.service"

interface Props {
  positionId?: string
}

// Helper untuk konversi string tanggal ke format YYYY-MM-DD agar kompatibel dengan input type="date"
function toDateInputValue(val: string): string {
  if (!val) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const parts = val.split(/[/-]/)
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`
    } else {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
    }
  }
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0]
  }
  return ""
}

// Helper untuk konversi YYYY-MM-DD dari input type="date" menjadi format DD/MM/YYYY
function formatIsoToDisplayDate(isoDate: string): string {
  if (!isoDate) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [y, m, d] = isoDate.split("-")
    return `${d}/${m}/${y}`
  }
  return isoDate
}

export default function AdminInternshipFormClient({ positionId }: Props) {
  const router = useRouter()
  const isEditMode = Boolean(positionId)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // State Form
  const [formData, setFormData] = useState({
    judul: "",
    durasi: "6 Month",
    lokasi: "WFA",
    workMode: "Remote",
    kompensasi: "Unpaid",
    deadline: "",
    deskripsi: "",
    responsibilitiesText: "",
    qualificationsText: "",
    isOpen: true,
  })

  // State Pertanyaan Seleksi
  const [questions, setQuestions] = useState<InternshipQuestion[]>([])
  const [newQuestionLabel, setNewQuestionLabel] = useState("")
  const [newQuestionType, setNewQuestionType] = useState<"text" | "textarea">("textarea")
  const [newQuestionRequired, setNewQuestionRequired] = useState(true)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  const [loadingData, setLoadingData] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Tampilkan notifikasi toast
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Ambil data jika mode edit
  useEffect(() => {
    if (!positionId) return

    let isMounted = true
    const loadDetail = async () => {
      setLoadingData(true)
      try {
        const item = await internshipService.getPositionById(positionId)
        if (item && isMounted) {
          setFormData({
            judul: item.judul || "",
            durasi: item.durasi || "6 Month",
            lokasi: item.lokasi || "WFA",
            workMode: item.workMode || "Remote",
            kompensasi: item.kompensasi || "Unpaid",
            deadline: item.deadline || "",
            deskripsi: item.deskripsi || "",
            responsibilitiesText: (item.responsibilities || []).join("\n"),
            qualificationsText: (item.qualifications || []).join("\n"),
            isOpen: Boolean(item.isOpen),
          })
          if (item.questions && Array.isArray(item.questions) && item.questions.length > 0) {
            setQuestions(item.questions)
          }
        }
      } catch (err: any) {
        console.error("Gagal memuat detail posisi:", err)
        showToast("Gagal memuat detail posisi internship.")
      } finally {
        if (isMounted) setLoadingData(false)
      }
    }

    loadDetail()
    return () => {
      isMounted = false
    }
  }, [positionId])

  // Validasi & Simpan Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.judul.trim()) {
      newErrors.judul = "Judul posisi wajib diisi"
    }
    if (!formData.deadline.trim()) {
      newErrors.deadline = "Deadline pendaftaran wajib diisi"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const respList = formData.responsibilitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    const qualList = formData.qualificationsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    const finalQuestions: InternshipQuestion[] =
      isAddingQuestion && newQuestionLabel.trim()
        ? [
            ...questions,
            {
              id: `q-${Date.now()}`,
              label: newQuestionLabel.trim(),
              type: newQuestionType,
              required: newQuestionRequired,
            },
          ]
        : questions

    setSubmitting(true)
    try {
      if (isEditMode && positionId) {
        await internshipService.updatePosition(positionId, {
          judul: formData.judul.trim(),
          divisi: undefined,
          durasi: formData.durasi.trim(),
          lokasi: formData.lokasi.trim(),
          workMode: formData.workMode.trim(),
          kompensasi: formData.kompensasi.trim(),
          deadline: formData.deadline.trim(),
          deskripsi: formData.deskripsi.trim() || undefined,
          responsibilities: respList,
          qualifications: qualList,
          questions: finalQuestions,
          applyUrl: "",
          isOpen: formData.isOpen,
        })
        showToast("Posisi internship berhasil diperbarui!")
      } else {
        await internshipService.createPosition({
          judul: formData.judul.trim(),
          divisi: undefined,
          durasi: formData.durasi.trim(),
          lokasi: formData.lokasi.trim(),
          workMode: formData.workMode.trim(),
          kompensasi: formData.kompensasi.trim(),
          deadline: formData.deadline.trim(),
          deskripsi: formData.deskripsi.trim() || undefined,
          responsibilities: respList,
          qualifications: qualList,
          questions: finalQuestions,
          applyUrl: "",
          isOpen: formData.isOpen,
        })
        showToast("Posisi internship baru berhasil ditambahkan!")
      }

      // Kembali ke halaman daftar posisi setelah berhasil
      setTimeout(() => {
        router.push("/admin/internship")
      }, 700)
    } catch (err: any) {
      console.error("Gagal menyimpan posisi internship:", err)
      alert(err.message || "Gagal menyimpan posisi internship. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3 font-poppins">
        <div className="w-10 h-10 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Memuat data posisi internship...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-poppins pb-20 w-full max-w-5xl mx-auto">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#561269] px-5 py-3 text-white shadow-xl transition-all">
          <CheckCircle2 className="w-5 h-5 text-[#EAB308]" />
          <p className="text-xs sm:text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* ── Heading Form & Tombol Kembali ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/internship")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#561269] transition-colors cursor-pointer"
          aria-label="Kembali ke Daftar Internship"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {isEditMode ? "Edit Posisi Internship" : "Tambah Posisi Internship Baru"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isEditMode
              ? "Perbarui informasi dan rincian lowongan internship untuk halaman client"
              : "Tambahkan lowongan posisi internship baru untuk halaman internship"}
          </p>
        </div>
      </div>

      {/* ── Container Form Utama ── */}
      <div className="w-full rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Judul Posisi */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Judul Posisi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Social Media & Content Intern"
              value={formData.judul}
              onChange={(e) => {
                setFormData({ ...formData, judul: e.target.value })
                if (errors.judul) setErrors({ ...errors, judul: "" })
              }}
              className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-colors ${
                errors.judul
                  ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                  : "border-gray-200 focus:border-[#561269]"
              }`}
            />
            {errors.judul && (
              <p className="text-xs text-rose-500 mt-1">{errors.judul}</p>
            )}
          </div>

          {/* Section 2: 4 Spesifikasi (Durasi, Lokasi, Work Mode, Kompensasi) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#561269]" />
                Durasi
              </label>
              <input
                type="text"
                placeholder="Contoh: 6 Month"
                value={formData.durasi}
                onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#561269]" />
                Lokasi
              </label>
              <input
                type="text"
                placeholder="Contoh: WFA / Jakarta"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-[#561269]" />
                Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors bg-white cursor-pointer"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#561269]" />
                Kompensasi
              </label>
              <select
                value={formData.kompensasi}
                onChange={(e) => setFormData({ ...formData, kompensasi: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors bg-white cursor-pointer"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Pocket Money">Pocket Money</option>
              </select>
            </div>
          </div>

          {/* Section 3: Application Deadline */}
          <div className="max-w-md">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              Application Deadline <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                required
                value={toDateInputValue(formData.deadline)}
                onChange={(e) => {
                  const formatted = formatIsoToDisplayDate(e.target.value)
                  setFormData({ ...formData, deadline: formatted })
                  if (errors.deadline) setErrors({ ...errors, deadline: "" })
                }}
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.()
                  } catch {}
                }}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-colors cursor-pointer bg-white ${
                  errors.deadline
                    ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                    : "border-gray-200 focus:border-[#561269]"
                }`}
              />
            </div>
            {formData.deadline && (
              <p className="text-[11px] text-gray-400 mt-1">
                Format tersimpan: <span className="font-semibold text-gray-600">{formData.deadline}</span>
              </p>
            )}
            {errors.deadline && (
              <p className="text-xs text-rose-500 mt-1">{errors.deadline}</p>
            )}
          </div>

          {/* Section 4: Deskripsi Singkat */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Ringkasan tentang tujuan peran ini atau gambaran singkat lowongan..."
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors leading-relaxed"
            />
          </div>

          {/* Section 5: Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Responsibilities (Tanggung Jawab) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">Tulis satu butir per baris</span>
            </div>
            <textarea
              rows={6}
              required
              placeholder="Membantu merencanakan dan mengembangkan ide konten..."
              value={formData.responsibilitiesText}
              onChange={(e) => setFormData({ ...formData, responsibilitiesText: e.target.value })}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors font-mono leading-relaxed"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Petunjuk: Tekan <strong>Enter</strong> untuk membuat butir tanggung jawab baru yang akan tampil sebagai poin bertanda checklist pada halaman publik.
            </p>
          </div>

          {/* Section 6: Qualifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Qualifications (Kualifikasi) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">Tulis satu butir per baris</span>
            </div>
            <textarea
              rows={6}
              required
              placeholder="Mahasiswa aktif atau fresh graduate dari bidang terkait..."
              value={formData.qualificationsText}
              onChange={(e) => setFormData({ ...formData, qualificationsText: e.target.value })}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors font-mono leading-relaxed"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Petunjuk: Tekan <strong>Enter</strong> untuk membuat butir kualifikasi baru yang akan tampil sebagai poin bertanda checklist pada halaman publik.
            </p>
          </div>

          {/* Section 6b: Pertanyaan Seleksi / Screening Questions */}
          <div className="bg-[#FAF7FB] rounded-2xl border border-purple-100 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100/80 pb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#561269]" />
                  <span>Pertanyaan Formulir Pendaftaran (Screening Questions)</span>
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pertanyaan esai atau portofolio khusus yang wajib/opsional dijawab pelamar saat menekan tombol &ldquo;Apply Now&rdquo;.
                </p>
              </div>

              {!isAddingQuestion && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingQuestion(true)
                    setNewQuestionLabel("")
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0f172a]" />
                  <span>Tambah Pertanyaan</span>
                </button>
              )}
            </div>

            {/* List Pertanyaan */}
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id || `q-${idx}`}
                  className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200 flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-[#561269] bg-purple-50 px-2 py-0.5 rounded-md">
                        Butir #{idx + 1}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase">
                        Tipe: {q.type === "url" ? "Link / URL" : q.type === "text" ? "Teks Singkat" : "Esai / Paragraf"}
                      </span>
                      {q.required && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          Wajib Diisi
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 font-medium">{q.label}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQuestions(questions.filter((_, i) => i !== idx))
                    }}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus pertanyaan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form Tambah Pertanyaan Baru */}
            {isAddingQuestion && (
              <div className="bg-white rounded-xl border-2 border-dashed border-[#561269]/40 p-4 space-y-3 animate-in fade-in duration-150">
                <h5 className="text-xs font-bold text-gray-900">Tambah Butir Pertanyaan Baru:</h5>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Label Pertanyaan
                  </label>
                  <input
                    type="text"
                    value={newQuestionLabel}
                    onChange={(e) => setNewQuestionLabel(e.target.value)}
                    placeholder="Contoh: Mengapa Anda tertarik untuk mengikuti program magang pada posisi ini?"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#561269]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Tipe Isian Jawaban
                    </label>
                    <select
                      value={newQuestionType}
                      onChange={(e) =>
                        setNewQuestionType(e.target.value as "text" | "textarea")
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#561269] bg-white"
                    >
                      <option value="textarea">Esai Panjang / Paragraf</option>
                      <option value="text">Teks Singkat</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="check-required"
                      checked={newQuestionRequired}
                      onChange={(e) => setNewQuestionRequired(e.target.checked)}
                      className="w-4 h-4 text-[#561269] rounded border-gray-300 cursor-pointer"
                    />
                    <label
                      htmlFor="check-required"
                      className="text-xs text-gray-700 font-semibold cursor-pointer"
                    >
                      Wajib Diisi oleh Pelamar
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingQuestion(false)
                      setNewQuestionLabel("")
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newQuestionLabel.trim()) return
                      setQuestions([
                        ...questions,
                        {
                          id: `q-${Date.now()}`,
                          label: newQuestionLabel.trim(),
                          type: newQuestionType,
                          required: newQuestionRequired,
                        },
                      ])
                      setIsAddingQuestion(false)
                      setNewQuestionLabel("")
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Simpan Pertanyaan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 7: Status Publikasi Halaman Klien */}
          <div className="p-5 bg-[#FAF7FB] rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#561269]" />
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Status Publikasi Lowongan
                </h4>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.isOpen
                  ? "Lowongan ini berstatus DIBUKA dan dapat langsung dilihat serta dilamar di halaman /internship."
                  : "Lowongan ini berstatus DITUTUP (arsip/draft) dan tidak akan ditampilkan pada halaman web publik."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto shrink-0 ${
                formData.isOpen
                  ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {formData.isOpen ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Dibuka (Tampil di Klien)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Ditutup (Disembunyikan)</span>
                </>
              )}
            </button>
          </div>

          {/* ── Action Buttons Footer ── */}
          <div className="pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Link
              href="/admin/internship"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs sm:text-sm transition-colors text-center"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#0f172a]" />
                  <span>{isEditMode ? "Simpan Perubahan" : "Tambah Posisi"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
