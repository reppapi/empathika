/** Utility generate & download laporan resmi psikotes PDF di browser beserta tipe data dokumen PDF. */
import React from "react";

export interface LaporanPsikotesSubscale {
  name: string;
  score: number;
  maxScore: number;
  percentage?: number;
  grade?: string;
  deskripsi?: string;
  colorHex?: string;
}

export interface LaporanPsikotesPdfData {
  noDokumen: string;
  judulTes: string;
  tanggalAsesmen: string;
  masaBerlaku?: string;
  peserta: {
    nama: string;
    noHp?: string | null;
    usia?: string | number | null;
    jenisKelamin?: string | null;
    kategori?: string | null;
    tempatLahir?: string | null;
    tanggalLahir?: string | null;
    pendidikan?: string | null;
    pekerjaan?: string | null;
    statusPernikahan?: string | null;
    namaOrangTua?: string | null;
    noTeleponOrangTua?: string | null;
  };
  hasilUtama: {
    prefix?: string | null;
    judul: string;
    totalSkor?: number | null;
    deskripsi: string;
  };
  subscales?: LaporanPsikotesSubscale[];
  subscalesTitle?: string;
  subscalesMaxNote?: string;
  kekuatanUtama?: string[];
  judulKekuatan?: string;
  blindspots?: string[];
  judulBlindspots?: string;
  lingkunganOptimal?: string[];
  judulLingkungan?: string;
  saranList?: Array<{ title?: string; desc: string }>;
}

/**
 * Mengunduh laporan hasil psikotes resmi dalam format Vector PDF menggunakan @react-pdf/renderer.
 * Di-load secara dinamis agar aman terhadap SSR Next.js dan efisien di sisi client.
 */
export async function downloadLaporanPsikotesPdf(
  data: LaporanPsikotesPdfData,
  customFileName?: string
): Promise<void> {
  const [{ pdf }, { LaporanPsikotesDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/pdf/LaporanPsikotesDocument"),
  ]);

  const docElement = React.createElement(LaporanPsikotesDocument, { data });
  const blob = await pdf(docElement as any).toBlob();

  const safeName = (data.peserta.nama || "Peserta")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const fileName =
    customFileName || `Laporan-Resmi-Psikotes-${safeName || "Peserta"}-Empathika.pdf`;

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function tailwindBarToHex(barClass?: string): string {
  if (!barClass) return "#561269";
  if (barClass.includes("blue")) return "#3B82F6";
  if (barClass.includes("amber") || barClass.includes("yellow")) return "#F59E0B";
  if (barClass.includes("rose") || barClass.includes("red")) return "#F43F5E";
  if (barClass.includes("emerald") || barClass.includes("green")) return "#10B981";
  return "#561269";
}

