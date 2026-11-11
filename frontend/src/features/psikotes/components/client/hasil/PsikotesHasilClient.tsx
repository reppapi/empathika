"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PsikotesHasilGratisClient from "./PsikotesHasilGratisClient";
import PsikotesHasilBerbayarClient from "./PsikotesHasilBerbayarClient";

export { PsikotesHasilGratisClient, PsikotesHasilBerbayarClient };

export default function PsikotesHasilClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tangani gestur back-swipe browser / mobile agar langsung kembali ke halaman detail tes
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      router.replace(`/psikotes/${params.testId}` as any);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [params.testId, router]);

  // Evaluasi jenis akses psikotes: gratis atau berbayar
  const isPaid =
    Boolean(searchParams.get("bookingId")) ||
    Boolean(searchParams.get("orderId")) ||
    searchParams.get("paket") === "berbayar" ||
    searchParams.get("plan") === "berbayar" ||
    searchParams.get("tipe") === "berbayar" ||
    params.testId.toLowerCase().includes("dass");

  if (isPaid) {
    return <PsikotesHasilBerbayarClient params={params} />;
  }

  return <PsikotesHasilGratisClient params={params} />;
}
