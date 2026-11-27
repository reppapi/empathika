import React from "react";
import { Scale } from "lucide-react";
import { TermsIntroCardProps } from "../../types/terms.types";

export default function TermsIntroCard({ brandName }: TermsIntroCardProps) {
  return (
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
          Dengan mengakses situs web, mendaftarkan akun, atau melakukan reservasi sesi konsultasi dan asesmen di{" "}
          <strong className="text-gray-900 font-semibold">{brandName}</strong>, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum dalam dokumen Syarat & Ketentuan ini.
        </p>
        <p>
          Ketentuan ini berlaku bagi seluruh pengguna individu, orang tua/wali klien anak, mitra biro psikologi, serta peserta event atau asesmen yang diselenggarakan melalui sistem Empathika.
        </p>
      </div>
    </div>
  );
}
