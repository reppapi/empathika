"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react"
import {
  internshipService,
  InternshipPosition,
  InternshipQuestion,
} from "@/services/internship.service"
import { FormPositionBasicSection } from "./form/FormPositionBasicSection"
import { FormPositionRequirementsSection } from "./form/FormPositionRequirementsSection"
import { FormPositionQuestionsSection } from "./form/FormPositionQuestionsSection"

interface Props {
  positionId?: string
}

export default function AdminInternshipFormClient({ positionId }: Props) {
  const router = useRouter()
  const isEditMode = Boolean(positionId)

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
      <div className="w-full rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white p-4 sm:p-8 md:p-10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Informasi Dasar Posisi */}
          <FormPositionBasicSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />

          {/* Section 2: Responsibilities & Qualifications */}
          <FormPositionRequirementsSection
            responsibilitiesText={formData.responsibilitiesText}
            qualificationsText={formData.qualificationsText}
            onChangeResponsibilities={(val) =>
              setFormData((prev) => ({ ...prev, responsibilitiesText: val }))
            }
            onChangeQualifications={(val) =>
              setFormData((prev) => ({ ...prev, qualificationsText: val }))
            }
          />

          {/* Section 3: Pertanyaan Khusus Posisi */}
          <FormPositionQuestionsSection
            questions={questions}
            setQuestions={setQuestions}
            isAddingQuestion={isAddingQuestion}
            setIsAddingQuestion={setIsAddingQuestion}
            newQuestionLabel={newQuestionLabel}
            setNewQuestionLabel={setNewQuestionLabel}
            newQuestionType={newQuestionType}
            setNewQuestionType={setNewQuestionType}
            newQuestionRequired={newQuestionRequired}
            setNewQuestionRequired={setNewQuestionRequired}
          />

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/internship")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-xs sm:text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {submitting
                  ? "Menyimpan..."
                  : isEditMode
                  ? "Perbarui Posisi"
                  : "Simpan & Publikasikan"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
