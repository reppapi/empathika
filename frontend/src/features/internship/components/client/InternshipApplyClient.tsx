"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Send, Loader2 } from "lucide-react"
import {
  internshipService,
  InternshipPosition,
  InternshipQuestion,
} from "@/services/internship.service"
import { adminService } from "@/services/admin.service"
import { useTenant } from "@/hooks/useTenant"
import { ApplyHeader } from "./apply/ApplyHeader"
import { ApplyIdentitySection } from "./apply/ApplyIdentitySection"
import { ApplyQuestionsSection } from "./apply/ApplyQuestionsSection"
import { ApplyUploadSection } from "./apply/ApplyUploadSection"
import { ApplySuccessView } from "./apply/ApplySuccessView"
import { ApplyNotFoundView } from "./apply/ApplyNotFoundView"

interface Props {
  positionId: string
}

export default function InternshipApplyClient({ positionId }: Props) {
  const router = useRouter()
  const { withBiro } = useTenant()
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

  // Kontak WhatsApp Admin Empathika
  const [waNumber, setWaNumber] = useState("6287878785498")

  useEffect(() => {
    try {
      const currentAdmin = localStorage.getItem("empathika_admin_profile")
      if (currentAdmin) {
        const parsed = JSON.parse(currentAdmin)
        if (parsed.noTelepon) {
          const clean = parsed.noTelepon.replace(/\D/g, "").replace(/^0/, "62")
          if (clean.length >= 10) setWaNumber(clean)
        }
      }
    } catch {}

    adminService
      .getPublicProfile()
      .then((res: any) => {
        const phone = res?.data?.no_telepon || res?.data?.noTelepon
        if (phone) {
          const clean = phone.replace(/\D/g, "").replace(/^0/, "62")
          if (clean.length >= 10 && !clean.includes("81234567890")) {
            setWaNumber(clean)
          }
        }
      })
      .catch(() => {})
  }, [])

  // Dynamic answers to questions
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // File Upload State (CV)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvFileName, setCvFileName] = useState<string>("")
  const [cvFileSize, setCvFileSize] = useState<string>("")
  const [uploadingCv, setUploadingCv] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [cvUploadMode, setCvUploadMode] = useState<"file" | "link">("file")

  // File Upload State (Portofolio)
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [portfolioFileName, setPortfolioFileName] = useState<string>("")
  const [portfolioFileSize, setPortfolioFileSize] = useState<string>("")
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
  const [isDraggingPortfolio, setIsDraggingPortfolio] = useState(false)
  const [portfolioUploadMode, setPortfolioUploadMode] = useState<"file" | "link">("file")

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

  const handlePortfolioFileChange = async (file: File) => {
    if (!file) return
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("Ukuran berkas portofolio terlalu besar. Maksimal 25 MB.")
      return
    }

    setPortfolioFile(file)
    setPortfolioFileName(file.name)
    setPortfolioFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB")
    setUploadingPortfolio(true)
    setErrorMessage(null)

    try {
      const res = await internshipService.uploadFile(file)
      setFormData((prev) => ({ ...prev, portfolioUrl: res.url }))
    } catch (err: any) {
      console.error("Gagal upload berkas portofolio:", err)
      setErrorMessage("Gagal mengunggah berkas portofolio: " + (err.message || "Kesalahan server"))
      setPortfolioFile(null)
      setPortfolioFileName("")
    } finally {
      setUploadingPortfolio(false)
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
  const activeQuestions: InternshipQuestion[] = position?.questions || []

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!position) return

    const notifyError = (msg: string) => {
      setErrorMessage(msg)
      window.scrollTo({ top: 250, behavior: "smooth" })
    }

    // Validasi form dasar
    if (!formData.nama.trim()) {
      notifyError("Nama lengkap wajib diisi.")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      notifyError("Alamat email yang valid wajib diisi.")
      return
    }
    if (!formData.telepon.trim()) {
      notifyError("Nomor WhatsApp/telepon wajib diisi.")
      return
    }
    if (!formData.universitas.trim()) {
      notifyError("Asal universitas / institusi wajib diisi.")
      return
    }
    if (uploadingCv) {
      notifyError("Harap tunggu hingga proses unggah berkas CV selesai.")
      return
    }
    if (uploadingPortfolio) {
      notifyError("Harap tunggu hingga proses unggah berkas portofolio selesai.")
      return
    }
    if (!formData.cvUrl.trim()) {
      notifyError(
        cvUploadMode === "file"
          ? "Silakan unggah berkas CV / Resume Anda terlebih dahulu."
          : "Tautan Link CV / Resume wajib dicantumkan."
      )
      return
    }

    // Validasi pertanyaan wajib
    for (let idx = 0; idx < activeQuestions.length; idx++) {
      const q = activeQuestions[idx]
      const qKey = q.id || `q-${idx}`
      if (q.required && !answers[qKey]?.trim()) {
        notifyError(`Harap jawab pertanyaan: "${q.label}"`)
        return
      }
    }

    setSubmitting(true)
    try {
      const formattedJawaban = activeQuestions.map((q, idx) => {
        const qKey = q.id || `q-${idx}`
        return {
          questionId: qKey,
          question: q.label,
          answer: answers[qKey]?.trim() || "-",
        }
      })

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
      notifyError(
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
    return <ApplyNotFoundView internshipListHref={withBiro("/internship")} />
  }

  if (isSuccess) {
    return (
      <ApplySuccessView
        formData={formData}
        positionTitle={position.judul}
        waNumber={waNumber}
        internshipListHref={withBiro("/internship")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB] font-poppins pb-24">
      {/* ── HEADER HERO ── */}
      <ApplyHeader position={position} />

      {/* ── FORM CONTAINER ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
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
          <ApplyIdentitySection formData={formData} setFormData={setFormData} />

          {/* ── SECTION 2: PERTANYAAN TAMBAHAN (JIKA ADA) ── */}
          {activeQuestions.length > 0 && (
            <ApplyQuestionsSection
              questions={activeQuestions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
            />
          )}

          {/* ── SECTION 3: UNGGAH BERKAS ── */}
          <ApplyUploadSection
            sectionNumber={activeQuestions.length > 0 ? 3 : 2}
            formData={formData}
            setFormData={setFormData}
            cvFile={cvFile}
            cvFileName={cvFileName}
            cvFileSize={cvFileSize}
            uploadingCv={uploadingCv}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            cvUploadMode={cvUploadMode}
            setCvUploadMode={setCvUploadMode}
            handleCvFileChange={handleCvFileChange}
            portfolioFile={portfolioFile}
            portfolioFileName={portfolioFileName}
            portfolioFileSize={portfolioFileSize}
            uploadingPortfolio={uploadingPortfolio}
            isDraggingPortfolio={isDraggingPortfolio}
            setIsDraggingPortfolio={setIsDraggingPortfolio}
            portfolioUploadMode={portfolioUploadMode}
            setPortfolioUploadMode={setPortfolioUploadMode}
            handlePortfolioFileChange={handlePortfolioFileChange}
          />

          {/* ── SUBMIT BUTTON ── */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Dengan mengirim formulir ini, Anda menyatakan bahwa data yang diisikan adalah benar.
            </p>

            <button
              type="submit"
              disabled={submitting || uploadingCv || uploadingPortfolio}
              className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan Lamaran...</span>
                </>
              ) : (
                <>
                  <span>Kirim Formulir Lamaran</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
