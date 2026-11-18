/** Template layout dokumen Vector PDF laporan resmi psikotes Empathika menggunakan @react-pdf/renderer. */
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { LaporanPsikotesPdfData } from "../../utils/downloadLaporanPsikotesPdf";

const BRAND_PURPLE = "#561269";
const BRAND_PURPLE_LIGHT = "#FAF8FB";
const BRAND_PURPLE_BORDER = "#E9D5FF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#4B5563";
const TEXT_LIGHT = "#6B7280";
const BORDER_GRAY = "#E5E7EB";
const BG_GRAY = "#F9FAFB";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: TEXT_DARK,
    paddingTop: 32,
    paddingBottom: 52,
    paddingHorizontal: 34,
    backgroundColor: "#FFFFFF",
  },
  // Header Kop Surat
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: BRAND_PURPLE,
    paddingBottom: 12,
    marginBottom: 14,
  },
  brandTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: BRAND_PURPLE,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 8.5,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  brandContact: {
    fontSize: 8,
    color: TEXT_LIGHT,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    maxWidth: 240,
  },
  headerBadge: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: BRAND_PURPLE,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerTestName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: TEXT_DARK,
    marginTop: 2,
    textAlign: "right",
  },
  headerDocNo: {
    fontSize: 8,
    color: TEXT_LIGHT,
    marginTop: 3,
  },
  headerDocNoVal: {
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
  },

  // Generic Card
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 7,
    marginBottom: 9,
  },
  cardTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: TEXT_DARK,
  },
  cardSubtitle: {
    fontSize: 8,
    color: TEXT_LIGHT,
    marginTop: 1,
  },
  pillRow: {
    flexDirection: "row",
    gap: 6,
  },
  pillPurple: {
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER,
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  pillPurpleText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: BRAND_PURPLE,
  },
  pillGreen: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  pillGreenText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#047857",
  },

  // Metadata Grid
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaBox: {
    width: "48.8%",
    backgroundColor: BG_GRAY,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: TEXT_LIGHT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaVal: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: TEXT_DARK,
  },
  metaValGreen: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#047857",
  },

  // Hero Result Card
  heroCard: {
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_PURPLE,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  heroPrefix: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: TEXT_LIGHT,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: BRAND_PURPLE,
    textAlign: "center",
    marginBottom: 4,
  },
  heroScorePill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER,
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  heroScoreText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: BRAND_PURPLE,
  },
  heroDesc: {
    fontSize: 9.5,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 1.45,
  },

  // Subscales
  subscaleItem: {
    backgroundColor: BG_GRAY,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 6,
    padding: 9,
    marginBottom: 7,
  },
  subscaleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  subscaleNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subscaleDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  subscaleName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: TEXT_DARK,
  },
  subscaleScore: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: TEXT_DARK,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  subscaleDesc: {
    fontSize: 8.5,
    color: TEXT_MUTED,
    lineHeight: 1.4,
  },

  // Narrative Section
  bodyText: {
    fontSize: 9.5,
    color: TEXT_MUTED,
    lineHeight: 1.5,
  },

  // 2-Column Strengths & Blindspots
  twoCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  colHalf: {
    width: "48.8%",
  },
  colFull: {
    width: "100%",
  },
  boxGreen: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 6,
    padding: 10,
  },
  boxRose: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 6,
    padding: 10,
  },
  boxAmber: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 6,
    padding: 10,
  },
  boxTitleGreen: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#065F46",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  boxTitleRose: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#9F1239",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  dotGreen: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#059669",
    marginTop: 4,
  },
  dotRose: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#E11D48",
    marginTop: 4,
  },
  dotAmber: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#D97706",
    marginTop: 4,
  },
  listItemTextGreen: {
    flex: 1,
    fontSize: 8.5,
    color: "#064E3B",
    lineHeight: 1.4,
  },
  listItemTextRose: {
    flex: 1,
    fontSize: 8.5,
    color: "#881337",
    lineHeight: 1.4,
  },
  listItemTextAmber: {
    flex: 1,
    fontSize: 8.5,
    color: "#78350F",
    lineHeight: 1.4,
  },

  // Tips
  tipItem: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: BG_GRAY,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 6,
    padding: 9,
    marginBottom: 7,
  },
  tipBadge: {
    width: 17,
    height: 17,
    borderRadius: 99,
    backgroundColor: BRAND_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  tipBadgeText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#FFFFFF",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 8.5,
    color: TEXT_MUTED,
    lineHeight: 1.4,
  },

  // Official Signature Section
  signatureSection: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopStyle: "dashed",
    borderTopColor: "#D1D5DB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  legalNote: {
    maxWidth: 270,
    fontSize: 7.5,
    color: TEXT_LIGHT,
    lineHeight: 1.45,
  },
  legalBold: {
    fontFamily: "Helvetica-Bold",
    color: TEXT_MUTED,
  },
  signatureBox: {
    width: 185,
    alignItems: "center",
  },
  signatureDate: {
    fontSize: 8.5,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 1.4,
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: TEXT_DARK,
    paddingTop: 4,
    alignItems: "center",
  },
  signatureName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: TEXT_DARK,
  },

  // Fixed Page Footer
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 34,
    right: 34,
    borderTopWidth: 0.5,
    borderTopColor: BORDER_GRAY,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#9CA3AF",
  },
});

