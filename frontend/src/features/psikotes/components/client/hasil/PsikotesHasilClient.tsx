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
import { isCHOCI, isDASS, isMCMI } from "@/features/psikotes/utils/instrumentDetector";

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
  // DASS-42, MCMI-IV, dan CHOCI-R (serta paket berbayar dengan bookingId/paket=berbayar) menggunakan tampilan laporan resmi berbayar.
  const isPaidInstrument =
    params.testId === "2fe42061-fbb8-47b3-8c4f-b991e4d04fe2" || // MCMI-IV UUID
    params.testId === "e0e97a5d-4bea-466e-aa8c-2cff1345b2fa" || // DASS-42 UUID
    isDASS(null, params.testId) ||
    isMCMI(null, params.testId) ||
    isCHOCI(null, params.testId) ||
    params.testId.toLowerCase().includes("dass") ||
    params.testId.toLowerCase().includes("depresi-kecemasan-dan-stres") ||
    params.testId.toLowerCase().includes("mcmi") ||
    params.testId.toLowerCase().includes("pola-klinis") ||
    params.testId.toLowerCase().includes("choci") ||
    params.testId.toLowerCase().includes("ocd");

  const isExplicitPaid =
    searchParams.get("paket") === "berbayar" ||
    searchParams.get("plan") === "berbayar" ||
    Boolean(searchParams.get("bookingId")) ||
    Boolean(searchParams.get("orderId"));

  const isExplicitFree = searchParams.get("paket") === "gratis";

  const isPaid = (isPaidInstrument || isExplicitPaid) && !isExplicitFree;

  if (isPaid) {
    return <PsikotesHasilBerbayarClient params={params} />;
  }

  return <PsikotesHasilGratisClient params={params} />;
}
