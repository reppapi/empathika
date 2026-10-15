"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

// ── Dummy data ────────────────────────────────────────────────────────────────

const BANK_LIST = [
  { id: "bca",     name: "BCA",     va: "1234567890123" },
  { id: "mandiri", name: "Mandiri", va: "8881234567890" },
  { id: "bni",     name: "BNI",     va: "9876543210987" },
  { id: "bri",     name: "BRI",     va: "7771234567890" },
  { id: "bsi",     name: "BSI",     va: "4441234567890" },
]

const EWALLET_LIST = [
  { id: "gopay",     name: "GoPay",     color: "#00AA13", nomor: "0812-3456-7890" },
  { id: "ovo",       name: "OVO",       color: "#4C3494", nomor: "0813-2345-6789" },
  { id: "dana",      name: "DANA",      color: "#118EEA", nomor: "0811-9876-5432" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D", nomor: "0815-6543-2109" },
  { id: "linkaja",   name: "LinkAja",   color: "#E82529", nomor: "0819-1234-5678" },
]

// Tombol salin dengan feedback "Tersalin!"
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

export default function BayarClient() {
  const router = useRouter()

  const [nama, setNama]         = useState("")
  const [email, setEmail]       = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [deskripsi, setDeskripsi] = useState("")

  const [metodePembayaran, setMetodePembayaran] = useState<string | null>(null)
  const [selectedBank, setSelectedBank]         = useState<string | null>(null)
  const [selectedEwallet, setSelectedEwallet]   = useState<string | null>(null)

  const activeBank    = BANK_LIST.find((b) => b.id === selectedBank)
  const activeEwallet = EWALLET_LIST.find((e) => e.id === selectedEwallet)

  const handleSelectPayment = (id: string) => {
    if (metodePembayaran === id) {
      // Jika opsi yang sama diklik lagi, tutup dropdown/accordion-nya
      setMetodePembayaran(null)
      setSelectedBank(null)
      setSelectedEwallet(null)
      return
    }

    setMetodePembayaran(id)
    if (id !== "bank")    { setSelectedBank(null) }
    if (id !== "ewallet") { setSelectedEwallet(null) }
  }

  const handleSubmit = () => {
    if (!nama || !email || !whatsapp || !deskripsi) {
      alert("Harap isi semua data peserta terlebih dahulu.")
      return
    }
    if (!metodePembayaran) {
      alert("Harap pilih metode pembayaran terlebih dahulu.")
      return
    }
    const params = new URLSearchParams({
      nama: nama.toUpperCase(),
      orderId: "W-EMP-" + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"),
      tanggal: "31/08",
      tahun: "2026",
      waktu: "13:30",
      judul: "Layanan Konsultasi",
      subjudul: "Psikolog Profesional Empathika",
      bottomDate: "31 Agu 2026",
      bottomTime: "13:30 WIB (Online)",
      metode: metodePembayaran,
      ...(selectedBank    && { bank: selectedBank }),
      ...(selectedEwallet && { ewallet: selectedEwallet }),
    })
    // Arahkan ke halaman pending dulu
    router.push(`/konseling/pending?${params.toString()}`)
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
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-32">

      {/* 1. Stepper Area */}
      <div className="w-full pt-32 pb-10 flex flex-col items-center bg-white border-b border-gray-100">
        <div className="flex items-center w-full max-w-sm justify-center px-4 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">1</div>
            <span className="text-[10px] sm:text-xs text-gray-700">paket</span>
          </div>
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>
          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">2</div>
            <span className="text-[10px] sm:text-xs text-gray-700">jadwal</span>
          </div>
          <div className="h-[2px] bg-[#EAB308] flex-1 mx-2 -mt-6"></div>
          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-8 h-8 rounded-full bg-[#EAB308] border border-black/10 flex items-center justify-center text-black font-medium mb-2 shadow-sm text-sm">3</div>
            <span className="text-[10px] sm:text-xs text-gray-700">Bayar</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 mt-8 flex flex-col gap-6">

        {/* Title */}
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#561269] mb-2">
            Ringkasan &amp; Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Periksa data konsultasi dan selesaikan pembayaran untuk mengonfirmasi sesi Anda.
          </p>
        </div>

        {/* ── Box 1: Data Peserta ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <h3 className="text-sm font-bold text-gray-800">Data Peserta</h3>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">Nama Lengkap</label>
              <input
                type="text" placeholder="Masukkan nama lengkap"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                value={nama} onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Email</label>
                <input
                  type="email" placeholder="user@gmail.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">No WhatsApp</label>
                <input
                  type="tel" placeholder="08xxxxxxxxx"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                  value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">Deskripsi Ringkasan Hidup/Trauma</label>
              <input
                type="text" placeholder="saya sering merasa.."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] bg-white placeholder-gray-400"
                value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Box 2: Data Psikolog & Jadwal ── */}
        <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <h3 className="text-sm font-bold text-gray-800">Data Psikolog &amp; Jadwal yang Dipilih</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-center items-center sm:items-start sm:flex-row gap-4 h-full">
              <div className="w-[70px] h-[70px] rounded-full bg-[#E6D9E9] shrink-0" />
              <div className="text-center sm:text-left flex flex-col justify-center h-full pt-1">
                <div className="text-[10px] text-gray-500 mb-1">Psikolog Anda</div>
                <div className="text-sm font-extrabold text-[#561269]">nama, M.Psi.,<br/>Psikolog</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="shrink-0 text-[#561269]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Jadwal</div>
                  <div className="text-xs font-bold text-[#561269]">2026-08-31 (weekday)</div>
                  <div className="text-[10px] text-gray-500">13:30 WIB (Online)</div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="shrink-0 text-[#561269]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 mb-0.5">Layanan konsultasi</div>
                  <div className="text-sm font-bold text-[#561269]">Psikolog</div>
                </div>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      strokeWidth={2} stroke="currentColor"
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Konten inline — hanya muncul jika aktif */}
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

                                  {/* Detail nomor langsung di bawah pilihan ini */}
                                  {isSelected && (
                                    <div className="border-t border-[#EDE0F2] bg-white px-4 py-3 flex flex-col gap-1 mx-2 mb-2 rounded-lg">
                                      <p className="text-[11px] text-gray-500 font-medium">Nomor Tujuan Transfer {ew.name}</p>
                                      <div className="flex items-center justify-between gap-2 mt-0.5">
                                        <span className="text-base sm:text-lg font-extrabold text-[#561269] tracking-wider">{ew.nomor}</span>
                                        <CopyButton text={ew.nomor} />
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-0.5">a.n. Empathika Indonesia</p>
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
                            <p className="text-[10px] text-gray-400">Total: Rp 350.000</p>
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

          {/* Pricing Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Biaya Konsultasi</span>
              <span className="text-xs font-medium text-gray-500">Rp 350.000</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-extrabold text-[#561269]">Total Bayar</span>
              <span className="text-sm font-extrabold text-[#561269]">Rp 350.000</span>
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
          <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">31 Agu 2026</div>
          <div className="text-sm sm:text-[17px] font-bold text-black flex items-center gap-1">
            13:30 WIB <span className="italic font-normal">(Online)</span>
          </div>
        </div>
        <Link
          href="/konseling/jadwal"
          className="bg-white border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm px-6 sm:px-8 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          Kembali
        </Link>
      </div>

    </div>
  )
}
