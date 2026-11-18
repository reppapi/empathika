/**
 * Komponen Client Dashboard Web Psikolog untuk Review & Telaah Asesmen Psikotes Klinis.
 * Fitur:
 * - Ringkasan kartu statistik (Total Asesmen, Menunggu Review, Selesai Diterbitkan).
 * - Filter Tab (Semua, Menunggu Review, Selesai Diterbitkan).
 * - Pencarian peserta / paket / kode tiket.
 * - Tabel antrean asesmen interaktif dengan badge status informatif.
 * - Modal tinjau hasil otomatis, profil validitas MCMI-IV, dan form input catatan klinis.
 */
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  User,
  Phone,
  Calendar,
  FileText,
  Filter,
  Sparkles,
  Loader2,
} from "lucide-react";
import { psikotesService, type ReviewPsikotesItem, type ReviewPsikotesListResponse } from "@/services/psikotes.service";
import { calculateReviewSla, REVIEW_MAX_DAYS } from "../../utils/reviewSla";
import ModalReviewPsikotes from "./ModalReviewPsikotes";

export default function PsikologReviewAsesmenClient() {
  const [data, setData] = useState<ReviewPsikotesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter & Search
  const [activeTab, setActiveTab] = useState<"ALL" | "MENUNGGU_REVIEW" | "SELESAI">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedItem, setSelectedItem] = useState<ReviewPsikotesItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await psikotesService.getReviewList({
        status: activeTab,
        search: searchQuery.trim() || undefined,
      });
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setData({
          summary: { total: 0, menunggu_review: 0, selesai_review: 0 },
          items: [],
        });
      }
    } catch (err: any) {
      console.error("Gagal mengambil data review psikotes:", err);
      setErrorMessage(
        err?.response?.data?.message || err.message || "Gagal memuat antrean asesmen psikotes."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler saat psikolog berhasil menyimpan telaah
  const handleReviewSuccess = (updatedItem: ReviewPsikotesItem) => {
    setData((prev) => {
      if (!prev) return prev;
      const newItems = prev.items.map((it) => (it.id === updatedItem.id ? updatedItem : it));
      const menungguCount = newItems.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW").length;
      const selesaiCount = newItems.filter((i) => i.status_pengerjaan === "SELESAI").length;

      return {
        ...prev,
        summary: {
          total: prev.summary.total,
          menunggu_review: menungguCount,
          selesai_review: selesaiCount,
        },
        items: newItems,
      };
    });

    setToastMessage(`Telaah klinis untuk ${updatedItem.nama_peserta} berhasil diverifikasi dan laporan resmi telah diterbitkan.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    let items = data.items;

    if (activeTab === "MENUNGGU_REVIEW") {
      items = items.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW");
    } else if (activeTab === "SELESAI") {
      items = items.filter((i) => i.status_pengerjaan === "SELESAI");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.nama_peserta?.toLowerCase().includes(q) ||
          i.nama_paket?.toLowerCase().includes(q) ||
          i.kode_akses?.toLowerCase().includes(q) ||
          i.no_hp?.includes(q)
      );
    }

    return items;
  }, [data?.items, activeTab, searchQuery]);

  const summary = data?.summary || {
    total: 0,
    menunggu_review: 0,
    selesai_review: 0,
  };

  const slaStats = useMemo(() => {
    if (!data?.items) return { overdueCount: 0, urgentCount: 0 };
    const menunggu = data.items.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW");
    let overdueCount = 0;
    let urgentCount = 0;
    for (const item of menunggu) {
      const sla = calculateReviewSla(item.tanggal_pengerjaan);
      if (sla.isOverdue) overdueCount++;
      else if (sla.isUrgent) urgentCount++;
    }
    return { overdueCount, urgentCount };
  }, [data?.items]);

  return (
    <div className="space-y-6 sm:space-y-8 font-poppins pb-12">
      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-emerald-700 text-white p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-200" />
          <div className="flex-1 text-xs">
            <p className="font-bold">Laporan Berhasil Diterbitkan</p>
            <p className="mt-0.5 text-emerald-100">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#561269] text-xs font-bold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Portal Profesional Psikolog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Review Asesmen Psikotes
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Tinjau hasil pengerjaan asesmen klinis (MCMI-IV & alat ukur lainnya), telaah spektrum
            kepribadian, berikan catatan dinamika psikologis, dan terbitkan laporan terverifikasi resmi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData(true)}
          disabled={isRefreshing || isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-purple-200 shadow-sm transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-700" : ""}`} />
          <span>{isRefreshing ? "Menyinkronkan..." : "Perbarui Data"}</span>
        </button>
      </div>

      {/* Kartu Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Antrean */}
        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Asesmen Klinis
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {isLoading ? "..." : summary.total}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Data aktif dalam 90 hari
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#561269] flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Menunggu Review (Highlight) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 to-amber-50/40 border border-amber-200/80 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Menunggu Telaah
              </p>
              {summary.menunggu_review > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1">
              {isLoading ? "..." : summary.menunggu_review}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-amber-900/90 font-bold bg-amber-200/60 px-2 py-0.5 rounded-md">
                SLA: Maks. {REVIEW_MAX_DAYS} Hari
              </span>
              {slaStats.overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {slaStats.overdueCount} Lewat Batas
                </span>
              )}
              {slaStats.urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 font-bold">
                  {slaStats.urgentCount} Segera
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center relative z-10">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Selesai Diterbitkan */}
        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Laporan Selesai Terbit
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {isLoading ? "..." : summary.selesai_review}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Terverifikasi resmi
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Kontrol Filter Tabs & Search */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua ({summary.total})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("MENUNGGU_REVIEW")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "MENUNGGU_REVIEW"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-amber-800 hover:bg-amber-100/50"
              }`}
            >
              {summary.menunggu_review > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              Menunggu Review ({summary.menunggu_review})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SELESAI")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "SELESAI"
                  ? "bg-[#561269] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Selesai Diterbitkan ({summary.selesai_review})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, tiket, atau paket..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/20 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Daftar Asesmen */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {errorMessage && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8FB] text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-4 px-6">Identitas Peserta</th>
                <th className="py-4 px-6">Paket Asesmen</th>
                <th className="py-4 px-6">Waktu &amp; Batas Review (Maks 3 Hari)</th>
                <th className="py-4 px-6">Status Laporan</th>
                <th className="py-4 px-6">Psikolog Pemeriksa</th>
                <th className="py-4 px-6 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#561269] mb-2" />
                    <span>Memuat daftar asesmen klinis...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-gray-800 text-sm">Tidak Ada Antrean</p>
                      <p className="text-gray-400 text-xs">
                        {searchQuery
                          ? `Tidak ditemukan asesmen dengan kata kunci "${searchQuery}".`
                          : activeTab === "MENUNGGU_REVIEW"
                          ? "Hebat! Semua asesmen klinis saat ini sudah ditelaah dan diterbitkan."
                          : "Belum ada riwayat pengerjaan asesmen klinis pada kategori ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isMenunggu = item.status_pengerjaan === "MENUNGGU_REVIEW";
                  const isSelesai = item.status_pengerjaan === "SELESAI";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/20 transition-colors group"
                    >
                      {/* Identitas Peserta */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 text-[#561269] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {item.nama_peserta.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-[#561269] transition-colors">
                              {item.nama_peserta}
                            </p>
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                              {item.usia ? <span>{item.usia} Th</span> : null}
                              {item.jenis_kelamin ? <span>• {item.jenis_kelamin}</span> : null}
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {item.no_hp}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Paket Asesmen & Tiket */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900 line-clamp-1 max-w-xs">
                          {item.nama_paket}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            {item.kode_akses || "TIKET-AUTO"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {item.jenis_akses}
                          </span>
                        </div>
                      </td>

                      {/* Waktu Pengerjaan & Batas SLA 3 Hari */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {(() => {
                          const sla = calculateReviewSla(item.tanggal_pengerjaan);
                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-gray-700">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                  {new Date(item.tanggal_pengerjaan).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(item.tanggal_pengerjaan).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  WIB
                                </span>
                              </div>

                              {isMenunggu ? (
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${sla.badgeClass}`}
                                    title={`Deadline SLA: ${sla.deadlineFormatted}`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    {sla.badgeLabel}
                                  </span>
                                  <span className="text-[10px] text-gray-400" title={`Deadline: ${sla.deadlineFormatted}`}>
                                    Batas: {sla.deadlineFormatted.split(",")[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Tepat Waktu (Selesai)
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status Laporan */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isMenunggu ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Menunggu Review
                          </span>
                        ) : isSelesai ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Selesai Diterbitkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                            {item.status_pengerjaan}
                          </span>
                        )}
                      </td>

                      {/* Psikolog Pemeriksa */}
                      <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                        {item.psikolog?.nama ? (
                          <div>
                            <p className="font-semibold text-gray-900">{item.psikolog.nama}</p>
                            {item.tanggal_review && (
                              <p className="text-[10px] text-gray-400">
                                Ditelaah:{" "}
                                {new Date(item.tanggal_review).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">
                            Belum ditentukan
                          </span>
                        )}
                      </td>

                      {/* Tindakan */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {isMenunggu ? (
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#561269] hover:bg-[#430c52] text-white text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              Tinjau & Nilai
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 hover:border-purple-300 hover:bg-purple-50/50 text-gray-700 text-xs font-semibold transition-all"
                            >
                              <FileText className="w-3.5 h-3.5 text-purple-700" />
                              Lihat / Edit Catatan
                            </button>
                          )}

                          {/* Tombol Cepat Buka Halaman Hasil Klien */}
                          {item.id_paket && (
                            <Link
                              href={`/psikotes/${item.id_paket}/hasil?bookingId=${item.id}` as any}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                              title="Lihat Laporan Lengkap Pasien di Tab Baru"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Review Psikotes */}
      {selectedItem && (
        <ModalReviewPsikotes
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

