"use client"

import React from "react"

interface CardTopikKeahlianProps {
  keahlian: string[]
  newSkill: string
  setNewSkill: (v: string) => void
  onAddSkill: () => void
  onRemoveSkill: (skill: string) => void
}

export function CardTopikKeahlian({
  keahlian,
  newSkill,
  setNewSkill,
  onAddSkill,
  onRemoveSkill,
}: CardTopikKeahlianProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-gray-900">
          Topik & Keahlian Konseling
        </h3>
        <p className="text-xs text-gray-500">
          Tambahkan tag topik keahlian (contoh: Trauma Healing, Relasi, Depresi).
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAddSkill()
            }
          }}
          placeholder="Tambah keahlian (contoh: Burnout & Stres)"
          className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:border-[#561269] focus:outline-none transition"
        />
        <button
          type="button"
          onClick={onAddSkill}
          className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2.5 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
        >
          Tambah
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {keahlian.map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-medium text-[#561269]"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className="rounded hover:bg-purple-200/80 p-0.5 text-purple-600 hover:text-purple-900 transition leading-none cursor-pointer"
              title={`Hapus ${skill}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        ))}
        {keahlian.length === 0 && (
          <p className="text-xs text-gray-400 italic">Belum ada keahlian yang ditambahkan.</p>
        )}
      </div>
    </div>
  )
}

