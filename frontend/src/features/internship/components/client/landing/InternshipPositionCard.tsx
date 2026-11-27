"use client"

import React from "react"
import Link from "next/link"
import {
  Clock,
  MapPin,
  Laptop,
  Coins,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from "lucide-react"
import { InternshipPosition } from "@/services/internship.service"

interface InternshipPositionCardProps {
  position: InternshipPosition
  withBiro: (path: string) => string
}

export function InternshipPositionCard({ position, withBiro }: InternshipPositionCardProps) {
  const isExternalApply =
    position.applyUrl &&
    (position.applyUrl.startsWith("http://") || position.applyUrl.startsWith("https://")) &&
    !position.applyUrl.includes("empathika.id")

  return (
    <div className="bg-white border border-purple-100/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header Kartu Posisi */}
      <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-white via-white to-purple-50/40">
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight">
            {position.judul}
          </h3>

          {position.deskripsi && (
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
              {position.deskripsi}
            </p>
          )}
        </div>

        {/* Info Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
          <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#561269]" />
              Duration
            </span>
            <span className="text-sm font-extrabold text-gray-900">{position.durasi}</span>
          </div>

          <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#561269]" />
              Location
            </span>
            <span className="text-sm font-extrabold text-gray-900">{position.lokasi}</span>
          </div>

          <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
              <Laptop className="w-3.5 h-3.5 text-[#561269]" />
              Work Mode
            </span>
            <span className="text-sm font-extrabold text-gray-900">{position.workMode}</span>
          </div>

          <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-1">
              <Coins className="w-3.5 h-3.5 text-[#561269]" />
              Compensation
            </span>
            <span className="text-sm font-extrabold text-gray-900">{position.kompensasi}</span>
          </div>

          <div className="bg-[#FAF7FB] rounded-xl p-3 border border-purple-50 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              Application Deadline
            </span>
            <span className="text-sm font-extrabold text-rose-700">{position.deadline}</span>
          </div>
        </div>
      </div>

      {/* Body: Responsibilities & Qualifications & CTA */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Responsibilities */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#561269]" />
            Responsibilities
          </h4>
          <ul className="space-y-2.5">
            {position.responsibilities.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-relaxed"
              >
                <CheckCircle2 className="w-5 h-5 text-[#561269] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Qualifications */}
        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
            Qualifications
          </h4>
          <ul className="space-y-2.5">
            {position.qualifications.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-relaxed"
              >
                <CheckCircle2 className="w-5 h-5 text-[#CA8A04] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom CTA Card */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            <p className="font-semibold text-gray-900">
              Batas Akhir Pendaftaran:{" "}
              <span className="text-rose-600 font-bold">{position.deadline}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Pastikan berkas portofolio dan CV terlampir dengan lengkap.
            </p>
          </div>

          {isExternalApply ? (
            <a
              href={position.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>APPLY NOW</span>
              <ExternalLink className="w-4 h-4 text-[#0f172a]" />
            </a>
          ) : (
            <Link
              href={withBiro(`/internship/apply/${position.id}`)}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>APPLY NOW</span>
              <ArrowRight className="w-4 h-4 text-[#0f172a]" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
