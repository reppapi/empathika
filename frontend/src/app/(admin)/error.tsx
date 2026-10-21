'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 gap-4 text-center my-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Terjadi Kesalahan pada Panel Admin
        </h2>
        <p className="mt-1 text-xs text-gray-500 max-w-sm">
          Terjadi kendala saat memuat data operasional. Silakan muat ulang.
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-[#561269] px-5 py-2 text-xs font-semibold text-white hover:bg-[#6f1b87] transition-colors"
        >
          Muat Ulang
        </button>
        <Link
          href="/admin"
          className="rounded-xl border border-gray-300 px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
