/**
 * Helper kalkulasi SLA (Service Level Agreement) batas waktu review psikolog.
 * Standar: Maksimal 3 Hari Kerja (Senin s.d. Sabtu, Minggu Libur) sejak asesmen selesai dikerjakan peserta.
 */

export interface ReviewSlaInfo {
  pengerjaanFormatted: string;
  deadlineDate: Date;
  deadlineFormatted: string;
  daysRemaining: number;
  hoursRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean; // Sisa <= 24 jam kerja
  badgeLabel: string;
  badgeClass: string;
  statusText: string;
}

export const REVIEW_MAX_DAYS = 3;

/**
 * Menambahkan N hari kerja (Senin - Sabtu, Minggu libur) ke tanggal awal.
 */
export function addWorkingDays(startDate: Date, workingDays: number): Date {
  const result = new Date(startDate.getTime());
  let addedDays = 0;

  // Jika tanggal pengerjaan pada hari Minggu (day 0), mulai perhitungan dari hari Senin
  if (result.getDay() === 0) {
    result.setDate(result.getDate() + 1);
  }

  while (addedDays < workingDays) {
    result.setDate(result.getDate() + 1);
    // 0 = Minggu (Libur), 1-6 = Senin s.d. Sabtu (Hari Kerja Empathika)
    if (result.getDay() !== 0) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Menghitung selisih hari kerja (Senin-Sabtu) antara dua tanggal.
 */
export function countWorkingDaysBetween(from: Date, to: Date): number {
  if (to <= from) return 0;
  let count = 0;
  const cur = new Date(from.getTime());
  while (cur < to) {
    cur.setDate(cur.getDate() + 1);
    if (cur.getDay() !== 0) {
      count++;
    }
  }
  return count;
}

/**
 * Menghitung sisa waktu review psikolog (maksimal 3 hari kerja dari tanggal pengerjaan).
 * Hari kerja Empathika: Senin - Sabtu (Minggu libur).
 */
export function calculateReviewSla(tanggalPengerjaan: string | Date | undefined | null): ReviewSlaInfo {
  const rawDate = tanggalPengerjaan ? new Date(tanggalPengerjaan) : new Date();
  const pengerjaanDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;

  // Deadline dihitung 3 hari kerja (Senin-Sabtu, Minggu libur)
  const deadlineDate = addWorkingDays(pengerjaanDate, REVIEW_MAX_DAYS);

  const now = Date.now();
  const diffMs = deadlineDate.getTime() - now;

  const hoursRemaining = Math.round(diffMs / (60 * 60 * 1000));
  const workingDaysRemaining = countWorkingDaysBetween(new Date(now), deadlineDate);
  const isOverdue = diffMs < 0;
  const isUrgent = !isOverdue && (workingDaysRemaining <= 1 || hoursRemaining <= 24);

  const pengerjaanFormatted = pengerjaanDate.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const deadlineFormatted = deadlineDate.toLocaleDateString("id-ID", {
    weekday: "short",
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
    const overdueDays = Math.max(1, countWorkingDaysBetween(deadlineDate, new Date(now)));
    badgeLabel = overdueDays <= 1 ? "Lewat Jam Batas" : `Lewat ${overdueDays} Hari Kerja`;
    badgeClass = "bg-rose-100 text-rose-800 border-rose-200 font-bold";
    statusText = `Telah melewati batas SLA 3 hari kerja sejak ${deadlineFormatted}`;
  } else if (workingDaysRemaining === 0 || hoursRemaining <= 12) {
    badgeLabel = "Hari Ini Batas Akhir!";
    badgeClass = "bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse";
    statusText = `Batas akhir hari ini pukul ${deadlineDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
  } else if (workingDaysRemaining === 1) {
    badgeLabel = "Sisa 1 Hari Kerja";
    badgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
    statusText = `Tersisa 1 hari kerja lagi (Deadline: ${deadlineFormatted})`;
  } else {
    badgeLabel = `Sisa ${workingDaysRemaining} Hari Kerja`;
    badgeClass = "bg-purple-50 text-purple-800 border-purple-200 font-semibold";
    statusText = `Tersisa ${workingDaysRemaining} hari kerja (Deadline: ${deadlineFormatted})`;
  }

  return {
    pengerjaanFormatted,
    deadlineDate,
    deadlineFormatted,
    daysRemaining: workingDaysRemaining,
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
    description: `Proses telaah klinis dan verifikasi laporan resmi oleh Psikolog Empathika membutuhkan waktu maksimal 3 hari kerja (Senin–Sabtu, Minggu libur) sejak tes diselesaikan. Estimasi laporan terbit: paling lambat ${deadlineFull}.`,
  };
}
