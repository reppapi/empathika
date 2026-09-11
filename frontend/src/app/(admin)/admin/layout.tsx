import { redirect } from "next/navigation"

// TODO: Ganti dengan pengecekan session nyata
async function checkAdminAuth() {
  // Contoh: cek cookie/session
  const isAdmin = false
  if (!isAdmin) redirect("/login")
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAuth()
  return <div className="admin-layout">{children}</div>
}