/** Gaya Dokumen Resmi Multi-Halaman A4 1:1 Lembar Telaah Klinis Empathika. */
const officialStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#111827",
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // 1. KOP SURAT RESMI
  kopContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  kopTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    letterSpacing: 1.1,
    color: "#111827",
    textTransform: "uppercase",
    textAlign: "center",
  },
  kopSubtitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 0.4,
    color: "#374151",
    marginTop: 3,
    textAlign: "center",
  },
  kopDesc: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },
  kopDoubleLineWrapper: {
    width: "100%",
    marginTop: 6,
    marginBottom: 8,
  },
  kopLineThick: {
    borderBottomWidth: 1.8,
    borderBottomColor: "#111827",
    width: "100%",
  },
  kopLineThin: {
    borderBottomWidth: 0.6,
    borderBottomColor: "#111827",
    width: "100%",
    marginTop: 1.5,
  },

  // 2. IDENTITAS PESERTA (2 KOLOM RESMI)
  identitasContainer: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#D1D5DB",
    paddingBottom: 7,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  identitasCol: {
    width: "48.5%",
  },
  identitasRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  identitasLabel: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#4B5563",
    width: 95,
  },
  identitasSeparator: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#6B7280",
    width: 8,
  },
  identitasValue: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#111827",
    flex: 1,
  },
  identitasValueBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#111827",
    flex: 1,
  },

  // 3. RUNNING HEADER HALAMAN 2+ (LANJUTAN)
  runningHeader: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#D1D5DB",
    paddingBottom: 6,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  runningHeaderTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 0.8,
    color: "#111827",
    textTransform: "uppercase",
  },
  runningHeaderDocNo: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#6B7280",
  },

  // 4. ISI TELAAH KLINIS (SERIF TIMES-ROMAN)
  bodyContainer: {
    flex: 1,
    minHeight: 0,
  },
  bodyText: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.45,
    color: "#111827",
  },
  bodyBold: {
    fontFamily: "Times-Bold",
  },
  bodyItalic: {
    fontFamily: "Times-Italic",
  },

  // 5. TANDA TANGAN PSIKOLOG RESMI & VERIFIKASI DOKUMEN
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 4,
    paddingTop: 4,
  },
  verificationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF8FB",
    borderWidth: 0.75,
    borderColor: "#E9D5FF",
    borderRadius: 6,
    padding: 6,
    maxWidth: 260,
  },
  qrCodeImage: {
    width: 52,
    height: 52,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 2,
  },
  verificationTextWrapper: {
    flex: 1,
  },
  verificationTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#561269",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  verificationDesc: {
    fontFamily: "Helvetica",
    fontSize: 6.5,
    color: "#4B5563",
    lineHeight: 1.25,
    marginBottom: 3,
  },
  verificationDocNum: {
    fontFamily: "Courier",
    fontSize: 6.5,
    color: "#111827",
  },
  signatureBox: {
    width: 220,
    alignItems: "center",
  },
  signatureDate: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#4B5563",
    textAlign: "center",
  },
  signatureRole: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#111827",
    marginTop: 2,
    textAlign: "center",
  },
  signatureBadgeWrapper: {
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  signatureBadge: {
    borderWidth: 0.75,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  signatureBadgeText: {
    fontFamily: "Courier-Oblique",
    fontSize: 7.5,
    color: "#6B7280",
  },
  signatureName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#111827",
    textDecoration: "underline",
    textAlign: "center",
  },
  signatureSipp: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },

  // 6. FOOTER DOKUMEN RESMI
  footerContainer: {
    borderTopWidth: 0.75,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLegal: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#9CA3AF",
  },
  footerPageNum: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#6B7280",
  },
});

