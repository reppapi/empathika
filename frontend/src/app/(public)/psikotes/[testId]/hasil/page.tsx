"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRight, Calendar, Info, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Dummy data
const resultData = {
  testName: "Kalkulator Tingkat Stres",
  result: {
    grade: "Tinggi",
    score: 85,
    maxScore: 100,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  interpretation: "Berdasarkan hasil tes, tingkat stres yang kamu alami saat ini berada pada kategori tinggi. Ini berarti kamu mungkin sedang menghadapi beban pikiran atau tekanan yang cukup berat dalam keseharianmu.",
  meaning: "Berada di tingkat stres yang tinggi bukan berarti kamu lemah, namun ini adalah sinyal dari tubuh dan pikiranmu bahwa kamu memerlukan waktu untuk beristirahat. Jika terus dibiarkan, stres tingkat tinggi dapat memengaruhi produktivitas, suasana hati, hingga kesehatan fisik. Sangat penting untuk mulai memperhatikan batasan diri dan mencari cara untuk mengelola stres tersebut.",
  tips: [
    {
      title: "Beri Waktu Jeda",
      desc: "Luangkan waktu 15-30 menit setiap hari tanpa gangguan untuk relaksasi, meditasi, atau sekadar melakukan hobi ringan."
    },
    {
      title: "Cerita pada Orang Terdekat",
      desc: "Membagikan beban pikiran pada seseorang yang kamu percaya bisa membantu mengurangi tekanan emosional."
    },
    {
      title: "Atur Prioritas",
      desc: "Fokus pada hal-hal yang paling penting dan mendesak. Jangan ragu untuk mengatakan 'tidak' jika kapasitasmu sudah penuh."
    }
  ],
  recommendations: [
    {
      id: "introvert-ekstrovert",
      title: "Tes Kepribadian Introvert/Ekstrovert",
      desc: "Kenali lebih dalam tentang energimu dan bagaimana kamu berinteraksi dengan lingkungan sekitar.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "kesiapan-karir",
      title: "Tes Kesiapan Karir",
      desc: "Ukur seberapa siap kamu menghadapi tantangan di dunia profesional saat ini.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"
    }
  ]
};

export default function PsikotesHasilPage({ params }: { params: { testId: string } }) {
  const { result, interpretation, meaning, tips, recommendations, testName } = resultData;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-primary uppercase">
            Hasil Psikotesmu
          </h2>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {testName}
          </h1>
        </div>

        {/* 1. Hasil Utama */}
        <section className="flex justify-center">
          <div className={`w-full max-w-2xl rounded-3xl border ${result.borderColor} ${result.bgColor} p-8 sm:p-12 text-center shadow-sm`}>
            <p className="text-lg font-medium text-gray-700 mb-2">Kamu berada pada tingkat</p>
            <h3 className={`text-5xl sm:text-6xl font-black tracking-tight ${result.color} mb-6`}>
              {result.grade}
            </h3>
            {result.score && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 border border-white/40 shadow-sm backdrop-blur-sm">
                <span className="text-gray-600 font-medium">Skor:</span>
                <span className={`ml-2 font-bold ${result.color}`}>{result.score}</span>
                <span className="mx-1 text-gray-400">/</span>
                <span className="text-gray-500">{result.maxScore}</span>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Column */}
          <div className="md:col-span-8 space-y-10">
            {/* 2. Interpretasi Hasil */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Info className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Interpretasi Hasil</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {interpretation}
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 3. Apa Artinya untukmu? */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Apa Artinya untukmu?</h2>
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {meaning}
                </p>
              </div>
            </section>

            {/* 4. Tips atau Saran */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tips untukmu</h2>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{tip.title}</h4>
                      <p className="mt-1 text-gray-600 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / CTA Column */}
          <div className="md:col-span-4 space-y-6">
            {/* 5. Ajakan untuk Konsultasi */}
            <div className="bg-primary text-white rounded-3xl p-6 sm:p-8 shadow-lg sticky top-[120px]">
              <h3 className="text-xl font-bold mb-3">Ingin memahami kondisimu lebih jauh?</h3>
              <p className="text-primary-foreground/90 mb-6 text-sm leading-relaxed">
                Hasil tes ini adalah langkah awal. Jangan ragu untuk berkonsultasi dengan psikolog profesional kami untuk mendapatkan panduan yang lebih personal.
              </p>
              <div className="space-y-3">
                <Link href="/konseling" className="block w-full">
                  <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-50 flex items-center justify-center gap-2 font-semibold">
                    <Calendar className="w-4 h-4" />
                    Jadwalkan Konsultasi
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Rekomendasi Tes untukmu */}
        <section className="space-y-8 pt-12 border-t border-gray-200">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Rekomendasi Tes Lainnya</h2>
            <p className="text-gray-600">
              Kenali dirimu lebih dalam dengan berbagai tes psikologi yang telah kami sediakan khusus untukmu.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="overflow-hidden flex flex-col p-0 transition-all hover:shadow-lg border-gray-100 rounded-2xl">
                <div className="relative h-56 w-full bg-gray-200">
                  <Image 
                    src={rec.image} 
                    alt={rec.title} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-gray-600 mb-6 flex-1 line-clamp-2">
                    {rec.desc}
                  </p>
                  <Link href={`/psikotes/${rec.id}`}>
                    <Button variant="outline" className="w-full group">
                      Ikuti Tes
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
