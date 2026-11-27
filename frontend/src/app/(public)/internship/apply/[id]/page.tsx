import React from "react"
import { Metadata } from "next"
import InternshipApplyClient from "@/features/internship/components/client/InternshipApplyClient"

export const metadata: Metadata = {
  title: "Formulir Pendaftaran Internship - Empathika",
  description: "Daftar program magang profesional bersama Empathika.",
}

interface PageProps {
  params: { id: string }
}

export default function InternshipApplyPage({ params }: PageProps) {
  return <InternshipApplyClient positionId={params.id} />
}
