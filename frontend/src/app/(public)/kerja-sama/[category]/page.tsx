import DetailKerjaSamaClient from "@/features/kerja-sama/components/client/DetailKerjaSamaClient"

export default function DetailKerjaSamaPage({ params }: { params: { category: string } }) {
  return <DetailKerjaSamaClient category={params.category} />
}
