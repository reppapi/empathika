'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global layout error:', error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white gap-6 px-4 text-center font-sans">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl font-extrabold text-red-600">!</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Terjadi Kesalahan Sistem
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Terjadi masalah pada sistem aplikasi. Silakan muat ulang halaman.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="rounded-xl bg-[#561269] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6f1b87] transition-colors"
        >
          Muat Ulang Halaman
        </button>
      </body>
    </html>
  );
}
