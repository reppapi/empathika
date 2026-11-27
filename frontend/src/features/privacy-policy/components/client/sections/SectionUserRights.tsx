import React from "react";
import { Eye, FileEdit, Trash2, SlidersHorizontal, Mail } from "lucide-react";
import { SectionUserRightsProps } from "../../../types/privacy.types";

export default function SectionUserRights({ email }: SectionUserRightsProps) {
  return (
    <article
      id="hak-pengguna"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          5
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Hak dan Kendali Anda atas Data Pribadi
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Kekuasaan penuh yang Anda miliki sebagai pemilik data pribadi sah.
          </p>
        </div>
      </div>

      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
        Kami menghormati sepenuhnya hak-hak Anda atas privasi data sebagaimana diatur dalam ketentuan perundang-undangan yang berlaku. Anda berhak untuk:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Eye className="w-4 h-4 text-[#561269]" />
            <span>1. Hak Mengakses Data</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Mengetahui dan meminta salinan ikhtisar data pribadi Anda yang tersimpan di dalam sistem operasional kami.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <FileEdit className="w-4 h-4 text-[#561269]" />
            <span>2. Hak Memperbarui / Koreksi</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Melakukan perbaikan dan pemutakhiran apabila terdapat data profil atau kontak Anda yang keliru, kurang lengkap, atau berubah.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>3. Hak Meminta Penghapusan</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Meminta penghapusan data pribadi Anda dari sistem kami, sejauh tidak berbenturan dengan ketentuan retensi hukum atau arsip rekam medis psikologis resmi.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>4. Hak Menolak Pengolahan</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Menolak atau membatasi pengolahan data Anda untuk kepentingan tertentu di luar keperluan utama pelaksanaan layanan konseling.
          </p>
        </div>
      </div>

      {/* Callout box to request */}
      <div className="p-4 sm:p-5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-900">
            Ingin Mengajukan Permohonan Terkait Data Anda?
          </h4>
          <p className="text-xs text-gray-600">
            Cukup kirimkan surel resmi dengan menyertakan nama dan alamat email terdaftar Anda ke:
          </p>
        </div>
        <a
          href={`mailto:${email}?subject=Permohonan%20Hak%20Data%20Pribadi`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#561269] text-white text-xs sm:text-sm font-semibold hover:bg-[#430e52] transition-colors shrink-0 shadow-xs"
        >
          <Mail className="w-4 h-4" />
          <span>Kirim Permohonan ke {email}</span>
        </a>
      </div>
    </article>
  );
}
