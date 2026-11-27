"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { PsikologUI } from "@/types/psikolog"
import { layananService } from "@/services/layanan.service"
import { psikologService } from "@/services/psikolog.service"
import { mapDbPsikologToUI } from "@/features/psikolog/utils/mapPsikolog"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import { DEFAULT_DAFTAR_HARGA } from "../constants/booking.constants"
import { DaftarHargaItem } from "../types/booking.types"
import { formatRp, isLayananMatch } from "../utils/bookingFormatters"

export function useBookingData(initialLayanan: string) {
  const [openAccordion, setOpenAccordion] = useState<string | null>("konselor")
  const [daftarHarga, setDaftarHarga] = useState<DaftarHargaItem[]>(DEFAULT_DAFTAR_HARGA)
  const [activeFilter, setActiveFilter] = useState(() => {
    const l = initialLayanan.toLowerCase()
    if (l.includes("peer")) return "Peer Konselor"
    if (l.includes("konselor")) return "Konselor"
    return "Psikolog"
  })

  const [dbProfessionals, setDbProfessionals] = useState<PsikologUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isLayananNonaktif, setIsLayananNonaktif] = useState(false)
  const [namaLayananTerpilih, setNamaLayananTerpilih] = useState(initialLayanan || "Konsultasi")
  const [showNonaktifModal, setShowNonaktifModal] = useState(false)

  // Ambil daftar harga murni dari database backend & deteksi status aktif/nonaktif
  const fetchDaftarHarga = useCallback(() => {
    layananService
      .getAll({ kategori: "KONSULTASI" })
      .then((res: any) => {
        const allConsultation = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []

        // Deteksi apakah ada item spesifik yang cocok dengan initialLayanan
        const targetByName = initialLayanan
          ? allConsultation.find((l: any) => isLayananMatch(l.nama, initialLayanan))
          : null

        const isTargetExplicitlyNonaktif =
          targetByName && (targetByName.aktif === false || targetByName.status === "Nonaktif")

        const activeList = allConsultation.filter(
          (l: any) => l.aktif !== false && l.status !== "Nonaktif"
        )

        if (isTargetExplicitlyNonaktif) {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih(targetByName?.nama || initialLayanan)
        } else if (
          initialLayanan &&
          !targetByName &&
          activeList.length === 0 &&
          allConsultation.length > 0
        ) {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih(initialLayanan)
        } else if (!initialLayanan && activeList.length === 0 && allConsultation.length > 0) {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih("Konsultasi")
        } else {
          setIsLayananNonaktif(false)
          const targetLayanan = targetByName || activeList[0] || allConsultation[0]
          if (targetLayanan) {
            setNamaLayananTerpilih(targetLayanan.nama)
            if (typeof window !== "undefined") {
              localStorage.setItem("empathika_last_selected_layanan", targetLayanan.nama)
            }
            const t = targetLayanan.tarif_tenaga_ahli
            const items: DaftarHargaItem[] = []

            // 1. Cek Psikolog
            if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
              items.push({
                id: "psikolog",
                title: "Psikolog",
                weekday: formatRp(t.psikolog.weekday),
                weekend: formatRp(t.psikolog.weekend),
                description:
                  "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
              })
            }

            // 2. Cek Konselor
            if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
              items.push({
                id: "konselor",
                title: "Konselor",
                weekday: formatRp(t.konselor.weekday),
                weekend: formatRp(t.konselor.weekend),
                description:
                  "Konselor adalah tenaga konseling terarah untuk mendampingi isu-isu kehidupan harian dan relasi.",
              })
            }

            // 3. Cek Peer Konselor
            if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
              items.push({
                id: "peer",
                title: "Peer Konselor",
                weekday: formatRp(t.peer.weekday),
                weekend: formatRp(t.peer.weekend),
                description:
                  "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional tanpa stigma.",
              })
            }

            // Fallback jika belum ada objek tarif_tenaga_ahli tapi ada harga_weekday
            if (items.length === 0) {
              items.push({
                id: "psikolog",
                title: "Psikolog",
                weekday: formatRp(targetLayanan.harga_weekday),
                weekend: formatRp(targetLayanan.harga_weekend),
                description:
                  "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
              })
            }

            setDaftarHarga(items)
            if (items.length > 0) {
              setOpenAccordion(items[0].id)
            }
          }
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil tarif layanan konsultasi:", err)
        const stored = getStoredLayanan().filter((l) => l.kategoriId === "01")

        const localTarget = initialLayanan
          ? stored.find((l) => isLayananMatch(l.layanan, initialLayanan))
          : null
        if (localTarget && localTarget.status === "Nonaktif") {
          setIsLayananNonaktif(true)
          setNamaLayananTerpilih(localTarget.layanan)
        } else if (localTarget) {
          if (typeof window !== "undefined") {
            localStorage.setItem("empathika_last_selected_layanan", localTarget.layanan)
          }
          const t = localTarget.tarif_tenaga_ahli
          const items: DaftarHargaItem[] = []
          if (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) {
            items.push({
              id: "psikolog",
              title: "Psikolog",
              weekday: formatRp(t.psikolog.weekday),
              weekend: formatRp(t.psikolog.weekend),
              description:
                "Psikolog adalah tenaga profesional yang memiliki kewenangan untuk melakukan asesmen dan memberikan intervensi klinis.",
            })
          }
          if (t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0)) {
            items.push({
              id: "konselor",
              title: "Konselor",
              weekday: formatRp(t.konselor.weekday),
              weekend: formatRp(t.konselor.weekend),
              description:
                "Konselor adalah tenaga konseling terarah untuk mendampingi isu-isu kehidupan harian dan relasi.",
            })
          }
          if (t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0)) {
            items.push({
              id: "peer",
              title: "Peer Konselor",
              weekday: formatRp(t.peer.weekday),
              weekend: formatRp(t.peer.weekend),
              description:
                "Peer konselor adalah teman sebaya yang dilatih untuk memberikan dukungan emosional tanpa stigma.",
            })
          }
          if (items.length > 0) {
            setDaftarHarga(items)
            setOpenAccordion(items[0].id)
          }
        } else {
          setIsError(true)
        }
      })
  }, [initialLayanan])

  // Ambil daftar tenaga profesional murni dari database backend (tanpa data tiruan/localStorage)
  const fetchProfessionals = useCallback(() => {
    setIsLoading(true)
    psikologService
      .getList()
      .then((list: any[]) => {
        const mappedFromDb = Array.isArray(list) ? list.map(mapDbPsikologToUI) : []
        setDbProfessionals(mappedFromDb)
      })
      .catch((err) => {
        console.error("Gagal mengambil data tenaga profesional:", err)
        setIsError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleRetry = useCallback(() => {
    setIsLoading(true)
    setIsError(false)
    fetchDaftarHarga()
    fetchProfessionals()
  }, [fetchDaftarHarga, fetchProfessionals])

  useEffect(() => {
    fetchDaftarHarga()
    fetchProfessionals()

    const handleSync = () => {
      fetchDaftarHarga()
      fetchProfessionals()
    }

    window.addEventListener("storage", handleSync)

    return () => {
      window.removeEventListener("storage", handleSync)
    }
  }, [fetchDaftarHarga, fetchProfessionals])

  const availableFilters = useMemo(() => {
    const titles = daftarHarga.map((d) => d.title)
    return titles.length > 0 ? titles : ["Psikolog", "Konselor", "Peer Konselor"]
  }, [daftarHarga])

  // Ambil filter aktif yang valid secara aman tanpa useEffect berulang
  const currentFilter = availableFilters.includes(activeFilter)
    ? activeFilter
    : availableFilters[0] || "Psikolog"

  const filteredProfessionals = useMemo(() => {
    return dbProfessionals.filter((p) => {
      if (currentFilter === "Psikolog") return p.category === "psikolog"
      if (currentFilter === "Konselor") return p.category === "konselor"
      if (currentFilter === "Peer Konselor") return p.category === "peer-konselor"
      return true
    })
  }, [dbProfessionals, currentFilter])

  const toggleAccordion = useCallback((id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id))
  }, [])

  return {
    openAccordion,
    toggleAccordion,
    daftarHarga,
    activeFilter,
    setActiveFilter,
    availableFilters,
    currentFilter,
    dbProfessionals,
    filteredProfessionals,
    isLoading,
    isError,
    isLayananNonaktif,
    namaLayananTerpilih,
    showNonaktifModal,
    setShowNonaktifModal,
    handleRetry,
  }
}
