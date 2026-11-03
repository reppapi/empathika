import PsikotesDetailClient from "@/features/psikotes/components/client/catalog/PsikotesDetailClient"

export default function PsikotesTestPage({ params }: { params: { testId: string } }) {
  return <PsikotesDetailClient params={params} />
}
