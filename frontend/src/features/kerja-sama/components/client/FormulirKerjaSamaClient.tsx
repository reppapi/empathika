"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  getPengajuanKerjaSama,
  savePengajuanKerjaSama,
  getFormulirConfigs,
  getKerjaSamaConfig,
  INITIAL_FORMULIR_CONFIGS,
} from "../../data/initialData"
import { PengajuanKerjaSama, FormulirConfigItem } from "../../types"
import apiClient from "@/lib/axios"

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
  const [waNumber, setWaNumber] = useState<string>("6282123456789")
  const [isMounted, setIsMounted] = useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    setAllFormConfigs(getFormulirConfigs())
    const cfg = getKerjaSamaConfig()
    if (cfg?.kontak?.whatsapp) {
      setWaNumber(cfg.kontak.whatsapp.replace(/\D/g, "") || "6282123456789")
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
  const [tipeInstitusi, setTipeInstitusi] = useState("Sekolah / Universitas")
  const [activeInput, setActiveInput] = useState<string>("whatsapp")

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

  const handleKhususChange = (key: string, value: string) => {
    setJawabanKhusus((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || isSubmitted) return
    if (!namaLengkap.trim() || !namaInstitusi.trim() || !nomorWhatsapp.trim()) return

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
    const detailLengkap: Record<string, string> = {
      "Nama Lengkap / PIC": namaLengkap.trim(),
      "Nama Institusi / Organisasi": namaInstitusi.trim(),
      "Nomor WhatsApp": nomorWhatsapp.trim(),
      "Tipe Institusi": tipeInstitusi,
      "Tipe Formulir": formConfig.title,
    }

    formConfig.pertanyaanKhusus.forEach((q) => {
      detailLengkap[q.label] = jawabanKhusus[q.key] || "-"
    })

    if (catatanKebutuhan.trim()) {
      detailLengkap["Catatan / Kebutuhan Tambahan"] = catatanKebutuhan.trim()
    }

    const payloadBackend = {
      nama_instansi: namaInstitusi.trim(),
      nama_pic: namaLengkap.trim(),
      email: `${namaLengkap.trim().toLowerCase().replace(/\s+/g, "")}@institusi.id`,
      no_telepon: nomorWhatsapp.trim(),
      kategori: tipeInstitusi.split("/")[0].trim() || formConfig.categoryDefault,
      tipe_formulir: formType,
      pesan: `Pengajuan melalui ${formConfig.title}. ${
        catatanKebutuhan ? `Catatan: ${catatanKebutuhan}` : ""
      }`,
      jawaban_detail: detailLengkap,
    }

    // 1. Simpan ke LocalStorage jika belum pernah ada submit persis dalam sesi ini
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
        id: "lead_" + Date.now(),
        tanggal: tanggalStr,
        namaInstansi: namaInstitusi.trim(),
        kategori: tipeInstitusi.split("/")[0].trim() || formConfig.categoryDefault,
        namaPIC: namaLengkap.trim(),
        email: payloadBackend.email,
        telepon: nomorWhatsapp.trim(),
        pesan: payloadBackend.pesan,
        status: "Menunggu",
        tipeFormulir: formType as any,
        formTitle: formConfig.title,
        jawabanDetail: detailLengkap,
      }
      savePengajuanKerjaSama([newLead, ...existingLeads])
    }

    // 2. Kirim juga ke Backend API (non-blocking jika backend offline)
    try {
      await apiClient.post("/kerja-sama/pengajuan", payloadBackend)
    } catch (err) {
      console.warn("Backend API sync warning (tersimpan di lokal):", err)
    } finally {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }
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
        
        {/* Breadcrumb Back Link */}
        <div className="mb-6">
          <Link
            href="/kerja-sama"
            className="inline-flex items-center gap-1.5 text-xs text-[#561269] hover:text-[#7f1d8f] font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Kerja Sama
          </Link>
        </div>

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
                <span className="text-sm">↗</span>
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Title & Description Header Section */}
            <div className="flex flex-col items-center justify-center text-center mb-4 mt-2">
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
            <div className="mt-4">
              <h2 className="text-lg md:text-xl font-bold text-[#561269] mb-4">
                Biodata
              </h2>

              <div className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onFocus={() => setActiveInput("nama")}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      activeInput === "nama"
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={namaInstitusi}
                    onFocus={() => setActiveInput("institusi")}
                    onChange={(e) => setNamaInstitusi(e.target.value)}
                    placeholder="Nama Institusi"
                    className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      activeInput === "institusi"
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    value={nomorWhatsapp}
                    onFocus={() => setActiveInput("whatsapp")}
                    onChange={(e) => setNomorWhatsapp(e.target.value)}
                    placeholder="Nomor Whatsapp"
                    className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      activeInput === "whatsapp"
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Tipe Institusi (Sesuai Mockup Gambar) */}
            <div className="mt-2">
              <h2 className="text-lg md:text-xl font-bold text-[#561269] mb-4">
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
            {formConfig.pertanyaanKhusus.map((q, idx) => (
              <div key={q.key} className="mt-2">
                <h2 className="text-lg md:text-xl font-bold text-[#561269] mb-3">
                  {q.label}
                </h2>

                {q.type === "radio" && q.options && (
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
                )}

                {q.type === "text" && (
                  <input
                    type="text"
                    value={jawabanKhusus[q.key] || ""}
                    onFocus={() => setActiveInput(q.key)}
                    onChange={(e) => handleKhususChange(q.key, e.target.value)}
                    placeholder={q.placeholder || "Tuliskan jawaban..."}
                    className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                      activeInput === q.key
                        ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                        : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                    }`}
                  />
                )}
              </div>
            ))}

            {/* Bagian 4: Catatan / Kebutuhan Tambahan (Opsional) */}
            <div className="mt-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Catatan Tambahan / Gambaran Kegiatan (Opsional)
              </label>
              <textarea
                rows={3}
                value={catatanKebutuhan}
                onFocus={() => setActiveInput("catatan")}
                onChange={(e) => setCatatanKebutuhan(e.target.value)}
                placeholder="Tuliskan jika ada permintaan khusus, topik bahasan, atau detail lainnya..."
                className={`w-full px-4 py-3 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                  activeInput === "catatan"
                    ? "border-2 border-[#0099ff] ring-2 ring-[#0099ff]/20 outline-none"
                    : "border border-gray-300 hover:border-gray-400 focus:outline-none"
                }`}
              ></textarea>
            </div>

            {/* Submit Button (Warna oren/kuning emas kode E8C32A) */}
            <div className="mt-4 pt-2">
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
