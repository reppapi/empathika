import PsikotesMulaiClient from "@/features/psikotes/components/client/PsikotesMulaiClient"

export default function PsikotesMulaiPage({ params }: { params: { testId: string } }) {
  return <PsikotesMulaiClient params={params} />
}
