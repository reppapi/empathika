/** Komponen utama dashboard admin untuk mengelola paket tes dan data peserta psikotes. */
"use client";

import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { psikotesService } from "@/services/psikotes.service";
import { psikologService } from "@/services/psikolog.service";
import type {
  AdminPsikotesPeserta,
  AdminPsikologOption,
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
import { AdminDeleteModal } from "@/components/shared/AdminDeleteModal";
import { formatToIndonesianPhone } from "@/components/shared/checkout/FormDataPeserta";

export interface AdminPsikotesClientProps {
  isBiroContext?: boolean;
}

export default function AdminPsikotesClient({ isBiroContext = false }: AdminPsikotesClientProps = {}) {
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
  const [pesertaSummary, setPesertaSummary] = useState<{
    total_peserta: number;
    total_gratis: number;
    total_berbayar: number;
    total_selesai: number;
    total_menunggu_review?: number;
  }>({
    total_peserta: 0,
    total_gratis: 0,
    total_berbayar: 0,
    total_selesai: 0,
    total_menunggu_review: 0,
  });
  const [isLoadingPeserta, setIsLoadingPeserta] = useState(false);
  const [isLoadingPaket, setIsLoadingPaket] = useState(false);
  const [loadPaketError, setLoadPaketError] = useState<string | null>(null);
  const [psikologOptions, setPsikologOptions] = useState<AdminPsikologOption[]>([]);

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
          noHp: it.no_hp ? formatToIndonesianPhone(it.no_hp) : it.no_hp,
          paket: it.nama_paket,
          kodeAkses: it.kode_akses || it.kodeAkses || null,
          tanggal: new Date(it.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rawTanggal: it.tanggal_pengerjaan || it.tanggal,
          status: it.status as "Selesai" | "Menunggu Pengerjaan",
          status_pengerjaan: it.status_pengerjaan || null,
          perlu_review_psikolog: Boolean(it.perlu_review_psikolog),
          namaBiro: it.nama_biro || "Empathika (Pusat)",
          nama_biro: it.nama_biro || "Empathika (Pusat)",
          is_biro: Boolean(it.is_biro),
          id_psikolog: it.id_psikolog || null,
          claimed_at: it.claimed_at || null,
          wa_sent_at: it.wa_sent_at || null,
          is_wa_sent: Boolean(it.is_wa_sent || it.wa_sent_at),
          skor: it.skor,
          jenisAkses: it.jenis_akses as "Gratis" | "Berbayar",
          usia: it.usia,
          jenisKelamin: it.jenis_kelamin,
          totalSkor: it.total_skor,
          namaPemesan: it.nama_pemesan || null,
          noHpPemesan: it.no_hp_pemesan ? formatToIndonesianPhone(it.no_hp_pemesan) : null,
          isPembeliBerbeda: Boolean(it.is_pembeli_berbeda),
          hasil: it.hasil,
          peserta: it.peserta,
          psikolog: it.psikolog
            ? {
                id: it.psikolog.id,
                nama: it.psikolog.nama_gelar || it.psikolog.nama,
                nama_gelar: it.psikolog.nama_gelar || it.psikolog.nama,
                kategori: it.psikolog.kategori,
                foto: it.psikolog.foto || null,
                no_telepon: it.psikolog.no_telepon || null,
                email: it.psikolog.email || null,
              }
            : null,
        }));
        setPesertaList(mapped);
      }
    } catch (err) {
      console.error("Gagal membaca data peserta dari server:", err);
      setPesertaList([]);
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
    if (!isBiroContext) {
      psikologService
        .getList({ status: "ALL" })
        .then((res: any) => {
          const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          const reviewers = raw.filter((p: any) =>
            Boolean(p.is_reviewer_psikotes ?? p.isReviewerPsikotes)
          );
          setPsikologOptions(
            reviewers.map((p: any) => ({
              id: p.id,
              nama_gelar: p.nama_gelar || p.account?.nama || p.nama || "Psikolog Empathika",
              kategori: p.kategori || "",
              spesialisasi: p.spesialisasi?.nama || p.spesialisasi || "",
              foto: p.foto || null,
              status: p.status || "ACTIVE",
            }))
          );
        })
        .catch((err) => {
          console.error("Gagal memuat daftar psikolog:", err);
        });
    }
  }, [isBiroContext]);

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
          message: `Status paket berhasil diubah menjadi ${nextStatus === "PUBLISHED" ? "Dipublikasi (Aktif)" : "Draf (Nonaktif)"
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
        message: `Gagal mengubah status: ${err.response?.data?.message || err.message || "Terjadi kesalahan"
          }`,
      });
    }
  };

  // State Modal Konfirmasi Hapus
  const [judulToDelete, setJudulToDelete] = useState<JudulPsikotesItem | null>(null);
  const [isDeletingJudul, setIsDeletingJudul] = useState(false);

  // Handler: Buka modal konfirmasi hapus instrumen psikotes
  const handleOpenDeleteJudul = (target: JudulPsikotesItem | string | number) => {
    const item = typeof target === "object" ? target : judulList.find((j) => j.id === target);
    if (!item) return;
    setJudulToDelete(item);
  };

  // Handler: Eksekusi hapus Judul Paket dari Database
  const handleConfirmDeleteJudul = async () => {
    if (!judulToDelete) return;
    setIsDeletingJudul(true);
    try {
      const packageIds = judulToDelete.paketList.map((p) => String(p.id));
      for (const pid of packageIds) {
        await psikotesService.delete(pid);
      }
      setNotification({
        type: "success",
        message: `Instrumen psikotes "${judulToDelete.judul}" berhasil dihapus dari sistem.`,
      });
      await loadDataFromBackend();
      if (selectedJudul && selectedJudul.id === judulToDelete.id) {
        setSelectedJudul(null);
      }
      setJudulToDelete(null);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: `Gagal menghapus: ${err.response?.data?.message || err.message || "Terjadi kesalahan pada server"
          }`,
      });
    } finally {
      setIsDeletingJudul(false);
    }
  };

  // Handler: Tandai atau Batalkan Status Pengiriman Laporan via WhatsApp
  const handleToggleWaStatus = async (bookingId: string, currentSent?: boolean) => {
    const nextSent = !currentSent;
    // Optimistic update
    setPesertaList((prev) =>
      prev.map((p) => {
        if (String(p.id) === String(bookingId)) {
          return {
            ...p,
            is_wa_sent: nextSent,
            wa_sent_at: nextSent ? new Date().toISOString() : null,
          };
        }
        return p;
      })
    );
    if (selectedPeserta && String(selectedPeserta.id) === String(bookingId)) {
      setSelectedPeserta((prev) =>
        prev
          ? {
              ...prev,
              is_wa_sent: nextSent,
              wa_sent_at: nextSent ? new Date().toISOString() : null,
            }
          : null
      );
    }

    try {
      const res = await psikotesService.toggleWaStatus(bookingId, nextSent);
      if (res && res.success) {
        setNotification({
          type: "success",
          message: nextSent
            ? "Hasil asesmen berhasil ditandai telah dikirim via WhatsApp."
            : "Tanda pengiriman WhatsApp berhasil dibatalkan.",
        });
      }
    } catch (err: any) {
      console.error("Gagal memperbarui status pengiriman WA:", err);
      // Rollback jika terjadi error
      setPesertaList((prev) =>
        prev.map((p) => {
          if (String(p.id) === String(bookingId)) {
            return {
              ...p,
              is_wa_sent: currentSent,
              wa_sent_at: currentSent ? p.wa_sent_at : null,
            };
          }
          return p;
        })
      );
      if (selectedPeserta && String(selectedPeserta.id) === String(bookingId)) {
        setSelectedPeserta((prev) =>
          prev
            ? {
                ...prev,
                is_wa_sent: currentSent,
                wa_sent_at: currentSent ? prev.wa_sent_at : null,
              }
            : null
        );
      }
      setNotification({
        type: "error",
        message: err.response?.data?.message || err.message || "Gagal memperbarui status pengiriman WhatsApp.",
      });
    }
  };

  // Handler: Batalkan Penugasan Psikolog pada Tiket Asesmen
  const handleReleaseTicket = async (bookingId: string) => {
    try {
      const res = await psikotesService.releaseReviewTicket(bookingId);
      if (res && res.success) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`empathika_active_review_${bookingId}`);
        }
        setNotification({
          type: "success",
          message: "Penugasan psikolog berhasil dibatalkan.",
        });
        setPesertaList((prev) =>
          prev.map((p) => {
            if (String(p.id) === String(bookingId)) {
              return {
                ...p,
                id_psikolog: null,
                psikolog: null,
                claimed_at: null,
              };
            }
            return p;
          })
        );
        setSelectedPeserta((prev) =>
          prev && String(prev.id) === String(bookingId)
            ? {
                ...prev,
                id_psikolog: null,
                psikolog: null,
                claimed_at: null,
              }
            : null
        );
      }
    } catch (err: any) {
      console.error("Gagal mengembalikan tiket ke antrean:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || err.message || "Gagal mengembalikan tiket ke antrean.",
      });
      throw err;
    }
  };

  // Handler: Admin Menugaskan Peserta Psikotes ke Psikolog Pemeriksa Tertentu
  const handleAssignPsikolog = async (bookingId: string, idPsikolog: string) => {
    try {
      const res = await psikotesService.assignPsikolog(bookingId, idPsikolog);
      if (res && res.success && res.data) {
        setNotification({
          type: "success",
          message: res.message || `Tiket berhasil ditugaskan kepada ${res.data.psikolog.nama_gelar}.`,
        });
        setPesertaList((prev) =>
          prev.map((p) => {
            if (String(p.id) === String(bookingId)) {
              return {
                ...p,
                id_psikolog: res.data.id_psikolog,
                claimed_at: res.data.claimed_at,
                psikolog: {
                  id: res.data.psikolog.id,
                  nama: res.data.psikolog.nama_gelar,
                  nama_gelar: res.data.psikolog.nama_gelar,
                  kategori: res.data.psikolog.kategori,
                  foto: res.data.psikolog.foto,
                },
              };
            }
            return p;
          })
        );
        setSelectedPeserta((prev) =>
          prev && String(prev.id) === String(bookingId)
            ? {
                ...prev,
                id_psikolog: res.data.id_psikolog,
                claimed_at: res.data.claimed_at,
                psikolog: {
                  id: res.data.psikolog.id,
                  nama: res.data.psikolog.nama_gelar,
                  nama_gelar: res.data.psikolog.nama_gelar,
                  kategori: res.data.psikolog.kategori,
                  foto: res.data.psikolog.foto,
                },
              }
            : prev
        );
      }
    } catch (err: any) {
      console.error("Gagal menugaskan psikolog:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || err.message || "Gagal menugaskan psikolog pemeriksa.",
      });
      throw err;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${notification.type === "success"
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "peserta"
              ? "bg-[#EAB308] text-gray-950 shadow-sm"
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
                ? "bg-[#EAB308] text-gray-950 shadow-sm"
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
          {/* Ringkasan Statistik Peserta */}
          <PsikotesSummaryCards
            summary={(() => {
              let belumDitugaskan = 0;
              let sedangDitinjau = 0;
              let belumKirimWa = 0;

              for (const p of pesertaList) {
                const lowerPaket = (p.paket || "").toLowerCase();
                const isDass =
                  lowerPaket.includes("dass") ||
                  lowerPaket.includes("depresi, kecemasan, dan stres");
                const isNeedReview =
                  !isDass &&
                  Boolean(
                    p.perlu_review_psikolog ||
                      lowerPaket.includes("mcmi") ||
                      lowerPaket.includes("pola klinis") ||
                      lowerPaket.includes("multiaxial") ||
                      lowerPaket.includes("choci") ||
                      lowerPaket.includes("ocd")
                  );
                const isMenungguReview =
                  isNeedReview &&
                  (p.status === "Menunggu Review" || p.status_pengerjaan === "MENUNGGU_REVIEW");
                const isSelesai =
                  !isMenungguReview &&
                  (p.status === "Selesai" || p.status_pengerjaan === "SELESAI" || Boolean(p.hasil));

                if (isMenungguReview) {
                  if (p.id_psikolog || p.psikolog) {
                    sedangDitinjau++;
                  } else {
                    belumDitugaskan++;
                  }
                } else if (isSelesai && !isDass && !p.is_wa_sent && !p.wa_sent_at) {
                  belumKirimWa++;
                }
              }

              return {
                ...pesertaSummary,
                total_menunggu_review: belumDitugaskan + sedangDitinjau,
                total_belum_ditugaskan: belumDitugaskan,
                total_sedang_ditinjau: sedangDitinjau,
                total_belum_kirim_wa: belumKirimWa,
              };
            })()}
          />

          {/* Tabel Data Klien */}
          <TabPesertaPsikotes
            pesertaList={pesertaList}
            searchQuery={searchPeserta}
            onSearchChange={setSearchPeserta}
            selectedPaket={selectedPaketPeserta}
            onSelectPaketChange={setSelectedPaketPeserta}
            paketOptions={Array.from(
              new Set([
                ...judulList
                  .filter((j) =>
                    j.paketList?.some(
                      (p) => p.jenisAkses === "Berbayar" || p.numericHarga > 0
                    )
                  )
                  .map((j) => j.judul),
                ...pesertaList
                  .filter((p) => p.jenisAkses === "Berbayar")
                  .map((p) => p.paket)
                  .filter(Boolean),
              ])
            ).filter(Boolean)}
            isLoading={isLoadingPeserta}
            onSelectPeserta={setSelectedPeserta}
            onToggleWaStatus={isBiroContext ? undefined : handleToggleWaStatus}
            isBiroContext={isBiroContext}
          />
        </div>
      ) : (
        /* Tabel Kelola Paket Psikotes */
        <TabPaketPsikotes
          judulList={judulList}
          searchQuery={searchPaket}
          onSearchChange={setSearchPaket}
          onSelectJudul={setSelectedJudul}
          onDeleteJudul={isBiroContext ? () => {} : handleOpenDeleteJudul}
          isReadOnly={isBiroContext}
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
        isReadOnly={isBiroContext}
      />

      {/* ── 4. Modal Detail Peserta (Hasil Dokumen PDF Klien) ── */}
      <ModalDetailPeserta
        peserta={selectedPeserta}
        judulList={judulList}
        psikologList={psikologOptions}
        onClose={() => setSelectedPeserta(null)}
        onDownloadPdf={(peserta) => printLaporanPsikotes(peserta, judulList)}
        onToggleWaStatus={isBiroContext ? undefined : handleToggleWaStatus}
        onReleaseTicket={isBiroContext ? undefined : handleReleaseTicket}
        onAssignPsikolog={isBiroContext ? undefined : handleAssignPsikolog}
        isBiroContext={isBiroContext}
      />

      {/* ── 5. Modal Konfirmasi Hapus Paket Psikotes (Khusus Admin Utama) ── */}
      {!isBiroContext && (
        <AdminDeleteModal
          isOpen={Boolean(judulToDelete)}
          onClose={() => !isDeletingJudul && setJudulToDelete(null)}
          onConfirm={handleConfirmDeleteJudul}
          itemType="instrumen psikotes"
          itemName={judulToDelete?.judul}
          description={
            judulToDelete ? (
              <>
                Apakah Anda yakin ingin menghapus instrumen psikotes{" "}
                <span className="font-extrabold text-gray-900">&ldquo;{judulToDelete.judul}&rdquo;</span>{" "}
                beserta seluruh paket variannya? Tindakan ini tidak dapat dibatalkan.
              </>
            ) : undefined
          }
          isLoading={isDeletingJudul}
        />
      )}
    </div>
  );
}