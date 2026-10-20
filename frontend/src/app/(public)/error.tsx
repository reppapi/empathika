'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-white gap-5 px-4 text-center my-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-[#561269]">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Gagal Memuat Halaman
        </h2>
        <p className="mt-1.5 text-xs text-gray-500 max-w-sm">
          Terjadi kesalahan saat memuat data halaman. Silakan coba lagi atau kembali ke halaman utama.
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-[#561269] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#6f1b87] transition-colors"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-6 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
