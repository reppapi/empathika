"use client"

import React, { useState, useEffect } from "react"
import { Loader2, Send, AlertCircle } from "lucide-react"
import {
  getPengajuanKerjaSama,
  savePengajuanKerjaSama,
  getFormulirConfigs,
  saveFormulirConfigs,
  getKerjaSamaConfig,
  getCleanWhatsAppNumber,
  isFormulirFileQuestion,
  mapBackendFormulirToConfig,
  sortFormulirConfigs,
  INITIAL_FORMULIR_CONFIGS,
} from "../../data/initialData"
import { PengajuanKerjaSama, FormulirConfigItem } from "../../types"
import { kerjaSamaService } from "@/services/kerja-sama.service"
import { adminService } from "@/services/admin.service"
import { useTenantContext } from "@/context/TenantContext"
import FormulirHeader from "./formulir/FormulirHeader"
import FormulirAffiliateView from "./formulir/FormulirAffiliateView"
import FormulirSuccessView from "./formulir/FormulirSuccessView"
import FormulirIdentitySection from "./formulir/FormulirIdentitySection"
import FormulirQuestionsSection from "./formulir/FormulirQuestionsSection"
import FormulirProposalSection from "./formulir/FormulirProposalSection"

interface FormulirKerjaSamaClientProps {
  formType?: string
}

