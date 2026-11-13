/** Modal detail instrumen psikotes (varian paket, jumlah soal, interpretasi, dan toggle status). */
import React from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  Users,
  FileText,
  Scale,
  CheckCircle2,
} from "lucide-react";
import type { JudulPsikotesItem, PaketDetailItem } from "../../types/adminPsikotes";
import { getInstrumentCode } from "../../utils/instrumentDetector";

export interface ModalDetailPaketProps {
  judul: JudulPsikotesItem | null;
  onClose: () => void;
  onToggleStatus: (paket: PaketDetailItem) => void;
}

/**
 * Helper informasi instrumen berdasarkan nama alat ukur
 */
function getInstrumentMetadata(judul: string) {
  const code = getInstrumentCode({ judul });
  switch (code) {
    case "CATS":
      return {
        alatUkur: "CATS (Sachser et al., 2017)",
        targetUsia: "Anak & Remaja (7–17 Th)",
        tipeHasil: "4 Klaster PTSD & PTE (Cut-off ≥ 21)",
      };
    case "CDI":
      return {
        alatUkur: "CDI (Maria Kovacs, 1992)",
        targetUsia: "Anak & Remaja (7–19 Th)",
        tipeHasil: "5 Dimensi Klinis (Cut-off ≥ 19)",
      };
    case "RCMAS":
      return {
        alatUkur: "RCMAS (Reynolds & Richmond, 1978)",
        targetUsia: "Anak & Remaja (6–19 Th)",
        tipeHasil: "Skor Otomatis (Cut-off ≥ 19 & Lie)",
      };
    case "PHQ":
      return {
        alatUkur: "PHQ-9 (Kroenke & Spitzer, 2001)",
        targetUsia: "18 tahun ke atas",
        tipeHasil: "Skor Otomatis (9 Kriteria DSM-5)",
      };
    case "GAD":
      return {
        alatUkur: "GAD-7 (Spitzer et al., 2006)",
        targetUsia: "18 tahun ke atas",
        tipeHasil: "Skor Otomatis (Ambang Cut-off)",
      };
    case "DASS":
      return {
        alatUkur: "DASS-42 (Lovibond & Lovibond, 1995)",
        targetUsia: "Remaja & Dewasa (≥ 15 Th)",
        tipeHasil: "3 Subskala (Depresi, Cemas, Stres)",
      };
    case "IGDS":
      return {
        alatUkur: "IGDS9-SF (Pontes & Griffiths, 2015)",
        targetUsia: "Gamer (≥ 11 Th)",
        tipeHasil: "9 Kriteria DSM-5 IGD",
      };
    case "PBQ":
      return {
        alatUkur: "PBQ (Beck, 126 Butir, 9 Skala)",
        targetUsia: "Dewasa (≥ 18 Th)",
        tipeHasil: "Profil Skor Mentah 9 Skala (0–56)",
      };
    default: {
      const j = (judul || "").toLowerCase();
      if (j.includes("mcmi")) {
        return {
          alatUkur: "MCMI-IV (Millon Clinical Multiaxial)",
          targetUsia: "Dewasa (≥ 18 Th)",
          tipeHasil: "Telaah Psikolog (SLA Maks. 3 Hari)",
        };
      }
      return {
        alatUkur: "Instrumen Psikometri Baku",
        targetUsia: "Remaja & Dewasa",
        tipeHasil: "Penilaian Standar Empathika",
      };
    }
  }
}

