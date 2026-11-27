import React from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SectionReschedule() {
  return (
    <article
      id="reschedule-pembatalan"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          5
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Kebijakan Penjadwalan Ulang/Reschedule & Pembatalan
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Aturan batas waktu reschedule, ketersediaan situasional, dan ketentuan pembatalan sesi.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
        {/* Aturan Reschedule */}
        <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3">
          <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#561269]" />
            <span>Ketentuan Penjadwalan Ulang/Reschedule</span>
          </h4>
          
          <ul className="space-y-3 text-xs sm:text-sm text-gray-700 pl-1">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
              <span>
                <strong>Batas Waktu Pengajuan:</strong> Penjadwalan ulang/reschedule dapat diajukan <strong>paling lambat H-3 (3 hari sebelum tanggal sesi)</strong> yang telah disepakati.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
              <span>
                <strong>Batas Frekuensi Pengajuan:</strong> Permohonan penjadwalan ulang hanya dapat dilakukan <strong>maksimal dua (2) kali</strong> untuk setiap pendaftaran.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
              <span>
                <strong>Kondisi Situasional Penjadwalan Ulang:</strong> Mengingat penjadwalan ulang/reschedule bersifat mendadak dan situasional, klien menyadari serta menyepakati bahwa adanya kemungkinan pengubahan jadwal yang memerlukan waktu lebih lama, pergantian psikolog pendamping, atau penyesuaian kesepakatan lainnya dari jadwal reservasi yang sebelumnya.
              </span>
            </li>
          </ul>
        </div>

        {/* Aturan Pembatalan & Kebijakan Refund */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                Kebijakan Pembatalan Sesi & Pengembalian Dana (*Refund*)
              </h4>
              <p className="text-xs text-gray-500">
                Skema pengembalian dana berdasarkan waktu pengajuan pembatalan reservasi.
              </p>
            </div>
          </div>

          {/* Skema 3 Tingkat Refund */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Tingkat 1: H-3 Hari ke atas -> 100% */}
            <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold inline-block">
                  Refund 100%
                </span>
                <h5 className="font-bold text-gray-900 text-sm">
                  Pengajuan ≥ H-3 Hari
                </h5>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pembatalan diajukan minimal 3 hari sebelum tanggal sesi berlangsung.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-xs font-semibold text-emerald-700">
                ✓ Seluruh dana dikembalikan penuh (100%)
              </div>
            </div>

            {/* Tingkat 2: Lewat dari H-3 Hari -> Potongan 10% */}
            <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold inline-block">
                  Potongan 10%
                </span>
                <h5 className="font-bold text-gray-900 text-sm">
                  Pengajuan &lt; H-3 Hari
                </h5>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pembatalan diajukan telah melewati batas H-3 hari sebelum tanggal sesi.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-xs font-semibold text-amber-800">
                ⚠ Dikenakan potongan biaya 10% (dana kembali 90%)
              </div>
            </div>

            {/* Tingkat 3: No-Show -> Biaya Hangus */}
            <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold inline-block">
                  Biaya Hangus
                </span>
                <h5 className="font-bold text-gray-900 text-sm">
                  Ketidakhadiran (*No-Show*)
                </h5>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Klien tidak hadir pada jadwal sesi tanpa pemberitahuan sebelumnya.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-xs font-semibold text-rose-700">
                ✕ Biaya sesi yang telah dibayarkan tidak dapat dikembalikan
              </div>
            </div>
          </div>

          {/* Catatan Tambahan Pembatalan Praktisi */}
          <div className="p-3.5 rounded-xl bg-white/80 border border-amber-200/60 text-xs text-gray-600 leading-relaxed">
            <strong>Catatan Kondisi Darurat dari Pihak Praktisi:</strong> Apabila pembatalan terjadi atas alasan operasional mendesak dari psikolog pendamping atau gangguan sistem internal Empathika, klien berhak memilih penjadwalan ulang prioritas tanpa mengurangi kuota *reschedule*, atau memperoleh pengembalian dana (*refund*) penuh 100% tanpa potongan biaya apa pun.
          </div>
        </div>
      </div>
    </article>
  );
}
