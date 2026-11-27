import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function SectionEligibility() {
  return (
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
  );
}
