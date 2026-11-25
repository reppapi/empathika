"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  UserCheck,
  Calendar,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Mail,
  ChevronRight,
  Phone,
  Globe,
  ExternalLink,
  Check,
  Copy,
  AlertCircle,
  HeartHandshake,
  Sparkles,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { useTenantContext } from "@/context/TenantContext";
import { useAdminContact } from "@/hooks/useAdminContact";

interface SectionItem {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: SectionItem[] = [
  { id: "ketentuan-umum", number: "1", title: "Ketentuan Umum & Ruang Lingkup", icon: FileText },
  { id: "kelayakan-akun", number: "2", title: "Kelayakan & Pendaftaran Akun", icon: UserCheck },
  { id: "prosedur-layanan", number: "3", title: "Prosedur Konsultasi & Asesmen", icon: Calendar },
  { id: "pembayaran-transaksi", number: "4", title: "Tarif & Ketentuan Pembayaran", icon: CreditCard },
  { id: "reschedule-pembatalan", number: "5", title: "Penjadwalan Ulang & Pembatalan", icon: Clock },
  { id: "etika-kerahasiaan", number: "6", title: "Kode Etik & Kerahasiaan Sesi", icon: ShieldCheck },
  { id: "batasan-tanggung-jawab", number: "7", title: "Batasan Kewajiban & Hukum", icon: AlertTriangle },
  { id: "layanan-kontak", number: "8", title: "Pusat Bantuan & Kontak Resmi", icon: Mail },
];

export default function TermsConditionsClient() {
  const { isBiro, biroProfile, withBiro } = useTenantContext();
  const { email, waNumber, displayPhone } = useAdminContact();
  const [activeSection, setActiveSection] = useState<string>("ketentuan-umum");
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  const brandName = isBiro && biroProfile?.nama_biro ? biroProfile.nama_biro : "Empathika";

  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-highlight TOC saat pengguna melakukan scrolling alami
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrollingRef.current) return;

