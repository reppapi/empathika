import React from "react";
import {
  X,
  FileText,
  Download,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Compass,
  HeartHandshake,
  Clock,
} from "lucide-react";
import type { AdminPsikotesPeserta, JudulPsikotesItem } from "../../types/adminPsikotes";
import { getPesertaReportDetail } from "../../utils/adminPsikotesMapper";

export interface ModalDetailPesertaProps {
  peserta: AdminPsikotesPeserta | null;
  judulList?: JudulPsikotesItem[];
  onClose: () => void;
  onDownloadPdf: (peserta: AdminPsikotesPeserta) => void;
}

export default function ModalDetailPeserta({
  peserta,
  judulList = [],
  onClose,
  onDownloadPdf,
}: ModalDetailPesertaProps) {
  if (!peserta) return null;

  const isCompleted = peserta.status === "Selesai" || Boolean(peserta.hasil);
  const detail = getPesertaReportDetail(peserta, judulList);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col font-poppins">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#561269]/10 text-[#561269] rounded-xl flex items-center justify-center text-sm font-bold uppercase shrink-0">
              {peserta.nama.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900 leading-tight">
                  {peserta.nama}
                </h3>
                {isCompleted ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Selesai Dinilai
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Sedang Berjalan
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {peserta.paket} · {peserta.tanggal}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Data Klien Ringkas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                Nama Klien
              </span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
                {peserta.nama}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                Kontak WhatsApp
              </span>
              <span className="font-semibold text-emerald-700 text-sm mt-0.5 block truncate">
                {peserta.noHp}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                Paket Psikotes
              </span>
              <span className="font-medium text-gray-800 mt-0.5 block truncate">
                {peserta.paket}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                Tanggal Asesmen
              </span>
              <span className="font-medium text-gray-700 mt-0.5 block truncate">
                {peserta.tanggal}
              </span>
            </div>
          </div>

          {/* Data Tambahan Profil Peserta (Anak / Remaja / Dewasa) */}
          {peserta.peserta && (peserta.peserta.nama_orang_tua || peserta.peserta.pendidikan || peserta.peserta.pekerjaan || peserta.peserta.status_pernikahan || peserta.peserta.tempat_lahir || peserta.peserta.tanggal_lahir || peserta.peserta.kategori_peserta) && (
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100/60 text-xs space-y-2">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                Profil Peserta Tes {peserta.peserta.kategori_peserta ? `(${peserta.peserta.kategori_peserta})` : ""}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(peserta.peserta.tempat_lahir || peserta.peserta.tanggal_lahir) && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">Tempat, Tgl Lahir</span>
                    <span className="font-semibold text-gray-800">
                      {[
                        peserta.peserta.tempat_lahir,
                        peserta.peserta.tanggal_lahir
                          ? new Date(peserta.peserta.tanggal_lahir).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </div>
                )}
                {((peserta.peserta as any).no_telepon || (!peserta.peserta.nama_orang_tua && peserta.peserta.no_telepon_orang_tua)) && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">No. WhatsApp Peserta</span>
                    <span className="font-semibold text-emerald-700">{(peserta.peserta as any).no_telepon || peserta.peserta.no_telepon_orang_tua}</span>
                  </div>
                )}
                {peserta.peserta.nama_orang_tua && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">Nama Orang Tua / Wali</span>
                    <span className="font-semibold text-gray-800">{peserta.peserta.nama_orang_tua}</span>
                  </div>
                )}
                {peserta.peserta.nama_orang_tua && peserta.peserta.no_telepon_orang_tua && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">No. HP Orang Tua</span>
                    <span className="font-semibold text-gray-800">{peserta.peserta.no_telepon_orang_tua}</span>
                  </div>
                )}
                {peserta.peserta.pendidikan && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">Pendidikan</span>
                    <span className="font-semibold text-gray-800">{peserta.peserta.pendidikan}</span>
                  </div>
                )}
                {peserta.peserta.pekerjaan && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">Pekerjaan</span>
                    <span className="font-semibold text-gray-800">{peserta.peserta.pekerjaan}</span>
                  </div>
                )}
                {peserta.peserta.status_pernikahan && (
                  <div>
                    <span className="text-gray-400 block text-[10px]">Status Pernikahan</span>
                    <span className="font-semibold text-gray-800">{peserta.peserta.status_pernikahan}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isCompleted ? (
            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 text-center space-y-3">
              <Clock className="w-8 h-8 text-amber-600 mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-amber-900">Klien Belum Menyelesaikan Pengerjaan Tes</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Peserta ini telah terdaftar pada paket <strong>{peserta.paket}</strong> namun belum menyelesaikan pengisian instrumen tes psikotes. Hasil skor dan laporan resmi PDF akan otomatis terbentuk setelah peserta menyelesaikan tes.
                </p>
              </div>
              {peserta.noHp && peserta.noHp !== "—" && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${peserta.noHp.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Halo ${peserta.nama}, akses asesmen psikotes Anda (${peserta.paket}) di Empathika telah aktif. Silakan masuk ke akun atau link tes untuk menyelesaikan pengisian instrumen asesmen.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> Ingatkan Peserta via WhatsApp
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Hasil Utama Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#FAF8FB] to-white border border-[#EFE7F2] text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Hasil Analisis Resmi
                </span>
                {peserta.totalSkor !== null && peserta.totalSkor !== undefined && (
                  <div className="text-xs font-extrabold text-[#561269] bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-100">
                    Total Skor: {peserta.totalSkor}
                  </div>
                )}
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#561269] tracking-tight">
                  {peserta.skor || detail.grade}
                </h3>
                {detail.judul && detail.judul !== peserta.skor && detail.judul !== detail.grade && detail.judul !== "—" && (
                  <p className="text-xs font-bold text-gray-700">
                    {detail.judul}
                  </p>
                )}
                <p className="text-xs text-gray-600 leading-relaxed max-w-xl mx-auto pt-1">
                  {detail.deskripsi}
                </p>
              </div>

              {/* Rincian Dimensi RCMAS & Lie Scale */}
              {peserta.hasil?.detail_skor?.subscales?.physiological && peserta.hasil?.detail_skor?.lieScale && (
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                    Rincian Dimensi Kecemasan &amp; Validitas (RCMAS)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                      <span className="text-[10px] text-gray-500 block">Faktor Fisiologis</span>
                      <span className="text-xs font-bold text-gray-800">
                        {peserta.hasil.detail_skor.subscales.physiological?.skor ?? 0} / 10
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                      <span className="text-[10px] text-gray-500 block">Faktor Kekhawatiran</span>
                      <span className="text-xs font-bold text-gray-800">
                        {peserta.hasil.detail_skor.subscales.worry?.skor ?? 0} / 11
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                      <span className="text-[10px] text-gray-500 block">Faktor Konsentrasi</span>
                      <span className="text-xs font-bold text-gray-800">
                        {peserta.hasil.detail_skor.subscales.concentration?.skor ?? 0} / 7
                      </span>
                    </div>
                  </div>

                  {/* Indikator Validitas / Lie Scale */}
                  <div className="p-3 rounded-xl bg-white border border-purple-200/80 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-950">Indikator Validitas (Lie Scale):</span>
                        <span className="font-extrabold text-[#561269] bg-purple-100 px-2 py-0.5 rounded-md text-[11px]">
                          {peserta.hasil.detail_skor.lieScale.skor} / 9
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Skala keinginan sosial (social desirability). Skor mentah disimpan apa adanya untuk referensi profesional psikolog.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Potensi & Area Pengembangan */}
              {(detail.kekuatanUtama.length > 0 || detail.blindspots.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.kekuatanUtama.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {detail.judulKekuatan}
                      </span>
                      <ul className="space-y-1.5 text-xs text-emerald-950">
                        {detail.kekuatanUtama.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {detail.blindspots.length > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-2">
                      <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        {detail.judulBlindspots}
                      </span>
                      <ul className="space-y-1.5 text-xs text-rose-950">
                        {detail.blindspots.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Lingkungan Optimal */}
              {detail.lingkunganOptimal.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    {detail.judulLingkungan}
                  </span>
                  <ul className="space-y-1 text-xs text-gray-800">
                    {detail.lingkunganOptimal.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips & Langkah Pengembangan Diri */}
              {detail.tips.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-[#561269]" />
                    Langkah Pengembangan Diri Terstruktur
                  </span>
                  <div className="space-y-2">
                    {detail.tips.map((t, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#561269] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-gray-900">{t.title}</h5>
                          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download PDF Laporan Klien */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#561269] flex items-center justify-center font-bold shadow-xs shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">Laporan Resmi Hasil Psikotes (PDF)</h4>
                    <p className="text-[11px] text-gray-500">
                      Dokumen evaluasi komprehensif terverifikasi siap unduh dan cetak 1:1 persis website klien.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadPdf(peserta)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Download Laporan (PDF)
                </button>
              </div>

              {/* Quick WhatsApp Action */}
              {peserta.noHp && peserta.noHp !== "—" && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-gray-700 font-medium">
                    Kirimkan pemberitahuan hasil asesmen resmi ini ke nomor klien?
                  </span>
                  <a
                    href={`https://wa.me/${peserta.noHp.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Halo ${peserta.nama}, terima kasih telah menyelesaikan asesmen psikotes ${peserta.paket} di Empathika. Hasil asesmen Anda (${peserta.skor}${detail.judul && detail.judul !== peserta.skor ? ` - ${detail.judul}` : ""}) telah siap dan terverifikasi secara resmi.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:underline shrink-0"
                  >
                    Kirim WhatsApp
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
          <span className="text-xs text-gray-500">
            Dokumen resmi asesmen psikotes Empathika
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