export default function ModalDetailPaket({
  judul,
  onClose,
  onToggleStatus,
}: ModalDetailPaketProps) {
  if (!judul) return null;

  const meta = getInstrumentMetadata(judul.judul);
  const paketList = judul.paketList || [];
  const jumlahSoal = paketList[0]?.jumlahSoal || 0;
  const interpretasiList = paketList[0]?.interpretasiList || [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col font-poppins border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ── Modal Header ── */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-sm flex items-center justify-center">
              <img
                src={judul.image}
                alt={judul.judul}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug truncate">
                  {judul.judul}
                </h3>
                <span className="text-[11px] font-bold text-[#561269] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100/80 shrink-0">
                  {judul.kategori}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                {meta.alatUkur}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* 1. Spesifikasi Teknis (Unified Minimalist Bar dengan Aksen Ikon) */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/70 flex items-center justify-center text-[#561269] shrink-0 shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Sasaran</span>
                <span className="font-bold text-gray-900 text-xs block truncate" title={meta.targetUsia}>
                  {meta.targetUsia}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/70 flex items-center justify-center text-[#561269] shrink-0 shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Instrumen</span>
                <span className="font-bold text-gray-900 text-xs block truncate">
                  {jumlahSoal} Butir Soal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/70 flex items-center justify-center text-[#561269] shrink-0 shadow-sm">
                <Scale className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Metode Skor</span>
                <span className="font-bold text-gray-900 text-xs block truncate" title={meta.tipeHasil}>
                  {meta.tipeHasil.split("(")[0].trim()}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Deskripsi Instrumen */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Tentang Instrumen
            </span>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
              {judul.deskripsi}
            </p>
          </div>

          {/* 3. Status Akses & Publikasi Paket (Hanya tampilkan paket yang ada) */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Status Akses &amp; Publikasi
            </span>

            <div className="space-y-3">
              {paketList.map((paket) => {
                const isGratis = paket.jenisAkses === "Gratis";
                const isAktif = paket.status === "Aktif";

                return (
                  <div
                    key={paket.id}
                    className={`p-4 sm:p-5 rounded-2xl transition-all border ${
                      isGratis
                        ? "bg-gradient-to-r from-emerald-50/50 via-teal-50/20 to-white border-emerald-200/70"
                        : "bg-gradient-to-r from-purple-50/50 via-pink-50/20 to-white border-purple-200/70"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                              isGratis
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-[#561269]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isGratis ? "bg-emerald-600" : "bg-[#561269]"
                              }`}
                            />
                            {isGratis ? "Paket Gratis" : "Paket Berbayar Resmi"}
                          </span>

                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                              isAktif
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {isAktif ? "● Dipublikasi" : "○ Draf (Nonaktif)"}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className={`text-base sm:text-lg ${isGratis ? "font-semibold text-gray-400" : "font-extrabold text-gray-900"}`}>
                            {isGratis ? "-" : paket.harga}
                          </span>
                          {!isGratis && (
                            <span className="text-xs text-gray-400 font-medium">
                              per peserta
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>
                            {isGratis
                              ? "Akses skrining mandiri instan via website tanpa biaya pendaftaran."
                              : "Termasuk berkas laporan klinis resmi PDF & verifikasi psikolog."}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(paket)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0 ${
                          isAktif
                            ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                            : "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 shadow-xs"
                        }`}
                      >
                        {isAktif ? "Jadikan Draf" : "Publikasikan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Patokan Skala Penilaian (Tabel Rubrik Minimalis Rapi) */}
          {interpretasiList.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Patokan Skala Penilaian ({interpretasiList.length} Kategori)
              </span>

              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden bg-white">
                {interpretasiList.map((inter, idx) => {
                  const getCategoryBadgeClass = (index: number) => {
                    if (index === 0) return "bg-emerald-50 text-emerald-700 border-emerald-100";
                    if (index === 1) return "bg-blue-50 text-blue-700 border-blue-100";
                    if (index === 2) return "bg-amber-50 text-amber-700 border-amber-100";
                    return "bg-rose-50 text-rose-700 border-rose-100";
                  };

                  return (
                    <div
                      key={inter.id || idx}
                      className="p-3.5 sm:px-4 sm:py-3 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            {inter.judul}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                              idx
                            )}`}
                          >
                            {inter.kategori}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                          {inter.deskripsi}
                        </p>
                      </div>

                      <div className="shrink-0 text-right pt-0.5">
                        <span className="font-mono font-bold text-xs bg-purple-50 text-[#561269] px-2.5 py-1 rounded-lg border border-purple-100/70 inline-block">
                          Skor {inter.min} – {inter.max}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/40 shrink-0 flex-wrap">
          <a
            href={paketList[0]?.id ? `/psikotes/${paketList[0].id}` : "/psikotes"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#561269] hover:text-[#763E8B] transition-colors group"
          >
            <span>Lihat Halaman Klien</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/psikotes/${paketList[0]?.id || judul.id}`}
              className="px-4 py-2 text-xs font-bold text-white bg-[#561269] hover:bg-[#763E8B] rounded-xl transition shadow-xs cursor-pointer"
            >
              Halaman Detail Lengkap →
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
