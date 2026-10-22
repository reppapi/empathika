"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getDetailPsikolog, DetailPsikologUI } from "@/features/psikolog/data/detailDummy"
import { DetailPsikologContent } from "@/features/psikolog/components/client/DetailPsikologContent"
import { INITIAL_TENAGA_AHLI } from "@/features/psikolog/data/initialData"
import { psikologService } from "@/services/psikolog.service"

interface PageProps {
  params: { id: string }
}

export default function DetailPsikologPage({ params }: PageProps) {
  const { id } = params
  const [psikolog, setPsikolog] = useState<DetailPsikologUI | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // 1. Coba fetch dari backend database terlebih dahulu
    psikologService
      .getBySlug(id)
      .then((data: any) => {
        if (!isMounted) return
        if (data && (data.id || data.nama_gelar)) {
          const cat = (data.kategori || "").toLowerCase()
          let category: "psikolog" | "konselor" | "peer-konselor" = "psikolog"
          if (cat.includes("peer")) category = "peer-konselor"
          else if (cat.includes("konselor")) category = "konselor"

          let keahlianList: string[] = []
          if (Array.isArray(data.keahlian)) {
            keahlianList = data.keahlian
          } else if (typeof data.keahlian === "string" && data.keahlian.trim()) {
            keahlianList = data.keahlian.split(",").map((s: string) => s.trim()).filter(Boolean)
          } else {
            keahlianList = []
          }

          let jadwalTersedia: { waktu: string; tipe: "online" | "offline" }[] = []
          if (data.jadwal_slot && Array.isArray(data.jadwal_slot) && data.jadwal_slot.length > 0) {
            jadwalTersedia = data.jadwal_slot.slice(0, 3).map((slot: any) => {
              let jamMulai = "09:30"
              let jamSelesai = "10:30"
              if (typeof slot.jam_mulai === "string") {
                const match = slot.jam_mulai.match(/(\d{2}:\d{2})/)
                if (match) jamMulai = match[1]
              }
              if (typeof slot.jam_selesai === "string") {
                const match = slot.jam_selesai.match(/(\d{2}:\d{2})/)
                if (match) jamSelesai = match[1]
              }
              return {
                waktu: `${jamMulai} - ${jamSelesai}`,
                tipe: "online" as const,
              }
            })
          } else {
            jadwalTersedia = []
          }

          const mapped: DetailPsikologUI = {
            id: data.id,
            id_spesialisasi: data.id_spesialisasi || "spec",
            nama_gelar: data.nama_gelar || data.account?.nama || "Psikolog Empathika",
            email: data.account?.email || data.email || "",
            no_str: data.no_str || null,
            no_sipp: data.no_sipp || null,
            foto: data.foto || "/images/psikolog/default.jpg",
            bio: data.bio || "Praktisi kesehatan mental profesional yang berdedikasi mendampingi proses pemulihan dan pertumbuhan diri klien.",
            quote: data.quote || "Setiap perjalanan pemulihan dimulai dari keberanian untuk mendengarkan diri sendiri.",
            instagram: data.instagram || "@empathika.id",
            jenisKelamin: data.jenis_kelamin || "Perempuan",
            pendidikanText: data.pendidikan || "Universitas Indonesia",
            status: data.status || "ACTIVE",
            jumlah_sesi: typeof data.jumlah_sesi === "number" ? data.jumlah_sesi : 0,
            tarif_per_jam: Number(data.tarif_per_jam) || 150000,
            spesialisasi: data.spesialisasi
              ? {
                  id: data.spesialisasi.id || "spec-1",
                  nama: data.spesialisasi.nama || data.kategori || "Psikolog Klinis",
                }
              : {
                  id: "spec-1",
                  nama: data.kategori || "Psikolog Klinis",
                },
            category,
            experienceYears: data.pengalaman_tahun || "3 - 6 Tahun",
            keahlian: keahlianList,
            pendidikan: [data.pendidikan || "Universitas Indonesia"],
            profilLengkap: (() => {
              const bioText = data.bio?.trim()
              if (!bioText) {
                return [
                  "Praktisi kesehatan mental profesional yang berdedikasi mendampingi proses pemulihan dan pertumbuhan diri klien.",
                  data.quote || "Setiap manusia adalah cerita yang sedang bertumbuh, layak didengar, dihargai, dan ditemani.",
                ]
              }
              const paragraphs = bioText.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean)
              return paragraphs.length > 0 ? paragraphs : [bioText]
            })(),
            videoIntroUrl: data.video_intro_url || "https://www.w3schools.com/html/mov_bbb.mp4",
            videoThumbnail: data.foto || "/images/psikolog/default.jpg",
            videoDuration: "01:30",
            jadwalTersedia,
            jadwalAssociate: jadwalTersedia.map((j) => ({
              tipe: j.tipe === "online" ? "Online" : "Offline",
              waktu: j.waktu,
            })),
            testimoni: [
              {
                kutipan: "Sesi konseling sangat membantu saya dalam mengurai benang kusut kecemasan yang selama ini saya rasakan.",
                pemberi: "Klien Anonim, 24 Thn",
              },
            ],
          }

          setPsikolog(mapped)
          setLoading(false)
          return
        }
      })
      .catch(() => {
        // Fallback jika API gagal / data lokal
        if (!isMounted) return

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
              jumlah_sesi: typeof found.jumlahSesi === "number" ? found.jumlahSesi : 0,
              tarif_per_jam: 0,
              spesialisasi: { id: `spec-${found.id}`, nama: found.spesialisasi },
              category: found.kategori,
              keahlian: found.keahlian || dummyDetail?.keahlian || [],
              pendidikanText: found.pendidikanText,
              pendidikan: found.pendidikanText ? [found.pendidikanText] : dummyDetail?.pendidikan || [],
              profilLengkap: (() => {
                const bioText = found.bio?.trim()
                if (!bioText) {
                  return dummyDetail?.profilLengkap || [
                    "Konselor dan tenaga ahli profesional Empathika.",
                    "Siap mendampingi proses pemulihan dan pertumbuhan diri Anda.",
                  ]
                }
                const paragraphs = bioText.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean)
                return paragraphs.length > 0 ? paragraphs : [bioText]
              })(),
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
      })

    return () => {
      isMounted = false
    }
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