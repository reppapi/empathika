"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// ── Dummy data ────────────────────────────────────────────────────────────────

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

// Chevron icon
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

// Tombol salin
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
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

export default function EventCheckoutClient() {
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

  const testIdParam   = searchParams.get("testId")
  const judulParam    = searchParams.get("judul") || "Workshop SEFT"
  const subjudulParam = searchParams.get("subjudul") || "Spiritual Emotional Freedom Technique — program workshop interaktif bersama para ahli."
  const kategoriParam = searchParams.get("kategori") || "Seminar"
  const hargaParam    = searchParams.get("harga") || "Rp 200.000"
  const isPsikotes    = kategoriParam.toLowerCase().includes("psikotes")

  const handleSelectPayment = (id: string) => {
    if (metodePembayaran === id) {
      // Jika opsi yang sama diklik lagi, tutup dropdown/accordion-nya
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

    const params = new URLSearchParams({
      nama: nama.toUpperCase(),
      email,
      whatsapp,
      orderId: (isPsikotes ? "PSI-" : "W-SEFT-") + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
      tanggal: "05/09",
      tahun: "2026",
      waktu: "09:00",
      judul: judulParam,
      subjudul: subjudulParam,
      kategori: kategoriParam,
      harga: hargaParam,
      metode: metodePembayaran,
      ...(testIdParam     && { testId: testIdParam }),
      ...(selectedBank    && { bank: selectedBank }),
      ...(selectedEwallet && { ewallet: selectedEwallet }),
    })
    // Arahkan ke halaman pending dulu
    router.push(`/event/pending?${params.toString()}`)
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
      label: "Transfer Bank",
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32 pt-24 sm:pt-32">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 flex flex-col gap-6">

        {/* Title */}
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            {isPsikotes ? "Pendaftaran & Pembayaran Psikotes" : "Pendaftaran & Pembayaran Tiket"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            {isPsikotes
              ? "Lengkapi data kamu dan selesaikan pembayaran untuk mendapatkan akses tes serta laporan analisis lengkap."
              : "Isi data kamu dan pilih metode pembayaran untuk menyelesaikan pendaftaran event."}
          </p>
        </div>

        {/* ── Banner Notifikasi Pembayaran Gagal ── */}
        {isFailed && (
          <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-red-900">Pembayaran Sebelumnya Gagal</h4>
                <button
                  type="button"
                  onClick={() => setFailedAlertDismissed(true)}
                  className="text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-lg"
                  aria-label="Tutup"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                {failedReason} Silakan periksa kembali data diri Anda di bawah ini dan pilih ulang metode pembayaran untuk mencoba kembali.
              </p>
            </div>
          </div>
        )}

        {/* ── Box 1: Detail Item / Event ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <h3 className="text-sm font-bold text-gray-800">{isPsikotes ? "Detail Layanan Psikotes" : "Detail Event"}</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative w-full sm:w-[200px] h-[120px] rounded-2xl bg-[#E6D9E9] overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
              {isPsikotes ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#561269" className="w-12 h-12 opacity-60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#9B59B6" className="w-12 h-12 opacity-40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              )}
            </div>
            <div className="flex flex-col w-full">
              <div className="text-xs font-semibold text-purple-700 bg-purple-50 w-fit px-2.5 py-0.5 rounded-full mb-1">
                {kategoriParam}
              </div>
              <div className="text-lg font-extrabold text-[#561269] mb-1">{judulParam}</div>
              <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                {subjudulParam}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {isPsikotes ? (
                  <>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#561269]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700">Akses Pengerjaan Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#561269]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700">Laporan Analisis Komprehensif</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500">05 September 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500">09:00 - Selesai WIB</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Box 2: Data Peserta ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <h3 className="text-sm font-bold text-gray-800">Data Peserta</h3>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">Nama Lengkap</label>
              <input
                type="text" placeholder="Masukkan nama lengkap" value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Email</label>
                <input
                  type="email" placeholder="user@gmail.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">No WhatsApp</label>
                <input
                  type="tel" placeholder="08xxxxxxxxx" value={whatsapp}
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

          <div className="flex flex-col gap-3 mb-8">
            {paymentOptions.map((opt) => {
              const isActive = metodePembayaran === opt.id
              return (
                <div key={opt.id} className={`rounded-2xl border transition-all overflow-hidden ${isActive ? "border-[#561269] ring-1 ring-[#561269]" : "border-gray-200"}`}>

                  {/* Tombol header metode */}
                  <button
                    onClick={() => handleSelectPayment(opt.id)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${isActive ? "bg-[#F8EFFF]" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {opt.icon}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{opt.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
                  </button>

                  {/* ══ Konten inline — hanya muncul jika aktif ══ */}
                  {isActive && (
                    <div className="border-t border-[#EDE0F2] bg-[#FDFBFF] px-4 pb-4 pt-4 flex flex-col gap-3">

                      {/* ─── E-Wallet ─── */}
                      {opt.id === "ewallet" && (
                        <>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pilih E-Wallet</p>
                          <div className="flex flex-col gap-2">
                            {EWALLET_LIST.map((ew) => {
                              const isSelected = selectedEwallet === ew.id
                              return (
                                <div
                                  key={ew.id}
                                  className={`rounded-xl border transition-all overflow-hidden ${
                                    isSelected
                                      ? "border-[#561269] bg-[#FAF5FC] shadow-sm"
                                      : "border-gray-200 bg-white hover:bg-gray-50"
                                  }`}
                                >
                                  {/* Baris item */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEwallet(isSelected ? null : ew.id)}
                                    className="w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left"
                                  >
                                    <span
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shrink-0"
                                      style={{ backgroundColor: ew.color }}
                                    >
                                      {ew.name.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="font-semibold text-gray-800">{ew.name}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300 bg-white"}`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </div>
                                    </div>
                                  </button>

                                  {/* Petunjuk pembayaran via Xendit gateway */}
                                  {isSelected && (
                                    <div className="border-t border-[#EDE0F2] bg-white px-4 py-2.5 flex items-center gap-2 mx-2 mb-2 rounded-lg text-xs text-gray-600">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#561269" className="w-4 h-4 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-6-3.75h.008v.008H7.5v-.008Zm0 3.75h.008v.008H7.5v-.008Z" />
                                      </svg>
                                      <span className="text-[11px] leading-relaxed">
                                        Kamu akan langsung diarahkan ke aplikasi <strong className="text-gray-900">{ew.name}</strong> atau barcode QRIS otomatis saat menekan tombol bayar.
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}

                      {/* ─── Transfer Bank ─── */}
                      {opt.id === "bank" && (
                        <>
                          <p className="text-[11px] font-semibold text-gray-500 mb-1">Pilih Bank Tujuan</p>
                          <div className="flex flex-col gap-2">
                            {BANK_LIST.map((bank) => {
                              const isSelected = selectedBank === bank.id
                              return (
                                <div
                                  key={bank.id}
                                  className={`rounded-xl border transition-all overflow-hidden ${
                                    isSelected
                                      ? "border-[#561269] bg-[#FAF5FC] shadow-sm"
                                      : "border-gray-200 bg-white hover:bg-gray-50"
                                  }`}
                                >
                                  {/* Baris item */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBank(isSelected ? null : bank.id)}
                                    className="w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left"
                                  >
                                    <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-extrabold text-blue-700 shrink-0">
                                      {bank.name.slice(0, 3)}
                                    </span>
                                    <span className="font-semibold text-gray-800">Bank {bank.name}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300 bg-white"}`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </div>
                                    </div>
                                  </button>

                                  {/* Detail VA langsung di bawah bank yang diklik */}
                                  {isSelected && (
                                    <div className="border-t border-[#EDE0F2] bg-white px-4 py-3 flex flex-col gap-1 mx-2 mb-2 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[7px] font-extrabold text-blue-700 shrink-0">
                                          {bank.name.slice(0, 3)}
                                        </span>
                                        <p className="text-[11px] text-gray-500 font-medium">Nomor Virtual Account Bank {bank.name}</p>
                                      </div>
                                      <div className="flex items-center justify-between gap-2 mt-0.5">
                                        <span className="text-base sm:text-lg font-extrabold text-[#561269] tracking-wider">{bank.va}</span>
                                        <CopyButton text={bank.va} />
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-0.5">Berlaku selama 24 jam · a.n. Empathika Indonesia</p>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}

                      {/* ─── QRIS ─── */}
                      {opt.id === "qris" && (
                        <div className="flex flex-col items-center gap-3 py-2">
                          <p className="text-[11px] text-gray-500 font-medium text-center">
                            Scan QRIS di bawah ini untuk melakukan pembayaran
                          </p>
                          {/* QR Code dummy visual */}
                          <div className="relative w-[168px] h-[168px] bg-white border-2 border-[#561269] rounded-xl p-3 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-[#561269]" xmlns="http://www.w3.org/2000/svg">
                              <rect x="5"  y="5"  width="28" height="28" rx="3" fill="currentColor" opacity="0.12"/>
                              <rect x="8"  y="8"  width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="3"/>
                              <rect x="13" y="13" width="12" height="12" rx="1" fill="currentColor"/>
                              <rect x="67" y="5"  width="28" height="28" rx="3" fill="currentColor" opacity="0.12"/>
                              <rect x="70" y="8"  width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="3"/>
                              <rect x="75" y="13" width="12" height="12" rx="1" fill="currentColor"/>
                              <rect x="5"  y="67" width="28" height="28" rx="3" fill="currentColor" opacity="0.12"/>
                              <rect x="8"  y="70" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="3"/>
                              <rect x="13" y="75" width="12" height="12" rx="1" fill="currentColor"/>
                              {[38,43,48,53,58,63].map((x) =>
                                [8,13,18,23,28,33,38,43,48,53,58,63,68,73,78,83,88].map((y) =>
                                  (x + y) % 10 < 5 ? <rect key={`p1-${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.65"/> : null
                                )
                              )}
                              {[8,13,18,23,28,33].map((x) =>
                                [38,43,48,53,58,63,68,73,78,83,88].map((y) =>
                                  (x + y) % 8 < 4 ? <rect key={`p2-${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.65"/> : null
                                )
                              )}
                              {[68,73,78,83,88].map((x) =>
                                [38,43,48,53,58,63,68,73,78,83,88].map((y) =>
                                  (x * y) % 7 < 3 ? <rect key={`p3-${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.65"/> : null
                                )
                              )}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 bg-white rounded-lg border border-[#DCD0E1] shadow-sm flex items-center justify-center">
                                <span className="text-[8px] font-extrabold text-[#561269] leading-tight text-center">QRIS</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-[#561269]">Empathika Indonesia</p>
                            <p className="text-[10px] text-gray-400">Total: {hargaParam}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            Berlaku untuk semua aplikasi pembayaran<br/>(GoPay, OVO, DANA, dll)
                          </p>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pricing Info + CTA */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">{isPsikotes ? "Biaya Paket Psikotes" : "Biaya Tiket"}</span>
              <span className="text-xs font-semibold text-gray-700">{hargaParam}</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-extrabold text-[#561269]">Total Bayar</span>
              <span className="text-base font-extrabold text-[#561269]">{hargaParam}</span>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-[#EAB308] hover:bg-[#FACC15] text-black font-bold text-sm py-4 rounded-xl shadow-sm transition-colors flex justify-center items-center"
            >
              Bayar Sekarang
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] py-4 px-6 sm:px-10 lg:px-24 flex items-center justify-between z-40">
        <div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-0.5 line-clamp-1 max-w-[200px] sm:max-w-md">
            {judulParam}
          </div>
          <div className="text-sm sm:text-[17px] font-extrabold text-[#561269]">
            {hargaParam}
          </div>
        </div>
        <button
          onClick={() => window.history.back()}
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  )
}
