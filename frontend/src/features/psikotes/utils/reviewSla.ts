/**
 * Helper kalkulasi SLA (Service Level Agreement) batas waktu review psikolog.
 * Standar: Maksimal 3 Hari sejak asesmen selesai dikerjakan peserta.
 */

export interface ReviewSlaInfo {
  pengerjaanFormatted: string;
  deadlineDate: Date;
  deadlineFormatted: string;
  daysRemaining: number;
  hoursRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean; // Sisa <= 24 jam
  badgeLabel: string;
  badgeClass: string;
  statusText: string;
}

export const REVIEW_MAX_DAYS = 3;

/**
 * Menghitung sisa waktu review psikolog (maksimal 3 hari dari tanggal pengerjaan).
 */
export function calculateReviewSla(tanggalPengerjaan: string | Date | undefined | null): ReviewSlaInfo {
  const rawDate = tanggalPengerjaan ? new Date(tanggalPengerjaan) : new Date();
  const pengerjaanDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
  const pengerjaanTime = pengerjaanDate.getTime();
  const SLA_MS = REVIEW_MAX_DAYS * 24 * 60 * 60 * 1000;
  const deadlineTime = pengerjaanTime + SLA_MS;
  const deadlineDate = new Date(deadlineTime);

  const now = Date.now();
  const diffMs = deadlineTime - now;

  const hoursRemaining = Math.round(diffMs / (60 * 60 * 1000));
  const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  const isOverdue = diffMs < 0;
  const isUrgent = !isOverdue && daysRemaining <= 1;

  const pengerjaanFormatted = pengerjaanDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const deadlineFormatted = deadlineDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let badgeLabel = "";
  let badgeClass = "";
  let statusText = "";

  if (isOverdue) {
    const overdueDays = Math.max(1, Math.abs(Math.floor(diffMs / (24 * 60 * 60 * 1000))));
    badgeLabel = overdueDays === 0 ? "Lewat Jam Batas" : `Lewat ${overdueDays} Hari`;
    badgeClass = "bg-rose-100 text-rose-800 border-rose-200 font-bold";
    statusText = `Telah melewati batas SLA 3 hari sejak ${deadlineFormatted}`;
  } else if (daysRemaining === 0 || hoursRemaining <= 12) {
    badgeLabel = "Hari Ini Batas Akhir!";
    badgeClass = "bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse";
    statusText = `Batas akhir hari ini pukul ${deadlineDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
  } else if (daysRemaining === 1) {
    badgeLabel = "Sisa 1 Hari";
    badgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
    statusText = `Tersisa 1 hari lagi (Deadline: ${deadlineFormatted})`;
  } else {
    badgeLabel = `Sisa ${daysRemaining} Hari`;
    badgeClass = "bg-purple-50 text-purple-800 border-purple-200 font-semibold";
    statusText = `Tersisa ${daysRemaining} hari (Deadline: ${deadlineFormatted})`;
  }

  return {
    pengerjaanFormatted,
    deadlineDate,
    deadlineFormatted,
    daysRemaining,
    hoursRemaining,
    isOverdue,
    isUrgent,
    badgeLabel,
    badgeClass,
    statusText,
  };
}

/**
 * Format teks estimasi batas review untuk klien di halaman hasil / pengerjaan.
 */
export function getEstimatedReviewClientText(tanggalPengerjaan: string | Date | undefined | null): {
  deadlineFormatted: string;
  description: string;
} {
  const sla = calculateReviewSla(tanggalPengerjaan);
  const deadlineFull = sla.deadlineDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    deadlineFormatted: deadlineFull,
    description: `Proses telaah klinis dan verifikasi laporan resmi oleh Psikolog Empathika membutuhkan waktu maksimal 3 hari kerja sejak tes diselesaikan. Estimasi laporan terbit: paling lambat ${deadlineFull}.`,
  };
}

