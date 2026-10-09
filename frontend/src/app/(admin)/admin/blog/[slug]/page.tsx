import AdminEditBlogClient from "@/features/admin/blog/components/AdminEditBlogClient"

interface Props {
  params: { slug: string }
}

export const metadata = {
  title: "Edit Blog - Admin Empathika",
  description: "Halaman edit konten blog Empathika",
}

export default function AdminEditBlogPage({ params }: Props) {
  return <AdminEditBlogClient slug={params.slug} />
}
