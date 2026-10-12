import FormulirKerjaSamaClient from "@/features/kerja-sama/components/client/FormulirKerjaSamaClient"

export default function FormulirKerjaSamaTypePage({
  params,
}: {
  params: { type: string }
}) {
  return <FormulirKerjaSamaClient formType={params.type} />
}
