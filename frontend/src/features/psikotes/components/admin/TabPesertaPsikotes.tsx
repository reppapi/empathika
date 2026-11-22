/** Tab tabel data peserta psikotes berbayar beserta filter paket, pencarian, dan aksi detail. */
import React, { useState, useMemo } from "react";
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable";
import { ActionButtonDetail } from "@/components/shared/TableActionButtons";
import {
  Filter,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatToIndonesianPhone } from "@/components/shared/checkout/FormDataPeserta";
import { calculateReviewSla } from "../../utils/reviewSla";
import type { AdminPsikotesPeserta } from "../../types/adminPsikotes";

export interface TabPesertaPsikotesProps {
  pesertaList: AdminPsikotesPeserta[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedPaket?: string;
  onSelectPaketChange?: (val: string) => void;
  paketOptions?: string[];
  isLoading: boolean;
  onSelectPeserta: (peserta: AdminPsikotesPeserta) => void;
  onToggleWaStatus?: (bookingId: string, currentSent?: boolean) => void;
  isBiroContext?: boolean;
}

export default function TabPesertaPsikotes({
  pesertaList,
  searchQuery,
  onSearchChange,
  selectedPaket: externalSelectedPaket,
  onSelectPaketChange: externalOnSelectPaketChange,
  paketOptions = [],
  isLoading,
  onSelectPeserta,
  onToggleWaStatus,
  isBiroContext = false,
}: TabPesertaPsikotesProps) {
  // Local state jika prop eksternal tidak dipass
  const [localSelectedPaket, setLocalSelectedPaket] = useState<string>("ALL");
  const selectedPaket = externalSelectedPaket !== undefined ? externalSelectedPaket : localSelectedPaket;
  const handlePaketChange = externalOnSelectPaketChange || setLocalSelectedPaket;

  // State filter rentang tanggal
  const [selectedTimeRange, setSelectedTimeRange] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS">("ALL");

  // State Quick Pill Filter Status / Urgensi SLA
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "MENUNGGU_TINJAU" | "SEDANG_DITINJAU" | "SELESAI"
  >("ALL");

  // Filter awal: Peserta berbayar yang disaring berdasarkan Paket dan Rentang Tanggal
  const scopedPesertaList = useMemo(() => {
    return pesertaList.filter((peserta) => {
      const isBerbayar = peserta.jenisAkses === "Berbayar" && peserta.nama !== "Tamu Anonim";
      if (!isBerbayar) return false;

      // Filter berdasarkan paket psikotes
      if (selectedPaket && selectedPaket !== "ALL") {
        const pNama = (peserta.paket || "").toLowerCase().trim();
        const target = selectedPaket.toLowerCase().trim();
        if (!pNama.includes(target) && !target.includes(pNama)) {
          return false;
        }
      }

      // Filter berdasarkan rentang tanggal
      if (selectedTimeRange !== "ALL") {
        const dateVal = peserta.rawTanggal || peserta.tanggal;
        const parsedTime = new Date(dateVal).getTime();
        if (!isNaN(parsedTime)) {
          const now = Date.now();
          const diffDays = (now - parsedTime) / (1000 * 60 * 60 * 24);
          if (selectedTimeRange === "TODAY") {
            const pDate = new Date(dateVal);
            const nowDate = new Date();
            const isSameDay =
              pDate.getDate() === nowDate.getDate() &&
              pDate.getMonth() === nowDate.getMonth() &&
              pDate.getFullYear() === nowDate.getFullYear();
            if (!isSameDay) return false;
          } else if (selectedTimeRange === "7DAYS") {
            if (diffDays > 7.5 || diffDays < -0.5) return false;
          } else if (selectedTimeRange === "30DAYS") {
            if (diffDays > 30.5 || diffDays < -0.5) return false;
          }
        }
      }

      return true;
    });
  }, [pesertaList, selectedPaket, selectedTimeRange]);

  // Deteksi apakah paket yang sedang aktif difilter memerlukan review psikolog
  const isSelectedPaketNeedReview = useMemo(() => {
    if (!selectedPaket || selectedPaket === "ALL") {
      // Jika "ALL", hanya tampilkan bar review jika memang ada tiket yang butuh review klinis
      return scopedPesertaList.some((p) => {
        const isDass = Boolean(
          p.paket?.toLowerCase().includes("dass") ||
          p.paket?.toLowerCase().includes("depresi, kecemasan, dan stres")
        );
        return !isDass && Boolean(p.perlu_review_psikolog || p.paket?.toLowerCase().includes("mcmi"));
      });
    }
    const lower = selectedPaket.toLowerCase();
    const isDass = lower.includes("dass") || lower.includes("depresi, kecemasan, dan stres");
    if (isDass) return false;

    // Cek dari data peserta yang cocok dengan paket ini
    const match = scopedPesertaList.find(
      (p) => (p.paket || "").toLowerCase().includes(lower) || lower.includes((p.paket || "").toLowerCase())
    );
    if (match) {
      return Boolean(match.perlu_review_psikolog || match.paket?.toLowerCase().includes("mcmi"));
    }
    return lower.includes("mcmi");
  }, [selectedPaket, scopedPesertaList]);

  // Reset status filter ke ALL jika paket yang dipilih tidak memerlukan review klinis
  React.useEffect(() => {
    if (!isSelectedPaketNeedReview && statusFilter !== "ALL") {
      setStatusFilter("ALL");
    }
  }, [isSelectedPaketNeedReview, statusFilter]);

  // Statistik untuk Quick Pills (mengikuti filter paket dan rentang tanggal yang aktif)
  const statusStats = useMemo(() => {
    let menungguTinjauCount = 0;
    let sedangDitinjauCount = 0;
    let mendekatiSlaCount = 0;
    let selesaiCount = 0;
    const nowMs = Date.now();

    for (const p of scopedPesertaList) {
      const isDass = Boolean(
        p.paket?.toLowerCase().includes("dass") ||
        p.paket?.toLowerCase().includes("depresi, kecemasan, dan stres")
      );
      const isNeedReview = !isDass && Boolean(
        p.perlu_review_psikolog ||
        p.paket?.toLowerCase().includes("mcmi")
      );

      const isMenunggu = isNeedReview && (p.status === "Menunggu Review" || p.status_pengerjaan === "MENUNGGU_REVIEW");
      const isSelesai = !isMenunggu && (p.status === "Selesai" || p.status_pengerjaan === "SELESAI" || Boolean(p.hasil));

      if (isMenunggu) {
        if (p.id_psikolog || p.psikolog) {
          sedangDitinjauCount++;
        } else {
          menungguTinjauCount++;
        }
        const sla = calculateReviewSla(p.rawTanggal || p.tanggal);
        const diffMs = sla.deadlineDate.getTime() - nowMs;
        const diffHours = diffMs / (1000 * 60 * 60);
        if (sla.isOverdue || diffHours <= 24) {
          mendekatiSlaCount++;
        }
      } else if (isSelesai) {
        selesaiCount++;
      }
    }

    return {
      total: scopedPesertaList.length,
      menungguTinjau: menungguTinjauCount,
      sedangDitinjau: sedangDitinjauCount,
      mendekatiSla: mendekatiSlaCount,
      selesai: selesaiCount,
    };
  }, [scopedPesertaList]);

  // List tiket kritis untuk Admin Deadline Reminder Cards (H-1 / <= 24 jam)
  const urgentTickets = useMemo(() => {
    const nowMs = Date.now();
    return scopedPesertaList.filter((p) => {
      const isDass = Boolean(
        p.paket?.toLowerCase().includes("dass") ||
        p.paket?.toLowerCase().includes("depresi, kecemasan, dan stres")
      );
      const isNeedReview = !isDass && Boolean(
        p.perlu_review_psikolog ||
        p.paket?.toLowerCase().includes("mcmi")
      );
      const isMenunggu = isNeedReview && (p.status === "Menunggu Review" || p.status_pengerjaan === "MENUNGGU_REVIEW");
      if (!isMenunggu || !p.psikolog) return false;
      const sla = calculateReviewSla(p.rawTanggal || p.tanggal);
      const diffHours = (sla.deadlineDate.getTime() - nowMs) / (1000 * 60 * 60);
      return sla.isOverdue || diffHours <= 24;
    });
  }, [scopedPesertaList]);

  // Template Pesan Pengingat WhatsApp ke Psikolog Pemeriksa
  const generateWhatsAppReminderPsikolog = (p: AdminPsikotesPeserta) => {
    const sla = calculateReviewSla(p.rawTanggal || p.tanggal);
    const nowMs = Date.now();
    const diffHours = Math.round((sla.deadlineDate.getTime() - nowMs) / (1000 * 60 * 60));
    const sisaWaktuStr = sla.isOverdue ? "Telah melewati batas waktu SLA" : `Tersisa ~${diffHours} jam lagi`;
    const namaPsi = p.psikolog?.nama_gelar || p.psikolog?.nama || "Dokter/Kakak Psikolog";
    const rawHpPsi = p.psikolog?.no_telepon || "";
    const cleanHpPsi = rawHpPsi ? formatToIndonesianPhone(rawHpPsi).replace(/\D/g, "") : "";

    const msg = `Halo ${namaPsi},

Izin mengingatkan dari Admin Empathika terkait telaah asesmen psikotes untuk paket *${p.paket}* (Peserta: ${p.peserta?.nama_lengkap || p.nama}) yang saat ini sedang aktif dalam telaah Anda.

Batas waktu pengerjaan: *${sisaWaktuStr}* (Deadline: ${sla.deadlineFormatted}).
Mohon kesediaannya untuk menyelesaikan dan menerbitkan laporan resminya ya, Dok/Kak.

Terima kasih banyak atas bantuan dan dedikasinya! 🙏`;

    return cleanHpPsi
      ? `https://wa.me/${cleanHpPsi}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Derivasi paketOptions jika tidak dipass dari parent (khusus paket berbayar)
  const derivedPaketOptions =
    paketOptions.length > 0
      ? paketOptions
      : Array.from(
          new Set(
            pesertaList
              .filter((p) => p.jenisAkses === "Berbayar")
              .map((p) => p.paket)
              .filter(Boolean)
          )
        );

  // Filter akhir: Menerapkan Filter Tab Status & Pencarian Nama/Paket/NoHp
  const filteredPeserta = useMemo(() => {
    return scopedPesertaList.filter((peserta) => {
      // Filter cepat Status / Urgensi SLA
      const isDass = Boolean(
        peserta.paket?.toLowerCase().includes("dass") ||
        peserta.paket?.toLowerCase().includes("depresi, kecemasan, dan stres")
      );
      const isNeedReview = !isDass && Boolean(
        peserta.perlu_review_psikolog ||
        peserta.paket?.toLowerCase().includes("mcmi")
      );
      const isMenungguReview = isNeedReview && (peserta.status === "Menunggu Review" || peserta.status_pengerjaan === "MENUNGGU_REVIEW");
      const isSelesaiStatus = !isMenungguReview && (peserta.status === "Selesai" || peserta.status_pengerjaan === "SELESAI" || Boolean(peserta.hasil));

      if (statusFilter === "MENUNGGU_TINJAU") {
        if (!isMenungguReview || Boolean(peserta.id_psikolog || peserta.psikolog)) return false;
      } else if (statusFilter === "SEDANG_DITINJAU") {
        if (!isMenungguReview || !Boolean(peserta.id_psikolog || peserta.psikolog)) return false;
      } else if (statusFilter === "SELESAI") {
        if (!isSelesaiStatus) return false;
      }

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        peserta.nama.toLowerCase().includes(q) ||
        (peserta.paket || "").toLowerCase().includes(q) ||
        (peserta.noHp || "").includes(q)
      );
    });
  }, [scopedPesertaList, statusFilter, searchQuery]);

  const columns: ColumnDef<AdminPsikotesPeserta>[] = [
    {
      key: "peserta",
      header: "Nama Peserta",
      render: (peserta: AdminPsikotesPeserta) => {
        const hasPeserta = Boolean(peserta.peserta && peserta.peserta.nama_lengkap);
        const displayName = hasPeserta
          ? peserta.peserta?.nama_lengkap
          : peserta.nama || "Belum Mengisi Identitas";

        const rawPhone = peserta.noHp || peserta.noHpPemesan || "";
        const cleanDigits = rawPhone ? rawPhone.replace(/\D/g, "") : "";
        const waPhone = cleanDigits
          ? cleanDigits.startsWith("0")
            ? `62${cleanDigits.slice(1)}`
            : cleanDigits.startsWith("62")
            ? cleanDigits
            : `62${cleanDigits}`
          : "";
        const formattedPhone =
          rawPhone && rawPhone !== "—"
            ? formatToIndonesianPhone(rawPhone)
            : null;

        return (
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 leading-tight">
              {displayName}
            </span>
            {formattedPhone && waPhone ? (
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-emerald-700 font-mono mt-0.5 hover:underline transition-colors w-fit"
                title="Buka WhatsApp"
              >
                {formattedPhone}
              </a>
            ) : (
              <span className="text-xs text-gray-400 italic mt-0.5">—</span>
            )}
          </div>
        );
      },
    },
    {
      key: "paket",
      header: "Paket Tes",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="font-semibold text-gray-800">{peserta.paket}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (peserta: AdminPsikotesPeserta) => {
        const isDass = Boolean(
          peserta.paket?.toLowerCase().includes("dass") ||
          peserta.paket?.toLowerCase().includes("depresi, kecemasan, dan stres")
        );
        const isNeedReview = !isDass && Boolean(
          peserta.perlu_review_psikolog ||
          peserta.paket?.toLowerCase().includes("mcmi")
        );
        const isMenungguReview =
          isNeedReview && (
            peserta.status === "Menunggu Review" ||
            peserta.status_pengerjaan === "MENUNGGU_REVIEW"
          );
        const isSelesai =
          !isMenungguReview &&
          (peserta.status === "Selesai" || peserta.status_pengerjaan === "SELESAI" || Boolean(peserta.hasil));

        if (isMenungguReview) {
          const isSedangDitinjau = Boolean(peserta.id_psikolog || peserta.psikolog);
          const badgeVariant = isSedangDitinjau ? "info" : "warning";
          const badgeText = isSedangDitinjau ? "Sedang Ditinjau" : "Menunggu Tinjau";

          if (isBiroContext) {
            return (
              <div className="flex flex-col gap-1 items-start">
                <AdminStatusBadge variant={badgeVariant} className="w-36">
                  {badgeText}
                </AdminStatusBadge>
              </div>
            );
          }

          const sla = calculateReviewSla(peserta.rawTanggal || peserta.tanggal);
          const nowMs = Date.now();
          const diffHours = (sla.deadlineDate.getTime() - nowMs) / (1000 * 60 * 60);
          const pengerjaanTime = new Date(peserta.rawTanggal || peserta.tanggal).getTime();
          const hoursSincePengerjaan = !isNaN(pengerjaanTime) ? (nowMs - pengerjaanTime) / (1000 * 60 * 60) : 0;

          // 1. Indikator Belum Ada yang Ambil: Kolam antrean > 24 jam belum diklaim
          const isBelumAdaYangAmbil = !isSedangDitinjau && hoursSincePengerjaan >= 24;

          // 2. Indikator Hampir Habis Batas: Sudah di-keep tapi mendekati batas SLA (<= 24 jam) atau telat
          const isHampirHabisBatas = isSedangDitinjau && (sla.isOverdue || diffHours <= 24);

          return (
            <div className="flex flex-col gap-1 items-start">
              <AdminStatusBadge variant={badgeVariant} className="w-36">
                {badgeText}
              </AdminStatusBadge>

              {isBelumAdaYangAmbil && (
                <span className="text-[11px] font-bold text-amber-700 mt-0.5 flex items-center gap-1.5 animate-pulse">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span>Belum Ada yang Ambil</span>
                </span>
              )}

              {isHampirHabisBatas && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 animate-pulse shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  {sla.isOverdue ? "🚨 Lewat Batas SLA" : "🔥 Hampir Habis Batas"}
                </span>
              )}
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-1 items-start">
            <AdminStatusBadge
              variant={isSelesai ? "success" : "warning"}
              className="w-36"
            >
              {isSelesai ? "Selesai" : "Menunggu Pengerjaan"}
            </AdminStatusBadge>
          </div>
        );
      },
    },
    ...(statusFilter !== "SEDANG_DITINJAU" && statusFilter !== "MENUNGGU_TINJAU" && isSelectedPaketNeedReview
      ? [
          {
            key: "status_wa",
            header: "Pengiriman WA",
            align: "center" as const,
            render: (peserta: AdminPsikotesPeserta) => {
              const isDass = Boolean(
                peserta.paket?.toLowerCase().includes("dass") ||
                peserta.paket?.toLowerCase().includes("depresi, kecemasan, dan stres")
              );
              if (isDass) {
                return (
                  <span
                    className="text-gray-300 text-xs font-mono select-none"
                    title="Hasil tes otomatis tampil di web untuk peserta (tidak perlu dikirim WA)"
                  >
                    —
                  </span>
                );
              }

              const isMenungguReview =
                peserta.status === "Menunggu Review" ||
                peserta.status === "MENUNGGU_REVIEW";
              const isSelesai =
                !isMenungguReview &&
                (peserta.status === "Selesai" ||
                  peserta.status === "SELESAI" ||
                  Boolean(peserta.hasil));

              if (!isSelesai) {
                return (
                  <span
                    className="text-gray-300 text-xs font-mono select-none"
                    title="Pengiriman WA aktif setelah tes/laporan selesai"
                  >
                    —
                  </span>
                );
              }

              const isSent = Boolean(peserta.is_wa_sent || peserta.wa_sent_at);

              return (
                <div className="flex items-center justify-center">
                  <label
                    className="inline-flex items-center justify-center cursor-pointer select-none p-1 rounded-lg hover:bg-gray-100 transition"
                    title={
                      isSent
                        ? `Laporan telah dikirim via WA (${
                            peserta.wa_sent_at
                              ? new Date(peserta.wa_sent_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }) + " WIB"
                              : "Terkirim"
                          }). Klik untuk batalkan tanda.`
                        : "Klik kotak ini jika Anda sudah mengirimkan chat hasil asesmen via WhatsApp."
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isSent}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleWaStatus && onToggleWaStatus(String(peserta.id), isSent);
                      }}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer transition shrink-0"
                    />
                  </label>
                </div>
              );
            },
          },
        ]
      : []),
    {
      key: "tanggal",
      header: isSelectedPaketNeedReview ? "Waktu & Batas Review (Maks 3 Hari)" : "Waktu Pengerjaan",
      render: (peserta: AdminPsikotesPeserta) => {
        const rawDate = peserta.rawTanggal || peserta.tanggal;
        const dateObj = new Date(rawDate);
        const isValidDate = !isNaN(dateObj.getTime());
        const dateFormatted = isValidDate
          ? dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : peserta.tanggal;
        const timeFormatted = isValidDate
          ? `${dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })} WIB`
          : "";

        const isMenungguReview =
          peserta.status === "Menunggu Review" ||
          peserta.status === "MENUNGGU_REVIEW";
        const isSelesai =
          peserta.status === "Selesai" ||
          peserta.status === "SELESAI";

        const sla = calculateReviewSla(rawDate);

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-700 text-xs sm:text-sm">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{dateFormatted}</span>
              {timeFormatted && (
                <span className="text-[10px] text-gray-400">
                  {timeFormatted}
                </span>
              )}
            </div>

            {isMenungguReview ? (() => {
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
                  <span
                    className="text-[10px] text-gray-500 font-medium"
                    title={`Deadline: ${sla.deadlineFormatted}`}
                  >
                    Batas: {sla.deadlineFormatted}
                  </span>
                </div>
              );
            })() : isSelesai ? (
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Tepat Waktu (Selesai)
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (peserta: AdminPsikotesPeserta) => {
        return (
          <div className="flex items-center justify-center">
            <ActionButtonDetail
              onClick={() => onSelectPeserta(peserta)}
              title="Lihat Detail Peserta"
            />
          </div>
        );
      },
    },
  ];

  return (
    <AdminTableContainer>
      {/* 1. Reminder Otomatis Admin: Peringatan SLA Kritis (H-1 / <= 24 Jam) - Hanya untuk Admin Utama Empathika */}
      {!isBiroContext && urgentTickets.length > 0 && (
        <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-rose-50/80 to-amber-50 border border-rose-200/90 shadow-2xs space-y-3 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                Peringatan SLA ({urgentTickets.length} Asesmen Kritis)
              </span>
            </div>
            <span className="text-[11px] text-rose-700 font-semibold">
              Tiket sudah di-keep tetapi belum selesai dalam H-1 deadline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentTickets.slice(0, 4).map((ticket) => {
              const sla = calculateReviewSla(ticket.rawTanggal || ticket.tanggal);
              const nowMs = Date.now();
              const diffHours = Math.round((sla.deadlineDate.getTime() - nowMs) / (1000 * 60 * 60));
              const namaPsi = ticket.psikolog?.nama_gelar || ticket.psikolog?.nama || "Psikolog Pemeriksa";
              const waUrl = generateWhatsAppReminderPsikolog(ticket);

              return (
                <div
                  key={ticket.id}
                  className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {namaPsi}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {ticket.paket} • <span className="font-mono text-gray-700 font-medium">{ticket.peserta?.nama_lengkap || ticket.nama}</span>
                    </p>
                    <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                      {sla.isOverdue ? "🚨 Lewat Batas Waktu SLA" : `🔥 Sisa ~${diffHours} Jam`} (Deadline: {sla.deadlineFormatted.split(",")[0]})
                    </p>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
                    title="Kirim pesan pengingat WhatsApp ke psikolog pemeriksa"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ingatkan via WA</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Banner Pemberitahuan Asesmen Menunggu Tinjauan Psikolog (Hanya Admin Utama Empathika) */}
      {!isBiroContext && isSelectedPaketNeedReview && statusStats.menungguTinjau > 0 && (
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-50/90 via-fuchsia-50/30 to-white border border-purple-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
              <Clock className="w-4 h-4 text-[#561269]" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight">
                {statusStats.menungguTinjau} Asesmen Klinis Menunggu Tinjauan
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                Terdapat asesmen yang belum diambil oleh psikolog pemeriksa di ruang telaah.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("MENUNGGU_TINJAU")}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95 self-start sm:self-auto ${
              statusFilter === "MENUNGGU_TINJAU"
                ? "bg-purple-100 text-[#561269] border border-purple-300 font-semibold"
                : "bg-[#561269] hover:bg-[#430c52] text-white"
            }`}
          >
            <span>{statusFilter === "MENUNGGU_TINJAU" ? "Sedang Difilter" : "Lihat Antrean"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Kontrol Filter Dropdown & Pencarian */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          {/* Dropdown Filter per Paket Psikotes */}
          <div className="relative w-full sm:w-56">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <select
              value={selectedPaket}
              onChange={(e) => handlePaketChange(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] transition shadow-2xs cursor-pointer truncate"
            >
              <option value="ALL">Semua Paket Psikotes Berbayar</option>
              {derivedPaketOptions.map((pkt) => (
                <option key={pkt} value={pkt}>
                  {pkt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Filter Rentang Tanggal */}
          <div className="relative w-full sm:w-44">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] transition shadow-2xs cursor-pointer truncate"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="TODAY">Hari Ini</option>
              <option value="7DAYS">7 Hari Terakhir</option>
              <option value="30DAYS">30 Hari Terakhir</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {/* Kolom Pencarian Nama / No. WA */}
          <div className="w-full sm:w-64">
            <AdminSearchInput
              placeholder="Cari nama atau No. WA..."
              value={searchQuery}
              onChange={onSearchChange}
              className="!w-full lg:!w-full"
            />
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-wrap">
        {isSelectedPaketNeedReview && (
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl w-fit">
            {/* 1. Semua */}
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-[#561269] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              Semua ({statusStats.total})
            </button>

            {/* 2. Menunggu Tinjau */}
            <button
              type="button"
              onClick={() => setStatusFilter("MENUNGGU_TINJAU")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "MENUNGGU_TINJAU"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              {statusStats.menungguTinjau > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              Menunggu Tinjau ({statusStats.menungguTinjau})
            </button>

            {/* 3. Sedang Ditinjau */}
            <button
              type="button"
              onClick={() => setStatusFilter("SEDANG_DITINJAU")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "SEDANG_DITINJAU"
                  ? "bg-[#561269] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              Sedang Ditinjau ({statusStats.sedangDitinjau})
            </button>

            {/* 4. Selesai */}
            <button
              type="button"
              onClick={() => setStatusFilter("SELESAI")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "SELESAI"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              Selesai ({statusStats.selesai})
            </button>
          </div>
        )}
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredPeserta}
        keyExtractor={(item) => String(item.id)}
        emptyMessage={
          isLoading
            ? "Memuat data peserta..."
            : "Belum ada peserta psikotes berbayar yang terdaftar."
        }
      />
    </AdminTableContainer>
  );
}
