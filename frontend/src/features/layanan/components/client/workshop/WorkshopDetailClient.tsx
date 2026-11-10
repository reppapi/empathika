"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { useTenantContext } from "@/context/TenantContext"
import { WORKSHOP_DETAILS_DATA, type WorkshopGalleryImage } from "@/features/layanan/data/workshopData"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import { layananService } from "@/services/layanan.service"
import { WorkshopHero } from "./WorkshopHero"
import { WorkshopDescriptionSection } from "./WorkshopDescriptionSection"
import { WorkshopGallery } from "./WorkshopGallery"

interface WorkshopDetailClientProps {
  slug: string
}

export default function WorkshopDetailClient({ slug }: WorkshopDetailClientProps) {
  const { withBiro } = useTenantContext()
  const data = WORKSHOP_DETAILS_DATA[slug]

  if (!data) {
    notFound()
  }

  const [heroImage, setHeroImage] = useState(data.heroImage)
  const [gallery, setGallery] = useState<WorkshopGalleryImage[]>(data.gallery)

  useEffect(() => {
    const applyCustomPhotos = (items: any[]) => {
      if (!Array.isArray(items) || items.length === 0) return

      // Cari layanan workshop yang relevan dengan slug yang aktif
      const match = items.find((item) => {
        const cat = (item.kategori || item.kategoriId || "").toString().toUpperCase()
        const isWs = cat === "WORKSHOP" || cat === "03"
        if (!isWs) return false
        const isActive = item.aktif !== false && (item as any).status !== "Nonaktif"
        if (!isActive) return false
        const name = (item.layanan || item.nama || "").toLowerCase()
        if (slug === "seft") {
          return name.includes("seft")
        }
        if (slug === "peer-helper") {
          return name.includes("peer") || name.includes("sebaya") || name.includes("konselor")
        }
        return name.includes(slug)
      })

      if (match) {
        const rawFotos =
          (match as any).foto_kegiatan ||
          (match?.tarif_tenaga_ahli as any)?.foto_kegiatan

        // Sesuai aturan: Foto yang pertama kali dimasukkan (Slot 1) otomatis menjadi foto hero di paling atas
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
            { src: banner, alt: prev[0]?.alt || "Dokumentasi workshop" },
            ...prev.slice(1),
          ])
        }
      }
    }

    // 1. Ambil dari local storage (instan)
    try {
      const stored = getStoredLayanan()
      applyCustomPhotos(stored)
    } catch (e) {
      console.warn("Gagal membaca foto workshop dari local storage:", e)
    }

    // 2. Ambil dari database backend
    layananService
      .getAll({ kategori: "WORKSHOP" })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        applyCustomPhotos(list)
      })
      .catch((err) => {
        console.warn("Gagal mengambil data foto workshop dari backend:", err?.message)
      })

    const handleSync = () => {
      try {
        const stored = getStoredLayanan()
        applyCustomPhotos(stored)
      } catch {}
    }

    window.addEventListener("storage", handleSync)
    return () => window.removeEventListener("storage", handleSync)
  }, [slug, data])

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800">
      {/* 1. BAGIAN ATAS: KOTAK FOTO HERO + GRADASI + JUDUL */}
      <WorkshopHero
        title={data.title}
        subtitle={data.subtitle}
        heroImage={heroImage}
        heroImageAlt={data.heroImageAlt}
      />

      {/* 2. BAGIAN TENGAH: DESKRIPSI (Pengantar, Manfaat, Detail, Penutup) */}
      <WorkshopDescriptionSection
        intro={data.intro}
        benefits={data.benefits}
        additionalInfo={data.additionalInfo}
        closing={data.closing}
      />

      {/* 3. BAGIAN BAWAH: 3 FOTO BERJAJAR (Kotak & Posisi Rapat ke Atas) */}
      <WorkshopGallery images={gallery} />

      {/* 4. BAGIAN PALING BAWAH: CTA REDIRECT KE KERJA SAMA */}
      <section className="pt-4 pb-20 sm:pb-24 text-center px-4">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <p className="text-base sm:text-lg font-bold text-[#561269] mb-4">
            Tertarik Mengadakan Workshop Ini Bersama Empathika?
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
