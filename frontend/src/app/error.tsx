'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <span className="text-3xl font-extrabold text-red-600">!</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Terjadi Kesalahan
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          Maaf, terjadi kendala saat memuat halaman ini. Silakan coba lagi atau kembali ke beranda.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-[#561269] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6f1b87] transition-colors"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
