import Link from 'next/link';

export default function PublicNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#561269]/10">
        <span className="text-4xl font-extrabold text-[#561269]">404</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Konten Tidak Ditemukan
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          Konten yang kamu cari tidak tersedia atau sudah dihapus.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-[#561269] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6f1b87] transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
