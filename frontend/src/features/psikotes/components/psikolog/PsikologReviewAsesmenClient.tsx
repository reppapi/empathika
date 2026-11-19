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
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { psikotesService, type ReviewPsikotesItem, type ReviewPsikotesListResponse } from "@/services/psikotes.service";
import { psikologService } from "@/services/psikolog.service";
import { calculateReviewSla, REVIEW_MAX_DAYS } from "../../utils/reviewSla";

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
      .then((profile: any) => {
        setIsReviewerAccess(Boolean(profile?.is_reviewer_psikotes));
      })
      .catch(() => {
        setIsReviewerAccess(true);
      });
  }, [user]);

  // Filter & Search (Menunggu Review & Selesai Diterbitkan)
  const [activeTab, setActiveTab] = useState<"MENUNGGU_REVIEW" | "SELESAI">("MENUNGGU_REVIEW");
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
          i.no_hp?.includes(q) ||
          i.psikolog?.nama?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [data?.items, activeTab, searchQuery]);

  const summary = data?.summary || {
    total: 0,
    menunggu_review: 0,
    kolam_bersama: 0,
    sedang_ditelaah: 0,
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
          {/* Kartu Ringkasan Statistik */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Antrean */}
        <div className="p-5 rounded-3xl border border-gray-200 bg-white shadow-sm flex items-center justify-between">
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

        {/* Menunggu Tinjau (Highlight) */}
        <div
          onClick={() => setActiveTab("MENUNGGU_REVIEW")}
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
            activeTab === "MENUNGGU_REVIEW"
              ? "bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-300 ring-2 ring-amber-500/20"
              : "bg-gradient-to-br from-amber-50/90 to-amber-50/40 border-amber-200/80 hover:border-amber-300"
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Menunggu Tinjau
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
                SLA: Maks. {REVIEW_MAX_DAYS} Hari Kerja
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

        {/* Laporan Diterbitkan */}
        <div
          onClick={() => setActiveTab("SELESAI")}
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            activeTab === "SELESAI"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20"
              : "bg-white border-gray-200 hover:border-emerald-200"
          }`}
        >
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Laporan Diterbitkan
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
              onClick={() => setActiveTab("MENUNGGU_REVIEW")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "MENUNGGU_REVIEW"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-amber-900/80 hover:bg-amber-100/60"
              }`}
            >
              {summary.menunggu_review > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              Menunggu Tinjau ({summary.menunggu_review})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SELESAI")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "SELESAI"
                  ? "bg-[#561269] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Diterbitkan ({summary.selesai_review})
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
                          : "Belum ada laporan asesmen yang diterbitkan."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isMenunggu = item.status_pengerjaan === "MENUNGGU_REVIEW";
                  const isSelesai = item.status_pengerjaan === "SELESAI";

                  const activePsiId =
                    typeof window !== "undefined"
                      ? localStorage.getItem("active_psikolog_id") || sessionStorage.getItem("active_psikolog_id")
                      : null;
                  const activePsiName =
                    typeof window !== "undefined"
                      ? localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
                      : null;
                  const isAdmin = user?.role === "ADMIN";

                  const isClaimedByMe = Boolean(
                    item.id_psikolog && (
                      isAdmin ||
                      claimedTicketIds.has(item.id) ||
                      (user?.id && (
                        item.psikolog?.id === user.id ||
                        item.id_psikolog === user.id ||
                        item.psikolog?.id_account === user.id
                      )) ||
                      (activePsiId && (
                        item.id_psikolog === activePsiId ||
                        item.psikolog?.id === activePsiId
                      )) ||
                      (user?.name && item.psikolog?.nama && (
                        item.psikolog.nama.toLowerCase().includes(user.name.toLowerCase()) ||
                        user.name.toLowerCase().includes(item.psikolog.nama.toLowerCase())
                      )) ||
                      (activePsiName && item.psikolog?.nama && (
                        item.psikolog.nama.toLowerCase().includes(activePsiName.toLowerCase()) ||
                        activePsiName.toLowerCase().includes(item.psikolog.nama.toLowerCase())
                      ))
                    )
                  );

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
                          !item.id_psikolog ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              Menunggu Tinjau
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-[#561269] border border-purple-200">
                              <span className="w-2 h-2 rounded-full bg-[#561269]" />
                              Sedang Ditinjau
                            </span>
                          )
                        ) : isSelesai ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Diterbitkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                            {item.status_pengerjaan}
                          </span>
                        )}
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
                            Belum ditentukan
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
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#561269] hover:bg-[#430c52] text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50 min-w-[76px]"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <span>Tinjau</span>
                                )}
                              </button>
                            ) : isClaimedByMe ? (
                              <button
                                type="button"
                                onClick={() => handleClaimAndReview(item)}
                                disabled={actionLoadingId === item.id}
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#561269] hover:bg-[#430c52] text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50 min-w-[76px]"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

      {/* Modal Dialog Konfirmasi Pengambilan / Telaah Tiket (Pengganti alert/confirm browser) */}
      {confirmModal.isOpen && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {confirmModal.isTakeover
                    ? "Konfirmasi Ambil Alih Tiket"
                    : "Konfirmasi Pengambilan Asesmen"}
                </h3>
                <p className="text-xs text-gray-500">
                  {confirmModal.isTakeover
                    ? "Tanggung jawab telaah klinis tiket ini akan dialihkan kepada Anda."
                    : "Tiket akan dikunci dan menjadi tanggung jawab klinis Anda."}
                </p>
              </div>
            </div>

            {/* Kotak Info Pasien & Paket */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Nama Peserta:</span>
                <span className="font-bold text-gray-900 font-sans">
                  {confirmModal.item.nama_peserta}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Alat Ukur / Paket:</span>
                <span className="font-semibold text-[#561269]">
                  {confirmModal.item.nama_paket}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Asal Biro:</span>
                <span className="font-semibold text-gray-800">
                  {confirmModal.item.nama_biro || "Empathika (Pusat)"}
                </span>
              </div>
              {confirmModal.item.kode_akses && (
                <div className="flex items-center justify-between pt-1 border-t border-purple-100/80">
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
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, item: null, isTakeover: false })
                }
                className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeClaim}
                className="rounded-full bg-[#561269] hover:bg-[#430c52] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
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