      const scrollPosition = window.scrollY + 160;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = SECTIONS[i];
        const el = document.getElementById(sec.id);
        if (el) {
          if (el.offsetTop <= scrollPosition) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      isManualScrollingRef.current = true;
      setActiveSection(id);

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 850);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(label);
    setTimeout(() => setCopiedContact(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#faf8fb] text-gray-800 antialiased selection:bg-[#561269]/10 selection:text-[#561269]">
      {/* ============================================================ */}
      {/* HERO BANNER SECTION                                          */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/80 via-white to-[#faf8fb] pt-28 pb-14 border-b border-purple-100/60">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
            <Link
              href={withBiro("/") as any}
              className="hover:text-[#561269] transition-colors"
            >
              Beranda
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#561269] font-semibold">Syarat & Ketentuan</span>
          </nav>

          <div className="max-w-3xl">
            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.2] mb-4">
              Syarat & Ketentuan Layanan <span className="text-[#561269]">{brandName}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Selamat datang di pedoman resmi penggunaan platform {brandName}. Syarat dan ketentuan ini mengatur hak, kewajiban, serta tata cara pelaksanaan sesi konsultasi psikologi, asesmen, dan transaksi layanan Anda bersama kami.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MAIN CONTENT + STICKY SIDEBAR SECTION                         */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ---------------------------------------------------------- */}
          {/* DESKTOP SIDEBAR (4 Cols) - Quick TOC Navigation             */}
          {/* ---------------------------------------------------------- */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-2xl border border-purple-100/80 shadow-xs p-5">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
                <FileText className="w-5 h-5 text-[#561269]" />
                <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">
                  Daftar Isi Ketentuan
                </h3>
              </div>

              <nav className="space-y-1.5">
                {SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? "bg-[#EAB308] text-gray-950 font-bold shadow-md shadow-yellow-500/25 scale-[1.01]"
                          : "text-gray-600 font-medium hover:bg-yellow-50/70 hover:text-yellow-950"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? "bg-white/90 text-gray-950 font-extrabold shadow-2xs"
                              : "bg-purple-100/70 text-[#561269] font-bold group-hover:bg-yellow-100 group-hover:text-yellow-800"
                          }`}
                        >
                          {sec.number}
                        </span>
                        <span className="truncate">{sec.title}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isActive
                            ? "text-gray-950 translate-x-1 font-bold stroke-[2.5]"
                            : "text-gray-300 group-hover:text-yellow-700 group-hover:translate-x-0.5"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Support Card inside Sidebar */}
            <div className="bg-gradient-to-br from-[#561269] to-[#3a0847] rounded-2xl p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-purple-200 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Layanan Pelanggan
              </div>
              <h4 className="font-bold text-base text-white mb-2">
                Perlu Bantuan Terkait Ketentuan Layanan?
              </h4>
              <p className="text-purple-100/90 text-xs leading-relaxed mb-4">
                Tim administrasi dan operasional kami siap memandu Anda mengenai jadwal, pembayaran, maupun kendala teknis lainnya.
              </p>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-purple-200 shrink-0" />
                  <span className="truncate font-medium">{email}</span>
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="truncate font-medium">{displayPhone}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* ---------------------------------------------------------- */}
          {/* MAIN ARTICLES (8 Cols)                                     */}
          {/* ---------------------------------------------------------- */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Mobile / Tablet Horizontal Navigation Bar */}
            <div className="lg:hidden -mt-2 mb-4 overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-[#EAB308] text-gray-950 font-bold shadow-sm shadow-yellow-500/25 scale-[1.02]"
                        : "bg-white text-gray-600 font-medium border border-gray-200/80 hover:bg-yellow-50/60"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center ${
                        isActive ? "bg-white/90 text-gray-950" : "bg-purple-100 text-[#561269]"
                      }`}
                    >
                      {sec.number}
                    </span>
                    <span>{sec.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Opening Intro Statement */}
            <div className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-100/40 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    Komitmen Kesepakatan Bersama
                  </h2>
                  <p className="text-sm text-gray-500">
                    Menciptakan ruang pendampingan psikologis yang aman, profesional, dan saling menghormati.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                <p>
                  Dengan mengakses situs web, mendaftarkan akun, atau melakukan reservasi sesi konsultasi dan asesmen di <strong className="text-gray-900 font-semibold">{brandName}</strong>, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum dalam dokumen Syarat & Ketentuan ini.
                </p>
                <p>
                  Ketentuan ini berlaku bagi seluruh pengguna individu, orang tua/wali klien anak, mitra biro psikologi, serta peserta event atau asesmen yang diselenggarakan melalui sistem Empathika.
                </p>
              </div>
            </div>

            {/* ======================================================== */}
            {/* SECTION 1: Ketentuan Umum & Ruang Lingkup                */}
            {/* ======================================================== */}
            <article
              id="ketentuan-umum"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Ketentuan Umum & Ruang Lingkup Layanan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Definisi platform dan peran Empathika dalam ekosistem layanan psikologi.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900 font-semibold">{brandName}</strong> merupakan platform digital yang memfasilitasi penjadwalan, pembayaran, dan pelaksanaan layanan kesehatan mental, meliputi konseling tatap muka di klinik (offline), sesi konsultasi daring (online via video call), asesmen minat bakat, psikotes, seminar, serta workshop psikologis.
                </p>

                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <HeartHandshake className="w-4 h-4 text-[#561269] shrink-0" />
                    <span>Tenaga Ahli Berlisensi</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Seluruh sesi konseling dan asesmen ditangani langsung oleh psikolog klinis, konselor profesional, atau mitra biro psikologi resmi yang telah memiliki Surat Izin Praktik Psikologi (SIPP) aktif serta terikat pada Kode Etik Psikologi Indonesia.
                  </p>
                </div>

                {/* Important Crisis Disclaimer */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs sm:text-sm text-amber-900 leading-relaxed">
                    <strong className="font-bold block">Pernyataan Batasan Kondisi Gawat Darurat:</strong>
                    <span>
                      Layanan di platform kami tidak ditujukan untuk penanganan kondisi krisis gawat darurat psikiatri yang mengancam keselamatan jiwa secara mendesak. Apabila Anda atau orang terdekat berada dalam situasi krisis akut atau potensi bahaya langsung, harap segera menghubungi hotline darurat nasional (119/112) atau mendatangi Instalasi Gawat Darurat (IGD) rumah sakit terdekat.
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 2: Kelayakan & Pendaftaran Akun                  */}
            {/* ======================================================== */}
            <article
              id="kelayakan-akun"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Kelayakan Pengguna & Pendaftaran Akun
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Persyaratan identitas dan tanggung jawab keamanan akun pengguna.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm sm:text-base text-gray-600 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                      <span>Keabsahan Data Identitas</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Pengguna wajib memberikan data identitas asli, nama lengkap yang sah, alamat email aktif, dan nomor WhatsApp yang dapat dihubungi untuk kelancaran administrasi jadwal.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                      <span>Klien Usia di Bawah 18 Tahun</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Bagi klien anak atau remaja (di bawah 18 tahun), pendaftaran dan persetujuan sesi (*informed consent*) wajib didampingi serta disetujui oleh orang tua atau wali sah.
                    </p>
                  </div>
                </div>

                <p className="pt-2">
                  Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi, tautan verifikasi, dan segala aktivitas yang berlangsung di bawah akun pribadi Anda. Segera laporkan kepada kami apabila terindikasi adanya penggunaan tanpa izin atas akun Anda.
                </p>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 3: Prosedur Konsultasi & Asesmen                 */}
            {/* ======================================================== */}
            <article
              id="prosedur-layanan"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Prosedur Pelaksanaan Konsultasi & Asesmen
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Alur ketepatan waktu, metode sesi, dan tata tertib konsultasi.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                <ul className="space-y-3.5 pl-1">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-semibold">Sesi Konsultasi Daring (Online):</strong>
                      <span className="text-gray-600 ml-1">
                        Klien akan menerima tautan video meeting resmi (Zoom) yang dikirimkan via WhatsApp atau email sebelum sesi dimulai. Klien diharapkan berada di ruangan yang tenang, privat, dan memiliki koneksi internet yang stabil.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-semibold">Sesi Konsultasi Tatap Muka (Offline di Klinik):</strong>
                      <span className="text-gray-600 ml-1">
                        Klien diharapkan hadir di lokasi klinik sekurang-kurangnya 10 menit sebelum jadwal sesi dimulai untuk registrasi administratif.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-semibold">Kehadiran Tepat Waktu:</strong>
                      <span className="text-gray-600 ml-1">
                        Kehadiran tepat waktu sangat penting untuk kelancaran dan efektivitas sesi konseling. Apabila Anda terlambat, sesi akan tetap berjalan sesuai jadwal yang telah ditentukan tanpa adanya perpanjangan waktu konseling, demi menjaga jadwal janji temu klien berikutnya.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-semibold">Penambahan Waktu Sesi Konseling:</strong>
                      <span className="text-gray-600 ml-1">
                        Penambahan durasi waktu sesi konseling akan dikenakan biaya tambahan proporsional, dan proses penagihan biaya tambahan tersebut akan dilakukan segera setelah sesi konseling berakhir.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 4: Tarif & Ketentuan Pembayaran                  */}
            {/* ======================================================== */}
            <article
              id="pembayaran-transaksi"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Tarif & Ketentuan Pembayaran Layanan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Sistem pembayaran penuh resmi melalui platform dan penagihan biaya tambahan.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                {/* Kartu Khusus Pembayaran Penuh Melalui Sistem */}
                <div className="p-5 sm:p-6 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-gray-900">
                      <CreditCard className="w-5 h-5 text-[#561269]" />
                      <span>1. Pembayaran Penuh Melalui Sistem Platform</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#EAB308] text-gray-950 font-extrabold text-xs shadow-2xs shrink-0">
                      Pembayaran Penuh
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Sebagai persyaratan resmi konfirmasi pendaftaran sesi konseling maupun asesmen di <strong>Empathika</strong>, klien melakukan pembayaran biaya layanan secara penuh / full payment langsung melalui sistem pembayaran resmi yang terintegrasi di platform website:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-white border border-purple-200/60 space-y-1">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                        Metode Pembayaran Resmi Terintegrasi
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Transaksi diproses otomatis melalui saluran pembayaran digital resmi di sistem reservasi (seperti QRIS, Virtual Account bank, dan e-wallet resmi platform).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-purple-200/60 space-y-1">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                        Otomatis Tanpa Transfer Rekening Pribadi
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Pembayaran diverifikasi secara otomatis oleh sistem tanpa perlu transfer manual ke nomor rekening pribadi, sehingga jadwal dan slot psikolog langsung terkonfirmasi aman.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub Ketentuan Penambahan Waktu & Invoice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                      <span>2. Penambahan Waktu Sesi (*Overtime*)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Apabila terjadi perpanjangan durasi waktu konseling atas kesepakatan bersama antara klien dan tenaga ahli, biaya tambahan akan dikenakan dan ditagihkan segera setelah sesi berakhir.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                      <span>3. Bukti Transaksi & Invoice Elektronik</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Invoice dan bukti pembayaran resmi diterbitkan secara elektronik oleh sistem platform setelah transaksi berhasil diverifikasi dan dapat diakses melalui portal akun atau konfirmasi admin.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 5: Penjadwalan Ulang & Pembatalan                */}
            {/* ======================================================== */}
            <article
              id="reschedule-pembatalan"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Kebijakan Penjadwalan Ulang/Reschedule & Pembatalan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Aturan batas waktu reschedule, ketersediaan situasional, dan ketentuan pembatalan sesi.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                {/* Aturan Reschedule */}
                <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#561269]" />
                    <span>Ketentuan Penjadwalan Ulang/Reschedule</span>
                  </h4>
                  
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-700 pl-1">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                      <span>
                        <strong>Batas Waktu Pengajuan:</strong> Penjadwalan ulang/reschedule dapat diajukan <strong>paling lambat H-3 (3 hari sebelum tanggal sesi)</strong> yang telah disepakati.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                      <span>
                        <strong>Batas Frekuensi Pengajuan:</strong> Permohonan penjadwalan ulang hanya dapat dilakukan <strong>maksimal dua (2) kali</strong> untuk setiap pendaftaran.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                      <span>
                        <strong>Kondisi Situasional Penjadwalan Ulang:</strong> Mengingat penjadwalan ulang/reschedule bersifat mendadak dan situasional, klien menyadari serta menyepakati bahwa adanya kemungkinan pengubahan jadwal yang memerlukan waktu lebih lama, pergantian psikolog pendamping, atau penyesuaian kesepakatan lainnya dari jadwal reservasi yang sebelumnya.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Aturan Pembatalan & Kebijakan Refund */}
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                        Kebijakan Pembatalan Sesi & Pengembalian Dana (*Refund*)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Skema pengembalian dana berdasarkan waktu pengajuan pembatalan reservasi.
                      </p>
                    </div>
                  </div>

                  {/* Skema 3 Tingkat Refund */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {/* Tingkat 1: H-3 Hari ke atas -> 100% */}
                    <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold inline-block">
                          Refund 100%
                        </span>
                        <h5 className="font-bold text-gray-900 text-sm">
                          Pengajuan ≥ H-3 Hari
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Pembatalan diajukan minimal 3 hari sebelum tanggal sesi berlangsung.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 text-xs font-semibold text-emerald-700">
                        ✓ Seluruh dana dikembalikan penuh (100%)
                      </div>
                    </div>

                    {/* Tingkat 2: Lewat dari H-3 Hari -> Potongan 10% */}
                    <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold inline-block">
                          Potongan 10%
                        </span>
                        <h5 className="font-bold text-gray-900 text-sm">
                          Pengajuan &lt; H-3 Hari
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Pembatalan diajukan telah melewati batas H-3 hari sebelum tanggal sesi.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 text-xs font-semibold text-amber-800">
                        ⚠ Dikenakan potongan biaya 10% (dana kembali 90%)
                      </div>
                    </div>

                    {/* Tingkat 3: No-Show -> Biaya Hangus */}
                    <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold inline-block">
                          Biaya Hangus
                        </span>
                        <h5 className="font-bold text-gray-900 text-sm">
                          Ketidakhadiran (*No-Show*)
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Klien tidak hadir pada jadwal sesi tanpa pemberitahuan sebelumnya.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 text-xs font-semibold text-rose-700">
                        ✕ Biaya sesi yang telah dibayarkan tidak dapat dikembalikan
                      </div>
                    </div>
                  </div>

                  {/* Catatan Tambahan Pembatalan Praktisi */}
                  <div className="p-3.5 rounded-xl bg-white/80 border border-amber-200/60 text-xs text-gray-600 leading-relaxed">
                    <strong>Catatan Kondisi Darurat dari Pihak Praktisi:</strong> Apabila pembatalan terjadi atas alasan operasional mendesak dari psikolog pendamping atau gangguan sistem internal Empathika, klien berhak memilih penjadwalan ulang prioritas tanpa mengurangi kuota *reschedule*, atau memperoleh pengembalian dana (*refund*) penuh 100% tanpa potongan biaya apa pun.
                  </div>
                </div>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 6: Kode Etik, Kerahasiaan & HKI                  */}
            {/* ======================================================== */}
            <article
              id="etika-kerahasiaan"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  6
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Kode Etik, Kerahasiaan Sesi & Hak Kekayaan Intelektual
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Standar etika profesional dan perlindungan materi konten.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <ShieldCheck className="w-4 h-4 text-[#561269]" />
                    <span>Larangan Perekaman Tanpa Izin</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Demi melindungi privasi dan integritas proses terapeutik, <strong>klien dilarang keras merekam (baik audio, video, maupun tangkapan layar)</strong> selama sesi konsultasi berlangsung tanpa persetujuan tertulis dari psikolog pendamping. Pelanggaran atas ketentuan ini dapat berujung pada penghentian sepihak atas sesi.
                  </p>
                </div>

                <p>
                  Seluruh instrumen alat tes psikologi, modul seminar, materi workshop, desain antarmuka, dan konten artikel yang tersedia di situs web merupakan hak kekayaan intelektual milik Empathika atau mitra resminya, dan dilindungi oleh undang-undang hak cipta Republik Indonesia. Penggandaan atau penyebarluasan tanpa izin merupakan tindakan melanggar hukum.
                </p>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 7: Batasan Kewajiban & Hukum                     */}
            {/* ======================================================== */}
            <article
              id="batasan-tanggung-jawab"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  7
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Batasan Kewajiban & Hukum yang Berlaku
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Ketentuan hukum, force majeure, dan penyelesaian sengketa.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  Empathika berupaya semaksimal mungkin untuk menyediakan layanan dengan keandalan sistem terbaik. Namun demikian, kami tidak bertanggung jawab atas kerugian tidak langsung yang diakibatkan oleh gangguan jaringan penyedia telekomunikasi klien, bencana alam/force majeure, atau tindakan pihak ketiga di luar kendali wajar kami.
                </p>
                <p>
                  Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diupayakan untuk diselesaikan terlebih dahulu melalui musyawarah untuk mencapai mufakat.
                </p>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 8: Pusat Bantuan & Kontak Resmi                  */}
            {/* ======================================================== */}
            <article
              id="layanan-kontak"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  8
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Pusat Bantuan & Saluran Kontak Resmi
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Kanal komunikasi resmi kami untuk pertanyaan seputar syarat dan ketentuan layanan.
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                Apabila Anda memiliki pertanyaan, klarifikasi, atau memerlukan asistensi administratif terkait Syarat & Ketentuan ini, jangan ragu untuk menghubungi kami melalui saluran resmi berikut:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Email Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-300 transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Surel Resmi</span>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5 truncate">
                        {email}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Respons resmi dalam 1x24 jam kerja.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-purple-100">
                    <a
                      href={`mailto:${email}`}
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-[#561269] text-white text-xs font-semibold hover:bg-[#430e52] transition-colors"
                    >
                      Kirim Surel
                    </a>
                    <button
                      onClick={() => copyToClipboard(email, "email")}
                      title="Salin Email"
                      className="p-2 rounded-lg bg-white border border-purple-200 text-gray-600 hover:text-[#561269] hover:bg-purple-50 transition-colors"
                    >
                      {copiedContact === "email" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">WhatsApp Resmi</span>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5 truncate">
                        {displayPhone}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Chat langsung bersama tim konseling & admin.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-100">
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Chat WhatsApp
                    </a>
                    <button
                      onClick={() => copyToClipboard(displayPhone, "wa")}
                      title="Salin Nomor WhatsApp"
                      className="p-2 rounded-lg bg-white border border-emerald-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      {copiedContact === "wa" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Website Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:border-blue-300 transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Situs Web Resmi</span>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5 truncate">
                        https://empathika.id
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Jelajahi informasi psikolog & asesmen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-blue-100">
                    <a
                      href="https://empathika.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Buka Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => copyToClipboard("https://empathika.id", "web")}
                      title="Salin Tautan Website"
                      className="p-2 rounded-lg bg-white border border-blue-200 text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      {copiedContact === "web" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Operating hours footer box */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>Jam Pelayanan Pengaduan & Layanan Informasi:</strong> Senin – Sabtu, pukul 09.00 – 17.00 WIB. Pertanyaan di luar jam operasional akan ditindaklanjuti pada hari kerja berikutnya.
                </span>
              </div>
            </article>

          </main>
        </div>
      </section>
    </div>
  );
}
