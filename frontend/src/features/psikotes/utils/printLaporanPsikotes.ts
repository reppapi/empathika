import type { AdminPsikotesPeserta, JudulPsikotesItem } from "../types/adminPsikotes";
import { getPesertaReportDetail } from "./adminPsikotesMapper";

/**
 * Mencetak dokumen PDF resmi hasil asesmen psikotes peserta (1:1 persis laporan resmi Empathika).
 */
export function printLaporanPsikotes(
  peserta: AdminPsikotesPeserta,
  judulList: JudulPsikotesItem[] = []
) {
  const detail = getPesertaReportDetail(peserta, judulList);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const tipsHtml = detail.tips
    .map(
      (t, idx) => `
    <div style="display: flex; gap: 14px; padding: 14px 18px; border-radius: 14px; background: #f9fafb; border: 1px solid #f3f4f6; margin-bottom: 10px;">
      <div style="width: 22px; height: 22px; border-radius: 50%; background: #561269; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">
        ${idx + 1}
      </div>
      <div>
        <div style="font-weight: 700; font-size: 13px; color: #111827;">${t.title}</div>
        <div style="font-size: 12px; color: #4b5563; margin-top: 2px; line-height: 1.5;">${t.desc}</div>
      </div>
    </div>
  `
    )
    .join("");

  const kekuatanHtml = detail.kekuatanUtama
    .map(
      (item) => `
    <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #064e3b; line-height: 1.5;">
      <span style="color: #059669; font-weight: bold;">✔</span>
      <span>${item}</span>
    </li>
  `
    )
    .join("");

  const blindspotHtml = detail.blindspots
    .map(
      (item) => `
    <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #881337; line-height: 1.5;">
      <span style="color: #e11d48; font-weight: bold;">⚠</span>
      <span>${item}</span>
    </li>
  `
    )
    .join("");

  const lingkunganHtml = detail.lingkunganOptimal
    .map(
      (item) => `
    <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #78350f; line-height: 1.5;">
      <span style="color: #d97706; font-weight: bold;">✦</span>
      <span>${item}</span>
    </li>
  `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Laporan Hasil Psikotes - ${peserta.nama} - Empathika</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #FAFAFC;
            color: #1f2937;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print-bar {
            position: sticky;
            top: 0;
            background: #561269;
            color: #ffffff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.15);
            z-index: 9999;
          }
          .report-container {
            max-width: 860px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 28px;
            border: 1px solid #e5e7eb;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          }
          .header-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            color: #561269;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 6px;
          }
          .report-title {
            font-size: 26px;
            font-weight: 800;
            color: #111827;
            line-height: 1.25;
            margin: 0;
          }
          .client-meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            background: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 18px;
            padding: 16px 20px;
            margin: 24px 0 32px 0;
          }
          .meta-label {
            font-size: 10px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .meta-value {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
          }
          .score-card {
            border-radius: 24px;
            border: 1px solid #EFE7F2;
            background: linear-gradient(180deg, #FAF8FB 0%, #FFFFFF 100%);
            padding: 32px;
            text-align: center;
            margin-bottom: 28px;
          }
          .score-grade {
            font-size: 32px;
            font-weight: 900;
            color: #561269;
            letter-spacing: -0.5px;
            margin: 8px 0;
          }
          .section-box {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 24px;
          }
          .section-title {
            font-size: 15px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 10px 0;
          }
          .grid-two-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .box-green {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 18px;
            padding: 20px;
          }
          .box-red {
            background: #fff1f2;
            border: 1px solid #fecdd3;
            border-radius: 18px;
            padding: 20px;
          }
          .box-yellow {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 18px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .box-title-green { font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 12px; }
          .box-title-red { font-size: 11px; font-weight: 800; color: #9f1239; text-transform: uppercase; margin-bottom: 12px; }
          .box-title-yellow { font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; margin-bottom: 12px; }
          ul { list-style: none; padding: 0; margin: 0; }
          @media print {
            .no-print-bar { display: none !important; }
            body { background: #ffffff !important; }
            .report-container {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              max-width: 100% !important;
            }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div style="font-size: 14px; font-weight: 700;">
            Laporan Psikotes Resmi Empathika: ${peserta.nama}
          </div>
          <button onclick="window.print()" style="background: #EAB308; color: #000; border: none; padding: 8px 18px; border-radius: 9999px; font-size: 12px; font-weight: 800; cursor: pointer;">
            🖨 Cetak Sekarang / Simpan PDF
          </button>
        </div>

        <div class="report-container">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #561269; padding-bottom: 18px;">
            <div>
              <span class="header-badge">Empathika Assessment Report</span>
              <h1 class="report-title">${peserta.paket}</h1>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 900; font-size: 18px; color: #561269; letter-spacing: -0.5px;">EMPATHIKA</div>
              <div style="font-size: 10px; color: #6b7280; font-weight: 600;">Psychological Center & Health</div>
            </div>
          </div>

          <div class="client-meta-grid">
            <div>
              <div class="meta-label">Nama Klien</div>
              <div class="meta-value">${peserta.nama}</div>
            </div>
            <div>
              <div class="meta-label">Nomor WhatsApp</div>
              <div class="meta-value">${peserta.noHp || "—"}</div>
            </div>
            <div>
              <div class="meta-label">Tanggal Tes</div>
              <div class="meta-value">${peserta.tanggal}</div>
            </div>
            <div>
              <div class="meta-label">Status Akses</div>
              <div class="meta-value" style="color: #059669;">Laporan Resmi (PDF)</div>
            </div>
          </div>

          <div class="score-card">
            <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
              Hasil Analisis & Profil Asesmen
            </div>
            <div class="score-grade">${detail.judul || detail.grade}</div>
            ${
              peserta.totalSkor !== null && peserta.totalSkor !== undefined
                ? `
              <div style="font-size: 12px; font-weight: 700; color: #561269; margin-bottom: 8px;">
                Total Akumulasi Skor: ${peserta.totalSkor} Poin
              </div>
            `
                : ""
            }
            <div style="font-size: 13px; color: #4b5563; max-width: 680px; margin: 0 auto; line-height: 1.6;">
              ${detail.deskripsi}
            </div>
          </div>

          ${
            detail.makna
              ? `
            <div class="section-box" style="background: #faf8fb; border-color: #efe7f2;">
              <div class="section-title" style="color: #561269;">Makna Hasil bagi Kehidupan Sehari-hari</div>
              <div style="font-size: 13px; color: #4b5563; line-height: 1.6;">
                ${detail.makna}
              </div>
            </div>
          `
              : ""
          }

          ${
            detail.kekuatanUtama.length > 0 || detail.blindspots.length > 0
              ? `
            <div class="grid-two-cols">
              ${
                detail.kekuatanUtama.length > 0
                  ? `
                <div class="box-green">
                  <div class="box-title-green">✔ ${detail.judulKekuatan}</div>
                  <ul>${kekuatanHtml}</ul>
                </div>
              `
                  : ""
              }
              ${
                detail.blindspots.length > 0
                  ? `
                <div class="box-red">
                  <div class="box-title-red">⚠ ${detail.judulBlindspots}</div>
                  <ul>${blindspotHtml}</ul>
                </div>
              `
                  : ""
              }
            </div>
          `
              : ""
          }

          ${
            detail.lingkunganOptimal.length > 0
              ? `
            <div class="box-yellow">
              <div class="box-title-yellow">✦ ${detail.judulLingkungan}</div>
              <ul>${lingkunganHtml}</ul>
            </div>
          `
              : ""
          }

          ${
            detail.tips.length > 0
              ? `
            <div class="section-box">
              <div class="section-title">Rekomendasi & Langkah Pengembangan Diri</div>
              ${tipsHtml}
            </div>
          `
              : ""
          }

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #9ca3af;">
            <div>Dokumen ini sah diterbitkan secara digital oleh Layanan Psikotes Empathika.</div>
            <div style="font-weight: 700; color: #561269;">Empathika Psychological Center</div>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 450);
}
