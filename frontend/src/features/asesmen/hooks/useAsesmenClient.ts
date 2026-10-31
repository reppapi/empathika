"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useTenantContext } from "@/context/TenantContext"
import { ASESMEN_PACKAGES, type AsesmenPackage } from "../data/asesmenData"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

export function useAsesmenClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams.get("paket")
  const metodeParam = searchParams.get("metode")
  const bannerParam = searchParams.get("banner")
  const { withBiro } = useTenantContext()

  // State asesmen aktif
  const [selectedAsesmenId, setSelectedAsesmenId] = useState<string>("asesmen-minat-bakat")
  // State metode pelaksanaan: "offline" | "online"
  const [metode, setMetode] = useState<"offline" | "online">("offline")
  // State paket online: "gratis" | "berbayar"
  const [selectedOnlinePlan, setSelectedOnlinePlan] = useState<"gratis" | "berbayar">("berbayar")
  // State banner kustom dari dashboard admin layanan
  const [customBanner, setCustomBanner] = useState<string | null>(bannerParam || null)

  // Inisialisasi paket asesmen & metode dari search parameters
  useEffect(() => {
    if (paketParam) {
      const normalized = paketParam.toLowerCase().replace(/\s+/g, "-")
      const matched = ASESMEN_PACKAGES.find(
        (a) =>
          a.id.toLowerCase() === normalized ||
          a.title.toLowerCase() === paketParam.toLowerCase() ||
          a.title.toLowerCase().includes(paketParam.toLowerCase()) ||
          a.shortTitle.toLowerCase() === paketParam.toLowerCase()
      )
      if (matched) {
        setSelectedAsesmenId(matched.id)
      }
    }

    if (metodeParam) {
      const m = metodeParam.toLowerCase()
      if (m === "online" || m === "offline") {
        setMetode(m)
      }
    }
  }, [paketParam, metodeParam])

  // Dapatkan data detail paket asesmen terpilih
  const selectedAsesmen: AsesmenPackage = useMemo(() => {
    return (
      ASESMEN_PACKAGES.find((a) => a.id === selectedAsesmenId) ||
      ASESMEN_PACKAGES[0]
    )
  }, [selectedAsesmenId])

  // Cek apakah Admin telah memasukkan foto awal / banner khusus di dashboard admin layanan
  useEffect(() => {
    const syncAdminBanner = () => {
      try {
        const list = getStoredLayanan()
        const targetTitle = selectedAsesmen.title.toLowerCase().trim()
        const match = list.find((item) => {
          const name = item.layanan.toLowerCase().trim()
          return name === targetTitle || name.includes(targetTitle) || targetTitle.includes(name)
        })

        if (match?.bannerUrl?.trim()) {
          setCustomBanner(match.bannerUrl.trim())
          return
        }
      } catch (err) {
        console.error("Gagal memuat banner kustom admin:", err)
      }

      if (bannerParam) {
        setCustomBanner(bannerParam)
        return
      }

      setCustomBanner(null)
    }

    syncAdminBanner()

    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncAdminBanner)
      return () => window.removeEventListener("storage", syncAdminBanner)
    }
  }, [selectedAsesmen.title, bannerParam])

  const activeHeroImage = customBanner || bannerParam || selectedAsesmen.image

  // URL checkout sesi tatap muka (offline)
  const offlineCheckoutUrl = useMemo(() => {
    return withBiro(
      `/konseling/bayar?layanan=${encodeURIComponent(selectedAsesmen.title)}&metodeKonseling=Offline&metode=offline&bottomDate=${encodeURIComponent("Pilih saat konfirmasi")}&bottomTime=${encodeURIComponent("Sesi Offline (Klinik)")}`
    )
  }, [selectedAsesmen.title, withBiro])

  // URL checkout sesi digital (online)
  const onlineCheckoutUrl = useMemo(() => {
    return withBiro(
      `/psikotes/checkout?testId=${selectedAsesmen.id}&judul=${encodeURIComponent(selectedAsesmen.title + " (Online)")}&harga=${encodeURIComponent(selectedAsesmen.onlinePrice)}&kategori=Asesmen&subjudul=${encodeURIComponent(selectedAsesmen.subtitle)}`
    )
  }, [
    selectedAsesmen.id,
    selectedAsesmen.title,
    selectedAsesmen.onlinePrice,
    selectedAsesmen.subtitle,
    withBiro,
  ])

  return {
    selectedAsesmen,
    metode,
    setMetode,
    selectedOnlinePlan,
    setSelectedOnlinePlan,
    activeHeroImage,
    offlineCheckoutUrl,
    onlineCheckoutUrl,
    withBiro,
  }
}

