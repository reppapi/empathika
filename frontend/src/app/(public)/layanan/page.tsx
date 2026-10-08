import LayananClient from "@/features/layanan/components/LayananClient"

export default function LayananPage() {
  return <LayananClient />
}

export default function LayananPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-4 lg:pt-[104px] lg:pb-8 lg:h-screen font-poppins flex items-center justify-center">
        Memuat layanan...
      </div>
    }>
      <LayananContent />
    </Suspense>
  )
}