export default function FormulirKerjaSamaClient({
  formType = "asesmen",
}: FormulirKerjaSamaClientProps) {
  const { isBiro, biroProfile } = useTenantContext()
  const brandName = isBiro && biroProfile?.nama_biro ? biroProfile.nama_biro : "Empathika"

  const [allFormConfigs, setAllFormConfigs] = useState<FormulirConfigItem[]>(INITIAL_FORMULIR_CONFIGS)
  const [waNumber, setWaNumber] = useState<string>("6287878785498")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setAllFormConfigs(getFormulirConfigs())

    const fetchLatestForms = () => {
      kerjaSamaService
        .getFormulirList()
        .then((res: any) => {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = sortFormulirConfigs(
              res.data
                .map(mapBackendFormulirToConfig)
                .filter((f: FormulirConfigItem) => f.slug !== "affiliate")
            )
            if (mapped.length > 0) {
              setAllFormConfigs(mapped)
              saveFormulirConfigs(mapped)
            }
          }
        })
        .catch(() => {})
    }

    fetchLatestForms()

    const refreshWaNumber = () => {
      const cfg = getKerjaSamaConfig()
      setWaNumber(getCleanWhatsAppNumber(cfg?.kontak?.whatsapp))
    }

    const handleFormSync = () => {
      setAllFormConfigs(getFormulirConfigs())
      fetchLatestForms()
    }

    refreshWaNumber()

    adminService
      .getPublicProfile()
      .then((res: any) => {
        if (res?.data) {
          const p = res.data
          const phone = p.no_telepon || p.noTelepon
          if (phone && phone !== "081234567890") {
            try {
              const currentAdmin = localStorage.getItem("empathika_admin_profile")
              const parsed = currentAdmin ? JSON.parse(currentAdmin) : {}
              localStorage.setItem(
                "empathika_admin_profile",
                JSON.stringify({
                  ...parsed,
                  noTelepon: phone,
                  email: p.email || parsed.email,
                })
              )
            } catch {}
          }
          refreshWaNumber()
        }
      })
      .catch(() => {})

    window.addEventListener("empathika_admin_profile_updated", refreshWaNumber)
    window.addEventListener("empathika_formulir_updated", handleFormSync)
    window.addEventListener("storage", refreshWaNumber)
    window.addEventListener("storage", handleFormSync)
    window.addEventListener("focus", refreshWaNumber)
    window.addEventListener("focus", handleFormSync)

    return () => {
      window.removeEventListener("empathika_admin_profile_updated", refreshWaNumber)
      window.removeEventListener("empathika_formulir_updated", handleFormSync)
      window.removeEventListener("storage", refreshWaNumber)
      window.removeEventListener("storage", handleFormSync)
      window.removeEventListener("focus", refreshWaNumber)
      window.removeEventListener("focus", handleFormSync)
    }
  }, [])

  const currentConfigs = isMounted ? allFormConfigs : INITIAL_FORMULIR_CONFIGS
  const formConfig =
    currentConfigs.find((f) => f.slug === formType) ||
    currentConfigs[0] ||
    INITIAL_FORMULIR_CONFIGS[0]

  // State Biodata Dasar
  const [namaLengkap, setNamaLengkap] = useState("")
  const [namaInstitusi, setNamaInstitusi] = useState("")
  const [nomorWhatsapp, setNomorWhatsapp] = useState("")
  const [emailPIC, setEmailPIC] = useState("")
  const [tipeInstitusi, setTipeInstitusi] = useState("Sekolah / Universitas")

  // State Jawaban Dinamis Khusus Tiap Form
  const [jawabanKhusus, setJawabanKhusus] = useState<Record<string, string>>({})
  const [catatanKebutuhan, setCatatanKebutuhan] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State Validasi Formulir
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setJawabanKhusus((prev) => {
      const next: Record<string, string> = {}
      formConfig.pertanyaanKhusus.forEach((p) => {
        if (prev[p.key] !== undefined && prev[p.key] !== "") {
          next[p.key] = prev[p.key]
        } else if (p.options && p.options.length > 0) {
          next[p.key] = p.options[0]
        } else {
          next[p.key] = ""
        }
      })
      return next
    })
  }, [formConfig])

  // Helper cek apakah pertanyaan tertentu bersifat opsional
  const isQuestionOptional = (q: { key: string; label: string; required?: boolean }) => {
    if (q.required === false) return true
    const lowerLabel = q.label.toLowerCase()
    if (lowerLabel.includes("opsional") || lowerLabel.includes("(opsional)")) return true
    if (q.required === true) return false
    if (q.key.toLowerCase().includes("proposal")) return true
    return false
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!namaLengkap.trim()) {
      errors.namaLengkap = "Nama lengkap wajib diisi."
    }

    if (!namaInstitusi.trim()) {
      errors.namaInstitusi = "Nama institusi / organisasi wajib diisi."
    }

    const cleanPhone = nomorWhatsapp.replace(/\D/g, "")
    if (!cleanPhone) {
      errors.nomorWhatsapp = "Nomor WhatsApp wajib diisi."
    } else if (cleanPhone.length < 9) {
      errors.nomorWhatsapp = "Nomor WhatsApp minimal 9 digit."
    }

    if (!emailPIC.trim()) {
      errors.emailPIC = "Alamat email wajib diisi."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPIC.trim())) {
      errors.emailPIC = "Format alamat email tidak valid (contoh: nama@instansi.com)."
    }

    formConfig.pertanyaanKhusus.forEach((q) => {
      if (isQuestionOptional(q)) return
      const val = jawabanKhusus[q.key]
      if (!val || !val.trim()) {
        errors[q.key] = `${q.label} wajib diisi.`
      }
    })

    return errors
  }

  const handleKhususChange = (key: string, value: string) => {
    setJawabanKhusus((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key] && value.trim()) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    setSubmitError(null)

    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0]
      const el = document.getElementById(`field-${firstErrorKey}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        if (typeof (el as any).focus === "function") {
          ;(el as any).focus()
        }
      }
      return
    }

    if (isSubmitting || isSubmitted) return
    setIsSubmitting(true)

    const now = new Date()
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ]
    const tanggalStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

    const cleanEmail = emailPIC.trim()
      ? emailPIC.trim()
      : `${namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, "") || "mitra"}@institusi.id`

    const detailLengkap: Record<string, string> = {
      "Nama Lengkap / PIC": namaLengkap.trim(),
      "Nama Institusi / Organisasi": namaInstitusi.trim(),
      "Nomor WhatsApp": nomorWhatsapp.trim(),
      "Email PIC": cleanEmail,
      "Tipe Institusi": tipeInstitusi,
      "Tipe Formulir": formConfig.title,
    }

    formConfig.pertanyaanKhusus.forEach((q) => {
      detailLengkap[q.label] = jawabanKhusus[q.key] || "-"
    })

    if (catatanKebutuhan.trim()) {
      detailLengkap["Catatan / Kebutuhan Tambahan"] = catatanKebutuhan.trim()
    }

    const pesanKebutuhan = `Pengajuan melalui ${formConfig.title}. ${
      catatanKebutuhan ? `Catatan: ${catatanKebutuhan}` : ""
    }`

    let backendId = "lead_" + Date.now()

    try {
      const res = await kerjaSamaService.submitPengajuan({
        nama_instansi: namaInstitusi.trim(),
        nama_pic: namaLengkap.trim(),
        email: cleanEmail,
        no_telepon: nomorWhatsapp.trim(),
        kategori: tipeInstitusi.split("/")[0].trim() || formConfig.categoryDefault,
        tipe_formulir: formType,
        pesan: pesanKebutuhan,
        jawaban_detail: detailLengkap,
      })

      if (res?.data?.id) {
        backendId = res.data.id
      }
    } catch (apiErr: any) {
      console.error("Backend API submit pengajuan error:", apiErr)
      setIsSubmitting(false)
      setSubmitError(
        apiErr?.response?.data?.message ||
          apiErr?.message ||
          "Gagal mengirimkan pengajuan kerja sama. Silakan periksa kembali formulir Anda."
      )
      return
    }

    const existingLeads = getPengajuanKerjaSama()
    const cleanPhone = nomorWhatsapp.replace(/\D/g, "")
    const isRecentDuplicate = existingLeads.some(
      (l) =>
        l.namaInstansi.toLowerCase() === namaInstitusi.trim().toLowerCase() &&
        l.telepon.replace(/\D/g, "") === cleanPhone &&
        l.tipeFormulir === formType
    )

    if (!isRecentDuplicate) {
      const newLead: PengajuanKerjaSama = {
        id: backendId,
        tanggal: tanggalStr,
        namaInstansi: namaInstitusi.trim(),
        kategori: tipeInstitusi.split("/")[0].trim() || formConfig.categoryDefault,
        namaPIC: namaLengkap.trim(),
        email: cleanEmail,
        telepon: nomorWhatsapp.trim(),
        pesan: pesanKebutuhan,
        status: "Menunggu",
        tipeFormulir: formType as any,
        formTitle: formConfig.title,
        jawabanDetail: detailLengkap,
      }
      savePengajuanKerjaSama([newLead, ...existingLeads])
    }

    setIsSubmitting(false)
    setIsSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const waAdminUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Admin ${brandName}, saya ${namaLengkap} dari ${namaInstitusi}. Saya baru saja mengisi ${formConfig.title} dan ingin konfirmasi lebih lanjut.`
  )}`

  // ── SPECIAL VIEW: AFFILIATE PROGRAM ──
  if (formType === "affiliate") {
    return <FormulirAffiliateView brandName={brandName} waNumber={waNumber} />
  }

  // ── SPECIAL VIEW: BERHASIL SUBMIT ──
  if (isSubmitted) {
    return (
      <FormulirSuccessView
        brandName={brandName}
        formTitle={formConfig.title}
        namaInstitusi={namaInstitusi}
        tipeInstitusi={tipeInstitusi}
        namaLengkap={namaLengkap}
        nomorWhatsapp={nomorWhatsapp}
        emailPIC={emailPIC}
        waAdminUrl={waAdminUrl}
      />
    )
  }

  // Pisahkan pertanyaan isian/pilihan (Bagian 2) dan pertanyaan upload file (Bagian 3)
  const formQuestions = formConfig.pertanyaanKhusus.filter((q) => !isFormulirFileQuestion(q))
  const fileQuestions = formConfig.pertanyaanKhusus.filter((q) => isFormulirFileQuestion(q))

  return (
    <div className="min-h-screen bg-[#FAF7FB] font-poppins pb-24">
      {/* ── HEADER NAVIGATION ── */}
      <FormulirHeader title={formConfig.title} description={formConfig.description} />

      {/* ── FORM CONTAINER ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-3xl border border-purple-100 shadow-xl p-6 sm:p-10 space-y-10"
        >
          {/* Error Banner jika submit gagal */}
          {hasAttemptedSubmit && Object.keys(formErrors).length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-bold">Mohon lengkapi kolom yang wajib diisi:</p>
                <p className="text-xs mt-0.5 text-rose-600">
                  Periksa kembali isian formulir Anda yang bertanda bintang merah (*).
                </p>
              </div>
            </div>
          )}

          {/* ── SECTION 1: DATA PIC & INSTITUSI ── */}
          <FormulirIdentitySection
            namaLengkap={namaLengkap}
            setNamaLengkap={setNamaLengkap}
            namaInstitusi={namaInstitusi}
            setNamaInstitusi={setNamaInstitusi}
            emailPIC={emailPIC}
            setEmailPIC={setEmailPIC}
            nomorWhatsapp={nomorWhatsapp}
            setNomorWhatsapp={setNomorWhatsapp}
            tipeInstitusi={tipeInstitusi}
            setTipeInstitusi={setTipeInstitusi}
            hasAttemptedSubmit={hasAttemptedSubmit}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
          />

          {/* ── SECTION 2: KEBUTUHAN PROGRAM & PELAKSANAAN ── */}
          <FormulirQuestionsSection
            questions={formQuestions}
            jawabanKhusus={jawabanKhusus}
            handleKhususChange={handleKhususChange}
            catatanKebutuhan={catatanKebutuhan}
            setCatatanKebutuhan={setCatatanKebutuhan}
            hasAttemptedSubmit={hasAttemptedSubmit}
            formErrors={formErrors}
            isQuestionOptional={isQuestionOptional}
          />

          {/* ── SECTION 3: BERKAS PROPOSAL & PENDUKUNG ── */}
          <FormulirProposalSection
            questions={fileQuestions}
            jawabanKhusus={jawabanKhusus}
            handleKhususChange={handleKhususChange}
            hasAttemptedSubmit={hasAttemptedSubmit}
            formErrors={formErrors}
            isQuestionOptional={isQuestionOptional}
          />

          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span className="font-medium">{submitError}</span>
            </div>
          )}

          {/* ── SUBMIT BUTTON & FOOTER NOTE ── */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Dengan mengirim formulir ini, Anda menyetujui tim kemitraan kami menghubungi kontak Anda.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || isSubmitted}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] active:scale-95 text-[#0f172a] font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0f172a] shrink-0" />
                  <span>Mengirimkan Pengajuan...</span>
                </>
              ) : (
                <>
                  <span>Kirim Pengajuan Kerja Sama</span>
                  <Send className="w-3.5 h-3.5 ml-0.5 text-[#0f172a] shrink-0" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
