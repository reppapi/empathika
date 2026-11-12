/** Komponen router hasil psikotes untuk memisahkan tampilan hasil gratis dan laporan resmi berbayar. */
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PsikotesHasilGratisClient from "./PsikotesHasilGratisClient";
import PsikotesHasilBerbayarClient from "./PsikotesHasilBerbayarClient";
import {
  hasPsikotesDetailOrigin,
  markPsikotesDetailOrigin,
} from "@/features/psikotes/utils/navigationHistory";

export { PsikotesHasilGratisClient, PsikotesHasilBerbayarClient };

export default function PsikotesHasilClient({ params }: { params: { testId: string } }) {
  const searchParams = useSearchParams();

  // Jika pengguna membuka /hasil secara langsung (bukan dari /psikotes/[testId] -> /mulai),
  // sisipkan entri detail tes tepat di bawah /hasil saat ada interaksi pertama agar back-swipe tetap ke detail tes.
  useEffect(() => {
    if (hasPsikotesDetailOrigin(params.testId)) {
      return;
    }

    const ensureDetailHistoryEntry = () => {
      if (hasPsikotesDetailOrigin(params.testId)) return;
      const savedState = window.history.state;
      if (!savedState || !savedState.__NA) return;

      const currentUrl = window.location.href;
      window.history.replaceState({ _N: true }, "", `/psikotes/${params.testId}`);
      window.history.pushState(savedState, "", currentUrl);
      markPsikotesDetailOrigin(params.testId);
    };

    window.addEventListener("pointerdown", ensureDetailHistoryEntry, { once: true, capture: true });
    window.addEventListener("keydown", ensureDetailHistoryEntry, { once: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", ensureDetailHistoryEntry, { capture: true });
      window.removeEventListener("keydown", ensureDetailHistoryEntry, { capture: true });
    };
  }, [params.testId]);

  // Evaluasi jenis akses psikotes: gratis atau berbayar
  const isExplicitFree =
    searchParams.get("paket") === "gratis" &&
    !searchParams.get("orderId") &&
    !params.testId.toLowerCase().includes("dass");

  const isPaid =
    !isExplicitFree &&
    (Boolean(searchParams.get("bookingId")) ||
      Boolean(searchParams.get("orderId")) ||
      searchParams.get("paket") === "berbayar" ||
      searchParams.get("plan") === "berbayar" ||
      searchParams.get("tipe") === "berbayar" ||
      params.testId.toLowerCase().includes("dass"));

  if (isPaid) {
    return <PsikotesHasilBerbayarClient params={params} />;
  }

  return <PsikotesHasilGratisClient params={params} />;
}
