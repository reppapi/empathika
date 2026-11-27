import React from "react";
import { Mail, Phone, Globe, ExternalLink, Check, Copy, Clock } from "lucide-react";
import { SectionContactInfoProps } from "../../../types/privacy.types";

export default function SectionContactInfo({
  email,
  waNumber,
  displayPhone,
  copiedContact,
  copyToClipboard,
}: SectionContactInfoProps) {
  return (
    <article
      id="hubungi-kami"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          7
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Hubungi Kami & Saluran Bantuan
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Kanal komunikasi resmi untuk berdiskusi seputar privasi dan perlindungan data Anda.
          </p>
        </div>
      </div>

      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
        Apabila Anda memiliki pertanyaan, klarifikasi, masukan, maupun kendala seputar Kebijakan Privasi ini, silakan hubungi tim kami melalui saluran resmi berikut:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Email Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-300 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Surel Resmi</span>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5 truncate">
                {email}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Respons resmi dalam 1x24 jam kerja.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-purple-100">
            <a
              href={`mailto:${email}`}
              className="flex-1 text-center py-2 px-3 rounded-lg bg-[#561269] text-white text-xs font-semibold hover:bg-[#430e52] transition-colors"
            >
              Kirim Surel
            </a>
            <button
              onClick={() => copyToClipboard(email, "email")}
              title="Salin Email"
              className="p-2 rounded-lg bg-white border border-purple-200 text-gray-600 hover:text-[#561269] hover:bg-purple-50 transition-colors"
            >
              {copiedContact === "email" ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">WhatsApp Resmi</span>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5 truncate">
                {displayPhone}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Chat langsung bersama tim konseling & admin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-100">
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              Chat WhatsApp
            </a>
            <button
              onClick={() => copyToClipboard(displayPhone, "wa")}
              title="Salin Nomor WhatsApp"
              className="p-2 rounded-lg bg-white border border-emerald-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              {copiedContact === "wa" ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Website Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:border-blue-300 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Situs Web Resmi</span>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5 truncate">
                https://empathika.id
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Jelajahi informasi psikolog & asesmen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-blue-100">
            <a
              href="https://empathika.id"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>Buka Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => copyToClipboard("https://empathika.id", "web")}
              title="Salin Tautan Website"
              className="p-2 rounded-lg bg-white border border-blue-200 text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {copiedContact === "web" ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Operating hours footer box */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 text-xs sm:text-sm text-gray-600">
        <Clock className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          <strong>Jam Pelayanan Pengaduan & Layanan Informasi:</strong> Senin – Sabtu, pukul 08.00 – 20.00 WIB. Pertanyaan di luar jam operasional akan ditindaklanjuti pada hari kerja berikutnya.
        </span>
      </div>
    </article>
  );
}
