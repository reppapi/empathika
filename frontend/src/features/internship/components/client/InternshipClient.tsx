"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Coins,
  CheckCircle2,
  Sparkles,
  BookOpen,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  AlertCircle,
  GraduationCap,
  Compass,
  Users,
  Award,
} from "lucide-react"
import HeroStarryOverlay from "@/components/shared/HeroStarryOverlay"
import {
  internshipService,
  InternshipPosition,
} from "@/services/internship.service"

export default function InternshipClient() {
  const [positions, setPositions] = useState<InternshipPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Muat posisi publik langsung dari database
  const loadPositions = async () => {
    try {
      const data = await internshipService.getPublicPositions()
      setPositions(data)
    } catch {
      setPositions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPositions()

    // Sinkronisasi otomatis saat ada pembaruan dari tab lain atau dashboard admin
    const handleUpdate = () => {
      loadPositions()
    }

    window.addEventListener("empathika_internship_updated", handleUpdate)
    window.addEventListener("storage", handleUpdate)
    return () => {
      window.removeEventListener("empathika_internship_updated", handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const scrollToPositions = () => {
    const el = document.getElementById("posisi-tersedia")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBFD] text-gray-800 font-sans selection:bg-[#561269] selection:text-white">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#561269] via-[#651877] to-[#430b53] text-white pt-28 pb-20 md:pt-36 md:pb-28">
        <HeroStarryOverlay density="dense" showAurora showFlare />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-[#EAB308] mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#EAB308]" />
            Program Magang Empathika
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
            Eksplorasi Potensi, Kolaborasi & Beri{" "}
            <span className="text-[#EAB308] underline decoration-wavy decoration-[#EAB308]/60 underline-offset-8">
              Kontribusi Nyata
            </span>
          </h1>

          {/* About the Program */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 sm:p-8 text-white/90 text-base sm:text-lg leading-relaxed shadow-xl mb-10 text-justify sm:text-center">
            <p className="font-semibold text-[#EAB308] text-sm uppercase tracking-wider mb-2">
              About the Program
            </p>
            <p>
              Empathika membuka kesempatan bagi mahasiswa dan fresh graduate untuk bergabung
              dalam Program Internship yang dirancang untuk memberikan pengalaman langsung dalam
              industri kesehatan mental dan digital media. Melalui program ini, peserta akan
              mendapatkan kesempatan untuk mengeksplorasi minat, berkolaborasi dalam tim profesional,
              dan berkontribusi dalam proyek nyata yang berdampak bagi masyarakat.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToPositions}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Briefcase className="w-5 h-5 text-[#0f172a]" />
              Lihat Posisi Terbuka
            </button>
            <a
              href="#tiga-pilar"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-base backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              Tentang 3 Pilar
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. TIGA PILAR UTAMA (BELAJAR, BERKARYA, BERTUMBUH) ── */}
      <section id="tiga-pilar" className="py-16 sm:py-24 bg-white border-b border-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#561269] bg-purple-100/60 px-3.5 py-1 rounded-full">
              Fondasi Program
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-4">
              3 Nilai Utama Internship Empathika
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Program ini dirancang bukan sekadar untuk magang, namun menjadi perjalanan berharga
              bagi pengembangan diri dan dampak sosial yang nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pilar 1: EKSPLORASI */}
            <div className="group relative bg-[#FCF8FD] border border-purple-100 rounded-3xl p-8 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#561269] to-[#8B3A9C] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Compass className="w-8 h-8 text-[#EAB308]" />
              </div>
              <span className="text-xs font-black tracking-widest text-[#561269] uppercase">
                Pilar 01
              </span>
              <h3 className="text-2xl font-black text-gray-900 mt-1 mb-3 tracking-wide">
                EKSPLORASI
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Menjelajahi dinamika industri kesehatan mental dan digital media, serta mengasah keahlian
                baru secara aplikatif melalui bimbingan dan mentorship intensif dari praktisi berpengalaman.
              </p>
              <div className="mt-6 pt-6 border-t border-purple-100/80 flex items-center text-xs font-semibold text-[#561269] gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
                Mentorship 1-on-1 & Pembelajaran Aplikatif
              </div>
            </div>

            {/* Pilar 2: KOLABORASI */}
            <div className="group relative bg-[#FCF8FD] border border-purple-100 rounded-3xl p-8 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#561269] to-[#8B3A9C] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-[#EAB308]" />
              </div>
              <span className="text-xs font-black tracking-widest text-[#561269] uppercase">
                Pilar 02
              </span>
              <h3 className="text-2xl font-black text-gray-900 mt-1 mb-3 tracking-wide">
                KOLABORASI
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Bekerja berdampingan dalam tim multidisiplin yang suportif—mulai dari psikolog, content creator,
                hingga tim operasional—untuk merancang program dan kampanye kreatif yang inovatif.
              </p>
              <div className="mt-6 pt-6 border-t border-purple-100/80 flex items-center text-xs font-semibold text-[#561269] gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
                Lingkungan Inklusif & Kerja Tim Multidisiplin
              </div>
            </div>

            {/* Pilar 3: KONTRIBUSI */}
            <div className="group relative bg-[#FCF8FD] border border-purple-100 rounded-3xl p-8 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#561269] to-[#8B3A9C] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-[#EAB308]" />
              </div>
              <span className="text-xs font-black tracking-widest text-[#561269] uppercase">
                Pilar 03
              </span>
              <h3 className="text-2xl font-black text-gray-900 mt-1 mb-3 tracking-wide">
                KONTRIBUSI
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Memberikan sumbangsih nyata dalam meningkatkan kesadaran kesehatan mental masyarakat luas,
                sekaligus membangun portofolio kredibel dan jejaring karir masa depanmu.
              </p>
              <div className="mt-6 pt-6 border-t border-purple-100/80 flex items-center text-xs font-semibold text-[#561269] gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
                Sertifikat Resmi & Portofolio Berdampak
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. OPEN POSITIONS SECTION ── */}
      <section id="posisi-tersedia" className="py-16 sm:py-24 bg-[#FAF7FB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Pilih posisi yang sesuai dengan keahlian dan minatmu. Bersama Empathika, wujudkan
              kontribusi nyata untuk ekosistem kesehatan mental Indonesia.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Memuat lowongan tersedia...</p>
            </div>
          ) : positions.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-dashed border-purple-200 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-purple-50 text-[#561269] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-[#561269]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Belum Ada Posisi yang Dibuka
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                Saat ini program internship sedang ditutup atau belum ada posisi baru yang dibuka.
                Ikuti terus informasi terbaru kami untuk mengetahui gelombang pendaftaran
                berikutnya.
              </p>
              <Link
                href="/kerja-sama"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#561269] hover:bg-[#651877] text-white font-semibold text-sm transition-colors shadow-sm"
              >
                Eksplor Program Kerja Sama
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* Daftar Posisi */
            <div className="space-y-8">
              {positions.map((pos) => {
                const isExpanded = expandedId === pos.id || positions.length === 1

                return (
                  <div
                    key={pos.id}
                    className="bg-white border border-purple-100/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Header Kartu Posisi */}
                    <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-white via-white to-purple-50/40">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {pos.divisi && (
                              <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-[#561269] rounded-full">
                                {pos.divisi}
                              </span>
                            )}
                            <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Dibuka
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                            {pos.judul}
                          </h3>

                          {pos.deskripsi && (
                            <p className="text-gray-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                              {pos.deskripsi}
                            </p>
                          )}
                        </div>

                        {/* Tombol Apply Now di Header */}
                        <div className="shrink-0 flex items-center gap-3">
                          <a
                            href={pos.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                          >
                            <span>APPLY NOW</span>
                            <ExternalLink className="w-4 h-4 text-[#0f172a]" />
                          </a>
                        </div>
                      </div>

                      {/* Info Pills Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-gray-100">
                        <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-[#561269]" />
                            Duration
                          </span>
                          <span className="text-sm font-extrabold text-gray-900">{pos.durasi}</span>
                        </div>

                        <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-[#561269]" />
                            Location
                          </span>
                          <span className="text-sm font-extrabold text-gray-900">{pos.lokasi}</span>
                        </div>

                        <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
                            <Laptop className="w-3.5 h-3.5 text-[#561269]" />
                            Work Mode
                          </span>
                          <span className="text-sm font-extrabold text-gray-900">{pos.workMode}</span>
                        </div>

                        <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
                            <Coins className="w-3.5 h-3.5 text-[#561269]" />
                            Compensation
                          </span>
                          <span className="text-sm font-extrabold text-gray-900">{pos.kompensasi}</span>
                        </div>

                        <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50 col-span-2 sm:col-span-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            Application Deadline
                          </span>
                          <span className="text-sm font-extrabold text-rose-700">{pos.deadline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Toggle Detail jika posisi lebih dari 1 */}
                    {positions.length > 1 && (
                      <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          {isExpanded ? "Sembunyikan rincian peran" : "Lihat tanggung jawab & kualifikasi"}
                        </span>
                        <button
                          onClick={() => toggleExpand(pos.id)}
                          className="text-xs font-bold text-[#561269] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? "Tutup Detail" : "Lihat Rincian"}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {/* Body: Responsibilities & Qualifications */}
                    {isExpanded && (
                      <div className="p-6 sm:p-8 space-y-8 animate-fadeIn">
                        {/* Responsibilities */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#561269]" />
                            Responsibilities
                          </h4>
                          <ul className="space-y-2.5">
                            {pos.responsibilities.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                                <CheckCircle2 className="w-5 h-5 text-[#561269] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Qualifications */}
                        <div className="pt-6 border-t border-gray-100">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                            Qualifications
                          </h4>
                          <ul className="space-y-2.5">
                            {pos.qualifications.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                                <CheckCircle2 className="w-5 h-5 text-[#CA8A04] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Bottom CTA Card */}
                        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                          <div className="text-sm text-gray-600 text-center sm:text-left">
                            <p className="font-semibold text-gray-900">
                              Batas Akhir Pendaftaran: <span className="text-rose-600 font-bold">{pos.deadline}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Pastikan berkas portofolio dan CV terlampir dengan lengkap.
                            </p>
                          </div>

                          <a
                            href={pos.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span>APPLY NOW</span>
                            <ExternalLink className="w-4 h-4 text-[#0f172a]" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. BENEFIT / MENGAPA BERGABUNG ── */}
      <section className="py-16 sm:py-24 bg-white border-t border-purple-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#561269] bg-purple-100 px-3.5 py-1 rounded-full">
                Benefit Program
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
                Apa yang Akan Kamu Dapatkan Selama Magang di Empathika?
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Kami berkomitmen memberikan lingkungan belajar yang suportif, inklusif, dan
                menantang agar kamu dapat mencapai potensi terbaikmu.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#561269]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Mentorship Profesional</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                      Bimbingan langsung dari psikolog dan praktisi media kreatif berpengalaman.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5 text-[#561269]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Fleksibilitas Kerja (Remote / WFA)</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                      Bekerja secara fleksibel dari mana saja dengan jam kerja yang bersahabat untuk mahasiswa.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#561269]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Sertifikat & Peluang Karir Lanjutan</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
                      Sertifikat resmi magang dan kesempatan direkrut sebagai tim inti atau project-based.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner samping / highlight box */}
            <div className="bg-gradient-to-br from-[#561269] to-[#8B3A9C] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <span className="px-3 py-1 bg-white/20 text-[#EAB308] font-bold text-xs rounded-full">
                  Komitmen Kami
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                  &ldquo;Setiap langkah kecil yang kamu buat membawa dampak besar bagi kesehatan mental
                  banyak orang.&rdquo;
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Mari bergabung bersama kami menjadi jembatan empati dan perubahan positif bagi
                  lingkungan sekitar.
                </p>

                <div className="pt-4 border-t border-white/20">
                  <button
                    onClick={scrollToPositions}
                    className="w-full py-3.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
