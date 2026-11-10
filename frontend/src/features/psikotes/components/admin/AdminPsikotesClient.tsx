"use client";

import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { psikotesService } from "@/services/psikotes.service";
import type {
  AdminPsikotesPeserta,
  JudulPsikotesItem,
  PaketDetailItem,
} from "../../types/adminPsikotes";
import { mapApiResponseToJudul } from "../../utils/adminPsikotesMapper";
import { printLaporanPsikotes } from "../../utils/printLaporanPsikotes";
import PsikotesSummaryCards from "./PsikotesSummaryCards";
import TabPesertaPsikotes from "./TabPesertaPsikotes";
import TabPaketPsikotes from "./TabPaketPsikotes";
import ModalDetailPeserta from "./ModalDetailPeserta";
import ModalDetailPaket from "./ModalDetailPaket";

export default function AdminPsikotesClient() {
  const [activeTab, setActiveTab] = useState<"peserta" | "paket">("peserta");
  const [searchPaket, setSearchPaket] = useState("");
  const [searchPeserta, setSearchPeserta] = useState("");
  const [selectedPaketPeserta, setSelectedPaketPeserta] = useState<string>("ALL");

  // Modals
  const [selectedPeserta, setSelectedPeserta] = useState<AdminPsikotesPeserta | null>(null);
  const [selectedJudul, setSelectedJudul] = useState<JudulPsikotesItem | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Judul List & Peserta List
  const [judulList, setJudulList] = useState<JudulPsikotesItem[]>([]);
  const [pesertaList, setPesertaList] = useState<AdminPsikotesPeserta[]>([]);
  const [pesertaSummary, setPesertaSummary] = useState({
    total_peserta: 0,
    total_gratis: 0,
    total_berbayar: 0,
    total_selesai: 0,
  });
  const [isLoadingPeserta, setIsLoadingPeserta] = useState(false);
  const [isLoadingPaket, setIsLoadingPaket] = useState(false);
  const [loadPaketError, setLoadPaketError] = useState<string | null>(null);

  const loadPesertaFromBackend = async () => {
    setIsLoadingPeserta(true);
    try {
      const res = await psikotesService.getPeserta({ jenis_akses: "BERBAYAR" });
      if (res && res.success && res.data) {
        setPesertaSummary(res.data.summary);
        const rawItems = Array.isArray(res.data.items) ? res.data.items : [];
        const mapped: AdminPsikotesPeserta[] = rawItems.map((it: any) => ({
          id: it.id,
          nama: it.nama_peserta,
          noHp: it.no_hp,
          paket: it.nama_paket,
          tanggal: new Date(it.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rawTanggal: it.tanggal,
          status: it.status as "Selesai" | "Berjalan",
          skor: it.skor,
          jenisAkses: it.jenis_akses as "Gratis" | "Berbayar",
          usia: it.usia,
          jenisKelamin: it.jenis_kelamin,
          totalSkor: it.total_skor,
          hasil: it.hasil,
          peserta: it.peserta,
        }));
        setPesertaList(mapped);
      }
    } catch (err) {
      console.error("Gagal membaca data peserta dari server:", err);
    } finally {
      setIsLoadingPeserta(false);
    }
  };

  const loadDataFromBackend = async () => {
    setIsLoadingPaket(true);
    setLoadPaketError(null);
    try {
      const res = await psikotesService.getList({ status: "ALL", include_draft: true });
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = mapApiResponseToJudul(res.data);
        setJudulList(mapped);
      }
    } catch (err) {
      console.error("Gagal membaca data paket dari server:", err);
      setLoadPaketError("Gagal terhubung ke backend. Pastikan server backend dan database lokal telah menyala.");
    } finally {
      setIsLoadingPaket(false);
    }
  };

  // Baca URL query parameter saat pertama kali dibuka (misal /admin/psikotes?tab=paket)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "paket" || tabParam === "peserta") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    loadDataFromBackend();
    loadPesertaFromBackend();
  }, []);

  // Notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handler: Toggle Status Paket (Aktif / Dipublikasi <-> Draf / Nonaktif)
  const handleToggleStatus = async (paket: PaketDetailItem) => {
    try {
      const nextStatus = paket.status === "Aktif" ? "DRAFT" : "PUBLISHED";
      const res = await psikotesService.update(String(paket.id), { status: nextStatus });
      if (res && res.success) {
        setNotification({
          type: "success",
          message: `Status paket berhasil diubah menjadi ${
            nextStatus === "PUBLISHED" ? "Dipublikasi (Aktif)" : "Draf (Nonaktif)"
          }.`,
        });
        await loadDataFromBackend();
        if (selectedJudul) {
          setSelectedJudul((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              paketList: prev.paketList.map((p) =>
                p.id === paket.id
                  ? { ...p, status: nextStatus === "PUBLISHED" ? "Aktif" : "Draf" }
                  : p
              ),
            };
          });
        }
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: `Gagal mengubah status: ${
          err.response?.data?.message || err.message || "Terjadi kesalahan"
        }`,
      });
    }
  };

  // Handler: Hapus Judul Paket dari Database
  const handleDeleteJudul = async (target: JudulPsikotesItem | string | number) => {
    const item = typeof target === "object" ? target : judulList.find((j) => j.id === target);
    if (!item) return;

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus seluruh instrumen psikotes "${item.judul}" beserta seluruh paket variannya? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    try {
      const packageIds = item.paketList.map((p) => String(p.id));
      for (const pid of packageIds) {
        await psikotesService.delete(pid);
      }
      setNotification({
        type: "success",
        message: `Instrumen psikotes "${item.judul}" berhasil dihapus dari sistem.`,
      });
      await loadDataFromBackend();
      if (selectedJudul && selectedJudul.id === item.id) {
        setSelectedJudul(null);
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: `Gagal menghapus: ${
          err.response?.data?.message || err.message || "Terjadi kesalahan pada server"
        }`,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : notification.type === "error"
              ? "bg-red-600 text-white"
              : "bg-[#561269] text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 1. Top Bar: Tab Switcher & Minimalist Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Tab Switcher (Gaya konsisten Admin Empathika) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/90 rounded-2xl w-fit border border-gray-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("peserta")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "peserta"
                ? "bg-[#561269] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Klien ({pesertaSummary.total_berbayar})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("paket")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "paket"
                ? "bg-[#561269] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Katalog Paket ({judulList.length})</span>
          </button>
        </div>
      </div>

      {/* ── 2. Content Tabs ── */}
      {activeTab === "peserta" ? (
        <div className="flex flex-col gap-6">
          {/* Ringkasan Statistik Peserta (Berbayar & Gratis) */}
          <PsikotesSummaryCards summary={pesertaSummary} />

          {/* Tabel Data Klien */}
          <TabPesertaPsikotes
          pesertaList={pesertaList}
          searchQuery={searchPeserta}
          onSearchChange={setSearchPeserta}
          selectedPaket={selectedPaketPeserta}
          onSelectPaketChange={setSelectedPaketPeserta}
          paketOptions={Array.from(
            new Set([
              ...judulList.map((j) => j.judul),
              ...pesertaList.map((p) => p.paket).filter(Boolean),
            ])
          ).filter(Boolean)}
          isLoading={isLoadingPeserta}
          onSelectPeserta={setSelectedPeserta}
        />
      </div>
    ) : (
        /* Tabel Kelola Paket Psikotes */
        <TabPaketPsikotes
          judulList={judulList}
          searchQuery={searchPaket}
          onSearchChange={setSearchPaket}
          onSelectJudul={setSelectedJudul}
          onDeleteJudul={handleDeleteJudul}
          isLoading={isLoadingPaket}
          errorMessage={loadPaketError}
          onRetry={loadDataFromBackend}
        />
      )}

      {/* ── 3. Modal Detail Paket & Kelola Status ── */}
      <ModalDetailPaket
        judul={selectedJudul}
        onClose={() => setSelectedJudul(null)}
        onToggleStatus={handleToggleStatus}
      />

      {/* ── 4. Modal Detail Peserta (Hasil Dokumen PDF Klien) ── */}
      <ModalDetailPeserta
        peserta={selectedPeserta}
        judulList={judulList}
        onClose={() => setSelectedPeserta(null)}
        onDownloadPdf={(peserta) => printLaporanPsikotes(peserta, judulList)}
      />
    </div>
  );
}
