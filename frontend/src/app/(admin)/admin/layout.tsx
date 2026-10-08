import SidebarAdmin from "@/components/layout/SidebarAdmin"
import AdminNavbar from "@/components/layout/AdminNavbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Bypass auth sementara agar tampilan admin bisa langsung di-preview
  return (
    <div className="min-h-screen bg-[#FBFBFC] font-poppins text-gray-800 flex">
      {/* 1. Sidebar Navigasi Kiri */}
      <SidebarAdmin />

      {/* 2. Area Konten Kanan */}
      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <AdminNavbar />

        {/* Konten Halaman */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
