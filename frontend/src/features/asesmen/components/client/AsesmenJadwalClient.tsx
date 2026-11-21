"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { BookingJadwalShared } from "@/components/shared/BookingJadwalShared"
import { buildAsesmenPackageFromLayanan } from "../../data/asesmenData"
import { layananService, type LayananApiResponse } from "@/services/layanan.service"
import ClientErrorState from "@/components/shared/ClientErrorState"
import { useTenantContext } from "@/context/TenantContext"

export default function AsesmenJadwalClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams?.get("paket") || ""
  const layananParam = searchParams?.get("layanan") || ""
  const hariParam = searchParams?.get("hari") === "weekend" ? "weekend" : "weekday"
  const hargaParam = searchParams?.get("harga") || ""
  const weekdayParam = searchParams?.get("weekday") || ""
  const weekendParam = searchParams?.get("weekend") || ""
  const { withBiro } = useTenantContext()

  const [backendLayanan, setBackendLayanan] = useState<LayananApiResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const rawTarget = useMemo(() => {
    return (layananParam || paketParam || "").trim()
  }, [layananParam, paketParam])

  const fetchLayanan = useCallback(() => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    layananService
      .getAll({ kategori: "ASESMEN" })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setBackendLayanan(list)

        const activeList = list.filter(
          (item: any) => item.aktif !== false && item.status !== "Nonaktif"
        )

        if (activeList.length === 0) {
          setIsError(true)
          setErrorMessage("Belum ada layanan asesmen yang aktif di database.")
          return
        }

        if (rawTarget) {
          const targetQuery = rawTarget.toLowerCase().trim()
          const cleanTarget = targetQuery.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")

          const found = activeList.some((item: any) => {
            const name = (item.nama || item.layanan || "").toLowerCase().trim()
            const id = String(item.id || "").toLowerCase().trim()
            if (id === targetQuery || name === targetQuery) return true
            if (name.includes(targetQuery) || targetQuery.includes(name)) return true
            const cleanName = name.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")
            if (cleanTarget && cleanName && (cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName))) return true
            return false
          })

          if (!found) {
            setIsError(true)
            setErrorMessage(`Layanan asesmen "${rawTarget}" tidak ditemukan atau telah dinonaktifkan oleh admin.`)
          }
        }
      })
      .catch((err: any) => {
        console.warn("AsesmenJadwalClient: Gagal memuat layanan asesmen:", err?.message)
        setIsError(true)
        setErrorMessage("Terjadi kendala saat memuat jadwal layanan dari database. Silakan muat ulang halaman.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [rawTarget])

  useEffect(() => {
    fetchLayanan()
  }, [fetchLayanan])

  // Cari data layanan aktual dari backend murni
  const matchedDbService = useMemo(() => {
    if (backendLayanan.length === 0) return null

    const activeList = backendLayanan.filter(
      (item: any) => item.aktif !== false && item.status !== "Nonaktif"
    )
    if (activeList.length === 0) return null

    if (!rawTarget) {
      return activeList[0]
    }

    const targetQuery = rawTarget.toLowerCase().trim()
    const cleanTarget = targetQuery.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")

    const found = activeList.find((item: any) => {
      const name = (item.nama || item.layanan || "").toLowerCase().trim()
      const id = String(item.id || "").toLowerCase().trim()
      if (id === targetQuery || name === targetQuery) return true
      if (name.includes(targetQuery) || targetQuery.includes(name)) return true
      const cleanName = name.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")
      if (cleanTarget && cleanName && (cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName))) return true
      return false
    })

    return found || null
  }, [backendLayanan, rawTarget])

  // Paket asesmen dinamis lengkap dengan harga yang murni dari database
  const dynamicAsesmenPackage = useMemo(() => {
    if (!matchedDbService) return null

    const basePkg = buildAsesmenPackageFromLayanan(matchedDbService)
    const m = matchedDbService as any
    const t = m?.tarif_tenaga_ahli || {}

    const dbOfflineWk =
      m?.tarif_asesmen?.offline_weekday ??
      t?.asesmen?.offline?.weekday ??
      t?.offline?.weekday ??
      m?.harga_weekday ??
      0

    const dbOfflineWknd =
      m?.tarif_asesmen?.offline_weekend ??
      t?.asesmen?.offline?.weekend ??
      t?.offline?.weekend ??
      m?.harga_weekend ??
      0

    const formatRp = (val: any, fallbackStr: string): string => {
      if (val === undefined || val === null || val === "") return fallbackStr
      const str = String(val).trim()
      if (str.startsWith("Rp")) return str
      const num = Number(str.replace(/[^\d]/g, ""))
      if (isNaN(num) || num <= 0) return fallbackStr
      return `Rp ${num.toLocaleString("id-ID")}`
    }

    const finalWeekday = formatRp(
      weekdayParam || (hariParam === "weekday" && hargaParam ? hargaParam : undefined) || dbOfflineWk,
      basePkg.weekday
    )

    const finalWeekend = formatRp(
      weekendParam || (hariParam === "weekend" && hargaParam ? hargaParam : undefined) || dbOfflineWknd,
      basePkg.weekend
    )

    const resolvedTitle = m?.nama || m?.layanan || rawTarget || basePkg.title

    return {
      ...basePkg,
      id: m?.id || basePkg.id,
      title: resolvedTitle,
      shortTitle: resolvedTitle,
      weekday: finalWeekday,
      weekend: finalWeekend,
    }
  }, [matchedDbService, weekdayParam, weekendParam, hariParam, hargaParam, rawTarget])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAFA] font-poppins px-4">
        <Loader2 className="w-9 h-9 animate-spin text-[#561269] mb-3" />
        <p className="text-sm font-semibold text-gray-500">Memuat jadwal layanan asesmen...</p>
      </div>
    )
  }

  if (isError || !dynamicAsesmenPackage) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAFA] font-poppins px-4 py-16">
        <div className="max-w-md w-full">
          <ClientErrorState
            title="Jadwal Asesmen Tidak Tersedia"
            message={
              errorMessage ||
              "Layanan asesmen yang Anda tuju tidak ditemukan atau belum aktif di database."
            }
            onRetry={fetchLayanan}
            retryText="Muat Ulang"
          />
          <div className="mt-6 text-center">
            <Link
              href={withBiro("/layanan?category=05") as any}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#561269] hover:underline"
            >
              ← Kembali ke Daftar Layanan Asesmen
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <BookingJadwalShared
      mode="asesmen"
      showStepper={true}
      title="Jadwalkan layanan anda"
      subtitle="Pilih metode dan jadwal sesi asesmen tatap muka yang Anda inginkan. Slot waktu hanya dapat dipilih jika telah dibuka oleh admin klinik."
      asesmenPackage={dynamicAsesmenPackage}
      initialMetode="Offline"
      initialOfflinePlan={hariParam}
    />
  )
}
