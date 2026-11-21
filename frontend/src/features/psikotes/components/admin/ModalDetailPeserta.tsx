/**
 * Modal Detail Peserta Psikotes (Executive Clean & Professional)
 * Desain modern, rapi, minimalis, dan bebas dari tumpukan kotak/printilan yang berantakan.
 */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Phone,
  Loader2,
  User,
  ShoppingBag,
  Send,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import type { AdminPsikotesPeserta, JudulPsikotesItem } from "../../types/adminPsikotes";
import { formatToIndonesianPhone } from "@/components/shared/checkout/FormDataPeserta";

export interface ModalDetailPesertaProps {
  peserta: AdminPsikotesPeserta | null;
  judulList?: JudulPsikotesItem[];
  onClose: () => void;
  onDownloadPdf: (peserta: AdminPsikotesPeserta) => Promise<void> | void;
  isBiroContext?: boolean;
}

export default function ModalDetailPeserta({
  peserta,
  onClose,
  onDownloadPdf,
  isBiroContext = false,
}: ModalDetailPesertaProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPdfError(null);
    setIsDownloading(false);
  }, [peserta?.id]);

  if (!peserta || !mounted) return null;

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
      (peserta as any).status_pengerjaan === "MENUNGGU_REVIEW"
    );
  const isCompleted =
    !isMenungguReview &&
    (peserta.status === "Selesai" || Boolean(peserta.hasil));

  const handleDownloadClick = async () => {
    if (isDownloading) return;
    setPdfError(null);
    setIsDownloading(true);
    try {
      await onDownloadPdf(peserta);
    } catch (err) {
      console.error("[Admin PDF Download Error]", err);
      setPdfError("Gagal membuat file PDF laporan. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper nomor WhatsApp
  const toWaDigits = (phone: string | null | undefined): string => {
    if (!phone || phone === "—") return "";
    let digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) {
      digits = "62" + digits.slice(1);
    }
    return digits;
  };

  // Resolusi data peserta vs pembeli
  const hasPesertaData = Boolean(peserta.peserta && peserta.peserta.nama_lengkap);
  const namaPembeli = peserta.namaPemesan || peserta.nama;
  const noHpPembeli = peserta.noHpPemesan || peserta.noHp;
  const namaPeserta = peserta.peserta?.nama_lengkap || peserta.nama;
  const kodeBooking = peserta.kodeAkses || "";

  // Deteksi kategori peserta: Anak/Remaja (< 18 tahun atau memiliki data orang tua)
  const usiaNum =
    typeof peserta.peserta?.usia === "number"
      ? peserta.peserta.usia
      : peserta.usia
      ? Number(peserta.usia)
      : null;
  const isAnak =
    (usiaNum !== null && usiaNum < 18) ||
    peserta.peserta?.kategori_peserta === "ANAK" ||
    peserta.peserta?.kategori_peserta === "REMAJA" ||
    Boolean(peserta.peserta?.nama_orang_tua);

  const namaOrangTua = peserta.peserta?.nama_orang_tua?.trim() || "";
  const noHpOrangTua = peserta.peserta?.no_telepon_orang_tua?.trim() || "";

  const rawNoHpPeserta = (peserta.peserta as any)?.no_telepon?.trim() || "";
  const noHpPeserta =
    isAnak && rawNoHpPeserta && noHpOrangTua && toWaDigits(rawNoHpPeserta) === toWaDigits(noHpOrangTua)
      ? ""
      : rawNoHpPeserta;

  const waPembeliDigits = toWaDigits(noHpPembeli);
  const waPesertaDigits = toWaDigits(noHpPeserta);
  const waOrangTuaDigits = toWaDigits(noHpOrangTua);

  // Tanggal transaksi & batas akhir
  const parseDateSafe = (val: string | null | undefined): Date => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const trxDate = parseDateSafe(peserta.rawTanggal || peserta.tanggal);
  const tanggalTransaksiFormatted = trxDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const batasAkhirDate = new Date(trxDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  const batasAkhirFormatted = batasAkhirDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Template Pesan WA Reminder
  const waReminderUrlPembeli = waPembeliDigits
    ? `https://wa.me/${waPembeliDigits}?text=${encodeURIComponent(
`Halo Kak ${namaPembeli}!

Kami ingin mengingatkan bahwa akses asesmen psikotes Kakak untuk paket ${peserta.paket} di Empathika telah aktif, namun belum diselesaikan.

- Tanggal transaksi: ${tanggalTransaksiFormatted}
- Batas akhir pengerjaan: ${batasAkhirFormatted}
- Kode Booking: ${kodeBooking || "Cek bukti transaksi"}
- Nomor WhatsApp: ${formatToIndonesianPhone(noHpPembeli)}

Silakan buka https://empathika.id untuk menyelesaikan asesmen Kakak ya. Terima kasih! 😊`
      )}`
    : null;

  // Template Pesan WA Hasil PDF
  const targetOrangTuaPhone = waOrangTuaDigits || (isAnak ? waPesertaDigits || waPembeliDigits : "");
  const waResultUrlOrangTua =
    isAnak && targetOrangTuaPhone
      ? `https://wa.me/${targetOrangTuaPhone}?text=${encodeURIComponent(
`Halo Bapak/Ibu ${namaOrangTua || `Wali dari ${namaPeserta}`},

Terima kasih telah mempercayakan proses asesmen psikologis ananda ${namaPeserta} kepada Empathika.
Melalui pesan ini, kami sampaikan dokumen resmi hasil asesmen psikologis ananda.

Apabila ingin mendiskusikan hasil asesmen bersama psikolog kami, silakan hubungi tim Empathika kembali. Terima kasih! 🙏`
        )}`
      : null;

  const targetPesertaPhone = waPesertaDigits || waPembeliDigits;
  const waResultUrlPeserta = targetPesertaPhone
    ? `https://wa.me/${targetPesertaPhone}?text=${encodeURIComponent(
