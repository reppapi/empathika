import { Metadata } from "next"
import InternshipClient from "@/features/internship/components/client/InternshipClient"

export const metadata: Metadata = {
  title: "Program Internship - Empathika",
  description:
    "Bergabunglah dalam Program Internship Empathika untuk belajar, berkarya, dan bertumbuh dalam industri kesehatan mental dan digital media.",
}

export default function InternshipPage() {
  return <InternshipClient />
}
