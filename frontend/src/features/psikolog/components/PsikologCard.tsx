import Image from "next/image"
import Link from "next/link"
import { PsikologUI } from "@/types/psikolog"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

interface PsikologCardProps {
  psikolog: PsikologUI
}

export function PsikologCard({ psikolog }: PsikologCardProps) {
  // Ambil nama spesialisasi dari relasi database Prisma
  const peran = psikolog.spesialisasi?.nama || "Psikolog"

  return (
    <Link href={`/psikolog/${psikolog.id}`} className="block group h-full">
      <Card className="p-5 hover:shadow-md transition-shadow h-full flex flex-col justify-between border-gray-200">
        <div>
          {/* Header Profil (Foto bundar & Nama) */}
          <div className="flex gap-4 items-start">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
              {psikolog.foto ? (
                <Image 
                  src={psikolog.foto} 
                  alt={psikolog.nama_gelar} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              ) : (
                <div className="w-full h-full bg-[#561269]/10 text-[#561269] flex items-center justify-center font-bold text-xl select-none">
                  {psikolog.nama_gelar.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-[#007EA7] text-sm font-semibold mb-1">{peran}</p>
              <h3 className="text-gray-900 font-bold text-lg leading-tight group-hover:text-[#6B2FA0] transition-colors">
                {psikolog.nama_gelar}
              </h3>
            </div>
          </div>

          {/* Spesialisasi pakai komponen Badge mu */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {psikolog.spesialisasi?.nama && (
              <Badge variant="info">{psikolog.spesialisasi.nama}</Badge>
            )}
          </div>

          {/* Sesi & Pengalaman */}
          <div className="flex gap-4 mt-4 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              {psikolog.jumlah_sesi}+ Sesi
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v2h3a1 1 0 011 1v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7a1 1 0 011-1h3V4zm2 2h8V4H6v2z" />
              </svg>
              {psikolog.experienceYears}
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* Jadwal Terdekat */}
          <div>
            <p className="text-sm text-gray-800 mb-3">{psikolog.labelJadwal}</p>
            <div className="flex flex-wrap gap-2">
              {psikolog.jadwalTersedia.map((jadwal, idx) => (
                <span 
                  key={idx} 
                  className="bg-gray-100 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700"
                >
                  {jadwal.waktu}{" "}
                  <span className={jadwal.tipe === "online" ? "text-[#007EA7]" : "text-red-600"}>
                    ({jadwal.tipe})
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}