`Halo Kak ${namaPeserta},

Terima kasih telah mempercayakan proses asesmen psikologis kepada Empathika.
Melalui pesan ini, kami sampaikan dokumen resmi hasil asesmen psikologis Kakak.

Apabila ingin mendiskusikan hasil asesmen bersama psikolog kami, silakan hubungi tim Empathika kembali. Terima kasih! 🙏`
        )}`
      : null;

  // Status Telaah & Psikolog
  const namaPsikolog = peserta.psikolog?.nama_gelar || peserta.psikolog?.nama || null;
  const noHpPsikolog = peserta.psikolog?.no_telepon || null;
  const waPsikologDigits = toWaDigits(noHpPsikolog);

  const keepDate = peserta.claimed_at
    ? new Date(peserta.claimed_at)
    : peserta.hasil?.tanggal_selesai
    ? new Date(peserta.hasil.tanggal_selesai)
    : null;

  const keepDateFormatted = keepDate
    ? keepDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // SLA 72 Jam (3 Hari Kerja)
  const SLA_HOURS = 72;
  let slaStatus: "ON_TIME" | "NEAR_DEADLINE" | "OVERDUE" = "ON_TIME";
  let elapsedHours = 0;
  let remainingHours = SLA_HOURS;

  if (keepDate) {
    const elapsedMs = Math.max(0, Date.now() - keepDate.getTime());
    elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    remainingHours = SLA_HOURS - elapsedHours;

    if (remainingHours <= 0) {
      slaStatus = "OVERDUE";
    } else if (remainingHours <= 24) {
      slaStatus = "NEAR_DEADLINE";
    } else {
      slaStatus = "ON_TIME";
    }
  }

  // Perhitungan batas telaah psikolog (3 hari kerja: Senin s.d. Sabtu, Minggu libur)
  const calculateDeadlineDate = (startDate: Date | null): Date | null => {
    if (!startDate) return null;
    const result = new Date(startDate.getTime());
    let added = 0;
    if (result.getDay() === 0) {
      result.setDate(result.getDate() + 1);
    }
    while (added < 3) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0) {
        added++;
      }
    }
    return result;
  };

  const deadlineDate = keepDate ? calculateDeadlineDate(keepDate) : null;
  const deadlineFormatted = deadlineDate
    ? deadlineDate.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const statusSlaUrgency =
    slaStatus === "OVERDUE"
      ? `telah melewati batas SLA (${Math.abs(remainingHours)} jam terlambat)`
      : slaStatus === "NEAR_DEADLINE"
      ? `sisa waktu ${remainingHours} jam lagi (Batas: ${deadlineFormatted || "3 hari kerja"})`
      : `sisa waktu ${Math.ceil(remainingHours / 24)} hari (Batas: ${deadlineFormatted || "3 hari kerja"})`;

  const waMsgToPsikolog = `Halo Dok / Kak ${namaPsikolog || "Psikolog Empathika"},

