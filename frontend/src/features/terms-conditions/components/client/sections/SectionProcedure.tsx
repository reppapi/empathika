import React from "react";

export default function SectionProcedure() {
  return (
    <article
      id="prosedur-layanan"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          3
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Prosedur Pelaksanaan Konsultasi & Asesmen
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Alur ketepatan waktu, metode sesi, dan tata tertib konsultasi.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
        <ul className="space-y-3.5 pl-1">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
            <div>
              <strong className="text-gray-900 font-semibold">Sesi Konsultasi Daring (Online):</strong>
              <span className="text-gray-600 ml-1">
                Klien akan menerima tautan video meeting resmi (Zoom) yang dikirimkan via WhatsApp atau email sebelum sesi dimulai. Klien diharapkan berada di ruangan yang tenang, privat, dan memiliki koneksi internet yang stabil.
              </span>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
            <div>
              <strong className="text-gray-900 font-semibold">Sesi Konsultasi Tatap Muka (Offline di Klinik):</strong>
              <span className="text-gray-600 ml-1">
                Klien diharapkan hadir di lokasi klinik sekurang-kurangnya 10 menit sebelum jadwal sesi dimulai untuk registrasi administratif.
              </span>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
            <div>
              <strong className="text-gray-900 font-semibold">Kehadiran Tepat Waktu:</strong>
              <span className="text-gray-600 ml-1">
                Kehadiran tepat waktu sangat penting untuk kelancaran dan efektivitas sesi konseling. Apabila Anda terlambat, sesi akan tetap berjalan sesuai jadwal yang telah ditentukan tanpa adanya perpanjangan waktu konseling, demi menjaga jadwal janji temu klien berikutnya.
              </span>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
            <div>
              <strong className="text-gray-900 font-semibold">Penambahan Waktu Sesi Konseling:</strong>
              <span className="text-gray-600 ml-1">
                Penambahan durasi waktu sesi konseling akan dikenakan biaya tambahan proporsional, dan proses penagihan biaya tambahan tersebut akan dilakukan segera setelah sesi konseling berakhir.
              </span>
            </div>
          </li>
        </ul>
      </div>
    </article>
  );
}
