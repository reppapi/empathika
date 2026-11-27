import React from "react";

export default function SectionPolicyChanges() {
  return (
    <article
      id="perubahan-kebijakan"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          6
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Pembaruan & Penyesuaian Kebijakan
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Transparansi mengenai evaluasi dan revisi berkala dokumen ini.
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-sm sm:text-base text-gray-600 leading-relaxed">
        <p>
          Kami berhak memperbarui Kebijakan Privasi ini secara berkala agar senantiasa selaras dengan pengembangan fitur layanan, perkembangan teknologi perlindungan data, serta penyesuaian terhadap peraturan perundang-undangan Republik Indonesia yang berlaku.
        </p>
        <p>
          Setiap pembaruan akan kami publikasikan langsung pada halaman ini dengan mencantumkan tanggal revisi terbaru di bagian atas. Apabila terdapat perubahan mendasar yang berdampak signifikan terhadap tata kelola data Anda, kami dapat mengabarkan pemberitahuan tambahan melalui email atau pengumuman di aplikasi/situs web kami. Kami menganjurkan Anda untuk meninjau halaman ini dari waktu ke waktu.
        </p>
      </div>
    </article>
  );
}
