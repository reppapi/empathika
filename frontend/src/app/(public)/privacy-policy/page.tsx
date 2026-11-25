import type { Metadata } from "next";
import PrivacyPolicyClient from "@/features/privacy-policy/components/client/PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Empathika",
  description:
    "Kebijakan Privasi Empathika. Komitmen kami dalam menjaga kerahasiaan sesi konseling, perlindungan data pribadi, dan hak privasi pengguna.",
  openGraph: {
    title: "Kebijakan Privasi - Empathika",
    description:
      "Pelajari bagaimana Empathika menjaga dan melindungi kerahasiaan data pribadi serta sesi konseling Anda.",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
