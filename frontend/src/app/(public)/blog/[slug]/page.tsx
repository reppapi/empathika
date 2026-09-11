export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <div>Artikel: {params.slug}</div>
}
