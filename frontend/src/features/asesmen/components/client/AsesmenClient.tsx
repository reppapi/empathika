"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useAsesmenClient } from "../../hooks/useAsesmenClient"
import { AsesmenHero } from "./AsesmenHero"
import { AsesmenMetodeSelector } from "./AsesmenMetodeSelector"
import { AsesmenOfflineView } from "./AsesmenOfflineView"
import { AsesmenOnlineView } from "./AsesmenOnlineView"
import ClientErrorState from "@/components/shared/ClientErrorState"

export default function AsesmenClient() {
  const {
    selectedAsesmen,
    isLoading,
    isError,
    errorMessage,
    refetch,
    metode,
    setMetode,
    allowsOnline,
    allowsOffline,
    selectedDate,
    setSelectedDate,
    selectedOfflinePlan,
    setSelectedOfflinePlan,
    selectedOnlinePlan,
    setSelectedOnlinePlan,
    activeHeroImage,
    offlineCheckoutUrl,
    onlineCheckoutUrl,
    withBiro,
  } = useAsesmenClient()

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAFA] font-poppins px-4">
        <Loader2 className="w-9 h-9 animate-spin text-[#561269] mb-3" />
        <p className="text-sm font-semibold text-gray-500">Memuat detail layanan asesmen...</p>
      </div>
    )
  }

  if (isError || !selectedAsesmen) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAFA] font-poppins px-4 py-16">
        <div className="max-w-md w-full">
          <ClientErrorState
            title="Layanan Asesmen Tidak Tersedia"
            message={
              errorMessage ||
              "Layanan asesmen yang Anda tuju tidak ditemukan atau belum aktif di database."
            }
            onRetry={refetch}
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
    <div className="relative min-h-screen w-full font-poppins bg-[#FAFAFA] pb-28 overflow-hidden">
      {/* ── 1. HERO BANNER BERGAMBAR (TERHUBUNG KE FOTO ADMIN LAYANAN) ── */}
      <AsesmenHero
        title={selectedAsesmen.title}
        subtitle={selectedAsesmen.subtitle}
        image={activeHeroImage}
      />

      {/* ── 2. DUA KARTU PILIHAN METODE (OFFLINE VS ONLINE) ── */}
      <AsesmenMetodeSelector
        metode={metode}
        setMetode={setMetode}
        selectedAsesmen={selectedAsesmen}
        withBiro={withBiro}
        allowsOnline={allowsOnline}
        allowsOffline={allowsOffline}
      />

      {/* ── 3. RINCIAN HARGA & KONTEN SESUAI METODE TERPILIH ── */}
      {metode === "offline" ? (
        <AsesmenOfflineView
          selectedAsesmen={selectedAsesmen}
          selectedOfflinePlan={selectedOfflinePlan}
          setSelectedOfflinePlan={setSelectedOfflinePlan}
          offlineCheckoutUrl={offlineCheckoutUrl}
          allowsOffline={allowsOffline}
        />
      ) : (
        <AsesmenOnlineView
          selectedAsesmen={selectedAsesmen}
          selectedOnlinePlan={selectedOnlinePlan}
          setSelectedOnlinePlan={setSelectedOnlinePlan}
          onlineCheckoutUrl={onlineCheckoutUrl}
          withBiro={withBiro}
          allowsOnline={allowsOnline}
        />
      )}
    </div>
  )
}
