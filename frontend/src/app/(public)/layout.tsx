import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  )
}
