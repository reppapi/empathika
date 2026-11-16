/** Halaman detail paket psikotes di dashboard admin dengan 6 tab navigasi lengkap. */
import { Suspense } from "react";
import AdminDetailPaketClient from "@/features/psikotes/components/admin/AdminDetailPaketClient";

export const metadata = {
  title: "Detail Paket Psikotes - Admin Empathika",
  description: "Rincian spesifikasi, butir soal, skoring, interpretasi, dan statistik paket psikotes",
};

interface Props {
  params: { id: string };
}

export default function AdminDetailPaketPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-400 font-poppins text-sm">
          Memuat detail paket psikotes...
        </div>
      }
    >
      <AdminDetailPaketClient paketId={params.id} />
    </Suspense>
  );
}

