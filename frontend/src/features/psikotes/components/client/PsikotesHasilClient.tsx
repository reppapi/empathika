"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRight, Calendar, Info, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RESULT_DATA as resultData } from "../../data/psikotesData";

export default function PsikotesHasilClient({ params }: { params: { testId: string } }) {
  const { result, interpretation, meaning, tips, recommendations, testName } = resultData;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pt-36">
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
            {result.prefix && (
              <p className="text-lg sm:text-xl font-medium text-gray-700 mb-3">{result.prefix}</p>
            )}
            <h3 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight ${result.color}`}>
              {result.value}
            </h3>
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
              <div key={rec.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className={`h-48 w-full ${rec.bgColor} overflow-hidden relative`}>
                  <div className="absolute inset-0 flex items-start p-6">
                    <div className="text-left w-full">
                      <h3 className={`${rec.titleColor} font-bold text-[24px] leading-none mb-2 uppercase drop-shadow-sm`}>{rec.topTitle}</h3>
                      <p className={`${rec.titleColor} text-sm font-medium drop-shadow-sm`}>{rec.topSubtitle}</p>
                    </div>
                  </div>
                  {rec.shape === "circles" && (
                    <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
                      <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="white"/><circle cx="50" cy="120" r="50" fill="white"/></svg>
                    </div>
                  )}
                  {rec.shape === "circles-dark" && (
                    <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
                      <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="black"/><circle cx="50" cy="120" r="50" fill="black"/></svg>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-6 leading-tight">{rec.bottomTitle}</h3>
                  
                  <div className="mt-auto">
                    <Link href={`/psikotes/${rec.id}`} className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                      Ikuti Tes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

