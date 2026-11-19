import { Suspense } from "react";
import PsikologReviewDetailClient from "@/features/psikotes/components/psikolog/PsikologReviewDetailClient";

export const metadata = {
  title: "Lembar Telaah Klinis Asesmen - Portal Psikolog Empathika",
  description: "Workspace penelaahan psikometri dan penyusunan laporan hasil asesmen psikotes.",
};

interface Props {
  params: { bookingId: string };
}

export default function ReviewAsesmenDetailPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#F3F4F6] flex flex-col items-center justify-center font-sans text-gray-500 text-sm">
          Memuat lembar kerja telaah klinis...
        </div>
      }
    >
      <PsikologReviewDetailClient bookingId={params.bookingId} />
    </Suspense>
  );
}

