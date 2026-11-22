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
import { isDASS, isMCMI } from "@/features/psikotes/utils/instrumentDetector";

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
  // Catatan: Hanya DASS dan MCMI yang dapat memiliki tampilan laporan resmi berbayar.
  // Seluruh instrumen lainnya (PHQ-9, GAD-7, CATS, CDI, CHOCI-R, IGDS9-SF, RCMAS, PBQ) adalah psikotes gratis.
  const isPaidInstrument =
    params.testId === "2fe42061-fbb8-47b3-8c4f-b991e4d04fe2" || // MCMI-IV UUID
    params.testId === "e0e97a5d-4bea-466e-aa8c-2cff1345b2fa" || // DASS-42 UUID
    isDASS(null, params.testId) ||
    isMCMI(null, params.testId) ||
    params.testId.toLowerCase().includes("dass") ||
    params.testId.toLowerCase().includes("depresi-kecemasan-dan-stres") ||
    params.testId.toLowerCase().includes("mcmi") ||
    params.testId.toLowerCase().includes("pola-klinis");

  const isExplicitFree = searchParams.get("paket") === "gratis";

  const isPaid = isPaidInstrument && !isExplicitFree;

  if (isPaid) {
    return <PsikotesHasilBerbayarClient params={params} />;
  }

  return <PsikotesHasilGratisClient params={params} />;
}
