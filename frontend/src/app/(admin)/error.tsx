'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-8 w-8 text-red-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Terjadi Kesalahan
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {error.message || 'Terjadi kesalahan yang tidak terduga.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl bg-[#561269] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6f1b87] transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
