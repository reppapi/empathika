export function SidebarAdmin() {
  return (
    <aside className="w-64 border-r bg-gray-900 text-white min-h-screen p-4">
      <h2 className="mb-6 text-lg font-bold">Admin Panel</h2>
      <nav className="flex flex-col gap-2">
        <a href="/admin">Dashboard</a>
        <a href="/admin/psikolog">Psikolog</a>
        <a href="/admin/layanan">Layanan</a>
        <a href="/admin/event">Event</a>
        <a href="/admin/transaksi">Transaksi</a>
        <a href="/admin/psikotes">Psikotes</a>
        <a href="/admin/pengaturan">Pengaturan</a>
      </nav>
    </aside>
  )
}

