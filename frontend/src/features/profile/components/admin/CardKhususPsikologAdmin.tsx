"use client"

import React from "react"
import { AdminProfileData } from "../../types"

interface CardKhususPsikologAdminProps {
  form: AdminProfileData
  newSkill: string
  setNewSkill: (v: string) => void
  newParagraph: string
  setNewParagraph: (v: string) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onAddSkill: () => void
  onRemoveSkill: (skill: string) => void
  onAddParagraph: () => void
  onRemoveParagraph: (index: number) => void
}

export function CardKhususPsikologAdmin({
  form,
  newSkill,
  setNewSkill,
  newParagraph,
  setNewParagraph,
  onChange,
  onAddSkill,
  onRemoveSkill,
  onAddParagraph,
  onRemoveParagraph,
}: CardKhususPsikologAdminProps) {
  return (
    <div className="space-y-6">
      {/* 3A: Legalitas & Kategori Profesi */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
            Kredensial &amp; Spesialisasi Praktik
          </h3>
          <p className="text-xs text-gray-400">
            Data legalitas resmi STR/SIPP serta kategori spesialisasi yang akan tampil di halaman detail klien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Klasifikasi Profesi
            </label>
            <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm">
              <span className="font-bold text-[#561269] capitalize">
                {form.kategoriProfesi === "psikolog"
                  ? "Psikolog Resmi"
                  : form.kategoriProfesi === "peer-konselor"
                  ? "Peer Konselor"
                  : "Konselor"}
              </span>
              <span className="text-[11px] font-medium text-gray-400 bg-white border border-purple-100 rounded-lg px-2.5 py-0.5">
                Ditetapkan Admin Utama
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Spesialisasi Utama
            </label>
            <input
              type="text"
              name="spesialisasi"
              value={form.spesialisasi || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Ubah Kata Sandi Akun
            </label>
            <input
              type="password"
              name="password"
              placeholder="Masukkan kata sandi baru (opsional)"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>

          {form.kategoriProfesi === "psikolog" ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nomor STR (Surat Tanda Registrasi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="noStr"
                  value={form.noStr || ""}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nomor SIPP (Surat Izin Praktik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="noSipp"
                  value={form.noSipp || ""}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition font-mono"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-700 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Sebagai <strong>{form.kategoriProfesi === "peer-konselor" ? "Peer Konselor" : "Konselor"}</strong>, Anda tidak diwajibkan menyertakan nomor STR dan SIPP.
              </span>
            </div>
          )}

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Pendidikan &amp; Institusi
            </label>
            <textarea
              rows={3}
              name="pendidikanText"
              value={form.pendidikanText || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-gray-200 bg-white p-3.5 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] resize-y min-h-[80px] whitespace-pre-wrap leading-relaxed transition"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Tekan <strong>Enter</strong> untuk membuat baris baru jika memiliki lebih dari satu riwayat pendidikan.
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Quote / Prinsip Pribadi Diri
            </label>
            <input
              type="text"
              name="quote"
              value={form.quote || ""}
              onChange={onChange}
              placeholder="Prinsip konseling yang menginspirasi klien..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 italic focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>
        </div>
      </div>

      {/* 3B: Media Video Intro (Video Greeting POV Klien) */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
            Video Perkenalan (Greeting Video)
          </h3>
          <p className="text-xs text-gray-400">
            Video singkat untuk menyapa calon klien di halaman profil Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              URL File Video (.mp4 / stream)
            </label>
            <input
              type="text"
              name="videoIntroUrl"
              value={form.videoIntroUrl || ""}
              onChange={onChange}
              placeholder="https://domain.com/video-greeting.mp4"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Durasi Video
            </label>
            <input
              type="text"
              name="videoDuration"
              value={form.videoDuration || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition font-mono"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              URL Thumbnail Video (Opsional)
            </label>
            <input
              type="text"
              name="videoThumbnail"
              value={form.videoThumbnail || ""}
              onChange={onChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
          </div>
        </div>
      </div>

      {/* 3C: Fokus Keahlian & Profil Naratif Lengkap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag Keahlian */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4 flex flex-col">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
              Area Keahlian Konseling
            </h3>
            <p className="text-xs text-gray-400">
              Fokus topik atau masalah yang Anda tangani.
            </p>
          </div>

          {/* Input Tambah Tag */}
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
              placeholder="Tambah topik keahlian..."
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition"
            />
            <button
              type="button"
              onClick={onAddSkill}
              className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-4 py-2.5 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Tambah
            </button>
          </div>

          {/* List Badges Keahlian */}
          <div className="flex flex-wrap gap-1.5 pt-1 flex-1 items-start content-start">
            {(form.keahlian || []).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50/90 border border-purple-200/70 px-2.5 py-1 text-[11px] font-medium text-[#561269] transition hover:bg-purple-100/80"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill)}
                  className="rounded hover:bg-purple-200/80 p-0.5 text-purple-600 hover:text-purple-900 transition leading-none"
                  title={`Hapus ${skill}`}
                >
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
            {(form.keahlian || []).length === 0 && (
              <p className="text-xs text-gray-400 italic">Belum ada keahlian yang ditambahkan.</p>
            )}
          </div>
        </div>

        {/* Paragraf Profil Lengkap (Prakata Diri) */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4 flex flex-col">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#561269]">
              Profil Lengkap &amp; Prakata Klien
            </h3>
            <p className="text-xs text-gray-400">
              Naratif paragraf yang muncul pada bagian &ldquo;PROFIL PSIKOLOG&rdquo; di halaman klien.
            </p>
          </div>

          <div className="space-y-3 flex-1">
            {(form.profilLengkap || []).map((paragraf, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl bg-gray-50 border border-gray-100 p-3.5 text-xs text-gray-700 leading-relaxed pr-10"
              >
                <p className="whitespace-pre-wrap">{paragraf}</p>
                <button
                  type="button"
                  onClick={() => onRemoveParagraph(idx)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 opacity-70 group-hover:opacity-100 transition"
                  title="Hapus Paragraf"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Input Tambah Paragraf */}
          <div className="space-y-2 pt-2">
            <textarea
              rows={2}
              value={newParagraph}
              onChange={(e) => setNewParagraph(e.target.value)}
              placeholder="Tulis paragraf naratif baru..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-800 focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269] transition resize-none"
            />
            <button
              type="button"
              onClick={onAddParagraph}
              className="w-full rounded-full border border-gray-300 bg-white py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
            >
              + Tambah Paragraf ke Profil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

