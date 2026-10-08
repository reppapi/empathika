import PsikotesMulaiClient from "@/features/psikotes/components/PsikotesMulaiClient"

export default function PsikotesMulaiPage({ params }: { params: { testId: string } }) {
  return <PsikotesMulaiClient params={params} />
}
