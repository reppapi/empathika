"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getDetailPsikolog, DetailPsikologUI } from "@/features/psikolog/data/detailDummy"
import { DetailPsikologContent } from "@/features/psikolog/components/DetailPsikologContent"
import { INITIAL_TENAGA_AHLI } from "@/features/admin/psikolog/initialData"

interface PageProps {
  params: { id: string }
}

export default function DetailPsikologPage({ params }: PageProps) {
  const { id } = params
  const [psikolog, setPsikolog] = useState<DetailPsikologUI | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Coba baca dari data shared tenaga ahli agar perubahan di admin utama & profil psikolog langsung muncul di POV klien
    try {
      const saved = localStorage.getItem("empathika_tenaga_ahli_data")
      const list = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const found = list.find((t: any) => t.id === id)

      if (found) {
        const dummyDetail = getDetailPsikolog(id)
        const merged: DetailPsikologUI = {
          id: found.id,
          id_spesialisasi: `spec-${found.id}`,
          nama_gelar: found.nama,
          email: found.email,
          no_str: found.noStr || null,
          no_sipp: found.noSipp || null,
          foto: found.foto,
          bio: found.bio,
          quote: found.quote,
          instagram: found.instagram,
          status: found.statusAkses === "AKTIF" ? "ACTIVE" : "INACTIVE",
          jumlah_sesi: found.jumlahSesi || 50,
          tarif_per_jam: 0,
          spesialisasi: { id: `spec-${found.id}`, nama: found.spesialisasi },
          category: found.kategori,
          keahlian: found.keahlian || dummyDetail?.keahlian || [],
          pendidikanText: found.pendidikanText,
          pendidikan: found.pendidikanText ? [found.pendidikanText] : dummyDetail?.pendidikan || [],
          profilLengkap: dummyDetail?.profilLengkap || [
            found.bio || "Konselor dan tenaga ahli profesional Empathika.",
            "Siap mendampingi proses pemulihan dan pertumbuhan diri Anda."
          ],
          videoIntroUrl: dummyDetail?.videoIntroUrl,
          videoThumbnail: dummyDetail?.videoThumbnail || found.foto,
          videoDuration: dummyDetail?.videoDuration,
          jadwalTersedia: dummyDetail?.jadwalTersedia,
          jadwalAssociate: dummyDetail?.jadwalAssociate,
          testimoni: dummyDetail?.testimoni || [],
        }
        setPsikolog(merged)
        setLoading(false)
        return
      }
    } catch {}

    const fallback = getDetailPsikolog(id)
    setPsikolog(fallback)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8 text-gray-500 font-poppins text-sm">
        Memuat data psikolog...
      </div>
    )
  }

  if (!psikolog) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center p-4 text-center font-poppins">
        <div className="w-16 h-16 bg-purple-100 text-[#502380] rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
          ?
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profil Psikolog Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6 text-sm max-w-md">
          Maaf, data psikolog atau konselor yang Anda cari tidak tersedia atau ID tidak valid.
        </p>
        <Link 
          href="/psikolog"
          className="bg-[#502380] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3d1a63] transition-colors shadow-sm"
        >
          Kembali ke Daftar Psikolog
        </Link>
      </div>
    )
  }

  return <DetailPsikologContent psikolog={psikolog} />
}