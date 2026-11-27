import React from "react";
import { HeartHandshake } from "lucide-react";
import { PrivacyIntroCardProps } from "../../types/privacy.types";

export default function PrivacyIntroCard({ brandName }: PrivacyIntroCardProps) {
  return (
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
  );
}
