"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ChevronDown, Check, AlertCircle } from "lucide-react"
import {
  getPengajuanKerjaSama,
  savePengajuanKerjaSama,
  getFormulirConfigs,
  getKerjaSamaConfig,
  getCleanWhatsAppNumber,
  INITIAL_FORMULIR_CONFIGS,
} from "../../data/initialData"
import { PengajuanKerjaSama, FormulirConfigItem } from "../../types"
import { kerjaSamaService } from "@/services/kerja-sama.service"
import { adminService } from "@/services/admin.service"
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
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 bg-white transition-all flex items-center justify-between text-left cursor-pointer ${
          isOpen
            ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
            : "border border-gray-300 hover:border-gray-400 focus:outline-none"
        }`}
      >
        <span className={selectedOption ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedOption || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#0099ff]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Panel (Sesuai Referensi Gambar) */}
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
                  className={`px-4 py-2.5 text-sm md:text-base flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/70 text-gray-900 font-medium"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-gray-800 shrink-0 ml-2" />
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
  label: string
}

function FormProposalUpload({ value, onChange, label }: FormProposalUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // Validasi ukuran maksimal 15MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar. Maksimal 15MB.")
      e.target.value = ""
      return
    }

    setIsUploading(true)
    try {
      // 1. Coba upload ke backend
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

    // 2. Fallback jika backend offline: konversi ke Data URL
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
    } finally {
      e.target.value = ""
    }
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
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {parsedFile ? (
        <div className="p-3.5 sm:p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#561269] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              PDF
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate">
                {parsedFile.filename || "Proposal_Kerjasama.pdf"}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                ✓ File berhasil dilampirkan
                {parsedFile.size && (
                  <span className="text-gray-500 font-normal">
                    • {(parsedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold transition cursor-pointer"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-2.5 py-1.5 rounded-full text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
              title="Hapus file"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isUploading
              ? "border-purple-300 bg-purple-50/40 cursor-wait"
              : "border-gray-300 hover:border-[#561269] bg-white hover:bg-purple-50/20"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-6 h-6 border-2 border-[#561269] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-[#561269]">Mengunggah dokumen proposal...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-[#561269] flex items-center justify-center mb-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                Pilih file proposal atau klik di sini
              </p>
              <p className="text-[11px] text-gray-500">
                Mendukung PDF, Word (DOC/DOCX), atau Gambar (Maks. 15MB)
              </p>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-600 font-semibold mt-1.5">
          ⚠️ {uploadError}
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
  const [allFormConfigs, setAllFormConfigs] = useState<FormulirConfigItem[]>(INITIAL_FORMULIR_CONFIGS)
  const [waNumber, setWaNumber] = useState<string>("6287878785498")
  const [isMounted, setIsMounted] = useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    setAllFormConfigs(getFormulirConfigs())
    
    const refreshWaNumber = () => {
      const cfg = getKerjaSamaConfig()
      setWaNumber(getCleanWhatsAppNumber(cfg?.kontak?.whatsapp))
    }

    refreshWaNumber()

    // Sinkronkan data profil publik admin dari backend
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
    window.addEventListener("storage", refreshWaNumber)
    window.addEventListener("focus", refreshWaNumber)

    return () => {
      window.removeEventListener("empathika_admin_profile_updated", refreshWaNumber)
      window.removeEventListener("storage", refreshWaNumber)
      window.removeEventListener("focus", refreshWaNumber)
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
  const [activeInput, setActiveInput] = useState<string>("")

  // State Jawaban Dinamis Khusus Tiap Form
  const [jawabanKhusus, setJawabanKhusus] = useState<Record<string, string>>({})

  React.useEffect(() => {
    const initial: Record<string, string> = {}
    formConfig.pertanyaanKhusus.forEach((p) => {
      if (p.options && p.options.length > 0) {
        initial[p.key] = p.options[0]
      } else {
        initial[p.key] = ""
      }
    })
    setJawabanKhusus(initial)
  }, [formConfig])

  const [catatanKebutuhan, setCatatanKebutuhan] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper cek apakah pertanyaan tertentu bersifat opsional
  const isQuestionOptional = (q: { key: string; label: string; required?: boolean }) => {
    if (q.required === false) return true
    const lowerLabel = q.label.toLowerCase()
    if (lowerLabel.includes("opsional") || lowerLabel.includes("(opsional)")) return true
    if (q.key.toLowerCase().includes("proposal")) return true
    return false
  }

  // State Validasi Formulir
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

    // Email PIC wajib diisi dan harus berformat valid
    if (!emailPIC.trim()) {
      errors.emailPIC = "Alamat email wajib diisi."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPIC.trim())) {
      errors.emailPIC = "Format alamat email tidak valid (contoh: nama@instansi.com)."
    }

    // Validasi pertanyaan khusus (hanya yang TIDAK opsional)
    formConfig.pertanyaanKhusus.forEach((q) => {
      if (isQuestionOptional(q)) return // Opsional -> Tidak ada peringatan

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

    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      // Fokus dan scroll ke field pertama yang bermasalah
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

    // Siapkan dictionary jawaban detail yang lengkap
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

    // 1. Kirim data ke API Backend resmi (POST /kerja-sama/pengajuan)
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
    } catch (apiErr) {
      console.warn("Backend API submit pengajuan error (fallback to local):", apiErr)
    }

    // 2. Simpan juga ke cache lokal jika belum pernah ada submit persis dalam sesi ini
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
  }

  // Generate WA URL jika klien ingin langsung menghubungi setelah submit
  const waAdminUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Admin Empathika, saya ${namaLengkap} dari ${namaInstitusi}. Saya baru saja mengisi ${formConfig.title} dan ingin konfirmasi lebih lanjut.`
  )}`

  return (
    <div className="w-full min-h-screen bg-[#fbfbfb] font-sans pb-28 pt-32 lg:pt-36 relative overflow-hidden">
      {/* Background Decor Soft Blur */}
      <div className="absolute top-[-5%] left-[-10%] w-[35rem] h-[35rem] bg-purple-200/35 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[32rem] h-[32rem] bg-pink-200/25 rounded-full blur-[110px] pointer-events-none z-0"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Khusus Program Affiliate: Langsung Arahkan ke WhatsApp Tanpa Formulir */}
        {formType === "affiliate" ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
              📱
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#561269]">
                Program Affiliate Empathika
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                Untuk pendaftaran dan kemitraan Program Affiliate, Anda tidak perlu mengisi formulir panjang. Silakan langsung diskusikan dengan tim partnership kami via WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-gray-700 max-w-md mx-auto space-y-1">
              <div className="font-bold text-[#561269]">Benefit Program Affiliate:</div>
              <p>• Komisi & revenue share menarik per rujukan klien / event</p>
              <p>• Dukungan materi promosi & konsultasi bersama tim Empathika</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  "Halo Tim Partnership Empathika, saya tertarik untuk bermitra dan berdiskusi seputar Program Affiliate Empathika."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Hubungi via WhatsApp Sekarang</span>
              </a>

              <Link
                href="/kerja-sama"
                className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
              >
                Kembali ke Kerja Sama
              </Link>
            </div>
          </div>
        ) : isSubmitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#561269]">
                Formulir Berhasil Dikirim!
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                Terima kasih, jawaban formulir <strong>{namaInstitusi}</strong> telah berhasil kami terima di sistem admin kemitraan Empathika.
              </p>
            </div>

            {/* Kotak Info Jawaban */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-left text-xs text-gray-700 space-y-1.5 max-w-md mx-auto">
              <div className="font-bold text-[#561269] mb-1">Ringkasan Pengajuan:</div>
              <div>• <strong>Form:</strong> {formConfig.title}</div>
              <div>• <strong>Institusi:</strong> {namaInstitusi} ({tipeInstitusi})</div>
              <div>• <strong>Narahubung:</strong> {namaLengkap} ({nomorWhatsapp})</div>
            </div>

            {/* Opsi Respon */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={waAdminUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Konfirmasi via WhatsApp Sekarang</span>
                <span className="text-sm">→</span>
              </a>

              <Link
                href="/kerja-sama"
                className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
              >
                Selesai & Kembali
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            
            {/* Title & Description Header Section */}
            <div className="flex flex-col items-center justify-center text-center mb-1 mt-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.2] max-w-xl">
                {formConfig.title.startsWith("Formulir ") ? (
                  <>
                    <span className="text-[#561269] block sm:inline font-extrabold">
                      {formConfig.title.split(" ").slice(0, 2).join(" ")}{" "}
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#561269] via-[#8e4a9e] to-[#ba68c8]">
                      {formConfig.title.split(" ").slice(2).join(" ")}
                    </span>
                  </>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#561269] via-[#8e4a9e] to-[#ba68c8]">
                    {formConfig.title}
                  </span>
                )}
              </h1>

              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed text-center font-normal max-w-lg mx-auto mt-3">
                {formConfig.description}
              </p>
            </div>

            {/* Bagian 1: Biodata (Sesuai Mockup Gambar) */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#561269] mb-3">
                Biodata
              </h2>

              <div className="space-y-3.5">
                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="field-namaLengkap" className="block text-xs font-bold text-[#561269] uppercase tracking-wider mb-1.5">
                    Nama Lengkap / PIC <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="field-namaLengkap"
                    type="text"
                    value={namaLengkap}
                    onFocus={() => setActiveInput("nama")}
                    onBlur={() => setActiveInput("")}
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
                    placeholder="Masukkan nama lengkap"
                    className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      hasAttemptedSubmit && formErrors.namaLengkap
                        ? "border-2 border-rose-400 bg-rose-50/20 ring-2 ring-rose-200 outline-none"
                        : activeInput === "nama"
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                  {hasAttemptedSubmit && formErrors.namaLengkap && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{formErrors.namaLengkap}</span>
                    </p>
                  )}
                </div>

                {/* Nama Institusi */}
                <div>
                  <label htmlFor="field-namaInstitusi" className="block text-xs font-bold text-[#561269] uppercase tracking-wider mb-1.5">
                    Nama Institusi / Organisasi <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="field-namaInstitusi"
                    type="text"
                    value={namaInstitusi}
                    onFocus={() => setActiveInput("institusi")}
                    onBlur={() => setActiveInput("")}
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
                    placeholder="Nama Institusi"
                    className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      hasAttemptedSubmit && formErrors.namaInstitusi
                        ? "border-2 border-rose-400 bg-rose-50/20 ring-2 ring-rose-200 outline-none"
                        : activeInput === "institusi"
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                  {hasAttemptedSubmit && formErrors.namaInstitusi && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{formErrors.namaInstitusi}</span>
                    </p>
                  )}
                </div>

                {/* Nomor WhatsApp */}
                <div id="field-nomorWhatsapp">
                  <label className="block text-xs font-bold text-[#561269] uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <PhoneInputField
                    label=""
                    required
                    value={nomorWhatsapp}
                    error={hasAttemptedSubmit ? formErrors.nomorWhatsapp : undefined}
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
                    onFocus={() => setActiveInput("whatsapp")}
                    onBlur={() => setActiveInput("")}
                    placeholder="Nomor WhatsApp"
                    inputClassName={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      hasAttemptedSubmit && formErrors.nomorWhatsapp
                        ? "border-2 border-rose-400 bg-rose-50/20 ring-2 ring-rose-200 outline-none"
                        : activeInput === "whatsapp"
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                </div>

                {/* Alamat Email (Wajib diisi) */}
                <div id="field-emailPIC">
                  <label htmlFor="field-emailPICInput" className="block text-xs font-bold text-[#561269] uppercase tracking-wider mb-1.5">
                    Alamat Email <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="field-emailPICInput"
                    type="email"
                    value={emailPIC}
                    onFocus={() => setActiveInput("email")}
                    onBlur={() => setActiveInput("")}
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
                    placeholder="Masukkan alamat email (contoh: mitra@institusi.com)"
                    className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      hasAttemptedSubmit && formErrors.emailPIC
                        ? "border-2 border-rose-400 bg-rose-50/20 ring-2 ring-rose-200 outline-none"
                        : activeInput === "email"
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                  {hasAttemptedSubmit && formErrors.emailPIC && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{formErrors.emailPIC}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bagian 2: Tipe Institusi (Sesuai Mockup Gambar) */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#561269] mb-3">
                Tipe Institusi
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPE_INSTITUSI_OPTIONS.map((opt) => {
                  const isSelected = tipeInstitusi === opt
                  return (
                    <label
                      key={opt}
                      onClick={() => setTipeInstitusi(opt)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#561269] bg-purple-50/60 text-[#561269] font-semibold"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipeInstitusi"
                        value={opt}
                        checked={isSelected}
                        onChange={() => setTipeInstitusi(opt)}
                        className="text-[#561269] focus:ring-[#561269]"
                      />
                      <span>{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Bagian 3: Pertanyaan Khusus Sesuai Jenis Formulir Ini */}
            {formConfig.pertanyaanKhusus && formConfig.pertanyaanKhusus.length > 0 && (
              <div className="space-y-3 sm:space-y-3.5">
                {formConfig.pertanyaanKhusus.map((q) => {
                  const isOptional = isQuestionOptional(q)

                  const isProposalOrFile =
                    q.type === "file" ||
                    (q as any).type === "upload" ||
                    q.label.toLowerCase().includes("proposal") ||
                    q.label.toLowerCase().includes("upload") ||
                    q.key.toLowerCase().includes("proposal");

                  const isBudgetOrSelect =
                    !isProposalOrFile &&
                    (q.type === "select" ||
                      (q as any).type === "dropdown" ||
                      (q.options && q.label.toLowerCase().includes("budget")) ||
                      q.key.toLowerCase().includes("budget"));

                  const budgetFallbackOptions = [
                    "< Rp 5 juta",
                    "Rp 5–10 juta",
                    "Rp 10–25 juta",
                    "Rp 25–50 juta",
                    "> Rp 50 juta",
                  ];
                  const effectiveOptions =
                    q.options && q.options.length > 0
                      ? q.options
                      : isBudgetOrSelect
                      ? budgetFallbackOptions
                      : [];

                  return (
                    <div key={q.key} id={`field-${q.key}`}>
                      <label className="block text-sm sm:text-[15px] font-bold text-[#561269] mb-1.5">
                        {q.label}
                        {!isOptional && <span className="text-rose-500 font-bold ml-1">*</span>}
                      </label>

                      {isProposalOrFile ? (
                        <FormProposalUpload
                          value={jawabanKhusus[q.key] || ""}
                          onChange={(val) => handleKhususChange(q.key, val)}
                          label={q.label}
                        />
                      ) : isBudgetOrSelect ? (
                        <FormSelectDropdown
                          value={jawabanKhusus[q.key] || effectiveOptions[0] || ""}
                          onChange={(val) => handleKhususChange(q.key, val)}
                          options={effectiveOptions}
                          placeholder="Pilih rentang estimasi budget..."
                        />
                      ) : q.type === "radio" && q.options ? (
                        <div className="space-y-2.5">
                          {q.options.map((opt) => {
                            const isSelected = (jawabanKhusus[q.key] || q.options![0]) === opt
                            return (
                              <label
                                key={opt}
                                onClick={() => handleKhususChange(q.key, opt)}
                                className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-[#561269] bg-purple-50/50 text-[#561269] font-semibold"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.key}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => handleKhususChange(q.key, opt)}
                                  className="mt-0.5 text-[#561269] focus:ring-[#561269]"
                                />
                                <span>{opt}</span>
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={jawabanKhusus[q.key] || ""}
                          onFocus={() => setActiveInput(q.key)}
                          onBlur={() => setActiveInput("")}
                          onChange={(e) => handleKhususChange(q.key, e.target.value)}
                          placeholder={q.placeholder || "Tuliskan jawaban..."}
                          className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                            !isOptional && hasAttemptedSubmit && formErrors[q.key]
                              ? "border-2 border-rose-400 bg-rose-50/20 ring-2 ring-rose-200 outline-none"
                              : activeInput === q.key
                              ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                              : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                          }`}
                        />
                      )}

                      {!isOptional && hasAttemptedSubmit && formErrors[q.key] && (
                        <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                          <span>{formErrors[q.key]}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bagian 4: Catatan / Kebutuhan Tambahan (Opsional - Tidak ada peringatan kosong) */}
            <div>
              <label className="block text-sm sm:text-[15px] font-bold text-[#561269] mb-1.5">
                Catatan Tambahan / Gambaran Kegiatan (Opsional)
              </label>
              <textarea
                rows={3}
                value={catatanKebutuhan}
                onFocus={() => setActiveInput("catatan")}
                onBlur={() => setActiveInput("")}
                onChange={(e) => setCatatanKebutuhan(e.target.value)}
                placeholder="Tuliskan jika ada permintaan khusus, topik bahasan, atau detail lainnya..."
                className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                  activeInput === "catatan"
                    ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                    : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                }`}
              ></textarea>
            </div>

            {/* Banner Peringatan jika belum lengkap */}
            {hasAttemptedSubmit && Object.keys(formErrors).length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>
                  Mohon lengkapi semua kolom yang bertanda bintang (<span className="text-rose-600 font-bold">*</span>) sebelum mengirim formulir.
                </span>
              </div>
            )}

            {/* Submit Button (Warna oren/kuning emas kode E8C32A) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="inline-flex items-center gap-2 px-7 py-2.5 bg-[#E8C32A] hover:bg-[#d4b024] active:scale-95 text-gray-900 font-bold text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? "Mengirim..." : "Submit"}</span>
                <span className="text-base font-extrabold">→</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
