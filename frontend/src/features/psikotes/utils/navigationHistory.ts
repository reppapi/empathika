/** Utilitas penjaga riwayat navigasi psikotes agar gestur back-swipe dari hasil tes selalu kembali ke halaman detail tes. */

const DETAIL_ORIGIN_KEY = "empathika_psikotes_detail_origin";

interface AppRouterLike {
  push: (href: any) => void;
  replace: (href: any) => void;
}

/** Tandai bahwa pengguna masuk ke sesi tes langsung dari halaman detail tes ini. */
export function markPsikotesDetailOrigin(testId: string): void {
  try {
    sessionStorage.setItem(DETAIL_ORIGIN_KEY, testId);
  } catch {}
}

/** Hapus penanda asal halaman detail tes (misal saat masuk alur checkout/pembayaran). */
export function clearPsikotesDetailOrigin(): void {
  try {
    sessionStorage.removeItem(DETAIL_ORIGIN_KEY);
  } catch {}
}

/** Periksa apakah entri riwayat tepat di bawah halaman mulai/hasil saat ini adalah detail tes yang sama. */
export function hasPsikotesDetailOrigin(testId: string): boolean {
  try {
    return sessionStorage.getItem(DETAIL_ORIGIN_KEY) === testId;
  } catch {
    return false;
  }
}

/**
 * Arahkan dari halaman pengerjaan tes ke halaman hasil sambil memastikan
 * entri riwayat tepat di bawah halaman hasil adalah halaman detail tes (`/psikotes/[testId]`).
 */
export function navigateToPsikotesHasil(
  router: AppRouterLike,
  testId: string,
  hasilUrl: string
): void {
  if (hasPsikotesDetailOrigin(testId)) {
    router.replace(hasilUrl as any);
    return;
  }

  // Jika masuk langsung ke /mulai (misal dari /psikotes/success atau tautan langsung),
  // ganti entri /mulai di history dengan /psikotes/[testId] lalu push /hasil di atasnya.
  if (typeof window !== "undefined") {
    try {
      window.history.replaceState({ _N: true }, "", `/psikotes/${testId}`);
    } catch {}
  }
  markPsikotesDetailOrigin(testId);
  router.push(hasilUrl as any);
}

