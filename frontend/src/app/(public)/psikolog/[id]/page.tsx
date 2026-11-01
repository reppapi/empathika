"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTenant } from "@/hooks/useTenant"
import { getDetailPsikolog, DetailPsikologUI } from "@/features/psikolog/data/detailDummy"
import { DetailPsikologContent } from "@/features/psikolog/components/client/DetailPsikologContent"
import { INITIAL_TENAGA_AHLI } from "@/features/psikolog/data/initialData"
import { psikologService } from "@/services/psikolog.service"

interface PageProps {
  params: { id: string }
}

function resolveDetailSchedule(psikologId: string, psikologNama?: string, rawBackendSlots?: any[]) {
  const rawSlots: any[] = []
  const bookedKeys = new Set<string>()

  if (Array.isArray(rawBackendSlots)) {
    rawSlots.push(...rawBackendSlots)
    rawBackendSlots.forEach((s: any) => {
      const st = (s.status || "").toUpperCase()
      if (st === "SUDAH_DIBOOKING" || st === "TIDAK_TERSEDIA" || st === "CANCELLED" || Boolean(s.booking_konsultasi)) {
        const j = (s.jam_mulai || "").toString().match(/(\d{2}:\d{2})/)?.[1]
        const d = (s.tanggal || "").toString().match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
        if (d && j) bookedKeys.add(`${d}_${j}`)
        if (j) bookedKeys.add(j)
      }
    })
  }

  const hasDbSlots = Array.isArray(rawBackendSlots) && rawBackendSlots.length > 0

  if (!hasDbSlots && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      if (raw) {
        const parsed: any[] = JSON.parse(raw)
        const matched = parsed.filter(
          (s) =>
            s.id_psikolog === psikologId ||
            (psikologNama &&
              (s.nama_psikolog === psikologNama ||
                s.nama_psikolog?.toLowerCase().includes(psikologNama.toLowerCase()) ||
                psikologNama.toLowerCase().includes(s.nama_psikolog?.toLowerCase())))
        )
        rawSlots.push(...matched)
      }
    } catch {}
  }

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const parseJam = (val: any): string => {
    if (!val) return "00:00"
    if (typeof val === "string") {
      const m = val.match(/(\d{2}:\d{2})/)
      if (m) return m[1]
    }
    if (val instanceof Date || (typeof val === "string" && val.includes("T"))) {
      const d = new Date(val)
      return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
    }
    return "00:00"
  }

  const parseMinutes = (jamStr: string): number => {
    const parts = jamStr.split(":").map(Number)
    return (parts[0] || 0) * 60 + (parts[1] || 0)
  }

  const parseDateKey = (val: any): string | null => {
    if (!val) return null
    if (typeof val === "string") {
      const match = val.match(/^(\d{4}-\d{2}-\d{2})/)
      if (match) return match[1]
    }
    if (val instanceof Date) {
      return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, "0")}-${String(val.getDate()).padStart(2, "0")}`
    }
    return null
  }

  // Filter slot yang belum lewat
  const validSlots = rawSlots.filter((slot) => {
    const statusUpper = (slot.status || "").toUpperCase()
    if (statusUpper === "SUDAH_DIBOOKING" || statusUpper === "TIDAK_TERSEDIA" || statusUpper === "CANCELLED") {
      return false
    }

    const slotDate = parseDateKey(slot.tanggal)
    const jamMulai = parseJam(slot.jam_mulai)
    const startMinutes = parseMinutes(jamMulai)

    if (slotDate && bookedKeys.has(`${slotDate}_${jamMulai}`)) return false
    if (bookedKeys.has(jamMulai)) return false

    if (slotDate) {
      if (slotDate < todayKey) return false
      if (slotDate === todayKey && currentMinutes >= startMinutes) return false
      return true
    }

    if (currentMinutes >= startMinutes) return false
    return true
  })

  const seen = new Set<string>()
  const result: { waktu: string; tipe: "Online" | "Offline"; dateKey: string; startMinutes: number }[] = []

  for (const s of validSlots) {
    const start = parseJam(s.jam_mulai)
    const end = parseJam(s.jam_selesai)
    const waktu = s.label_waktu || `${start} - ${end}`
    const slotDateKey = parseDateKey(s.tanggal) || todayKey
    const uniqueKey = `${slotDateKey}_${waktu}`

    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey)
      const m = (s.metode || s.tipe_jadwal || "").toUpperCase()
      const tipe: "Online" | "Offline" = m.includes("OFFLINE") ? "Offline" : "Online"
      result.push({ waktu, tipe, dateKey: slotDateKey, startMinutes: parseMinutes(start) })
    }
  }

  result.sort((a, b) => {
    if (a.dateKey !== b.dateKey) {
      return a.dateKey.localeCompare(b.dateKey)
    }
    return a.startMinutes - b.startMinutes
  })

  return result.slice(0, 3).map((s) => ({ waktu: s.waktu, tipe: s.tipe }))
}

export default function DetailPsikologPage({ params }: PageProps) {
  const { id } = params
  const { withBiro } = useTenant()
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

          const scheduleList = resolveDetailSchedule(data.id, data.nama_gelar || data.account?.nama, data.jadwal_slot)
          const jadwalTersedia = scheduleList.map((s) => ({
            waktu: s.waktu,
            tipe: (s.tipe === "Offline" ? "offline" : "online") as "online" | "offline",
          }))

          let resolvedQuote = data.quote || ""
          if (!resolvedQuote && typeof window !== "undefined") {
            try {
              const saved = localStorage.getItem("empathika_tenaga_ahli_data")
              if (saved) {
                const list = JSON.parse(saved)
                const localMatch = list.find((t: any) =>
                  t.id === data.id ||
                  t.accountId === data.id ||
                  (t.email && (t.email === data.account?.email || t.email === data.email)) ||
                  (t.nama && t.nama.toLowerCase() === (data.nama_gelar || data.account?.nama || "").toLowerCase())
                )
                if (localMatch?.quote) {
                  resolvedQuote = localMatch.quote
                }
              }
            } catch {}
          }

          const mapped: DetailPsikologUI = {
            id: data.id,
            id_spesialisasi: data.id_spesialisasi || "spec",
            nama_gelar: data.nama_gelar || data.account?.nama || "Psikolog Empathika",
            email: data.account?.email || data.email || "",
            no_str: data.no_str || null,
            no_sipp: data.no_sipp || null,
            foto: data.foto || "/images/psikolog/default.jpg",
            bio: data.bio || "",
            quote: resolvedQuote,
            instagram: data.instagram || "",
            jenisKelamin: data.jenis_kelamin || "",
            pendidikanText: data.pendidikan || "",
            status: data.status || "ACTIVE",
            jumlah_sesi: typeof data.jumlah_sesi === "number" ? data.jumlah_sesi : 0,
            tarif_per_jam: Number(data.tarif_per_jam) || 0,
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
            experienceYears: data.pengalaman_tahun || "",
            keahlian: keahlianList,
            pendidikan: data.pendidikan ? [data.pendidikan] : [],
            profilLengkap: (() => {
              const bioText = data.bio?.trim()
              if (!bioText) {
                return []
              }
              const paragraphs = bioText.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean)
              return paragraphs.length > 0 ? paragraphs : [bioText]
            })(),
            videoIntroUrl: data.video_intro_url || "",
            videoThumbnail: data.video_thumbnail || data.foto || "/images/psikolog/default.jpg",
            videoDuration: data.video_duration || "",
            jadwalTersedia,
            jadwalAssociate: scheduleList,
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
          const cleanId = decodeURIComponent(id).toLowerCase().replace(/-/g, " ").trim()
          const found = list.find((t: any) =>
            t.id === id ||
            t.accountId === id ||
            (t.nama && t.nama.toLowerCase() === cleanId) ||
            (t.nama && t.nama.toLowerCase().includes(cleanId)) ||
            (cleanId.length > 2 && t.nama && cleanId.includes(t.nama.toLowerCase())) ||
            (t.email && t.email.toLowerCase() === id.toLowerCase())
          )

          if (found) {
            const dummyDetail = getDetailPsikolog(id)
            const scheduleList = resolveDetailSchedule(found.id || "1", found.nama)
            const merged: DetailPsikologUI = {
              id: found.id,
              id_spesialisasi: `spec-${found.id}`,
              nama_gelar: found.nama,
              email: found.email,
              no_str: found.kategori === "psikolog" ? (found.noStr || null) : null,
              no_sipp: found.kategori === "psikolog" ? (found.noSipp || null) : null,
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
              jadwalTersedia: scheduleList.length > 0 ? scheduleList : dummyDetail?.jadwalTersedia,
              jadwalAssociate: scheduleList.length > 0 ? scheduleList : dummyDetail?.jadwalAssociate,
              testimoni: dummyDetail?.testimoni || [],
            }
            setPsikolog(merged)
            setLoading(false)
            return
          }
        } catch {}

        const fallback = getDetailPsikolog(id)
        if (fallback) {
          const scheduleList = resolveDetailSchedule(id, fallback.nama_gelar)
          if (scheduleList.length > 0) {
            fallback.jadwalAssociate = scheduleList
            fallback.jadwalTersedia = scheduleList
          }
        }
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
          href={withBiro("/psikolog") as any}
          className="bg-[#502380] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3d1a63] transition-colors shadow-sm"
        >
          Kembali ke Daftar Psikolog
        </Link>
      </div>
    )
  }

  return <DetailPsikologContent psikolog={psikolog} />
}