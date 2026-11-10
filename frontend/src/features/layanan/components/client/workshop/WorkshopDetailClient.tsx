"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTenantContext } from "@/context/TenantContext"
import { WORKSHOP_DETAILS_DATA, type WorkshopGalleryImage, type WorkshopContentData } from "@/features/layanan/data/workshopData"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import { layananService } from "@/services/layanan.service"
import { parseWorkshopSeminarDeskripsi } from "@/features/layanan/utils/deskripsiParser"
import { WorkshopHero } from "./WorkshopHero"
import { WorkshopDescriptionSection } from "./WorkshopDescriptionSection"
import { WorkshopGallery } from "./WorkshopGallery"

interface WorkshopDetailClientProps {
  slug: string
}

export default function WorkshopDetailClient({ slug }: WorkshopDetailClientProps) {
  const { withBiro } = useTenantContext()

  // Fallback data jika slug belum ada di static data
  const fallbackData: WorkshopContentData = WORKSHOP_DETAILS_DATA[slug] || {
    slug,
    title: slug === "seft" ? "Workshop SEFT" : slug === "peer-helper" ? "Pelatihan & Workshop Konselor Sebaya" : "Workshop Empathika",
    subtitle: slug === "seft" ? "Spiritual Emotional Freedom Technique" : slug === "peer-helper" ? "Peer Helper Training Program" : "Program Workshop & Pelatihan",
    intro:
      "Workshop pengembangan diri dan interaktif dari Empathika untuk membantu peserta mengasah keterampilan psikologis, regulasi emosi, serta kesehatan mental.",
    benefits: [
      "Membantu meredakan stres, kecemasan berlebih, dan ketegangan emosional",
      "Meningkatkan ketenangan batin, kejernihan pikiran, dan kesadaran diri (self-awareness)",
      "Membekali peserta keterampilan praktis yang dapat diterapkan mandiri sehari-hari",
    ],
    additionalInfo:
      "Workshop ini dirancang secara praktis, aplikatif, dan interaktif dengan bimbingan langsung dari fasilitator dan psikolog profesional.",
    closing:
      "Program terbuka bagi individu, komunitas, institusi pendidikan, maupun perusahaan yang ingin menciptakan lingkungan sehat mental.",
    heroImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    heroImageAlt: "Hero Dokumentasi Workshop Empathika",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi sesi workshop",
      },
      {
        src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi interaksi peserta workshop",
      },
      {
        src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi reflektif peserta workshop",
      },
    ],
  }

  const [title, setTitle] = useState(fallbackData.title)
  const [subtitle, setSubtitle] = useState(fallbackData.subtitle)
  const [intro, setIntro] = useState(fallbackData.intro)
  const [benefits, setBenefits] = useState(fallbackData.benefits)
  const [additionalInfo, setAdditionalInfo] = useState(fallbackData.additionalInfo)
  const [closing, setClosing] = useState(fallbackData.closing)
  const [heroImage, setHeroImage] = useState(fallbackData.heroImage)
  const [gallery, setGallery] = useState<WorkshopGalleryImage[]>(fallbackData.gallery)

  useEffect(() => {
    const applyLayananData = (items: any[]) => {
      if (!Array.isArray(items) || items.length === 0) return

      // Cari layanan workshop yang relevan dengan slug atau ID
      const match = items.find((item) => {
        const cat = (item.kategori || item.kategoriId || "").toString().toUpperCase()
        const isWs = cat === "WORKSHOP" || cat === "03"
        if (!isWs) return false
        const isActive = item.aktif !== false && (item as any).status !== "Nonaktif"
        if (!isActive) return false

        const idMatch = String(item.id).toLowerCase() === slug.toLowerCase()
        if (idMatch) return true

        const name = (item.layanan || item.nama || "").toLowerCase()
        if (slug === "seft") {
          return name.includes("seft")
        }
        if (slug === "peer-helper") {
          return name.includes("peer") || name.includes("sebaya") || name.includes("konselor")
        }
        return name.includes(slug.toLowerCase())
      })

      if (match) {
        if (match.nama || match.layanan) {
          setTitle(match.nama || match.layanan)
        }

        // Terapkan pemisahan deskripsi:
        // Paragraf sebelum Enter -> intro di atas manfaat
        // Paragraf setelah Enter -> additionalInfo (kotak penjelasan di bawah manfaat)
        if (match.deskripsi) {
          const parsed = parseWorkshopSeminarDeskripsi(match.deskripsi)
          if (parsed.intro) setIntro(parsed.intro)
          if (parsed.additionalInfo) setAdditionalInfo(parsed.additionalInfo)
        }

        const rawFotos =
          (match as any).foto_kegiatan ||
          (match?.tarif_tenaga_ahli as any)?.foto_kegiatan

        // Foto pertama (Slot 1) otomatis menjadi foto hero di paling atas
        const firstPhoto =
          (Array.isArray(rawFotos) && rawFotos[0]) ||
          match.bannerUrl ||
          match.banner_url

        if (firstPhoto) {
          setHeroImage(firstPhoto)
        }

        if (Array.isArray(rawFotos) && rawFotos.length > 0) {
          const updatedGallery = fallbackData.gallery.map((orig, idx) => ({
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
      applyLayananData(stored)
    } catch (e) {
      console.warn("Gagal membaca workshop dari local storage:", e)
    }

    // 2. Ambil dari database backend
    layananService
      .getAll({ kategori: "WORKSHOP" })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        applyLayananData(list)
      })
      .catch((err) => {
        console.warn("Gagal mengambil data workshop dari backend:", err?.message)
      })

    const handleSync = () => {
      try {
        const stored = getStoredLayanan()
        applyLayananData(stored)
      } catch {}
    }

    window.addEventListener("storage", handleSync)
    return () => window.removeEventListener("storage", handleSync)
  }, [slug])

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800">
      {/* 1. BAGIAN ATAS: KOTAK FOTO HERO + GRADASI + JUDUL */}
      <WorkshopHero
        title={title}
        subtitle={subtitle}
        heroImage={heroImage}
        heroImageAlt={`Dokumentasi ${title}`}
      />

      {/* 2. BAGIAN TENGAH: DESKRIPSI (Pengantar di atas Manfaat, Kotak Manfaat, Kotak Penjelasan di bawah Manfaat, Penutup) */}
      <WorkshopDescriptionSection
        intro={intro}
        benefits={benefits}
        additionalInfo={additionalInfo}
        closing={closing}
      />

      {/* 3. BAGIAN BAWAH: 3 FOTO BERJAJAR */}
      <WorkshopGallery images={gallery} />

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
