"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  HeartHandshake,
  Database,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Eye,
  FileEdit,
  Trash2,
  SlidersHorizontal,
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
  { id: "informasi-dihimpun", number: "1", title: "Data & Informasi yang Dihimpun", icon: Database },
  { id: "penggunaan-informasi", number: "2", title: "Tujuan Pengolahan Data", icon: SlidersHorizontal },
  { id: "perlindungan-data", number: "3", title: "Keamanan & Kerahasiaan", icon: Lock },
  { id: "pihak-ketiga", number: "4", title: "Keterlibatan Pihak Ketiga", icon: UserCheck },
  { id: "hak-pengguna", number: "5", title: "Hak & Kendali Pemilik Data", icon: Eye },
  { id: "perubahan-kebijakan", number: "6", title: "Pembaruan Ketentuan", icon: RefreshCw },
  { id: "hubungi-kami", number: "7", title: "Saluran Bantuan & Kontak", icon: Mail },
];

export default function PrivacyPolicyClient() {
  const { isBiro, biroProfile, withBiro } = useTenantContext();
  const { email, waNumber, displayPhone } = useAdminContact();
  const [activeSection, setActiveSection] = useState<string>("informasi-dihimpun");
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  const brandName = isBiro && biroProfile?.nama_biro ? biroProfile.nama_biro : "Empathika";
  const parentBrand = "Empathika";

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
            <span className="text-[#561269] font-semibold">Kebijakan Privasi</span>
          </nav>

          <div className="max-w-3xl">
            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.2] mb-4">
              Kebijakan Privasi <span className="text-[#561269]">{brandName}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Kami menjunjung tinggi kerahasiaan dan privasi Anda. Pedoman ini menjelaskan secara terbuka bagaimana data pribadi Anda dihimpun, dikelola, serta dilindungi selama Anda menggunakan layanan pendampingan kami.
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
                  Daftar Isi Dokumen
                </h3>
              </div>

              <nav className="space-y-1.5">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
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

            {/* Quick Contact Card inside Sidebar */}
            <div className="bg-gradient-to-br from-[#561269] to-[#3a0847] rounded-2xl p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-purple-200 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Pusat Bantuan Resmi
              </div>
              <h4 className="font-bold text-base text-white mb-2">
                Ada Pertanyaan Terkait Privasi Anda?
              </h4>
              <p className="text-purple-100/90 text-xs leading-relaxed mb-4">
                Tim layanan klien dan tim operasional privasi kami siap membantu menjawab pertanyaan Anda dengan senang hati.
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
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    Komitmen Kami untuk Rasa Aman Anda
                  </h2>
                  <p className="text-sm text-gray-500">
                    Kerahasiaan adalah prinsip paling fundamental dalam layanan psikologi.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                <p>
                  Selamat datang di <strong className="text-gray-900 font-semibold">{brandName}</strong>. Kami sangat mengapresiasi keberanian Anda untuk bercerita dan melangkah menuju kesejahteraan mental yang lebih baik. Kami menyadari bahwa data yang Anda berikan—baik data profil, reservasi jadwal, maupun catatan kebutuhan pendampingan—bersifat sangat privat.
                </p>
                <p>
                  Oleh karena itu, kami berkomitmen teguh untuk menjaga dan melindungi setiap jengkal data pribadi yang Anda percayakan kepada kami dengan standar keamanan yang ketat dan etika kerahasiaan profesional. Kebijakan Privasi ini menguraikan secara transparan bagaimana informasi Anda dihimpun, dikelola, digunakan, serta bagaimana hak-hak privasi Anda senantiasa terlindungi secara berkesinambungan.
                </p>
              </div>
            </div>

            {/* ======================================================== */}
            {/* SECTION 1: Informasi yang Kami Himpun                    */}
            {/* ======================================================== */}
            <article
              id="informasi-dihimpun"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Informasi yang Kami Himpun
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Kategori data pribadi yang kami terima untuk menunjang kebutuhan layanan Anda.
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                Untuk dapat memberikan pendampingan psikologis, asesmen, dan fasilitas layanan yang tepat serta aman, kami mengumpulkan sejumlah informasi dari Anda melalui berbagai cara (baik yang Anda masukkan secara langsung maupun yang terekam otomatis oleh sistem):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item 1 */}
                <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0" />
                    <span>Identitas & Kontak Pribadi</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Mencakup nama lengkap, alamat surel (email) aktif, serta nomor telepon/WhatsApp yang digunakan untuk verifikasi akun, konfirmasi reservasi, dan koordinasi sesi.
                  </p>
                </div>

                {/* Item 2 */}
                <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0" />
                    <span>Data Profil Demografis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Informasi penunjang seperti kelompok usia, jenis kelamin, domisili, atau latar belakang relevan yang membantu psikolog memahami konteks konsultasi Anda.
                  </p>
                </div>

                {/* Item 3 */}
                <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0" />
                    <span>Data Reservasi & Sesi Konsultasi</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Rincian jadwal janji temu, riwayat pemesanan sesi konseling atau asesmen, pilihan metode (tatap muka di klinik / daring via video call), dan topik umum layanan.
                  </p>
                </div>

                {/* Item 4 */}
                <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0" />
                    <span>Data Teknis & Akses Platform</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Informasi otomatis saat mengakses platform kami, seperti alamat IP, tipe peramban (browser), sistem operasi, serta data penjelajahan melalui <em>cookies</em> untuk menjaga stabilitas sesi login.
                  </p>
                </div>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 2: Penggunaan Informasi                          */}
            {/* ======================================================== */}
            <article
              id="penggunaan-informasi"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Penggunaan & Tujuan Pengolahan Data
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Bagaimana informasi yang terkumpul dimanfaatkan secara bertanggung jawab.
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
                Setiap data yang Anda bagikan dimanfaatkan semata-mata untuk menjamin kelancaran, keamanan, dan ketepatan layanan yang Anda terima. Secara rinci, data digunakan untuk:
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <strong className="text-gray-900 block font-semibold mb-0.5">
                      Memproses Pemesanan Konsultasi & Event
                    </strong>
                    <span className="text-gray-600 leading-relaxed">
                      Memvalidasi reservasi jadwal konseling, asesmen minat bakat/psikotes, pendaftaran workshop, seminar, maupun program kemitraan resmi.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <strong className="text-gray-900 block font-semibold mb-0.5">
                      Pengiriman Notifikasi & Pengingat Sesi
                    </strong>
                    <span className="text-gray-600 leading-relaxed">
                      Mengirimkan rincian konfirmasi jadwal, tautan ruang temu video (Zoom), faktur pembayaran, serta pengingat janji temu berkala melalui WhatsApp resmi atau email.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <strong className="text-gray-900 block font-semibold mb-0.5">
                      Peningkatan Kualitas Layanan & Pengalaman Pengguna
                    </strong>
                    <span className="text-gray-600 leading-relaxed">
                      Mengevaluasi kenyamanan platform, kecepatan sistem, serta mengolah umpan balik klien guna terus menyempurnakan fitur-fitur pendampingan yang kami sediakan.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <strong className="text-gray-900 block font-semibold mb-0.5">
                      Kepentingan Tata Kelola Administratif & Operasional Internal
                    </strong>
                    <span className="text-gray-600 leading-relaxed">
                      Mendukung pembukuan transaksi, audit sistem, pengelolaan akun terintegrasi, pemeliharaan keamanan server, serta pencegahan indikasi penyalahgunaan.
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 3: Perlindungan Data                             */}
            {/* ======================================================== */}
            <article
              id="perlindungan-data"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Standar Perlindungan & Keamanan Data
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Langkah teknis dan organisasional kami dalam menjaga keamanan data Anda.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  Kami memperlakukan keamanan data pribadi Anda dengan kesungguhan tingkat tinggi. Untuk mencegah timbulnya kerugian berupa kebocoran data, modifikasi ilegal, maupun akses tanpa hak, kami menerapkan arsitektur perlindungan berlapis:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Proteksi Teknis</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Enkripsi transmisi data berstandar SSL/TLS, database terisolasi, serta mekanisme autentikasi terverifikasi.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#561269] flex items-center justify-center font-semibold text-sm">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Kontrol Otorisasi</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Pembatasan akses ketat berbasis peran (*Role-Based Access Control*), sehingga hanya pihak yang berhak yang dapat memproses data Anda.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Etika Kerahasiaan</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Seluruh psikolog dan staf kami terikat perjanjian kerahasiaan (*Non-Disclosure Agreement*) selaras dengan kode etik psikologi.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/60 flex items-start gap-3 mt-3">
                  <AlertCircle className="w-5 h-5 text-[#561269] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Meskipun kami menerapkan teknologi mutakhir demi perlindungan maksimal, kami juga mengingatkan pengguna untuk turut menjaga kerahasiaan kredensial akun dan tautan verifikasi pribadi Anda dari pihak lain.
                  </p>
                </div>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 4: Keterlibatan Pihak Ketiga                     */}
            {/* ======================================================== */}
            <article
              id="pihak-ketiga"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Keterlibatan Pihak Ketiga & Pembagian Terbatas
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Prinsip ketat kami mengenai siapa saja pihak yang dapat berinteraksi dengan data Anda.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  Prinsip utama kami jelas: <strong className="text-gray-900 font-semibold">Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak mana pun</strong> untuk tujuan pemasaran komersial pihak luar tanpa persetujuan eksplisit Anda.
                </p>

                <p>
                  Data pribadi Anda hanya dapat dibagikan atau diproses dalam lingkup yang sangat terbatas demi kepentingan berikut:
                </p>

                <ul className="space-y-3 pl-1">
                  <li className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-semibold">Mitra Tenaga Ahli (Psikolog & Konselor):</strong>
                      <span className="text-gray-600 ml-1">
                        Informasi yang relevan dengan kebutuhan sesi diteruskan kepada psikolog yang bertugas menangani Anda, guna memfasilitasi konseling yang tepat sasaran dan profesional.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-semibold">Penyedia Layanan Pendukung Operasional:</strong>
                      <span className="text-gray-600 ml-1">
                        Pihak ketiga terpercaya yang kami libatkan untuk kebutuhan infrastruktur teknis (seperti gerbang pembayaran resmi untuk memproses transaksi secara aman dan penyedia layanan pengiriman notifikasi otomatis), yang semuanya terikat komitmen kerahasiaan ketat.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-semibold">Kewajiban Hukum & Regulasi:</strong>
                      <span className="text-gray-600 ml-1">
                        Apabila diwajibkan secara sah oleh peraturan perundang-undangan di Republik Indonesia, penetapan pengadilan, atau permintaan resmi dari aparat penegak hukum yang berwenang demi keselamatan atau penegakan hukum.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 5: Hak dan Kendali Pengguna                      */}
            {/* ======================================================== */}
            <article
              id="hak-pengguna"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Hak dan Kendali Anda atas Data Pribadi
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Kekuasaan penuh yang Anda miliki sebagai pemilik data pribadi sah.
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
                Kami menghormati sepenuhnya hak-hak Anda atas privasi data sebagaimana diatur dalam ketentuan perundang-undangan yang berlaku. Anda berhak untuk:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Eye className="w-4 h-4 text-[#561269]" />
                    <span>1. Hak Mengakses Data</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Mengetahui dan meminta salinan ikhtisar data pribadi Anda yang tersimpan di dalam sistem operasional kami.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <FileEdit className="w-4 h-4 text-[#561269]" />
                    <span>2. Hak Memperbarui / Koreksi</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Melakukan perbaikan dan pemutakhiran apabila terdapat data profil atau kontak Anda yang keliru, kurang lengkap, atau berubah.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>3. Hak Meminta Penghapusan</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Meminta penghapusan data pribadi Anda dari sistem kami, sejauh tidak berbenturan dengan ketentuan retensi hukum atau arsip rekam medis psikologis resmi.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    <span>4. Hak Menolak Pengolahan</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Menolak atau membatasi pengolahan data Anda untuk kepentingan tertentu di luar keperluan utama pelaksanaan layanan konseling.
                  </p>
                </div>
              </div>

              {/* Callout box to request */}
              <div className="p-4 sm:p-5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    Ingin Mengajukan Permohonan Terkait Data Anda?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Cukup kirimkan surel resmi dengan menyertakan nama dan alamat email terdaftar Anda ke:
                  </p>
                </div>
                <a
                  href={`mailto:${email}?subject=Permohonan%20Hak%20Data%20Pribadi`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#561269] text-white text-xs sm:text-sm font-semibold hover:bg-[#430e52] transition-colors shrink-0 shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Kirim Permohonan ke {email}</span>
                </a>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 6: Perubahan Kebijakan                           */}
            {/* ======================================================== */}
            <article
              id="perubahan-kebijakan"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  6
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Pembaruan & Penyesuaian Kebijakan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Transparansi mengenai evaluasi dan revisi berkala dokumen ini.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  Kami berhak memperbarui Kebijakan Privasi ini secara berkala agar senantiasa selaras dengan pengembangan fitur layanan, perkembangan teknologi perlindungan data, serta penyesuaian terhadap peraturan perundang-undangan Republik Indonesia yang berlaku.
                </p>
                <p>
                  Setiap pembaruan akan kami publikasikan langsung pada halaman ini dengan mencantumkan tanggal revisi terbaru di bagian atas. Apabila terdapat perubahan mendasar yang berdampak signifikan terhadap tata kelola data Anda, kami dapat mengabarkan pemberitahuan tambahan melalui email atau pengumuman di aplikasi/situs web kami. Kami menganjurkan Anda untuk meninjau halaman ini dari waktu ke waktu.
                </p>
              </div>
            </article>

            {/* ======================================================== */}
            {/* SECTION 7: Hubungi Kami                                  */}
            {/* ======================================================== */}
            <article
              id="hubungi-kami"
              className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
                  7
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Hubungi Kami & Saluran Bantuan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Kanal komunikasi resmi untuk berdiskusi seputar privasi dan perlindungan data Anda.
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                Apabila Anda memiliki pertanyaan, klarifikasi, masukan, maupun kendala seputar Kebijakan Privasi ini, silakan hubungi tim kami melalui saluran resmi berikut:
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
                  <strong>Jam Pelayanan Pengaduan & Layanan Informasi:</strong> Senin – Sabtu, pukul 08.00 – 20.00 WIB. Pertanyaan di luar jam operasional akan ditindaklanjuti pada hari kerja berikutnya.
                </span>
              </div>
            </article>

          </main>
        </div>
      </section>
    </div>
  );
}
