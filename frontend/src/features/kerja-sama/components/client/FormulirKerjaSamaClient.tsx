"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Check,
  AlertCircle,
  Building2,
  User,
  Mail,
  FileText,
  Upload,
  Loader2,
  Clock,
  Sparkles,
  Send,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react"
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
import PhoneInputField from "@/components/shared/PhoneInputField"

interface FormSelectDropdownProps {
  value: string
  onChange: (val: string) => void
  options: string[]
  placeholder?: string
}

function FormSelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi...",
}: FormSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = value || options[0] || ""

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl text-sm text-gray-800 bg-white transition-all flex items-center justify-between text-left cursor-pointer border ${
          isOpen
            ? "border-[#561269] ring-2 ring-[#561269]/20 outline-none"
            : "border-gray-300 hover:border-[#561269] focus:outline-none"
        }`}
      >
        <span className={selectedOption ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedOption || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#561269]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = selectedOption === opt
              return (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                  }}
                  className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-purple-50 text-[#561269] font-bold"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#561269] shrink-0 ml-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface FormProposalUploadProps {
  value: string
  onChange: (val: string) => void
  label?: string
}

function FormProposalUpload({ value, onChange }: FormProposalUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  let parsedFile: { url: string; filename: string; size?: number } | null = null
  if (value) {
    try {
      if (value.startsWith("{")) {
        parsedFile = JSON.parse(value)
      } else {
        parsedFile = { url: value, filename: "Proposal_Kerjasama.pdf" }
      }
    } catch {
      parsedFile = { url: value, filename: "Proposal_Kerjasama.pdf" }
    }
  }

  const handleProcessFile = async (file: File) => {
    if (!file) return
    setUploadError(null)

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar. Maksimal 15 MB.")
      return
    }

    setIsUploading(true)
    try {
      const res = await kerjaSamaService.uploadProposal(file)
      if (res?.data?.url) {
        const filePayload = {
          url: res.data.url,
          filename: res.data.originalName || file.name,
          size: res.data.size || file.size,
        }
        onChange(JSON.stringify(filePayload))
        setIsUploading(false)
        return
      }
    } catch (err: any) {
      console.warn("Upload proposal to backend failed, falling back to local reader:", err?.message || err)
    }

    try {
      const reader = new FileReader()
      reader.onload = () => {
        const filePayload = {
          url: reader.result as string,
          filename: file.name,
          size: file.size,
        }
        onChange(JSON.stringify(filePayload))
        setIsUploading(false)
      }
      reader.onerror = () => {
        setUploadError("Gagal membaca file proposal.")
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (fallbackErr) {
      setUploadError("Terjadi kesalahan saat memproses file.")
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleProcessFile(file)
    e.target.value = ""
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="border border-purple-200 bg-purple-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#561269] animate-spin mb-2" />
          <p className="text-sm font-bold text-gray-900">Mengunggah berkas proposal...</p>
          <p className="text-xs text-gray-500 mt-0.5">Harap tunggu proses unggah selesai</p>
        </div>
      ) : parsedFile ? (
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {parsedFile.filename || "Proposal_Kerjasama.pdf"}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                  <Check className="w-3 h-3" /> Terunggah
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {parsedFile.size && <span>{(parsedFile.size / (1024 * 1024)).toFixed(2)} MB • </span>}
                {parsedFile.url && !parsedFile.url.startsWith("data:") && (
                  <a
                    href={parsedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#561269] hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    Lihat Berkas <ExternalLink className="w-3 h-3 inline" />
                  </a>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[#561269] bg-purple-100 hover:bg-purple-200 px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl cursor-pointer transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleProcessFile(file)
          }}
          onClick={() => fileInputRef.current?.click()}
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
            Pilih berkas proposal atau seret ke sini
          </p>
          <p className="text-xs text-gray-500">
            Format PDF, Word (DOC/DOCX), atau Gambar (Maksimal 15 MB)
          </p>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>{uploadError}</span>
        </p>
      )}
    </div>
  )
}

interface FormulirKerjaSamaClientProps {
  formType?: string
}

const TIPE_INSTITUSI_OPTIONS = [
  "Sekolah / Universitas",
  "Perusahaan / Korporasi",
  "Komunitas / Organisasi",
  "Rumah Sakit / Faskes",
  "Instansi Pemerintah",
  "Lainnya",
]

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
      setSubmitError(apiErr?.response?.data?.message || apiErr?.message || "Gagal mengirimkan pengajuan kerja sama. Silakan periksa kembali formulir Anda.")
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
    return (
      <div className="min-h-screen bg-[#FAF7FB] font-poppins pb-24">
        <div className="bg-gradient-to-r from-[#561269] via-[#6f1886] to-[#8B3A9C] text-white pt-32 sm:pt-36 md:pt-40 pb-16 px-4 sm:px-6 lg:px-8 shadow-md">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                Program Kemitraan
              </span>
              <span className="px-3 py-1 rounded-full bg-[#EAB308] text-[#0f172a] text-xs font-bold">
                Affiliate
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2">
              Program Affiliate {brandName}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Berkolaborasi bersama kami dalam memperluas jangkauan layanan kesehatan mental dan raih komisi kemitraan menarik.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-xl p-8 sm:p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-purple-100 text-[#561269] rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              🤝
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Peluang Kolaborasi Affiliate
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                Program ini ditujukan bagi kreator konten, komunitas, konsultan, dan individu yang ingin berbagi manfaat edukasi serta layanan psikologis profesional.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-[#FAF7FB] border border-purple-100/70">
                <p className="font-bold text-[#561269] text-sm mb-1">💰 Komisi Menarik</p>
                <p className="text-xs text-gray-600">Bagi hasil kompetitif untuk setiap transaksi pengguna yang Anda ajak.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7FB] border border-purple-100/70">
                <p className="font-bold text-[#561269] text-sm mb-1">📊 Transparan</p>
                <p className="text-xs text-gray-600">Pencatatan rujukan rapi dan update laporan berkala dari tim kemitraan.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7FB] border border-purple-100/70">
                <p className="font-bold text-[#561269] text-sm mb-1">🎨 Dukungan Materi</p>
                <p className="text-xs text-gray-600">Materi promosi, konten edukatif, dan sesi briefing khusus bersama tim kami.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `Halo Tim Partnership ${brandName}, saya tertarik untuk bermitra dan berdiskusi seputar Program Affiliate.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0"
              >
                <span>Daftar / Konsultasi via WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/kerja-sama"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Kerja Sama</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SPECIAL VIEW: BERHASIL SUBMIT ──
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAF7FB] pt-36 pb-20 sm:py-28 px-4 font-poppins flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-4 py-1 rounded-full bg-purple-50 text-[#561269] text-xs font-bold uppercase tracking-wider mb-3">
            Pengajuan Diterima
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            Pengajuan Kerja Sama Berhasil Terkirim!
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            Terima kasih atas inisiatif kolaborasi bersama{" "}
            <span className="font-bold text-[#561269]">{brandName}</span> untuk program{" "}
            <span className="font-bold text-gray-900">{formConfig.title}</span>. Tim Kemitraan kami
            akan segera meninjau kebutuhan institusi Anda dan menghubungi melalui WhatsApp atau Email dalam 1–2 hari kerja.
          </p>

          <div className="bg-[#FAF7FB] border border-purple-100 rounded-2xl p-5 text-left mb-8 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Program Dipilih:</span>
              <span className="font-bold text-gray-900">{formConfig.title}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Institusi / Organisasi:</span>
              <span className="font-bold text-gray-900">{namaInstitusi} ({tipeInstitusi})</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Nama PIC:</span>
              <span className="font-bold text-gray-900">{namaLengkap}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>WhatsApp:</span>
              <span className="font-bold text-gray-900">{nomorWhatsapp}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Email:</span>
              <span className="font-bold text-gray-900">{emailPIC}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center">
            <a
              href={waAdminUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0"
            >
              <span>Konfirmasi via WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <Link
              href="/kerja-sama"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Kerja Sama</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Pisahkan pertanyaan isian/pilihan (Bagian 2) dan pertanyaan upload file (Bagian 3)
  const formQuestions = formConfig.pertanyaanKhusus.filter((q) => !isFormulirFileQuestion(q))
  const fileQuestions = formConfig.pertanyaanKhusus.filter((q) => isFormulirFileQuestion(q))

  return (
    <div className="min-h-screen bg-[#FAF7FB] font-poppins pb-24">
      {/* ── HEADER NAVIGATION ── */}
      <div className="bg-gradient-to-r from-[#561269] via-[#6f1886] to-[#8B3A9C] text-white pt-32 sm:pt-36 md:pt-40 pb-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            {formConfig.title}
          </h1>

          <p className="text-white/85 text-xs sm:text-sm max-w-2xl leading-relaxed mb-4">
            {formConfig.description}
          </p>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Building2 className="w-4 h-4 text-[#EAB308]" />
              <span>Institusi & Perusahaan</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Clock className="w-4 h-4 text-[#EAB308]" />
              <span>Respon 1–2 Hari Kerja</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-[#EAB308]" />
              <span>Kemitraan Resmi & MoU</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORM CONTAINER ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
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
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Informasi Pemohon & Institusi</h2>
                <p className="text-xs text-gray-500">
                  Lengkapi identitas penanggung jawab (PIC) dan profil instansi / organisasi Anda.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nama Lengkap PIC */}
              <div id="field-namaLengkap">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  NAMA LENGKAP / PIC <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => {
                      setNamaLengkap(e.target.value)
                      if (formErrors.namaLengkap && e.target.value.trim()) {
                        setFormErrors((prev) => {
                          const next = { ...prev }
                          delete next.namaLengkap
                          return next
                        })
                      }
                    }}
                    placeholder="Contoh: Muhammad Kevin Pradana"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                      hasAttemptedSubmit && formErrors.namaLengkap
                        ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {hasAttemptedSubmit && formErrors.namaLengkap && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{formErrors.namaLengkap}</span>
                  </p>
                )}
              </div>

              {/* Nama Institusi */}
              <div id="field-namaInstitusi">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  NAMA INSTITUSI / ORGANISASI <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={namaInstitusi}
                    onChange={(e) => {
                      setNamaInstitusi(e.target.value)
                      if (formErrors.namaInstitusi && e.target.value.trim()) {
                        setFormErrors((prev) => {
                          const next = { ...prev }
                          delete next.namaInstitusi
                          return next
                        })
                      }
                    }}
                    placeholder="Contoh: PT Bangun Bangsa Sejahtera / Universitas X"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                      hasAttemptedSubmit && formErrors.namaInstitusi
                        ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {hasAttemptedSubmit && formErrors.namaInstitusi && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{formErrors.namaInstitusi}</span>
                  </p>
                )}
              </div>

              {/* Alamat Email */}
              <div id="field-emailPIC">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  EMAIL AKTIF PIC <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailPIC}
                    onChange={(e) => {
                      setEmailPIC(e.target.value)
                      if (formErrors.emailPIC && e.target.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                        setFormErrors((prev) => {
                          const next = { ...prev }
                          delete next.emailPIC
                          return next
                        })
                      }
                    }}
                    placeholder="nama@institusi.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                      hasAttemptedSubmit && formErrors.emailPIC
                        ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {hasAttemptedSubmit && formErrors.emailPIC && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{formErrors.emailPIC}</span>
                  </p>
                )}
              </div>

              {/* No. WhatsApp PIC */}
              <div id="field-nomorWhatsapp">
                <PhoneInputField
                  value={nomorWhatsapp}
                  label="No WhatsApp"
                  labelClassName="font-bold"
                  required
                  inputClassName={`px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                    hasAttemptedSubmit && formErrors.nomorWhatsapp
                      ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                      : "border-gray-300"
                  }`}
                  onChange={(val) => {
                    setNomorWhatsapp(val)
                    if (formErrors.nomorWhatsapp && val.replace(/\D/g, "").length >= 9) {
                      setFormErrors((prev) => {
                        const next = { ...prev }
                        delete next.nomorWhatsapp
                        return next
                      })
                    }
                  }}
                  placeholder="81234567890"
                />
                {hasAttemptedSubmit && formErrors.nomorWhatsapp && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{formErrors.nomorWhatsapp}</span>
                  </p>
                )}
              </div>

              {/* Tipe Institusi Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  TIPE INSTITUSI / ORGANISASI <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TIPE_INSTITUSI_OPTIONS.map((opt) => {
                    const isSelected = tipeInstitusi === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTipeInstitusi(opt)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left ${
                          isSelected
                            ? "border-[#561269] bg-purple-50 text-[#561269] shadow-xs ring-1 ring-[#561269]"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="truncate">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: KEBUTUHAN PROGRAM & PELAKSANAAN ── */}
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Kebutuhan & Gambaran Kegiatan</h2>
                <p className="text-xs text-gray-500">
                  Spesifikasi program, target peserta, dan estimasi waktu pelaksanaan kegiatan.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dynamic Questions for this specific form */}
              {formQuestions.map((q, idx) => {
                const isOptional = isQuestionOptional(q)

                const isBudgetOrSelect =
                  q.type === "select" ||
                  (q as any).type === "dropdown" ||
                  (q.options && q.label.toLowerCase().includes("budget")) ||
                  q.key.toLowerCase().includes("budget")

                const effectiveOptions =
                  q.options && q.options.length > 0
                    ? q.options
                    : []

                return (
                  <div key={q.key} id={`field-${q.key}`} className="bg-[#FAF7FB] rounded-2xl p-5 border border-purple-100/70">
                    <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2.5">
                      {idx + 1}. {q.label}
                      {!isOptional && <span className="text-rose-500 font-bold ml-1">*</span>}
                    </label>

                    {isBudgetOrSelect ? (
                      <FormSelectDropdown
                        value={jawabanKhusus[q.key] || effectiveOptions[0] || ""}
                        onChange={(val) => handleKhususChange(q.key, val)}
                        options={effectiveOptions}
                        placeholder="Pilih rentang estimasi budget..."
                      />
                    ) : q.type === "radio" && q.options ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt) => {
                          const isSelected = (jawabanKhusus[q.key] || q.options![0]) === opt
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleKhususChange(q.key, opt)}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm transition-all text-left ${
                                isSelected
                                  ? "border-[#561269] bg-white text-[#561269] font-bold shadow-xs ring-1 ring-[#561269]"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 font-medium"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300"
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="leading-snug">{opt}</span>
                            </button>
                          )
                        })}
                      </div>
                    ) : q.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={jawabanKhusus[q.key] || ""}
                        onChange={(e) => handleKhususChange(q.key, e.target.value)}
                        placeholder={q.placeholder || "Tuliskan jawaban Anda..."}
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                          !isOptional && hasAttemptedSubmit && formErrors[q.key]
                            ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                            : "border-gray-300"
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={jawabanKhusus[q.key] || ""}
                        onChange={(e) => handleKhususChange(q.key, e.target.value)}
                        placeholder={q.placeholder || "Tuliskan jawaban Anda..."}
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                          !isOptional && hasAttemptedSubmit && formErrors[q.key]
                            ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                            : "border-gray-300"
                        }`}
                      />
                    )}

                    {!isOptional && hasAttemptedSubmit && formErrors[q.key] && (
                      <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>{formErrors[q.key]}</span>
                      </p>
                    )}
                  </div>
                )
              })}

              {/* Catatan / Gambaran Kegiatan Tambahan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  CATATAN TAMBAHAN / GAMBARAN KEGIATAN (OPSIONAL)
                </label>
                <textarea
                  rows={3}
                  value={catatanKebutuhan}
                  onChange={(e) => setCatatanKebutuhan(e.target.value)}
                  placeholder="Tuliskan jika ada kebutuhan khusus, topik bahasan spesifik, atau informasi penting lainnya..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: BERKAS PROPOSAL & PENDUKUNG ── */}
          {fileQuestions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Lampiran Dokumen & Proposal</h2>
                  <p className="text-xs text-gray-500">
                    Unggah berkas dokumen atau proposal kerja sama sesuai kebutuhan formulir di bawah ini.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {fileQuestions.map((q) => {
                  const isOptional = isQuestionOptional(q)
                  return (
                    <div key={q.key} id={`field-${q.key}`}>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                        {q.label}
                        {!isOptional && <span className="text-rose-500 font-bold ml-1">*</span>}
                      </label>
                      <FormProposalUpload
                        value={jawabanKhusus[q.key] || ""}
                        onChange={(val) => handleKhususChange(q.key, val)}
                      />
                      {!isOptional && hasAttemptedSubmit && formErrors[q.key] && (
                        <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                          <span>{formErrors[q.key]}</span>
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
