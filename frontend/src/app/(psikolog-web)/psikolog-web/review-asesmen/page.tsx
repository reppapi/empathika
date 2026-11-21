import { Suspense } from "react";
import PsikologReviewAsesmenClient from "@/features/psikotes/components/psikolog/PsikologReviewAsesmenClient";

export const metadata = {
  title: "Review Psikotes - Portal Psikolog Empathika",
  description: "Tinjau dan berikan telaah klinis hasil pengerjaan asesmen psikotes.",
};

export default function ReviewAsesmenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center font-sans text-gray-400 text-sm">
          Memuat antrean review asesmen psikotes...
        </div>
      }
    >
      <PsikologReviewAsesmenClient />
    </Suspense>
  );
}

