import React from "react";
import { FileText, Clock, Sparkles, Lock } from "lucide-react";

export default function SectionInformationUsage() {
  return (
    <article
      id="penggunaan-informasi"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          2
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Penggunaan & Tujuan Pengolahan Data
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Bagaimana informasi yang terkumpul dimanfaatkan secara bertanggung jawab.
          </p>
        </div>
      </div>

      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
        Setiap data yang Anda bagikan dimanfaatkan semata-mata untuk menjamin kelancaran, keamanan, dan ketepatan layanan yang Anda terima. Secara rinci, data digunakan untuk:
      </p>

      <div className="space-y-3.5">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <strong className="text-gray-900 block font-semibold mb-0.5">
              Memproses Pemesanan Konsultasi & Event
            </strong>
            <span className="text-gray-600 leading-relaxed">
              Memvalidasi reservasi jadwal konseling, asesmen minat bakat/psikotes, pendaftaran workshop, seminar, maupun program kemitraan resmi.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <strong className="text-gray-900 block font-semibold mb-0.5">
              Pengiriman Notifikasi & Pengingat Sesi
            </strong>
            <span className="text-gray-600 leading-relaxed">
              Mengirimkan rincian konfirmasi jadwal, tautan ruang temu video (Zoom), faktur pembayaran, serta pengingat janji temu berkala melalui WhatsApp resmi atau email.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <strong className="text-gray-900 block font-semibold mb-0.5">
              Peningkatan Kualitas Layanan & Pengalaman Pengguna
            </strong>
            <span className="text-gray-600 leading-relaxed">
              Mengevaluasi kenyamanan platform, kecepatan sistem, serta mengolah umpan balik klien guna terus menyempurnakan fitur-fitur pendampingan yang kami sediakan.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-[#561269] flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <strong className="text-gray-900 block font-semibold mb-0.5">
              Kepentingan Tata Kelola Administratif & Operasional Internal
            </strong>
            <span className="text-gray-600 leading-relaxed">
              Mendukung pembukuan transaksi, audit sistem, pengelolaan akun terintegrasi, pemeliharaan keamanan server, serta pencegahan indikasi penyalahgunaan.
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
