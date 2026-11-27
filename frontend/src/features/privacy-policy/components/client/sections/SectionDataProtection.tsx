import React from "react";
import { Lock, UserCheck, ShieldCheck, AlertCircle } from "lucide-react";

export default function SectionDataProtection() {
  return (
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
  );
}
