import React from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function SectionPayment() {
  return (
    <article
      id="pembayaran-transaksi"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          4
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Tarif & Ketentuan Pembayaran Layanan
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Sistem pembayaran penuh resmi melalui platform dan penagihan biaya tambahan.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
        {/* Kartu Khusus Pembayaran Penuh Melalui Sistem */}
        <div className="p-5 sm:p-6 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-gray-900">
              <CreditCard className="w-5 h-5 text-[#561269]" />
              <span>1. Pembayaran Penuh Melalui Sistem Platform</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EAB308] text-gray-950 font-extrabold text-xs shadow-2xs shrink-0">
              Pembayaran Penuh
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Sebagai persyaratan resmi konfirmasi pendaftaran sesi konseling maupun asesmen di <strong>Empathika</strong>, klien melakukan pembayaran biaya layanan secara penuh / full payment langsung melalui sistem pembayaran resmi yang terintegrasi di platform website:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-purple-200/60 space-y-1">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                Metode Pembayaran Resmi Terintegrasi
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Transaksi diproses otomatis melalui saluran pembayaran digital resmi di sistem reservasi (seperti QRIS, Virtual Account bank, dan e-wallet resmi platform).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-purple-200/60 space-y-1">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                Otomatis Tanpa Transfer Rekening Pribadi
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pembayaran diverifikasi secara otomatis oleh sistem tanpa perlu transfer manual ke nomor rekening pribadi, sehingga jadwal dan slot psikolog langsung terkonfirmasi aman.
              </p>
            </div>
          </div>
        </div>

        {/* Sub Ketentuan Penambahan Waktu & Invoice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <CheckCircle2 className="w-4 h-4 text-[#561269]" />
              <span>2. Penambahan Waktu Sesi (*Overtime*)</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Apabila terjadi perpanjangan durasi waktu konseling atas kesepakatan bersama antara klien dan tenaga ahli, biaya tambahan akan dikenakan dan ditagihkan segera setelah sesi berakhir.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <CheckCircle2 className="w-4 h-4 text-[#561269]" />
              <span>3. Bukti Transaksi & Invoice Elektronik</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Invoice dan bukti pembayaran resmi diterbitkan secara elektronik oleh sistem platform setelah transaksi berhasil diverifikasi dan dapat diakses melalui portal akun atau konfirmasi admin.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
