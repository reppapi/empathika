/**
 * Modal Telaah & Verifikasi Klinis Asesmen Psikotes oleh Psikolog.
 * Menampilkan:
 * 1. Profil lengkap & status validitas otomatis hasil tes (MCMI-IV & alat ukur lainnya).
 * 2. Visualisasi spektrum kepribadian, sindroma klinis, atau dimensi tes.
 * 3. Form input catatan dinamika kepribadian & rekomendasi intervensi klinis.
 * 4. Verifikasi dan penerbitan laporan resmi secara instan.
 */
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Clock,
  Calendar,
  Send,
  Loader2,
  Stethoscope,
  BarChart3,
  BookOpen,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { psikotesService, type ReviewPsikotesItem } from "@/services/psikotes.service";
import { calculateReviewSla, REVIEW_MAX_DAYS } from "../../utils/reviewSla";

interface ModalReviewPsikotesProps {
  item: ReviewPsikotesItem | null;
  onClose: () => void;
  onSuccess: (updatedItem: ReviewPsikotesItem) => void;
}

export default function ModalReviewPsikotes({
  item,
  onClose,
  onSuccess,
}: ModalReviewPsikotesProps) {
  const [activeTab, setActiveTab] = useState<"profil" | "telaah">("telaah");
  const [catatan, setCatatan] = useState("");
  const [rekomendasi, setRekomendasi] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Full detail dari API jika diperlukan
  const [fullDetail, setFullDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!item) return;

    setCatatan(item.catatan_psikolog || "");
    setRekomendasi(item.rekomendasi_psikolog || "");
    setSubmitError(null);
    setActiveTab(item.status_pengerjaan === "MENUNGGU_REVIEW" ? "telaah" : "profil");

    setIsLoadingDetail(true);
    psikotesService
      .getHasilByBooking(item.id)
      .then((res) => {
        if (res?.data) {
          setFullDetail(res.data);
          if (res.data.hasil?.catatan_psikolog && !item.catatan_psikolog) {
            setCatatan(res.data.hasil.catatan_psikolog);
          }
          if (res.data.hasil?.rekomendasi_psikolog && !item.rekomendasi_psikolog) {
            setRekomendasi(res.data.hasil.rekomendasi_psikolog);
          }
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat detail lengkap asesmen:", err);
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  }, [item]);

  if (!item) return null;

  const detailSkor = fullDetail?.hasil?.detail_skor || item.detail_skor;
  const isMcmi = Boolean(
    detailSkor?.validitas ||
    detailSkor?.polaKepribadianList ||
    item.nama_paket?.toLowerCase().includes("mcmi") ||
    item.nama_paket?.toLowerCase().includes("multiaxial")
  );

  // Draft naratif otomatis dari sistem untuk bantuan psikolog
  const autoDraftCatatan = (() => {
    if (isMcmi && detailSkor?.laporanNaratif) {
      const naratifPola = detailSkor.laporanNaratif.polaKepribadian || "";
      const naratifKlinis = detailSkor.laporanNaratif.klinis || "";
      return [
        "Berdasarkan analisis profil MCMI-IV:",
        naratifPola,
        naratifKlinis ? `\nManifestasi Kondisi Klinis:\n${naratifKlinis}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    if (fullDetail?.hasil?.deskripsi) {
      return fullDetail.hasil.deskripsi;
    }

    return "";
  })();

  const handleApplyAutoDraft = () => {
    if (!autoDraftCatatan) return;
    if (catatan.trim().length > 0) {
      if (!window.confirm("Ganti catatan saat ini dengan draf naratif otomatis dari sistem?")) {
        return;
      }
    }
    setCatatan(autoDraftCatatan);
  };

  const handleApplyAutoRekomendasi = () => {
    const defaultRekomendasi =
      "1. Disarankan untuk menjadwalkan sesi konseling lanjutan atau psikoterapi berorientasi solusi (Solution-Focused) / CBT guna mengeksplorasi faktor pemicu stres.\n" +
      "2. Mengembangkan regulasi emosi adaptif dan teknik relaksasi mandiri secara berkala.\n" +
      "3. Evaluasi berkala setelah 3–6 bulan intervensi untuk melihat perkembangan stabilitas emosional.";
    if (rekomendasi.trim().length > 0) {
      if (!window.confirm("Ganti rekomendasi saat ini dengan saran rekomendasi umum?")) {
        return;
      }
    }
    setRekomendasi(defaultRekomendasi);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatan.trim()) {
      setSubmitError("Catatan dinamika kepribadian psikolog wajib diisi sebelum menerbitkan laporan.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const activePsikologId =
        localStorage.getItem("active_psikolog_id") || sessionStorage.getItem("active_psikolog_id");

      const res = await psikotesService.submitReview(item.id, {
        catatan_psikolog: catatan.trim(),
        rekomendasi_psikolog: rekomendasi.trim() || null,
        id_psikolog: activePsikologId || null,
      });

      const updated: ReviewPsikotesItem = {
        ...item,
        status_pengerjaan: "SELESAI",
        catatan_psikolog: catatan.trim(),
        rekomendasi_psikolog: rekomendasi.trim() || null,
        tanggal_review: new Date().toISOString(),
        psikolog: res.data?.booking?.psikolog
          ? {
              id: res.data.booking.psikolog.id,
              nama: res.data.booking.psikolog.nama_gelar,
            }
          : item.psikolog,
      };

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err.message || "Gagal menyimpan review psikolog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSudahReview = item.status_pengerjaan === "SELESAI";
  const reviewSla = calculateReviewSla(item.tanggal_pengerjaan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden font-poppins text-gray-800">
        {/* Header Modal */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-white flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#561269] text-white">
                <Stethoscope className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  Telaah & Catatan Klinis Psikolog
                </h2>
                <p className="text-xs text-gray-500">
                  {item.nama_paket} • Tiket: <span className="font-mono font-semibold text-purple-900">{item.kode_akses || "—"}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ringkasan Sub-Header: Identitas Peserta & Status */}
        <div className="shrink-0 px-6 py-3 bg-purple-50/40 border-b border-purple-100/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-700">
              <User className="w-4 h-4 text-purple-700" />
              <span className="font-semibold text-gray-900">{item.nama_peserta}</span>
              {item.usia ? <span className="text-gray-500">• {item.usia} Th</span> : null}
              {item.jenis_kelamin ? <span className="text-gray-500">• {item.jenis_kelamin}</span> : null}
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Selesai:{" "}
                {new Date(item.tanggal_pengerjaan).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isSudahReview
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {isSudahReview ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Laporan Terbit
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Menunggu Telaah
                </>
              )}
            </span>

            {!isSudahReview && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${reviewSla.badgeClass}`}
                title={`Target Deadline SLA: ${reviewSla.deadlineFormatted}`}
              >
                <Clock className="w-3.5 h-3.5" />
                {reviewSla.badgeLabel} (SLA Maks. 3 Hari)
              </span>
            )}
          </div>
        </div>

        {/* Navigasi Tab */}
        <div className="shrink-0 px-6 pt-3 border-b border-gray-100 bg-white flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("telaah")}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === "telaah"
                ? "text-[#561269] border-b-2 border-[#561269]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4" />
              Form Telaah & Rekomendasi
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === "profil"
                ? "text-[#561269] border-b-2 border-[#561269]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Profil & Validitas Tes (Sistem)
            </span>
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 [scrollbar-width:thin]">
          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Gagal Menyimpan:</p>
                <p>{submitError}</p>
              </div>
            </div>
          )}

          {activeTab === "telaah" ? (
            /* TAB 1: FORM INPUT TELAAH & REKOMENDASI */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Petunjuk Pengisian & SLA */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">Pedoman Profesional Psikolog</p>
                    <span className="text-[10px] font-bold text-purple-900 bg-purple-200/70 px-2 py-0.5 rounded-md">
                      SLA Telaah: Maks. {REVIEW_MAX_DAYS} Hari
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Sesuai standar operasional Empathika, telaah klinis diselesaikan maksimal <strong>{REVIEW_MAX_DAYS} hari</strong> sejak pengerjaan peserta{" "}
                    (Batas akhir: <strong>{reviewSla.deadlineFormatted}</strong>).
                    Telaah dan rekomendasi klinis ini akan dicantumkan secara resmi pada lembar laporan hasil asesmen peserta
                    lengkap dengan identitas nama Anda sebagai Psikolog Pemeriksa Terverifikasi.
                  </p>
                </div>
              </div>

              {/* Field 1: Catatan Dinamika Kepribadian (Wajib) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    Catatan Dinamika Kepribadian & Gambaran Klinis
                    <span className="text-rose-500">*</span>
                  </label>
                  {autoDraftCatatan && (
                    <button
                      type="button"
                      onClick={handleApplyAutoDraft}
                      className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold px-2.5 py-1 rounded-lg bg-purple-100/70 hover:bg-purple-100 transition-colors"
                      title="Salin narasi otomatis dari sistem sebagai draf awal"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Gunakan Draf Naratif Sistem
                    </button>
                  )}
                </div>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={6}
                  placeholder="Tuliskan uraian analisis klinis kepribadian, kecenderungan afektif, relasi interpersonal, serta mekanisme koping peserta..."
                  className="w-full rounded-2xl border border-gray-300 p-4 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/20 transition-all font-sans leading-relaxed"
                  required
                />
                <p className="text-[11px] text-gray-400">
                  Minimal 5 karakter. Berikan narasi yang informatif dan suportif bagi perkembangan mental peserta.
                </p>
              </div>

              {/* Field 2: Rekomendasi Klinis & Tindak Lanjut */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    Rekomendasi Klinis & Rencana Intervensi / Konseling
                    <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleApplyAutoRekomendasi}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold px-2.5 py-1 rounded-lg bg-purple-100/70 hover:bg-purple-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Contoh Format Rekomendasi
                  </button>
                </div>
                <textarea
                  value={rekomendasi}
                  onChange={(e) => setRekomendasi(e.target.value)}
                  rows={4}
                  placeholder="Rekomendasikan langkah lanjutan, misal: Psikoterapi CBT, latihan regulasi emosi, konseling keluarga, atau evaluasi psikiatri..."
                  className="w-full rounded-2xl border border-gray-300 p-4 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#561269] focus:outline-none focus:ring-2 focus:ring-[#561269]/20 transition-all font-sans leading-relaxed"
                />
              </div>

              {/* Footer Aksi Form */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  {item.psikolog?.nama ? (
                    <span>
                      Pemeriksa: <strong className="text-gray-800">{item.psikolog.nama}</strong>
                    </span>
                  ) : (
                    <span>Akan diverifikasi atas nama akun psikolog yang sedang aktif</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !catatan.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#561269] hover:bg-[#430c52] text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="w-4 h-4" />
                        {isSudahReview ? "Perbarui Telaah Laporan" : "Verifikasi & Terbitkan Laporan"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: PROFIL SKOR & INDEKS VALIDITAS SISTEM */
            <div className="space-y-6">
              {isLoadingDetail && (
                <div className="py-8 flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-700" />
                  <span>Memuat visualisasi profil klinis lengkap...</span>
                </div>
              )}

              {/* Validitas MCMI-IV */}
              {isMcmi && detailSkor?.validitas && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      Indeks Validitas & Keterandalan Profil (MCMI-IV)
                    </h3>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                        detailSkor.validitas.isValid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {detailSkor.validitas.isValid ? "PROFIL VALID" : "PROFIL MERAGUKAN"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {detailSkor.validitas.kesimpulan}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                      <span className="text-[11px] text-gray-400 block">Skala V (Validitas)</span>
                      <strong className="text-gray-900 text-sm">{detailSkor.validitas.skalaV ?? 0}</strong>
                      <span className="text-[10px] text-gray-400 block">(Batas &le; 1)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                      <span className="text-[11px] text-gray-400 block">Skala W (Inkonsistensi)</span>
                      <strong className="text-gray-900 text-sm">{detailSkor.validitas.skalaW ?? 0}</strong>
                      <span className="text-[10px] text-gray-400 block">(Batas &le; 19)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                      <span className="text-[11px] text-gray-400 block">Skala X (Keterbukaan)</span>
                      <strong className="text-gray-900 text-sm">{detailSkor.validitas.skalaX ?? 0}</strong>
                      <span className="text-[10px] text-gray-400 block">(7–114)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                      <span className="text-[11px] text-gray-400 block">Skala Y (Desirability)</span>
                      <strong className="text-gray-900 text-sm">BR {detailSkor.validitas.skalaY_BR ?? 0}</strong>
                      <span className="text-[10px] text-gray-400 block">Pencitraan Baik</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-gray-400 block">Skala Z (Debasement)</span>
                      <strong className="text-gray-900 text-sm">BR {detailSkor.validitas.skalaZ_BR ?? 0}</strong>
                      <span className="text-[10px] text-gray-400 block">Dramatisasi Sakit</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Spektrum Kepribadian Klinis MCMI-IV */}
              {isMcmi && Array.isArray(detailSkor?.polaKepribadianList) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-700" />
                      Spektrum Pola Kepribadian (15 Skala)
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      Ambang: Style (&ge;60), Type (&ge;75), Disorder (&ge;85)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {detailSkor.polaKepribadianList.map((scale: any) => {
                      const br = Number(scale.brScore ?? 0);
                      const isDisorder = br >= 85;
                      const isType = br >= 75 && br < 85;
                      const isStyle = br >= 60 && br < 75;

                      return (
                        <div
                          key={scale.kode}
                          className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                            isDisorder
                              ? "bg-rose-50/70 border-rose-200 text-rose-950"
                              : isType
                              ? "bg-amber-50/70 border-amber-200 text-amber-950"
                              : isStyle
                              ? "bg-purple-50/60 border-purple-200 text-purple-950"
                              : "bg-gray-50/60 border-gray-100 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">
                              {scale.kode}. {scale.nama}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDisorder
                                  ? "bg-rose-600 text-white"
                                  : isType
                                  ? "bg-amber-600 text-white"
                                  : isStyle
                                  ? "bg-purple-700 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              BR {br} • {scale.level}
                            </span>
                          </div>

                          {/* Progress bar BR */}
                          <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isDisorder
                                  ? "bg-rose-600"
                                  : isType
                                  ? "bg-amber-600"
                                  : isStyle
                                  ? "bg-purple-700"
                                  : "bg-gray-400"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, (br / 115) * 100))}%` }}
                            />
                          </div>

                          <p className="text-[11px] text-gray-500 leading-tight">
                            {scale.deskripsi}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sindroma Klinis MCMI-IV */}
              {isMcmi && Array.isArray(detailSkor?.sindromaKlinisList) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-purple-700" />
                      Sindroma Klinis & Gangguan Berat (10 Skala)
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      Ambang: Ringan (&ge;75), Berat (&ge;85)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {detailSkor.sindromaKlinisList.map((scale: any) => {
                      const br = Number(scale.brScore ?? 0);
                      const isSevere = br >= 85;
                      const isMild = br >= 75 && br < 85;

                      return (
                        <div
                          key={scale.kode}
                          className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                            isSevere
                              ? "bg-rose-50/70 border-rose-200 text-rose-950"
                              : isMild
                              ? "bg-amber-50/70 border-amber-200 text-amber-950"
                              : "bg-gray-50/60 border-gray-100 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">
                              {scale.kode}. {scale.nama}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSevere
                                  ? "bg-rose-600 text-white"
                                  : isMild
                                  ? "bg-amber-600 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              BR {br} • {scale.level}
                            </span>
                          </div>

                          <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isSevere ? "bg-rose-600" : isMild ? "bg-amber-600" : "bg-gray-400"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, (br / 115) * 100))}%` }}
                            />
                          </div>

                          <p className="text-[11px] text-gray-500 leading-tight">
                            {scale.deskripsi}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tampilan Alternatif untuk Alat Ukur Lain (DASS, PHQ, dll) */}
              {!isMcmi && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    Hasil Pengerjaan Tes
                  </h3>
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-gray-700 space-y-2">
                    <p className="font-semibold text-gray-900">
                      Total Skor: {fullDetail?.hasil?.total_skor ?? item.total_skor ?? "—"}
                    </p>
                    <p className="leading-relaxed">
                      {fullDetail?.hasil?.deskripsi || "Tidak ada deskripsi skor otomatis."}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("telaah")}
                  className="px-5 py-2.5 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#430c52] transition-all"
                >
                  Lanjut Tulis Telaah & Rekomendasi &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

