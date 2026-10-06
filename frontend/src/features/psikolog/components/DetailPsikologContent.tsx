'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DetailPsikologUI } from '../data/detailDummy';

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
      <div 
        className="w-full pt-28 sm:pt-36 md:pt-40 lg:pt-44 pb-20 sm:pb-28 md:pb-32 lg:pb-36 bg-gradient-to-b from-[#8B3A9C] via-[#651877] to-[#400B4D] shadow-xl text-center px-4 sm:px-6 lg:px-8 transition-all duration-300 [border-bottom-left-radius:50%_80px] [border-bottom-right-radius:50%_80px] sm:[border-bottom-left-radius:50%_120px] sm:[border-bottom-right-radius:50%_120px] md:[border-bottom-left-radius:50%_160px] md:[border-bottom-right-radius:50%_160px] lg:[border-bottom-left-radius:50%_200px] lg:[border-bottom-right-radius:50%_200px] relative"
      >
        {/* Tombol Navigasi Kembali */}
        <div className="w-full max-w-[1400px] mx-auto mb-4 text-left">
          <Link
            href="/psikolog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-purple-200 hover:text-white transition-colors"
          >
            ← Kembali ke Daftar Psikolog
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-wide drop-shadow-sm">
          Psikolog kami
        </h1>
      </div>

      {/* 2. Main Content Container (Full-width fluid di Web Desktop, Adaptif & Lega) */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 mt-10 sm:mt-14 space-y-10 sm:space-y-12">
        
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
              
              <p className="text-gray-700 text-sm sm:text-base font-normal">
                Jumlah sesi terlaksana : <span className="font-semibold text-gray-900">{psikolog.jumlah_sesi}+ Sesi</span>
              </p>

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
            PROFIL PSIKOLOG
          </h3>
          <div className="space-y-4 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed max-w-5xl">
            {psikolog.profilLengkap && psikolog.profilLengkap.length > 0 ? (
              psikolog.profilLengkap.map((paragraf, idx) => (
                <p key={idx}>{paragraf}</p>
              ))
            ) : (
              <p>{psikolog.bio || 'Deskripsi profil belum dicantumkan.'}</p>
            )}
          </div>

          {/* Pendidikan */}
          {psikolog.pendidikan && psikolog.pendidikan.length > 0 && (
            <div className="pt-2">
              <p className="text-sm sm:text-base text-gray-600 font-semibold">
                Pendidikan / Institusi: <span className="font-normal text-gray-800">{psikolog.pendidikan.join(', ')}</span>
              </p>
            </div>
          )}
        </section>

        {/* 4. KEAHLIAN PSIKOLOG (Area of Expertise) */}
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
            KEAHLIAN PSIKOLOG
          </h3>
          <ul className="space-y-3 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed max-w-5xl">
            {psikolog.keahlian && psikolog.keahlian.length > 0 ? (
              psikolog.keahlian.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-gray-900 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">Informasi keahlian belum tersedia.</li>
            )}
          </ul>
        </section>

        {/* 5. JADWAL ASSOCIATE / PRAKTEK */}
        {(psikolog.jadwalAssociate || psikolog.jadwalTersedia) && (
          <section className="space-y-3 pt-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
              JADWAL PRAKTEK
            </h3>
            <div className="flex flex-wrap gap-3.5">
              {(psikolog.jadwalAssociate || psikolog.jadwalTersedia?.map(j => ({ tipe: j.tipe === 'online' ? 'Online' : 'Offline', waktu: j.waktu })))?.map((jadwal, idx) => (
                <div 
                  key={idx}
                  className="bg-[#FAF5FD] border border-purple-200/80 px-5 py-2.5 rounded-2xl text-xs sm:text-sm md:text-base font-medium text-gray-800"
                >
                  <span className="font-semibold text-[#561269]">{jadwal.tipe}:</span> {jadwal.waktu}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. TESTIMONI */}
        {psikolog.testimoni && psikolog.testimoni.length > 0 && (
          <section className="space-y-4 pt-2 pb-6">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#561269] uppercase tracking-wider">
              TESTIMONI
            </h3>
            <div className="space-y-4 max-w-5xl">
              {psikolog.testimoni.map((testi, idx) => (
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
              href={`/booking?psikologId=${psikolog.id}` as any}
              className="inline-block bg-[#F8F3FA] hover:bg-white text-[#561269] font-bold text-base sm:text-lg md:text-xl px-10 sm:px-14 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg border border-[#D9C2E3] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Daftar Sesi
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}