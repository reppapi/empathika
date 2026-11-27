"use client"

import { useSearchParams } from "next/navigation"
import { useTenantContext } from "@/context/TenantContext"
import { useBookingData } from "../../hooks/useBookingData"
import { BookingHero } from "./sections/BookingHero"
import { BookingErrorAlert } from "./sections/BookingErrorAlert"
import { BookingInactiveBanner } from "./sections/BookingInactiveBanner"
import { BookingPriceAccordion } from "./sections/BookingPriceAccordion"
import { BookingFilterTabs } from "./sections/BookingFilterTabs"
import { BookingProfessionalsGrid } from "./sections/BookingProfessionalsGrid"
import { BookingInactiveModal } from "./sections/BookingInactiveModal"

export default function BookingClient() {
  const { isBiro, slug, biroProfile, withBiro } = useTenantContext()
  const searchParams = useSearchParams()
  const initialLayanan = searchParams?.get("layanan") || ""

  const {
    openAccordion,
    toggleAccordion,
    daftarHarga,
    availableFilters,
    currentFilter,
    setActiveFilter,
    filteredProfessionals,
    isLoading,
    isError,
    isLayananNonaktif,
    namaLayananTerpilih,
    showNonaktifModal,
    setShowNonaktifModal,
    handleRetry,
  } = useBookingData(initialLayanan)

  const biroName =
    biroProfile?.nama_biro?.trim() ||
    (slug ? slug.replace(/^biro[-_]/i, "").trim().toUpperCase() : null)

  return (
    <div className="relative min-h-screen w-full font-poppins pb-24 overflow-hidden">
      {/* Background Shape & Hero Section */}
      <BookingHero isBiro={isBiro} biroName={biroName} />

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[900px] px-6 mt-8 sm:mt-12 relative z-10">
        {/* Status Error Jika Koneksi Gagal */}
        {isError && <BookingErrorAlert onRetry={handleRetry} />}

        {!isError && (
          <>
            {/* Banner Informasi Layanan Nonaktif */}
            {isLayananNonaktif && (
              <BookingInactiveBanner namaLayanan={namaLayananTerpilih} />
            )}

            {/* Daftar Harga & Accordion */}
            <BookingPriceAccordion
              daftarHarga={daftarHarga}
              openAccordion={openAccordion}
              onToggle={toggleAccordion}
            />

            {/* Filter Section */}
            <BookingFilterTabs
              availableFilters={availableFilters}
              currentFilter={currentFilter}
              onSelectFilter={setActiveFilter}
            />

            {/* Dynamic Grid Professionals */}
            <BookingProfessionalsGrid
              isLoading={isLoading}
              professionals={filteredProfessionals}
              currentFilter={currentFilter}
              isLayananNonaktif={isLayananNonaktif}
              onAttemptBooking={() => setShowNonaktifModal(true)}
            />
          </>
        )}
      </div>

      {/* Modal Dialog Notifikasi Layanan Dinonaktifkan */}
      <BookingInactiveModal
        isOpen={showNonaktifModal}
        onClose={() => setShowNonaktifModal(false)}
        namaLayanan={namaLayananTerpilih}
        layananHref={withBiro("/layanan")}
      />
    </div>
  )
}
