/** Komponen tampilan kartu analisis & scorecard diagnostik mandiri (DASS-42, PBQ, MCMI, dsb). */
"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  ShieldCheck,
  Compass,
  HeartHandshake,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import type { DASSEvaluationResult } from "@/features/psikotes/utils/dassEvaluation";

export interface HasilAnalisisScorecardViewProps {
  displayTestName: string;
  peserta: {
    nama?: string;
    bookingId?: string | null;
    noHp?: string | null;
    usia?: string | number | null;
    jenisKelamin?: string | null;
    kategori?: string | null;
    tanggal?: string;
  };
  dynamicResult: {
    prefix?: string | null;
    value: string;
  };
  isDASS: boolean;
  isMCMI: boolean;
  dassEvaluation: DASSEvaluationResult | null;
  pbqProfile: any;
  mcmiResult: any;
  berbayarDetail: {
    deskripsi: string;
    kekuatanUtama: string[];
    blindspots: string[];
    lingkunganOptimal: string[];
    saranList: Array<{ title: string; desc: string }>;
    judulKekuatan: string;
    judulBlindspots: string;
    judulLingkungan: string;
  };
  subscales?: Array<{
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    grade: string;
    deskripsi: string;
    colorHex: string;
  }>;
  subscalesTitle?: string;
  subscalesMaxNote?: string;
  isDownloading: boolean;
  onDownloadPdf: () => void;
  getWhatsAppUrl: (msg: string) => string;
}

