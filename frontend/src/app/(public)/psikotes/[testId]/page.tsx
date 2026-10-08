import PsikotesDetailClient from "@/features/psikotes/components/PsikotesDetailClient"

export default function PsikotesTestPage({ params }: { params: { testId: string } }) {
  return <PsikotesDetailClient params={params} />
}
