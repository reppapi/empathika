"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BarChart3,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Save,
  ClipboardList,
  ExternalLink,
  ArrowLeft,
  Lock,
  Upload,
  FileText,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { psikotesService, type ReviewPsikotesItem } from "@/services/psikotes.service";
import { uploadService } from "@/services/upload.service";
import RekapJawabanPasienView from "./RekapJawabanPasienView";
import ModalRekapJawabanFullscreen from "./ModalRekapJawabanFullscreen";

interface ModalReviewPsikotesProps {
  item: ReviewPsikotesItem | null;
  onClose: () => void;
  onSuccess: (updatedItem: ReviewPsikotesItem) => void;
  isStandalonePage?: boolean;
  initialDetail?: any;
}

export default function ModalReviewPsikotes({
  item,
  onClose,
  onSuccess,
  isStandalonePage = false,
  initialDetail,
}: ModalReviewPsikotesProps) {
  const { user } = useAuthStore();

  const [fullDetail, setFullDetail] = useState<any>(initialDetail || null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(!initialDetail);
  const [showScoreSidebar, setShowScoreSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"skor" | "jawaban" | "identitas">("skor");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenJawaban, setIsFullscreenJawaban] = useState(false);

  // Accordion states untuk MCMI
  const [showPolaKepribadian, setShowPolaKepribadian] = useState(true);
  const [showSindromaKlinis, setShowSindromaKlinis] = useState(false);

  // State Upload PDF
  const [fileLaporanUrl, setFileLaporanUrl] = useState<string>(item?.file_laporan_url || "");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // State Submit & Draft
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initialPdfRef = useRef<string>(item?.file_laporan_url || "");

  useEffect(() => {
    if (!item?.id) return;
    setSubmitError(null);
    setDraftMessage(null);

    if (initialDetail) {
      setFullDetail(initialDetail);
      setIsLoadingDetail(false);
      let pdfUrl = initialDetail.file_laporan_url || initialDetail.hasil?.file_laporan_url || "";
      let savedName = "";
      try {
        const localRaw = localStorage.getItem(`empathika_draft_pdf_${item.id}`);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (!pdfUrl && parsed?.url) pdfUrl = parsed.url;
          if (parsed?.name) savedName = parsed.name;
        }
      } catch {}
      setFileLaporanUrl(pdfUrl);
      initialPdfRef.current = pdfUrl;
      if (pdfUrl) {
        setUploadedFileName(savedName || pdfUrl.split("/").pop() || "Laporan-Asesmen.pdf");
      }
      return;
    }

    setIsLoadingDetail(true);
    psikotesService
      .getHasilByBooking(item.id)
      .then((res) => {
        if (res?.data) {
          setFullDetail(res.data);
          const d: any = res.data;
          let pdfUrl = d.file_laporan_url || d.hasil?.file_laporan_url || "";
          let savedName = "";
          try {
            const localRaw = localStorage.getItem(`empathika_draft_pdf_${item.id}`);
            if (localRaw) {
              const parsed = JSON.parse(localRaw);
              if (!pdfUrl && parsed?.url) pdfUrl = parsed.url;
              if (parsed?.name) savedName = parsed.name;
            }
          } catch {}
          setFileLaporanUrl(pdfUrl);
          initialPdfRef.current = pdfUrl;
          if (pdfUrl) {
            setUploadedFileName(savedName || pdfUrl.split("/").pop() || "Laporan-Asesmen.pdf");
          }
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat detail lengkap asesmen:", err);
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  }, [item?.id, initialDetail]);

  const isAdmin = user?.role === "ADMIN";
  const activePsiId =
    typeof window !== "undefined"
      ? localStorage.getItem("active_psikolog_id") || sessionStorage.getItem("active_psikolog_id")
      : null;
  const activePsiName =
    typeof window !== "undefined"
      ? localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
      : null;

  const isClaimedByMe = Boolean(
    item?.id_psikolog &&
      (isAdmin ||
        (user?.id &&
          (item.psikolog?.id === user.id ||
            item.id_psikolog === user.id ||
            (item.psikolog as any)?.id_account === user.id)) ||
        (activePsiId && (item.id_psikolog === activePsiId || item.psikolog?.id === activePsiId)) ||
        (user?.name &&
          item.psikolog?.nama &&
          (item.psikolog.nama.toLowerCase().includes(user.name.toLowerCase()) ||
            user.name.toLowerCase().includes(item.psikolog.nama.toLowerCase()))) ||
        (activePsiName &&
          item.psikolog?.nama &&
          (item.psikolog.nama.toLowerCase().includes(activePsiName.toLowerCase()) ||
            activePsiName.toLowerCase().includes(item.psikolog.nama.toLowerCase()))))
  );

  const isSudahReview = item?.status_pengerjaan === "SELESAI";
  const isLockedByOther = Boolean(item?.id_psikolog && !isClaimedByMe && !isAdmin && !isSudahReview);
  const isReadOnly = isSudahReview || isLockedByOther;

  const hasUnsavedChanges = !isReadOnly && fileLaporanUrl !== initialPdfRef.current;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!item) return null;

  const detailSkor = fullDetail?.hasil?.detail_skor || item.detail_skor;
  const isMcmi = Boolean(
    detailSkor?.validitas ||
      detailSkor?.polaKepribadianList ||
      item.nama_paket?.toLowerCase().includes("mcmi") ||
      item.nama_paket?.toLowerCase().includes("multiaxial") ||
      item.nama_paket?.toLowerCase().includes("pola klinis") ||
      fullDetail?.paket?.alat_ukur?.kode?.toUpperCase().includes("MCMI")
  );

  const resolvedPsikologId =
    item.id_psikolog ||
    (user?.role === "PSIKOLOG" ? user?.id : null) ||
    activePsiId ||
    null;

  const handleAttemptBack = () => {
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }
    setShowExitConfirmModal(true);
  };

  const syncDraftPdf = async (url: string | null, fileName?: string, silentMessage?: string) => {
    try {
      if (url) {
        localStorage.setItem(
          `empathika_draft_pdf_${item.id}`,
          JSON.stringify({ url, name: fileName || "" })
        );
      } else {
        localStorage.removeItem(`empathika_draft_pdf_${item.id}`);
      }
    } catch {}

    try {
      const res = await psikotesService.submitReview(item.id, {
        catatan_psikolog: null,
        file_laporan_url: url,
        id_psikolog: resolvedPsikologId,
        is_draft: true,
      });
      if (res?.success) {
        initialPdfRef.current = url || "";
        if (silentMessage) {
          setDraftMessage(silentMessage);
          setTimeout(() => setDraftMessage(null), 3500);
        }
        onSuccess({
          ...item,
          catatan_psikolog: null,
          file_laporan_url: url,
          draft_saved_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Auto-save draf PDF ke server tertunda:", err);
    }
  };

  const handleFileSelected = async (file: File | null | undefined) => {
    if (!file || isReadOnly) return;
    setSubmitError(null);

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setSubmitError("Format file harus berupa dokumen PDF (.pdf).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSubmitError("Ukuran file PDF maksimal 10 MB.");
      return;
    }

    setIsUploadingPdf(true);
    try {
      const uploaded = await uploadService.uploadPdf(file);
      const displayName = file.name || uploaded.filename;
      setFileLaporanUrl(uploaded.url);
      setUploadedFileName(displayName);
      await syncDraftPdf(uploaded.url, displayName, "Tersimpan otomatis ke Draf");
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err.message || "Gagal mengupload file PDF.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!fileLaporanUrl) {
      setSubmitError("Unggah file PDF terlebih dahulu sebelum menyimpan draf.");
      return;
    }

    setIsSavingDraft(true);
    setSubmitError(null);
    setDraftMessage(null);

    try {
      const res = await psikotesService.submitReview(item.id, {
        catatan_psikolog: null,
        file_laporan_url: fileLaporanUrl,
        id_psikolog: resolvedPsikologId,
        is_draft: true,
      });

      if (res?.success) {
        try {
          localStorage.removeItem(`empathika_draft_pdf_${item.id}`);
        } catch {}
        initialPdfRef.current = fileLaporanUrl;
        setDraftMessage("Draf tersimpan di server");
        setTimeout(() => setDraftMessage(null), 3500);
        onSuccess({
          ...item,
          catatan_psikolog: null,
          file_laporan_url: fileLaporanUrl,
          draft_saved_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err.message || "Gagal menyimpan draf.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleExecutePublish = async () => {
    if (!fileLaporanUrl) {
      setShowPublishConfirmModal(false);
      setSubmitError("Harap unggah file PDF hasil laporan terlebih dahulu sebelum menerbitkan.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await psikotesService.submitReview(item.id, {
        catatan_psikolog: null,
        file_laporan_url: fileLaporanUrl,
        id_psikolog: resolvedPsikologId,
        is_draft: false,
      });

      if (res?.success) {
        try {
          localStorage.removeItem(`empathika_draft_pdf_${item.id}`);
        } catch {}
        initialPdfRef.current = fileLaporanUrl;
        setShowPublishConfirmModal(false);
        onSuccess({
          ...item,
          status_pengerjaan: "SELESAI",
          catatan_psikolog: null,
          file_laporan_url: fileLaporanUrl,
          tanggal_review: new Date().toISOString(),
          psikolog: res.data?.booking?.psikolog
            ? {
                id: res.data.booking.psikolog.id,
                nama: res.data.booking.psikolog.nama_gelar,
              }
            : item.psikolog,
        });
      }
    } catch (err: any) {
      setShowPublishConfirmModal(false);
      setSubmitError(
        err?.response?.data?.message || err.message || "Gagal menerbitkan laporan hasil psikotes."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper ekstrak list skala non-MCMI (jika ada di detail_skor)
  const genericSubscales: Array<{
    label: string;
    score: string | number;
    maxScore?: number;
    rentangButir?: string;
    deskripsi?: string;
    category?: string;
  }> = [];
  if (!isMcmi && detailSkor && typeof detailSkor === "object") {
    if (Array.isArray(detailSkor.subscalesList)) {
      detailSkor.subscalesList.forEach((s: any) =>
        genericSubscales.push({
          label: s.nama || s.key || "Skala",
          score: s.skor ?? 0,
          maxScore: typeof s.max_skor === "number" ? s.max_skor : undefined,
          rentangButir: s.rentangButir || undefined,
          deskripsi: s.deskripsi || undefined,
          category: s.kategori || s.level || undefined,
        })
      );
    } else if (Array.isArray(detailSkor.skalaList)) {
      detailSkor.skalaList.forEach((s: any) =>
        genericSubscales.push({
          label: s.nama || s.skala || s.kode || "Skala",
          score: s.skor ?? s.total ?? s.rawScore ?? 0,
          category: s.kategori || s.level || undefined,
        })
      );
    } else if (Array.isArray(detailSkor.profilSkala)) {
      detailSkor.profilSkala.forEach((s: any) =>
        genericSubscales.push({
          label: s.nama || s.skala || "Skala",
          score: s.skor ?? s.rawScore ?? 0,
          category: s.kategori || undefined,
        })
      );
    } else if (detailSkor.subscales && typeof detailSkor.subscales === "object") {
      Object.entries(detailSkor.subscales).forEach(([key, val]: [string, any]) => {
        genericSubscales.push({
          label: val?.label || val?.nama || key,
          score: typeof val === "object" ? (val.skor ?? val.score ?? val.total ?? 0) : val,
          category: typeof val === "object" ? val.kategori || val.level : undefined,
        });
      });
    }
  }

  const contentJsx = (
    <div
      className={`bg-[#F3F4F6] flex flex-col overflow-hidden ${
        isStandalonePage
          ? "w-full h-screen"
          : isFullscreen
          ? "w-full h-full rounded-none"
          : "w-full h-full sm:h-[94vh] sm:max-w-[1440px] sm:rounded-2xl shadow-2xl border border-gray-200"
      }`}
    >
      {/* ── 1. HEADER STUDIO ──────────────────────────────────────────────── */}
      <header className="px-4 sm:px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shrink-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {isStandalonePage && (
            <button
              type="button"
              onClick={handleAttemptBack}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer shrink-0"
              title="Kembali ke Daftar Tugas"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                {item.nama_peserta}
              </h2>
              {item.kode_akses && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#561269] border border-purple-100">
                  {item.kode_akses}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 truncate">
              {item.nama_paket}
              {item.usia ? ` • ${item.usia} Th` : ""}
              {item.jenis_kelamin ? ` • ${item.jenis_kelamin}` : ""}
            </p>
          </div>

          {!showScoreSidebar && (
            <button
              type="button"
              onClick={() => setShowScoreSidebar(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#561269] text-xs font-semibold border border-purple-200 transition cursor-pointer"
            >
              <PanelLeft className="w-3.5 h-3.5" />
              <span>Tampilkan Skor &amp; Jawaban</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {draftMessage && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {draftMessage}
            </span>
          )}

          {!isStandalonePage && (
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {isSudahReview ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Laporan Resmi Diterbitkan</span>
            </span>
          ) : isLockedByOther ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Ditugaskan ke: {item?.psikolog?.nama || "Psikolog Lain"}</span>
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting || isUploadingPdf || !fileLaporanUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-700" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-gray-600" />
                    <span>Simpan Draf</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!fileLaporanUrl) {
                    setSubmitError("Harap unggah file PDF hasil laporan sebelum menerbitkan.");
                    return;
                  }
                  setShowPublishConfirmModal(true);
                }}
                disabled={isSubmitting || isSavingDraft || isUploadingPdf || !fileLaporanUrl}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menerbitkan...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Terbitkan Laporan</span>
                  </>
                )}
              </button>
            </>
          )}

          {!isStandalonePage && (
            <button
              type="button"
              onClick={handleAttemptBack}
              disabled={isSubmitting || isSavingDraft}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer ml-1"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ── 2. BODY SPLIT WORKSPACE ───────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* A. SIDEBAR KIRI: PROFIL SKOR & REKAP JAWABAN */}
        {showScoreSidebar && (
          <aside className="w-80 lg:w-[420px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="px-3 pt-3 pb-2 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-1">
              <div className="inline-flex p-0.5 rounded-xl bg-gray-200/80 text-gray-600 gap-0.5 overflow-x-auto [scrollbar-width:none]">
                <button
                  type="button"
                  onClick={() => setSidebarTab("identitas")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    sidebarTab === "identitas" ? "bg-white text-[#561269] shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Identitas
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("skor")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    sidebarTab === "skor" ? "bg-white text-[#561269] shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Profil Skor
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("jawaban")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    sidebarTab === "jawaban" ? "bg-white text-[#561269] shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Jawaban
                  {Array.isArray(fullDetail?.rekap_jawaban) && (
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-[#561269] text-[10px] font-mono">
                      {fullDetail.rekap_jawaban.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1">
                {isLoadingDetail && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600 mr-0.5" />}
                {sidebarTab === "jawaban" && (
                  <button
                    type="button"
                    onClick={() => setIsFullscreenJawaban(true)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    title="Buka Lembar Jawaban Layar Penuh"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowScoreSidebar(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 transition-colors cursor-pointer"
                  title="Tutup Panel"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {sidebarTab === "identitas" ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs [scrollbar-width:thin]">
                {(() => {
                  const p = fullDetail?.peserta || {};
                  const tglLahir = p.tanggal_lahir
                    ? new Date(p.tanggal_lahir).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : null;
                  const ttl = [p.tempat_lahir, tglLahir].filter(Boolean).join(", ");
                  const tglTes =
                    fullDetail?.hasil?.tanggal_selesai || item.tanggal_pengerjaan
                      ? new Date(fullDetail?.hasil?.tanggal_selesai || item.tanggal_pengerjaan).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—";

                  const rows = [
                    { label: "Nama Lengkap", value: p.nama_lengkap || item.nama_peserta },
                    { label: "Usia", value: (p.usia ?? item.usia) ? `${p.usia ?? item.usia} Tahun` : "—" },
                    { label: "Jenis Kelamin", value: p.jenis_kelamin || item.jenis_kelamin || "—" },
                    { label: "Tempat, Tgl Lahir", value: ttl || "—" },
                    { label: "Pendidikan", value: p.pendidikan || "—" },
                    { label: "Pekerjaan", value: p.pekerjaan || "—" },
                    { label: "Status Pernikahan", value: p.status_pernikahan || "—" },
                    { label: "No. Telepon / WA", value: p.no_telepon || item.no_hp || "—" },
                  ];

                  return (
                    <>
                      <div className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2.5">
                        <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-2">
                          Identitas Peserta
                        </h4>
                        <div className="space-y-2">
                          {rows.map((r) => (
                            <div key={r.label} className="flex items-start justify-between gap-3 text-[11px]">
                              <span className="text-gray-400 shrink-0">{r.label}</span>
                              <span className="font-semibold text-gray-800 text-right break-words">
                                {r.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(p.nama_orang_tua || p.no_telepon_orang_tua) && (
                        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 space-y-2">
                          <h4 className="font-bold text-amber-900 text-xs border-b border-amber-200/60 pb-1.5">
                            Data Orang Tua / Wali
                          </h4>
                          {p.nama_orang_tua && (
                            <div className="flex items-start justify-between gap-3 text-[11px]">
                              <span className="text-gray-500 shrink-0">Nama Orang Tua</span>
                              <span className="font-semibold text-gray-900 text-right">{p.nama_orang_tua}</span>
                            </div>
                          )}
                          {p.no_telepon_orang_tua && (
                            <div className="flex items-start justify-between gap-3 text-[11px]">
                              <span className="text-gray-500 shrink-0">No. Telepon Ortu</span>
                              <span className="font-semibold text-gray-900 text-right">{p.no_telepon_orang_tua}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-2">
                        <h4 className="font-bold text-gray-900 text-xs border-b border-gray-200/80 pb-1.5">
                          Informasi Asesmen
                        </h4>
                        <div className="flex items-start justify-between gap-3 text-[11px]">
                          <span className="text-gray-400 shrink-0">Paket Tes</span>
                          <span className="font-semibold text-[#561269] text-right">{item.nama_paket}</span>
                        </div>
                        <div className="flex items-start justify-between gap-3 text-[11px]">
                          <span className="text-gray-400 shrink-0">Alat Ukur</span>
                          <span className="font-semibold text-gray-800 text-right">
                            {(() => {
                              const nama = fullDetail?.paket?.alat_ukur?.nama || "";
                              const kode = fullDetail?.paket?.alat_ukur?.kode || "";
                              if (!nama) return kode || "—";
                              if (kode && !nama.toLowerCase().includes(kode.toLowerCase())) {
                                return `${nama} (${kode})`;
                              }
                              return nama;
                            })()}
                          </span>
                        </div>
                        {item.kode_akses && (
                          <div className="flex items-start justify-between gap-3 text-[11px]">
                            <span className="text-gray-400 shrink-0">Kode Tiket</span>
                            <span className="font-mono font-bold text-gray-800 text-right">{item.kode_akses}</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3 text-[11px]">
                          <span className="text-gray-400 shrink-0">Waktu Selesai Tes</span>
                          <span className="font-medium text-gray-800 text-right">{tglTes}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : sidebarTab === "jawaban" ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                {isLoadingDetail ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#561269]" />
                    <p className="text-xs font-semibold text-gray-700">Memuat jawaban pasien dari database...</p>
                  </div>
                ) : (
                  <RekapJawabanPasienView
                    rekapJawaban={fullDetail?.rekap_jawaban || []}
                    alatUkurKode={fullDetail?.paket?.alat_ukur?.kode}
                    namaPaket={item.nama_paket}
                    snapshotJawaban={fullDetail?.snapshot_jawaban}
                    onMaximize={() => setIsFullscreenJawaban(true)}
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs [scrollbar-width:thin]">
                {isMcmi && detailSkor?.validitas && (
                  <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                        Validitas Profil (MCMI)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {detailSkor.validitas.kesimpulan}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
                      <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">Skala V</span>
                        <strong className="text-gray-900 text-xs">{detailSkor.validitas.skalaV ?? 0}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">Skala W</span>
                        <strong className="text-gray-900 text-xs">{detailSkor.validitas.skalaW ?? 0}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">Skala X</span>
                        <strong className="text-gray-900 text-xs">{detailSkor.validitas.skalaX ?? 0}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">Skala Y</span>
                        <strong className="text-gray-900 text-xs">BR {detailSkor.validitas.skalaY_BR ?? 0}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[9px]">Skala Z</span>
                        <strong className="text-gray-900 text-xs">BR {detailSkor.validitas.skalaZ_BR ?? 0}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {isMcmi && Array.isArray(detailSkor?.polaKepribadianList) && (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setShowPolaKepribadian((prev) => !prev)}
                      className="w-full px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <span className="font-bold text-gray-900 text-xs">Pola Kepribadian (15 Skala)</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${showPolaKepribadian ? "rotate-180 text-purple-800" : ""}`}
                      />
                    </button>
                    {showPolaKepribadian && (
                      <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto border-t border-gray-100 [scrollbar-width:thin]">
                        {detailSkor.polaKepribadianList.map((scale: any) => {
                          const br = Number(scale.brScore ?? 0);
                          return (
                            <div key={scale.kode} className="p-2 rounded-lg border border-gray-100 bg-gray-50/70 text-[11px] flex items-center justify-between gap-2">
                              <span className="font-semibold text-gray-800 truncate">
                                Skala {scale.kode}: {(scale.nama || "").replace(/\s*\(Skala\s+[^)]+\)/i, "").trim()}
                              </span>
                              <span className="font-bold text-[#561269] shrink-0">BR {br}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {isMcmi && Array.isArray(detailSkor?.sindromaKlinisList) && (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setShowSindromaKlinis((prev) => !prev)}
                      className="w-full px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <span className="font-bold text-gray-900 text-xs">Sindroma Klinis (10 Skala)</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${showSindromaKlinis ? "rotate-180 text-purple-800" : ""}`}
                      />
                    </button>
                    {showSindromaKlinis && (
                      <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto border-t border-gray-100 [scrollbar-width:thin]">
                        {detailSkor.sindromaKlinisList.map((scale: any) => {
                          const br = Number(scale.brScore ?? 0);
                          return (
                            <div key={scale.kode} className="p-2 rounded-lg border border-gray-100 bg-gray-50/70 text-[11px] flex items-center justify-between gap-2">
                              <span className="font-semibold text-gray-800 truncate">
                                Skala {scale.kode}: {(scale.nama || "").replace(/\s*\(Skala\s+[^)]+\)/i, "").trim()}
                              </span>
                              <span className="font-bold text-[#561269] shrink-0">BR {br}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {!isMcmi && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                      <span className="font-bold text-gray-900 block">Ringkasan Skor Asesmen</span>
                      {!detailSkor?.tanpaSkorTotal && (
                        <p className="text-gray-700 font-semibold">
                          Total Skor: {fullDetail?.hasil?.total_skor ?? item.total_skor ?? "—"}
                        </p>
                      )}
                      <p className="text-gray-600 text-[11px] leading-relaxed">
                        {fullDetail?.hasil?.deskripsi || detailSkor?.deskripsi || "Silakan periksa rincian subskala dan rekap jawaban pasien."}
                      </p>
                    </div>

                    {genericSubscales.length > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
                        <span className="font-bold text-gray-900 block">Rincian Skor Kategori / Skala</span>
                        <div className="space-y-2">
                          {genericSubscales.map((sub, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 space-y-1 text-[11px]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="font-bold text-gray-800 block">{sub.label}</span>
                                  {sub.rentangButir && (
                                    <span className="text-[10px] text-gray-400 block">
                                      Butir {sub.rentangButir}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-extrabold text-[#561269]">
                                    {sub.score}
                                    {sub.maxScore !== undefined ? ` / ${sub.maxScore}` : ""}
                                  </span>
                                  {sub.category && (
                                    <span className="ml-1.5 text-[10px] text-gray-500">({sub.category})</span>
                                  )}
                                </div>
                              </div>
                              {sub.deskripsi && (
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                  {sub.deskripsi}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </aside>
        )}

        {/* B. PANEL KANAN: UPLOAD & PRATINJAU PDF LAPORAN RESMI */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FC] [scrollbar-width:thin]">
          <div className="max-w-3xl mx-auto space-y-5">
            {submitError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Perhatian:</p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            {isSudahReview ? (
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Laporan Resmi PDF Telah Diterbitkan</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
                  Sudah tersedia untuk Admin &amp; Peserta
                </span>
              </div>
            ) : isLockedByOther ? (
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold">
                    Ditugaskan ke {item?.psikolog?.nama || "Psikolog Lain"} (Mode Baca Saja)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 space-y-1">
                <p className="font-bold">Panduan Penyusunan &amp; Upload Laporan</p>
                <p className="text-purple-800/90 leading-relaxed">
                  Tinjau profil skor dan rekap jawaban peserta pada panel di sebelah kiri, susun laporan interpretasi di dokumen template Empathika (Docs/Word), lalu ekspor ke <strong>PDF</strong> dan unggah di bawah ini.
                </p>
              </div>
            )}

            {/* Card Upload File PDF */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Dokumen Laporan Resmi (PDF)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Format file yang diterima: PDF (maksimal 10 MB)
                  </p>
                </div>
                {fileLaporanUrl && (
                  <a
                    href={fileLaporanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka di Tab Baru</span>
                  </a>
                )}
              </div>

              {!isReadOnly && !fileLaporanUrl && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      handleFileSelected(f);
                      e.target.value = "";
                    }}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      handleFileSelected(f);
                    }}
                    className={`rounded-xl border px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 transition-all ${
                      isDragging
                        ? "border-[#561269] bg-purple-50/50"
                        : "border-gray-200 bg-gray-50/40"
                    }`}
                  >
                    {isUploadingPdf ? (
                      <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
                        <Loader2 className="w-4 h-4 animate-spin text-[#561269]" />
                        <span>Mengunggah dokumen PDF...</span>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-purple-50/60 hover:border-[#561269]/50 text-[#561269] text-xs font-semibold shadow-2xs transition cursor-pointer active:scale-98"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tambahkan file</span>
                        </button>
                        <span className="text-[11px] text-gray-400">
                          Format .pdf (maks. 10 MB) atau seret file ke sini
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Info File Terunggah ala Google Form + Pratinjau PDF */}
              {fileLaporanUrl ? (
                <div className="space-y-3">
                  <div className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={fileLaporanUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-gray-900 hover:text-[#561269] hover:underline truncate block"
                        >
                          {uploadedFileName || "Laporan-Hasil-Asesmen.pdf"}
                        </a>
                        <p className="text-[10px] text-gray-400">PDF siap diterbitkan</p>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setFileLaporanUrl("");
                          setUploadedFileName("");
                          void syncDraftPdf(null);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
                        title="Hapus file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-100 h-[460px]">
                    <iframe
                      src={fileLaporanUrl}
                      title="Pratinjau Laporan PDF"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ) : (
                isReadOnly && (
                  <p className="text-xs text-gray-500 italic">
                    Belum ada file PDF laporan yang diunggah.
                  </p>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <>
      {isStandalonePage ? (
        <div className="w-full h-screen overflow-hidden bg-[#F3F4F6] flex flex-col font-sans text-gray-800">
          {contentJsx}
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-black/70 backdrop-blur-sm">
          {contentJsx}
        </div>
      )}

      <ModalRekapJawabanFullscreen
        isOpen={isFullscreenJawaban}
        onClose={() => setIsFullscreenJawaban(false)}
        rekapJawaban={fullDetail?.rekap_jawaban || []}
        namaPeserta={item.nama_peserta}
        namaPaket={item.nama_paket}
        alatUkurKode={fullDetail?.paket?.alat_ukur?.kode}
        snapshotJawaban={fullDetail?.snapshot_jawaban}
      />

      {showExitConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Simpan Perubahan?</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ada perubahan yang belum disimpan.</p>
              </div>
              <button
                type="button"
                disabled={isSavingAndExiting}
                onClick={() => setShowExitConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={isSavingAndExiting}
                onClick={async () => {
                  setIsSavingAndExiting(true);
                  await handleSaveDraft();
                  setIsSavingAndExiting(false);
                  setShowExitConfirmModal(false);
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                {isSavingAndExiting ? "Menyimpan..." : "Simpan ke Draf & Keluar"}
              </button>
              <button
                type="button"
                disabled={isSavingAndExiting}
                onClick={() => {
                  setShowExitConfirmModal(false);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium transition cursor-pointer"
              >
                Langsung Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublishConfirmModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Terbitkan Laporan Resmi?</h3>
                <p className="text-xs text-gray-500 mt-0.5">Harap periksa pratinjau PDF sebelum menerbitkan</p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPublishConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-start gap-2.5 py-1 text-xs text-gray-600 leading-relaxed">
              <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p>
                Setelah diterbitkan, dokumen PDF akan langsung tersedia di Dashboard Admin dan halaman hasil peserta, serta status asesmen menjadi <strong className="text-gray-800">Selesai</strong>.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPublishConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecutePublish}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menerbitkan...</span>
                  </>
                ) : (
                  <span>Ya, Terbitkan Laporan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
