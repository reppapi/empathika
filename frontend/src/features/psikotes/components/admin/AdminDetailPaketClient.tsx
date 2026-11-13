/**
 * Komponen Halaman Detail Paket Psikotes Admin.
 * Disesuaikan persis dengan 4 bagian spesifik:
 * 1. Informasi Paket
 * 2. Informasi Alat Ukur
 * 3. Daftar Soal
 * 4. Skoring & Interpretasi
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  ListOrdered,
  Scale,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { psikotesService, PaketPsikotesApiResponse } from "@/services/psikotes.service";

interface Props {
  paketId: string;
}

type TabType = "paket" | "soal" | "skoring_interpretasi";

export default function AdminDetailPaketClient({ paketId }: Props) {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("paket");

  // Data State
  const [paket, setPaket] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab Soal Pagination
  const [currentPageSoal, setCurrentPageSoal] = useState(1);
  const itemsPerPageSoal = 10;

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch detail paket psikotes
  const fetchPaketDetail = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await psikotesService.getById(paketId, { allowDraft: true });
      if (res && res.success && res.data) {
        setPaket(res.data);
      } else {
        setErrorMessage("Data paket psikotes tidak ditemukan di database.");
      }
    } catch (err: any) {
      console.error("Gagal memuat detail paket:", err);
      setErrorMessage(
        err?.response?.data?.message || "Gagal mengambil data paket psikotes dari server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paketId) {
      fetchPaketDetail();
    }
  }, [paketId]);

  // Status Toggle & Security Confirmation Modal State
  const [isConfirmDraftOpen, setIsConfirmDraftOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Handle Initiation of Status Toggle
  const handleInitiateToggleStatus = () => {
    if (!paket) return;
    if (paket.status === "PUBLISHED") {
      // Buka modal konfirmasi keamanan sebelum beralih ke Draf
      setIsConfirmDraftOpen(true);
    } else {
      executeToggleStatus("PUBLISHED");
    }
  };

  // Eksekusi perubahan status paket
  const executeToggleStatus = async (targetStatus: "PUBLISHED" | "DRAFT") => {
    if (!paket) return;
    setIsUpdatingStatus(true);
    try {
      const res = await psikotesService.update(paket.id, { status: targetStatus });
      if (res && res.success) {
        showToast(
          `Status paket berhasil diubah menjadi ${
            targetStatus === "PUBLISHED" ? "Published" : "Draft"
          }`
        );
        setPaket((prev) => (prev ? { ...prev, status: targetStatus } : null));
        setIsConfirmDraftOpen(false);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Gagal memperbarui status paket", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Metadata Alat Ukur & Dimensi Helpers
  const alatUkur = paket?.alat_ukur;
  const dimensiList = alatUkur?.dimensiList || [];
  const soalList = paket?.soal_psikotes || [];
  const interpretasiList = paket?.interpretasi_psikotes || [];

  // Urutan butir soal
  const sortedSoalList = useMemo(() => {
    return [...soalList].sort((a, b) => a.urutan - b.urutan);
  }, [soalList]);

  // Pagination Soal
  const totalPagesSoal = Math.ceil(sortedSoalList.length / itemsPerPageSoal) || 1;
  const paginatedSoalList = useMemo(() => {
    const start = (currentPageSoal - 1) * itemsPerPageSoal;
    return sortedSoalList.slice(start, start + itemsPerPageSoal);
  }, [sortedSoalList, currentPageSoal, itemsPerPageSoal]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-poppins gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#561269]" />
        <p className="text-sm font-medium">Memuat rincian paket psikotes...</p>
      </div>
    );
  }

  if (errorMessage || !paket) {
    return (
      <div className="p-8 max-w-xl mx-auto rounded-3xl bg-amber-50/80 border border-amber-200 text-center space-y-4 font-poppins my-12">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
        <h3 className="text-lg font-bold text-amber-900">Paket Tidak Ditemukan</h3>
        <p className="text-sm text-amber-800">{errorMessage || "Data paket tidak tersedia."}</p>
        <button
          type="button"
          onClick={() => router.push("/admin/psikotes?tab=paket")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Manajemen Paket</span>
        </button>
      </div>
    );
  }

  const isPublished = paket.status === "PUBLISHED";
  const isGratis = paket.jenis_akses === "GRATIS";
  const activeParticipants = paket.statistik?.tes_sedang_berlangsung ?? 0;

  return (
    <div className="flex flex-col gap-6 font-poppins pb-20 w-full animate-in fade-in duration-200">
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[120] animate-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ── Header Atas: Bersih & Minimalis ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/psikotes?tab=paket"
            className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-[#561269] hover:bg-purple-50/40 transition shadow-xs shrink-0"
            title="Kembali ke Manajemen Paket"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug truncate">
              Detail Paket Psikotes
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate mt-0.5">
              {paket.judul}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <a
            href={`/psikotes/${paket.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition shadow-xs"
            title="Buka halaman tes klien publik"
          >
            <span>Halaman Klien</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <button
            type="button"
            onClick={handleInitiateToggleStatus}
            disabled={isUpdatingStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
              isPublished
                ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                : "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950"
            } ${isUpdatingStatus ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPublished ? "Jadikan Draf" : "Publikasikan Paket"}</span>
          </button>
        </div>
      </div>

      {/* ── Tab Navigation Bar (3 Tab) ── */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200/80 pb-px scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("paket")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "paket"
              ? "border-[#561269] text-[#561269] bg-purple-50/30 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Informasi Paket</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("soal")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "soal"
              ? "border-[#561269] text-[#561269] bg-purple-50/30 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Daftar Soal</span>
          <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
            {soalList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("skoring_interpretasi")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "skoring_interpretasi"
              ? "border-[#561269] text-[#561269] bg-purple-50/30 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Skoring &amp; Interpretasi</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="space-y-6">
        {/* ==================================================================== */}
        {/* 1. INFORMASI PAKET */}
        {/* ==================================================================== */}
        {activeTab === "paket" && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Informasi Paket Layanan
              </h3>
              
            </div>

            <dl className="divide-y divide-gray-100 text-xs sm:text-sm">
              {/* Nama paket psikotes */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4 first:pt-0">
                <dt className="font-medium text-gray-400">Nama Paket Psikotes</dt>
                <dd className="mt-1 font-bold text-gray-900 sm:col-span-2 sm:mt-0 text-sm sm:text-base">
                  {paket.judul}
                </dd>
              </div>

              {/* Nama alat ukur */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Alat Ukur</dt>
                <dd className="mt-1 font-bold text-gray-900 sm:col-span-2 sm:mt-0">
                  {alatUkur?.nama || "Instrumen Psikometri Baku"}
                </dd>
              </div>

              {/* Deskripsi */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Deskripsi</dt>
                <dd className="mt-1 text-gray-700 leading-relaxed sm:col-span-2 sm:mt-0 whitespace-pre-line">
                  {paket.deskripsi || "Keterangan deskripsi paket belum diisi."}
                </dd>
              </div>

              {/* Jenis akses (Gratis/Berbayar) */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Jenis Akses</dt>
                <dd className="mt-1 font-semibold text-gray-900 sm:col-span-2 sm:mt-0">
                  {isGratis ? "Gratis" : "Berbayar"}
                </dd>
              </div>

              {/* Harga */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Harga Paket</dt>
                <dd className={`mt-1 sm:col-span-2 sm:mt-0 ${isGratis || !paket.harga || Number(paket.harga) === 0 ? "font-semibold text-gray-400" : "font-extrabold text-gray-900"}`}>
                  {isGratis || !paket.harga || Number(paket.harga) === 0
                    ? "-"
                    : `Rp ${Number(paket.harga).toLocaleString("id-ID")}`}
                </dd>
              </div>

              {/* Status (Draft/Published) */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Status</dt>
                <dd className="mt-1 font-semibold text-gray-900 sm:col-span-2 sm:mt-0">
                  {isPublished ? "Published" : "Draft"}
                </dd>
              </div>

              {/* Target usia */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Target Usia</dt>
                <dd className="mt-1 font-semibold text-gray-800 sm:col-span-2 sm:mt-0">
                  {alatUkur?.targetResponden || alatUkur?.targetUsia || "Remaja & Dewasa"}
                </dd>
              </div>

              {/* Jumlah soal */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Jumlah Soal</dt>
                <dd className="mt-1 font-semibold text-gray-800 sm:col-span-2 sm:mt-0">
                  {soalList.length} Butir Soal
                </dd>
              </div>

              {/* Dimensi yang diukur (jika ada) */}
              <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-400">Dimensi yang Diukur</dt>
                <dd className="mt-1 sm:col-span-2 sm:mt-0">
                  {dimensiList.length > 0 ? (
                    <div className="space-y-3">
                      <span className="font-semibold text-gray-900 block">
                        {dimensiList.length} Dimensi / Subskala
                      </span>
                      <div className="divide-y divide-gray-100">
                        {dimensiList.map((dim, idx) => (
                          <div
                            key={idx}
                            className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-bold text-gray-900 block">
                                {idx + 1}. {dim.nama}
                              </span>
                              {dim.deskripsi && (
                                <p className="text-xs text-gray-500 leading-relaxed">
                                  {dim.deskripsi}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0 self-start sm:self-auto">
                              {dim.jumlahSoal} Butir · Skor {dim.skorMin}–{dim.skorMax}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Skala Tunggal (Unidimensi)
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. DAFTAR SOAL */}
        {/* ==================================================================== */}
        {activeTab === "soal" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {paginatedSoalList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 space-y-2">
                <ListOrdered className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-sm font-semibold">Belum ada butir soal yang terdaftar pada paket ini.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
                {paginatedSoalList.map((soal) => {
                  const opsiList = soal.pilihan_jawaban || [];

                  return (
                    <div key={soal.id} className="p-5 sm:p-6 space-y-3 hover:bg-gray-50/30 transition">
                      {/* Nomor soal & Urutan soal */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-sm font-bold text-[#561269]">
                            {String(soal.urutan).padStart(2, "0")}.
                          </span>
                          {/* Pertanyaan */}
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                            {soal.pertanyaan}
                          </h4>
                        </div>
                      </div>

                      {/* Pilihan jawaban */}
                      <div className="pl-7 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                        {opsiList.map((opsi, optIdx) => (
                          <div
                            key={opsi.id || optIdx}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50/70 text-gray-700"
                          >
                            <span className="truncate">
                              <span className="font-bold text-gray-400 mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                              {opsi.teks_jawaban}
                            </span>
                            <span className="font-mono font-bold text-[#561269] shrink-0">
                              +{opsi.bobot}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Soal */}
            {totalPagesSoal > 1 && (
              <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-gray-200/80 shadow-xs">
                <span className="text-xs text-gray-500 font-medium">
                  Halaman <span className="font-bold text-gray-900">{currentPageSoal}</span> dari{" "}
                  <span className="font-bold text-gray-900">{totalPagesSoal}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPageSoal((p) => Math.max(1, p - 1))}
                    disabled={currentPageSoal === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                    aria-label="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPagesSoal }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPagesSoal ||
                        Math.abs(p - currentPageSoal) <= 1
                    )
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={p}>
                          {prev && p - prev > 1 && (
                            <span className="px-1 text-gray-400 text-xs">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPageSoal(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                              currentPageSoal === p
                                ? "bg-[#561269] text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    type="button"
                    onClick={() => setCurrentPageSoal((p) => Math.min(totalPagesSoal, p + 1))}
                    disabled={currentPageSoal === totalPagesSoal}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                    aria-label="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4. SKORING & INTERPRETASI */}
        {/* ==================================================================== */}
        {activeTab === "skoring_interpretasi" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Konfigurasi Skoring */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Konfigurasi Skoring
                </h3>
              </div>

              <dl className="divide-y divide-gray-100 text-xs sm:text-sm">
                {/* Rentang skor total */}
                <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4 first:pt-0">
                  <dt className="font-medium text-gray-400">Rentang Skor Total</dt>
                  <dd className="mt-1 sm:col-span-2 sm:mt-0 font-bold text-gray-900">
                    {alatUkur?.rentangSkorTotal || (soalList.length > 0 ? `0 – ${soalList.length * 3}` : "—")}
                  </dd>
                </div>

                {/* Ambang Batas Klinis (Cut-off) jika ada */}
                {alatUkur?.cutoff && (
                  <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="font-medium text-gray-400">Cut-off</dt>
                    <dd className="mt-1 sm:col-span-2 sm:mt-0 text-gray-800 font-semibold">
                      {alatUkur.cutoff}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 2. Kategori Hasil & Deskripsi Interpretasi */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Kategori Hasil &amp; Deskripsi Interpretasi
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {interpretasiList.length} Kategori
                </span>
              </div>

              {interpretasiList.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Belum ada data interpretasi yang tersimpan untuk paket ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/60 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                        <th scope="col" className="px-6 py-3.5 w-32 whitespace-nowrap">
                          Rentang Skor
                        </th>
                        <th scope="col" className="px-6 py-3.5 w-48 whitespace-nowrap">
                          Kategori
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Deskripsi Interpretasi &amp; Rekomendasi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {interpretasiList.map((inter, idx) => {
                        const tipsArray: any[] = Array.isArray(inter.tips)
                          ? inter.tips
                          : inter.tips?.saran || [];

                        return (
                          <tr
                            key={inter.id || idx}
                            className="hover:bg-gray-50/40 transition-colors"
                          >
                            {/* Rentang Skor */}
                            <td className="px-6 py-4 font-mono font-bold text-gray-900 whitespace-nowrap align-top">
                              {inter.min_skor} – {inter.max_skor}
                            </td>

                            {/* Kategori Hasil */}
                            <td className="px-6 py-4 align-top">
                              <span className="font-bold text-gray-900 text-sm block">
                                {inter.judul || inter.grade}
                              </span>
                              {inter.grade && inter.judul && inter.grade !== inter.judul && (
                                <span className="text-xs text-gray-400 block mt-0.5">
                                  Tingkat: {inter.grade}
                                </span>
                              )}
                            </td>

                            {/* Deskripsi & Rekomendasi */}
                            <td className="px-6 py-4 text-gray-700 leading-relaxed align-top space-y-2">
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                {inter.deskripsi || "Tidak ada keterangan interpretasi."}
                              </p>

                              {tipsArray.length > 0 && (
                                <div className="pt-2 border-t border-gray-100 mt-2">
                                  <span className="text-[11px] font-semibold text-gray-400 block mb-1">
                                    Saran &amp; Tindak Lanjut:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600">
                                    {tipsArray.map((tip: any, tIdx: number) => (
                                      <li key={tIdx} className="leading-relaxed">
                                        {typeof tip === "string" ? tip : tip?.teks || JSON.stringify(tip)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Konfirmasi Keamanan Beralih ke Draf (Poin 1) ── */}
      {isConfirmDraftOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-poppins">
            {/* Header / Close */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      activeParticipants > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-purple-100 text-[#561269]"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Konfirmasi Status Paket
                    </h3>
                    <p className="text-xs text-gray-500">
                      Ubah status paket menjadi Draf
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isUpdatingStatus && setIsConfirmDraftOpen(false)}
                  disabled={isUpdatingStatus}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  title="Tutup dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Konten Peringatan */}
              <div className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                {activeParticipants > 0 ? (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-900 text-xs leading-relaxed space-y-1.5">
                    <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{activeParticipants} Peserta Sedang Mengikuti Tes</span>
                    </p>
                    <p className="text-amber-700">
                      Saat ini terdapat peserta yang sedang mengerjakan tes ini. Mengubah status menjadi <strong>Draf</strong> akan menyembunyikan paket dari katalog publik, namun peserta yang sedang berlangsung tetap dapat menyelesaikan tesnya hingga selesai.
                    </p>
                  </div>
                ) : (
                  <p>
                    Apakah Anda yakin ingin mengubah status paket <strong>&ldquo;{paket.judul}&rdquo;</strong> menjadi <strong>Draf</strong>? Paket ini tidak akan muncul di katalog publik dan klien tidak dapat memulai sesi tes baru.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Aksi */}
            <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmDraftOpen(false)}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeToggleStatus("DRAFT")}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Jadikan Draf</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
