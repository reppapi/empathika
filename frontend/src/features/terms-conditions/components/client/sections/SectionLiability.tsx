import React from "react";

export default function SectionLiability() {
  return (
    <article
      id="batasan-tanggung-jawab"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          7
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Batasan Kewajiban & Hukum yang Berlaku
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Ketentuan hukum, force majeure, dan penyelesaian sengketa.
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-sm sm:text-base text-gray-600 leading-relaxed">
        <p>
          Empathika berupaya semaksimal mungkin untuk menyediakan layanan dengan keandalan sistem terbaik. Namun demikian, kami tidak bertanggung jawab atas kerugian tidak langsung yang diakibatkan oleh gangguan jaringan penyedia telekomunikasi klien, bencana alam/force majeure, atau tindakan pihak ketiga di luar kendali wajar kami.
        </p>
        <p>
          Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diupayakan untuk diselesaikan terlebih dahulu melalui musyawarah untuk mencapai mufakat.
        </p>
      </div>
    </article>
  );
}