/**
 * Sanitasi karakter teks agar ramah terhadap rendering engine PDF tanpa glyph rusak.
 */
function sanitizePdfText(val?: string | number | null): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/\t/g, "    ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r•]/g, "");
}

/** Formatter tanggal bahasa Indonesia */
function formatIdDate(val?: string | null, fallbackToNow = false): string {
  if (!val && !fallbackToNow) return "-";
  try {
    const d = val ? new Date(val) : new Date();
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch {}
  return val || "-";
}

/** Parser inline formatting markdown (tebal & miring) untuk teks telaah */
function parseFormattedText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <Text key={match.index} style={officialStyles.bodyBold}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <Text key={match.index} style={officialStyles.bodyItalic}>
          {token.slice(1, -1)}
        </Text>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/** Memecah teks dokumen klinis menjadi lembaran A4 multi-halaman */
function parseTextToPages(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [""];

  let initialPages: string[] = [];
  if (rawText.includes("<!-- PAGE_BREAK -->")) {
    initialPages = rawText.split("<!-- PAGE_BREAK -->").map((p) => p.trim());
  } else if (rawText.includes("--- HALAMAN BARU ---")) {
    initialPages = rawText.split("--- HALAMAN BARU ---").map((p) => p.trim());
  } else {
    const lines = rawText.split("\n");
    let currentLines: string[] = [];
    let currentVisualLines = 0;
    let isFirst = true;

    for (const line of lines) {
      const visualWeight = Math.max(1, Math.ceil(line.length / 75));
      const maxCapacity = isFirst ? 30 : 35;

      if (currentVisualLines + visualWeight > maxCapacity && currentLines.length > 0) {
        initialPages.push(currentLines.join("\n"));
        currentLines = [line];
        currentVisualLines = visualWeight;
        isFirst = false;
      } else {
        currentLines.push(line);
        currentVisualLines += visualWeight;
      }
    }

    if (currentLines.length > 0) {
      initialPages.push(currentLines.join("\n"));
    }
  }

  if (initialPages.length === 0) return [""];

  // Pastikan halaman terakhir muat bersama tanda tangan
  const lastIdx = initialPages.length - 1;
  const lastPageText = initialPages[lastIdx];
  const lastLines = lastPageText.split("\n");
  let lastVisualWeight = 0;
  for (const l of lastLines) {
    lastVisualWeight += Math.max(1, Math.ceil(l.length / 75));
  }
  const maxSigLines = lastIdx === 0 ? 24 : 28;
  if (lastVisualWeight > maxSigLines) {
    initialPages.push("");
  }

  return initialPages;
}

function formatBirthInfo(tempat?: string | null, tanggal?: string | null): string {
  const cleanTempat = sanitizePdfText(tempat).trim();
  let formattedTgl = "";
  if (tanggal) {
    try {
      const d = new Date(tanggal);
      if (!isNaN(d.getTime())) {
        formattedTgl = d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } else {
        formattedTgl = sanitizePdfText(tanggal);
      }
    } catch {
      formattedTgl = sanitizePdfText(tanggal);
    }
  }
  return [cleanTempat, formattedTgl].filter(Boolean).join(", ");
}

export const LaporanPsikotesDocument: React.FC<{ data: LaporanPsikotesPdfData }> = ({
  data,
}) => {
  // JIKA TERDAPAT TELAAH PSIKOLOG: Render Dokumen Resmi Multi-Halaman A4 1:1
  const hasCatatanPsikolog = Boolean(
    data.catatanPsikolog && data.catatanPsikolog.trim().length > 0
  );

  if (hasCatatanPsikolog) {
    let combinedCatatan = (data.catatanPsikolog || "").trim();
    if (
      data.rekomendasiPsikolog &&
      !combinedCatatan.includes(data.rekomendasiPsikolog.trim())
    ) {
      combinedCatatan = `${combinedCatatan}\n\nREKOMENDASI:\n${data.rekomendasiPsikolog.trim()}`;
    }

    const pages = parseTextToPages(combinedCatatan);
    const safeNama = sanitizePdfText(data.peserta.nama || "Peserta");

    return (
      <Document
        title={`Laporan-Resmi-Psikotes-${safeNama.replace(/[^a-zA-Z0-9]/g, "_")}-Empathika`}
        author="Empathika Psychological Services"
        subject={sanitizePdfText(data.judulTes)}
      >
        {pages.map((pageText, pageIdx) => {
          const isFirstPage = pageIdx === 0;
          const isLastPage = pageIdx === pages.length - 1;
          const cleanPageText = sanitizePdfText(pageText);
          const lines = cleanPageText.split("\n");

          return (
            <Page
              key={pageIdx}
              size="A4"
              style={officialStyles.page}
            >
              {/* BAGIAN ATAS: KOP SURAT ATAU RUNNING HEADER */}
              <View>
                {isFirstPage ? (
                  <>
                    {/* Kop Surat Resmi */}
                    <View style={officialStyles.kopContainer}>
                      <Text style={officialStyles.kopTitle}>
                        EMPATHIKA PSYCHOLOGICAL SERVICES
                      </Text>
                      <Text style={officialStyles.kopSubtitle}>
                        BIRO LAYANAN PSIKOLOGI, ASESMEN KLINIS & KESEHATAN MENTAL TERPADU
                      </Text>
                      <Text style={officialStyles.kopDesc}>
                        Layanan Psikotes Online • Surat Keterangan / Laporan Psikologis Resmi Terverifikasi
                      </Text>
                      <View style={officialStyles.kopDoubleLineWrapper}>
                        <View style={officialStyles.kopLineThick} />
                        <View style={officialStyles.kopLineThin} />
                      </View>
                    </View>

                    {/* Identitas Klien */}
                    <View style={officialStyles.identitasContainer}>
                      {/* Kolom Kiri */}
                      <View style={officialStyles.identitasCol}>
                        <View style={officialStyles.identitasRow}>
                          <Text style={officialStyles.identitasLabel}>Nama Lengkap</Text>
                          <Text style={officialStyles.identitasSeparator}>:</Text>
                          <Text style={officialStyles.identitasValueBold}>
                            {safeNama}
                          </Text>
                        </View>
                        <View style={officialStyles.identitasRow}>
                          <Text style={officialStyles.identitasLabel}>Jenis Kelamin</Text>
                          <Text style={officialStyles.identitasSeparator}>:</Text>
                          <Text style={officialStyles.identitasValue}>
                            {sanitizePdfText(data.peserta.jenisKelamin || "—")}
                          </Text>
                        </View>
                        <View style={officialStyles.identitasRow}>
                          <Text style={officialStyles.identitasLabel}>Usia</Text>
                          <Text style={officialStyles.identitasSeparator}>:</Text>
                          <Text style={officialStyles.identitasValue}>
                            {data.peserta.usia ? `${sanitizePdfText(data.peserta.usia)} Tahun` : "—"}
                          </Text>
                        </View>
                      </View>

                      {/* Kolom Kanan */}
                      <View style={officialStyles.identitasCol}>
                        <View style={officialStyles.identitasRow}>
                          <Text style={officialStyles.identitasLabel}>Nomor Tiket</Text>
                          <Text style={officialStyles.identitasSeparator}>:</Text>
                          <Text style={officialStyles.identitasValueBold}>
                            {sanitizePdfText(data.noDokumen || "—")}
                          </Text>
                        </View>
                        <View style={officialStyles.identitasRow}>
                          <Text style={officialStyles.identitasLabel}>Tanggal Pemeriksaan</Text>
                          <Text style={officialStyles.identitasSeparator}>:</Text>
                          <Text style={officialStyles.identitasValue}>
                            {sanitizePdfText(formatIdDate(data.tanggalAsesmen, false))}
                          </Text>
                        </View>
                        <View style={officialStyles.identitasRow}>
                          <Text style={officialStyles.identitasLabel}>Alat Ukur / Asesmen</Text>
                          <Text style={officialStyles.identitasSeparator}>:</Text>
                          <Text style={officialStyles.identitasValueBold}>
                            {sanitizePdfText(data.judulTes || "—")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  /* Running Header Halaman Lanjutan */
                  <View style={officialStyles.runningHeader}>
                    <Text style={officialStyles.runningHeaderTitle}>
                      EMPATHIKA PSYCHOLOGICAL SERVICES
                    </Text>
                    <Text style={officialStyles.runningHeaderDocNo}>
                      {sanitizePdfText(data.noDokumen || "")}
                    </Text>
                  </View>
                )}
              </View>

              {/* BAGIAN TENGAH: ISI TELAAH KLINIS */}
              <View style={officialStyles.bodyContainer}>
                {lines.map((line, lineIdx) => {
                  if (line.trim() === "") {
                    return <View key={lineIdx} style={{ height: 5 }} />;
                  }

                  const leadingSpaces = line.match(/^ +/);
                  const indentCount = leadingSpaces ? leadingSpaces[0].length : 0;
                  const indentPt = indentCount > 0 ? Math.min(indentCount * 3.5, 36) : 0;

                  return (
                    <View
                      key={lineIdx}
                      style={{
                        paddingLeft: indentPt,
                        marginBottom: 2.5,
                      }}
                    >
                      <Text style={officialStyles.bodyText}>
                        {parseFormattedText(line.trimStart())}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* BAGIAN BAWAH: TANDA TANGAN (HANYA HALAMAN TERAKHIR) & FOOTER */}
              <View wrap={false}>
                {isLastPage && (
                  <View style={officialStyles.signatureContainer}>
                    {/* Kotak Verifikasi QR Code Keaslian Dokumen Resmi */}
                    <View style={officialStyles.verificationBox}>
                      {data.qrCodeUrl ? (
                        <Image src={data.qrCodeUrl} style={officialStyles.qrCodeImage} />
                      ) : null}
                      <View style={officialStyles.verificationTextWrapper}>
                        <Text style={officialStyles.verificationTitle}>
                          VERIFIKASI KEASLIAN DOKUMEN
                        </Text>
                        <Text style={officialStyles.verificationDesc}>
                          Pindai QR Code untuk memvalidasi integritas dokumen dan keabsahan legalitas telaah psikolog.
                        </Text>
                        <Text style={officialStyles.verificationDocNum}>
                          No: {sanitizePdfText(data.noDokumen)}
                        </Text>
                      </View>
                    </View>

                    {/* Tanda Tangan Psikolog Pemeriksa */}
                    <View style={officialStyles.signatureBox}>
                      <Text style={officialStyles.signatureDate}>
                        Bandung, {sanitizePdfText(formatIdDate(data.tanggalReview, true))}
                      </Text>
                      <Text style={officialStyles.signatureRole}>Psikolog Pemeriksa,</Text>

                      <View style={officialStyles.signatureBadgeWrapper}>
                        <View style={officialStyles.signatureBadge}>
                          <Text style={officialStyles.signatureBadgeText}>
                            [ Terverifikasi Secara Digital ]
                          </Text>
                        </View>
                      </View>

                      <Text style={officialStyles.signatureName}>
                        {sanitizePdfText(data.namaPsikolog || "Psikolog Klinis Empathika")}
                      </Text>
                      <Text style={officialStyles.signatureSipp}>
                        Surat Izin Praktik Psikologi (SIPP / SIPPK) Terdaftar
                      </Text>
                    </View>
                  </View>
                )}

                <View style={officialStyles.footerContainer}>
                  <Text style={officialStyles.footerLegal}>
                    © {new Date().getFullYear()} Empathika Psychological Services • Kerahasiaan Medis Dijamin
                  </Text>
                  <Text style={officialStyles.footerPageNum}>
                    {pageIdx + 1}
                  </Text>
                </View>
              </View>
            </Page>
          );
        })}
      </Document>
    );
  }

  // JIKA BELUM ADA TELAAH PSIKOLOG: Fallback ke template visual skor otomatis
  const { peserta, hasilUtama } = data;
  const profileParts = [
    peserta.usia ? `${peserta.usia} Thn` : null,
    peserta.jenisKelamin ? sanitizePdfText(peserta.jenisKelamin) : null,
    peserta.kategori ? `(${sanitizePdfText(peserta.kategori)})` : null,
  ].filter(Boolean);

  const ttlText = formatBirthInfo(peserta.tempatLahir, peserta.tanggalLahir);
  const kekuatan = data.kekuatanUtama || [];
  const blindspots = data.blindspots || [];
  const lingkungan = data.lingkunganOptimal || [];
  const saran = data.saranList || [];
  const subscales = data.subscales || [];

  const isAdultInfo = Boolean(peserta.pekerjaan || peserta.statusPernikahan);
  const isParentInfo = Boolean(peserta.namaOrangTua || peserta.noTeleponOrangTua);

  return (
    <Document
      title={`Laporan Psikotes - ${sanitizePdfText(peserta.nama)} - Empathika`}
      author="Empathika Psychological Center"
      subject={sanitizePdfText(data.judulTes)}
    >
      <Page size="A4" style={styles.page}>
        {/* Kop Surat Resmi Empathika */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>EMPATHIKA</Text>
            <Text style={styles.brandSub}>
              Pusat Layanan Asesmen &amp; Konsultasi Psikologi Digital
            </Text>
            <Text style={styles.brandContact}>
              www.empathika.id • info@empathika.id
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerBadge}>Laporan Hasil Asesmen Psikotes</Text>
            <Text style={styles.headerTestName}>
              {sanitizePdfText(data.judulTes)}
            </Text>
            <Text style={styles.headerDocNo}>
              No. Dokumen:{" "}
              <Text style={styles.headerDocNoVal}>
                {sanitizePdfText(data.noDokumen)}
              </Text>
            </Text>
          </View>
        </View>

        {/* Identitas Peserta Asesmen */}
        <View style={styles.card} wrap={false}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Identitas Peserta Asesmen</Text>
              <Text style={styles.cardSubtitle}>
                Data resmi peserta pengerjaan asesmen psikotes
              </Text>
            </View>
            <View style={styles.pillRow}>
              <View style={styles.pillPurple}>
                <Text style={styles.pillPurpleText}>
                  {sanitizePdfText(data.masaBerlaku || "Masa Berlaku: 3 Bulan")}
                </Text>
              </View>
              <View style={styles.pillGreen}>
                <Text style={styles.pillGreenText}>Terverifikasi Resmi</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Nama Lengkap</Text>
              <Text style={styles.metaVal}>
                {sanitizePdfText(peserta.nama) || "Peserta Asesmen Empathika"}
              </Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Kontak WhatsApp</Text>
              <Text style={styles.metaValGreen}>
                {sanitizePdfText(peserta.noHp || peserta.noTeleponOrangTua) || "-"}
              </Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Profil Peserta</Text>
              <Text style={styles.metaVal}>
                {profileParts.join(" • ") || "-"}
              </Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Tanggal Asesmen</Text>
              <Text style={styles.metaVal}>
                {sanitizePdfText(data.tanggalAsesmen) || "-"}
              </Text>
            </View>

            {ttlText ? (
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Tempat &amp; Tanggal Lahir</Text>
                <Text style={styles.metaVal}>{ttlText}</Text>
              </View>
            ) : null}

            {peserta.pendidikan ? (
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Pendidikan</Text>
                <Text style={styles.metaVal}>
                  {sanitizePdfText(peserta.pendidikan)}
                </Text>
              </View>
            ) : null}

            {isAdultInfo && peserta.pekerjaan ? (
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Pekerjaan</Text>
                <Text style={styles.metaVal}>
                  {sanitizePdfText(peserta.pekerjaan)}
                </Text>
              </View>
            ) : null}

            {isAdultInfo && peserta.statusPernikahan ? (
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Status Pernikahan</Text>
                <Text style={styles.metaVal}>
                  {sanitizePdfText(peserta.statusPernikahan)}
                </Text>
              </View>
            ) : null}

            {isParentInfo && peserta.namaOrangTua ? (
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Nama Orang Tua / Wali</Text>
                <Text style={styles.metaVal}>
                  {sanitizePdfText(peserta.namaOrangTua)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Hasil Utama */}
        <View style={styles.heroCard} wrap={false}>
          {hasilUtama.prefix ? (
            <Text style={styles.heroPrefix}>
              {sanitizePdfText(hasilUtama.prefix)}
            </Text>
          ) : (
            <Text style={styles.heroPrefix}>Hasil Analisis &amp; Profil Asesmen</Text>
          )}
          <Text style={styles.heroTitle}>{sanitizePdfText(hasilUtama.judul)}</Text>
          {hasilUtama.totalSkor !== null && hasilUtama.totalSkor !== undefined ? (
            <View style={styles.heroScorePill}>
              <Text style={styles.heroScoreText}>
                Total Akumulasi Skor: {hasilUtama.totalSkor} Poin
              </Text>
            </View>
          ) : null}
          <Text style={styles.heroDesc}>
            {sanitizePdfText(hasilUtama.deskripsi)}
          </Text>
        </View>

        {/* Telaah Klinis & Catatan Psikolog Resmi */}
        {data.catatanPsikolog ? (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>Telaah Klinis &amp; Catatan Psikolog</Text>
                <Text style={styles.cardSubtitle}>
                  {data.namaPsikolog || "Psikolog Klinis Empathika"}
                  {data.tanggalReview ? ` • Ditelaah pada ${sanitizePdfText(data.tanggalReview)}` : ""}
                </Text>
              </View>
              <View style={styles.pillGreen}>
                <Text style={styles.pillGreenText}>Terverifikasi Resmi</Text>
              </View>
            </View>
            <View style={{ gap: 8, marginTop: 4 }}>
              <View style={{ backgroundColor: BG_GRAY, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#F3F4F6" }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8, color: BRAND_PURPLE, textTransform: "uppercase", marginBottom: 3 }}>
                  Dinamika Kepribadian &amp; Gambaran Klinis
                </Text>
                <Text style={styles.bodyText}>
                  {sanitizePdfText(data.catatanPsikolog)}
                </Text>
              </View>
              {data.rekomendasiPsikolog ? (
                <View style={{ backgroundColor: BG_GRAY, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#F3F4F6" }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8, color: BRAND_PURPLE, textTransform: "uppercase", marginBottom: 3 }}>
                    Rekomendasi Intervensi &amp; Rencana Tindak Lanjut
                  </Text>
                  <Text style={styles.bodyText}>
                    {sanitizePdfText(data.rekomendasiPsikolog)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Profil Dimensi / Subskala (misal DASS-42) */}
        {subscales.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow} wrap={false}>
              <Text style={styles.cardTitle}>
                {sanitizePdfText(data.subscalesTitle || "Profil Rincian Dimensi")}
              </Text>
              {data.subscalesMaxNote ? (
                <Text style={styles.cardSubtitle}>
                  {sanitizePdfText(data.subscalesMaxNote)}
                </Text>
              ) : null}
            </View>
            {subscales.map((sub, idx) => {
              const pct =
                sub.percentage !== undefined
                  ? Math.max(6, Math.min(100, sub.percentage))
                  : Math.max(6, Math.min(100, (sub.score / (sub.maxScore || 1)) * 100));
              const fillColor = sub.colorHex || BRAND_PURPLE;
              return (
                <View key={idx} style={styles.subscaleItem} wrap={false}>
                  <View style={styles.subscaleTop}>
                    <View style={styles.subscaleNameRow}>
                      <View
                        style={[
                          styles.subscaleDot,
                          { backgroundColor: fillColor },
                        ]}
                      />
                      <Text style={styles.subscaleName}>
                        {sanitizePdfText(sub.name)}
                      </Text>
                    </View>
                    <Text style={styles.subscaleScore}>
                      {sub.score} / {sub.maxScore}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: fillColor },
                      ]}
                    />
                  </View>
                  {sub.deskripsi ? (
                    <Text style={styles.subscaleDesc}>
                      {sanitizePdfText(sub.deskripsi)}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Interpretasi Hasil (hanya jika belum ada catatan telaah khusus dari psikolog) */}
        {hasilUtama.deskripsi && !data.catatanPsikolog ? (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Interpretasi Hasil</Text>
            </View>
            <View style={{ gap: 5 }}>
              {(hasilUtama.deskripsi || "")
                .split(/\r?\n\s*\r?\n/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((para, pIdx) => (
                  <Text key={pIdx} style={styles.bodyText}>
                    {sanitizePdfText(para)}
                  </Text>
                ))}
            </View>
          </View>
        ) : null}

        {/* Analisis Karakteristik & Dinamika Diri */}
        {kekuatan.length > 0 || blindspots.length > 0 ? (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>
                  Analisis Karakteristik &amp; Dinamika Diri
                </Text>
                <Text style={styles.cardSubtitle}>
                  Pemetaan potensi keunggulan serta area pengembangan diri
                </Text>
              </View>
            </View>

            <View style={styles.twoCols}>
              {kekuatan.length > 0 ? (
                <View
                  style={[
                    styles.boxGreen,
                    blindspots.length > 0 ? styles.colHalf : styles.colFull,
                  ]}
                >
                  <Text style={styles.boxTitleGreen}>
                    {sanitizePdfText(
                      data.judulKekuatan || "Potensi atau Kekuatan Utama"
                    )}
                  </Text>
                  {kekuatan.map((pt, i) => (
                    <View key={i} style={styles.listItemRow}>
                      <View style={styles.dotGreen} />
                      <Text style={styles.listItemTextGreen}>
                        {sanitizePdfText(pt)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {blindspots.length > 0 ? (
                <View
                  style={[
                    styles.boxRose,
                    kekuatan.length > 0 ? styles.colHalf : styles.colFull,
                  ]}
                >
                  <Text style={styles.boxTitleRose}>
                    {sanitizePdfText(
                      data.judulBlindspots || "Area yang Perlu Dikembangkan"
                    )}
                  </Text>
                  {blindspots.map((pt, i) => (
                    <View key={i} style={styles.listItemRow}>
                      <View style={styles.dotRose} />
                      <Text style={styles.listItemTextRose}>
                        {sanitizePdfText(pt)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Kondisi / Lingkungan yang Mendukung */}
        {lingkungan.length > 0 ? (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>
                  {sanitizePdfText(
                    data.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung"
                  )}
                </Text>
                <Text style={styles.cardSubtitle}>
                  Kondisi eksternal yang mendukung performa optimal dan kesejahteraan emosional
                </Text>
              </View>
            </View>
            <View style={styles.boxAmber}>
              {lingkungan.map((item, i) => (
                <View key={i} style={styles.listItemRow}>
                  <View style={styles.dotAmber} />
                  <Text style={styles.listItemTextAmber}>
                    {sanitizePdfText(item)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Langkah Pengembangan Diri */}
        {saran.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow} wrap={false}>
              <View>
                <Text style={styles.cardTitle}>Langkah Pengembangan Diri</Text>
                <Text style={styles.cardSubtitle}>
                  Saran praktis untuk memaksimalkan potensi dan menjaga keseimbangan diri
                </Text>
              </View>
            </View>
            {saran.map((tip, idx) => (
              <View key={idx} style={styles.tipItem} wrap={false}>
                <View style={styles.tipBadge}>
                  <Text style={styles.tipBadgeText}>{idx + 1}</Text>
                </View>
                <View style={styles.tipContent}>
                  {tip.title ? (
                    <Text style={styles.tipTitle}>
                      {sanitizePdfText(tip.title)}
                    </Text>
                  ) : null}
                  {tip.desc ? (
                    <Text style={styles.tipDesc}>
                      {sanitizePdfText(tip.desc)}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Footer Tanda Tangan & Catatan Resmi */}
        <View style={styles.signatureSection} wrap={false}>
          {data.qrCodeUrl ? (
            <Image src={data.qrCodeUrl} style={{ width: 44, height: 44, marginRight: 8, borderRadius: 4 }} />
          ) : null}
          <Text style={styles.legalNote}>
            <Text style={styles.legalBold}>Catatan Resmi: </Text>
            Dokumen ini bersifat rahasia (confidential) dan diterbitkan secara
            digital sebagai hasil asesmen psikometri resmi Empathika.
            {"\n"}Pindai QR Code untuk memvalidasi keaslian dokumen: {sanitizePdfText(data.noDokumen)}
          </Text>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureDate}>
              Bandung, {sanitizePdfText(data.tanggalAsesmen)}
              {"\n"}Tim Asesor Asesmen Psikologi,
            </Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>
                Empathika Psychological Center
              </Text>
            </View>
          </View>
        </View>

        {/* Running Page Number Footer */}
        <View style={styles.pageFooter} fixed>
          <Text>Dokumen Rahasia • Empathika Psychological Center</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

