"use client";

import { useSearchParams } from "next/navigation";
import PsikotesHasilGratisClient from "./PsikotesHasilGratisClient";
import PsikotesHasilBerbayarClient from "./PsikotesHasilBerbayarClient";

export { PsikotesHasilGratisClient, PsikotesHasilBerbayarClient };

export default function PsikotesHasilClient({ params }: { params: { testId: string } }) {
  const searchParams = useSearchParams();

  // Evaluasi jenis akses psikotes: gratis atau berbayar
  const isPaid =
    searchParams.get("paket") === "berbayar" ||
    searchParams.get("plan") === "berbayar" ||
    searchParams.get("tipe") === "berbayar";

  if (isPaid) {
    return <PsikotesHasilBerbayarClient params={params} />;
  }

  return <PsikotesHasilGratisClient params={params} />;
}