Kami dari Admin Empathika ingin menanyakan tindak lanjut hasil asesmen psikotes untuk peserta:
• Nama: ${namaPeserta}
• Paket: ${peserta.paket}
• Kode Booking: ${kodeBooking || "—"}
${keepDateFormatted ? `• Waktu Diambil: ${keepDateFormatted}` : ""}
${deadlineFormatted ? `• Batas Telaah: ${deadlineFormatted}` : ""}
• Status SLA: ${statusSlaUrgency}

Mohon kesediaannya untuk menuntaskan telaah dan menerbitkan laporan resminya via portal psikolog ya Dok. Terima kasih banyak! 🙏`;

  const waPsikologUrl = waPsikologDigits
    ? `https://wa.me/${waPsikologDigits}?text=${encodeURIComponent(waMsgToPsikolog)}`
    : `https://wa.me/?text=${encodeURIComponent(waMsgToPsikolog)}`;

  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/psikolog-web/review-asesmen` : "https://empathika.id/psikolog-web/review-asesmen";
  const waBroadcastUrlTimPsikolog = `https://wa.me/?text=${encodeURIComponent(
`🔔 *ASESMEN KLINIS BARU MEMBUTUHKAN TELAAH*

Halo Rekan Tim Psikolog Empathika,
Terdapat asesmen klinis yang baru selesai dikerjakan peserta dan membutuhkan telaah resmi:

• *Paket:* ${peserta.paket}
• *Kode Tiket:* ${kodeBooking || peserta.id}
• *Peserta:* ${namaPeserta}
• *Batas Waktu SLA:* ${deadlineFormatted || "3 Hari Kerja"}

Silakan login ke portal psikolog untuk mengklaim dan menelaah tiket ini:
👉 ${portalUrl}

Terima kasih atas dedikasi dan profesionalitas rekan-rekan! 🙏`
  )}`;

  const usiaPeserta = peserta.peserta?.usia ? `${peserta.peserta.usia} Tahun` : null;
  const genderPeserta = peserta.peserta?.jenis_kelamin || null;
  const tglLahirPeserta = peserta.peserta?.tanggal_lahir
    ? new Date(peserta.peserta.tanggal_lahir).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const ttlPeserta = [peserta.peserta?.tempat_lahir, tglLahirPeserta].filter(Boolean).join(", ");
  const profesiPeserta = [peserta.peserta?.pendidikan, peserta.peserta?.pekerjaan]
    .filter(Boolean)
    .join(" · ");

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-all duration-300 font-poppins"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* 1. HEADER MODAL: Hanya tulisan "Detail Peserta"                   */}
        {/* ================================================================= */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h3 className="font-bold text-base text-gray-900 leading-tight">
            Detail Peserta
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. BODY MODAL: Clean, Streamlined, No Visual Clutter              */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white text-gray-800 text-xs">

          {/* ───────────────────────────────────────────────────────────── */}
          {/* A. STATUS TELAAH & REVIEWER (HERO BANNER RINGKAS & KONSISTEN) */}
          {/* ───────────────────────────────────────────────────────────── */}
          {isMenungguReview ? (
            Boolean(peserta.id_psikolog || peserta.psikolog) ? (
              /* Sudah di-keep oleh psikolog */
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700">
                      Psikolog Pemeriksa
                    </span>
                    {slaStatus === "OVERDUE" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        <AlertTriangle className="w-3 h-3" />
                        Terlambat ({Math.abs(remainingHours)}j)
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-gray-900 text-sm">
                    {namaPsikolog || "Psikolog Empathika"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Diambil pada {keepDateFormatted || "—"}{deadlineFormatted ? ` • Batas telaah: ${deadlineFormatted}` : ""}
                  </p>
                </div>

                {!isBiroContext && (
                  <div className="flex items-center gap-2">
                    {waPsikologUrl && (
                      <a
                        href={waPsikologUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                        title="Hubungi psikolog pemeriksa via WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Hubungi Psikolog
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Menunggu di-keep (Kolam antrean) */
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
                    Status Antrean
                  </span>
                  <p className="font-semibold text-gray-900 text-sm">
                    Kolam Antrean Bersama
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Selesai tes {keepDateFormatted || peserta.tanggal} • Menunggu diambil oleh psikolog penelaah
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isBiroContext && (
                    <a
                      href={waBroadcastUrlTimPsikolog}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                      title="Kirim pemberitahuan ke grup WhatsApp psikolog"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Broadcast WA Tim
                    </a>
                  )}
                </div>
              </div>
            )
          ) : isCompleted && isNeedReview ? (
            /* Sudah Selesai (Hanya untuk Asesmen Klinis yang Ditelaah Psikolog) */
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                  Laporan Resmi Diterbitkan
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  Ditelaah oleh: <span className="text-emerald-950 font-bold">{namaPsikolog || "Psikolog Empathika"}</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Selesai telaah {peserta.hasil?.tanggal_review ? new Date(peserta.hasil.tanggal_review).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : keepDateFormatted || peserta.tanggal} • Dokumen resmi terbit
                </p>
              </div>

              {!isBiroContext && (
                <div className="flex items-center gap-2">
                  {waPsikologUrl && (
                    <a
                      href={waPsikologUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                      title="Hubungi psikolog pemeriksa via WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      WA Pemeriksa
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* B. INFORMASI PESERTA & PEMESANAN (2 KOLOM MINIMALIS & RAPI)   */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kolom 1: Data Diri Peserta */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <User className="w-3.5 h-3.5 text-[#561269]" />
                <span className="font-bold text-[11px] uppercase tracking-wider text-gray-600">
                  Identitas Peserta
                </span>
              </div>

              {hasPesertaData ? (
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-400">Nama Peserta</span>
                    <span className="font-semibold text-gray-900 text-right break-words">
                      {namaPeserta}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-400">WhatsApp</span>
                    <span className="font-medium text-emerald-700 font-mono text-right">
                      {noHpPeserta && noHpPeserta !== "—" ? formatToIndonesianPhone(noHpPeserta) : "—"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-400">Usia &amp; Gender</span>
                    <span className="font-medium text-gray-800 text-right">
                      {[usiaPeserta, genderPeserta].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </div>

                  {ttlPeserta && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-gray-400">Tempat, Tgl Lahir</span>
                      <span className="font-medium text-gray-800 text-right">
                        {ttlPeserta}
                      </span>
                    </div>
                  )}

                  {profesiPeserta && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-gray-400">Profesi / Edukasi</span>
                      <span className="font-medium text-gray-800 text-right">
                        {profesiPeserta}
                      </span>
                    </div>
                  )}

                  {peserta.peserta?.nama_orang_tua && (
                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-gray-100">
                      <span className="text-gray-400">Orang Tua / Wali</span>
                      <span className="font-medium text-gray-800 text-right">
                        {peserta.peserta.nama_orang_tua}{" "}
                        {peserta.peserta.no_telepon_orang_tua
                          ? `(${formatToIndonesianPhone(peserta.peserta.no_telepon_orang_tua)})`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 italic text-xs py-2">
                  Peserta belum memulai tes / belum mengisi data identitas.
                </p>
              )}
            </div>

            {/* Kolom 2: Detail Transaksi & Pemesan */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <ShoppingBag className="w-3.5 h-3.5 text-[#561269]" />
                <span className="font-bold text-[11px] uppercase tracking-wider text-gray-600">
                  Informasi Pembelian
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-400">Paket Tes</span>
                  <span className="font-semibold text-gray-900 text-right break-words max-w-[200px]">
                    {peserta.paket}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-400">Nama Pembeli</span>
                  <span className="font-medium text-gray-900 text-right">
                    {namaPembeli}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-400">WhatsApp Pembeli</span>
                  <span className="font-medium text-emerald-700 font-mono text-right">
                    {formatToIndonesianPhone(noHpPembeli)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-400">Kode Booking</span>
                  <span className="font-mono font-semibold text-purple-900 text-right select-all">
                    {kodeBooking || "—"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-400">Tgl Transaksi</span>
                  <span className="font-medium text-gray-800 text-right">
                    {peserta.tanggal}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 pt-1 border-t border-gray-100">
                  <span className="text-gray-400">Masa Berlaku Tes</span>
                  <span className="text-gray-600 text-right">
                    s/d {batasAkhirFormatted}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-400">Asal Biro</span>
                  <span className="font-semibold text-gray-800 text-right break-words max-w-[200px]">
                    {peserta.namaBiro || (peserta as any).nama_biro || "Empathika (Pusat)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* C. AKSI LAPORAN RESMI & DOKUMEN (CLEAN ACTION BAR)             */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-900 text-xs">
                Dokumen Laporan Hasil Psikotes
              </p>
              <p className="text-[11px] text-gray-500">
                {isCompleted
                  ? "Laporan resmi PDF sudah diverifikasi dan siap diunduh atau dikirimkan ke peserta."
                  : isMenungguReview
                  ? "Laporan PDF akan otomatis aktif setelah psikolog menuntaskan telaah."
                  : "Dokumen akan tersedia secara otomatis setelah peserta menyelesaikan tes."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isCompleted ? (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Membuat PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </>
                    )}
                  </button>

                  {/* Tombol Kirim WA Hasil */}
                  {isAnak ? (
                    waResultUrlOrangTua && (
                      <a
                        href={waResultUrlOrangTua}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Kirim ke Orang Tua
                      </a>
                    )
                  ) : (
                    waResultUrlPeserta && (
                      <a
                        href={waResultUrlPeserta}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Kirim ke Peserta
                      </a>
                    )
                  )}
                </>
              ) : !isBiroContext && isMenungguReview ? (
                /* Menunggu Review (Hanya untuk Admin Utama Empathika) */
                namaPsikolog ? (
                  <a
                    href={waPsikologUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Ingatkan Psikolog (WA)
                  </a>
                ) : (
                  <a
                    href={waBroadcastUrlTimPsikolog}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Broadcast ke WA Tim Psikolog
                  </a>
                )
              ) : (
                /* Belum Mulai Tes */
                waReminderUrlPembeli && (
                  <a
                    href={waReminderUrlPembeli}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Ingatkan Peserta (WA)
                  </a>
                )
              )}
            </div>
          </div>

          {/* Alert Error jika download gagal */}
          {pdfError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {pdfError}
              </span>
              <button
                type="button"
                onClick={() => setPdfError(null)}
                className="text-rose-500 hover:text-rose-800 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 3. FOOTER MODAL: Bersih, Cuma Tombol Tutup                        */}
        {/* ================================================================= */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition active:scale-95 cursor-pointer shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