export function HasilAnalisisScorecardView({
  displayTestName,
  peserta,
  dynamicResult,
  isDASS,
  isMCMI,
  dassEvaluation,
  pbqProfile,
  mcmiResult,
  berbayarDetail,
  subscales,
  subscalesTitle,
  subscalesMaxNote,
  isDownloading,
  onDownloadPdf,
  getWhatsAppUrl,
}: HasilAnalisisScorecardViewProps) {
  return (
    <div className="space-y-6 bg-white p-4 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
      {/* Kop Surat Resmi Empathika khusus Dokumen PDF */}
      <div
        id="laporan-pdf-header"
        style={{ display: "none" }}
        className="pb-4 mb-5 border-b-2 border-[#561269]"
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xl font-black text-[#561269] tracking-tight">EMPATHIKA</div>
            <div className="text-[10px] font-medium text-gray-500 mt-0.5">Pusat Layanan Asesmen &amp; Konsultasi Psikologi Digital</div>
            <div className="text-[9px] text-gray-400 mt-0.5">www.empathika.id • info@empathika.id</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#561269]">
              Laporan Hasil Asesmen Psikotes
            </div>
            <div className="text-sm font-bold text-gray-900 mt-0.5">{displayTestName}</div>
            <div className="text-[9px] font-medium text-gray-500 mt-0.5">
              No. Dokumen: <span className="font-mono font-bold text-gray-800">EMP-PSI-{peserta.bookingId ? String(peserta.bookingId).slice(-6).toUpperCase() : "VERIFIED"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Identitas Peserta Asesmen */}
      <div style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                Identitas Peserta Asesmen
              </h3>
              <p className="text-xs text-gray-500">
                Data resmi peserta pengerjaan asesmen psikotes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#561269] border border-purple-200" title="Sesuai standar validitas klinis asesmen psikologi, laporan ini berlaku 3 bulan sejak tanggal tes">
              <Calendar className="w-3.5 h-3.5" />
              Masa Berlaku: 3 Bulan
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Terverifikasi Resmi
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pdf-grid-4">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Nama Lengkap
            </span>
            <span className="font-extrabold text-sm text-gray-900 block truncate">
              {peserta.nama || "Peserta Asesmen Empathika"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Kontak WhatsApp
            </span>
            <span className="font-bold text-sm text-emerald-700 block truncate">
              {peserta.noHp || "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Profil Peserta
            </span>
            <span className="font-bold text-sm text-gray-800 block truncate">
              {[
                peserta.usia ? `${peserta.usia} Thn` : null,
                peserta.jenisKelamin || null,
                peserta.kategori ? `(${peserta.kategori})` : null,
              ]
                .filter(Boolean)
                .join(" • ") || "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Tanggal Asesmen
            </span>
            <span className="font-bold text-sm text-gray-800 block truncate">
              {peserta.tanggal}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Hasil Utama (Clean & Modern Card) */}
      <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-[#FAF8FB] rounded-xl border border-purple-200/70 p-6 sm:p-8 shadow-xs text-center border-l-4 border-l-[#561269]">
        {dynamicResult.prefix && (
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{dynamicResult.prefix}</p>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#561269] tracking-tight mb-2">
          {dynamicResult.value}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {isDASS && dassEvaluation
            ? dassEvaluation.introText
            : isMCMI
            ? "Laporan resmi evaluasi klinis multiaxial kepribadian. Seluruh telaah dinamika kepribadian, indikator psikologis, dan rekomendasi disusun secara personal oleh Psikolog Empathika."
            : berbayarDetail.deskripsi}
        </p>
      </section>

      {/* 2. Grid Konten: Kolom Kiri (Analisis) & Kolom Kanan (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Analisis Lengkap */}
        <div id="laporan-kolom-kiri" className="lg:col-span-8 space-y-8 print:w-full print:col-span-12">
          
          {/* Profil 3 Dimensi DASS-42 (Depresi, Kecemasan, Stres) */}
          {dassEvaluation && (
            <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#561269]" />
                  Profil 3 Dimensi: Depresi, Kecemasan, &amp; Stres
                </h3>
                <span className="text-xs font-semibold text-gray-400">Maks. 42 / dimensi</span>
              </div>

              <div className="space-y-4">
                {dassEvaluation.subscalesList.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${sub.barColor} shrink-0`} />
                        <span className="font-bold text-sm text-gray-900">{sub.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {sub.score} <span className="text-gray-400 font-normal">/ {sub.maxScore}</span>
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${sub.barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${sub.score > 0 ? Math.max(6, sub.percentage) : 0}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed pt-0.5">
                      {sub.deskripsi}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Profil 9 Skala Kepribadian PBQ */}
          {pbqProfile && (
            <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#561269]" />
                  Profil Skor Mentah 9 Skala Kepribadian (PBQ)
                </h3>
                <span className="text-xs font-semibold text-gray-400">Maks. 56 / skala (tanpa skor total)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {pbqProfile.subscalesList.map((sub: any) => {
                  const score = Number(sub.skor ?? 0);
                  const maxScore = Number(sub.max_skor ?? 56);
                  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                  return (
                    <div key={sub.key} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm text-gray-900 block">{sub.nama}</span>
                          <span className="text-[11px] text-gray-500">Butir {sub.rentangButir}</span>
                        </div>
                        <span className="text-xs font-bold text-[#561269]">
                          {score} <span className="text-gray-400 font-normal">/ {maxScore}</span>
                        </span>
                      </div>

                      <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#561269] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(score > 0 ? 4 : 0, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 leading-relaxed">
                Catatan: Skor ditampilkan sebagai skor mentah per skala (rentang 0–56). Kategori interpretasi dan Z-score normatif belum ditampilkan sambil menunggu acuan resmi.
              </p>
            </section>
          )}

          {/* Laporan Hasil Multiaxial MCMI-IV */}
          {mcmiResult && (
            <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#561269] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    CONFIDENTIAL • FOR PROFESSIONAL USE ONLY
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#561269]" />
                    Millon Clinical Multiaxial Inventory-IV (MCMI-IV)
                  </h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  mcmiResult.validitas?.isValid
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {mcmiResult.validitas?.isValid ? "✓ Hasil Valid" : "⚠ Hasil Tidak Valid"}
                </span>
              </div>

              {/* A. Bagian Validitas */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-gray-900 tracking-wide uppercase flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#561269] text-white text-xs flex items-center justify-center font-bold">A</span>
                  <span>Validitas Asesmen</span>
                </h4>
                <div className={`p-4 rounded-2xl border ${
                  mcmiResult.validitas?.isValid
                    ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                    : "bg-red-50/80 border-red-200 text-red-950"
                }`}>
                  <p className="text-xs sm:text-sm font-bold">
                    {mcmiResult.laporanNaratif?.validitas || (mcmiResult.validitas?.isValid ? "Hasil tes ini akurat dan dapat dipercaya." : "Hasil tes ini tidak akurat dan tidak dapat diinterpretasi.")}
                  </p>
                  {mcmiResult.validitas?.alasanInvalid && mcmiResult.validitas.alasanInvalid.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs list-disc list-inside text-red-800">
                      {mcmiResult.validitas.alasanInvalid.map((alasan: string, idx: number) => (
                        <li key={idx}>{alasan}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Grid Indeks Validitas */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Skala V</span>
                    <span className="text-sm font-extrabold text-gray-800">{mcmiResult.validitas?.skalaV ?? 0}</span>
                    <span className="text-[10px] text-gray-500 block">&le; 1</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Skala W</span>
                    <span className="text-sm font-extrabold text-gray-800">{mcmiResult.validitas?.skalaW ?? 0}</span>
                    <span className="text-[10px] text-gray-500 block">&le; 19</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Skala X (Raw)</span>
                    <span className="text-sm font-extrabold text-gray-800">{mcmiResult.validitas?.skalaXRaw ?? 0}</span>
                    <span className="text-[10px] text-gray-500 block">7–114</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Skala Y (BR)</span>
                    <span className="text-sm font-extrabold text-gray-800">{mcmiResult.validitas?.skalaYBR ?? 0}</span>
                    <span className="text-[10px] text-gray-500 block">&le; 75</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Skala Z (BR)</span>
                    <span className="text-sm font-extrabold text-gray-800">{mcmiResult.validitas?.skalaZBR ?? 0}</span>
                    <span className="text-[10px] text-gray-500 block">&le; 75</span>
                  </div>
                </div>
              </div>

              {/* B. Pola Kepribadian (15 Skala) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-gray-900 tracking-wide uppercase flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#561269] text-white text-xs flex items-center justify-center font-bold">B</span>
                    <span>Pola Kepribadian (15 Spektrum Millon)</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-gray-500">Skor Base Rate (BR 0–115)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {mcmiResult.polaKepribadianList?.map((item: any) => {
                    const br = Number(item.brScore ?? 0);
                    const isGangguan = br >= 85;
                    const isTipe = br >= 75 && br < 85;
                    const isGaya = br >= 60 && br < 75;

                    return (
                      <div
                        key={item.code}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isGangguan
                            ? "bg-rose-50/80 border-rose-200 shadow-2xs"
                            : isTipe
                            ? "bg-amber-50/70 border-amber-200"
                            : isGaya
                            ? "bg-purple-50/60 border-purple-200"
                            : "bg-gray-50/70 border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800">
                              {item.code}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                              {(item.nama || "").replace(/\s*\(Skala\s+[^)]+\)/i, "").trim()}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-extrabold ${
                              isGangguan
                                ? "text-rose-700"
                                : isTipe
                                ? "text-amber-800"
                                : isGaya
                                ? "text-purple-900"
                                : "text-gray-700"
                            }`}>
                              BR {br}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar BR (Cutoff 60, 75 & 85) */}
                        <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden my-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isGangguan
                                ? "bg-rose-600"
                                : isTipe
                                ? "bg-amber-500"
                                : isGaya
                                ? "bg-[#561269]"
                                : "bg-gray-300"
                            }`}
                            style={{ width: `${Math.min(100, Math.round((br / 115) * 100))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>{item.level || "Subklinis"}</span>
                          <span className="font-mono text-[10px]">Raw: {item.rawScore}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Subscales Generik (CATS, CDI, RCMAS, dll.) */}
          {subscales && subscales.length > 0 && !dassEvaluation && !pbqProfile && !mcmiResult && (
            <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#561269]" />
                  {subscalesTitle || "Rincian Dimensi Asesmen"}
                </h3>
                {subscalesMaxNote && (
                  <span className="text-xs font-semibold text-gray-400">{subscalesMaxNote}</span>
                )}
              </div>

              <div className="space-y-3.5">
                {subscales.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-900">{sub.name}</span>
                      <span className="text-xs font-bold text-[#561269]">{sub.grade}</span>
                    </div>
                    {sub.percentage > 0 && (
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#561269] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, sub.percentage)}%` }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-600 leading-relaxed pt-0.5">{sub.deskripsi}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Kartu Potensi & Kekuatan Utama */}
          {berbayarDetail.kekuatanUtama && berbayarDetail.kekuatanUtama.length > 0 && (
            <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{berbayarDetail.judulKekuatan}</h3>
                  <p className="text-xs text-gray-500">Kekuatan yang menjadi modal utama pengembangan diri</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                {berbayarDetail.kekuatanUtama.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#561269] shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Kartu Area yang Perlu Diwaspadai */}
          {berbayarDetail.blindspots && berbayarDetail.blindspots.length > 0 && (
            <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{berbayarDetail.judulBlindspots}</h3>
                  <p className="text-xs text-gray-500">Aspek yang perlu diantisipasi agar tidak menghambat potensi</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                {berbayarDetail.blindspots.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Kartu Saran & Rekomendasi Tindak Lanjut */}
          {berbayarDetail.saranList && berbayarDetail.saranList.length > 0 && !isMCMI && (
            <section style={{ breakInside: "avoid", pageBreakInside: "avoid" }} className="pdf-card bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Panduan &amp; Rekomendasi Tindak Lanjut</h3>
                  <p className="text-xs text-gray-500">Langkah terstruktur untuk optimalisasi potensi diri</p>
                </div>
              </div>
              <div className="space-y-3">
                {berbayarDetail.saranList.map((saran, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                    <span className="text-xs font-bold text-gray-900 block">{saran.title}</span>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{saran.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Kolom Kanan: Sidebar Aksi & Konsultasi */}
        <div id="laporan-sidebar-aksi" className="lg:col-span-4 space-y-6 print:hidden">
          
          {/* Card Download & Cetak Dokumen */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Arsip Laporan</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Unduh dokumen laporan resmi asesmen dalam format PDF untuk keperluan arsip pribadi atau konsultasi.
            </p>
            <button
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className="w-full py-3 rounded-xl bg-[#561269] hover:bg-[#6e1886] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-70"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunduh Dokumen...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen (PDF)</span>
                </>
              )}
            </button>
          </div>

          {/* Card Ajakan Konsultasi */}
          <div className="bg-gradient-to-br from-[#561269] to-[#763E8B] text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EAB308] block">
              Konsultasi Psikolog
            </span>
            <h4 className="text-lg font-bold leading-snug">
              Ingin Membahas Hasil Ini Secara Mendalam?
            </h4>
            <p className="text-xs text-purple-100 leading-relaxed">
              Konsultasikan hasil analisismu bersama psikolog berlisensi Empathika untuk panduan karir dan pengembangan diri yang personal.
            </p>
            <Link href="/konseling" className="block pt-1">
              <button className="w-full py-3 rounded-xl bg-[#EAB308] hover:bg-[#FACC15] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer">
                <Calendar className="w-4 h-4" />
                <span>Jadwalkan Sesi Konsultasi</span>
              </button>
            </Link>
          </div>

        </div>

      </div>

      {/* Footer Resmi Asesor khusus Dokumen PDF */}
      <div
        id="laporan-pdf-footer"
        style={{ display: "none" }}
        className="pt-4 border-t border-dashed border-gray-300 mt-6 bg-white"
      >
        <div className="flex justify-between items-end">
          <div className="text-[9px] text-gray-400 leading-relaxed max-w-xs">
            <strong>Catatan Resmi:</strong> Dokumen ini bersifat rahasia (confidential) dan diterbitkan sebagai hasil asesmen psikometri resmi Empathika.
            <br />
            Verifikasi Dokumen: <span className="font-mono text-gray-600">EMP-PSI-{peserta.bookingId ? String(peserta.bookingId).slice(-6).toUpperCase() : "VERIFIED"}</span>
          </div>
          <div className="text-center w-52">
            <div className="text-[10px] text-gray-600 mb-8">
              Bandung, {peserta.tanggal}
              <br />
              Tim Asesor Asesmen Psikologi,
            </div>
            <div className="text-xs font-extrabold text-gray-900 border-t border-gray-900 pt-1">
              Empathika Psychological Center
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default HasilAnalisisScorecardView;
