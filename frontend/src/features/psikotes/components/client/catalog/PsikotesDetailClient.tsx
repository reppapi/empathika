/** Halaman detail paket psikotes (info tes, benefit, tombol mulai/beli, dan modal verifikasi kode akses). */
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UNIVERSAL_PAID_BENEFITS, UNIVERSAL_FREE_BENEFITS } from "@/features/psikotes/data/psikotesData";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import {
  isDASS as checkDASS,
  isPackagePaid,
  getInstrumentTargetUsia,
} from "@/features/psikotes/utils/instrumentDetector";
import {
  clearPsikotesDetailOrigin,
  markPsikotesDetailOrigin,
} from "@/features/psikotes/utils/navigationHistory";
import {
  Check,
  FileQuestion,
  ArrowRight,
  Loader2,
  AlertCircle,
  WifiOff,
  RefreshCw,
  X,
  CheckCircle2,
  Users,
} from "lucide-react";
import PhoneInputField from "@/components/shared/PhoneInputField";

const DEFAULT_GUIDELINES = [
  "Jawab setiap pertanyaan dengan jujur sesuai dengan dirimu. Tidak ada jawaban benar atau salah.",
  "Tidak ada batas waktu, jadi kerjakan dengan santai dan nyaman.",
  "Selesaikan tes dalam satu sesi karena progres akan hilang jika keluar.",
  "Setelah selesai, kamu akan mendapatkan laporan hasil tes.",
];

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80";

