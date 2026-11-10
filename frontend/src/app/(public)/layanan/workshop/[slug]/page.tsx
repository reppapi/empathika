import { notFound } from "next/navigation"
import { Suspense } from "react"
import WorkshopDetailClient from "@/features/layanan/components/client/workshop/WorkshopDetailClient"
import { WORKSHOP_DETAILS_DATA } from "@/features/layanan/data/workshopData"

interface WorkshopDetailPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return Object.keys(WORKSHOP_DETAILS_DATA).map((slug) => ({
    slug,
  }))
}

export function generateMetadata({ params }: WorkshopDetailPageProps) {
  const item = WORKSHOP_DETAILS_DATA[params.slug]
  if (!item) {
    return { title: "Workshop | Empathika" }
  }

  return {
    title: `${item.title} | Workshop Empathika`,
    description: item.intro,
  }
}

export default function WorkshopDetailPage({ params }: WorkshopDetailPageProps) {
  const { slug } = params

  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-gray-500">Memuat...</div>}>
      <WorkshopDetailClient slug={slug} />
    </Suspense>
  )
}

