import PsikotesDetailClient from "@/features/psikotes/components/client/PsikotesDetailClient"

export default function PsikotesTestPage({ params }: { params: { testId: string } }) {
  return <PsikotesDetailClient params={params} />
}
