import PsikotesHasilClient from "@/features/psikotes/components/PsikotesHasilClient"

export default function PsikotesHasilPage({ params }: { params: { testId: string } }) {
  return <PsikotesHasilClient params={params} />
}
