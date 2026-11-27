import React from "react";

export default function SectionThirdParties() {
  return (
    <article
      id="pihak-ketiga"
      className="bg-white rounded-2xl border border-purple-100/80 p-6 sm:p-8 shadow-xs scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold text-base shrink-0">
          4
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Keterlibatan Pihak Ketiga & Pembagian Terbatas
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Prinsip ketat kami mengenai siapa saja pihak yang dapat berinteraksi dengan data Anda.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
        <p>
          Prinsip utama kami jelas: <strong className="text-gray-900 font-semibold">Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak mana pun</strong> untuk tujuan pemasaran komersial pihak luar tanpa persetujuan eksplisit Anda.
        </p>

        <p>
          Data pribadi Anda hanya dapat dibagikan atau diproses dalam lingkup yang sangat terbatas demi kepentingan berikut:
        </p>

        <ul className="space-y-3 pl-1">
          <li className="flex items-start gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
            <div>
              <strong className="text-gray-900 font-semibold">Mitra Tenaga Ahli (Psikolog & Konselor):</strong>
              <span className="text-gray-600 ml-1">
                Informasi yang relevan dengan kebutuhan sesi diteruskan kepada psikolog yang bertugas menangani Anda, guna memfasilitasi konseling yang tepat sasaran dan profesional.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
            <div>
              <strong className="text-gray-900 font-semibold">Penyedia Layanan Pendukung Operasional:</strong>
              <span className="text-gray-600 ml-1">
                Pihak ketiga terpercaya yang kami libatkan untuk kebutuhan infrastruktur teknis (seperti gerbang pembayaran resmi untuk memproses transaksi secara aman dan penyedia layanan pengiriman notifikasi otomatis), yang semuanya terikat komitmen kerahasiaan ketat.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#561269] mt-2 shrink-0" />
            <div>
              <strong className="text-gray-900 font-semibold">Kewajiban Hukum & Regulasi:</strong>
              <span className="text-gray-600 ml-1">
                Apabila diwajibkan secara sah oleh peraturan perundang-undangan di Republik Indonesia, penetapan pengadilan, atau permintaan resmi dari aparat penegak hukum yang berwenang demi keselamatan atau penegakan hukum.
              </span>
            </div>
          </li>
        </ul>
      </div>
    </article>
  );
}
