import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function SectionInformationCollected() {
  return (
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
            <CheckCircle2 className="w-4 h-4 text-[#561269]" />
            <span>Identitas & Kontak Pribadi</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Mencakup nama lengkap, alamat surel (email) aktif, serta nomor telepon/WhatsApp yang digunakan untuk verifikasi akun, konfirmasi reservasi, dan koordinasi sesi.
          </p>
        </div>

        {/* Item 2 */}
        <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/60 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <CheckCircle2 className="w-4 h-4 text-[#561269]" />
            <span>Data Profil Demografis</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Informasi penunjang seperti kelompok usia, jenis kelamin, domisili, atau latar belakang relevan yang membantu psikolog memahami konteks konsultasi Anda.
          </p>
        </div>

        {/* Item 3 */}
        <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/60 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <CheckCircle2 className="w-4 h-4 text-[#561269]" />
            <span>Data Reservasi & Sesi Konsultasi</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Rincian jadwal janji temu, riwayat pemesanan sesi konseling atau asesmen, pilihan metode (tatap muka di klinik / daring via video call), dan topik umum layanan.
          </p>
        </div>

        {/* Item 4 */}
        <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/60 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <CheckCircle2 className="w-4 h-4 text-[#561269]" />
            <span>Data Teknis & Akses Platform</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Informasi otomatis saat mengakses platform kami, seperti alamat IP, tipe peramban (browser), sistem operasi, serta data penjelajahan melalui <em>cookies</em> untuk menjaga stabilitas sesi login.
          </p>
        </div>
      </div>
    </article>
  );
}
