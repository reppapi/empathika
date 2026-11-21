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
  X,
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

  // Filter & Search (4 Tab: Semua, Menunggu Tinjau, Sedang Ditinjau, Selesai)
  type TabReview = "ALL" | "MENUNGGU_TINJAU" | "SEDANG_DITINJAU" | "SELESAI";
  const [activeTab, setActiveTab] = useState<TabReview>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast & Loading State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Set ID tiket yang diklaim oleh user di sesi ini
  const [claimedTicketIds, setClaimedTicketIds] = useState<Set<string>>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("empathika_my_claimed_tickets") : null;
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

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

  // State Dialog Konfirmasi Kustom (Menggantikan window.confirm default browser)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    item: ReviewPsikotesItem | null;
    isTakeover: boolean;
  }>({
    isOpen: false,
    item: null,
    isTakeover: false,
  });

  // Handler Klaim / Kunci Tiket
  const handleClaimAndReview = (item: ReviewPsikotesItem, isTakeover = false) => {
    // Simpan item langsung ke sessionStorage untuk navigasi instan 0ms
    try {
      sessionStorage.setItem(`empathika_active_review_${item.id}`, JSON.stringify(item));
    } catch {}

    // Jika tiket sudah diklaim oleh diri sendiri dan bukan takeover, langsung pindah halaman tanpa prompt
    if (item.is_claimed && !isTakeover) {
      router.push(`/psikolog-web/review-asesmen/${item.id}`);
      return;
    }

    // Tampilkan modal konfirmasi kustom yang elegan
    setConfirmModal({
      isOpen: true,
      item,
      isTakeover,
    });
  };

  const executeClaim = async () => {
    const item = confirmModal.item;
    const isTakeover = confirmModal.isTakeover;
    if (!item) return;

    setConfirmModal({ isOpen: false, item: null, isTakeover: false });
    setActionLoadingId(item.id);

    try {
      if (!item.is_claimed || isTakeover) {
        const res = await psikotesService.claimReviewTicket(item.id);
        if (res?.data) {
          const resolvedClaimedName =
            res.data.claimed_by?.nama ||
            res.data.claimed_by?.nama_gelar ||
            (typeof window !== "undefined"
              ? localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
              : null) ||
            user?.name ||
            "";

          const updatedItem: ReviewPsikotesItem = {
            ...item,
            id_psikolog: res.data.claimed_by?.id || item.id_psikolog,
            is_claimed: true,
            claimed_at: res.data.claimed_at,
            psikolog: res.data.claimed_by
              ? {
                  id: res.data.claimed_by.id,
                  nama: resolvedClaimedName,
                  kategori: res.data.claimed_by.kategori || "psikolog",
                  foto: res.data.claimed_by.foto || null,
                }
              : item.psikolog,
          };

          try {
            sessionStorage.setItem(`empathika_active_review_${item.id}`, JSON.stringify(updatedItem));
            if (!item.catatan_psikolog && typeof window !== "undefined") {
              localStorage.removeItem(`empathika_draft_review_${item.id}`);
            }
          } catch {}

          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              summary: {
                ...prev.summary,
                kolam_bersama: Math.max(0, (prev.summary.kolam_bersama || 0) - 1),
                sedang_ditelaah: (prev.summary.sedang_ditelaah || 0) + 1,
              },
              items: prev.items.map((i) => (i.id === item.id ? updatedItem : i)),
            };
          });

          setClaimedTicketIds((prev) => {
            const next = new Set(prev).add(item.id);
            try {
              localStorage.setItem("empathika_my_claimed_tickets", JSON.stringify(Array.from(next)));
            } catch {}
            return next;
          });

          router.push(`/psikolog-web/review-asesmen/${item.id}`);
          return;
        }
      }
      router.push(`/psikolog-web/review-asesmen/${item.id}`);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err.message || "Gagal mengklaim tiket.");
      fetchData();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper untuk memvalidasi apakah suatu tiket review merupakan milik/tanggung jawab psikolog yang sedang login
  const isMyItem = useCallback(
    (item: ReviewPsikotesItem) => {
      if (!item.id_psikolog) return false;
      if (user?.role === "ADMIN") return true;
      if (claimedTicketIds.has(item.id)) return true;

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
    [user, claimedTicketIds]
  );

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    let items = data.items;

    // 1. Jika ada kata kunci pencarian, cari di SELURUH data (semua tabel & status)
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
    } else {
      // 2. Jika tidak ada pencarian, saring berdasarkan tab yang aktif
      if (activeTab === "MENUNGGU_TINJAU") {
        // Kolam antrean bersama: Semua peserta baru yang belum diambil oleh psikolog manapun
        items = items.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW" && !i.id_psikolog);
      } else if (activeTab === "SEDANG_DITINJAU") {
        // Ruang kerja pribadi: Hanya tiket yang sedang ditinjau oleh psikolog yang login
        items = items.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW" && isMyItem(i));
      } else if (activeTab === "SELESAI") {
        // Arsip pribadi: Hanya laporan yang diselesaikan oleh psikolog yang login
        items = items.filter((i) => i.status_pengerjaan === "SELESAI" && isMyItem(i));
      } else {
        // Tab ALL: Tampilkan antrean terbuka + tugas pribadi
        items = items.filter(
          (i) =>
            (i.status_pengerjaan === "MENUNGGU_REVIEW" && !i.id_psikolog) ||
            isMyItem(i)
        );
      }
    }

    // Urutkan berdasarkan sisa batas waktu (Urgency First):
    // Tiket menunggu review yang paling mepet (deadline terdekat / overdue) tampil di urutan teratas
    const sorted = [...items].sort((a, b) => {
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

    return sorted;
  }, [data?.items, activeTab, searchQuery, isMyItem]);

  // Statistik masing-masing tab sesuai kepemilikan psikolog yang login
  const myCounts = useMemo(() => {
    if (!data?.items) {
      return {
        total: 0,
        kolam_bersama: data?.summary?.kolam_bersama || 0,
        sedang_ditinjau: 0,
        selesai: 0,
      };
    }
    const kolam_bersama =
      data.summary?.kolam_bersama ??
      data.items.filter((i) => i.status_pengerjaan === "MENUNGGU_REVIEW" && !i.id_psikolog).length;
    const sedang_ditinjau = data.items.filter(
      (i) => i.status_pengerjaan === "MENUNGGU_REVIEW" && isMyItem(i)
    ).length;
    const selesai = data.items.filter(
      (i) => i.status_pengerjaan === "SELESAI" && isMyItem(i)
    ).length;

    return {
      total: kolam_bersama + sedang_ditinjau + selesai,
      kolam_bersama,
      sedang_ditinjau,
      selesai,
    };
  }, [data?.items, data?.summary, isMyItem]);

  const slaStats = useMemo(() => {
    if (!data?.items) return { overdueCount: 0, urgentCount: 0, kritisCount: 0, prioritasCount: 0, normalCount: 0 };
    // SLA stats fokus pada kolam terbuka + tugas pribadi yang belum selesai
    const menunggu = data.items.filter(
      (i) => i.status_pengerjaan === "MENUNGGU_REVIEW" && (!i.id_psikolog || isMyItem(i))
    );
    let overdueCount = 0;
    let urgentCount = 0;
    let kritisCount = 0;
    let prioritasCount = 0;
    let normalCount = 0;
    const nowMs = Date.now();

    for (const item of menunggu) {
      const sla = calculateReviewSla(item.tanggal_pengerjaan);
      const diffMs = sla.deadlineDate.getTime() - nowMs;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (sla.isOverdue) {
        overdueCount++;
        kritisCount++;
      } else if (diffHours <= 24) {
        urgentCount++;
        kritisCount++;
      } else if (diffHours <= 48) {
        prioritasCount++;
      } else {
        normalCount++;
      }
    }
    return { overdueCount, urgentCount, kritisCount, prioritasCount, normalCount };
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

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Review Psikotes
          </h1>
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
          {/* Kartu Ringkasan Statistik (3 Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Menunggu Tinjau */}
            <div
              onClick={() => setActiveTab("MENUNGGU_TINJAU")}
              className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                activeTab === "MENUNGGU_TINJAU"
                  ? "bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-300 ring-2 ring-amber-500/20"
                  : "bg-white border-gray-200 hover:border-amber-200"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Menunggu Tinjau
                  </p>
                  {myCounts.kolam_bersama > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1">
                  {isLoading ? "..." : myCounts.kolam_bersama}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Antrean terbuka (belum diambil)
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center relative z-10">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* 2. Sedang Ditinjau */}
            <div
              onClick={() => setActiveTab("SEDANG_DITINJAU")}
              className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                activeTab === "SEDANG_DITINJAU"
                  ? "bg-gradient-to-br from-purple-50 to-fuchsia-50/60 border-purple-300 ring-2 ring-purple-500/20"
                  : "bg-white border-gray-200 hover:border-purple-200"
              }`}
            >
              <div className="relative z-10">
                <p className="text-xs font-bold text-[#561269] uppercase tracking-wider">
                  Sedang Ditinjau
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                  {isLoading ? "..." : myCounts.sedang_ditinjau}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Dalam proses telaah &amp; draf
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#561269] flex items-center justify-center relative z-10">
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
                  Laporan resmi terbit
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

      {/* Banner Pengingat Tugas yang Sedang Ditinjau oleh Psikolog Ini (Clean Purple Palette) */}
      {myIncompleteReviews.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-50/90 via-fuchsia-50/40 to-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#561269]/10 border border-purple-200 flex items-center justify-center shrink-0 text-[#561269]">
              <Clock className="w-5 h-5 text-[#561269]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 tracking-tight">
                Tugas Anda: <span className="text-[#561269] font-extrabold">{myIncompleteReviews.length} Asesmen</span> Sedang Ditinjau Belum Selesai
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Anda memiliki {myIncompleteReviews.length} tiket asesmen yang sedang Anda tinjau. Mohon selesaikan dan serahkan laporan sebelum batas waktu berakhir.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("SEDANG_DITINJAU")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] active:scale-95 text-gray-950 text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Lanjutkan Tinjauan</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-950" />
          </button>
        </div>
      )}

      {/* Banner Prioritas / Paling Mendesak */}
      {slaStats.kritisCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-white font-bold">
              <AlertCircle className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">
                  Prioritas Mendesak: {slaStats.kritisCount} Asesmen Mendekati Batas SLA
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black uppercase tracking-wider">
                  ≤ 24 Jam / Overdue
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5 leading-relaxed">
                Antrean di bawah otomatis diurutkan berdasarkan batas waktu terdekat (<em>Urgency First</em>). Mohon prioritaskan tiket bertanda merah sebelum tenggat berakhir.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab(myCounts.kolam_bersama > 0 ? "MENUNGGU_TINJAU" : "SEDANG_DITINJAU")}
            className="px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Fokus Antrean Mendesak
          </button>
        </div>
      )}

      {/* Kontrol Filter Tabs & Search */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* Filter Tabs (4 Tab Sejajar: Semua, Menunggu Tinjau, Sedang Ditinjau, Selesai) */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 bg-gray-100/90 rounded-2xl w-fit border border-gray-200/80 shadow-inner overflow-x-auto max-w-full shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* 1. Semua */}
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "ALL"
                  ? "bg-[#561269] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              Semua ({myCounts.total})
            </button>

            {/* 2. Menunggu Tinjau */}
            <button
              type="button"
              onClick={() => setActiveTab("MENUNGGU_TINJAU")}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "MENUNGGU_TINJAU"
                  ? "bg-[#EAB308] text-gray-950 shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              {myCounts.kolam_bersama > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "MENUNGGU_TINJAU" ? "bg-gray-950" : "bg-[#D97706]"} animate-pulse`} />
              )}
              Menunggu Tinjau ({myCounts.kolam_bersama})
            </button>

            {/* 3. Sedang Ditinjau */}
            <button
              type="button"
              onClick={() => setActiveTab("SEDANG_DITINJAU")}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "SEDANG_DITINJAU"
                  ? "bg-[#561269] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Sedang Ditinjau ({myCounts.sedang_ditinjau})
            </button>

            {/* 4. Selesai */}
            <button
              type="button"
              onClick={() => setActiveTab("SELESAI")}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "SELESAI"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
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
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim() && activeTab !== "ALL") {
                  setActiveTab("ALL");
                }
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
                    <div className="max-w-xs mx-auto space-y-1.5">
                      <p className="font-bold text-gray-800 text-sm">Tidak Ada Asesmen</p>
                      <p className="text-gray-400 text-xs">
                        {searchQuery
                          ? `Tidak ditemukan asesmen dengan kata kunci "${searchQuery}".`
                          : activeTab === "MENUNGGU_TINJAU"
                          ? "Hebat! Tidak ada tiket baru yang menunggu di antrean terbuka."
                          : activeTab === "SEDANG_DITINJAU"
                          ? "Tidak ada asesmen yang sedang dalam proses telaah saat ini."
                          : "Belum ada laporan asesmen yang diterbitkan."}
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

                              {isMenunggu ? (() => {
                                const nowMs = Date.now();
                                const diffHours = (sla.deadlineDate.getTime() - nowMs) / (1000 * 60 * 60);
                                const isKritis = sla.isOverdue || diffHours <= 24;

                                return (
                                  <div className="flex flex-col gap-1 items-start">
                                    {isKritis && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300 animate-pulse">
                                          🔴 {sla.isOverdue ? "Kritis (Lewat Batas)" : "Kritis (≤ 24 Jam)"}
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-[10px] text-gray-500 font-medium" title={`Deadline: ${sla.deadlineFormatted}`}>
                                      Batas: {sla.deadlineFormatted}
                                    </span>
                                  </div>
                                );
                              })() : (
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
                            !item.id_psikolog ? (
                              <button
                                type="button"
                                onClick={() => handleClaimAndReview(item)}
                                disabled={actionLoadingId === item.id}
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50 min-w-[76px]"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-950" />
                                ) : (
                                  <span>Tinjau</span>
                                )}
                              </button>
                            ) : isClaimedByMe ? (
                              <button
                                type="button"
                                onClick={() => handleClaimAndReview(item)}
                                disabled={actionLoadingId === item.id}
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50 min-w-[76px]"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-950" />
                                ) : (
                                  <span>Lanjutkan</span>
                                )}
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200 cursor-not-allowed min-w-[76px]"
                                title={`Sedang aktif ditelaah oleh ${item.psikolog?.nama || "rekan psikolog lain"}`}
                              >
                                <span>Diproses</span>
                              </span>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  sessionStorage.setItem(`empathika_active_review_${item.id}`, JSON.stringify(item));
                                } catch {}
                                router.push(`/psikolog-web/review-asesmen/${item.id}`);
                              }}
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

      {/* Modal Dialog Konfirmasi Pengambilan / Telaah Tiket (Clean & Professional, No Icon) */}
      {confirmModal.isOpen && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Title (Clean without icon) */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                  {confirmModal.isTakeover
                    ? "Konfirmasi Ambil Alih Tiket"
                    : "Konfirmasi Pengambilan Asesmen"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {confirmModal.isTakeover
                    ? "Tanggung jawab telaah klinis tiket ini akan dialihkan kepada Anda."
                    : "Tiket akan dikunci dan menjadi tanggung jawab klinis Anda."}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, item: null, isTakeover: false })
                }
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer shrink-0"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kotak Info Pasien & Paket */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5 text-xs">
              <div className="grid grid-cols-[105px_1fr] items-start gap-2.5">
                <span className="text-gray-500 font-medium">Nama Peserta:</span>
                <span className="font-bold text-gray-900 font-sans">
                  {confirmModal.item.nama_peserta}
                </span>
              </div>
              <div className="grid grid-cols-[105px_1fr] items-start gap-2.5">
                <span className="text-gray-500 font-medium">Paket Asesmen:</span>
                <span className="font-semibold text-[#561269] leading-relaxed">
                  {confirmModal.item.nama_paket}
                </span>
              </div>
              <div className="grid grid-cols-[105px_1fr] items-start gap-2.5">
                <span className="text-gray-500 font-medium">Asal Biro:</span>
                <span className="font-semibold text-gray-800">
                  {confirmModal.item.nama_biro || "Empathika (Pusat)"}
                </span>
              </div>
              {confirmModal.item.kode_akses && (
                <div className="grid grid-cols-[105px_1fr] items-start gap-2.5 pt-2 border-t border-gray-200/60">
                  <span className="text-gray-400 font-mono text-[11px]">Kode Akses:</span>
                  <span className="font-mono text-[11px] text-gray-600 font-medium">
                    {confirmModal.item.kode_akses}
                  </span>
                </div>
              )}
            </div>

            {/* Keterangan Tanggung Jawab Klinis */}
            <p className="text-xs text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menelaah hasil tes klinis ini? Setelah diambil, tiket akan terkunci sebagai tanggung jawab klinis Anda sampai laporan resmi diterbitkan.
            </p>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, item: null, isTakeover: false })
                }
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition cursor-pointer active:scale-95"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeClaim}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-xs font-bold text-gray-950 shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                {confirmModal.isTakeover ? "Ambil Alih & Tinjau" : "Ambil & Tinjau"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

