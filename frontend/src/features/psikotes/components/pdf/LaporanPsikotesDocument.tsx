/** Template layout dokumen Vector PDF laporan resmi psikotes Empathika menggunakan @react-pdf/renderer. */
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
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

/**
 * Sanitasi karakter non-Latin-1 agar font standar Helvetica PDFKit selalu merender bersih tanpa glyph rusak.
 */
function sanitizePdfText(val?: string | number | null): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r]/g, "");
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
                  {sanitizePdfText(data.masaBerlaku || "Masa Berlaku: 14 Hari")}
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

        {/* Interpretasi Hasil */}
        {hasilUtama.deskripsi ? (
          <View style={styles.card} wrap={false}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Interpretasi Hasil</Text>
            </View>
            <Text style={styles.bodyText}>
              {sanitizePdfText(hasilUtama.deskripsi)}
            </Text>
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
          <Text style={styles.legalNote}>
            <Text style={styles.legalBold}>Catatan Resmi: </Text>
            Dokumen ini bersifat rahasia (confidential) dan diterbitkan secara
            digital sebagai hasil asesmen psikometri resmi Empathika.
            {"\n"}Verifikasi Dokumen: {sanitizePdfText(data.noDokumen)}
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

