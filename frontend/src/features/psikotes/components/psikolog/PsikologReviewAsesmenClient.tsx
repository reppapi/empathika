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
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Stethoscope,
  Calendar,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { psikotesService, type ReviewPsikotesItem, type ReviewPsikotesListResponse } from "@/services/psikotes.service";
import { psikologService } from "@/services/psikolog.service";
import { calculateReviewSla, REVIEW_MAX_DAYS } from "../../utils/reviewSla";
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge";

export default function PsikologReviewAsesmenClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<ReviewPsikotesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReviewerAccess, setIsReviewerAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      setIsReviewerAccess(true);
      return;
    }
    psikologService
      .getMyProfile()
      .then((res: any) => {
        const profile = res?.data ?? res;
        const isRev = profile?.is_reviewer_psikotes ?? profile?.isReviewerPsikotes;
        setIsReviewerAccess(isRev !== undefined && isRev !== null ? Boolean(isRev) : true);
      })
      .catch(() => {
        setIsReviewerAccess(true);
      });
  }, [user]);

  // Filter & Search (2 Tab: Perlu Ditelaah, Selesai)
  type TabReview = "PERLU_DITELAAH" | "SELESAI";
  const [activeTab, setActiveTab] = useState<TabReview>("PERLU_DITELAAH");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await psikotesService.getReviewList({
        status: "ALL",
        search: searchQuery.trim() || undefined,
      });
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setData({
          summary: { total: 0, menunggu_review: 0, kolam_bersama: 0, sedang_ditelaah: 0, selesai_review: 0 },
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
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler Buka Detail Telaah & Upload PDF (langsung menuju ruang kerja tanpa klaim)
  const handleOpenReview = (item: ReviewPsikotesItem) => {
    try {
      sessionStorage.setItem(`empathika_active_review_${item.id}`, JSON.stringify(item));
    } catch {}
    router.push(`/psikolog-web/review-asesmen/${item.id}`);
  };

  // Helper untuk memvalidasi apakah suatu tiket review merupakan tugas psikolog yang sedang login
  const isMyItem = useCallback(
    (item: ReviewPsikotesItem) => {
      if (!item.id_psikolog) return false;
      if (user?.role === "ADMIN") return true;

      if (
        user?.id &&
        (item.psikolog?.id === user.id ||
          item.id_psikolog === user.id ||
          (item.psikolog as any)?.id_account === user.id)
      ) {
        return true;
      }

      const activePsiId =
        typeof window !== "undefined"
          ? localStorage.getItem("active_psikolog_id") || sessionStorage.getItem("active_psikolog_id")
          : null;
      if (activePsiId && (item.id_psikolog === activePsiId || item.psikolog?.id === activePsiId)) {
        return true;
      }

      const activePsiName =
        typeof window !== "undefined"
          ? localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
          : null;
      if (
        user?.name &&
        item.psikolog?.nama &&
        (item.psikolog.nama.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(item.psikolog.nama.toLowerCase()))
      ) {
        return true;
      }
      if (
        activePsiName &&
        item.psikolog?.nama &&
        (item.psikolog.nama.toLowerCase().includes(activePsiName.toLowerCase()) ||
          activePsiName.toLowerCase().includes(item.psikolog.nama.toLowerCase()))
      ) {
        return true;
      }

      return false;
    },
    [user]
  );

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    let items = data.items.filter((i) => isMyItem(i));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.nama_peserta?.toLowerCase().includes(q) ||
          i.nama_paket?.toLowerCase().includes(q) ||
          i.kode_akses?.toLowerCase().includes(q) ||
          i.no_hp?.includes(q) ||
          i.psikolog?.nama?.toLowerCase().includes(q) ||
          (i.psikolog as any)?.nama_gelar?.toLowerCase().includes(q) ||
          i.nama_biro?.toLowerCase().includes(q)
      );
    } else if (activeTab === "PERLU_DITELAAH") {
      items = items.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW");
    } else if (activeTab === "SELESAI") {
      items = items.filter((i) => i.status_pengerjaan === "SELESAI");
    }

    return [...items].sort((a, b) => {
      if (a.status_pengerjaan === "MENUNGGU_REVIEW" && b.status_pengerjaan === "MENUNGGU_REVIEW") {
        const slaA = calculateReviewSla(a.tanggal_pengerjaan);
        const slaB = calculateReviewSla(b.tanggal_pengerjaan);
        return slaA.deadlineDate.getTime() - slaB.deadlineDate.getTime();
      }
      if (a.status_pengerjaan === "MENUNGGU_REVIEW") return -1;
      if (b.status_pengerjaan === "MENUNGGU_REVIEW") return 1;
      const timeA = new Date(a.tanggal_review || a.tanggal_pengerjaan).getTime();
      const timeB = new Date(b.tanggal_review || b.tanggal_pengerjaan).getTime();
      return timeB - timeA;
    });
  }, [data?.items, activeTab, searchQuery, isMyItem]);

  // Statistik masing-masing tab sesuai tugas yang diberikan Admin
  const myCounts = useMemo(() => {
    if (!data?.items) {
      return { total: 0, perlu_ditelaah: 0, selesai: 0 };
    }
    const mine = data.items.filter((i) => isMyItem(i));
    const perlu_ditelaah = mine.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW").length;
    const selesai = mine.filter((i) => i.status_pengerjaan === "SELESAI").length;
    return {
      total: perlu_ditelaah + selesai,
      perlu_ditelaah,
      selesai,
    };
  }, [data?.items, isMyItem]);

  // Hitung jumlah tugas yang sedang ditinjau dan menjadi tanggung jawab psikolog yang sedang login
  const myIncompleteReviews = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item) => item.status_pengerjaan === "MENUNGGU_REVIEW" && isMyItem(item));
  }, [data?.items, isMyItem]);

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

      {/* Toast Notifikasi Kendala / Error */}
      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-rose-700 text-white p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-200" />
          <div className="flex-1 text-xs">
            <p className="font-bold">Pemberitahuan</p>
            <p className="mt-0.5 text-rose-100">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-white/80 hover:text-white font-bold text-base leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header Halaman (Aksi Refresh) */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => fetchData(true)}
          disabled={isRefreshing || isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-purple-200 shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-700" : ""}`} />
          <span>{isRefreshing ? "Menyinkronkan..." : "Perbarui Data"}</span>
        </button>
      </div>

      {/* Peringatan Jika Bukan Reviewer */}
      {isReviewerAccess === false ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-8 sm:p-10 text-center max-w-xl mx-auto my-12 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Wewenang Reviewer Asesmen Belum Aktif
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              Akun Anda saat ini berstatus <strong>Psikolog Konseling</strong> dan belum memiliki hak klinis untuk mengambil antrean telaah atau menerbitkan laporan asesmen psikotes.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Silakan hubungi Administrator Empathika untuk mengaktifkan sakelar <strong>&ldquo;Reviewer Asesmen Psikotes&rdquo;</strong> di menu Manajemen Psikolog.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Kartu Ringkasan Statistik (2 Status: Perlu Ditelaah, Selesai) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Perlu Ditelaah */}
            <div
              onClick={() => setActiveTab("PERLU_DITELAAH")}
              className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                activeTab === "PERLU_DITELAAH"
                  ? "bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-300 ring-2 ring-amber-500/20"
                  : "bg-white border-gray-200 hover:border-amber-200"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Perlu Ditelaah
                  </p>
                  {myCounts.perlu_ditelaah > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1">
                  {isLoading ? "..." : myCounts.perlu_ditelaah}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Menunggu telaah &amp; upload PDF
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center relative z-10">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>

            {/* 3. Selesai */}
            <div
              onClick={() => setActiveTab("SELESAI")}
              className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                activeTab === "SELESAI"
                  ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-white border-gray-200 hover:border-emerald-200"
              }`}
            >
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Selesai
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                  {isLoading ? "..." : myCounts.selesai}
                </h3>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Laporan PDF resmi terbit
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

      {/* Banner Pengingat Tugas dari Admin */}
      {myIncompleteReviews.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-50/90 via-fuchsia-50/40 to-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#561269]/10 border border-purple-200 flex items-center justify-center shrink-0 text-[#561269]">
              <Clock className="w-5 h-5 text-[#561269]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 tracking-tight">
                Tugas Anda: <span className="text-[#561269] font-extrabold">{myIncompleteReviews.length} Asesmen</span> Perlu Ditelaah &amp; Upload PDF
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Admin telah menugaskan {myIncompleteReviews.length} asesmen kepada Anda. Silakan tinjau rekap skor/jawaban, buat laporan di Docs, lalu unggah file PDF-nya.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("PERLU_DITELAAH")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] active:scale-95 text-gray-950 text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Lihat Tugas</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-950" />
          </button>
        </div>
      )}

      {/* Kontrol Filter Tabs & Search */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* Filter Tabs (2 Tab Sejajar: Perlu Ditelaah, Selesai) */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 bg-gray-100/90 rounded-2xl w-fit border border-gray-200/80 shadow-inner overflow-x-auto max-w-full shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* 1. Perlu Ditelaah */}
            <button
              type="button"
              onClick={() => setActiveTab("PERLU_DITELAAH")}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "PERLU_DITELAAH"
                  ? "bg-[#EAB308] text-gray-950 shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              {myCounts.perlu_ditelaah > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "PERLU_DITELAAH" ? "bg-gray-950" : "bg-[#D97706]"} animate-pulse`} />
              )}
              Perlu Ditelaah ({myCounts.perlu_ditelaah})
            </button>

            {/* 3. Selesai */}
            <button
              type="button"
              onClick={() => setActiveTab("SELESAI")}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "SELESAI"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              Selesai ({myCounts.selesai})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full xl:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Cari di semua antrean (nama, tiket, HP)..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/20 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer font-bold"
                title="Hapus pencarian"
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

        <div className="overflow-x-auto admin-table-scrollbar max-h-[520px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#FAF8FB] text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 sticky top-0 bg-[#FAF8FB] z-10">Identitas Peserta</th>
                <th className="py-4 px-6 sticky top-0 bg-[#FAF8FB] z-10">Paket Asesmen</th>
                <th className="py-4 px-6 sticky top-0 bg-[#FAF8FB] z-10">Waktu &amp; Batas Review (Maks 3 Hari)</th>
                <th className="py-4 px-6 sticky top-0 bg-[#FAF8FB] z-10">Status Laporan</th>
                <th className="py-4 px-6 sticky top-0 bg-[#FAF8FB] z-10">Psikolog Pemeriksa</th>
                <th className="py-4 px-6 text-center sticky top-0 bg-[#FAF8FB] z-10">Tindakan</th>
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
                    <div className="max-w-xs mx-auto space-y-1.5">
                      <p className="font-bold text-gray-800 text-sm">Tidak Ada Asesmen</p>
                      <p className="text-gray-400 text-xs">
                        {searchQuery
                          ? `Tidak ditemukan asesmen dengan kata kunci "${searchQuery}".`
                          : activeTab === "PERLU_DITELAAH"
                          ? "Hebat! Belum ada tugas asesmen baru yang perlu ditelaah saat ini."
                          : activeTab === "SELESAI"
                          ? "Belum ada laporan asesmen yang diterbitkan."
                          : "Belum ada tugas asesmen yang ditugaskan Admin kepada Anda."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isMenunggu = item.status_pengerjaan === "MENUNGGU_REVIEW";
                  const isSelesai = item.status_pengerjaan === "SELESAI";

                  const isClaimedByMe = isMyItem(item);
                  const activePsiName =
                    typeof window !== "undefined"
                      ? localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
                      : null;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/20 transition-colors group"
                    >
                      {/* Identitas Peserta */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-900 group-hover:text-[#561269] transition-colors">
                            {item.nama_peserta}
                          </p>
                          {(item.usia || item.jenis_kelamin) && (
                            <p className="text-gray-500 text-[11px]">
                              {[item.usia ? `${item.usia} Th` : null, item.jenis_kelamin].filter(Boolean).join(" • ")}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Paket Asesmen & Tiket */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900 line-clamp-1 max-w-xs">
                          {item.nama_paket}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block font-mono text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            {item.kode_akses || "TIKET-AUTO"}
                          </span>
                          <span
                            className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]"
                            title={`Asal: ${item.nama_biro || "Empathika (Pusat)"}`}
                          >
                            • {item.nama_biro || "Empathika (Pusat)"}
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
                                <span
                                  className="text-[10px] text-gray-500 font-medium"
                                  title={`Deadline: ${sla.deadlineFormatted}`}
                                >
                                  Batas: {sla.deadlineFormatted}
                                </span>
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
                        <div className="flex flex-col gap-1 items-start">
                          {isMenunggu ? (
                            !item.id_psikolog ? (
                              <AdminStatusBadge variant="warning" className="w-36">
                                Menunggu Tinjau
                              </AdminStatusBadge>
                            ) : (
                              <AdminStatusBadge variant="info" className="w-36">
                                Sedang Ditinjau
                              </AdminStatusBadge>
                            )
                          ) : isSelesai ? (
                            <AdminStatusBadge variant="success" className="w-36">
                              Selesai
                            </AdminStatusBadge>
                          ) : (
                            <AdminStatusBadge variant="neutral" className="w-36">
                              {item.status_pengerjaan}
                            </AdminStatusBadge>
                          )}
                        </div>
                      </td>

                      {/* Psikolog Pemeriksa */}
                      <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                        {item.id_psikolog ? (
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.psikolog?.nama ||
                                (item.psikolog as any)?.nama_gelar ||
                                (isClaimedByMe ? (activePsiName || user?.name) : null) ||
                                "Psikolog Pemeriksa"}
                            </p>
                            {item.status_pengerjaan === "SELESAI" && item.tanggal_review ? (
                              <p className="text-[10px] text-gray-400">
                                Ditelaah:{" "}
                                {new Date(item.tanggal_review).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            ) : item.draft_saved_at ? (
                              <p className="text-[10px] text-purple-600 font-medium">
                                Draf:{" "}
                                {new Date(item.draft_saved_at).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">
                            Belum ada penelaah
                          </span>
                        )}
                      </td>

                      {/* Tindakan */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {isMenunggu ? (
                            <button
                              type="button"
                              onClick={() => handleOpenReview(item)}
                              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
                            >
                              <span>Telaah &amp; Upload PDF</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenReview(item)}
                              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full border border-gray-300 hover:border-purple-300 hover:bg-purple-50/50 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
                            >
                              <span>Lihat Laporan</span>
                            </button>
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
      </>
      )}
    </div>
  );
}