export default function PsikotesDetailClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apiData, setApiData] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State untuk modal verifikasi tiket / kode akses
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketKode, setTicketKode] = useState("");
  const [ticketWa, setTicketWa] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Bersihkan penanda origin detail saat berada di halaman detail tes
  useEffect(() => {
    clearPsikotesDetailOrigin();
  }, [params.testId]);

  // Otomatis buka modal jika query param ?kode=... ada di URL (misal dari share link WhatsApp)
  useEffect(() => {
    const kodeParam = searchParams.get("kode");
    if (kodeParam) {
      setTicketKode(kodeParam);
      setShowTicketModal(true);
    }
  }, [searchParams]);

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = ticketWa.replace(/\D/g, "");
    const local = cleanDigits.startsWith("62") ? cleanDigits.slice(2) : cleanDigits;

    if (!ticketKode.trim()) {
      setTicketError("Kode akses / nomor order wajib diisi.");
      return;
    }
    if (!ticketWa.trim() || !local) {
      setTicketError("Nomor WhatsApp pembeli wajib diisi.");
      return;
    }
    if (!local.startsWith("8")) {
      setTicketError("Nomor tidak valid. Nomor WhatsApp harus diawali angka 8 (contoh: +62 812-xxxx-xxxx).");
      return;
    }
    if (local.length < 9) {
      setTicketError("Nomor WhatsApp terlalu pendek (minimal 10 digit, contoh: +62 812-3456-7890).");
      return;
    }
    if (local.length > 13) {
      setTicketError("Nomor WhatsApp terlalu panjang (maksimal 14 digit angka).");
      return;
    }

    setTicketLoading(true);
    setTicketError(null);
    setTicketSuccess(null);

    try {
      const res = await psikotesService.verifyTicket({
        kode_akses: ticketKode.trim(),
        no_telepon: ticketWa.trim(),
      });

      if (res && res.success && res.data) {
        if (res.data.status_pengerjaan === "SELESAI") {
          setTicketSuccess("Tiket ini sudah pernah diselesaikan. Anda akan dialihkan ke halaman hasil tes...");
          setTimeout(() => {
            markPsikotesDetailOrigin(params.testId);
            router.push(res.data.redirect_url as any);
          }, 1200);
        } else {
          setTicketSuccess("Kode valid! Mengalihkan ke halaman pengerjaan tes...");
          setTimeout(() => {
            markPsikotesDetailOrigin(params.testId);
            router.push(res.data.redirect_url as any);
          }, 800);
        }
      } else {
        setTicketError("Kode akses tidak valid atau tidak ditemukan.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Kode akses atau nomor WhatsApp pembeli tidak sesuai. Mohon periksa kembali.";
      setTicketError(msg);
    } finally {
      setTicketLoading(false);
    }
  };

  const fetchDetail = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await psikotesService.getById(params.testId);
      if (res && res.success && res.data) {
        setApiData(res.data);
      } else {
        setApiData(null);
      }
    } catch (err: any) {
      console.error("Gagal mengambil detail paket psikotes:", err);
      // Bedakan error jaringan/server mati vs 404
      const status = err?.status || err?.response?.status;
      if (status === 404) {
        setApiData(null);
      } else {
        setErrorMessage("Tidak dapat terhubung ke server backend. Silakan periksa koneksi atau coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [params.testId]);

  const isDASSInstrument = checkDASS(apiData, params.testId);
  const isPaidPackage = Boolean(
    apiData ? isPackagePaid(apiData) : isDASSInstrument
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-500 font-medium">Memuat detail psikotes...</p>
      </div>
    );
  }

  // Layar Error Koneksi — Jika backend mati
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-[120px] pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Menghubungkan ke Server</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchDetail}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
            <Link
              href="/psikotes"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Layar Not Found — Jika memang tidak ada paket di DB
  if (!apiData) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-[120px] pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Paket Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Paket psikotes yang Anda cari tidak tersedia atau belum dipublikasikan.
          </p>
          <Link
            href="/psikotes"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-sm"
          >
            Kembali ke Daftar Psikotes
          </Link>
        </div>
      </div>
    );
  }

  // Data Non-Kritis: gunakan fallback netral + beri console.warn di mode dev
  const bannerImage = apiData.banner_url || (() => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[DEV WARNING][PsikotesDetail] 'banner_url' untuk paket '${params.testId}' kosong di DB.`);
    }
    return DEFAULT_BANNER;
  })();

  const deskripsiText = apiData.tentang_tes || (() => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[DEV WARNING][PsikotesDetail] 'tentang_tes' untuk paket '${params.testId}' kosong di DB.`);
    }
    return "Asesmen ini dirancang untuk membantumu mengenali kondisi emosional dan psikologis diri secara lebih mendalam sebagai langkah awal merawat kesehatan mental.";
  })();

  const effectivePrice =
    typeof apiData.harga === "number" && apiData.harga > 0
      ? apiData.harga
      : (apiData.jenis_akses === "BERBAYAR" || (!apiData && isDASSInstrument))
      ? 49000
      : 0;
  const formattedPrice = effectivePrice > 0 ? `Rp ${effectivePrice.toLocaleString("id-ID")}` : "Gratis";

  const targetUsia = getInstrumentTargetUsia(apiData, params.testId);

  const data = {
    title: apiData.judul || "Paket Psikotes Empathika",
    image: bannerImage,
    description: deskripsiText,
    questions: `${apiData.soal_psikotes?.length || 0} Pertanyaan`,
    targetUsia,
    price: effectivePrice,
    formattedPrice,
    guidelines: DEFAULT_GUIDELINES,
    freeBenefits: UNIVERSAL_FREE_BENEFITS,
    paidBenefits: UNIVERSAL_PAID_BENEFITS,
    paidPackageName: "Laporan Hasil Psikotes Lengkap (PDF)",
  };

  const checkoutUrl = `/psikotes/checkout?testId=${params.testId}&judul=${encodeURIComponent(data.title)}&harga=${encodeURIComponent(data.formattedPrice)}&kategori=Psikotes&subjudul=${encodeURIComponent('Akses paket tes psikotes lengkap beserta laporan analisis profesional.')}&bannerUrl=${encodeURIComponent(data.image)}`;

  return (
    <div className="w-full font-sans bg-[#f8f9fa] pb-24">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full h-[320px] sm:h-[360px] md:h-[400px] bg-[#1c352d] overflow-hidden">
        <Image 
          src={data.image} 
          alt={data.title}
          fill
          className="object-cover opacity-50 mix-blend-overlay"
          priority
          unoptimized
        />
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end pb-20 sm:pb-24 md:pb-28 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-extrabold text-white tracking-tight max-w-4xl leading-[1.2] drop-shadow-md">
            {data.title}
          </h1>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Description & Guidelines */}
          <div className="lg:w-2/3 bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
            
            {/* Overview */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#561269] mb-3.5 tracking-tight">Tentang Tes Ini</h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal">
                {data.description}
              </p>
            </div>

            {/* Guidelines */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3.5 flex items-center gap-2 tracking-tight">
                <svg className="w-5 h-5 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Panduan Pengisian
              </h2>
              <div className="bg-amber-50/60 rounded-2xl p-5 sm:p-6 border border-amber-100 shadow-xs">
                <ul className="space-y-3">
                  {data.guidelines.map((guide, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-[#d97706] shadow-xs shrink-0 text-xs border border-amber-200/50 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed text-sm font-normal">{guide}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3.5 border-t border-amber-200/50">
                  <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed text-center">
                    Selamat mengerjakan! Semoga tes ini membantu kamu lebih mengenal kondisi emosionalmu.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar with Interactive CTA */}
          <div className="lg:w-1/3 w-full sticky top-[120px]">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-lg border border-gray-100 flex flex-col gap-6">
              
              {/* Info Spesifikasi Tes: Jumlah Soal & Rentang Usia */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-[#f8f9fa] p-3.5 rounded-2xl border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#561269] shadow-xs shrink-0">
                    <FileQuestion className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">Jumlah Soal</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate">{data.questions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#f8f9fa] p-3.5 rounded-2xl border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#561269] shadow-xs shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">Rentang Usia</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate" title={data.targetUsia}>
                      {data.targetUsia}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detail Plan Berbayar atau Gratis */}
              {isPaidPackage ? (
                /* Detail Plan Berbayar */
                <div className="flex flex-col gap-5 p-5 rounded-2xl bg-gradient-to-b from-purple-50/60 to-white border border-purple-100">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Total Biaya Akses</span>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#561269] tracking-tight">
                        {data.formattedPrice}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">/ 1x tes</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-purple-100/80 pt-3 text-xs text-gray-700">
                    <p className="font-bold text-gray-900">Termasuk dalam paket ini:</p>
                    {data.paidBenefits.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button Berbayar */}
                  <Link 
                    href={checkoutUrl as any}
                    onClick={() => clearPsikotesDetailOrigin()}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Link Akses Tiket (Bukan tombol, teks link halus di bawah tombol pembayaran) */}
                  <div className="text-center -mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTicketError(null);
                        setTicketSuccess(null);
                        setShowTicketModal(true);
                      }}
                      className="text-xs text-gray-500 hover:text-[#561269] transition inline-block cursor-pointer font-medium"
                    >
                      <span>
                        Sudah bayar?{" "}
                        <span className="font-semibold text-[#561269] underline underline-offset-2 hover:text-[#763E8B]">
                          Masukkan kode akses di sini
                        </span>
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 text-center">
                    Pembayaran aman via QRIS, Bank Transfer, dan E-Wallet resmi.
                  </p>
                </div>
              ) : (
                /* Detail Plan Gratis */
                <div className="flex flex-col gap-5 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Biaya Pengerjaan</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                        Rp 0
                      </span>
                      <span className="text-xs text-emerald-600 font-bold uppercase">Gratis</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-emerald-100 pt-3 text-xs text-gray-700">
                    <p className="font-bold text-gray-900">Fitur akses gratis:</p>
                    {data.freeBenefits.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button Gratis */}
                  <Link 
                    href={`/psikotes/${params.testId}/mulai`}
                    onClick={() => markPsikotesDetailOrigin(params.testId)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                  >
                    <span>Mulai Tes Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
              
            </div>
          </div>

        </div>
      </section>

      {/* 3. MODAL VERIFIKASI TIKET */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowTicketModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-3 pr-8">
              <h3 className="text-xl font-bold text-gray-900">Akses Tiket Tes</h3>
            </div>

            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Jika Anda sudah membeli paket ini, masukkan kode akses transaksi dan nomor WhatsApp pembeli untuk melanjutkan. Tiket pengerjaan dan akses hasil tes aktif tanpa batas waktu.
            </p>

            {/* Status alerts */}
            {ticketError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="leading-snug">{ticketError}</span>
              </div>
            )}

            {ticketSuccess && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-snug">{ticketSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleVerifyTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Kode Akses / Nomor Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ticketKode}
                  onChange={(e) => setTicketKode(e.target.value.toUpperCase())}
                  placeholder="Contoh: PSI-20261107-1234"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#561269] focus:border-transparent font-mono uppercase"
                />
              </div>

              <div>
                <PhoneInputField
                  label="Nomor WhatsApp Pembeli"
                  required
                  value={ticketWa}
                  onChange={(val) => setTicketWa(val)}
                  placeholder="812-3456-7890"
                  helperText="Nomor kontak yang dimasukkan saat proses pembayaran."
                  theme="purple"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full py-3.5 rounded-xl bg-[#561269] hover:bg-[#763E8B] text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer shadow-md"
                >
                  {ticketLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Verifikasi & Masuk Tes</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Bantuan Lupa Kode Akses */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  Lupa kode akses atau nomor WhatsApp?{" "}
                  <a
                    href="https://wa.me/6287878785498?text=Halo%20Admin%20Empathika,%20saya%20lupa%20kode%20akses%20tiket%20psikotes%20saya.%20Mohon%20bantuannya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#561269] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Hubungi Admin</span>
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
