"use client"

import React, { useState, useEffect } from "react"
import { useTenant } from "@/hooks/useTenant"
import { internshipService, InternshipPosition } from "@/services/internship.service"
import { InternshipHero } from "./landing/InternshipHero"
import { InternshipPillars } from "./landing/InternshipPillars"
import { InternshipPositionsList } from "./landing/InternshipPositionsList"
import { InternshipBenefits } from "./landing/InternshipBenefits"

export default function InternshipClient() {
  const { withBiro } = useTenant()
  const [positions, setPositions] = useState<InternshipPosition[]>([])
  const [loading, setLoading] = useState(true)

  // Muat posisi publik langsung dari database
  const loadPositions = async () => {
    try {
      const data = await internshipService.getPublicPositions()
      setPositions(data)
    } catch {
      setPositions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPositions()

    // Sinkronisasi otomatis saat ada pembaruan dari tab lain atau dashboard admin
    const handleUpdate = () => {
      loadPositions()
    }

    window.addEventListener("empathika_internship_updated", handleUpdate)
    window.addEventListener("storage", handleUpdate)
    return () => {
      window.removeEventListener("empathika_internship_updated", handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [])

  const scrollToPositions = () => {
    const el = document.getElementById("posisi-tersedia")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBFD] text-gray-800 font-sans selection:bg-[#561269] selection:text-white">
      {/* ── 1. HERO SECTION ── */}
      <InternshipHero onScrollToPositions={scrollToPositions} />

      {/* ── 2. TIGA PILAR UTAMA ── */}
      <InternshipPillars />

      {/* ── 3. OPEN POSITIONS SECTION ── */}
      <InternshipPositionsList positions={positions} loading={loading} withBiro={withBiro} />

      {/* ── 4. BENEFIT / MENGAPA BERGABUNG ── */}
      <InternshipBenefits onScrollToPositions={scrollToPositions} />
    </div>
  )
}
