import type { Metadata } from "next";
import TermsConditionsClient from "@/features/terms-conditions/components/client/TermsConditionsClient";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - Empathika",
  description:
    "Syarat & Ketentuan Layanan Empathika. Pelajari pedoman, hak, kewajiban, dan tata kelola pelaksanaan sesi konseling, asesmen, dan pembayaran di platform kami.",
  openGraph: {
    title: "Syarat & Ketentuan Layanan - Empathika",
    description:
      "Pedoman dan ketentuan resmi penggunaan platform konsultasi psikologi dan asesmen Empathika.",
  },
};

export default function SyaratKetentuanPage() {
  return <TermsConditionsClient />;
}
