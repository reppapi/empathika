"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { psikotesService } from "@/services/psikotes.service"

// ── Daftar Metode Pembayaran ─────────────────────────────────────────────────

const BANK_LIST = [
  { id: "bca",     name: "BCA",     va: "1234567890123" },
  { id: "mandiri", name: "Mandiri", va: "8881234567890" },
  { id: "bni",     name: "BNI",     va: "9876543210987" },
  { id: "bri",     name: "BRI",     va: "7771234567890" },
  { id: "bsi",     name: "BSI",     va: "4441234567890" },
]

const EWALLET_LIST = [
  { id: "gopay",     name: "GoPay",     color: "#00AA13" },
  { id: "ovo",       name: "OVO",       color: "#4C3494" },
  { id: "dana",      name: "DANA",      color: "#118EEA" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D" },
  { id: "linkaja",   name: "LinkAja",   color: "#E82529" },
]

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1 text-[11px] font-bold text-[#561269] bg-white border border-[#DCD0E1] px-3 py-1.5 rounded-lg hover:bg-[#F0E6F6] transition-colors shrink-0"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#561269" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
        </svg>
      )}
      {copied ? "Tersalin!" : "Salin"}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PsikotesCheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [nama, setNama]         = useState("")
  const [email, setEmail]       = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  const [metodePembayaran, setMetodePembayaran] = useState<string | null>(null)
  const [selectedBank, setSelectedBank]         = useState<string | null>(null)
  const [selectedEwallet, setSelectedEwallet]   = useState<string | null>(null)
  const [bankOpen, setBankOpen]                 = useState(false)
  const [ewalletOpen, setEwalletOpen]           = useState(false)
  const [failedAlertDismissed, setFailedAlertDismissed] = useState(false)

  const isFailed = searchParams.get("status") === "failed" && !failedAlertDismissed
  const failedReason = searchParams.get("reason") || "Pembayaran tidak dapat diproses atau waktu transaksi telah berakhir."

  useEffect(() => {
    const qNama = searchParams.get("nama")
    const qEmail = searchParams.get("email")
    const qWa = searchParams.get("whatsapp")
    const qMetode = searchParams.get("metode")
    const qBank = searchParams.get("bank")
    const qEwallet = searchParams.get("ewallet")

    if (qNama) setNama(qNama)
    if (qEmail) setEmail(qEmail)
    if (qWa) setWhatsapp(qWa)
    if (qMetode) setMetodePembayaran(qMetode)
    if (qBank) {
      setSelectedBank(qBank)
      setBankOpen(true)
    }
    if (qEwallet) {
      setSelectedEwallet(qEwallet)
      setEwalletOpen(true)
    }
  }, [searchParams])

  const activeBank    = BANK_LIST.find((b) => b.id === selectedBank)
  const activeEwallet = EWALLET_LIST.find((e) => e.id === selectedEwallet)

  const testIdParam   = searchParams.get("testId") || "mbti"
  const judulParam    = searchParams.get("judul") || "Paket Tes Psikotes Lengkap"
  const subjudulParam = searchParams.get("subjudul") || "Akses paket tes psikotes lengkap beserta laporan analisis profesional."
  const kategoriParam = searchParams.get("kategori") || "Psikotes"
  const hargaParam    = searchParams.get("harga") || "Rp 50.000"

  const handleSelectPayment = (id: string) => {
    if (metodePembayaran === id) {
      setMetodePembayaran(null)
      setSelectedBank(null)
      setSelectedEwallet(null)
      setBankOpen(false)
      setEwalletOpen(false)
      return
    }

    setMetodePembayaran(id)
    if (id !== "bank")    { setSelectedBank(null);    setBankOpen(false) }
    if (id !== "ewallet") { setSelectedEwallet(null); setEwalletOpen(false) }
  }

  const handleSubmit = () => {
    if (!nama || !email || !whatsapp) {
      alert("Harap isi semua data peserta terlebih dahulu.")
      return
    }
    if (!metodePembayaran) {
      alert("Harap pilih metode pembayaran terlebih dahulu.")
      return
    }

    const orderId = "PSI-" + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")

    const params = new URLSearchParams({
      nama: nama.toUpperCase(),
      email,
      whatsapp,
      orderId,
      tanggal: "05/09",
      tahun: "2026",
      waktu: "09:00",
      judul: judulParam,
      subjudul: subjudulParam,
      kategori: kategoriParam,
      harga: hargaParam,
      metode: metodePembayaran,
      testId: testIdParam,
      ...(selectedBank    && { bank: selectedBank }),
      ...(selectedEwallet && { ewallet: selectedEwallet }),
    })

    try {
      localStorage.setItem(
        "empathika_peserta_psikotes",
        JSON.stringify({
          nama: nama.trim(),
          no_telepon: whatsapp.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
        })
      )
    } catch {}

    // Simpan booking psikotes ke backend
    psikotesService
      .createBooking({
        id_paket: testIdParam,
        testId: testIdParam,
        metode_pembayaran: metodePembayaran,
        channel_pembayaran: selectedBank || selectedEwallet || "QRIS",
        status_pembayaran: "PAID",
        nama: nama.trim(),
        no_telepon: whatsapp.trim(),
        email: email.trim(),
        klien: {
          nama: nama.trim(),
          no_telepon: whatsapp.trim(),
          email: email.trim(),
        },
      })
      .catch((err) => {
        console.warn("Sinkronisasi booking psikotes ke backend:", err)
      })

    // Alihkan langsung ke halaman pending psikotes mandiri
    router.push(`/psikotes/pending?${params.toString()}`)
  }

  const paymentOptions = [
    {
      id: "ewallet",
      label: "E-Wallet",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
        </svg>
      ),
    },
    {
      id: "bank",
      label: "Transfer Bank (Virtual Account)",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
      ),
    },
    {
      id: "qris",
      label: "QRIS",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32 pt-28 sm:pt-36">
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 flex flex-col gap-6">

        {/* Header Breadcrumb / Kembali */}
        <div className="flex items-center justify-between">
          <Link
            href={`/psikotes/${testIdParam}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#561269] hover:text-[#763E8B] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Detail Tes
          </Link>
          <span className="text-xs font-semibold text-gray-500">Checkout Psikotes</span>
        </div>

        {/* Failed Alert Banner */}
        {isFailed && (
          <div className="w-full rounded-2xl bg-red-50 border border-red-200 p-4 sm:p-5 flex gap-3.5 items-start shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#DC2626" className="w-5 h-5 shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-red-900 mb-0.5">Transaksi Sebelumnya Belum Selesai</h4>
              <p className="text-xs text-red-700 leading-relaxed">{failedReason}</p>
            </div>
            <button
              onClick={() => setFailedAlertDismissed(true)}
              className="text-red-400 hover:text-red-700 text-sm font-bold shrink-0 ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Box 1: Detail Paket Psikotes ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <h3 className="text-sm font-bold text-gray-800">Detail Paket Asesmen</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-[#FCFAFD] border border-[#F0E6F6]">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#561269" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="flex flex-col w-full">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md w-fit mb-1.5 uppercase tracking-wide">
                Paket Berbayar Lengkap
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-[#561269] mb-1">{judulParam}</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{subjudulParam}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-purple-100/60 text-xs text-gray-700">
                <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Akses Pengerjaan Online</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#561269]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Laporan Analisis Komprehensif (PDF)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Box 2: Data Peserta ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <h3 className="text-sm font-bold text-gray-800">Data Peserta Tes</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">Alamat Email</label>
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">No. WhatsApp</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxx"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Box 3: Metode Pembayaran ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">3</div>
            <h3 className="text-sm font-bold text-gray-800">Pilih Metode Pembayaran</h3>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {paymentOptions.map((opt) => {
              const isActive = metodePembayaran === opt.id
              return (
                <div
                  key={opt.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isActive ? "border-[#561269] ring-1 ring-[#561269]" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => handleSelectPayment(opt.id)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${
                      isActive ? "bg-[#F8EFFF]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {opt.icon}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{opt.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Konten Accordion */}
                  {isActive && (
                    <div className="border-t border-[#EDE0F2] bg-[#FDFBFF] px-4 pb-4 pt-4 flex flex-col gap-3">
                      {opt.id === "ewallet" && (
                        <>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pilih E-Wallet</p>
                          <div className="flex flex-col gap-2">
                            {EWALLET_LIST.map((ew) => {
                              const isSelected = selectedEwallet === ew.id
                              return (
                                <button
                                  type="button"
                                  key={ew.id}
                                  onClick={() => setSelectedEwallet(isSelected ? null : ew.id)}
                                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left rounded-xl border transition-all ${
                                    isSelected
                                      ? "border-[#561269] bg-[#FAF5FC] shadow-sm"
                                      : "border-gray-200 bg-white hover:bg-gray-50"
                                  }`}
                                >
                                  <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shrink-0"
                                    style={{ backgroundColor: ew.color }}
                                  >
                                    {ew.name.slice(0, 2).toUpperCase()}
                                  </span>
                                  <span className="font-semibold text-gray-800">{ew.name}</span>
                                  <div className="ml-auto flex items-center gap-2">
                                    <div
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300 bg-white"
                                      }`}
                                    >
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}

                      {opt.id === "bank" && (
                        <>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pilih Bank Virtual Account</p>
                          <div className="flex flex-col gap-2">
                            {BANK_LIST.map((b) => {
                              const isSelected = selectedBank === b.id
                              return (
                                <button
                                  type="button"
                                  key={b.id}
                                  onClick={() => setSelectedBank(isSelected ? null : b.id)}
                                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left rounded-xl border transition-all ${
                                    isSelected
                                      ? "border-[#561269] bg-[#FAF5FC] shadow-sm"
                                      : "border-gray-200 bg-white hover:bg-gray-50"
                                  }`}
                                >
                                  <div className="w-10 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center font-extrabold text-[10px] text-gray-700">
                                    {b.name}
                                  </div>
                                  <span className="font-semibold text-gray-800">Bank {b.name}</span>
                                  <div className="ml-auto flex items-center gap-2">
                                    <div
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300 bg-white"
                                      }`}
                                    >
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}

                      {opt.id === "qris" && (
                        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-center">
                          <p className="text-xs text-gray-600">
                            QRIS dinamis akan otomatis ditampilkan pada halaman instruksi pembayaran berikutnya.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Box 4: Rincian Pembayaran ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Rincian Pembayaran</h3>
          <div className="space-y-2.5 text-xs text-gray-600 border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between items-center">
              <span>Biaya Paket Asesmen</span>
              <span className="font-semibold text-gray-900">{hargaParam}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Biaya Layanan Platform</span>
              <span className="font-semibold text-emerald-600">Gratis</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm font-extrabold text-[#561269]">
            <span>Total Tagihan</span>
            <span className="text-base">{hargaParam}</span>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.04)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-[11px] text-gray-500 font-medium">Total Tagihan</div>
          <div className="text-base sm:text-lg font-extrabold text-[#561269]">{hargaParam}</div>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-xs sm:text-sm px-7 sm:px-10 py-3 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  )
}
