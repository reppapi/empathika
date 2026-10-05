import { Navbar } from "@/components/layout/Navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Navbar melayang yang tadi kita buat */}
      <Navbar />
      
      {/* Konten halamannya akan muncul di bawah Navbar */}
      <main className="min-h-screen pt-24">
        {children}
      </main>
    </>
  )
}
