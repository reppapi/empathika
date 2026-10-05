import Link from "next/link"

export function CtaSection() {
  return (
    <section className="w-full bg-[#ECECEC] py-16 md:py-24 px-4 mt-16 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl md:text-4xl font-extrabold text-[#3B074B] leading-snug">
          Satu cerita bisa menjadi awal dari perubahan.
          <br />
          Mulai konsultasimu hari ini.
        </h2>

        <div className="pt-2">
          <Link
            href={"/booking" as any}
            className="inline-block bg-[#F8F3FA] hover:bg-white text-[#561269] font-bold text-lg md:text-xl px-10 py-4 rounded-full shadow-md hover:shadow-lg border border-[#D9C2E3] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Daftar Konseling
          </Link>
        </div>
      </div>
    </section>
  )
}
