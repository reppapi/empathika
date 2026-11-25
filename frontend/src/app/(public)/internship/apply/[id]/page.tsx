import React from "react"
import { Metadata } from "next"
import InternshipApplyClient from "@/features/internship/components/client/InternshipApplyClient"

export const metadata: Metadata = {
  title: "Formulir Pendaftaran Internship - Empathika",
  description: "Daftar program magang profesional bersama Empathika.",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InternshipApplyPage({ params }: PageProps) {
  const resolvedParams = await params
  return <InternshipApplyClient positionId={resolvedParams.id} />
}
