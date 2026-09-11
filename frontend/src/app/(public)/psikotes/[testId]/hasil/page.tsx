export default function PsikotesHasilPage({ params }: { params: { testId: string } }) {
  return <div>Hasil Tes: {params.testId}</div>
}
