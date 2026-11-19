/**
 * Modal Detail Peserta Psikotes (Minimalist & Direct)
 * Sesuai arahan:
 * - Header hanya bertuliskan "Detail Peserta" (tanpa kotak profil avatar, nama, atau badge status)
 * - Bagian 1: Data Peserta (tanpa badge "DEWASA")
 * - Bagian 2: Data Pembeli (tanpa label "Pembeli Berbeda dengan Peserta")
 * - Bagian 3: Hasil Psikotes (hanya tombol download PDF & aksi WA, tanpa teks skor/interpretasi)
 */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Download,
  Phone,
  Clock,
  Loader2,
  User,
  ShoppingBag,
  Send,
  AlertCircle,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { AdminPsikotesPeserta, JudulPsikotesItem } from "../../types/adminPsikotes";
import { formatToIndonesianPhone } from "@/components/shared/checkout/FormDataPeserta";

export interface ModalDetailPesertaProps {
  peserta: AdminPsikotesPeserta | null;
  judulList?: JudulPsikotesItem[];
  onClose: () => void;
  onDownloadPdf: (peserta: AdminPsikotesPeserta) => Promise<void> | void;
}

export default function ModalDetailPeserta({
  peserta,
  onClose,
  onDownloadPdf,
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

  const isMenungguReview =
    peserta.status === "Menunggu Review" ||
    (peserta as any).status_pengerjaan === "MENUNGGU_REVIEW";
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

  // Resolusi data peserta vs data pembeli
  const hasPesertaData = Boolean(peserta.peserta && peserta.peserta.nama_lengkap);

  const namaPembeli = peserta.namaPemesan || peserta.nama;
  const noHpPembeli = peserta.noHpPemesan || peserta.noHp;
  const namaPeserta = peserta.peserta?.nama_lengkap || "";

  // Kode Booking untuk pengerjaan tes
  const kodeBooking = peserta.kodeAkses || "";

  const toWaDigits = (phone: string | null | undefined): string => {
    if (!phone || phone === "—") return "";
    let digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) {
      digits = "62" + digits.slice(1);
    }
    return digits;
  };

  // Deteksi kategori peserta: Anak/Remaja (< 18 tahun atau memiliki data orang tua) vs Dewasa
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

  // Nomor WhatsApp Peserta: Jika peserta anak-anak dan nomornya sama persis dengan nomor orang tua,
  // maka nomor peserta dianggap kosong (karena anak tidak memiliki nomor sendiri dan form bersifat opsional)
  const rawNoHpPeserta = (peserta.peserta as any)?.no_telepon?.trim() || "";
  const noHpPeserta =
    isAnak && rawNoHpPeserta && noHpOrangTua && toWaDigits(rawNoHpPeserta) === toWaDigits(noHpOrangTua)
      ? ""
      : rawNoHpPeserta;

  const waPembeliDigits = toWaDigits(noHpPembeli);
  const waPesertaDigits = toWaDigits(noHpPeserta);
  const waOrangTuaDigits = toWaDigits(noHpOrangTua);

  // --- A. PENGINGAT TES (Belum Mengerjakan) ---
  // Perhitungan Tanggal Transaksi & Batas Akhir Pengerjaan (3 Bulan / 90 Hari)
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

  // Ditujukan kepada pemegang tiket pengerjaan (Pembeli)
  const hasDifferentPhones = Boolean(
    hasPesertaData &&
    waPesertaDigits &&
    waPembeliDigits &&
    waPesertaDigits !== waPembeliDigits
  );

  const waReminderUrlPembeli = waPembeliDigits
    ? `https://wa.me/${waPembeliDigits}?text=${encodeURIComponent(
`Halo Kak ${namaPembeli}!

Kami ingin mengingatkan bahwa akses asesmen psikotes Kakak untuk paket ${peserta.paket} di Empathika telah aktif, tetapi asesmen masih belum diselesaikan.

Sebagai pengingat, masa akses pengerjaan tes berlaku selama 3 bulan sejak tanggal transaksi.
- Tanggal transaksi: ${tanggalTransaksiFormatted}
- Batas akhir pengerjaan: ${batasAkhirFormatted}
Kami menyarankan Kakak untuk segera menyelesaikan asesmen sebelum batas waktu tersebut agar akses tes tidak kedaluwarsa.

Untuk memulai pengerjaan tes, silakan ikuti langkah berikut:
1. Buka website Empathika di https://empathika.id, lalu pilih paket ${peserta.paket}.
2. Masukkan data verifikasi tiket:
   - Kode Booking: ${kodeBooking || "Cek bukti transaksi Anda"}
   - Nomor WhatsApp: ${formatToIndonesianPhone(noHpPembeli)}
3. Klik "Verifikasi & Masuk Tes", lengkapi identitas peserta, dan selesaikan asesmen.
Apabila Kakak mengalami kendala atau memiliki pertanyaan terkait akses tes, silakan hubungi tim Empathika kembali, ya.

Terima kasih! 😊`
      )}`
    : null;

  const waReminderUrlPeserta =
    hasDifferentPhones && waPesertaDigits
      ? `https://wa.me/${waPesertaDigits}?text=${encodeURIComponent(
`Halo Kak ${namaPeserta || namaPembeli}!

Kami ingin mengingatkan bahwa akses asesmen psikotes Kakak untuk paket ${peserta.paket} di Empathika telah aktif, tetapi asesmen masih belum diselesaikan.

Sebagai pengingat, masa akses pengerjaan tes berlaku selama 3 bulan sejak tanggal transaksi.
- Tanggal transaksi: ${tanggalTransaksiFormatted}
- Batas akhir pengerjaan: ${batasAkhirFormatted}
Kami menyarankan Kakak untuk segera menyelesaikan asesmen sebelum batas waktu tersebut agar akses tes tidak kedaluwarsa.

Untuk memulai pengerjaan tes, silakan ikuti langkah berikut:
1. Buka website Empathika di https://empathika.id, lalu pilih paket ${peserta.paket}.
2. Masukkan data verifikasi tiket:
   - Kode Booking: ${kodeBooking || "Cek bukti transaksi Anda"}
   - Nomor WhatsApp: ${formatToIndonesianPhone(noHpPembeli)}
3. Klik "Verifikasi & Masuk Tes", lengkapi identitas peserta, dan selesaikan asesmen.
Apabila Kakak mengalami kendala atau memiliki pertanyaan terkait akses tes, silakan hubungi tim Empathika kembali, ya.

Terima kasih! 😊`
        )}`
      : null;

  // --- B. PENGIRIMAN HASIL TES PDF (Kerahasiaan Medis) ---
  // Prinsip kerahasiaan: Hasil psikotes hanya dikirim ke pihak yang berhak secara klinis:
  // - Peserta Dewasa: Dikirim langsung ke WhatsApp Pribadi Peserta
  // - Peserta Anak/Remaja: Dikirim ke WhatsApp Orang Tua / Wali yang tercatat di form identitas
  const waResultMsgPeserta =
`Halo Kak ${namaPeserta},

Terima kasih telah mempercayakan proses asesmen psikologis kepada Empathika.

Melalui pesan ini, kami lampirkan dokumen hasil asesmen psikologis Kakak untuk dapat dibaca dan dipahami lebih lanjut.

Apabila Kakak memiliki pertanyaan atau ingin mendiskusikan hasil asesmen bersama psikolog kami, jangan ragu untuk menghubungi tim Empathika kembali, ya.

Terima kasih telah menjadi bagian dari Empathika.`;

  const waResultMsgOrangTua =
`Halo Bapak/Ibu ${namaOrangTua || `Wali dari ${namaPeserta}`},

Terima kasih telah mempercayakan proses asesmen psikologis ananda ${namaPeserta} kepada Empathika.

Melalui pesan ini, kami lampirkan dokumen resmi hasil asesmen psikologis ananda untuk dapat dibaca dan dipahami lebih lanjut.

Apabila Bapak/Ibu memiliki pertanyaan atau ingin mendiskusikan hasil asesmen bersama psikolog kami, jangan ragu untuk menghubungi tim Empathika kembali, ya.

Terima kasih telah menjadi bagian dari Empathika.`;

  // URL WhatsApp Pengiriman Hasil
  const targetOrangTuaPhone = waOrangTuaDigits || (isAnak ? waPesertaDigits || waPembeliDigits : "");
  const waResultUrlOrangTua =
    isAnak && targetOrangTuaPhone
      ? `https://wa.me/${targetOrangTuaPhone}?text=${encodeURIComponent(waResultMsgOrangTua)}`
      : null;

  const targetPesertaPhone = waPesertaDigits || waPembeliDigits;
  const waResultUrlPeserta = targetPesertaPhone
    ? `https://wa.me/${targetPesertaPhone}?text=${encodeURIComponent(waResultMsgPeserta)}`
    : null;

  // --- C. STATUS TELAAH & PEMERIKSA (KLAIM / KEEP OLEH PSIKOLOG) ---
  const namaPsikolog = peserta.psikolog?.nama_gelar || peserta.psikolog?.nama || null;
  const noHpPsikolog = peserta.psikolog?.no_telepon || null;
  const waPsikologDigits = toWaDigits(noHpPsikolog);

  // Waktu klaim / keep tiket oleh psikolog
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

  // SLA Standar Penelaahan Psikotes: Maksimal 3 Hari Kerja (72 Jam)
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

  // Pesan WhatsApp Admin ke Psikolog Pemeriksa
  const statusSlaUrgency =
    slaStatus === "OVERDUE"
      ? `telah melewati batas SLA (${Math.abs(remainingHours)} jam terlambat)`
      : slaStatus === "NEAR_DEADLINE"
      ? `mendekati batas waktu (sisa ${remainingHours} jam lagi)`
      : `tersisa sekitar ${Math.ceil(remainingHours / 24)} hari kerja lagi`;

  const waMsgToPsikolog = `Halo Dok / Kak ${namaPsikolog || "Psikolog Empathika"},

Kami dari Admin Empathika ingin menanyakan tindak lanjut hasil asesmen psikotes untuk peserta berikut:
• Nama Peserta: ${namaPeserta || peserta.nama}
• Paket Tes: ${peserta.paket}
• Kode Booking: ${kodeBooking || "—"}
${keepDateFormatted ? `• Waktu Di-keep: ${keepDateFormatted}` : ""}
• Status SLA: ${
    slaStatus === "OVERDUE"
      ? "⚠️ Melebihi Batas Waktu SLA"
      : slaStatus === "NEAR_DEADLINE"
      ? "⏳ Mendekati Batas Waktu SLA"
      : "Dalam Proses Telaah"
  } (${statusSlaUrgency})

Mohon kesediaannya untuk menuntaskan telaah klinis dan menerbitkan laporan resminya melalui portal psikolog ya Dok. Apabila ada kendala atau catatan khusus, silakan kabari tim Admin.

Terima kasih banyak atas kerjasamanya! 🙏`;

  const waPsikologUrl = waPsikologDigits
    ? `https://wa.me/${waPsikologDigits}?text=${encodeURIComponent(waMsgToPsikolog)}`
    : null;

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
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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
        {/* 2. BODY MODAL: Data Peserta, Data Pembeli, & Hasil (Download PDF) */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white text-gray-800 text-xs">

          {/* ───────────────────────────────────────────────────────────── */}
          {/* BAGIAN 1: DATA PESERTA TES                                    */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#561269]" />
              Data Peserta
            </h4>

            {hasPesertaData ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-5 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Nama Peserta</span>
                  <span className="font-semibold text-gray-900 text-sm mt-0.5 block break-words">
                    {namaPeserta}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">WhatsApp Peserta</span>
                  <span className="font-semibold text-emerald-700 text-sm mt-0.5 block font-mono break-all">
                    {noHpPeserta && noHpPeserta !== "—" ? formatToIndonesianPhone(noHpPeserta) : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Usia / Gender</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block break-words">
                    {[usiaPeserta, genderPeserta].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>

                {ttlPeserta && (
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Tempat, Tgl Lahir</span>
                    <span className="font-medium text-gray-800 text-sm mt-0.5 block break-words">
                      {ttlPeserta}
                    </span>
                  </div>
                )}

                {profesiPeserta && (
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Pendidikan / Profesi</span>
                    <span className="font-medium text-gray-800 text-sm mt-0.5 block break-words">
                      {profesiPeserta}
                    </span>
                  </div>
                )}

                {peserta.peserta?.nama_orang_tua && (
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Orang Tua / Wali</span>
                    <span className="font-medium text-gray-800 text-sm mt-0.5 block break-words">
                      {peserta.peserta.nama_orang_tua}{" "}
                      {peserta.peserta.no_telepon_orang_tua
                        ? `(${formatToIndonesianPhone(peserta.peserta.no_telepon_orang_tua)})`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50/70 border border-dashed border-gray-200 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block text-xs">
                    Identitas Peserta Belum Diisi
                  </span>
                  <span className="text-[11px] text-gray-500 block leading-relaxed mt-0.5">
                    Tiket ini baru dibeli dan tes belum dimulai. Data identitas peserta akan muncul secara otomatis setelah peserta memasukkan kode booking dan mengisi formulir awal tes.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* BAGIAN 2: DATA PEMBELI / PEMESAN TIKET                        */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="space-y-2.5 pt-1 border-t border-gray-100">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#561269]" />
              Data Pembeli
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-3.5 gap-x-5 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[10px] font-medium">Nama Pembeli</span>
                <span className="font-semibold text-gray-900 text-sm mt-0.5 block break-words">
                  {namaPembeli}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] font-medium">WhatsApp Pembeli</span>
                <span className="font-semibold text-emerald-700 text-sm mt-0.5 block font-mono break-all">
                  {formatToIndonesianPhone(noHpPembeli)}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] font-medium">Kode Booking</span>
                <span className="font-semibold text-purple-900 text-sm mt-0.5 block font-mono select-all">
                  {kodeBooking || "—"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] font-medium">Paket Dibeli</span>
                <span className="font-medium text-gray-800 text-sm mt-0.5 block break-words leading-snug">
                  {peserta.paket}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] font-medium">Tanggal Transaksi</span>
                <span className="font-medium text-gray-700 text-sm mt-0.5 block break-words">
                  {peserta.tanggal}
                </span>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* BAGIAN 3: STATUS TELAAH & PEMERIKSA (KLAIM / KEEP)            */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="space-y-2.5 pt-1 border-t border-gray-100">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#561269]" />
              Status Telaah &amp; Pemeriksa
            </h4>

            {isMenungguReview ? (
              Boolean(peserta.id_psikolog || peserta.psikolog) ? (
                /* Kasus A: Sedang di-keep oleh psikolog - CLEAN DESIGN */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-3.5 gap-x-5 p-4 rounded-xl bg-gray-50/70 border border-gray-100 items-start">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Status Keep</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-purple-100 text-[#561269]">
                      Sedang Ditelaah
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Psikolog Pemeriksa</span>
                    <span className="font-semibold text-gray-900 text-sm mt-0.5 block break-words">
                      {namaPsikolog || "Psikolog Empathika"}
                    </span>
                    <span className="text-[11px] text-purple-700 font-medium">
                      {peserta.psikolog?.kategori || "Reviewer Psikotes"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Waktu Di-keep</span>
                    <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                      {keepDateFormatted || "—"}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {elapsedHours > 0 ? `Berjalan ${elapsedHours} jam` : "Baru saja"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Batas Waktu (SLA)</span>
                    <div className="mt-1">
                      {slaStatus === "OVERDUE" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Melebihi SLA ({Math.abs(remainingHours)} jam)
                        </span>
                      ) : slaStatus === "NEAR_DEADLINE" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          Mendekati Batas ({remainingHours} jam)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          Normal (~{Math.ceil(remainingHours / 24)} hari)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Aksi Admin</span>
                    <div className="mt-1">
                      {waPsikologUrl ? (
                        <a
                          href={waPsikologUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-medium transition shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
                          title="Hubungi psikolog pemeriksa via WhatsApp"
                        >
                          <Phone className="w-3 h-3" />
                          Hubungi (WA)
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-xs">WA belum tercatat</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Kasus B: Belum di-keep (Kolam Antrean Bersama) - CLEAN DESIGN */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-5 p-4 rounded-xl bg-gray-50/70 border border-gray-100 items-start">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Status Antrean</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Belum Di-keep (Kolam)
                    </span>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-gray-400 block text-[10px] font-medium">Keterangan</span>
                    <span className="font-medium text-gray-700 text-xs mt-0.5 block leading-relaxed">
                      Tes telah selesai dikerjakan dan menunggu diambil oleh salah satu psikolog penelaah berwenang di portal psikolog.
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Waktu Selesai Tes</span>
                    <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                      {keepDateFormatted || peserta.tanggal || "—"}
                    </span>
                  </div>
                </div>
              )
            ) : isCompleted ? (
              /* Kasus C: Selesai Ditelaah & Diterbitkan - CLEAN DESIGN */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-5 p-4 rounded-xl bg-gray-50/70 border border-gray-100 items-start">
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Status Telaah</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Selesai Diterbitkan
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Psikolog Pemeriksa</span>
                  <span className="font-semibold text-gray-900 text-sm mt-0.5 block break-words">
                    {namaPsikolog || "Psikolog Empathika"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Waktu Terbit</span>
                  <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
                    {keepDateFormatted || peserta.tanggal || "—"}
                  </span>
                </div>

                {waPsikologUrl ? (
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Kontak Pemeriksa</span>
                    <div className="mt-1">
                      <a
                        href={waPsikologUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* Kasus D: Belum Mulai Mengerjakan - CLEAN */
              <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2 text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs">
                  Peserta belum menyelesaikan tes sehingga belum masuk ke dalam antrean telaah psikolog.
                </span>
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* BAGIAN 4: HASIL PSIKOTES (Hanya Download PDF & Aksi WA)       */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="space-y-2.5 pt-1 border-t border-gray-100">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#561269]" />
              Hasil Psikotes
            </h4>

            {isMenungguReview ? (
              <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#561269] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block text-xs">
                      Laporan PDF Belum Terbit
                    </span>
                    <span className="text-[11px] text-gray-500 font-light block">
                      Laporan resmi akan otomatis aktif setelah verifikasi telaah klinis selesai.
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-[#561269] border border-purple-200/60 shrink-0">
                  Menunggu Review
                </span>
              </div>
            ) : isCompleted ? (
              <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-[#561269] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-xs block">
                      Laporan Hasil Asesmen
                    </span>
                    <span className="text-[11px] text-gray-500 font-light block">
                      Format PDF resmi
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadClick}
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-amber-950 block text-xs">
                      Peserta Belum Mengerjakan Tes
                    </span>
                    <span className="text-[11px] text-amber-800/80 font-light">
                      Laporan PDF akan tersedia setelah tes diselesaikan.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {waReminderUrlPembeli && (
                    <a
                      href={waReminderUrlPembeli}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition shrink-0 cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {hasDifferentPhones ? "Ingatkan Pembeli (WA)" : "Ingatkan via WA"}
                    </a>
                  )}

                  {hasDifferentPhones && waReminderUrlPeserta && (
                    <a
                      href={waReminderUrlPeserta}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-semibold transition shrink-0 cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Ingatkan Peserta (WA)
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Global Error Notice if PDF creation fails */}
            {pdfError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pdfError}
                </span>
                <button
                  type="button"
                  onClick={() => setPdfError(null)}
                  className="text-red-500 hover:text-red-800 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. FOOTER MODAL: Aksi WhatsApp & Tutup                            */}
        {/* ================================================================= */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {isCompleted && (
              <>
                {isAnak ? (
                  <>
                    {waResultUrlOrangTua && (
                      <a
                        href={waResultUrlOrangTua}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Kirim Hasil ke Orang Tua (WA)
                      </a>
                    )}

                    {waPesertaDigits && waPesertaDigits !== waOrangTuaDigits && waResultUrlPeserta && (
                      <a
                        href={waResultUrlPeserta}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 hover:underline cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Kirim Hasil ke Peserta (WA)
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    {waResultUrlPeserta && (
                      <a
                        href={waResultUrlPeserta}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Kirim Hasil ke Peserta (WA)
                      </a>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition active:scale-95 cursor-pointer ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
