"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTenantContext } from "@/context/TenantContext"
import { SEMINAR_DETAIL_DATA, type SeminarGalleryImage } from "@/features/layanan/data/seminarData"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import { layananService } from "@/services/layanan.service"
import { parseWorkshopSeminarDeskripsi } from "@/features/layanan/utils/deskripsiParser"
import { SeminarHero } from "./SeminarHero"
import { SeminarDescriptionSection } from "./SeminarDescriptionSection"
import { ProgramGallery } from "./ProgramGallery"

export default function SeminarDetailPage() {
  const { withBiro } = useTenantContext()
  const data = SEMINAR_DETAIL_DATA

  const [title, setTitle] = useState(data.title)
  const [intro, setIntro] = useState(data.intro)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [programs, setPrograms] = useState(data.programs)
  const [closing, setClosing] = useState(data.closing)
  const [heroImage, setHeroImage] = useState(data.heroImage)
  const [gallery, setGallery] = useState<SeminarGalleryImage[]>(data.gallery)

  useEffect(() => {
    const applySeminarData = (items: any[]) => {
      if (!Array.isArray(items) || items.length === 0) return

      // Cari layanan kategori seminar yang aktif
      const match = items.find((item) => {
        const cat = (item.kategori || item.kategoriId || "").toString().toUpperCase()
        const isCat = cat === "SEMINAR" || cat === "04"
        const isActive = item.aktif !== false && (item as any).status !== "Nonaktif"
        return isCat && isActive
      })

      if (match) {
        if (match.nama || match.layanan) {
          setTitle(match.nama || match.layanan)
        }

        // Terapkan pemisahan deskripsi:
        // Paragraf sebelum Enter -> intro di atas program seminar
        // Paragraf setelah Enter -> additionalInfo (kotak penjelasan di bawah program)
        if (match.deskripsi) {
          const parsed = parseWorkshopSeminarDeskripsi(match.deskripsi)
          if (parsed.intro) setIntro(parsed.intro)
          if (parsed.additionalInfo) setAdditionalInfo(parsed.additionalInfo)
        }

        const rawFotos =
          (match as any).foto_kegiatan ||
          (match?.tarif_tenaga_ahli as any)?.foto_kegiatan

        // Sesuai aturan: Foto pertama (Slot 1) otomatis menjadi foto hero di paling atas
        const firstPhoto =
          (Array.isArray(rawFotos) && rawFotos[0]) ||
          match.bannerUrl ||
          match.banner_url

        if (firstPhoto) {
          setHeroImage(firstPhoto)
        }

        if (Array.isArray(rawFotos) && rawFotos.length > 0) {
          const updatedGallery = data.gallery.map((orig, idx) => ({
            src: rawFotos[idx] || orig.src,
            alt: orig.alt,
          }))
          setGallery(updatedGallery)
        } else if (match.bannerUrl || match.banner_url) {
          const banner = match.bannerUrl || match.banner_url
          setGallery((prev) => [
            { src: banner, alt: prev[0]?.alt || "Dokumentasi seminar" },
            ...prev.slice(1),
          ])
        }
      }
    }

    // 1. Ambil dari local storage (instan)
    try {
      const stored = getStoredLayanan()
      applySeminarData(stored)
    } catch (e) {
      console.warn("Gagal membaca foto seminar dari local storage:", e)
    }

    // 2. Ambil dari database backend
    layananService
      .getAll({ kategori: "SEMINAR" })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        applySeminarData(list)
      })
      .catch((err) => {
        console.warn("Gagal mengambil data foto seminar dari backend:", err?.message)
      })

    const handleSync = () => {
      try {
        const stored = getStoredLayanan()
        applySeminarData(stored)
      } catch {}
    }

    window.addEventListener("storage", handleSync)
    return () => window.removeEventListener("storage", handleSync)
  }, [data])

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800">
      {/* 1. BAGIAN ATAS: KOTAK FOTO HERO + GRADASI + JUDUL */}
      <SeminarHero
        title={title}
        heroImage={heroImage}
        heroImageAlt={`Dokumentasi ${title}`}
      />

      {/* 2. BAGIAN TENGAH: DESKRIPSI (Pengantar, 2 Kotak Program, Kotak Penjelasan di Bawah Program, Penutup) */}
      <SeminarDescriptionSection
        intro={intro}
        programs={programs}
        additionalInfo={additionalInfo}
        closing={closing}
      />

      {/* 3. BAGIAN BAWAH: 3 FOTO BERJAJAR (Kotak & Posisi Rapat ke Atas) */}
      <ProgramGallery images={gallery} />

      {/* 4. BAGIAN PALING BAWAH: CTA REDIRECT KE KERJA SAMA */}
      <section className="pt-4 pb-20 sm:pb-24 text-center px-4">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <p className="text-base sm:text-lg font-bold text-[#561269] mb-4">
            Tertarik Mengadakan {title} Bersama Empathika?
          </p>
          <Link
            href={withBiro("/kerja-sama") as any}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#EAB308] hover:bg-yellow-500 text-black font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <span>Mari Berkolaborasi</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  )
}
