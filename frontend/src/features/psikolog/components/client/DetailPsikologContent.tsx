'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DetailPsikologUI } from '../../data/detailDummy';

interface DetailContentProps {
  psikolog: DetailPsikologUI;
}

export function DetailPsikologContent({ psikolog }: DetailContentProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const initial = psikolog.nama_gelar ? psikolog.nama_gelar.charAt(0) : 'P';
  const peran = psikolog.spesialisasi?.nama || (psikolog.category === 'konselor' ? 'Konselor' : 'Psikolog');

  return (
    <main className="min-h-screen bg-white pb-0 w-full overflow-hidden">
      {/* 1. Curved Purple Hero Banner (Menyatu langsung dari top 0px ke bawah arch) */}
      <div className="w-full overflow-hidden">
        <div 
          className="w-full pt-28 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-md text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_60px] [border-bottom-right-radius:50%_60px] sm:[border-bottom-left-radius:50%_80px] sm:[border-bottom-right-radius:50%_80px] lg:[border-bottom-left-radius:50%_120px] lg:[border-bottom-right-radius:50%_120px]"
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide drop-shadow-sm leading-tight">
              Psikolog kami
            </h1>
            <p className="mt-2 text-purple-200 text-xs sm:text-sm lg:text-base max-w-xl mx-auto font-light">
              Kenali lebih dekat profesional yang akan mendampingi perjalanan kesehatan mental Anda.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container (Full-width fluid di Web Desktop, Adaptif & Lega) */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 mt-8 sm:mt-10 space-y-10 sm:space-y-12">
        {/* Header Profil & Video Intro di Bagian Atas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Kolom Kiri: Foto Profil & Info Pokok */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
            {/* Avatar Foto Bundar */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden shrink-0 bg-[#D4B2E8] flex items-center justify-center shadow-inner border-2 border-purple-100">
              {psikolog.foto ? (
                <Image
                  src={psikolog.foto}
                  alt={psikolog.nama_gelar}
                  fill
                  sizes="(max-width: 768px) 144px, 176px"
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="text-[#561269] font-bold text-4xl select-none">
                  {initial}
                </span>
              )}
            </div>

            {/* Nama, Status, Sesi, dan Quote di Samping Foto */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-[#561269] bg-purple-100 rounded-full">
                  {peran}
                </span>
                {psikolog.instagram && (
                  <span className="inline-block px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
                    {psikolog.instagram}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#561269] tracking-tight leading-snug">
                {psikolog.nama_gelar}
              </h2>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                <p>
                  Jumlah sesi: <span className="font-semibold text-gray-900">{psikolog.jumlah_sesi} Sesi</span>
                </p>
                {psikolog.no_str && (
                  <>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <p>
                      No. STR: <span className="font-semibold text-[#561269] font-mono">{psikolog.no_str}</span>
                    </p>
                  </>
                )}
                {psikolog.no_sipp && (
                  <>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <p>
                      No. SIPP: <span className="font-semibold text-[#561269] font-mono">{psikolog.no_sipp}</span>
                    </p>
                  </>
                )}
              </div>

              {/* Quote / Prinsip Singkat Diri */}
              {psikolog.quote && (
                <div className="mt-3 bg-[#FAF5FD] border-l-4 border-[#561269] p-3.5 sm:p-4 rounded-r-2xl text-left">
                  <p className="text-gray-800 text-xs sm:text-sm md:text-base italic leading-relaxed">
                    &ldquo;{psikolog.quote}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Video Perkenalan Diri (Video Greeting / Intro) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-[#3B074B] aspect-video flex items-center justify-center group">
              {isPlayingVideo ? (
                <video
                  src={psikolog.videoIntroUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                >
                  Browser Anda tidak mendukung tag video.
                </video>
              ) : (
                <>
                  {/* Thumbnail Video */}
                  {psikolog.videoThumbnail || psikolog.foto ? (
                    <Image
                      src={psikolog.videoThumbnail || psikolog.foto!}
                      alt="Thumbnail Video Perkenalan"
                      fill
                      className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badge Video Intro */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Video Perkenalan</span>
                  </div>

                  {/* Durasi */}
                  {psikolog.videoDuration && (
                    <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-mono">
                      {psikolog.videoDuration}
                    </div>
                  )}

                  {/* Tombol Play Interaktif */}
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(true)}
                    className="relative z-10 flex items-center gap-3 bg-white/90 hover:bg-white text-[#561269] px-6 py-3 rounded-full font-bold text-sm sm:text-base shadow-2xl hover:scale-105 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#561269] text-white flex items-center justify-center pl-0.5">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span>Tonton Video Perkenalan</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Garis Horizontal Tipis */}
        <hr className="border-gray-200" />

        {/* 3. PROFIL PSIKOLOG / PRAKATA DIRI */}
        <section className="space-y-3">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
            PERKENALAN PROFIL
          </h3>
          <div className="space-y-4 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed max-w-5xl">
            {psikolog.profilLengkap && psikolog.profilLengkap.length > 0 ? (
              psikolog.profilLengkap.map((paragraf: string, idx: number) => (
                <p key={idx} className="whitespace-pre-line">{paragraf}</p>
              ))
            ) : (
              <p className="whitespace-pre-line">{psikolog.bio || 'Deskripsi profil belum dicantumkan.'}</p>
            )}
          </div>

          {/* Pendidikan & Lisensi */}
          <div className="pt-2 space-y-2">
            {psikolog.pendidikan && (
              <div className="text-sm sm:text-base text-gray-600 font-semibold">
                <span>Pendidikan / Institusi:</span>
                <div className="font-normal text-gray-800 whitespace-pre-wrap leading-relaxed mt-1">
                  {Array.isArray(psikolog.pendidikan)
                    ? psikolog.pendidikan.join('\n')
                    : psikolog.pendidikan}
                </div>
              </div>
            )}
            {(psikolog.no_str || psikolog.no_sipp) && (
              <p className="text-sm sm:text-base text-gray-600 font-semibold">
                Nomor Izin Praktik:{' '}
                <span className="font-normal text-gray-800">
                  {psikolog.no_str && `STR: ${psikolog.no_str}`}
                  {psikolog.no_str && psikolog.no_sipp && ' | '}
                  {psikolog.no_sipp && `SIPP: ${psikolog.no_sipp}`}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* 4. KEAHLIAN PSIKOLOG (Area of Expertise) */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
            KEAHLIAN
          </h3>
          <div className="flex flex-wrap gap-2.5 pt-1 max-w-5xl">
            {psikolog.keahlian && psikolog.keahlian.length > 0 ? (
              psikolog.keahlian.map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-50 text-gray-800 text-sm font-medium border border-gray-200/80 shadow-2xs hover:bg-purple-50/60 hover:border-purple-200 transition-colors"
                >
                  {item}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Informasi keahlian belum tersedia.</p>
            )}
          </div>
        </section>

        {/* 5. JADWAL ASSOCIATE / PRAKTEK */}
        {((psikolog.jadwalAssociate && psikolog.jadwalAssociate.length > 0) || (psikolog.jadwalTersedia && psikolog.jadwalTersedia.length > 0)) ? (
          <section className="space-y-3 pt-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
              JADWAL PRAKTEK
            </h3>
            <div className="flex flex-wrap gap-3.5">
              {(psikolog.jadwalAssociate && psikolog.jadwalAssociate.length > 0
                ? psikolog.jadwalAssociate.slice(0, 3)
                : psikolog.jadwalTersedia?.slice(0, 3)
              )?.map((jadwal: { waktu: string }, idx: number) => (
                <div 
                  key={idx}
                  className="bg-[#FAF5FD] border border-purple-200/80 px-5 py-2.5 rounded-2xl text-xs sm:text-sm md:text-base font-medium text-gray-800"
                >
                  {jadwal.waktu}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-3 pt-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
              JADWAL PRAKTEK
            </h3>
            <p className="text-gray-500 text-sm italic">
              Saat ini belum ada jadwal ketersediaan yang dibuka. Silakan cek berkala atau hubungi admin untuk info sesi terdekat.
            </p>
          </section>
        )}

        {/* 6. TESTIMONI */}
        {psikolog.testimoni && psikolog.testimoni.length > 0 && (
          <section className="space-y-4 pt-2 pb-6">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
              TESTIMONI
            </h3>
            <div className="space-y-4 max-w-5xl">
              {psikolog.testimoni.map((testi: { kutipan: string; pemberi: string }, idx: number) => (
                <div 
                  key={idx} 
                  className="border-l-[3px] border-[#561269] pl-4 sm:pl-6 py-1.5"
                >
                  <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                    &ldquo;{testi.kutipan}&rdquo; <span className="text-gray-700 ml-2 whitespace-nowrap">- {testi.pemberi}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* 7. Section Bawah / CTA */}
      <section className="w-full bg-[#EAEAEA] py-16 sm:py-24 px-4 sm:px-6 mt-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3B074B] leading-tight">
            Satu cerita bisa menjadi awal dari perubahan.
            <br />
            Mulai konsultasimu hari ini.
          </h2>

          <div>
            <Link
              href={`/konseling/jadwal?psikologId=${psikolog.id}&psikologName=${encodeURIComponent(psikolog.nama_gelar || (psikolog as any).account?.nama || "")}` as any}
              className="inline-block bg-[#EAB308] hover:bg-[#CA9A06] text-black font-bold text-base sm:text-lg md:text-xl px-10 sm:px-14 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Daftar Sesi
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}