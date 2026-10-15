import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#561269]/10">
        <span className="text-4xl font-extrabold text-[#561269]">404</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          Data atau halaman yang kamu cari tidak tersedia.
        </p>
      </div>
      <Link
        href="/admin"
        className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
