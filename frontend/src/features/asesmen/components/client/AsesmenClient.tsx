"use client"

import { useAsesmenClient } from "../../hooks/useAsesmenClient"
import { AsesmenHero } from "./AsesmenHero"
import { AsesmenMetodeSelector } from "./AsesmenMetodeSelector"
import { AsesmenOfflineView } from "./AsesmenOfflineView"
import { AsesmenOnlineView } from "./AsesmenOnlineView"

export default function AsesmenClient() {
  const {
    selectedAsesmen,
    metode,
    setMetode,
    selectedOnlinePlan,
    setSelectedOnlinePlan,
    activeHeroImage,
    offlineCheckoutUrl,
    onlineCheckoutUrl,
    withBiro,
  } = useAsesmenClient()

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
      />

      {/* ── 3. RINCIAN HARGA & KONTEN SESUAI METODE TERPILIH ── */}
      {metode === "offline" ? (
        <AsesmenOfflineView
          selectedAsesmen={selectedAsesmen}
          offlineCheckoutUrl={offlineCheckoutUrl}
        />
      ) : (
        <AsesmenOnlineView
          selectedAsesmen={selectedAsesmen}
          selectedOnlinePlan={selectedOnlinePlan}
          setSelectedOnlinePlan={setSelectedOnlinePlan}
          onlineCheckoutUrl={onlineCheckoutUrl}
          withBiro={withBiro}
        />
      )}
    </div>
  )
}
