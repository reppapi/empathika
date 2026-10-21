'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PsikologWebError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Psikolog portal runtime error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 gap-4 text-center my-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-[#561269]">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Gagal Memuat Jadwal Psikolog
        </h2>
        <p className="mt-1 text-xs text-gray-500 max-w-sm">
          Terjadi kendala saat memuat data jadwal. Silakan klik muat ulang untuk mencoba kembali.
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition-all active:scale-95"
        >
          Muat Ulang
        </button>
        <Link
          href="/psikolog-web/jadwal"
          className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Segarkan Halaman
        </Link>
      </div>
    </div>
  );
}
