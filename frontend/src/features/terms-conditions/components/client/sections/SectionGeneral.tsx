import React from "react";
import { HeartHandshake, AlertCircle } from "lucide-react";
import { SectionGeneralProps } from "../../../types/terms.types";

export default function SectionGeneral({ brandName }: SectionGeneralProps) {
  return (
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
  );
}
