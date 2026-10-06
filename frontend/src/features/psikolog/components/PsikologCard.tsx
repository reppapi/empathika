import Image from "next/image"
import Link from "next/link"
import { Psikolog, PsikologUI } from "@/types/psikolog"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

interface PsikologCardProps {
  psikolog: Psikolog | PsikologUI
}

export function PsikologCard({ psikolog }: PsikologCardProps) {
  const peran = psikolog.spesialisasi?.nama || (("category" in psikolog && psikolog.category === "konselor") ? "Konselor" : "Psikolog")
  const experience = ("experienceYears" in psikolog && psikolog.experienceYears) ? psikolog.experienceYears : "Pengalaman 2+ Thn"
  const labelJadwal = ("labelJadwal" in psikolog && psikolog.labelJadwal) ? psikolog.labelJadwal : "Jadwal Terdekat"
  const jadwalList = ("jadwalTersedia" in psikolog && psikolog.jadwalTersedia) ? psikolog.jadwalTersedia : []
  const keahlianList = ("keahlian" in psikolog && psikolog.keahlian) ? psikolog.keahlian : []

  const formattedTarif = psikolog.tarif_per_jam ? new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(psikolog.tarif_per_jam) : "Rp 120.000"

  const initial = psikolog.nama_gelar ? psikolog.nama_gelar.charAt(0) : "P"

  return (
    <Link href={`/psikolog/${psikolog.id}` as any} className="block group h-full focus:outline-none">
      <Card className="p-5 sm:p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 h-full flex flex-col justify-between border-gray-100 bg-white rounded-3xl group-hover:-translate-y-1">
        <div>
          {/* Header Profil (Foto & Info Utama) */}
          <div className="flex gap-4 items-start">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 border border-purple-100 bg-purple-50 shadow-sm">
              {psikolog.foto ? (
                <Image 
                  src={psikolog.foto} 
                  alt={psikolog.nama_gelar} 
                  fill 
                  sizes="72px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#8B3A9C] to-[#561269] text-white flex items-center justify-center font-bold text-2xl select-none">
                  {initial}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[#007EA7] text-xs sm:text-sm font-semibold tracking-wide uppercase truncate">
                {peran}
              </p>
              <h3 className="text-gray-900 font-bold text-base sm:text-lg leading-snug group-hover:text-[#6B2FA0] transition-colors line-clamp-2">
                {psikolog.nama_gelar}
              </h3>
            </div>
          </div>

          {/* Spesialisasi & Pendidikan Badge */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {psikolog.spesialisasi?.nama && (
              <Badge variant="info" className="text-xs font-medium">
                {psikolog.spesialisasi.nama}
              </Badge>
            )}
            {"pendidikanText" in psikolog && psikolog.pendidikanText && (
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium text-purple-900 bg-purple-50 rounded-full border border-purple-100 truncate max-w-[210px]">
                {psikolog.pendidikanText}
              </span>
            )}
          </div>

          {/* Area Keahlian / Bidang (Menggantikan Quote pada Card) */}
          {keahlianList && keahlianList.length > 0 && (
            <div className="mt-3.5 space-y-1.5">
              <p className="text-[11px] font-bold text-[#561269] uppercase tracking-wider">
                Fokus Keahlian
              </p>
              <div className="flex flex-wrap gap-1.5">
                {keahlianList.slice(0, 4).map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-[#FAF5FD] hover:bg-[#F3E8FC] text-[#561269] text-xs font-medium px-2.5 py-1 rounded-lg border border-purple-100 transition-colors"
                  >
                    {item}
                  </span>
                ))}
                {keahlianList.length > 4 && (
                  <span className="inline-block bg-gray-50 text-gray-500 text-xs font-medium px-2 py-1 rounded-lg border border-gray-100">
                    +{keahlianList.length - 4} lainnya
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sesi & Pengalaman */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-xs sm:text-sm font-medium text-gray-700">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
              <svg className="w-4 h-4 text-[#561269]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              <span>{psikolog.jumlah_sesi}+ Sesi</span>
            </div>

            <div className="flex items-center gap-1.5 bg-orange-50/70 text-orange-800 px-2.5 py-1 rounded-lg">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v2h3a1 1 0 011 1v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7a1 1 0 011-1h3V4zm2 2h8V4H6v2z" />
              </svg>
              <span>{experience}</span>
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* Jadwal Terdekat */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{labelJadwal}</p>
            {jadwalList && jadwalList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {jadwalList.map((jadwal, idx) => (
                  <span 
                    key={idx} 
                    className="bg-purple-50/70 border border-purple-100/60 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700"
                  >
                    {jadwal.waktu}{" "}
                    <span className={jadwal.tipe === "online" ? "text-[#007EA7] font-semibold" : "text-rose-600 font-semibold"}>
                      ({jadwal.tipe})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Buka profil untuk cek jadwal lengkap</span>
            )}
          </div>
        </div>

        {/* Footer Card: Tarif & Aksi */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400">Mulai dari</p>
            <p className="text-sm sm:text-base font-bold text-[#561269]">{formattedTarif} <span className="text-[11px] font-normal text-gray-500">/ jam</span></p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#561269] group-hover:translate-x-1 transition-transform">
            Lihat Detail →
          </span>
        </div>
      </Card>
    </Link>
  )
}